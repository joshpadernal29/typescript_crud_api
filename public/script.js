const API_URL = 'http://localhost:4000'; // backend port running

// --- 1. INITIALIZATION & ROUTING ---
document.addEventListener('DOMContentLoaded', () => {
    handleRouting();
    checkAuth();
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
    if (hash === '#/employees') { targetId = 'employees'; loadEmployees(); }
    if (hash === '#/accounts') { targetId = 'accounts'; loadAccounts(); }
    if (hash === '#/userProfile') { targetId = 'profile'; loadProfile(); }
    if (hash === '#/request') { targetId = 'requests'; loadRequests(); }

    const targetPage = document.getElementById(targetId);
    if (targetPage) targetPage.classList.add('active');
}

// --- 2. AUTHENTICATION (SYNCED WITH YOUR SCHEMA) ---

function checkAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const body = document.body;

    if (user) {
        body.classList.remove('not-authenticated');
        body.classList.add('authenticated');
        document.getElementById('nav-name-display').innerText = user.firstname;

        // Sync with your Role enum (Admin/User)
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

async function registration(event) {
    event.preventDefault();

    // Mapping HTML IDs to your Joi Schema keys (firstname, lastname)
    const userData = {
        title: 'Mr',
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
            alert("Validation Error: " + result.message);
        }
    } catch (err) {
        alert("Cannot connect to server.");
    }
}

async function login(event) {
    event.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
        // Most boilerplates use /users/authenticate for login
        const response = await fetch(`${API_URL}/users/authenticate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            localStorage.setItem('user', JSON.stringify(data));
            const toast = new bootstrap.Toast(document.getElementById('login-toast'));
            toast.show();
            checkAuth();
            window.location.hash = '#/';
        } else {
            alert(data.message || "Invalid Credentials");
        }
    } catch (err) {
        alert("Login failed. Check backend connection.");
    }
}

function logout() {
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    checkAuth();
}

// --- 3. ACCOUNTS & PROFILE (SYNCED WITH PUT /:id) ---

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
                <td><span class="badge bg-secondary">${u.role}</span></td>
                <td>${u.isVerified ? '✅' : '❌'}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-danger" onclick="deleteAccount(${u.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (err) {
        tbody.innerHTML = '<tr><td colspan="5">Error loading data</td></tr>';
    }
}

async function loadProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    document.getElementById('profile-name').innerText = `${user.firstname} ${user.lastname}`;
    document.getElementById('profile-email').innerText = user.email;
    document.getElementById('profile-role').innerText = user.role;
    document.getElementById('profile-class').innerText = user.role;
}

// Example of matching your updateSchema
async function editProfile() {
    const user = JSON.parse(localStorage.getItem('user'));
    const newName = prompt("Enter new First Name:", user.firstname);

    if (!newName) return;

    const updateData = {
        firstname: newName,
        // confirmPassword is only needed if password is changed per your schema
    };

    try {
        const response = await fetch(`${API_URL}/users/${user.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updateData)
        });

        if (response.ok) {
            const updatedUser = await response.json();
            localStorage.setItem('user', JSON.stringify(updatedUser));
            loadProfile();
            alert("Profile Updated!");
        }
    } catch (err) {
        alert("Update failed.");
    }
}

// --- 4. NAVIGATION UTILITY ---
function navigateTo(hash) {
    window.location.hash = hash;
}

function verifyEmail() {
    alert("In a real app, this would check a token from your email.");
    navigateTo('#/login');
}