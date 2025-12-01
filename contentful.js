// Contentful CMS Integration for Georesolve Africa
// Handles dynamic content fetching and management

class ContentfulClient {
    constructor() {
        // Support both Vite and Netlify environment variables
        this.spaceId = this.getEnvVar('CONTENTFUL_SPACE_ID');
        this.accessToken = this.getEnvVar('CONTENTFUL_ACCESS_TOKEN');
        this.environment = this.getEnvVar('CONTENTFUL_ENVIRONMENT') || 'master';
        this.baseUrl = `https://graphql.contentful.com/content/v1/spaces/${this.spaceId}/environments/${this.environment}`;
    }

    // Helper to get environment variable from multiple sources
    getEnvVar(name) {
        // Try Vite-style first (for local dev)
        if (typeof import.meta !== 'undefined' && import.meta.env) {
            const viteVar = import.meta.env[`VITE_${name}`];
            if (viteVar) return viteVar;
        }

        // Try window object (Netlify injects via build)
        if (typeof window !== 'undefined' && window.ENV) {
            if (window.ENV[name]) return window.ENV[name];
        }

        // Try process.env for Node environments
        if (typeof process !== 'undefined' && process.env) {
            if (process.env[name]) return process.env[name];
        }

        return null;
    }

    // Generic GraphQL query method
    async query(query, variables = {}) {
        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.accessToken}`
                },
                body: JSON.stringify({ query, variables })
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.errors) {
                console.error('GraphQL errors:', data.errors);
                throw new Error('GraphQL query failed');
            }

            return data.data;
        } catch (error) {
            console.error('Contentful API error:', error);
            // Return fallback data for development
            return this.getFallbackData(query);
        }
    }

    // Fetch projects from Contentful
    async getProjects(limit = 10, skip = 0, category = null) {
        const query = `
            query GetProjects($limit: Int, $skip: Int, $category: String) {
                projectCollection(
                    limit: $limit
                    skip: $skip
                    ${category ? ', where: { category: $category }' : ''}
                    order: [sys_publishedAt_DESC]
                ) {
                    items {
                        sys {
                            id
                        }
                        title
                        description
                        category
                        location
                        year
                        status
                        duration
                        value
                        client
                        scope
                        results
                        image {
                            url
                            title
                        }
                        coordinates {
                            lat
                            lon
                        }
                    }
                }
            }
        `;

        const variables = { limit, skip };
        if (category) variables.category = category;

        const data = await this.query(query, variables);
        return data?.projectCollection?.items || [];
    }

    // Fetch news articles from Contentful
    async getNewsArticles(limit = 10, skip = 0, category = null) {
        const query = `
            query GetNewsArticles($limit: Int, $skip: Int, $category: String) {
                newsArticleCollection(
                    limit: $limit
                    skip: $skip
                    ${category ? ', where: { category: $category }' : ''}
                    order: [publishDate_DESC]
                ) {
                    items {
                        sys {
                            id
                        }
                        title
                        excerpt
                        content
                        category
                        publishDate
                        readTime
                        image {
                            url
                            title
                        }
                        tags
                        author {
                            name
                            title
                        }
                    }
                }
            }
        `;

        const variables = { limit, skip };
        if (category) variables.category = category;

        const data = await this.query(query, variables);
        return data?.newsArticleCollection?.items || [];
    }

    // Fetch resources from Contentful
    async getResources(limit = 20, skip = 0, type = null) {
        const query = `
            query GetResources($limit: Int, $skip: Int, $type: String) {
                resourceCollection(
                    limit: $limit
                    skip: $skip
                    ${type ? ', where: { type: $type }' : ''}
                    order: [title_ASC]
                ) {
                    items {
                        sys {
                            id
                        }
                        title
                        description
                        type
                        file {
                            url
                            fileName
                            contentType
                        }
                        image {
                            url
                            title
                        }
                        category
                        tags
                    }
                }
            }
        `;

        const variables = { limit, skip };
        if (type) variables.type = type;

        const data = await this.query(query, variables);
        return data?.resourceCollection?.items || [];
    }

    // Fetch team members from Contentful
    async getTeamMembers(limit = 20, skip = 0) {
        const query = `
            query GetTeamMembers($limit: Int, $skip: Int) {
                teamMemberCollection(
                    limit: $limit
                    skip: $skip
                    order: [name_ASC]
                ) {
                    items {
                        sys {
                            id
                        }
                        name
                        title
                        bio
                        email
                        phone
                        image {
                            url
                            title
                        }
                        specialties
                        experience
                    }
                }
            }
        `;

        const data = await this.query(query, { limit, skip });
        return data?.teamMemberCollection?.items || [];
    }

    // Get fallback data for development when Contentful is not available
    getFallbackData(query) {
        console.log('Using fallback data for development');
        
        // Check if query is for projects
        if (query.includes('projectCollection')) {
            return {
                projectCollection: {
                    items: this.getFallbackProjects()
                }
            };
        }
        
        // Check if query is for news articles
        if (query.includes('newsArticleCollection')) {
            return {
                newsArticleCollection: {
                    items: this.getFallbackNewsArticles()
                }
            };
        }
        
        // Check if query is for resources
        if (query.includes('resourceCollection')) {
            return {
                resourceCollection: {
                    items: this.getFallbackResources()
                }
            };
        }
        
        return { items: [] };
    }

    // Fallback projects data
    getFallbackProjects() {
        return [
            {
                sys: { id: '1' },
                title: 'Mombasa Port Expansion',
                description: 'Comprehensive geotechnical investigation for the expansion of East Africa\'s largest port.',
                category: 'infrastructure',
                location: 'Kenya',
                year: '2023',
                status: 'completed',
                duration: '8 months',
                value: '$2.3M savings',
                client: 'Kenya Ports Authority',
                scope: 'Geotechnical investigation, foundation design, slope stability analysis',
                results: [
                    'Optimized foundation design saving $2.3M in construction costs',
                    'Identified and mitigated potential slope stability issues',
                    'Recommended ground improvement techniques for soft marine sediments',
                    'Completed investigation 3 weeks ahead of schedule'
                ],
                image: {
                    url: 'https://kimi-web-img.moonshot.cn/img/www.massenzarigs.com/8b883c3ac7b09d93aeded5cd10a91f13df70eca2.jpg',
                    title: 'Geotechnical drilling rig'
                },
                coordinates: { lat: -4.0435, lon: 39.6682 }
            },
            {
                sys: { id: '2' },
                title: 'Lake Victoria Gold Exploration',
                description: 'Multi-phase exploration program combining geophysical surveys and geological mapping.',
                category: 'mining',
                location: 'Tanzania',
                year: '2022',
                status: 'completed',
                duration: '18 months',
                value: '450,000 oz gold resource',
                client: 'African Gold Mining Ltd',
                scope: 'Mineral exploration, geophysical surveys, resource estimation',
                results: [
                    'Identified 3 new gold prospects with economic potential',
                    'Completed 15,000m of exploration drilling',
                    'Established resource estimate of 450,000 oz gold',
                    'Reduced exploration costs by 35% through optimized program'
                ],
                image: {
                    url: 'https://kimi-web-img.moonshot.cn/img/esriaustralia.com.au/754bdef88e64139a6b5849a3f68f6af71221b2f2.png',
                    title: 'Mining exploration survey'
                },
                coordinates: { lat: -2.3333, lon: 32.8333 }
            }
        ];
    }

    // Fallback news articles data
    getFallbackNewsArticles() {
        return [
            {
                sys: { id: '1' },
                title: 'Revolutionary Geophysical Survey Uncovers Major Gold Deposits in Tanzania',
                excerpt: 'Our advanced geophysical survey techniques have led to the discovery of significant gold deposits in the Lake Victoria Goldfields.',
                content: 'Comprehensive content about the gold discovery...',
                category: 'industry',
                publishDate: '2024-12-15',
                readTime: '5 min read',
                image: {
                    url: 'https://kimi-web-img.moonshot.cn/img/esriaustralia.com.au/754bdef88e64139a6b5849a3f68f6af71221b2f2.png',
                    title: 'Gold exploration success'
                },
                tags: ['geophysics', 'gold', 'tanzania', 'discovery'],
                author: {
                    name: 'Dr. Sarah Johnson',
                    title: 'Senior Geophysicist'
                }
            }
        ];
    }

    // Fallback resources data
    getFallbackResources() {
        return [
            {
                sys: { id: '1' },
                title: 'Geological Mapping Guidelines',
                description: 'Comprehensive guide to geological mapping techniques and standards for East African geological surveys.',
                type: 'document',
                category: 'guidelines',
                tags: ['mapping', 'guidelines', 'standards'],
                file: {
                    url: '#',
                    fileName: 'geological-mapping-guide.pdf',
                    contentType: 'application/pdf'
                },
                image: {
                    url: 'https://via.placeholder.com/300x200/345363/ffffff?text=Document',
                    title: 'Geological Mapping Guidelines'
                }
            }
        ];
    }
}

// Initialize Contentful client
const contentfulClient = new ContentfulClient();

// Export for use in other modules
window.ContentfulClient = ContentfulClient;
window.contentfulClient = contentfulClient;