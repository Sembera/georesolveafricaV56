// Georesolve Africa - Main JavaScript File
import { setupFormValidation, handleImageError } from './js/utils.js';
import { initializeHomePage } from './js/home.js';
import { initializeProjectsPage } from './js/projects.js';
// Import other modules as needed

// Global state management
const AppState = {
    currentPage: window.location.pathname.split('/').pop() || 'index.html',
    user: {
        preferences: JSON.parse(localStorage.getItem('georesolve_prefs') || '{}')
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
    setupScrollAnimations();
    initializeImagePlaceholders();
    initializeLazyLoading();
    initializeClientScroll();

    // Page specific init
    initializePageSpecificFeatures();
});

// Core initialization
function initializeApp() {
    setupFormValidation();
    initializeAnimations();

    // Load user preferences
    if (AppState.user.preferences.theme) {
        document.body.classList.add(`theme-${AppState.user.preferences.theme}`);
    }
}

// Scroll animations
function setupScrollAnimations() {
    // Enable animations only if we reach this point
    document.body.classList.add('animation-ready');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');

                if (entry.target.classList.contains('progress-bar')) {
                    animateProgressBar(entry.target);
                }
            }
        });
    }, observerOptions);

    // Observe all animatable elements
    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}

function animateProgressBar(element) {
    const progress = element.dataset.progress;
    element.style.width = `${progress}%`;
}

// Animation initialization (Hero, etc global animations)
function initializeAnimations() {
    if (typeof anime === 'undefined') return;

    // Initialize Anime.js animations if hero exists
    if (document.querySelector('.hero-title')) {
        anime.timeline({
            easing: 'easeOutExpo',
            duration: 750
        })
            .add({
                targets: '.hero-title',
                translateY: [60, 0],
                opacity: [0, 1],
                delay: 300
            })
            .add({
                targets: '.hero-subtitle',
                translateY: [40, 0],
                opacity: [0, 1],
                delay: 100
            }, '-=500')
            .add({
                targets: '.hero-cta',
                translateY: [20, 0],
                opacity: [0, 1],
                delay: 100
            }, '-=400');
    }
}

// Initialize page-specific features
async function initializePageSpecificFeatures() {
    const page = AppState.currentPage;

    if (page === 'index.html' || page === '') {
        initializeHomePage();
    } else if (page.includes('projects.html')) {
        // Load projects data dynamically or from global if script loaded
        // For now, assuming projects-data.js puts it in window.projectsData or we fetch it
        // Simulating fetch or local import if we had a bundler. 
        // Since we don't have a bundler, we might rely on <script src="projects-data.js">
        const projectsData = window.projectsData || [];
        initializeProjectsPage(projectsData);
    }
    // Add other cases as needed
}

// Image placeholder and error handling
function initializeImagePlaceholders() {
    const images = document.querySelectorAll('img[data-placeholder]');

    images.forEach(img => {
        const placeholderText = img.dataset.placeholder || 'Image';

        img.addEventListener('error', () => {
            handleImageError(img, placeholderText);
        });

        img.addEventListener('load', () => {
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        });
    });
}

// Lazy loading for images
function initializeLazyLoading() {
    if ('loading' in HTMLImageElement.prototype) {
        // Native lazy loading supported
        const images = document.querySelectorAll('img[loading="lazy"]');
        images.forEach(img => {
            if (img.dataset.src) {
                img.src = img.dataset.src;
            }
        });
    } else {
        // Fallback for older browsers
        // ... (Simplified for brevity, or include polyfill logic)
    }
}

// Initialize client scrolling animation
function initializeClientScroll() {
    const clientsGrid = document.querySelector('.clients-grid');
    if (!clientsGrid) return;

    // Clone all client cards to create infinite scroll effect
    const clientCards = Array.from(clientsGrid.children);
    clientCards.forEach(card => {
        const clone = card.cloneNode(true);
        clientsGrid.appendChild(clone);
    });

    // Add animation class
    clientsGrid.classList.add('animate-scroll');
}