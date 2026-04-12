document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.getElementById('loginStatus');

    if (!loginForm) return;

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        loginStatus.textContent = 'Signing in...';
        loginStatus.classList.remove('error');

        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const result = await response.json();
                loginStatus.textContent = result.error || 'Login failed.';
                loginStatus.classList.add('error');
                return;
            }

            window.location.href = 'card.html';
        } catch (error) {
            loginStatus.textContent = 'Unable to connect to the backend. Please make sure the server is running.';
            loginStatus.classList.add('error');
        }
    });
});
