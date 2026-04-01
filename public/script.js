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

async function login(event) {
    event.preventDefault();
    const emailInput = document.getElementById('loginEmail').value.trim();
    const passwordInput = document.getElementById('loginPassword').value;

    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        // LOGGING FOR DEBUGGING
        console.log("Input Email:", emailInput);
        console.log("First User in DB:", users[0]);

        // 1. Check if password even exists in the DB response
        if (users[0] && !users[0].password) {
            console.warn("WARNING: The database response is missing the 'password' field!");
        }

        const user = users.find(u => u.email === emailInput); // Temporary: just check email

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));

            // Wrap checkAuth in a try-catch so it doesn't kill the login
            try {
                checkAuth();
            } catch (e) {
                console.error("UI Update Failed:", e);
            }

            alert("Login success!");
            window.location.hash = '#/';
        } else {
            alert("User not found in database.");
        }
    } catch (err) {
        console.error("Full Error Trace:", err);
        alert("System Error: " + err.message);
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
    if (!document.body.classList.contains('is-admin')) return;

    const tbody = document.getElementById('account-table-body');
    try {
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        tbody.innerHTML = users.map(u => `
            <tr>
                <td>${u.id}</td>
                <td>${u.email}</td>
                <td><span class="badge ${u.role === 'Admin' ? 'bg-danger' : 'bg-primary'}">${u.role}</span></td>
                <td><span class="text-success">Yes</span></td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editAccount(${u.id})">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteAccount(${u.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">Error connecting to API</td></tr>';
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

async function deleteAccount(id) {
    const currentUser = JSON.parse(localStorage.getItem('user'));
    if (currentUser.id === id) return alert("You cannot delete yourself!");

    if (!confirm("Are you sure you want to delete this account?")) return;

    try {
        await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
        loadAccounts();
    } catch (err) {
        alert("Delete failed.");
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