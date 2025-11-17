// ==========================================
// VALENTINO VALERO PORTFOLIO - INTERACTIONS
// ==========================================

// ==========================================
// CUSTOM CURSOR
// ==========================================

// Initialize cursor after DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const cursorDot = document.querySelector('[data-cursor-dot]');
    const cursorOutline = document.querySelector('[data-cursor-outline]');

    // Check if elements exist
    if (!cursorDot || !cursorOutline) {
        console.warn('Cursor elements not found');
        return;
    }

    let mouseX = 0;
    let mouseY = 0;
    let outlineX = 0;
    let outlineY = 0;

    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Update dot position immediately (snappy)
        cursorDot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    });

    // Smooth follow effect for outline
    function animateCursorOutline() {
        // Lag effect - outline catches up to mouse
        outlineX += (mouseX - outlineX) * 0.3;
        outlineY += (mouseY - outlineY) * 0.3;

        cursorOutline.style.transform = `translate(${outlineX - 20}px, ${outlineY - 20}px)`;

        requestAnimationFrame(animateCursorOutline);
    }

    animateCursorOutline();

    // Add hover effect on interactive elements
    const hoverElements = document.querySelectorAll('a, button, .project-card, .info-card, .skill-card, .contact-card, .tag, .tag-small, input, textarea, select');

    hoverElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            cursorOutline.classList.add('cursor-hover');
        });

        element.addEventListener('mouseleave', () => {
            cursorOutline.classList.remove('cursor-hover');
        });
    });

    // Random glitch effect on cursor
    setInterval(() => {
        if (Math.random() > 0.95) {
            cursorDot.classList.add('cursor-glitch');
            setTimeout(() => {
                cursorDot.classList.remove('cursor-glitch');
            }, 300);
        }
    }, 2000);
});

// ==========================================
// CHARACTER SCRAMBLE EFFECT
// ==========================================

// Track active scramblers to prevent conflicts
const activeScrambles = new WeakMap();

// Character scramble effect for headers
class ScrambleText {
    constructor(element) {
        this.element = element;
        this.originalText = element.textContent;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$%^&*(){}[]<>?/|あいうえおかきくけこ';
        this.frameRequest = null;
        this.frame = 0;
        this.queue = [];
    }

    setText(text) {
        const oldText = this.element.textContent;
        const length = Math.max(oldText.length, text.length);
        this.queue = [];

        for (let i = 0; i < length; i++) {
            const from = oldText[i] || '';
            const to = text[i] || '';
            const start = Math.floor(Math.random() * 40);
            const end = start + Math.floor(Math.random() * 40);
            this.queue.push({ from, to, start, end });
        }

        cancelAnimationFrame(this.frameRequest);
        this.frame = 0;
        this.update();
    }

    update() {
        let output = '';
        let complete = 0;

        for (let i = 0, n = this.queue.length; i < n; i++) {
            let { from, to, start, end, char } = this.queue[i];

            if (this.frame >= end) {
                complete++;
                output += to;
            } else if (this.frame >= start) {
                if (!char || Math.random() < 0.28) {
                    char = this.randomChar();
                    this.queue[i].char = char;
                }
                output += char;
            } else {
                output += from;
            }
        }

        this.element.textContent = output;

        if (complete === this.queue.length) {
            // Animation complete - ensure final text is set correctly
            this.element.textContent = this.queue.map(q => q.to).join('');
            cancelAnimationFrame(this.frameRequest);
            // Remove from active scrambles
            activeScrambles.delete(this.element);
        } else {
            this.frameRequest = requestAnimationFrame(() => this.update());
            this.frame++;
        }
    }

    randomChar() {
        return this.chars[Math.floor(Math.random() * this.chars.length)];
    }

    cancel() {
        cancelAnimationFrame(this.frameRequest);
        // Restore original text
        this.element.textContent = this.queue.map(q => q.to).join('');
        activeScrambles.delete(this.element);
    }
}

// Helper function to safely start a scramble
function startScramble(element, text = null) {
    // If there's already an active scramble, cancel it first
    const existingScramble = activeScrambles.get(element);
    if (existingScramble) {
        existingScramble.cancel();
    }

    // Create new scramble and track it
    const scrambler = new ScrambleText(element);
    activeScrambles.set(element, scrambler);
    scrambler.setText(text || element.textContent);
}

// Boot Screen and Build Animation
document.addEventListener('DOMContentLoaded', () => {
    const bootScreen = document.getElementById('bootScreen');

    // Add build-init classes only to above-the-fold elements
    const nav = document.querySelector('.terminal-nav');
    const hero = document.querySelector('.hero');

    nav?.classList.add('build-init');
    hero?.classList.add('build-init');

    // Hide boot screen on Enter key or click
    const hideBootScreen = () => {
        bootScreen.classList.add('hidden');
        setTimeout(() => {
            bootScreen.style.display = 'none';
            // Start build animations
            startBuildSequence();
            // Start scramble effects after boot screen hides
            initScrambleEffects();
        }, 500);
    };

    // Build animation sequence (only for above-the-fold content)
    function startBuildSequence() {
        // Animate nav immediately
        setTimeout(() => {
            nav?.classList.add('build-active');
        }, 100);

        // Animate hero
        setTimeout(() => {
            hero?.classList.add('build-active');
            // Make sure hero is visible so child animations work
            if (hero) hero.style.opacity = '1';
        }, 300);
    }

    // Listen for Enter key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !bootScreen.classList.contains('hidden')) {
            hideBootScreen();
        }
    });

    // Listen for click
    bootScreen.addEventListener('click', hideBootScreen);

    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (!bootScreen.classList.contains('hidden')) {
            hideBootScreen();
        }
    }, 5000);
});

// Initialize scramble effects on headers
function initScrambleEffects() {
    // Initial scramble on hero title
    const heroTitleLines = document.querySelectorAll('.hero-title .title-line');
    heroTitleLines.forEach((line, index) => {
        setTimeout(() => {
            startScramble(line);
        }, index * 200);
    });

    // Set up random scrambling for all headers
    const scrambableElements = [
        ...document.querySelectorAll('.hero-title .title-line'),
        ...document.querySelectorAll('.section-title .title-en'),
        ...document.querySelectorAll('.nav-link')
    ];

    // Random scramble effect - picks random header every 3-6 seconds
    function randomScramble() {
        if (scrambableElements.length > 0 && Math.random() > 0.3) {
            const randomElement = scrambableElements[Math.floor(Math.random() * scrambableElements.length)];
            startScramble(randomElement);
        }
    }

    // Trigger random scrambles at intervals
    setInterval(() => {
        randomScramble();
    }, Math.random() * 3000 + 2000); // Random interval between 2-5 seconds

    // Also scramble on hover for nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            startScramble(this);
        });
    });
}

// Smooth scroll for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Random glitch effects now handled in initScrambleEffects()

// Cursor typing effect in contact section
const contactPrompt = document.querySelector('.terminal-prompt');
if (contactPrompt) {
    const messages = [
        'SEND_MESSAGE',
        'COLLABORATE',
        'GET_IN_TOUCH',
        'START_PROJECT',
        'メッセージを送る'
    ];
    let currentMessageIndex = 0;
    let currentCharIndex = 0;
    let isDeleting = false;

    function typeEffect() {
        const currentMessage = messages[currentMessageIndex];
        const cursorSpan = contactPrompt.querySelector('.cursor-text');

        if (!isDeleting && currentCharIndex < currentMessage.length) {
            cursorSpan.textContent = currentMessage.substring(0, currentCharIndex + 1) + '_';
            currentCharIndex++;
            setTimeout(typeEffect, 100);
        } else if (isDeleting && currentCharIndex > 0) {
            cursorSpan.textContent = currentMessage.substring(0, currentCharIndex - 1) + '_';
            currentCharIndex--;
            setTimeout(typeEffect, 50);
        } else if (!isDeleting && currentCharIndex === currentMessage.length) {
            setTimeout(() => {
                isDeleting = true;
                typeEffect();
            }, 2000);
        } else if (isDeleting && currentCharIndex === 0) {
            isDeleting = false;
            currentMessageIndex = (currentMessageIndex + 1) % messages.length;
            setTimeout(typeEffect, 500);
        }
    }

    setTimeout(typeEffect, 1000);
}

// Project cards hover effect enhancement
const projectCards = document.querySelectorAll('.project-card');

projectCards.forEach(card => {
    card.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-5px) scale(1.02)';
    });

    card.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Parallax effect on scroll
let lastScrollY = window.scrollY;

window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const hero = document.querySelector('.hero');

    if (hero) {
        const heroContent = hero.querySelector('.hero-content');
        if (heroContent && scrollY < window.innerHeight) {
            heroContent.style.transform = `translateY(${scrollY * 0.3}px)`;
            heroContent.style.opacity = 1 - (scrollY / window.innerHeight);
        }
    }

    lastScrollY = scrollY;
});

// Add glitch effect on hover for certain elements
const glitchHoverElements = document.querySelectorAll('.nav-logo, .section-title .title-en');

glitchHoverElements.forEach(element => {
    element.addEventListener('mouseenter', function() {
        this.style.animation = 'glitch-anim-1 0.3s infinite';
    });

    element.addEventListener('mouseleave', function() {
        this.style.animation = '';
    });
});

// Terminal box typing effect
const terminalContents = document.querySelectorAll('.terminal-content');

const observerOptions = {
    threshold: 0.5,
    rootMargin: '0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '0';
            setTimeout(() => {
                entry.target.style.transition = 'opacity 0.5s ease';
                entry.target.style.opacity = '1';
            }, 200);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

terminalContents.forEach(content => {
    observer.observe(content);
});

// Random scan line effect
function createScanLine() {
    const scanLine = document.createElement('div');
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim();
    scanLine.style.position = 'fixed';
    scanLine.style.top = '0';
    scanLine.style.left = '0';
    scanLine.style.width = '100%';
    scanLine.style.height = '2px';
    scanLine.style.background = accentColor;
    scanLine.style.opacity = '0.5';
    scanLine.style.zIndex = '9997';
    scanLine.style.pointerEvents = 'none';
    document.body.appendChild(scanLine);

    let pos = 0;
    const animate = () => {
        pos += 5;
        scanLine.style.transform = `translateY(${pos}px)`;

        if (pos < window.innerHeight) {
            requestAnimationFrame(animate);
        } else {
            scanLine.remove();
        }
    };

    animate();
}

// Trigger scan line randomly
setInterval(() => {
    if (Math.random() > 0.9) {
        createScanLine();
    }
}, 5000);

// Enhanced glitchy matrix background effect
const canvas = document.createElement('canvas');
canvas.style.position = 'fixed';
canvas.style.top = '0';
canvas.style.left = '0';
canvas.style.width = '100%';
canvas.style.height = '100%';
canvas.style.pointerEvents = 'none';
canvas.style.zIndex = '0';
canvas.style.opacity = '0.25';
// Force canvas into its own GPU layer to prevent distortion from parent transforms
canvas.style.transform = 'translateZ(0)';
canvas.style.willChange = 'opacity';
canvas.style.backfaceVisibility = 'hidden';
document.body.prepend(canvas);

const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*(){}[]<>?/|あいうえおかきくけこデザインシステム';
const fontSize = 16;
const columns = canvas.width / fontSize;
const drops = Array(Math.floor(columns)).fill(1);
const glitchColumns = new Set();

// Randomly select columns to glitch
function updateGlitchColumns() {
    glitchColumns.clear();
    const numGlitchColumns = Math.floor(columns * 0.1); // 10% of columns glitch
    for (let i = 0; i < numGlitchColumns; i++) {
        glitchColumns.add(Math.floor(Math.random() * columns));
    }
}

updateGlitchColumns();
setInterval(updateGlitchColumns, 2000); // Update glitch columns every 2 seconds

function drawMatrix() {
    // Get current accent color from CSS variable
    const accentColor = getComputedStyle(document.documentElement).getPropertyValue('--color-red').trim();

    // Convert hex to RGB
    const hexToRgb = (hex) => {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 255, g: 0, b: 0 };
    };

    const rgb = hexToRgb(accentColor);

    ctx.fillStyle = 'rgba(0, 0, 0, 0.08)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < drops.length; i++) {
        const text = chars[Math.floor(Math.random() * chars.length)];

        // Glitch effect - some columns flicker colors
        if (glitchColumns.has(i)) {
            // Glitchy columns - random color between accent and white
            const glitchRandom = Math.random();
            if (glitchRandom > 0.7) {
                ctx.fillStyle = '#ffffff';
            } else if (glitchRandom > 0.4) {
                ctx.fillStyle = accentColor;
            } else {
                ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.5)`;
            }

            // Occasionally skip or double characters for glitch effect
            if (Math.random() > 0.7) {
                ctx.font = `${fontSize * (Math.random() > 0.5 ? 1.5 : 0.7)}px monospace`;
            } else {
                ctx.font = fontSize + 'px monospace';
            }
        } else {
            // Normal columns - accent color with varying opacity
            const opacity = Math.random() * 0.5 + 0.5;
            ctx.fillStyle = `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${opacity})`;
            ctx.font = fontSize + 'px monospace';
        }

        ctx.fillText(text, i * fontSize, drops[i] * fontSize);

        // Random reset with glitch effect
        if (drops[i] * fontSize > canvas.height) {
            if (Math.random() > 0.95) {
                drops[i] = 0;
            }
        }

        // Variable drop speed for glitchy effect
        if (glitchColumns.has(i) && Math.random() > 0.5) {
            drops[i] += Math.random() > 0.5 ? 2 : 0.5; // Fast or slow glitch
        } else {
            drops[i]++;
        }
    }
}

setInterval(drawMatrix, 40);

// Resize canvas on window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

// Console Easter egg
console.log('%c> SYSTEM INITIALIZED', 'color: #ff0000; font-family: monospace; font-size: 14px;');
console.log('%c> VALENTINO VALERO PORTFOLIO v1.0.0', 'color: #ffffff; font-family: monospace; font-size: 12px;');
console.log('%c> UI/UX DESIGNER', 'color: #ffffff; font-family: monospace; font-size: 12px;');
console.log('%c> ポートフォリオ・システム起動完了', 'color: #ff0000; font-family: monospace; font-size: 12px;');
console.log('%c> Looking for a designer? Let\'s talk!', 'color: #ffffff; font-family: monospace; font-size: 12px;');

// ==========================================
// SECRET COLOR PALETTE SWITCHER
// ==========================================

const navLogo = document.querySelector('.nav-logo');
if (navLogo) {
    const palettes = [
        { name: 'RED', color: '#ff0000' },      // Default red
        { name: 'GREEN', color: '#00ff00' },    // Matrix green
        { name: 'CYAN', color: '#00ffff' },     // Cyberpunk cyan
        { name: 'PURPLE', color: '#ff00ff' },   // Vaporwave magenta
        { name: 'ORANGE', color: '#ff6600' },   // Orange
        { name: 'BLUE', color: '#0066ff' }      // Electric blue
    ];

    let currentPalette = 0;

    navLogo.addEventListener('click', function(e) {
        e.preventDefault();

        // Cycle to next palette
        currentPalette = (currentPalette + 1) % palettes.length;
        const newColor = palettes[currentPalette].color;

        // Surge matrix opacity during glitch
        const originalOpacity = canvas.style.opacity;
        canvas.style.opacity = '0.6';

        setTimeout(() => {
            canvas.style.transition = 'opacity 0.5s ease-out';
            canvas.style.opacity = originalOpacity;
            setTimeout(() => {
                canvas.style.transition = '';
            }, 500);
        }, 100);

        // Add glitch effect to all content elements (not body, to avoid affecting canvas)
        const glitchTargets = document.querySelectorAll('.terminal-nav, .hero, section, footer');
        glitchTargets.forEach(el => el.classList.add('palette-switch-glitch'));
        setTimeout(() => {
            glitchTargets.forEach(el => el.classList.remove('palette-switch-glitch'));
        }, 400);

        // Change the CSS variable
        document.documentElement.style.setProperty('--color-red', newColor);

        // Also update RGB variables for rgba() usage
        const hexToRgb = (hex) => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 0, b: 0 };
        };
        const rgb = hexToRgb(newColor);
        document.documentElement.style.setProperty('--accent-r', rgb.r);
        document.documentElement.style.setProperty('--accent-g', rgb.g);
        document.documentElement.style.setProperty('--accent-b', rgb.b);

        // Trigger scramble effect on all text elements
        const scrambableElements = [
            ...document.querySelectorAll('.hero-title .title-line'),
            ...document.querySelectorAll('.section-title .title-en'),
            ...document.querySelectorAll('.nav-link'),
            ...document.querySelectorAll('.project-title'),
            ...document.querySelectorAll('.info-card-title')
        ];

        scrambableElements.forEach((element, index) => {
            setTimeout(() => {
                startScramble(element);
            }, index * 50); // Stagger the scrambles slightly
        });

        // Console message
        console.log(`%c> PALETTE SWITCHED: ${palettes[currentPalette].name}`, `color: ${newColor}; font-family: monospace; font-size: 14px; font-weight: bold;`);
    });
}
