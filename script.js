document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a');
    const sections = document.querySelectorAll('main section[id]');
    const logoutBtn = document.getElementById('logoutBtn');
    const userInfo = document.getElementById('userInfo');

    const debounce = (fn, delay = 100) => {
        let timer;
        return (...args) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    const setActiveLink = () => {
        const scrollPosition = window.scrollY + 140;
        sections.forEach((section) => {
            const sectionTop = section.offsetTop;
            const sectionBottom = sectionTop + section.offsetHeight;
            const link = document.querySelector(`.main-nav a[href="#${section.id}"]`);
            if (!link) return;

            if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    };

    const closeMobileMenu = () => {
        if (mainNav.classList.contains('is-open')) {
            mainNav.classList.remove('is-open');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    };

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isOpen = mainNav.classList.toggle('is-open');
            navToggle.setAttribute('aria-expanded', String(isOpen));
        });
    }

    navLinks.forEach((link) => {
        link.addEventListener('click', () => {
            closeMobileMenu();
        });
    });

    setActiveLink();
    window.addEventListener('scroll', debounce(setActiveLink, 60));

    const revealObserver = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('is-visible');
                }
            });
        },
        {
            threshold: 0.12,
        }
    );

    document.querySelectorAll('.hero-copy, .info-card, .project-card, .contact-card, .assistant-card').forEach((element) => {
        revealObserver.observe(element);
    });

    const contactForm = document.getElementById('contactForm');
    const formStatus = document.getElementById('formStatus');

    if (contactForm) {
        contactForm.addEventListener('submit', async (event) => {
            event.preventDefault();
            formStatus.textContent = 'Sending message...';
            formStatus.classList.remove('error');

            const submitButton = contactForm.querySelector('button[type="submit"]');
            submitButton.disabled = true;

            const payload = {
                name: contactForm.name.value.trim(),
                email: contactForm.email.value.trim(),
                message: contactForm.message.value.trim(),
            };

            try {
                const response = await fetch('/api/contact', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const result = await response.json();
                if (!response.ok) {
                    throw new Error(result.error || 'Unable to send message');
                }

                contactForm.reset();
                formStatus.textContent = 'Thanks! Your message has been sent.';
                loadDashboardStats();
            } catch (error) {
                formStatus.textContent = error.message;
                formStatus.classList.add('error');
            } finally {
                submitButton.disabled = false;
            }
        });
    }

    const loadDashboardStats = async () => {
        const response = await fetch('/api/chart-data');
        if (!response.ok) return;
        const data = await response.json();
        const messageCount = document.getElementById('messageCount');
        const userCount = document.getElementById('userCount');
        if (messageCount) messageCount.textContent = data.totalMessages;
        if (userCount) userCount.textContent = data.totalUsers;
    };

    const loadUserInfo = async () => {
        const response = await fetch('/api/user');
        if (!response.ok) return;
        const result = await response.json();
        if (result.user && userInfo) {
            userInfo.innerHTML = `
                <p>Signed in as <strong>${result.user.name}</strong></p>
                <button type="button" id="logoutBtn" class="btn btn-secondary">Logout</button>
            `;
            const logoutButton = document.getElementById('logoutBtn');
            if (logoutButton) {
                logoutButton.addEventListener('click', async () => {
                    await fetch('/api/logout');
                    window.location.reload();
                });
            }
        }
    };

    loadDashboardStats();
    loadUserInfo();
});