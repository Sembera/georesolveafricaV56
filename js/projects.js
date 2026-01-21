// Projects Page Logic

// State for filtering
const ProjectsState = {
    projects: [],
    filters: {
        sector: 'all',
        status: 'all',
        search: ''
    }
};

export function initializeProjectsPage(projectsData) {
    ProjectsState.projects = projectsData || [];
    setupProjectFilters();
    initializeProjectGrid();
    setupProjectSearch();

    // Initial render
    filterProjects();
}

function initializeProjectGrid() {
    // Logic to render initial grid if empty, or just rely on static HTML + filtering
    // For now assuming static HTML exists or is hydrated
}

function setupProjectFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');

    filterButtons.forEach(button => {
        button.addEventListener('click', function () {
            const filterType = this.dataset.filter;
            const filterValue = this.dataset.value;

            // Update active state
            const siblingButtons = this.parentNode.querySelectorAll('.filter-btn');
            siblingButtons.forEach(btn => btn.classList.remove('active'));
            this.classList.add('active');

            // Update filter state
            ProjectsState.filters[filterType] = filterValue;

            // Filter projects
            filterProjects();
        });
    });
}

function setupProjectSearch() {
    const searchInput = document.querySelector('.project-search');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        ProjectsState.filters.search = this.value.toLowerCase();
        filterProjects();
    });
}

function filterProjects() {
    const { sector, status, search } = ProjectsState.filters;
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const cardSector = card.dataset.sector;
        const cardStatus = card.dataset.status;
        const cardTitle = card.querySelector('.project-title')?.textContent.toLowerCase() || '';

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
            if (typeof anime !== 'undefined') {
                anime({
                    targets: card,
                    opacity: [0, 1],
                    scale: [0.8, 1],
                    duration: 300,
                    easing: 'easeOutQuad'
                });
            } else {
                card.style.opacity = 1;
            }
        } else {
            if (typeof anime !== 'undefined') {
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
            } else {
                card.style.display = 'none';
            }
        }
    });
}
