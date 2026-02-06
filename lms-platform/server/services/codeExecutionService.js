const { exec } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const util = require('util');
const execPromise = util.promisify(exec);

/**
 * Code Execution Service with Docker Sandbox
 * Per requirements: Secure sandbox with resource limits
 */

class CodeExecutionService {
    constructor() {
        this.executionDir = path.join(__dirname, '../executions');
        this.languageConfigs = {
            python: {
                image: 'python:3.10-slim',
                extension: '.py',
                command: 'python',
                timeout: 10000 // 10 seconds max
            },
            javascript: {
                image: 'node:18-slim',
                extension: '.js',
                command: 'node',
                timeout: 10000
            },
            java: {
                image: 'openjdk:17-slim',
                extension: '.java',
                command: 'javac',
                timeout: 15000
            },
            cpp: {
                image: 'gcc:latest',
                extension: '.cpp',
                command: 'g++',
                timeout: 15000
            },
            c: {
                image: 'gcc:latest',
                extension: '.c',
                command: 'gcc',
                timeout: 15000
            }
        };
    }

    /**
     * Initialize execution directory
     */
    async init() {
        try {
            await fs.mkdir(this.executionDir, { recursive: true });
        } catch (error) {
            console.error('Error creating execution directory:', error);
        }
    }

    /**
     * Execute code in Docker container with resource limits
     */
    async executeCode(code, language, input = '', timeoutMs = 10000, memoryLimitMB = 128) {
        const startTime = Date.now();
        const executionId = uuidv4();
        const config = this.languageConfigs[language];

        if (!config) {
            throw new Error(`Unsupported language: ${language}`);
        }

        // Create temporary directory for this execution
        const execPath = path.join(this.executionDir, executionId);
        await fs.mkdir(execPath, { recursive: true });

        const filename = `main${config.extension}`;
        const filepath = path.join(execPath, filename);

        try {
            // Write code to file
            await fs.writeFile(filepath, code);

            // Prepare Docker command with security restrictions
            const dockerCommand = this.buildDockerCommand(
                config,
                execPath,
                filename,
                input,
                timeoutMs,
                memoryLimitMB
            );

            // Execute in Docker container
            const { stdout, stderr } = await this.runWithTimeout(
                dockerCommand,
                timeoutMs + 2000 // Add buffer for Docker overhead
            );

            const executionTime = Date.now() - startTime;

            // Clean up
            await this.cleanup(execPath);

            return {
                success: true,
                output: stdout,
                error: stderr,
                executionTime,
                memoryUsage: 0 // TODO: Extract from Docker stats
            };

        } catch (error) {
            await this.cleanup(execPath);

            if (error.killed) {
                return {
                    success: false,
                    output: '',
                    error: 'Execution timeout exceeded',
                    executionTime: timeoutMs,
                    memoryUsage: 0
                };
            }

            return {
                success: false,
                output: '',
                error: error.message || 'Execution error',
                executionTime: Date.now() - startTime,
                memoryUsage: 0
            };
        }
    }

    /**
     * Build Docker command with security restrictions
     */
    buildDockerCommand(config, execPath, filename, input, timeoutMs, memoryLimitMB) {
        const timeoutSec = Math.ceil(timeoutMs / 1000);

        // Base Docker run command with security options
        let dockerCmd = [
            'docker run',
            '--rm', // Remove container after execution
            '--network none', // No network access
            '--cpus="0.5"', // Limit to 0.5 CPU
            `--memory="${memoryLimitMB}m"`, // Memory limit
            '--memory-swap="-1"', // No swap
            '--pids-limit=50', // Limit processes
            `--ulimit cpu=${timeoutSec}`, // CPU time limit
            '--read-only', // Read-only filesystem
            '--tmpfs /tmp:rw,noexec,nosuid,size=10m', // Temp directory
            '--security-opt=no-new-privileges', // Security
            `-v "${execPath}:/workspace:ro"`, // Mount code as read-only
            `-w /workspace`,
            config.image
        ];

        // Language-specific execution command
        switch (config.command) {
            case 'python':
                dockerCmd.push(`timeout ${timeoutSec}s python ${filename}`);
                break;
            case 'node':
                dockerCmd.push(`timeout ${timeoutSec}s node ${filename}`);
                break;
            case 'javac':
                const className = filename.replace('.java', '');
                dockerCmd.push(`sh -c "javac ${filename} && timeout ${timeoutSec}s java ${className}"`);
                break;
            case 'g++':
                dockerCmd.push(`sh -c "g++ ${filename} -o /tmp/program && timeout ${timeoutSec}s /tmp/program"`);
                break;
            case 'gcc':
                dockerCmd.push(`sh -c "gcc ${filename} -o /tmp/program && timeout ${timeoutSec}s /tmp/program"`);
                break;
            default:
                dockerCmd.push(`timeout ${timeoutSec}s ${config.command} ${filename}`);
        }

        return dockerCmd.join(' ');
    }

    /**
     * Run command with timeout
     */
    async runWithTimeout(command, timeoutMs) {
        return new Promise((resolve, reject) => {
            const child = exec(command, {
                timeout: timeoutMs,
                maxBuffer: 1024 * 1024 // 1MB output buffer
            }, (error, stdout, stderr) => {
                if (error) {
                    if (error.killed) {
                        reject(Object.assign(error, { killed: true }));
                    } else {
                        reject(error);
                    }
                } else {
                    resolve({ stdout, stderr });
                }
            });
        });
    }

    /**
     * Grade submission against test cases
     */
    async gradeSubmission(code, language, testCases, gradingConfig = {}) {
        const results = [];
        let totalScore = 0;
        const maxScore = testCases.reduce((sum, test) => sum + (test.points || 0), 0);

        for (const testCase of testCases) {
            try {
                // Execute code with test input
                const execution = await this.executeCode(
                    code,
                    language,
                    testCase.input || '',
                    testCase.timeout || gradingConfig.timeoutMs || 5000,
                    testCase.memoryLimit || gradingConfig.memoryLimitMB || 128
                );

                // Compare output
                const passed = this.compareOutputs(
                    execution.output,
                    testCase.expectedOutput,
                    gradingConfig
                );

                const testResult = {
                    id: testCase.id,
                    input: testCase.hidden ? '[Hidden]' : testCase.input,
                    expectedOutput: testCase.hidden ? '[Hidden]' : testCase.expectedOutput,
                    actualOutput: execution.output,
                    passed,
                    points: passed ? testCase.points : 0,
                    executionTime: execution.executionTime,
                    error: execution.error || null
                };

                if (passed) {
                    totalScore += testCase.points;
                }

                results.push(testResult);

            } catch (error) {
                results.push({
                    id: testCase.id,
                    input: testCase.hidden ? '[Hidden]' : testCase.input,
                    passed: false,
                    points: 0,
                    error: error.message
                });
            }
        }

        return {
            score: totalScore,
            maxScore,
            percentage: maxScore > 0 ? (totalScore / maxScore) * 100 : 0,
            passed: totalScore >= (maxScore * 0.7), // 70% to pass
            details: results,
            totalExecutionTime: results.reduce((sum, r) => sum + (r.executionTime || 0), 0)
        };
    }

    /**
     * Compare outputs with configurable strictness
     */
    compareOutputs(actual, expected, config = {}) {
        let actualOutput = actual || '';
        let expectedOutput = expected || '';

        // Apply transformations based on config
        if (config.trimWhitespace !== false) {
            actualOutput = actualOutput.trim();
            expectedOutput = expectedOutput.trim();
        }

        if (config.caseSensitive === false) {
            actualOutput = actualOutput.toLowerCase();
            expectedOutput = expectedOutput.toLowerCase();
        }

        // Strict comparison (default)
        if (config.strictOutput !== false) {
            return actualOutput === expectedOutput;
        }

        // Fuzzy comparison (ignore extra whitespace)
        actualOutput = actualOutput.replace(/\s+/g, ' ');
        expectedOutput = expectedOutput.replace(/\s+/g, ' ');

        return actualOutput === expectedOutput;
    }

    /**
     * Clean up execution files
     */
    async cleanup(execPath) {
        try {
            await fs.rm(execPath, { recursive: true, force: true });
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    /**
     * Test if Docker is available
     */
    async testDocker() {
        try {
            const { stdout } = await execPromise('docker --version');
            console.log('Docker available:', stdout.trim());
            return true;
        } catch (error) {
            console.error('Docker not available:', error.message);
            return false;
        }
    }

    /**
     * Pull required Docker images
     */
    async pullImages() {
        const images = [
            'python:3.10-slim',
            'node:18-slim',
            'openjdk:17-slim',
            'gcc:latest'
        ];

        for (const image of images) {
            try {
                console.log(`Pulling ${image}...`);
                await execPromise(`docker pull ${image}`);
                console.log(`✓ ${image} ready`);
            } catch (error) {
                console.error(`Failed to pull ${image}:`, error.message);
            }
        }
    }
}

// Export singleton instance
const codeExecutionService = new CodeExecutionService();

// Initialize on startup
codeExecutionService.init().catch(console.error);

module.exports = codeExecutionService;