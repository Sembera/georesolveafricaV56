// GeoResolve Projects Page Scripts

// Initialize projects page
document.addEventListener('DOMContentLoaded', function() {
    renderProjects(projectsData);
    setupProjectFilters();
    setupProjectModal();
    initializeAnimations();
});

// Render projects
function renderProjects(projects) {
    const grid = document.getElementById('projects-grid');
    if (!grid) return;

    grid.innerHTML = '';

    if (projects.length === 0) {
        grid.innerHTML = '<div style="grid-column: 1 / -1; text-align: center; padding: 3rem; color: #666;">No projects match your search criteria.</div>';
        return;
    }

    projects.forEach(project => {
        const card = createProjectCard(project);
        grid.appendChild(card);
    });

    // Trigger animations
    setTimeout(() => {
        const cards = grid.querySelectorAll('.project-card');
        cards.forEach((card, index) => {
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, index * 50);
        });
    }, 100);
}

// Create project card
function createProjectCard(project) {
    const card = document.createElement('div');
    card.className = 'project-card animate-on-scroll';
    card.dataset.sector = project.sector;
    card.dataset.status = project.status;
    card.dataset.country = project.country;
    card.dataset.projectId = project.id;

    // Format activities for display
    const activitiesShort = project.activities.split(',').slice(0, 2).join(', ');

    card.innerHTML = `
        <div class="project-image">
            <img src="${project.image}" alt="${project.title}" onerror="this.src='https://via.placeholder.com/400x300/345363/ffffff?text=${encodeURIComponent(project.country)}'">
            <div class="project-status status-${project.status}">${project.status}</div>
            <div class="project-overlay">
                <span class="project-location">📍 ${project.country}</span>
            </div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-sector">${project.sector} • ${project.year}</div>
            <p class="project-description">${project.description}</p>
            <div class="project-meta">
                <span><strong>Client:</strong> ${project.client.split(' - ')[0].substring(0, 30)}${project.client.length > 30 ? '...' : ''}</span>
                <span><strong>Duration:</strong> ${project.duration}</span>
            </div>
            <div class="project-stats">
                <div class="stat-item">
                    <span class="stat-number">${project.country}</span>
                    <div class="stat-label">Country</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number">${project.year}</span>
                    <div class="stat-label">Year</div>
                </div>
                <div class="stat-item">
                    <span class="stat-number" style="font-size: 0.9rem; text-transform: capitalize;">${project.status}</span>
                    <div class="stat-label">Status</div>
                </div>
            </div>
            <button class="project-view" onclick="openProjectModal(${project.id})">View Details</button>
        </div>
    `;

    return card;
}

// Setup project filters
function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.querySelector('.project-search');

    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;

            // Update active state
            const siblingButtons = document.querySelectorAll(`[data-filter="${filterType}"]`);
            siblingButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Filter projects
            filterProjects();
        });
    });

    if (searchInput) {
        searchInput.addEventListener('input', function() {
            filterProjects();
        });
    }
}

// Filter projects
function filterProjects() {
    const sectorBtn = document.querySelector('.filter-btn[data-filter="sector"].active');
    const statusBtn = document.querySelector('.filter-btn[data-filter="status"].active');
    const countryBtn = document.querySelector('.filter-btn[data-filter="country"].active');
    const searchInput = document.querySelector('.project-search');

    const sectorFilter = sectorBtn ? sectorBtn.dataset.value : 'all';
    const statusFilter = statusBtn ? statusBtn.dataset.value : 'all';
    const countryFilter = countryBtn ? countryBtn.dataset.value : 'all';
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : '';

    const filteredProjects = projectsData.filter(project => {
        const matchesSector = sectorFilter === 'all' || project.sector === sectorFilter;
        const matchesStatus = statusFilter === 'all' || project.status === statusFilter;
        const matchesCountry = countryFilter === 'all' || project.country === countryFilter;
        const matchesSearch = searchTerm === '' ||
            project.title.toLowerCase().includes(searchTerm) ||
            project.country.toLowerCase().includes(searchTerm) ||
            project.description.toLowerCase().includes(searchTerm) ||
            project.client.toLowerCase().includes(searchTerm) ||
            project.activities.toLowerCase().includes(searchTerm);

        return matchesSector && matchesStatus && matchesCountry && matchesSearch;
    });

    renderProjects(filteredProjects);
}

// Setup project modal
function setupProjectModal() {
    const modal = document.getElementById('project-modal');
    const closeBtn = document.getElementById('modal-close');

    if (closeBtn) {
        closeBtn.addEventListener('click', closeProjectModal);
    }

    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                closeProjectModal();
            }
        });
    }

    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeProjectModal();
        }
    });
}

// Open project modal
function openProjectModal(projectId) {
    const project = projectsData.find(p => p.id === projectId);
    if (!project) return;

    const modal = document.getElementById('project-modal');
    const modalImage = document.getElementById('modal-image');
    const modalTitle = document.getElementById('modal-title');
    const modalMeta = document.getElementById('modal-meta');
    const modalDescription = document.getElementById('modal-description');
    const modalDetails = document.getElementById('modal-details');

    if (modalImage) {
        modalImage.src = project.image;
        modalImage.alt = project.title;
        modalImage.onerror = function() {
            this.src = `https://via.placeholder.com/800x400/345363/ffffff?text=${encodeURIComponent(project.country)}`;
        };
    }

    if (modalTitle) modalTitle.textContent = project.title;

    if (modalMeta) {
        modalMeta.innerHTML = `
            <span><strong>Sector:</strong> ${project.sector}</span>
            <span><strong>Location:</strong> ${project.country}</span>
            <span><strong>Year:</strong> ${project.year}</span>
            <span><strong>Status:</strong> ${project.status}</span>
        `;
    }

    if (modalDescription) modalDescription.textContent = project.description;

    if (modalDetails) {
        modalDetails.innerHTML = `
            <div class="detail-item">
                <h4>Duration</h4>
                <p>${project.duration}</p>
            </div>
            <div class="detail-item">
                <h4>Client</h4>
                <p>${project.client}</p>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <h4>Scope of Work</h4>
                <p>${project.scope}</p>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <h4>Activities</h4>
                <p>${project.activities}</p>
            </div>
            <div class="detail-item" style="grid-column: 1 / -1;">
                <h4>Key Results & Deliverables</h4>
                <ul style="list-style: none; margin-top: 0.5rem;">
                    ${project.results.map(result => `<li style="display: flex; align-items: flex-start; gap: 0.5rem; margin-bottom: 0.5rem;"><span style="color: var(--accent-color); margin-top: 0.2rem;">✓</span> <span>${result}</span></li>`).join('')}
                </ul>
            </div>
        `;
    }

    if (modal) {
        modal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
}

// Close project modal
function closeProjectModal() {
    const modal = document.getElementById('project-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

// Initialize animations
function initializeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    document.querySelectorAll('.animate-on-scroll').forEach(el => {
        observer.observe(el);
    });
}
