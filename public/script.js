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
    if (hash === '#/departments') { targetId = 'departments'; loadDepartments(); }
    if (hash === '#/requests') { targetId = 'requests'; loadRequests(); }

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

// --- 1. DEPARTMENTS CRUD ---

async function loadDepartments() {
    const tbody = document.getElementById('dept-table-body');
    if (!tbody) {
        console.error("Could not find table body element!");
        return;
    }

    try {
        const res = await fetch(`${API_URL}/departments`);
        const depts = await res.json();

        console.log("Departments fetched:", depts); // <-- Look for this in F12 Console

        if (depts.length === 0) {
            tbody.innerHTML = '<tr><td colspan="3" class="text-center">No Data</td></tr>';
            return;
        }

        tbody.innerHTML = depts.map(d => `
            <tr>
                <td>${d.id}</td>
                <td>${d.name}</td>
                <td class="text-center">
                    <button class="btn btn-sm btn-outline-primary" onclick="editDept(${d.id}, '${d.name}')">Edit</button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteDept(${d.id})">Delete</button>
                </td>
            </tr>
        `).join('');
    } catch (e) {
        console.error("UI Load Error:", e);
    }
}
// edit department
function editDept(id, name) {
    // 1. Set the values in the modal fields
    document.getElementById('deptId').value = id;
    document.getElementById('deptName').value = name;

    // 2. Change the Modal Title to "Edit"
    document.getElementById('deptModalLabel').innerText = 'Edit Department';

    // 3. Trigger the modal to open
    const modal = new bootstrap.Modal(document.getElementById('deptModal'));
    modal.show();
}

async function saveDepartment(event) {
    event.preventDefault();
    const id = document.getElementById('deptId').value;
    const name = document.getElementById('deptName').value;

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${API_URL}/departments/${id}` : `${API_URL}/departments`;

    const res = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' }, // REMOVED: Authorization
        body: JSON.stringify({ name })
    });

    if (res.ok) {
        bootstrap.Modal.getInstance(document.getElementById('deptModal')).hide();
        document.getElementById('deptForm').reset();
        document.getElementById('deptId').value = '';
        loadDepartments();
    } else {
        const err = await res.json();
        alert("Save failed: " + err.message);
    }
}

//  REQUESTS (Approve/Disapprove Logic)
async function loadRequests() {
    const user = JSON.parse(localStorage.getItem('user'));
    if (!user) return;

    const isAdmin = user.role === 'Admin';
    const theadRow = document.getElementById('request-thead-row');
    const newRequestBtn = document.getElementById('new-request-btn');

    // Hide "New Request" button for admins if they don't need to make requests
    if (newRequestBtn) newRequestBtn.style.display = isAdmin ? 'none' : 'block';

    try {
        const res = await fetch(`${API_URL}/requests`);
        const allReqs = await res.json();

        if (isAdmin) {
            // Set Admin Headers
            if (isAdmin) {
                theadRow.innerHTML = `
                    <th>Account</th>
                    <th>Type</th>
                    <th>Items</th>
                    <th>Status</th>
                    <th class="text-center">Actions</th>
                `;
                renderAdminTable(allReqs);
            }
            renderAdminTable(allReqs);
        } else {
            // Set User Headers
            theadRow.innerHTML = `
                <th>Type</th>
                <th>Items</th>
                <th>Status</th>
            `;
            const myReqs = allReqs.filter(r => Number(r.userId) === Number(user.id));
            renderUserTable(myReqs);
        }
    } catch (e) {
        console.error("Load Requests Error:", e);
    }
}

// TABLE RENDERING
// Helper to format the items column safely
function formatRequestItems(items) {
    if (!items || items === "" || items === "[]") return '<span class="text-muted">No items</span>';

    let itemsArray = items;
    if (typeof items === 'string') {
        try {
            itemsArray = JSON.parse(items);
        } catch (e) {
            return items; // Return as plain text if JSON parse fails
        }
    }

    if (Array.isArray(itemsArray)) {
        return itemsArray.map(item => `${item.name} (${item.quantity})`).join(', ');
    }
    return items;
}

function renderAdminTable(reqs) {
    const tbody = document.getElementById('request-table-body');
    if (!tbody) return;

    tbody.innerHTML = reqs.map(r => {
        const fullName = r.user ? `${r.user.firstname} ${r.user.lastname}` : 'Unknown';
        const email = r.user ? r.user.email : 'N/A';

        // CHECK: If the status is no longer 'Pending', disable the buttons
        const isProcessed = r.status === 'Approved' || r.status === 'Disapproved';

        return `
            <tr>
                <td>
                    <div class="fw-bold text-dark">${fullName}</div>
                    <div class="small text-muted">${email}</div>
                </td>
                <td class="text-capitalize">${r.type}</td>
                <td>${formatRequestItems(r.items)}</td>
                <td><span class="badge ${getStatusClass(r.status)}">${r.status || 'Pending'}</span></td>
                <td class="text-center">
                    <div class="btn-group btn-group-sm">
                        <button class="btn btn-success" 
                            onclick="updateRequestStatus(${r.id}, 'Approved')" 
                            ${isProcessed ? 'disabled' : ''}>
                            Approve
                        </button>
                        <button class="btn btn-danger" 
                            onclick="updateRequestStatus(${r.id}, 'Disapproved')" 
                            ${isProcessed ? 'disabled' : ''}>
                            Reject
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function renderUserTable(reqs) {
    const tbody = document.getElementById('request-table-body');

    if (!tbody) return;

    if (reqs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="3" class="text-center text-muted">No requests found.</td></tr>`;
        return;
    }

    tbody.innerHTML = reqs.map(r => `
        <tr>
            <td class="text-capitalize">${r.type}</td>
            
            <td>${formatRequestItems(r.items)}</td>
            
            <td>
                <span class="badge ${getStatusClass(r.status)}">
                    ${r.status || 'Pending'}
                </span>
            </td>
        </tr>
    `).join('');
}

// DYNAMIC FORM & SUBMISSION
function addRequestItemRow() {
    const container = document.getElementById('dynamic-items-container');
    const rowId = Date.now();

    const html = `
        <div class="row g-2 mb-2 align-items-center" id="row-${rowId}">
            <div class="col-7">
                <input type="text" class="form-control item-name" placeholder="Item name" required>
            </div>
            <div class="col-3">
                <input type="number" class="form-control item-qty" placeholder="Qty" min="1" value="1" required>
            </div>
            <div class="col-2 text-end">
                <button class="btn btn-outline-danger w-100" type="button" onclick="this.closest('.row').remove()">
                    &times;
                </button>
            </div>
        </div>
    `;
    container.insertAdjacentHTML('beforeend', html);
}

const requestForm = document.getElementById('requestForm');
if (requestForm) {
    requestForm.onsubmit = async (e) => {
        e.preventDefault();

        const user = JSON.parse(localStorage.getItem('user'));
        if (!user) return alert("Please log in first");

        // GATHER DATA FROM DYNAMIC ROWS
        const items = [];
        const names = document.querySelectorAll('.item-name');
        const qtys = document.querySelectorAll('.item-qty');

        names.forEach((nameInput, index) => {
            if (nameInput.value.trim() !== "") {
                items.push({
                    name: nameInput.value,
                    quantity: qtys[index].value
                });
            }
        });

        const payload = {
            type: document.getElementById('requestType').value,
            items: JSON.stringify(items), // Send as Stringified JSON
            userId: user.id
        };

        try {
            const res = await fetch(`${API_URL}/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                const modalEl = document.getElementById('request-modal');
                const modalInstance = bootstrap.Modal.getInstance(modalEl);
                if (modalInstance) modalInstance.hide();

                requestForm.reset();
                document.getElementById('dynamic-items-container').innerHTML = ''; // Clear items
                loadRequests();
                alert("Request submitted successfully!");
            } else {
                const err = await res.json();
                alert("Submission failed: " + err.message);
            }
        } catch (err) {
            console.error("Network Error:", err);
        }
    };
}

// UTILITIES
async function updateRequestStatus(id, newStatus) {
    try {
        const res = await fetch(`${API_URL}/requests/${id}/status`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (res.ok) {
            loadRequests();
        } else {
            const errorData = await res.json();
            alert("Error updating status: " + errorData.message);
        }
    } catch (err) {
        console.error("Update Status Error:", err);
    }
}

function getStatusClass(status) {
    switch (status) {
        case 'Approved': return 'bg-success';
        case 'Disapproved': return 'bg-danger';
        default: return 'bg-warning text-dark';
    }
}

