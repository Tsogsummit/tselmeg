# LMS Platform

## Prerequisites
- **Node.js**: Ensure you have Node.js installed on your machine.
- **npm**: Comes with Node.js.

## Setup / Installation

Before running the application for the first time, you need to install the dependencies and set up the database.

1.  **Install All Dependencies**
    You need to install dependencies for the root, server, and client. Open your terminal in the `lms-platform` folder and run:

    ```bash
    # Install root dependencies
    npm install

    # Install server dependencies
    cd server
    npm install
    cd ..

    # Install client dependencies
    cd client
    npm install
    cd ..
    ```

2.  **Initialize Database**
    Run the seed script to create the SQLite database and populate it with initial data (admin user, classes, demo courses).

    ```bash
    cd server
    npm run seed
    cd ..
    ```

## Running the Application

The application consists of a **Server** (port 5000) and a **Client** (Vite default port).

### Option 1: Using Command Line
From the `lms-platform` directory:
```bash
npm run dev
```

### Option 2: Using Start Scripts
For your convenience, you can use the provided start scripts in the `lms-platform` folder:

- **Windows**: Double-click `start_windows.bat`.
- **Mac/Linux**: Run `./start.sh` in your terminal.
  (Note: You may need to give execution permission first: `chmod +x start.sh`)

## Stopping the Application
To stop the application (both server and client):
- **Terminal**: Press `Ctrl + C` in the terminal window where the app is running. Confirm with `Y` if prompted.
- **Windows Script**: If you ran the `.bat` file, simply close the open Command Prompt window.

## Default Credentials
After seeding the database, you can login with:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Student Account (Sample)
- **Username**: `10a_001`
- **Password**: `123456`

## Project Structure
- **/client**: React frontend (Vite)
- **/server**: Express backend (SQLite)
