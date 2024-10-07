// Mock data
const users = [
    { id: 1, name: 'User1', email: 'user1@example.com', akelCoins: 1000 },
    { id: 2, name: 'User2', email: 'user2@example.com', akelCoins: 500 },
    { id: 3, name: 'User3', email: 'user3@example.com', akelCoins: 1500 }
];

const videos = [
    { id: 'VID001', name: 'Funny Cat Compilation', creator: 'User1', likes: 100, comments: 10, url: 'https://example.com/video1.mp4' },
    { id: 'VID002', name: 'Cooking Tutorial', creator: 'User2', likes: 200, comments: 20, url: 'https://example.com/video2.mp4' },
    { id: 'VID003', name: 'Travel Vlog: Paris', creator: 'User3', likes: 150, comments: 15, url: 'https://example.com/video3.mp4' }
];

const withdrawals = [
    { id: 1, user: 'User1', amount: 50, timestamp: new Date() },
    { id: 2, user: 'User2', amount: 30, timestamp: new Date() },
    { id: 3, user: 'User3', amount: 70, timestamp: new Date() }
];

let totalWithdrawals = 150;
let adminEarnings = 30; // 20% of total withdrawals

// Admin credentials
let adminUsername = 'admin';
let adminPassword = 'password';

// DOM Elements
const loginContainer = document.getElementById('login-container');
const adminPanel = document.getElementById('admin-panel');
const adminLoginBtn = document.getElementById('admin-login-btn');
const logoutBtn = document.getElementById('logout-btn');
const navButtons = document.querySelectorAll('.nav-btn');
const contentSections = document.querySelectorAll('.content-section');
const adminWithdrawBtn = document.getElementById('admin-withdraw-btn');
const settingsBtn = document.getElementById('settings-btn');
const settingsSection = document.getElementById('settings');

// Event Listeners
adminLoginBtn.addEventListener('click', login);
logoutBtn.addEventListener('click', logout);
navButtons.forEach(btn => btn.addEventListener('click', navigate));
adminWithdrawBtn.addEventListener('click', adminWithdraw);
settingsBtn.addEventListener('click', showSettings);

// Functions
function login() {
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;

    if (username === adminUsername && password === adminPassword) {
        loginContainer.style.display = 'none';
        adminPanel.style.display = 'flex';
        updateDashboard();
        populateTables();
    } else {
        alert('Invalid credentials');
    }
}

function logout() {
    loginContainer.style.display = 'flex';
    adminPanel.style.display = 'none';
    document.getElementById('admin-username').value = '';
    document.getElementById('admin-password').value = '';
}

function navigate(event) {
    const targetId = event.target.id.split('-')[0];
    navButtons.forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    contentSections.forEach(section => {
        section.style.display = section.id === targetId ? 'block' : 'none';
    });
}

function updateDashboard() {
    document.getElementById('total-users').textContent = users.length;
    document.getElementById('total-videos').textContent = videos.length;
    document.getElementById('total-withdrawals').textContent = `$${totalWithdrawals.toFixed(2)}`;
    document.getElementById('admin-earnings').textContent = `$${adminEarnings.toFixed(2)}`;
}

function populateTables() {
    populateUsersTable();
    populateVideosTable();
    populateWithdrawalsTable();
}

function populateUsersTable() {
    const tbody = document.querySelector('#users-table tbody');
    tbody.innerHTML = '';
    users.forEach(user => {
        const row = `
            <tr>
                <td>${user.id}</td>
                <td>${user.name}</td>
                <td>${user.email}</td>
                <td>${user.akelCoins}</td>
                <td>
                    <button onclick="editUser(${user.id})">Edit</button>
                    <button onclick="deleteUser(${user.id})">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function populateVideosTable() {
    const tbody = document.querySelector('#videos-table tbody');
    tbody.innerHTML = '';
    videos.forEach(video => {
        const row = `
            <tr>
                <td><a href="#" onclick="playVideo('${video.url}', '${video.name}')">${video.id}</a></td>
                <td>${video.name}</td>
                <td>${video.creator}</td>
                <td>${video.likes}</td>
                <td>${video.comments}</td>
                <td>
                    <button onclick="deleteVideo('${video.id}')">Delete</button>
                </td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function populateWithdrawalsTable() {
    const tbody = document.querySelector('#withdrawals-table tbody');
    tbody.innerHTML = '';
    withdrawals.forEach(withdrawal => {
        const row = `
            <tr>
                <td>${withdrawal.id}</td>
                <td>${withdrawal.user}</td>
                <td>$${withdrawal.amount.toFixed(2)}</td>
                <td>${withdrawal.timestamp.toLocaleString()}</td>
            </tr>
        `;
        tbody.innerHTML += row;
    });
}

function editUser(id) {
    const user = users.find(u => u.id === id);
    if (user) {
        const newName = prompt("Enter new name:", user.name);
        const newEmail = prompt("Enter new email:", user.email);
        const newAkelCoins = prompt("Enter new AKELcoins balance:", user.akelCoins);

        if (newName && newEmail && newAkelCoins) {
            user.name = newName;
            user.email = newEmail;
            user.akelCoins = parseFloat(newAkelCoins);
            populateUsersTable();
            alert("User updated successfully!");
        }
    }
}

function deleteUser(id) {
    const index = users.findIndex(u => u.id === id);
    if (index !== -1) {
        if (confirm(`Are you sure you want to delete user ${users[index].name}?`)) {
            users.splice(index, 1);
            populateUsersTable();
            updateDashboard();
            alert("User deleted successfully!");
        }
    }
}

function playVideo(url, name) {
    const videoPlayer = document.getElementById('video-player');
    const videoTitle = document.getElementById('video-title');
    videoPlayer.src = url;
    videoTitle.textContent = name;
    document.getElementById('video-modal').style.display = 'block';
}

function closeVideoModal() {
    document.getElementById('video-modal').style.display = 'none';
    document.getElementById('video-player').pause();
}

function deleteVideo(id) {
    const index = videos.findIndex(v => v.id === id);
    if (index !== -1) {
        if (confirm(`Are you sure you want to delete video ${videos[index].name}?`)) {
            videos.splice(index, 1);
            populateVideosTable();
            updateDashboard();
            alert("Video deleted successfully!");
        }
    }
}

function adminWithdraw() {
    if (adminEarnings > 0) {
        const amount = prompt(`You have $${adminEarnings.toFixed(2)} available. Enter the amount you want to withdraw:`);
        const withdrawAmount = parseFloat(amount);
        
        if (isNaN(withdrawAmount) || withdrawAmount <= 0) {
            alert('Please enter a valid positive number.');
            return;
        }
        
        if (withdrawAmount > adminEarnings) {
            alert('You cannot withdraw more than your available earnings.');
            return;
        }
        
        adminEarnings -= withdrawAmount;
        alert(`Successfully withdrawn $${withdrawAmount.toFixed(2)}. Remaining balance: $${adminEarnings.toFixed(2)}`);
        updateDashboard();
    } else {
        alert('No earnings to withdraw.');
    }
}

function userWithdraw(userId, amount) {
    const user = users.find(u => u.id === userId);
    if (user && user.akelCoins >= amount) {
        user.akelCoins -= amount;
        const adminFee = amount * 0.2;
        adminEarnings += adminFee;
        totalWithdrawals += amount;
        withdrawals.push({
            id: withdrawals.length + 1,
            user: user.name,
            amount: amount,
            timestamp: new Date()
        });
        updateDashboard();
        populateTables();
        console.log(`User ${user.name} withdrew $${amount}. Admin earned $${adminFee}`);
    }
}

function showSettings() {
    navigate({ target: { id: 'settings-btn' } });
    document.getElementById('current-username').textContent = adminUsername;
}

function changeAdminCredentials() {
    const newUsername = document.getElementById('new-username').value;
    const newPassword = document.getElementById('new-password').value;
    const confirmPassword = document.getElementById('confirm-password').value;

    if (!newUsername || !newPassword || !confirmPassword) {
        alert('Please fill in all fields.');
        return;
    }

    if (newPassword !== confirmPassword) {
        alert('New password and confirm password do not match.');
        return;
    }

    adminUsername = newUsername;
    adminPassword = newPassword;
    
    document.getElementById('current-username').textContent = adminUsername;
    document.getElementById('new-username').value = '';
    document.getElementById('new-password').value = '';
    document.getElementById('confirm-password').value = '';

    alert('Admin credentials updated successfully.');
}

// Initialize the admin panel
updateDashboard();
populateTables();

// Simulate some user withdrawals
setInterval(() => {
    const randomUserId = Math.floor(Math.random() * users.length) + 1;
    const randomAmount = Math.floor(Math.random() * 50) + 10;
    userWithdraw(randomUserId, randomAmount);
}, 5000);