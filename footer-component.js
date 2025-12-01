// GeoResolve Footer and Clients Section Component
// Auto-inject footer and clients if they don't exist on the page

document.addEventListener('DOMContentLoaded', function() {
    // Check if footer already exists
    if (!document.querySelector('.footer')) {
        injectFooter();
    }

    // Check if clients section exists
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

            <div class="clients-grid animate-on-scroll">
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>ZV Consulting Ltd</p>
                        <span>Rwanda</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>ATC Uganda</p>
                        <span>Uganda</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Ministry of Energy - Uganda</p>
                        <span>Government</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Fichtner GmbH</p>
                        <span>International</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Artelia / Aecom</p>
                        <span>International</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Virunga Power</p>
                        <span>Energy</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Anzana Electric Group</p>
                        <span>Energy</span>
                    </div>
                </div>
                <div class="client-card">
                    <div class="client-logo-placeholder">
                        <p>Mpanga Renewable Energies</p>
                        <span>Energy</span>
                    </div>
                </div>
            </div>
        </div>
    </section>
    `;

    // Insert before the last script tag or before body closing tag
    const scripts = document.querySelectorAll('script');
    if (scripts.length > 0) {
        scripts[scripts.length - 1].insertAdjacentHTML('beforebegin', clientsHTML);
    } else {
        document.body.insertAdjacentHTML('beforeend', clientsHTML);
    }
}

function injectFooter() {
    const footerHTML = `
    <!-- Footer -->
    <footer class="footer">
        <div class="container">
            <div class="footer-content">
                <div class="footer-section">
                    <h3>GeoResolve</h3>
                    <p class="footer-tagline">Data-Driven, Research-Based</p>
                    <p>Premier geoscience consulting firm providing expert geophysical, geotechnical, and hydrogeology services across Uganda, Rwanda, Burundi, and East Africa.</p>
                    <div class="footer-social">
                        <a href="#" aria-label="LinkedIn">LinkedIn</a>
                        <a href="#" aria-label="Twitter">Twitter</a>
                        <a href="#" aria-label="Email">Email</a>
                    </div>
                </div>
                <div class="footer-section">
                    <h3>Services</h3>
                    <ul class="footer-links">
                        <li><a href="methods.html#geophysics">Geophysical Surveys</a></li>
                        <li><a href="methods.html#geotechnical">Geotechnical Investigation</a></li>
                        <li><a href="methods.html#hydrogeology">Hydrogeology Studies</a></li>
                        <li><a href="methods.html#drilling">Drilling Services</a></li>
                        <li><a href="methods.html#geospatial">Geospatial Services</a></li>
                        <li><a href="methods.html#surveys">Topographic Surveys</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Resources</h3>
                    <ul class="footer-links">
                        <li><a href="g-resolog.html">G-ResoLog</a></li>
                        <li><a href="g-resconvt.html">G-ResConvt</a></li>
                        <li><a href="g-geopylanner.html">G-GeoPyLanner</a></li>
                        <li><a href="resources.html">All Tools</a></li>
                        <li><a href="news.html">News & Updates</a></li>
                        <li><a href="projects.html">Projects</a></li>
                    </ul>
                </div>
                <div class="footer-section">
                    <h3>Contact</h3>
                    <ul class="footer-contact">
                        <li><strong>Head Office:</strong><br>Kasangati, Uganda<br>HMK Building, Gayaza Road</li>
                        <li><strong>Phone:</strong><br>+256 771 999 614<br>+256 772 876 300</li>
                        <li><strong>Email:</strong><br><a href="mailto:info@georesolveafrica.com">info@georesolveafrica.com</a></li>
                        <li><strong>Hours:</strong><br>Mon-Fri: 8:00 AM - 6:00 PM<br>Sat: 9:00 AM - 2:00 PM</li>
                    </ul>
                </div>
            </div>
            <div class="footer-bottom">
                <div class="footer-bottom-content">
                    <p>&copy; 2025 GeoResolve. All rights reserved.</p>
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
