# StaffSync – Modern Human Resource Management Solution

StaffSync is a web-based Human Resource Management System (HRMS) designed to simplify employee management and streamline everyday HR operations through a centralized platform. It provides role-based access for Human Resources (HR), Managers, and Employees to manage attendance, leave requests, announcements, and training programs.

## Project Overview

StaffSync is developed using the MERN stack:

* **MongoDB** – Database
* **Express.js** – Backend framework
* **React.js** – Frontend library
* **Node.js** – JavaScript runtime environment

The application uses authentication and role-based authorization to control access to features according to each user's role.

## Key Features

* **Role-Based Dashboards:** Separate interfaces for HR, Managers, and Employees.
* **Employee Management:** Create, update, view, and deactivate employee records.
* **Attendance Management:** Employee check-in, check-out, and attendance history.
* **Leave Management:** Submit leave requests, track their status, and review requests according to user permissions.
* **Announcements:** Publish, update, filter, and view organizational announcements.
* **Training Management:** Create and manage employee training programs.
* **Secure Authentication:** JWT-based authentication and password hashing.
* **Access Control:** Restricts operations according to assigned user roles.

## User Roles

| Role     | Responsibilities                                                                                                 |
| -------- | ---------------------------------------------------------------------------------------------------------------- |
| HR       | Manage employee records, monitor attendance, review leave requests, and manage announcements.                    |
| Manager  | Review leave requests, manage training programs, and manage announcements.                                       |
| Employee | View personal information, record attendance, submit leave requests, track leave status, and view announcements. |

## Technology Stack

| Component         | Technology           |
| ----------------- | -------------------- |
| Frontend          | React.js, Vite, CSS  |
| Backend           | Node.js, Express.js  |
| Database          | MongoDB, Mongoose    |
| Authentication    | JSON Web Token (JWT) |
| Password Security | bcryptjs             |
| API Testing       | Postman              |
| Version Control   | Git and GitHub       |

## Project Structure

```text
StaffSync-HRMS/
├── Phase wise Documentation/
│   ├── Ideation Phase/
│   ├── Requirement Analysis/
│   ├── Project Planning/
│   ├── Project Design/
│   └── Testing/
├── StaffSync/
│   ├── Client/
│   ├── Server/
│   └── screenshots/
├── StaffSync Project Document.pdf
└── README.md
```

*Note: The structure above represents the main project organization. Refer to the actual repository for the complete directory and file listing.*

## Installation and Execution

### Prerequisites

Install the following before running StaffSync:

* [Node.js](https://nodejs.org/)
* npm, included with Node.js
* A MongoDB database, such as MongoDB Atlas
* Git

### 1. Clone the Repository

```bash
git clone https://github.com/Meet-Jain-25/StaffSync-HRMS.git
cd StaffSync-HRMS
```

### 2. Set Up the Backend

Open a terminal in VS Code and run:

```bash
cd StaffSync/Server
npm install
```

Create a `.env` file in the `Server` directory and configure the required environment variables:

* `MONGODB_URI` — MongoDB connection string
* `JWT_SECRET` — Secret used for JWT authentication
* `PORT` — Backend server port

Start the backend in development mode:

```bash
npm run dev
```

Alternatively, start the backend normally:

```bash
npm start
```

Keep your `.env` file and credentials private. Never commit secrets to GitHub.

### 3. Set Up the Frontend

Open a second terminal in VS Code and run:

```bash
cd StaffSync/Client
npm install
npm run dev
```

Vite will start the frontend development server. With the default configuration, open:

http://localhost:5173

### 4. Open the Application

When running with the default local development configuration, the application is available at:

* **Frontend:** http://localhost:5173
* **Backend:** http://localhost:8000

Make sure MongoDB is accessible and the backend environment variables are configured correctly before using the application.

*Note: The commands for starting each application depend on the scripts configured in the respective `package.json` files.*

## Testing

Postman was used to test backend APIs and verify authentication, authorization, attendance operations, and other implemented functionality.

Testing covered the following areas:

* Authentication and login
* Role-based access restrictions
* Employee management
* Attendance check-in and check-out
* Leave application and review workflows
* Training program management
* Announcement management
* API responses and error handling

## Project Documentation

The project documentation includes the system architecture, database design, ER diagram, Data Flow Diagrams (DFDs), Use Case Diagram, implementation details, application screenshots, and API testing evidence.

**Documentation file:** `StaffSync Project Documentation.pdf`

Open the PDF in the repository to review the complete project documentation.

## Project Status

**Core application implemented.**

StaffSync includes employee management, attendance, leave management, announcements, training management, authentication, and role-based access control.

## Author

**Meet Jain**

Project: **StaffSync – Modern Human Resource Management Solution**

## License

This project was developed for academic purposes.