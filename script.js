document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // Theme Management
    // ----------------------------------------------------
    const themeToggle = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;

    // Load theme preference
    const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
    htmlElement.setAttribute('data-theme', savedTheme);

    themeToggle.addEventListener('click', () => {
        const currentTheme = htmlElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        
        htmlElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('portfolio-theme', newTheme);
    });

    // ----------------------------------------------------
    // Mobile Menu Toggle
    // ----------------------------------------------------
    const mobileToggle = document.getElementById('mobile-toggle');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    const toggleMenu = () => {
        mobileToggle.classList.toggle('open');
        navMenu.classList.toggle('open');
    };

    mobileToggle.addEventListener('click', toggleMenu);

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu.classList.contains('open')) {
                toggleMenu();
            }
        });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (navMenu.classList.contains('open') && 
            !navMenu.contains(e.target) && 
            !mobileToggle.contains(e.target)) {
            toggleMenu();
        }
    });

    // ----------------------------------------------------
    // Interactive Particle Background (Canvas)
    // ----------------------------------------------------
    const canvas = document.getElementById('particle-canvas');
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = 60;
    const connectionDistance = 120;
    let mouse = { x: null, y: null, radius: 150 };

    // Resize Canvas
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Track Mouse Position
    window.addEventListener('mousemove', (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    window.addEventListener('mouseleave', () => {
        mouse.x = null;
        mouse.y = null;
    });

    // Particle Class
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 0.8;
            this.vy = (Math.random() - 0.5) * 0.8;
            this.radius = Math.random() * 2.5 + 1;
        }

        update() {
            // Move particle
            this.x += this.vx;
            this.y += this.vy;

            // Bounce off boundaries
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;

            // Mouse interaction (repel slightly)
            if (mouse.x !== null && mouse.y !== null) {
                const dx = this.x - mouse.x;
                const dy = this.y - mouse.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius) {
                    const force = (mouse.radius - distance) / mouse.radius;
                    const angle = Math.atan2(dy, dx);
                    this.x += Math.cos(angle) * force * 2;
                    this.y += Math.sin(angle) * force * 2;
                }
            }
        }

        draw() {
            const isDark = htmlElement.getAttribute('data-theme') === 'dark';
            ctx.fillStyle = isDark ? 'rgba(99, 102, 241, 0.4)' : 'rgba(79, 70, 229, 0.25)';
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize Particles
    const initParticles = () => {
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle());
        }
    };
    initParticles();

    // Animation Loop
    const animateParticles = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(p => {
            p.update();
            p.draw();
        });

        // Draw connections
        const isDark = htmlElement.getAttribute('data-theme') === 'dark';
        const lineColor = isDark ? 'rgba(99, 102, 241, 0.05)' : 'rgba(79, 70, 229, 0.05)';

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist < connectionDistance) {
                    ctx.strokeStyle = lineColor;
                    ctx.lineWidth = 1 - (dist / connectionDistance);
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }

        requestAnimationFrame(animateParticles);
    };
    animateParticles();

    // ----------------------------------------------------
    // Typing Effect in Hero
    // ----------------------------------------------------
    const words = ["Softwares.", "Java & Python Apps.", "Machine Learning.", "Data Structures & Algos."];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    const typedTextSpan = document.getElementById('typed-text');
    let typingSpeed = 100;

    const type = () => {
        const currentWord = words[wordIndex];
        
        if (isDeleting) {
            charIndex--;
            typingSpeed = 50;
        } else {
            charIndex++;
            typingSpeed = 120;
        }

        typedTextSpan.textContent = currentWord.substring(0, charIndex);

        if (!isDeleting && charIndex === currentWord.length) {
            isDeleting = true;
            typingSpeed = 2000; // Pause at end of word
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            wordIndex = (wordIndex + 1) % words.length;
            typingSpeed = 500; // Pause before typing next word
        }

        setTimeout(type, typingSpeed);
    };

    // Trigger Typing
    if (typedTextSpan) {
        setTimeout(type, 1000);
    }

    // ----------------------------------------------------
    // Scroll Reveal & Active Links (Intersection Observer)
    // ----------------------------------------------------
    const revealElements = document.querySelectorAll('.reveal');
    const sections = document.querySelectorAll('section');
    const navMenuLinks = document.querySelectorAll('.nav-menu a');

    // Reveal elements on scroll
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.15 });

    revealElements.forEach(el => revealObserver.observe(el));

    // Update Active Nav Link
    const navSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const id = entry.target.getAttribute('id');
                navMenuLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '-30% 0px -60% 0px' });

    sections.forEach(sec => navSpyObserver.observe(sec));

    // ----------------------------------------------------
    // Numerical Counter Animation
    // ----------------------------------------------------
    const statNumbers = document.querySelectorAll('.stat-number');
    let counted = false;

    const countUp = () => {
        statNumbers.forEach(stat => {
            const target = parseFloat(stat.getAttribute('data-target'));
            const isFloat = target % 1 !== 0;
            const duration = 2000; // ms
            const stepTime = 30;
            const steps = duration / stepTime;
            const increment = target / steps;
            let current = 0;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    current = target;
                    clearInterval(timer);
                }
                stat.textContent = isFloat ? current.toFixed(1) : Math.floor(current);
            }, stepTime);
        });
    };

    const statsSection = document.querySelector('.stats-section');
    if (statsSection) {
        const statsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting && !counted) {
                countUp();
                counted = true;
                statsObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.5 });
        statsObserver.observe(statsSection);
    }

    // ----------------------------------------------------
    // Skills Bar Load on Scroll
    // ----------------------------------------------------
    const skillsSection = document.getElementById('skills');
    const skillProgresses = document.querySelectorAll('.skill-progress');

    if (skillsSection) {
        const skillsObserver = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) {
                skillProgresses.forEach(progress => {
                    // Extract inline style width to trigger CSS transitions
                    const width = progress.getAttribute('style').match(/\d+/)[0];
                    progress.style.width = width + '%';
                });
                skillsObserver.unobserve(entries[0].target);
            }
        }, { threshold: 0.2 });
        skillsObserver.observe(skillsSection);
    }

    // ----------------------------------------------------
    // Project Filter Handling
    // ----------------------------------------------------
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Set active class
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filterValue = btn.getAttribute('data-filter');

            projectCards.forEach(card => {
                const category = card.getAttribute('data-category');
                
                if (filterValue === 'all' || category === filterValue) {
                    card.style.display = 'flex';
                    // Re-trigger layout anim fade
                    card.style.opacity = '1';
                    card.style.transform = 'scale(1)';
                } else {
                    card.style.opacity = '0';
                    card.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        card.style.display = 'none';
                    }, 200); // match fade transition
                }
            });
        });
    });

    // ----------------------------------------------------
    // Project Details Modal Handler
    // ----------------------------------------------------
    const modal = document.getElementById('project-modal');
    const modalClose = document.getElementById('modal-close');
    const modalBody = document.getElementById('modal-body-content');
    const exploreButtons = document.querySelectorAll('.explore-project');

    // Data Store for Modal details
    const projectsDetailsData = {
        "1": {
            title: "AI Skin Injury Classifier",
            category: "AI & Machine Learning",
            problem: "Detecting skin lesions and classifying them early is critical, but access to expert assessments can be slow. Existing mobile detectors often lack accuracy and prediction transparency.",
            solution: "Developed an AI-powered classifier leveraging the HAM10000 dataset and EfficientNetB0 classification model weights, incorporating explainable AI overlays in the UI.",
            architecture: `[Skin Lesion Image] ---> [EfficientNetB0 Core Network]
                                                  |
                                                  v
[Explainable AI Heatmap] <--- [Grad-CAM Layer Predictions]`,
            results: [
                "Analyzed and trained model using the HAM10000 dermatological dataset.",
                "Deployed explainable AI (XAI) overlays to enhance user and medical trust.",
                "Optimized model size and resource usage for responsive mobile runtime."
            ],
            stack: ["Python", "EfficientNetB0", "Machine Learning", "Explainable AI", "Flutter"]
        },
        "2": {
            title: "Travel Ginnie Guide",
            category: "Web & Mobile",
            problem: "Itinerary planning across unfamiliar routes and budgets is tedious and time-consuming, requiring extensive manual searches across isolated platforms.",
            solution: "Designed a smart travel assistant utilizing Natural Language Processing (NLP) and recommendation model workflows to plan custom, budget-optimized trips.",
            architecture: `[Natural Language Query] ---> [NLP Tokenizer & Intent Parser]
                                                              |
                                                              v
[Optimized Itinerary Plan] <--- [Proximity Recommendation Matrix]`,
            results: [
                "Built personalized suggestions matching interests and locations.",
                "Implemented dynamic budget parser optimizing spending paths.",
                "Designed system to handle user query anomalies under high latency."
            ],
            stack: ["Python", "NLP", "Machine Learning", "Recommendation Algorithms"]
        },
        "3": {
            title: "Ambulance Siren App",
            category: "Systems & Prototyping",
            problem: "Delayed situational awareness of approaching emergency vehicles in dense traffic gridlocks leads to blocked paths and lost time.",
            solution: "Developed a real-time siren detection app using Python and Machine Learning to classify emergency sirens and broadcast proximity warnings.",
            architecture: `[Audio Stream Input] ---> [Spectrogram Feature Extractor]
                                                             |
                                                             v
[Nearby Road Users Alert] <--- [Proximity Match & Geofence Warning (100m)]`,
            results: [
                "Achieved robust audio classification matching siren sound waves.",
                "Implemented warning broadcast system operating in 100m threshold.",
                "Enhanced traffic clearing response for smoother emergency passage."
            ],
            stack: ["Python", "Machine Learning", "Audio Processing", "IoT Integration"]
        }
    };

    const openModal = (projectId) => {
        const data = projectsDetailsData[projectId];
        if (!data) return;

        // Render contents
        let stackBadges = data.stack.map(s => `<span class="tag">${s}</span>`).join('');
        let resultsList = data.results.map(r => `<li>${r}</li>`).join('');

        modalBody.innerHTML = `
            <span class="modal-category">${data.category}</span>
            <h2>${data.title}</h2>
            <div class="section-line" style="margin: 10px 0 24px;"></div>
            
            <div class="modal-section">
                <h3>The Challenge</h3>
                <p>${data.problem}</p>
            </div>
            
            <div class="modal-section">
                <h3>The Solution</h3>
                <p>${data.solution}</p>
            </div>
            
            <div class="modal-section">
                <h3>System Architecture</h3>
                <div class="modal-architecture-diagram">
                    <pre><code>${data.architecture}</code></pre>
                </div>
            </div>
            
            <div class="modal-section">
                <h3>Key Results & Impact</h3>
                <ul>${resultsList}</ul>
            </div>
            
            <div class="modal-section">
                <h3>Technology Stack</h3>
                <div class="project-tags">${stackBadges}</div>
            </div>
        `;

        modal.classList.add('open');
        document.body.style.overflow = 'hidden'; // Lock background scroll
    };

    const closeModal = () => {
        modal.classList.remove('open');
        document.body.style.overflow = 'auto'; // Re-enable scroll
    };

    exploreButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const pId = btn.getAttribute('data-project-id');
            openModal(pId);
        });
    });

    modalClose.addEventListener('click', closeModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });

    // ----------------------------------------------------
    // Contact Form Submission Handler
    // ----------------------------------------------------
    const contactForm = document.getElementById('contact-form');
    const successMsg = document.getElementById('form-success');

    if (contactForm) {
        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = contactForm.querySelector('.btn-submit');
            const originalBtnText = submitBtn.innerHTML;

            const name    = document.getElementById('name').value.trim();
            const email   = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            submitBtn.disabled = true;
            submitBtn.innerHTML = `<span>Sending...</span> <div class="spinner"></div>`;

            if (!document.getElementById('spinner-style')) {
                const style = document.createElement('style');
                style.id = 'spinner-style';
                style.innerHTML = `
                    .spinner {
                        border: 2px solid rgba(255,255,255,0.3);
                        border-radius: 50%;
                        border-top: 2px solid white;
                        width: 16px; height: 16px;
                        animation: spin 1s linear infinite;
                        display: inline-block;
                        margin-left: 8px;
                    }
                    @keyframes spin { 0%{transform:rotate(0deg);} 100%{transform:rotate(360deg);} }
                    .error-message {
                        display: none;
                        margin-top: 16px;
                        padding: 16px 20px;
                        background: rgba(255,80,80,0.1);
                        border: 1px solid rgba(255,80,80,0.4);
                        border-radius: 8px;
                        color: #ff6b6b;
                        font-size: 0.95rem;
                    }
                `;
                document.head.appendChild(style);
            }

            let errorMsg = document.getElementById('form-error');
            if (!errorMsg) {
                errorMsg = document.createElement('div');
                errorMsg.id = 'form-error';
                errorMsg.className = 'error-message';
                contactForm.appendChild(errorMsg);
            }
            errorMsg.style.display = 'none';

            try {
                const response = await fetch('/.netlify/functions/send-email', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ name, email, subject, message })
                });

                const result = await response.json();
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;

                if (response.ok && result.success) {
                    successMsg.style.display = 'block';
                    contactForm.reset();
                    setTimeout(() => { successMsg.style.display = 'none'; }, 5000);
                } else {
                    errorMsg.textContent = result.error || 'Something went wrong. Please try again.';
                    errorMsg.style.display = 'block';
                }
            } catch (err) {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalBtnText;
                errorMsg.textContent = 'Network error. Please check your connection and try again.';
                errorMsg.style.display = 'block';
            }
        });
    }
});
