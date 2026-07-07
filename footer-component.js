// GeoResolve Footer and Clients Section Component
// Auto-inject footer and clients if they don't exist on the page

document.addEventListener('DOMContentLoaded', function () {
    if (!document.querySelector('.footer')) {
        injectFooter();
    }

    if (!document.querySelector('.clients-section') && !window.location.pathname.includes('contact')) {
        injectClients();
    }
});

function injectClients() {
    const clientsHTML = `
    <!-- Clients Section -->
    <section class="clients-section">
        <div class="container">
            <div class="section-header animate-on-scroll">
                <h2 class="section-title">Trusted by Leading Organizations</h2>
                <p class="section-subtitle">GeoResolve partners with government agencies, consulting firms, and private sector clients across East Africa</p>
            </div>
    
            <div class="clients-grid animate-scroll">
                <div class="client-card"><img src="resources/Clients/zv-consulting.png" alt="ZV Consulting Ltd" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/atc-uganda.png" alt="ATC Uganda" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/ministry-energy-uganda.png" alt="Ministry of Energy" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/fichtner.png" alt="Fichtner GmbH" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/Artelia.png" alt="Artelia" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/Aecom.png" alt="Aecom" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/Songa.png" alt="Songa Energy" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/virunga-power.png" alt="Virunga Power" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/anzana-electric.png" alt="Anzana Electric Group" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/MBW.png" alt="MBW Consulting" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/razel-bec.png" alt="Razel-Bec" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/Tectoni.png" alt="Tectoni Africa" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/RSV.png" alt="RSV Engineering" class="client-logo" loading="lazy"></div>
                <div class="client-card"><img src="resources/Clients/paraa.png" alt="Paraa Safari Lodge" class="client-logo" loading="lazy"></div>
            </div>
        </div>
    </section>
    `;

    const scripts = document.querySelectorAll('script');
    if (scripts.length > 0) {
        scripts[scripts.length - 1].insertAdjacentHTML('beforebegin', clientsHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', clientsHTML);
    }
}

function injectFooter() {
    const footerHTML = `
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>GeoResolve</h3>
                    <p class="footer-tagline">Data-Driven, Research-Based</p>
                    <p>Premier geoscience consulting firm providing expert geophysical, geotechnical, mineral exploration, drilling, GIS, and drone survey services across Uganda, Rwanda, Burundi, and East Africa.</p>
                    <div class="footer-social">
                        <a href="mailto:info@georesolveafrica.com" class="social-link" aria-label="Email">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                        </a>
                    </div>
                </div>
                <div class="footer-section">
                    <h3>Services</h3>
                    <ul class="footer-links">
                        <li><a href="methods.html#geophysics">Geophysical Surveys</a></li>
                        <li><a href="methods.html#mining">Mining & Exploration</a></li>
                        <li><a href="methods.html#geotechnical">Geotechnical Engineering</a></li>
                        <li><a href="methods.html#drilling">Drilling Services</a></li>
                        <li><a href="methods.html#geospatial">Geospatial Services</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Free Tools</h3>
                    <ul class="footer-links">
                        <li><a href="g-resolog.html">G-Resolog</a></li>
                        <li><a href="g-resconvt.html">G-Resconvt</a></li>
                        <li><a href="g-geopylanner.html">G-Geopylanner</a></li>
                        <li><a href="g-flightplanner.html">G-FlightPlanner</a></li>
                        <li><a href="projects.html">Projects</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <ul class="footer-contact-simple" style="list-style: none; padding: 0;">
                        <li style="margin-bottom: 1rem;"><strong style="display: block; color: var(--secondary-color); margin-bottom: 0.25rem;">Head Office:</strong>Kasangati, Uganda<br>HMK Building, Gayaza Road</li>
                        <li style="margin-bottom: 1rem;"><strong style="display: block; color: var(--secondary-color); margin-bottom: 0.25rem;">Phone:</strong>+256 771 999 614<br>+256 772 876 300</li>
                        <li style="margin-bottom: 1rem;"><strong style="display: block; color: var(--secondary-color); margin-bottom: 0.25rem;">Email:</strong><a href="mailto:info@georesolveafrica.com">info@georesolveafrica.com</a></li>
                        <li style="margin-bottom: 1rem;"><strong style="display: block; color: var(--secondary-color); margin-bottom: 0.25rem;">Hours:</strong>Mon-Fri: 8:00 AM - 6:00 PM</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p>&copy; 2026 GeoResolve. All rights reserved.</p>
                    <div class="footer-bottom-links">
                        <a href="contact.html">Privacy Policy</a>
                        <a href="contact.html">Terms of Service</a>
                        <a href="contact.html">Contact</a>
                    </div>
                    <p class="footer-location">Serving Uganda, Rwanda, Burundi, DRC, South Sudan & East Africa</p>
                </div>
            </div>
        </div>
    </footer>
    `;

    document.body.insertAdjacentHTML('beforeend', footerHTML);
}
