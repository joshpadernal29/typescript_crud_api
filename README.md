# TypeScript Express CRUD API

A high-performance, strictly-typed Backend API built with **Node.js** and **Express**. This project implements a full CRUD lifecycle using **Sequelize ORM** with a **MySQL** database, focusing on type safety and robust data validation.

## 🚀 Technical Features
- **Strict Typing**: Developed with TypeScript to catch naming inconsistencies and syntax errors at compile time.
- **ORM Integration**: Uses Sequelize for structured database interactions and schema management.
- **Data Validation**: Centralized validation middleware using **Joi** to ensure data integrity.
- **Security**: Industry-standard password hashing via `bcryptjs`.
- **Global Error Handling**: Custom middleware to catch and format errors into consistent JSON responses.

---

## 📦 Project Setup

1. **Clone and Install**
   ```bash
   git clone <your-repo-url>
   cd typescript_crud_api
   npm install
   
. Development Mode
# Run with auto-reload using ts-node-dev
npm run dev

API Endpoint Testing (PowerShell)

Create Record (POST)
curl.exe --% -X POST http://localhost:4000/users -H "Content-Type: application/json" -d "{\"title\":\"Mr\",\"firstname\":\"Jane\",\"lastname\":\"Smith\",\"email\":\"jane@example.com\",\"password\":\"secret123\",\"confirmPassword\":\"secret123\",\"role\":\"User\"}"

Retrieve All users (GET)
curl.exe http://localhost:4000/users

Retrieve by ID (GET)
curl.exe http://localhost:4000/users/1

Update user (PUT)
curl.exe --% -X PUT http://localhost:4000/users/1 -H "Content-Type: application/json" -d "{\"firstname\":\"Janet\",\"password\":\"newsecret456\",\"confirmPassword\":\"newsecret456\"}"

Remove Record (DELETE)
curl.exe -X DELETE http://localhost:4000/users/1
