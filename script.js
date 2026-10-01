// Wait for DOM to load fully
document.addEventListener('DOMContentLoaded', () => {

    // --- 1. MEMBER SIGNUP HANDLER ---
    const signupForm = document.getElementById('signupForm');
    if (signupForm) {
        signupForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const fullName = document.getElementById('memberName').value.trim();
            const email = document.getElementById('memberEmail').value.trim();
            const department = document.getElementById('memberDepartment').value.trim();
            const year = document.getElementById('memberYear').value.trim();
            const password = document.getElementById('memberPassword').value;
            const confirmPassword = document.getElementById('memberConfirmPassword').value;

            // Password confirmation check
            if (password !== confirmPassword) {
                alert('Passwords do not match. Please try again.');
                return;
            }

            try {
                const response = await fetch('/api/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ fullName, email, department, year, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Registration successful!');
                    signupForm.reset();
                    
                    // Close the modal if active
                    const signupModal = document.getElementById('signupModal');
                    if (signupModal) signupModal.style.display = 'none';
                } else {
                    alert(data.message || 'Registration failed.');
                }
            } catch (error) {
                console.error('Registration Error:', error);
                alert('Network error. Please try again later.');
            }
        });
    }

    // --- 2. USER LOGIN HANDLER (Members & Admin) ---
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const email = document.getElementById('loginEmail').value.trim();
            const password = document.getElementById('loginPassword').value;

            try {
                const response = await fetch('/api/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email, password })
                });

                const data = await response.json();

                if (response.ok) {
                    alert(data.message || 'Login successful!');
                    
                    // Save user session locally
                    localStorage.setItem('currentUser', JSON.stringify(data.user));
                    loginForm.reset();

                    // Close the login modal
                    const loginModal = document.getElementById('loginModal');
                    if (loginModal) loginModal.style.display = 'none';

                    // Role-based actions
                    if (data.user.role === 'admin') {
                        alert('Welcome Admin!');
                        const adminPanel = document.getElementById('adminPanel');
                        if (adminPanel) adminPanel.style.display = 'block';
                    } else {
                        alert(`Welcome back, ${data.user.fullName || 'Member'}!`);
                    }
                } else {
                    alert(data.message || 'Login failed.');
                }
            } catch (error) {
                console.error('Login Error:', error);
                alert('Network error. Please try again later.');
            }
        });
    }

    // --- 3. MODAL DISPLAY TOGGLES ---
    const loginBtn = document.getElementById('loginBtn');
    const signupBtn = document.getElementById('signupBtn');
    const adminBtn = document.getElementById('adminBtn');

    const loginModal = document.getElementById('loginModal');
    const signupModal = document.getElementById('signupModal');
    const adminModal = document.getElementById('adminModal');

    if (loginBtn && loginModal) {
        loginBtn.addEventListener('click', () => loginModal.style.display = 'block');
    }
    if (signupBtn && signupModal) {
        signupBtn.addEventListener('click', () => signupModal.style.display = 'block');
    }
    if (adminBtn && adminModal) {
        adminBtn.addEventListener('click', () => adminModal.style.display = 'block');
    }

    // Close buttons for modals
    document.querySelectorAll('.close').forEach(closeBtn => {
        closeBtn.addEventListener('click', (e) => {
            const activeModal = e.target.closest('.modal');
            if (activeModal) activeModal.style.display = 'none';
        });
    });
});
