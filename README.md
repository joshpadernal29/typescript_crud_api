# Typescript_crud_api

An integrated **Fullstack Web Application** consisting of a **TypeScript Express CRUD API** and a **Vanilla JS Frontend SPA For Testing the crud_api**. This project implements Role-Based Access Control (RBAC), database persistence with Sequelize.

---

## 📂 Project Structure

```text
root/
├── public/                 # Frontend (Vanilla JS, Bootstrap, CSS)
│   ├── index.html          # Single Page Application entry
│   ├── script.js           # Frontend Logic & API Fetching
│   └── style.css           # Custom Styling
├── src/                    # Backend (TypeScript & Express)
│   ├── _helpers/           # DB Config, Sequelize Models, RBAC Roles
│   ├── _middleware/        # Auth, Error Handling, Joi Validation
│   ├── users/              # User/Account Module (Controllers & Services)
│   ├── requests/           # Request Module (Planned)
│   └── server.ts           # Express App Entry Point
├── config.json             # Database & JWT Credentials
├── tsconfig.json           # TS Compiler Settings
└── package.json            # Dependencies & Scripts
```

# 🚀 Getting Started
# 1. Backend Setup (API)
The backend handles data persistence, password hashing with bcryptjs, and JWT-based security.

Install Dependencies:
```bash
npm install
```
# Database Configuration:
Ensure your MySQL server is running and update config.json with your credentials.

Run the Server:

```bash
npm run dev
```
The API will be live at http://localhost:4000.

# 2. Frontend Setup (UI)
The frontend is a lightweight SPA using Hash Routing and Bootstrap 5.

Launch via Live Server:

Open the public/index.html file in VS Code.

Right-click and select "Open with Live Server".

Access:

Typically available at http://127.0.0.1:5500/public/index.html.

# 🛠 Technical Features
Strict Typing: Developed with TypeScript to catch naming inconsistencies and syntax errors at compile time.

ORM Integration: Uses Sequelize for structured database interactions and schema management.

Data Validation: Centralized validation middleware using Joi to ensure data integrity.

Security: Industry-standard password hashing via bcryptjs and JWT authentication.

Global Error Handling: Custom middleware to format errors into consistent JSON responses.

# 🧪 API Endpoint Testing (PowerShell)
Account Management
# Create Record (POST)
```powershell
curl.exe --% -X POST http://localhost:4000/users -H "Content-Type: application/json" -d "{\"title\":\"Mr\",\"firstname\":\"Jane\",\"lastname\":\"Smith\",\"email\":\"jane@example.com\",\"password\":\"secret123\",\"confirmPassword\":\"secret123\",\"role\":\"User\"}"
```

# Retrieve All Users (GET)
```powershell
curl.exe http://localhost:4000/users
```
# Retrieve by ID (GET)
```powershell
curl.exe http://localhost:4000/users/1
```

# Update User (PUT)
```powershell
curl.exe --% -X PUT http://localhost:4000/users/1 -H "Content-Type: application/json" -d "{\"firstname\":\"Janet\",\"password\":\"newsecret456\",\"confirmPassword\":\"newsecret456\"}"
```

# Remove User (DELETE)
```powershell
curl.exe -X DELETE http://localhost:4000/users/1
```
---
# Developed by: Josh Efraim C. Padernal
For INTPROG Lab 5 Activity

