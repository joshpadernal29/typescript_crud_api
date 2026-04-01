const API_URL = 'http://localhost:4000';

// --- 1. INITIALIZATION & ROUTING ---
document.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    checkAuth();

    // Add event listener for the login form specifically
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', login);
    }
});

window.addEventListener('hashchange', handleRouting);

function handleRouting() {
    const hash = window.location.hash || '#/';
    const pages = document.querySelectorAll('.page');
    pages.forEach(p => p.classList.remove('active'));

    let targetId = 'home-page';
    if (hash === '#/register') targetId = 'register-page';
    if (hash === '#/login') targetId = 'login-page';
    if (hash === '#/verify-email') targetId = 'verify-email';
    if (hash === '#/employees') { targetId = 'employees'; /* loadEmployees(); */ }
    if (hash === '#/accounts') { targetId = 'accounts'; loadAccounts(); }
    if (hash === '#/userProfile') { targetId = 'profile'; loadProfile(); }
    if (hash === '#/request') { targetId = 'requests'; /* loadRequests(); */ }

    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
}

// --- 2. AUTHENTICATION ---

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const body = document.body;

    if (user) {
        body.classList.replace('not-authenticated', 'authenticated');
        document.getElementById('nav-name-display').innerText = user.firstname;

        if (user.role === 'Admin') {
            body.classList.add('is-admin');
        } else {
            body.classList.remove('is-admin');
        }
    } else {
        body.classList.add('not-authenticated');
        body.classList.remove('authenticated', 'is-admin');
    }
}

// User Login
async function login(event) {
    event.preventDefault();

    const data = {
        email: document.getElementById('loginEmail').value,
        password: document.getElementById('loginPassword').value
    };

    try {
        const response = await fetch(`${API_URL}/users/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (response.ok) {
            // Result is the user object (without the hash)
            localStorage.setItem('user', JSON.stringify(result));
            checkAuth();
            alert(`Welcome, ${result.firstname}!`);
            window.location.hash = '#/userProfile';
        } else {
            // This shows "Invalid Email or Password" from your Service
            alert(result.message);
        }
    } catch (err) {
        alert("Server connection failed.");
    }
}

async function registration(event) {
    event.preventDefault();

    const userData = {
        // This line now grabs the actual selection from the dropdown
        title: document.getElementById('title').value,

        firstname: document.getElementById('fname').value,
        lastname: document.getElementById('lname').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('confirmPassword').value,
        role: 'User'
    };

    // Quick validation before sending to the Joi schema
    if (!userData.title) {
        return alert("Please select a title.");
    }

    if (userData.password !== userData.confirmPassword) {
        return alert("Passwords do not match!");
    }

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            alert(`Account created for ${userData.title} ${userData.lastname}!`);
            window.location.hash = '#/login';
        } else {
            // This will display Joi errors (e.g., "title is required")
            alert("Validation Error: " + result.message);
        }
    } catch (err) {
        console.error("Connection Error:", err);
        alert("Server is unreachable. Check Port 4000.");
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    checkAuth();
}

// --- 3. ADMIN CRUD (ACCOUNTS) ---

async function loadAccounts() {
    const tbody = document.getElementById('account-table-body');
    if (!tbody) return;

    // Clear the table and show a loading state
    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/users`);

        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();

        // Map through the users and create table rows
        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>
                    <div class="fw-bold">${u.title}. ${u.lastname}</div>
                    <small class="text-muted">${u.firstname}</small>
                </td>
                <td>${u.email}</td>
                <td>
                    <span class="badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-primary'}">
                        ${u.role}
                    </span>
                </td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary me-1" onclick="editUser(${u.id})">
                        <i class="bi bi-pencil"></i> Edit
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">
                        <i class="bi bi-trash"></i> Delete
                    </button>
                </td>
            </tr>
        `).join('');

    } catch (err) {
        console.error("Load Accounts Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${err.message}</td></tr>`;
    }
}

// Add Account from Modal
async function addAccount(event) {
    event.preventDefault();

    const payload = {
        title: 'Mr',
        firstname: document.getElementById('accFname').value,
        lastname: document.getElementById('accLname').value,
        email: document.getElementById('accEmail').value,
        password: document.getElementById('accPassword').value,
        confirmPassword: document.getElementById('accPassword').value,
        role: document.getElementById('accRole').value,
    };

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            bootstrap.Modal.getInstance(document.getElementById('account-modal')).hide();
            loadAccounts();
            document.getElementById('accountForm').reset();
        } else {
            const err = await res.json();
            alert(err.message);
        }
    } catch (e) {
        alert("Server Error");
    }
}

// delete account using the typescript_crud_api
async function deleteUser(id) {
    // 1. Safety first - always ask before deleting from DB
    if (!confirm(`Are you sure you want to delete User ID: ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("User removed from database.");
            loadAccounts(); // <--- Refresh the table automatically
        } else {
            const err = await response.json();
            alert("Delete failed: " + err.message);
        }
    } catch (err) {
        console.error("Delete Error:", err);
    }
}

function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    // Select elements
    const nameEl = document.getElementById('profile-name');
    const emailEl = document.getElementById('profile-email');
    const roleEl = document.getElementById('profile-role');

    // ONLY set innerText if the element actually exists in the HTML
    if (nameEl) {
        nameEl.innerText = `${user.firstname} ${user.lastname}`;
    }

    if (emailEl) {
        emailEl.innerText = user.email;
    }

    if (roleEl) {
        roleEl.innerText = user.role;
        // Optional: Change badge color based on role
        roleEl.className = `badge ${user.role === 'Admin' ? 'bg-danger' : 'bg-primary'}`;
    }
}