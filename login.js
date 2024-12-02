document.addEventListener('DOMContentLoaded', () => {
    const loginBox = document.querySelector('.login-box');
    const registerBox = document.querySelector('.register-box');
    const showRegisterLink = document.getElementById('showRegister');
    const showLoginLink = document.getElementById('showLogin');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const typeButtons = document.querySelectorAll('.type-btn');

    // Toggle between login and register forms
    showRegisterLink.addEventListener('click', (e) => {
        e.preventDefault();
        loginBox.classList.add('hidden');
        registerBox.classList.remove('hidden');
    });

    showLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
    });

    // Handle user type selection
    typeButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons in the same container
            button.parentElement.querySelectorAll('.type-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            button.classList.add('active');
        });
    });

    // Handle login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = loginForm.querySelector('input[type="email"]').value;
        const password = loginForm.querySelector('input[type="password"]').value;
        const userType = loginBox.querySelector('.type-btn.active').dataset.type;

        // Get users from localStorage
        const users = JSON.parse(localStorage.getItem('users')) || [];
        const user = users.find(u => u.email === email && u.password === password && u.type === userType);

        if (user) {
            localStorage.setItem('currentUser', JSON.stringify(user));
            if (user.type === 'seller') {
                window.location.href = 'seller-dashboard.html';
            } else {
                window.location.href = 'index.html';
            }
        } else {
            alert('Invalid credentials or user type!');
        }
    });

    // Handle registration
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = registerForm.querySelector('input[type="text"]').value;
        const email = registerForm.querySelector('input[type="email"]').value;
        const password = registerForm.querySelectorAll('input[type="password"]')[0].value;
        const confirmPassword = registerForm.querySelectorAll('input[type="password"]')[1].value;
        const userType = registerBox.querySelector('.type-btn.active').dataset.type;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        // Get existing users
        const users = JSON.parse(localStorage.getItem('users')) || [];

        // Check if user already exists
        if (users.some(user => user.email === email)) {
            alert('User already exists!');
            return;
        }

        // Add new user
        const newUser = { name, email, password, type: userType };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));

        alert('Registration successful! Please login.');
        registerBox.classList.add('hidden');
        loginBox.classList.remove('hidden');
        registerForm.reset();
    });
}); 