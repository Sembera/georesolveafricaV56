// GeoResolve Real Projects Data
const projectsData = [
    {
        id: 1,
        title: "Integrated Geophysical and Geotechnical Investigation for Mwogo, Rukarara, and Kavili Dam Sites",
        sector: "infrastructure",
        status: "ongoing",
        location: "Rwanda",
        country: "Rwanda",
        year: "2025",
        description: "Comprehensive geophysical investigation using Seismic Refraction (1200m) and MASW (1200m) methods for three proposed dam sites. Data correlation with geotechnical parameters for optimal dam design and foundation characterization.",
        image: "resources/projects/rwanda-dams.png",
        coordinates: [-1.9403, 29.8739],
        duration: "Oct – Nov 2025",
        client: "ZV Consulting Ltd - Rwanda",
        scope: "Geophysics (Seismic Refraction 1200m, MASW 1200m), Data correlation with geotechnical data",
        activities: "Seismic Refraction, MASW, Geotechnical Correlation",
        results: [
            "1200m of Seismic Refraction surveys completed",
            "1200m of MASW surveys for site characterization",
            "Comprehensive data correlation with geotechnical parameters",
            "Foundation design recommendations for three dam sites"
        ]
    },
    {
        id: 2,
        title: "Geotechnical Investigation for Kisinja ATC Tower Geohazard Assessment",
        sector: "infrastructure",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2025",
        description: "Geohazard assessment for the Kisinja ATC Tower using Electrical Resistivity Tomography (ERT), geological mapping, and comprehensive data correlation with drilling data. Critical infrastructure safety evaluation.",
        image: "resources/projects/kisinja.png",
        coordinates: [0.3476, 32.5825],
        duration: "Oct 2025",
        client: "ATC Uganda, CEDAT - Uganda",
        scope: "Geophysics (ERT), mapping and data correlation with drilling data",
        activities: "ERT Surveys, Geological Mapping, Drilling Data Correlation",
        results: [
            "Complete geohazard assessment for tower foundation",
            "ERT surveys revealing subsurface conditions",
            "Geological mapping of site area",
            "Safety recommendations for ATC tower construction"
        ]
    },
    {
        id: 3,
        title: "Geotechnical Investigation for Centre for Nuclear Science Technology, Soroti",
        sector: "infrastructure",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2025",
        description: "Specialized geophysical investigation for nuclear facility using 540m of Seismic Refraction for Vp (P-wave velocity) site characterization and correlation with geotechnical parameters. Critical infrastructure project.",
        image: "resources/projects/cnst-soroti.png",
        coordinates: [1.7157, 33.6111],
        duration: "Aug – Sept 2025",
        client: "Queensland And Leeds Consulting Engineers / Ministry of Energy and Mineral Development - Uganda",
        scope: "Geophysics Services: 540m of Seismic Refraction for Vp Site characterization and correlation",
        activities: "Seismic Refraction, Site Characterization, Vp Analysis",
        results: [
            "540m of Seismic Refraction surveys completed",
            "P-wave velocity characterization for nuclear facility",
            "Comprehensive site assessment for critical infrastructure",
            "Foundation design parameters delivered"
        ]
    },
    {
        id: 4,
        title: "Geological and Geotechnical Investigations for Arua Water Dam",
        sector: "water",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2025",
        description: "Comprehensive geological mapping of 5.5 km² project area combined with 1.5km of Seismic Refraction surveys for Vp site characterization. Integrated geoscience approach for major water infrastructure project.",
        image: "resources/projects/arua-dam.png",
        coordinates: [3.0197, 30.9108],
        duration: "Jun – Aug 2025",
        client: "Fichtner GmbH & Co. KG, and Tectoni Africa Ltd",
        scope: "5.5 Sq.km Geological Mapping of entire project area and 1.5km Geophysics: Seismic Refraction for Vp characterization",
        activities: "Geological Mapping, Seismic Refraction, Site Characterization",
        results: [
            "5.5 km² geological mapping completed",
            "1.5km of Seismic Refraction surveys",
            "Comprehensive site characterization for dam construction",
            "Integrated geological and geophysical data analysis"
        ]
    },
    {
        id: 5,
        title: "Geophysical Survey for Nyamwamba Flood Management Studies",
        sector: "environmental",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2025",
        description: "840m of Seismic Refraction surveys for Vp site characterization supporting flood management infrastructure in Kasese district. Critical environmental and disaster risk reduction project.",
        image: "resources/projects/nyamwamba-flood.png",
        coordinates: [0.1833, 30.0833],
        duration: "Apr – May 2025",
        client: "SGAPI Srl / RSV Engineering Group Ltd",
        scope: "Geophysics Services: 840m of Seismic Refraction for Vp Site characterization and correlation",
        activities: "Seismic Refraction, Flood Risk Assessment, Site Characterization",
        results: [
            "840m of Seismic Refraction completed",
            "Foundation characterization for flood management structures",
            "Site assessment for disaster risk reduction",
            "Technical recommendations for infrastructure design"
        ]
    },
    {
        id: 6,
        title: "Topographical Surveys and Geotechnical Investigations for 1MW Mutambu Hydro-Solar Hybrid Project",
        sector: "energy",
        status: "completed",
        location: "Burundi",
        country: "Burundi",
        year: "2025",
        description: "Integrated ground and aerial survey of project area for innovative 1MW Hydro-Solar Hybrid energy project. Comprehensive topographical and geotechnical assessment for renewable energy infrastructure.",
        image: "resources/projects/mutambu-hybrid.png",
        coordinates: [-3.3731, 29.9189],
        duration: "2024-2025",
        client: "Anzana Electric Group",
        scope: "Ground and Aerial Survey, Topographical Surveys, Geotechnical Investigations",
        activities: "Topographic Surveys, Aerial Surveys, Geotechnical Investigation",
        results: [
            "Complete topographical survey using ground and aerial methods",
            "Site characterization for hybrid energy project",
            "Geotechnical investigation for infrastructure foundation",
            "Technical data for renewable energy development"
        ]
    },
    {
        id: 7,
        title: "Geotechnical Investigation for PHJIMU Slope Stability Studies",
        sector: "infrastructure",
        status: "completed",
        location: "Burundi",
        country: "Burundi",
        year: "2025",
        description: "Comprehensive geotechnical investigation including drilling, in-situ tests, and laboratory testing for slope stability assessment. Critical infrastructure safety evaluation project.",
        image: "resources/projects/phjimu-slope.png",
        coordinates: [-3.3731, 29.9189],
        duration: "Dec 2024 – Feb 2025",
        client: "Artelia / Aecom",
        scope: "Geotechnical Investigation: Drilling, In-situ Tests, Laboratory Testing",
        activities: "Drilling, In-situ Testing, Laboratory Analysis, Slope Stability Analysis",
        results: [
            "Comprehensive drilling program completed",
            "In-situ testing for soil and rock characterization",
            "Laboratory testing of geotechnical samples",
            "Slope stability analysis and recommendations"
        ]
    },
    {
        id: 8,
        title: "Additional Geotechnical Investigation for Upper Mule037 Project and Construction Material",
        sector: "infrastructure",
        status: "completed",
        location: "Burundi",
        country: "Burundi",
        year: "2024",
        description: "Comprehensive geotechnical investigation including drilling, in-situ tests, test pits, in-situ vane shear testing, and extensive laboratory testing for construction material assessment.",
        image: "resources/projects/upper-mule.png",
        coordinates: [-3.3731, 29.9189],
        duration: "Dec 2023 – Mar 2024",
        client: "Virunga Power / Songa Energy",
        scope: "Geotechnical Investigation: Drilling, In-situ Tests, Test Pits, In-situ Vane Shear, Laboratory Testing",
        activities: "Drilling, In-situ Testing, Test Pits, Vane Shear, Laboratory Analysis",
        results: [
            "Complete drilling and in-situ testing program",
            "Test pits for material characterization",
            "In-situ vane shear testing for soil strength",
            "Comprehensive laboratory testing of construction materials"
        ]
    },
    {
        id: 9,
        title: "2D Electrical Resistivity Survey for Zirobwe Quarry Site",
        sector: "mining",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2024",
        description: "1.2km of 2D Electrical Resistivity Tomography surveying for proposed quarry site characterization. Subsurface investigation for mining and construction material extraction.",
        image: "resources/projects/zirobwe-quarry.png",
        coordinates: [0.3000, 32.5000],
        duration: "Aug 2024",
        client: "KKCA / Phaze Construction Ltd / GMATLAB LTD",
        scope: "1.2km of 2D ERT surveying",
        activities: "2D ERT Surveys, Quarry Site Assessment",
        results: [
            "1.2km of 2D ERT surveys completed",
            "Subsurface characterization for quarry development",
            "Material quality assessment",
            "Optimal extraction zone identification"
        ]
    },
    {
        id: 10,
        title: "2D Electrical Resistivity Survey for Gayaza Landfill Thermal Power Plant",
        sector: "energy",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2024",
        description: "800m of 2D Electrical Resistivity Tomography surveying for proposed thermal power plant at Gayaza landfill site. Innovative waste-to-energy project assessment.",
        image: "resources/projects/gayaza-power.png",
        coordinates: [0.4100, 32.6200],
        duration: "May 2024",
        client: "GMATLAB LTD",
        scope: "800m of 2D ERT Surveying",
        activities: "2D ERT Surveys, Power Plant Site Assessment",
        results: [
            "800m of 2D ERT surveys completed",
            "Site characterization for thermal power plant",
            "Foundation assessment for energy infrastructure",
            "Environmental and geological baseline established"
        ]
    },
    {
        id: 11,
        title: "Geological, Geomorphological and Geotechnical Investigation for Mpanga II Hydro Power Project",
        sector: "energy",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2023",
        description: "Comprehensive investigation combining geotechnical drilling, geological mapping, and slope stability analysis for major hydropower development project.",
        image: "resources/projects/mpanga-hydro.png",
        coordinates: [0.0236, 30.0588],
        duration: "Dec 2023",
        client: "Mpanga Renewable Energies Limited / KK Advisors",
        scope: "Geotechnical investigation, Geological Mapping, Slope Stability Analysis",
        activities: "Geotechnical Investigation, Geological Mapping, Slope Analysis",
        results: [
            "Comprehensive geotechnical investigation completed",
            "Detailed geological mapping of project area",
            "Slope stability analysis for infrastructure safety",
            "Design recommendations for hydropower facility"
        ]
    },
    {
        id: 12,
        title: "Geological, Geomorphological and Geotechnical Investigation for Rwimi II Hydro Power Project",
        sector: "energy",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2023",
        description: "Integrated geotechnical investigation, geological mapping, and slope stability analysis for renewable energy infrastructure development.",
        image: "resources/projects/rwimi-hydro.png",
        coordinates: [0.0000, 30.0000],
        duration: "Dec 2022 - Feb 2023",
        client: "Rwimi II Energy Project Limited",
        scope: "Geotechnical investigation, Geological Mapping, Slope Stability Analysis",
        activities: "Geotechnical Investigation, Geological Mapping, Slope Analysis",
        results: [
            "Complete geotechnical characterization",
            "Geological mapping for hydropower site",
            "Slope stability assessment",
            "Engineering design parameters provided"
        ]
    },
    {
        id: 13,
        title: "2D Electrical Resistivity Survey for Paraa Safari Lodge Swimming Pool and Ferry Landing Site",
        sector: "infrastructure",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2022",
        description: "720m of 2D ERT surveying for tourism infrastructure development at iconic Paraa Safari Lodge in Murchison Falls National Park.",
        image: "resources/projects/paraa-lodge.png",
        coordinates: [2.1800, 31.5167],
        duration: "Oct 2022",
        client: "GMATLab / MBW Consulting Ltd",
        scope: "720m of 2D ERT Surveying",
        activities: "2D ERT Surveys, Tourism Infrastructure Assessment",
        results: [
            "720m of 2D ERT surveys completed",
            "Site characterization for swimming pool construction",
            "Ferry landing site foundation assessment",
            "Environmental considerations for national park location"
        ]
    },
    {
        id: 14,
        title: "10.3km 2D Electrical Resistivity Survey for Isingiro Water Supply Project",
        sector: "water",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2023",
        description: "Extensive 10.3km of 2D Resistivity Surveys along water pipeline routes including comprehensive data management, processing, and reporting for major water supply infrastructure.",
        image: "resources/projects/isingiro-water.png",
        coordinates: [-0.8167, 30.8000],
        duration: "Oct 2022 – Jan 2023",
        client: "GMATLab / RazelBec",
        scope: "2D Resistivity Surveys along water pipelines, data management, processing and reporting",
        activities: "2D ERT Surveys, Pipeline Route Assessment, Data Processing",
        results: [
            "10.3km of 2D resistivity surveys completed",
            "Pipeline route optimization",
            "Comprehensive data management and processing",
            "Detailed technical reporting for water supply project"
        ]
    },
    {
        id: 15,
        title: "Diamond Core Drilling in Zombo District – Phase II",
        sector: "mining",
        status: "completed",
        location: "Uganda",
        country: "Uganda",
        year: "2022",
        description: "2000m of diamond core drilling in HQ and NQ sizes for mineral exploration. Advanced drilling techniques for resource characterization.",
        image: "resources/projects/zombo-drilling.png",
        coordinates: [2.5000, 30.9167],
        duration: "September 2022 to October 2022",
        client: "GMATLab / Samta Mines & Minerals (Uganda) Ltd",
        scope: "Diamond Core Drilling of 2000m of boreholes in HQ and NQ sizes",
        activities: "Diamond Core Drilling, Resource Exploration, Sample Analysis",
        results: [
            "2000m of diamond core drilling completed",
            "HQ and NQ size core samples obtained",
            "Mineral resource characterization",
            "Geological logging and core analysis"
        ]
    }
];

// Export for use in projects.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = projectsData;
}
