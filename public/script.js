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
    const emailInput = document.getElementById('loginEmail').value;
    const passwordInput = document.getElementById('loginPassword').value;

    try {
        // Fetching all users to simulate authentication based on your current controller
        const response = await fetch(`${API_URL}/users`);
        const users = await response.json();

        const user = users.find(u => u.email === emailInput && u.password === passwordInput);

        if (user) {
            localStorage.setItem('user', JSON.stringify(user));
            checkAuth();

            // Toast feedback
            const toastEl = document.getElementById('login-toast');
            if (toastEl) new bootstrap.Toast(toastEl).show();

            window.location.hash = '#/';
        } else {
            alert("Invalid Email or Password.");
        }
    } catch (err) {
        alert("Server connection failed. Check if TS Backend is on Port 4000.");
    }
}

async function registration(event) {
    event.preventDefault();

    // MATCHES YOUR JOI createSchema EXACTLY
    const userData = {
        title: 'Mr', // Default title as required by your Joi schema
        firstname: document.getElementById('fname').value,
        lastname: document.getElementById('lname').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        confirmPassword: document.getElementById('password').value, // Required by Joi
        role: 'User'
    };

    try {
        const response = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userData)
        });

        const result = await response.json();

        if (response.ok) {
            document.getElementById('showEmail').innerText = userData.email;
            window.location.hash = '#/verify-email';
        } else {
            // This shows the Joi validation error message from your validateRequest middleware
            alert("Registration Failed: " + (result.message || "Invalid Data"));
        }
    } catch (err) {
        alert("Cannot connect to server.");
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

    document.getElementById('profile-name').innerText = `${user.firstname} ${user.lastname}`;
    document.getElementById('profile-email').innerText = user.email;
    document.getElementById('profile-role').innerText = user.role;
    document.getElementById('profile-class').innerText = user.role;
}

function navigateTo(hash) {
    window.location.hash = hash;
}