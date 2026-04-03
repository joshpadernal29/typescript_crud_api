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

    // Select the "Add User" button (You might need to give it an ID in HTML)
    const addUserBtn = document.querySelector('[data-bs-target="#addUserModal"]');

    if (user) {
        body.classList.replace('not-authenticated', 'authenticated');
        document.getElementById('nav-name-display').innerText = user.firstname;

        if (user.role === 'Admin') {
            body.classList.add('is-admin');
            if (addUserBtn) addUserBtn.style.display = 'block'; // Show if Admin
        } else {
            body.classList.remove('is-admin');
            if (addUserBtn) addUserBtn.style.display = 'none'; // Hide if User
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

// register new Account
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

// account logout
function logout() {
    localStorage.removeItem('user');
    window.location.hash = '#/login';
    checkAuth();
}

// --- 3. ADMIN CRUD (ACCOUNTS) ---

async function loadAccounts() {
    const tbody = document.getElementById('account-table-body');
    if (!tbody) return;

    // Get the current logged-in user to check their role
    const currentUser = JSON.parse(localStorage.getItem('user'));

    tbody.innerHTML = '<tr><td colspan="5" class="text-center">Loading users...</td></tr>';

    try {
        const response = await fetch(`${API_URL}/users`);
        if (!response.ok) throw new Error("Failed to fetch users");

        const users = await response.json();

        tbody.innerHTML = users.map(u => {
            // Determine if the current viewer is an Admin
            const isAdmin = currentUser && currentUser.role === 'Admin';

            // Only show buttons if the viewer is an Admin
            const actionButtons = isAdmin ? `
                <button class="btn btn-sm btn-outline-primary me-1" onclick="openEditModal(${u.id})">
                    <i class="bi bi-pencil"></i> Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="deleteUser(${u.id})">
                    <i class="bi bi-trash"></i> Delete
                </button>
            ` : `<span class="text-muted small">View Only</span>`;

            return `
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
                    <td class="text-center">${actionButtons}</td>
                </tr>
            `;
        }).join('');

    } catch (err) {
        console.error("Load Accounts Error:", err);
        tbody.innerHTML = `<tr><td colspan="5" class="text-center text-danger">Error: ${err.message}</td></tr>`;
    }
}

// Add Account from Modal
async function addAccount(event) {
    // 1. Stop the page from reloading
    event.preventDefault();

    // 2. Collect Data
    const payload = {
        title: document.getElementById('accTitle').value,
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

        // 3. Check if the Server responded with Success (200-299)
        if (res.ok) {
            // SAFE MODAL HIDING: 
            // Check if the element exists before calling Bootstrap to prevent "Server Error" alert
            const modalElement = document.getElementById('account-modal');
            if (modalElement) {
                const modalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
                modalInstance.hide();
            }

            // SAFE FORM RESET:
            const formElement = document.getElementById('accountForm');
            if (formElement) {
                formElement.reset();
            }

            // Refresh the table data
            await loadAccounts();

            alert("User created and UI updated successfully.");
        } else {
            // Server returned an error (e.g., 400 Bad Request)
            const err = await res.json();
            alert(`Registration Failed: ${err.message}`);
        }

    } catch (e) {
        // This only runs if there is a Network error OR a JS crash in the try block
        console.error("Critical Error:", e);

        // Show the REAL error message so you can fix it
        alert("System Error: " + e.message);
    }
}

// delete account using the typescript_crud_api
async function deleteUser(id) {
    const currentUser = JSON.parse(localStorage.getItem('user'));

    // PROTECTION: Check if the ID to delete matches the current user's ID
    if (currentUser && id === currentUser.id) {
        return alert("Security Block: You cannot delete your own account while logged in!");
    }

    if (!confirm(`Are you sure you want to delete User ID: ${id}?`)) return;

    try {
        const response = await fetch(`${API_URL}/users/${id}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert("User removed from database.");
            loadAccounts();
        } else {
            const err = await response.json();
            alert("Delete failed: " + err.message);
        }
    } catch (err) {
        console.error("Delete Error:", err);
    }
}

// load user profile
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

// edit user account via Admin
async function openEditModal(id) {
    try {
        // 1. Fetch data from your backend
        const res = await fetch(`${API_URL}/users/${id}`);
        if (!res.ok) throw new Error("User not found");

        const user = await res.json();

        // 2. Populate the specific inputs in the edit-modal
        // Ensure these IDs match your <input id="..."> exactly
        document.getElementById('editId').value = user.id;
        document.getElementById('editTitle').value = user.title;
        document.getElementById('editFname').value = user.firstname;
        document.getElementById('editLname').value = user.lastname;
        document.getElementById('editEmail').value = user.email;
        document.getElementById('editRole').value = user.role;

        // 3. Manually trigger the modal to open AFTER data is loaded
        const editModal = new bootstrap.Modal(document.getElementById('edit-modal'));
        editModal.show();

    } catch (e) {
        console.error("Edit Modal Error:", e);
        alert("Could not load user data: " + e.message);
    }
}
// saves updated user info to the db
async function saveUpdatedAccount(event) {
    // 1. Prevent the page from refreshing
    event.preventDefault();

    // 2. Get the ID from the hidden input we filled earlier
    const id = document.getElementById('editId').value;

    // 3. Build the payload with the current input values
    const payload = {
        title: document.getElementById('editTitle').value,
        firstname: document.getElementById('editFname').value,
        lastname: document.getElementById('editLname').value,
        email: document.getElementById('editEmail').value,
        role: document.getElementById('editRole').value,
    };

    try {
        // 4. Send the PUT request to the backend
        const res = await fetch(`${API_URL}/users/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (res.ok) {
            // 5. Success! Hide the modal
            const editModalElement = document.getElementById('edit-modal');
            const modalInstance = bootstrap.Modal.getInstance(editModalElement);
            modalInstance.hide();

            // 6. Refresh the table to show the new data
            alert("Account updated successfully!");
            loadAccounts();
        } else {
            const err = await res.json();
            alert("Update Failed: " + err.message);
        }
    } catch (e) {
        console.error("Update Error:", e);
        alert("System Error: " + e.message);
    }
}