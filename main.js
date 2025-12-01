// Georesolve Africa - Main JavaScript File
// Interactive functionality for geoscience consulting website

// Global state management
const AppState = {
    currentPage: window.location.pathname.split('/').pop() || 'index.html',
    filters: {
        projects: { sector: 'all', status: 'all', search: '' },
        news: { category: 'all', search: '' },
        resources: { type: 'all' }
    },
    data: {
        projects: [],
        news: [],
        methods: [],
        tools: []
    },
    user: {
        preferences: JSON.parse(localStorage.getItem('georesolve_prefs') || '{}')
    }
};

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
    setupNavigation();
    setupScrollAnimations();
    initializeImagePlaceholders();
    initializeLazyLoading();
    initializePageSpecificFeatures();
    initializeClientScroll();
});

// Core initialization
function initializeApp() {
    loadAppData();
    setupMobileMenu();
    setupFormValidation();
    initializeAnimations();
    
    // Load user preferences
    if (AppState.user.preferences.theme) {
        document.body.classList.add(`theme-${AppState.user.preferences.theme}`);
    }
}

// Navigation functionality
function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
        
        link.addEventListener('click', function(e) {
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

// Mobile menu functionality
function setupMobileMenu() {
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (mobileToggle && mobileMenu) {
        mobileToggle.addEventListener('click', function() {
            mobileMenu.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });
        
        // Close mobile menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!mobileMenu.contains(e.target) && !mobileToggle.contains(e.target)) {
                mobileMenu.classList.remove('active');
                mobileToggle.classList.remove('active');
            }
        });
    }
}

// Scroll animations
function setupScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                
                // Trigger specific animations based on element type
                if (entry.target.classList.contains('counter')) {
                    animateCounter(entry.target);
                }
                
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

// Counter animation
function animateCounter(element) {
    const target = parseInt(element.dataset.target);
    const duration = 2000;
    const increment = target / (duration / 16);
    let current = 0;
    
    const timer = setInterval(() => {
        current += increment;
        if (current >= target) {
            current = target;
            clearInterval(timer);
        }
        element.textContent = Math.floor(current);
    }, 16);
}

// Progress bar animation
function animateProgressBar(element) {
    const progress = element.dataset.progress;
    element.style.width = `${progress}%`;
}

// Form validation
function setupFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            if (validateForm(form)) {
                handleFormSubmission(form);
            }
        });
        
        // Real-time validation
        const inputs = form.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateField(input);
            });
        });
    });
}

function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required], select[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!validateField(input)) {
            isValid = false;
        }
    });
    
    return isValid;
}

function validateField(field) {
    const value = field.value.trim();
    const type = field.type;
    let isValid = true;
    let message = '';
    
    // Required field validation
    if (field.hasAttribute('required') && !value) {
        isValid = false;
        message = 'This field is required';
    }
    
    // Email validation
    if (type === 'email' && value) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
            isValid = false;
            message = 'Please enter a valid email address';
        }
    }
    
    // Phone validation
    if (type === 'tel' && value) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        if (!phoneRegex.test(value.replace(/[\s\-\(\)]/g, ''))) {
            isValid = false;
            message = 'Please enter a valid phone number';
        }
    }
    
    // Update field appearance
    const errorElement = field.parentNode.querySelector('.error-message');
    if (!isValid) {
        field.classList.add('error');
        if (errorElement) {
            errorElement.textContent = message;
            errorElement.style.display = 'block';
        }
    } else {
        field.classList.remove('error');
        if (errorElement) {
            errorElement.style.display = 'none';
        }
    }
    
    return isValid;
}

function handleFormSubmission(form) {
    const formData = new FormData(form);
    const formType = form.dataset.type;
    
    // Show loading state
    const submitButton = form.querySelector('button[type="submit"]');
    const originalText = submitButton.textContent;
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;
    
    // Simulate form submission (replace with actual API call)
    setTimeout(() => {
        showNotification('Form submitted successfully!', 'success');
        form.reset();
        submitButton.textContent = originalText;
        submitButton.disabled = false;
        
        // Track form submission
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                'form_type': formType
            });
        }
    }, 1500);
}

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.classList.add('show');
    }, 100);
    
    // Remove after delay
    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 4000);
}

// Initialize page-specific features
async function initializePageSpecificFeatures() {
    const page = AppState.currentPage;
    
    // Load dynamic content from Contentful first
    await loadDynamicContent();
    
    switch (page) {
        case 'index.html':
        case '':
            initializeHomePage();
            break;
        case 'methods.html':
            initializeMethodsPage();
            break;
        case 'applications.html':
            initializeApplicationsPage();
            break;
        case 'projects.html':
            initializeProjectsPage();
            break;
        case 'resources.html':
            initializeResourcesPage();
            break;
        case 'news.html':
            initializeNewsPage();
            break;
        case 'contact.html':
            initializeContactPage();
            break;
    }
}

// Load dynamic content from Contentful
async function loadDynamicContent() {
    try {
        // Load projects data
        const projects = await contentfulClient.getProjects(20);
        AppState.data.projects = projects;
        
        // Load news articles data
        const newsArticles = await contentfulClient.getNewsArticles(10);
        AppState.data.news = newsArticles;
        
        // Load resources data
        const resources = await contentfulClient.getResources(15);
        AppState.data.resources = resources;
        
        console.log('Dynamic content loaded successfully');
    } catch (error) {
        console.log('Using fallback data for development');
        // Fallback data is already provided by ContentfulClient
    }
}

// Home page functionality
function initializeHomePage() {
    setupHeroAnimations();
    setupServiceCards();
    initializeProjectCarousel();
    setupStatsCounters();
}

function setupHeroAnimations() {
    const hero = document.querySelector('.hero-section');
    if (!hero) return;
    
    // Parallax effect for hero background
    window.addEventListener('scroll', () => {
        const scrolled = window.pageYOffset;
        const rate = scrolled * -0.5;
        hero.style.transform = `translateY(${rate}px)`;
    });
}

function setupServiceCards() {
    const serviceCards = document.querySelectorAll('.service-card');
    
    serviceCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            anime({
                targets: this,
                scale: 1.05,
                rotateY: 5,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
        
        card.addEventListener('mouseleave', function() {
            anime({
                targets: this,
                scale: 1,
                rotateY: 0,
                duration: 300,
                easing: 'easeOutQuad'
            });
        });
    });
}

function initializeProjectCarousel() {
    const carousel = document.querySelector('.project-carousel');
    if (!carousel) return;
    
    new Splide(carousel, {
        type: 'loop',
        perPage: 3,
        perMove: 1,
        gap: '2rem',
        autoplay: true,
        interval: 4000,
        breakpoints: {
            768: {
                perPage: 1
            },
            1024: {
                perPage: 2
            }
        }
    }).mount();
}

function setupStatsCounters() {
    const counters = document.querySelectorAll('.counter');
    
    counters.forEach(counter => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounter(entry.target);
                    observer.unobserve(entry.target);
                }
            });
        });
        
        observer.observe(counter);
    });
}

// Methods page functionality
function initializeMethodsPage() {
    setupMethodTabs();
    initializeMethodComparison();
}

function setupMethodTabs() {
    const tabButtons = document.querySelectorAll('.method-tab');
    const tabContents = document.querySelectorAll('.method-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const targetTab = this.dataset.tab;
            
            // Update active states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            this.classList.add('active');
            document.querySelector(`#${targetTab}`).classList.add('active');
        });
    });
}

function initializeMethodComparison() {
    const comparisonSection = document.querySelector('.comparison-section');
    if (!comparisonSection) return;

    // Initialize comparison functionality
    const methodCheckboxes = document.querySelectorAll('.method-checkbox');
    const toggleAllBtn = document.getElementById('toggleAllMethods');

    methodCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', updateMethodComparison);
    });

    // Toggle all button functionality
    if (toggleAllBtn) {
        toggleAllBtn.addEventListener('click', function() {
            const allChecked = Array.from(methodCheckboxes).every(cb => cb.checked);

            methodCheckboxes.forEach(checkbox => {
                checkbox.checked = !allChecked;
            });

            // Update button text
            this.textContent = allChecked ? 'Select All' : 'Clear All';

            // Update comparison display
            updateMethodComparison();
        });
    }

    // Initial state - show all checked methods
    updateMethodComparison();
    updateToggleButtonText();
}

function updateToggleButtonText() {
    const toggleAllBtn = document.getElementById('toggleAllMethods');
    const methodCheckboxes = document.querySelectorAll('.method-checkbox');

    if (toggleAllBtn && methodCheckboxes.length > 0) {
        const allChecked = Array.from(methodCheckboxes).every(cb => cb.checked);
        toggleAllBtn.textContent = allChecked ? 'Clear All' : 'Select All';
    }
}

function updateMethodComparison() {
    const methodCheckboxes = document.querySelectorAll('.method-checkbox');
    const methodRows = document.querySelectorAll('.method-row');

    // Get selected methods
    const selectedMethods = Array.from(methodCheckboxes)
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value);

    // Show/hide rows based on selection with animation
    methodRows.forEach(row => {
        const methodType = row.dataset.method;

        if (selectedMethods.includes(methodType)) {
            // Show row with animation
            row.classList.remove('hidden');
            anime({
                targets: row,
                opacity: [0, 1],
                translateX: [-20, 0],
                duration: 400,
                easing: 'easeOutQuad'
            });
        } else {
            // Hide row with animation
            anime({
                targets: row,
                opacity: 0,
                translateX: -20,
                duration: 300,
                easing: 'easeInQuad',
                complete: () => {
                    row.classList.add('hidden');
                }
            });
        }
    });

    // Update result count
    updateComparisonCount(selectedMethods.length);

    // Update toggle button text
    updateToggleButtonText();
}

function updateComparisonCount(count) {
    const subtitle = document.querySelector('.comparison-section .section-subtitle');
    if (!subtitle) return;

    const baseText = 'Compare different geoscience methods to select the most appropriate approach for your project';
    if (count === 0) {
        subtitle.textContent = baseText + ' - Select at least one method to compare';
        subtitle.style.color = '#e74c3c';
    } else if (count === 1) {
        subtitle.textContent = baseText + ' - Showing 1 method';
        subtitle.style.color = '#666';
    } else {
        subtitle.textContent = baseText + ` - Comparing ${count} methods`;
        subtitle.style.color = '#666';
    }
}

// Projects page functionality
function initializeProjectsPage() {
    setupProjectFilters();
    initializeProjectGrid();
    setupProjectSearch();
}

function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;
            
            // Update active state
            const siblingButtons = this.parentNode.querySelectorAll('.filter-btn');
            siblingButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');
            
            // Update filter state
            AppState.filters.projects[filterType] = filterValue;
            
            // Filter projects
            filterProjects();
        });
    });
}

function setupProjectSearch() {
    const searchInput = document.querySelector('.project-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', function() {
        AppState.filters.projects.search = this.value.toLowerCase();
        filterProjects();
    });
}

function filterProjects() {
    const { sector, status, search } = AppState.filters.projects;
    const projectCards = document.querySelectorAll('.project-card');
    
    projectCards.forEach(card => {
        const cardSector = card.dataset.sector;
        const cardStatus = card.dataset.status;
        const cardTitle = card.querySelector('.project-title').textContent.toLowerCase();
        
        let showCard = true;
        
        if (sector !== 'all' && cardSector !== sector) {
            showCard = false;
        }
        
        if (status !== 'all' && cardStatus !== status) {
            showCard = false;
        }
        
        if (search && !cardTitle.includes(search)) {
            showCard = false;
        }
        
        // Animate card visibility
        if (showCard) {
            card.style.display = 'block';
            anime({
                targets: card,
                opacity: [0, 1],
                scale: [0.8, 1],
                duration: 300,
                easing: 'easeOutQuad'
            });
        } else {
            anime({
                targets: card,
                opacity: 0,
                scale: 0.8,
                duration: 200,
                easing: 'easeInQuad',
                complete: () => {
                    card.style.display = 'none';
                }
            });
        }
    });
}

// Resources page functionality
function initializeResourcesPage() {
    setupResourceTools();
    initializeCalculators();
}

function setupResourceTools() {
    const toolCards = document.querySelectorAll('.tool-card');
    
    toolCards.forEach(card => {
        card.addEventListener('click', function() {
            const toolType = this.dataset.tool;
            openToolModal(toolType);
        });
    });
}

function openToolModal(toolType) {
    const modal = document.createElement('div');
    modal.className = 'tool-modal';
    modal.innerHTML = generateToolModal(toolType);
    
    document.body.appendChild(modal);
    
    // Setup tool-specific functionality
    switch (toolType) {
        case 'coordinate-converter':
            setupCoordinateConverter();
            break;
        case 'unit-converter':
            setupUnitConverter();
            break;
        case 'groundwater-calculator':
            setupGroundwaterCalculator();
            break;
    }
    
    // Close modal functionality
    modal.addEventListener('click', function(e) {
        if (e.target === modal || e.target.classList.contains('modal-close')) {
            document.body.removeChild(modal);
        }
    });
}

function setupCoordinateConverter() {
    const form = document.querySelector('.coordinate-form');
    if (!form) return;
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const inputType = form.querySelector('[name="input-type"]').value;
        const outputType = form.querySelector('[name="output-type"]').value;
        const inputValues = {
            lat: parseFloat(form.querySelector('[name="latitude"]').value),
            lon: parseFloat(form.querySelector('[name="longitude"]').value),
            zone: form.querySelector('[name="utm-zone"]').value,
            easting: parseFloat(form.querySelector('[name="easting"]').value),
            northing: parseFloat(form.querySelector('[name="northing"]').value)
        };
        
        const result = convertCoordinates(inputType, outputType, inputValues);
        displayConversionResult(result);
    });
}

function convertCoordinates(inputType, outputType, values) {
    // Simplified coordinate conversion
    // In production, use a proper library like proj4js
    if (inputType === 'latlong' && outputType === 'utm') {
        // Simplified UTM conversion
        const zone = Math.floor((values.lon + 180) / 6) + 1;
        const easting = 500000 + (values.lon - (zone - 1) * 6 - 3) * 111320 * Math.cos(values.lat * Math.PI / 180);
        const northing = values.lat * 110540;
        
        return {
            zone: zone,
            easting: Math.round(easting),
            northing: Math.round(northing)
        };
    }
    
    return values;
}

// News page functionality
function initializeNewsPage() {
    setupNewsFilters();
    initializeNewsGrid();
}

function setupNewsFilters() {
    const categoryFilters = document.querySelectorAll('.news-filter');
    
    categoryFilters.forEach(filter => {
        filter.addEventListener('click', function() {
            const category = this.dataset.category;
            
            // Update active state
            categoryFilters.forEach(f => f.classList.remove('active'));
            this.classList.add('active');
            
            // Filter news
            AppState.filters.news.category = category;
            filterNews();
        });
    });
}

function filterNews() {
    const { category, search } = AppState.filters.news;
    const articleCards = document.querySelectorAll('.article-card');
    
    articleCards.forEach(card => {
        const cardCategory = card.dataset.category;
        const cardTitle = card.querySelector('.article-title').textContent.toLowerCase();
        
        let showCard = true;
        
        if (category !== 'all' && cardCategory !== category) {
            showCard = false;
        }
        
        if (search && !cardTitle.includes(search)) {
            showCard = false;
        }
        
        card.style.display = showCard ? 'block' : 'none';
    });
}

// Contact page functionality
function initializeContactPage() {
    setupContactForm();
    initializeProjectEstimator();
}

function setupContactForm() {
    const contactForm = document.querySelector('.contact-form');
    if (!contactForm) return;
    
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        if (validateForm(contactForm)) {
            // Additional contact form handling
            const formData = new FormData(contactForm);
            const inquiryType = formData.get('inquiry-type');
            
            // Customize response based on inquiry type
            showNotification(`Thank you for your ${inquiryType} inquiry. We'll respond within 24 hours.`, 'success');
        }
    });
}

function initializeProjectEstimator() {
    const estimatorForm = document.querySelector('.project-estimator');
    if (!estimatorForm) return;
    
    estimatorForm.addEventListener('change', function() {
        calculateProjectEstimate();
    });
}

function calculateProjectEstimate() {
    const formData = new FormData(document.querySelector('.project-estimator'));
    const projectType = formData.get('project-type');
    const projectSize = parseInt(formData.get('project-size'));
    const timeline = parseInt(formData.get('timeline'));
    const complexity = parseInt(formData.get('complexity'));
    
    // Simplified cost calculation
    const baseCosts = {
        'geophysical': 5000,
        'geotechnical': 3000,
        'hydrogeology': 4000,
        'drilling': 8000
    };
    
    const baseCost = baseCosts[projectType] || 5000;
    const sizeMultiplier = projectSize / 100;
    const timelineMultiplier = timeline > 30 ? 1.2 : 1;
    const complexityMultiplier = complexity * 0.5;
    
    const estimate = Math.round(baseCost * sizeMultiplier * timelineMultiplier * complexityMultiplier);
    
    // Display estimate
    const estimateDisplay = document.querySelector('.cost-estimate');
    if (estimateDisplay) {
        estimateDisplay.textContent = `$${estimate.toLocaleString()} - $${Math.round(estimate * 1.3).toLocaleString()}`;
    }
}

// Animation initialization
function initializeAnimations() {
    // Initialize Anime.js animations
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

// Data loading
function loadAppData() {
    // Load project data
    fetch('resources/data/projects.json')
        .then(response => response.json())
        .then(data => {
            AppState.data.projects = data;
            if (AppState.currentPage === 'projects.html') {
                renderProjectGrid(data);
            }
        })
        .catch(error => console.error('Error loading project data:', error));
    
    // Load news data
    fetch('resources/data/news.json')
        .then(response => response.json())
        .then(data => {
            AppState.data.news = data;
            if (AppState.currentPage === 'news.html') {
                renderNewsGrid(data);
            }
        })
        .catch(error => console.error('Error loading news data:', error));
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Image placeholder and error handling
function handleImageError(img, placeholderText = 'Image') {
    const width = img.width || 300;
    const height = img.height || 200;
    const bgColor = '345363';
    const textColor = 'ffffff';
    
    img.src = `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(placeholderText)}`;
}

// Initialize image placeholders
function initializeImagePlaceholders() {
    const images = document.querySelectorAll('img[data-placeholder]');
    
    images.forEach(img => {
        const placeholderText = img.dataset.placeholder || 'Image';
        
        // Set up error handling
        img.addEventListener('error', () => {
            handleImageError(img, placeholderText);
        });
        
        // Handle successful load
        img.addEventListener('load', () => {
            // Add fade-in animation
            img.style.opacity = '0';
            img.style.transition = 'opacity 0.3s ease';
            
            setTimeout(() => {
                img.style.opacity = '1';
            }, 100);
        });
    });
}

// Generate placeholder image URL
function getPlaceholderImage(width = 300, height = 200, text = 'Image', bgColor = '345363', textColor = 'ffffff') {
    return `https://via.placeholder.com/${width}x${height}/${bgColor}/${textColor}?text=${encodeURIComponent(text)}`;
}

// Lazy loading for images
function initializeLazyLoading() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
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

// Export for global access
window.GeoresolveApp = {
    state: AppState,
    showNotification,
    debounce,
    throttle
};