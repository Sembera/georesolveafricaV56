// Header Component - GeoResolve
// Auto-injects header and handles mobile menu interaction

document.addEventListener('DOMContentLoaded', function () {
    // Check if header already exists
    if (!document.querySelector('.navbar')) {
        injectHeader();
    }

    // Initialize navigation functionality
    setupNavigation();
});

function injectHeader() {
    const headerHTML = `
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <img src="resources/logo/Georesolve Logo.png" alt="GeoResolve Logo">
                <span class="logo-tagline">Data Driven, Research Based</span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li class="has-dropdown">
                    <a href="methods.html" class="nav-link">Methods <span class="dropdown-arrow">▼</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="methods.html#geophysics">Geophysics</a></li>
                        <li><a href="methods.html#geotechnical">Geotechnical</a></li>
                        <li><a href="methods.html#hydrogeology">Hydrogeology</a></li>
                        <li><a href="methods.html#drilling">Drilling</a></li>
                        <li><a href="methods.html#geospatial">Geospatial & Surveys</a></li>
                    </ul>
                </li>
                <li><a href="applications.html" class="nav-link">Applications</a></li>
                <li><a href="projects.html" class="nav-link">Projects</a></li>
                <li class="has-dropdown">
                    <a href="resources.html" class="nav-link">Resources <span class="dropdown-arrow">▼</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="g-resolog.html">G-Resolog - Borehole Logger</a></li>
                        <li><a href="g-resconvt.html">G-Resconvt - Coordinate Converter</a></li>
                        <li><a href="g-geopylanner.html">G-Geopylanner - Geophysics Survey Planner</a></li>
                    </ul>
                </li>
                <li><a href="news.html" class="nav-link">News</a></li>
                <li><a href="contact.html" class="nav-link">Contact</a></li>
            </ul>
            <div class="mobile-menu-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
        </div>
    </nav>
    `;

    document.body.insertAdjacentHTML('afterbegin', headerHTML);
}

function setupNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    // Set active link
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        const isToolPage = currentPage.includes('g-resolog') ||
            currentPage.includes('g-resconvt') ||
            currentPage.includes('g-geopylanner');

        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else if (isToolPage && href === 'resources.html') {
            link.classList.add('active');
        }
    });

    // Mobile Menu Toggle
    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', function () {
            navLinksContainer.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        // Dropdown toggle for mobile
        document.querySelectorAll('.has-dropdown > a').forEach(dropdownLabel => {
            dropdownLabel.addEventListener('click', function (e) {
                if (window.innerWidth <= 768) {
                    e.preventDefault();
                    const parent = this.parentElement;
                    parent.classList.toggle('active');

                    // Close other dropdowns
                    document.querySelectorAll('.has-dropdown').forEach(other => {
                        if (other !== parent) other.classList.remove('active');
                    });
                }
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function (e) {
            if (!navLinksContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinksContainer.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('active'));
            }
        });

        // Close menu when clicking a link (but NOT a dropdown toggle)
        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                if (!link.parentElement.classList.contains('has-dropdown') || window.innerWidth > 768) {
                    navLinksContainer.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }
}
