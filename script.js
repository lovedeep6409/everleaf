/* ═══════════════════════════════════════════════════════════
   EVERLEAF — Interactive JavaScript
   Features: Dark mode, scroll animations, cart, newsletter,
             counter animation, smooth navigation
   ═══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── DOM Elements ──
    const navbar = document.getElementById('navbar');
    const themeToggle = document.getElementById('theme-toggle');
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navLinks = document.getElementById('nav-links');
    const cartCount = document.getElementById('cart-count');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const newsletterForm = document.getElementById('newsletter-form');
    const newsletterSuccess = document.getElementById('newsletter-success');

    let cartItems = 0;
    let toastTimeout;

    // ═══════════════════════════════════════════════════════
    // THEME TOGGLE (Dark / Light)
    // ═══════════════════════════════════════════════════════
    function initTheme() {
        const saved = localStorage.getItem('everleaf-theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = saved || (prefersDark ? 'dark' : 'light');
        document.documentElement.setAttribute('data-theme', theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const next = current === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('everleaf-theme', next);
    }

    initTheme();
    themeToggle.addEventListener('click', toggleTheme);

    // ═══════════════════════════════════════════════════════
    // NAVBAR SCROLL EFFECT
    // ═══════════════════════════════════════════════════════
    let lastScroll = 0;

    function handleScroll() {
        const currentScroll = window.scrollY;

        // Add/remove scrolled class
        if (currentScroll > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Run on load

    // ═══════════════════════════════════════════════════════
    // MOBILE MENU
    // ═══════════════════════════════════════════════════════
    mobileMenuBtn.addEventListener('click', () => {
        mobileMenuBtn.classList.toggle('active');
        navLinks.classList.toggle('active');
        document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
    });

    // Close menu when clicking a link
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        });
    });

    // ═══════════════════════════════════════════════════════
    // SMOOTH SCROLL FOR NAV LINKS
    // ═══════════════════════════════════════════════════════
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            const href = anchor.getAttribute('href');
            if (href === '#') return;

            e.preventDefault();
            const target = document.querySelector(href);
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // ═══════════════════════════════════════════════════════
    // SCROLL REVEAL ANIMATIONS
    // ═══════════════════════════════════════════════════════
    function setupScrollAnimations() {
        // Hero animate-in elements
        const heroElements = document.querySelectorAll('.animate-in');
        heroElements.forEach(el => el.classList.add('visible'));

        // Reveal elements on scroll
        const revealElements = document.querySelectorAll(
            '.section-header, .feature-card, .product-card, .testimonial-card, .newsletter-wrapper'
        );

        revealElements.forEach(el => el.classList.add('reveal'));

        const staggerContainers = document.querySelectorAll(
            '.features-grid, .products-grid, .testimonials-grid'
        );
        staggerContainers.forEach(el => el.classList.add('reveal-stagger'));

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    // Don't unobserve stagger containers – they handle children
                    if (!entry.target.classList.contains('reveal-stagger')) {
                        observer.unobserve(entry.target);
                    }
                }
            });
        }, {
            threshold: 0.15,
            rootMargin: '0px 0px -60px 0px'
        });

        revealElements.forEach(el => observer.observe(el));
        staggerContainers.forEach(el => observer.observe(el));
    }

    setupScrollAnimations();

    // ═══════════════════════════════════════════════════════
    // COUNTER ANIMATION (Hero Stats)
    // ═══════════════════════════════════════════════════════
    function animateCounters() {
        const counters = document.querySelectorAll('.stat-number[data-target]');

        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const el = entry.target;
                    const target = parseInt(el.getAttribute('data-target'));
                    const duration = 2000;
                    const startTime = performance.now();

                    function updateCounter(currentTime) {
                        const elapsed = currentTime - startTime;
                        const progress = Math.min(elapsed / duration, 1);

                        // Ease out cubic
                        const eased = 1 - Math.pow(1 - progress, 3);
                        const current = Math.round(eased * target);

                        el.textContent = current;

                        if (progress < 1) {
                            requestAnimationFrame(updateCounter);
                        }
                    }

                    requestAnimationFrame(updateCounter);
                    counterObserver.unobserve(el);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => counterObserver.observe(counter));
    }

    animateCounters();

    // ═══════════════════════════════════════════════════════
    // ADD TO CART
    // ═══════════════════════════════════════════════════════
    function showToast(message) {
        clearTimeout(toastTimeout);
        toastMessage.textContent = message;
        toast.classList.add('show');

        toastTimeout = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const productName = btn.getAttribute('data-product');

            // Button feedback
            btn.classList.add('added');
            const originalText = btn.innerHTML;
            btn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18">
                    <polyline points="20 6 9 17 4 12"/>
                </svg>
                Added!
            `;

            setTimeout(() => {
                btn.classList.remove('added');
                btn.innerHTML = originalText;
            }, 2000);

            // Update cart count
            cartItems++;
            cartCount.textContent = cartItems;
            cartCount.classList.add('active');

            // Animate cart badge
            cartCount.style.transform = 'scale(1.3)';
            setTimeout(() => {
                cartCount.style.transform = 'scale(1)';
            }, 200);

            // Show toast
            showToast(`${productName} added to cart!`);
        });
    });

    // ═══════════════════════════════════════════════════════
    // NEWSLETTER FORM
    // ═══════════════════════════════════════════════════════
    newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('newsletter-email').value;

        if (email) {
            // Hide form, show success
            newsletterForm.style.display = 'none';
            newsletterSuccess.classList.add('show');

            showToast('Welcome to the Everleaf family! 🌿');
        }
    });

    // ═══════════════════════════════════════════════════════
    // PARALLAX EFFECT ON HERO (subtle)
    // ═══════════════════════════════════════════════════════
    const heroImg = document.querySelector('.hero-img');
    const heroContent = document.querySelector('.hero-content');

    function handleParallax() {
        if (window.innerWidth < 768) return; // Disable on mobile

        const scrolled = window.scrollY;
        const heroHeight = document.querySelector('.hero').offsetHeight;

        if (scrolled < heroHeight) {
            const rate = scrolled * 0.3;
            heroImg.style.transform = `scale(${1.05 + scrolled * 0.0002}) translateY(${rate}px)`;
            heroContent.style.transform = `translateY(${scrolled * 0.15}px)`;
            heroContent.style.opacity = 1 - (scrolled / heroHeight) * 0.8;
        }
    }

    window.addEventListener('scroll', handleParallax, { passive: true });

    // ═══════════════════════════════════════════════════════
    // ACTIVE NAV LINK HIGHLIGHTING
    // ═══════════════════════════════════════════════════════
    const sections = document.querySelectorAll('section[id]');

    function highlightNavLink() {
        const scrollY = window.scrollY + 100;

        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            const link = document.querySelector(`.nav-link[href="#${id}"]`);
            if (!link) return;

            if (scrollY >= top && scrollY < top + height) {
                link.style.color = '';
                link.style.fontWeight = '800';
            } else {
                link.style.fontWeight = '';
            }
        });
    }

    window.addEventListener('scroll', highlightNavLink, { passive: true });

    // ═══════════════════════════════════════════════════════
    // CURSOR GLOW EFFECT ON PRODUCT CARDS (desktop)
    // ═══════════════════════════════════════════════════════
    if (window.matchMedia('(hover: hover)').matches) {
        document.querySelectorAll('.product-card, .feature-card').forEach(card => {
            card.addEventListener('mousemove', (e) => {
                const rect = card.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                card.style.setProperty('--mouse-x', `${x}px`);
                card.style.setProperty('--mouse-y', `${y}px`);
                card.style.background = `
                    radial-gradient(
                        300px circle at var(--mouse-x) var(--mouse-y),
                        var(--bg-card-hover),
                        var(--bg-card)
                    )
                `;
            });

            card.addEventListener('mouseleave', () => {
                card.style.background = '';
            });
        });
    }

    // ═══════════════════════════════════════════════════════
    // KEYBOARD ACCESSIBILITY
    // ═══════════════════════════════════════════════════════
    document.addEventListener('keydown', (e) => {
        // Escape closes mobile menu
        if (e.key === 'Escape') {
            mobileMenuBtn.classList.remove('active');
            navLinks.classList.remove('active');
            document.body.style.overflow = '';
        }
    });

});
