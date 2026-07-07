// Header Component - GeoResolve
// Auto-injects header and handles mobile menu interaction

document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.navbar')) {
        injectHeader();
    }

    setupNavigation();
});

function injectHeader() {
    const headerHTML = `
    <!-- Navigation -->
    <nav class="navbar">
        <div class="nav-container">
            <a href="index.html" class="logo">
                <img src="resources/logo/Georesolve Logo.PNG" alt="GeoResolve Logo">
                <span class="logo-tagline">Data Driven, Research Based</span>
            </a>
            <ul class="nav-links">
                <li><a href="index.html" class="nav-link">Home</a></li>
                <li class="has-dropdown">
                    <a href="methods.html" class="nav-link">Methods <span class="dropdown-arrow">&#9662;</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="methods.html#geophysics">Geophysics</a></li>
                        <li><a href="methods.html#mining">Mining & Exploration</a></li>
                        <li><a href="methods.html#geotechnical">Geotechnical</a></li>
                        <li><a href="methods.html#drilling">Drilling</a></li>
                        <li><a href="methods.html#geospatial">Geospatial & Surveys</a></li>
                        <li class="mobile-only"><a href="methods.html" style="font-weight: 600; color: var(--accent-color);">View All Methods &rarr;</a></li>
                    </ul>
                </li>
                <li><a href="applications.html" class="nav-link">Applications</a></li>
                <li><a href="projects.html" class="nav-link">Projects</a></li>
                <li class="has-dropdown">
                    <a href="g-resolog.html" class="nav-link">Free Tools <span class="dropdown-arrow">&#9662;</span></a>
                    <ul class="dropdown-menu">
                        <li><a href="g-resolog.html">G-Resolog - Borehole Logger</a></li>
                        <li><a href="g-resconvt.html">G-Resconvt - Coordinate Converter</a></li>
                        <li><a href="g-geopylanner.html">G-Geopylanner - Geophysics Survey Planner</a></li>
                        <li><a href="g-flightplanner.html">G-FlightPlanner - Drone Mapping Planner</a></li>
                    </ul>
                </li>
                <!-- Resources & News tabs archived for improvement — files retained for later reactivation -->
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
    const toolPages = ['g-resolog.html', 'g-resconvt.html', 'g-geopylanner.html', 'g-flightplanner.html'];
    const isFreeToolPage = toolPages.some(page => currentPage === page);

    navLinks.forEach(link => {
        const href = link.getAttribute('href');

        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        } else if (isFreeToolPage && href === 'g-resolog.html') {
            link.classList.add('active');
        }
    });

    const mobileToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');

    if (mobileToggle && navLinksContainer) {
        mobileToggle.addEventListener('click', function () {
            navLinksContainer.classList.toggle('active');
            mobileToggle.classList.toggle('active');
        });

        document.querySelectorAll('.has-dropdown').forEach(dropdown => {
            const arrow = dropdown.querySelector('.dropdown-arrow');

            if (arrow) {
                arrow.addEventListener('click', function (e) {
                    if (window.innerWidth <= 768) {
                        e.preventDefault();
                        e.stopPropagation();
                        const parent = this.closest('.has-dropdown');
                        parent.classList.toggle('active');

                        document.querySelectorAll('.has-dropdown').forEach(other => {
                            if (other !== parent) other.classList.remove('active');
                        });
                    }
                });
            }
        });

        document.addEventListener('click', function (e) {
            if (!navLinksContainer.contains(e.target) && !mobileToggle.contains(e.target)) {
                navLinksContainer.classList.remove('active');
                mobileToggle.classList.remove('active');
                document.querySelectorAll('.has-dropdown').forEach(d => d.classList.remove('active'));
            }
        });

        navLinksContainer.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                if (!link.parentElement.classList.contains('has-dropdown') || window.innerWidth > 768) {
                    navLinksContainer.classList.remove('active');
                    mobileToggle.classList.remove('active');
                }
            });
        });
    }
}
