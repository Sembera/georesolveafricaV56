// =============================================================================
// G-Resolog Pro v2 — Geological Description Builder
// ES module providing dropdown pickers for borehole logging descriptions
// according to BS 5930 / ISO 14688-14689 / AS 1726 standards.
// =============================================================================

// ─── Standard Definitions ────────────────────────────────────────────────────

const STANDARDS = {

  // ── BS 5930 / ISO 14688-14689 (Soil) ──────────────────────────────────────

  BS5930: {
    label: 'BS 5930 / ISO 14688-14689',

    consistency: {
      label: 'Consistency / Relative Density',
      cohesive: [
        { value: 'very_soft',  label: 'Very soft'  },
        { value: 'soft',       label: 'Soft'        },
        { value: 'firm',       label: 'Firm'        },
        { value: 'stiff',      label: 'Stiff'       },
        { value: 'very_stiff', label: 'Very stiff'  },
        { value: 'hard',       label: 'Hard'        }
      ],
      granular: [
        { value: 'very_loose',   label: 'Very loose'    },
        { value: 'loose',        label: 'Loose'         },
        { value: 'medium_dense', label: 'Medium dense'  },
        { value: 'dense',        label: 'Dense'         },
        { value: 'very_dense',   label: 'Very dense'    }
      ]
    },

    moisture: {
      label: 'Moisture',
      options: [
        { value: 'dry',       label: 'Dry'       },
        { value: 'moist',     label: 'Moist'     },
        { value: 'wet',       label: 'Wet'       },
        { value: 'saturated', label: 'Saturated' }
      ]
    },

    plasticity: {
      label: 'Plasticity',
      options: [
        { value: 'CL', label: 'CL — Low plasticity clay'          },
        { value: 'CI', label: 'CI — Intermediate plasticity clay' },
        { value: 'CH', label: 'CH — High plasticity clay'         },
        { value: 'CV', label: 'CV — Very high plasticity clay'    },
        { value: 'CE', label: 'CE — Extremely high plasticity clay'},
        { value: 'ML', label: 'ML — Low plasticity silt'          },
        { value: 'MI', label: 'MI — Intermediate plasticity silt' },
        { value: 'MH', label: 'MH — High plasticity silt'         },
        { value: 'MV', label: 'MV — Very high plasticity silt'    },
        { value: 'ME', label: 'ME — Extremely high plasticity silt'}
      ]
    },

    colour: {
      label: 'Colour',
      basic: [
        { value: 'brown',  label: 'Brown'  },
        { value: 'grey',   label: 'Grey'   },
        { value: 'black',  label: 'Black'  },
        { value: 'red',    label: 'Red'    },
        { value: 'yellow', label: 'Yellow' },
        { value: 'green',  label: 'Green'  },
        { value: 'white',  label: 'White'  },
        { value: 'orange', label: 'Orange' },
        { value: 'pink',   label: 'Pink'   },
        { value: 'blue',   label: 'Blue'   }
      ],
      modifiers: [
        { value: 'pale',    label: 'Pale'    },
        { value: 'dark',    label: 'Dark'    },
        { value: 'light',   label: 'Light'   },
        { value: 'mottled', label: 'Mottled' }
      ],
      secondary: [
        { value: 'brown',  label: 'Brown'  },
        { value: 'grey',   label: 'Grey'   },
        { value: 'black',  label: 'Black'  },
        { value: 'red',    label: 'Red'    },
        { value: 'yellow', label: 'Yellow' },
        { value: 'green',  label: 'Green'  },
        { value: 'white',  label: 'White'  },
        { value: 'orange', label: 'Orange' },
        { value: 'pink',   label: 'Pink'   },
        { value: 'blue',   label: 'Blue'   }
      ]
    },

    secondaryConstituent: {
      label: 'Secondary Constituent',
      minor: [
        { value: 'trace',            label: 'trace'             },
        { value: 'with_some',        label: 'with some'         },
        { value: 'with_occasional',  label: 'with occasional'   }
      ],
      major: [
        { value: 'sandy',      label: 'sandy'      },
        { value: 'gravelly',   label: 'gravelly'   },
        { value: 'silty',      label: 'silty'      },
        { value: 'clayey',     label: 'clayey'     },
        { value: 'organic',    label: 'organic'    },
        { value: 'calcareous', label: 'calcareous' },
        { value: 'micaceous',  label: 'micaceous'  }
      ],
      materialOptions: [
        { value: 'SAND',     label: 'SAND'     },
        { value: 'GRAVEL',   label: 'GRAVEL'   },
        { value: 'SILT',     label: 'SILT'     },
        { value: 'CLAY',     label: 'CLAY'     },
        { value: 'COBBLES',  label: 'COBBLES'  },
        { value: 'BOULDERS', label: 'BOULDERS' },
        { value: 'ORGANIC',  label: 'ORGANIC'  },
        { value: 'SHELLS',   label: 'SHELLS'   },
        { value: 'ROOTS',    label: 'ROOTS'    }
      ]
    },

    primaryType: {
      label: 'Primary Type',
      options: [
        { value: 'CLAY',         label: 'CLAY'         },
        { value: 'SILT',         label: 'SILT'         },
        { value: 'SAND',         label: 'SAND'         },
        { value: 'GRAVEL',       label: 'GRAVEL'       },
        { value: 'COBBLES',      label: 'COBBLES'      },
        { value: 'BOULDERS',     label: 'BOULDERS'     },
        { value: 'PEAT',         label: 'PEAT'         },
        { value: 'MADE GROUND',  label: 'MADE GROUND'  },
        { value: 'TOPSOIL',      label: 'TOPSOIL'      }
      ],
      composites: [
        { value: 'sandy CLAY',     label: 'sandy CLAY'     },
        { value: 'silty CLAY',     label: 'silty CLAY'     },
        { value: 'gravelly CLAY',  label: 'gravelly CLAY'  },
        { value: 'silty SAND',     label: 'silty SAND'     },
        { value: 'clayey SAND',    label: 'clayey SAND'    },
        { value: 'gravelly SAND',  label: 'gravelly SAND'  },
        { value: 'clayey SILT',    label: 'clayey SILT'    },
        { value: 'sandy SILT',     label: 'sandy SILT'     },
        { value: 'gravelly SILT',  label: 'gravelly SILT'  },
        { value: 'sandy GRAVEL',   label: 'sandy GRAVEL'   },
        { value: 'clayey GRAVEL',  label: 'clayey GRAVEL'  },
        { value: 'silty GRAVEL',   label: 'silty GRAVEL'   }
      ]
    },

    origin: {
      label: 'Origin / Geology',
      suggestions: [
        'Alluvium', 'Colluvium', 'Residual soil', 'Fill',
        'Lacustrine', 'Glacial till', 'Fluvial', 'Marine',
        'Aeolian', 'Estuarine', 'Weathered in situ'
      ]
    },

    organicContent: {
      label: 'Organic Content',
      options: [
        { value: 'none',     label: 'None'        },
        { value: 'low',      label: 'Low'         },
        { value: 'moderate', label: 'Moderate'    },
        { value: 'high',     label: 'High (Peat)' }
      ]
    },

    structure: {
      label: 'Structure',
      options: [
        { value: 'homogeneous', label: 'Homogeneous' },
        { value: 'laminated',   label: 'Laminated'   },
        { value: 'fissured',    label: 'Fissured'    },
        { value: 'bedded',      label: 'Bedded'      }
      ]
    }
  },

  // ── BS 5930 / ISO 14689 (Rock) ────────────────────────────────────────────

  ROCK_BS5930: {
    label: 'BS 5930 / ISO 14689',

    strength: {
      label: 'Strength (ISRM)',
      options: [
        { value: 'R0', label: 'R0 (Extremely weak)'     },
        { value: 'R1', label: 'R1 (Very weak)'           },
        { value: 'R2', label: 'R2 (Weak)'                },
        { value: 'R3', label: 'R3 (Medium strong)'       },
        { value: 'R4', label: 'R4 (Strong)'              },
        { value: 'R5', label: 'R5 (Very strong)'         },
        { value: 'R6', label: 'R6 (Extremely strong)'    }
      ]
    },

    weathering: {
      label: 'Weathering Grade',
      system_primary: [
        { value: 'W1', label: 'W1 — Fresh'                    },
        { value: 'W2', label: 'W2 — Slightly weathered'       },
        { value: 'W3', label: 'W3 — Moderately weathered'     },
        { value: 'W4', label: 'W4 — Highly weathered'         },
        { value: 'W5', label: 'W5 — Completely weathered'     },
        { value: 'W6', label: 'W6 — Residual soil'            }
      ],
      system_alt: [
        { value: 'FR', label: 'FR — Fresh'                  },
        { value: 'SW', label: 'SW — Slightly weathered'     },
        { value: 'MW', label: 'MW — Moderately weathered'   },
        { value: 'HW', label: 'HW — Highly weathered'       },
        { value: 'CW', label: 'CW — Completely weathered'   },
        { value: 'RS', label: 'RS — Residual soil'          }
      ]
    },

    colour: {
      label: 'Colour',
      basic: [
        { value: 'grey',      label: 'Grey'      },
        { value: 'brown',     label: 'Brown'     },
        { value: 'black',     label: 'Black'     },
        { value: 'red',       label: 'Red'       },
        { value: 'yellow',    label: 'Yellow'    },
        { value: 'green',     label: 'Green'     },
        { value: 'white',     label: 'White'     },
        { value: 'pink',      label: 'Pink'      },
        { value: 'purple',    label: 'Purple'    },
        { value: 'blue_grey', label: 'Blue-grey' }
      ],
      modifiers: [
        { value: 'pale',    label: 'Pale'    },
        { value: 'dark',    label: 'Dark'    },
        { value: 'light',   label: 'Light'   },
        { value: 'mottled', label: 'Mottled' }
      ]
    },

    grainSize: {
      label: 'Grain Size',
      options: [
        { value: 'very_fine',   label: 'Very fine'   },
        { value: 'fine',        label: 'Fine'        },
        { value: 'medium',      label: 'Medium'      },
        { value: 'coarse',      label: 'Coarse'      },
        { value: 'very_coarse', label: 'Very coarse' }
      ],
      texture: [
        { value: 'aphanitic',   label: 'Aphanitic'   },
        { value: 'phaneritic',  label: 'Phaneritic'  },
        { value: 'porphyritic', label: 'Porphyritic' },
        { value: 'glassy',      label: 'Glassy'      }
      ]
    },

    rockName: {
      label: 'ROCK NAME',
      igneous: [
        { value: 'GRANITE',   label: 'GRANITE'   },
        { value: 'DIORITE',   label: 'DIORITE'   },
        { value: 'GABBRO',    label: 'GABBRO'    },
        { value: 'BASALT',    label: 'BASALT'    },
        { value: 'RHYOLITE',  label: 'RHYOLITE'  },
        { value: 'ANDESITE',  label: 'ANDESITE'  },
        { value: 'DOLERITE',  label: 'DOLERITE'  },
        { value: 'TUFF',      label: 'TUFF'      },
        { value: 'PEGMATITE', label: 'PEGMATITE' }
      ],
      sedimentary: [
        { value: 'SANDSTONE',     label: 'SANDSTONE'     },
        { value: 'SILTSTONE',     label: 'SILTSTONE'     },
        { value: 'MUDSTONE',      label: 'MUDSTONE'      },
        { value: 'SHALE',         label: 'SHALE'         },
        { value: 'LIMESTONE',     label: 'LIMESTONE'     },
        { value: 'DOLOMITE',      label: 'DOLOMITE'      },
        { value: 'CONGLOMERATE',  label: 'CONGLOMERATE'  },
        { value: 'BRECCIA',       label: 'BRECCIA'       },
        { value: 'CHERT',         label: 'CHERT'         }
      ],
      metamorphic: [
        { value: 'GNEISS',      label: 'GNEISS'      },
        { value: 'SCHIST',      label: 'SCHIST'      },
        { value: 'SLATE',       label: 'SLATE'       },
        { value: 'PHYLLITE',    label: 'PHYLLITE'    },
        { value: 'QUARTZITE',   label: 'QUARTZITE'   },
        { value: 'MARBLE',      label: 'MARBLE'      },
        { value: 'AMPHIBOLITE', label: 'AMPHIBOLITE' },
        { value: 'MIGMATITE',   label: 'MIGMATITE'   }
      ]
    },

    discontinuities: {
      label: 'Discontinuity Spacing',
      options: [
        { value: 'very_wide',       label: 'Very wide (>2000 mm)'       },
        { value: 'wide',            label: 'Wide (600-2000 mm)'          },
        { value: 'medium',          label: 'Medium (200-600 mm)'         },
        { value: 'close',           label: 'Close (60-200 mm)'           },
        { value: 'very_close',      label: 'Very close (20-60 mm)'       },
        { value: 'extremely_close', label: 'Extremely close (<20 mm)'    }
      ]
    }
  },

  // ── AS 1726 (Australian Standard) Soil ────────────────────────────────────

  AS1726: {
    label: 'AS 1726',

    consistency: {
      label: 'Consistency / Relative Density',
      cohesive: [
        { value: 'VS',  label: 'VS — Very soft'   },
        { value: 'S',   label: 'S — Soft'          },
        { value: 'F',   label: 'F — Firm'          },
        { value: 'St',  label: 'St — Stiff'        },
        { value: 'VSt', label: 'VSt — Very stiff'  },
        { value: 'H',   label: 'H — Hard'          }
      ],
      granular: [
        { value: 'VL', label: 'VL — Very loose'   },
        { value: 'L',  label: 'L — Loose'          },
        { value: 'MD', label: 'MD — Medium dense'  },
        { value: 'D',  label: 'D — Dense'          },
        { value: 'VD', label: 'VD — Very dense'    }
      ]
    },

    moisture: {
      label: 'Moisture Condition',
      options: [
        { value: 'dry',       label: 'Dry'       },
        { value: 'moist',     label: 'Moist'     },
        { value: 'wet',       label: 'Wet'       },
        { value: 'saturated', label: 'Saturated' }
      ]
    },

    plasticity: {
      label: 'Plasticity',
      options: [
        { value: 'CL', label: 'CL — Low plasticity clay'          },
        { value: 'CI', label: 'CI — Intermediate plasticity clay' },
        { value: 'CH', label: 'CH — High plasticity clay'         },
        { value: 'CV', label: 'CV — Very high plasticity clay'    },
        { value: 'CE', label: 'CE — Extremely high plasticity clay'},
        { value: 'ML', label: 'ML — Low plasticity silt'          },
        { value: 'MI', label: 'MI — Intermediate plasticity silt' },
        { value: 'MH', label: 'MH — High plasticity silt'         },
        { value: 'MV', label: 'MV — Very high plasticity silt'    },
        { value: 'ME', label: 'ME — Extremely high plasticity silt'}
      ]
    },

    colour: {
      label: 'Colour',
      basic: [
        { value: 'brown',  label: 'Brown'  },
        { value: 'grey',   label: 'Grey'   },
        { value: 'black',  label: 'Black'  },
        { value: 'red',    label: 'Red'    },
        { value: 'yellow', label: 'Yellow' },
        { value: 'green',  label: 'Green'  },
        { value: 'white',  label: 'White'  },
        { value: 'orange', label: 'Orange' },
        { value: 'pink',   label: 'Pink'   },
        { value: 'blue',   label: 'Blue'   }
      ],
      modifiers: [
        { value: 'pale',    label: 'Pale'    },
        { value: 'dark',    label: 'Dark'    },
        { value: 'light',   label: 'Light'   },
        { value: 'mottled', label: 'Mottled' }
      ],
      secondary: [
        { value: 'brown',  label: 'Brown'  },
        { value: 'grey',   label: 'Grey'   },
        { value: 'black',  label: 'Black'  },
        { value: 'red',    label: 'Red'    },
        { value: 'yellow', label: 'Yellow' },
        { value: 'green',  label: 'Green'  },
        { value: 'white',  label: 'White'  },
        { value: 'orange', label: 'Orange' },
        { value: 'pink',   label: 'Pink'   },
        { value: 'blue',   label: 'Blue'   }
      ]
    },

    secondaryConstituent: {
      label: 'Secondary Constituent',
      minor: [
        { value: 'trace',            label: 'trace'             },
        { value: 'with_some',        label: 'with some'         },
        { value: 'with_occasional',  label: 'with occasional'   }
      ],
      major: [
        { value: 'sandy',      label: 'sandy'      },
        { value: 'gravelly',   label: 'gravelly'   },
        { value: 'silty',      label: 'silty'      },
        { value: 'clayey',     label: 'clayey'     },
        { value: 'organic',    label: 'organic'    },
        { value: 'calcareous', label: 'calcareous' },
        { value: 'micaceous',  label: 'micaceous'  }
      ],
      materialOptions: [
        { value: 'SAND',     label: 'SAND'     },
        { value: 'GRAVEL',   label: 'GRAVEL'   },
        { value: 'SILT',     label: 'SILT'     },
        { value: 'CLAY',     label: 'CLAY'     },
        { value: 'COBBLES',  label: 'COBBLES'  },
        { value: 'BOULDERS', label: 'BOULDERS' },
        { value: 'ORGANIC',  label: 'ORGANIC'  },
        { value: 'SHELLS',   label: 'SHELLS'   },
        { value: 'ROOTS',    label: 'ROOTS'    }
      ]
    },

    primaryType: {
      label: 'Primary Type',
      options: [
        { value: 'CLAY',         label: 'CLAY'         },
        { value: 'SILT',         label: 'SILT'         },
        { value: 'SAND',         label: 'SAND'         },
        { value: 'GRAVEL',       label: 'GRAVEL'       },
        { value: 'COBBLES',      label: 'COBBLES'      },
        { value: 'BOULDERS',     label: 'BOULDERS'     },
        { value: 'PEAT',         label: 'PEAT'         },
        { value: 'MADE GROUND',  label: 'MADE GROUND'  },
        { value: 'TOPSOIL',      label: 'TOPSOIL'      }
      ],
      composites: [
        { value: 'sandy CLAY',     label: 'sandy CLAY'     },
        { value: 'silty CLAY',     label: 'silty CLAY'     },
        { value: 'gravelly CLAY',  label: 'gravelly CLAY'  },
        { value: 'silty SAND',     label: 'silty SAND'     },
        { value: 'clayey SAND',    label: 'clayey SAND'    },
        { value: 'gravelly SAND',  label: 'gravelly SAND'  },
        { value: 'clayey SILT',    label: 'clayey SILT'    },
        { value: 'sandy SILT',     label: 'sandy SILT'     },
        { value: 'gravelly SILT',  label: 'gravelly SILT'  },
        { value: 'sandy GRAVEL',   label: 'sandy GRAVEL'   },
        { value: 'clayey GRAVEL',  label: 'clayey GRAVEL'  },
        { value: 'silty GRAVEL',   label: 'silty GRAVEL'   }
      ]
    },

    origin: {
      label: 'Origin / Geology',
      suggestions: [
        'Alluvium', 'Colluvium', 'Residual soil', 'Fill',
        'Lacustrine', 'Fluvial', 'Marine',
        'Aeolian', 'Estuarine', 'Weathered in situ'
      ]
    },

    organicContent: {
      label: 'Organic Content',
      options: [
        { value: 'none',     label: 'None'        },
        { value: 'low',      label: 'Low'         },
        { value: 'moderate', label: 'Moderate'    },
        { value: 'high',     label: 'High (Peat)' }
      ]
    },

    structure: {
      label: 'Structure',
      options: [
        { value: 'homogeneous', label: 'Homogeneous' },
        { value: 'laminated',   label: 'Laminated'   },
        { value: 'fissured',    label: 'Fissured'    },
        { value: 'bedded',      label: 'Bedded'      }
      ]
    }
  },

  // ── AS 1726 Rock ──────────────────────────────────────────────────────────

  ROCK_AS1726: {
    label: 'AS 1726',

    strength: {
      label: 'Rock Strength',
      options: [
        { value: 'EL', label: 'EL — Extremely Low'   },
        { value: 'VL', label: 'VL — Very Low'         },
        { value: 'L',  label: 'L — Low'               },
        { value: 'M',  label: 'M — Medium'            },
        { value: 'H',  label: 'H — High'              },
        { value: 'VH', label: 'VH — Very High'        },
        { value: 'EH', label: 'EH — Extremely High'   }
      ]
    },

    weathering: {
      label: 'Weathering Grade',
      options: [
        { value: 'RS', label: 'RS — Residual Soil'          },
        { value: 'XW', label: 'XW — Extremely Weathered'    },
        { value: 'HW', label: 'HW — Highly Weathered'       },
        { value: 'MW', label: 'MW — Moderately Weathered'   },
        { value: 'SW', label: 'SW — Slightly Weathered'     },
        { value: 'FR', label: 'FR — Fresh'                  }
      ]
    },

    colour: {
      label: 'Colour',
      basic: [
        { value: 'grey',      label: 'Grey'      },
        { value: 'brown',     label: 'Brown'     },
        { value: 'black',     label: 'Black'     },
        { value: 'red',       label: 'Red'       },
        { value: 'yellow',    label: 'Yellow'    },
        { value: 'green',     label: 'Green'     },
        { value: 'white',     label: 'White'     },
        { value: 'pink',      label: 'Pink'      },
        { value: 'purple',    label: 'Purple'    },
        { value: 'blue_grey', label: 'Blue-grey' }
      ],
      modifiers: [
        { value: 'pale',    label: 'Pale'    },
        { value: 'dark',    label: 'Dark'    },
        { value: 'light',   label: 'Light'   },
        { value: 'mottled', label: 'Mottled' }
      ]
    },

    grainSize: {
      label: 'Grain Size',
      options: [
        { value: 'very_fine',   label: 'Very fine'   },
        { value: 'fine',        label: 'Fine'        },
        { value: 'medium',      label: 'Medium'      },
        { value: 'coarse',      label: 'Coarse'      },
        { value: 'very_coarse', label: 'Very coarse' }
      ],
      texture: [
        { value: 'aphanitic',   label: 'Aphanitic'   },
        { value: 'phaneritic',  label: 'Phaneritic'  },
        { value: 'porphyritic', label: 'Porphyritic' },
        { value: 'glassy',      label: 'Glassy'      }
      ]
    },

    rockName: {
      label: 'ROCK NAME',
      igneous: [
        { value: 'GRANITE',   label: 'GRANITE'   },
        { value: 'DIORITE',   label: 'DIORITE'   },
        { value: 'GABBRO',    label: 'GABBRO'    },
        { value: 'BASALT',    label: 'BASALT'    },
        { value: 'RHYOLITE',  label: 'RHYOLITE'  },
        { value: 'ANDESITE',  label: 'ANDESITE'  },
        { value: 'DOLERITE',  label: 'DOLERITE'  },
        { value: 'TUFF',      label: 'TUFF'      },
        { value: 'PEGMATITE', label: 'PEGMATITE' }
      ],
      sedimentary: [
        { value: 'SANDSTONE',     label: 'SANDSTONE'     },
        { value: 'SILTSTONE',     label: 'SILTSTONE'     },
        { value: 'MUDSTONE',      label: 'MUDSTONE'      },
        { value: 'SHALE',         label: 'SHALE'         },
        { value: 'LIMESTONE',     label: 'LIMESTONE'     },
        { value: 'DOLOMITE',      label: 'DOLOMITE'      },
        { value: 'CONGLOMERATE',  label: 'CONGLOMERATE'  },
        { value: 'BRECCIA',       label: 'BRECCIA'       },
        { value: 'CHERT',         label: 'CHERT'         }
      ],
      metamorphic: [
        { value: 'GNEISS',      label: 'GNEISS'      },
        { value: 'SCHIST',      label: 'SCHIST'      },
        { value: 'SLATE',       label: 'SLATE'       },
        { value: 'PHYLLITE',    label: 'PHYLLITE'    },
        { value: 'QUARTZITE',   label: 'QUARTZITE'   },
        { value: 'MARBLE',      label: 'MARBLE'      },
        { value: 'AMPHIBOLITE', label: 'AMPHIBOLITE' },
        { value: 'MIGMATITE',   label: 'MIGMATITE'   }
      ]
    },

    discontinuities: {
      label: 'Discontinuity Spacing',
      options: [
        { value: 'very_wide',       label: 'Very wide (>2000 mm)'       },
        { value: 'wide',            label: 'Wide (600-2000 mm)'          },
        { value: 'medium',          label: 'Medium (200-600 mm)'         },
        { value: 'close',           label: 'Close (60-200 mm)'           },
        { value: 'very_close',      label: 'Very close (20-60 mm)'       },
        { value: 'extremely_close', label: 'Extremely close (<20 mm)'    }
      ]
    }
  }
};

// ─── Utility Helpers ─────────────────────────────────────────────────────────

function findOptionLabel(options, value) {
  const found = options.find(o => o.value === value);
  return found ? found.label : value;
}

// ─── Description Builders ────────────────────────────────────────────────────

/**
 * Build a formatted soil description string from selection values.
 * @param {Object} sel - selected values keyed by pick name
 * @param {string} sel.consistency - e.g. 'firm', 'loose'
 * @param {string} sel.moisture - e.g. 'moist'
 * @param {string} sel.plasticity - e.g. 'CI'
 * @param {Object} sel.colour - e.g. { basic: 'brown', modifier: 'pale', secondary: 'grey' }
 * @param {Object} sel.secondaryConstituent - e.g. { minor: 'trace', material: 'SAND', major: 'gravelly' }
 * @param {string} sel.primaryType - e.g. 'CLAY', 'sandy CLAY'
 * @param {string} sel.origin - free text
 * @param {string} sel.organicContent - e.g. 'low'
 * @param {string} sel.structure - e.g. 'fissured'
 * @param {string} sel.freeText - additional free text
 * @returns {string} formatted description
 */
function buildSoilDescription(sel) {
  const parts = [];

  // 1. Consistency
  if (sel.consistency && sel.consistency !== '') {
    const opts = getConsistencyLabel(STANDARDS.BS5930, sel.consistency);
    if (opts) parts.push(opts.charAt(0).toUpperCase() + opts.slice(1));
  }

  // 2. Moisture
  if (sel.moisture && sel.moisture !== '') {
    parts.push(sel.moisture);
  }

  // 3. Plasticity — deferred to after primary type in parentheses

  // 4. Colour
  const colourParts = buildColourString(sel.colour);
  if (colourParts) parts.push(colourParts);

  // 5. Secondary Constituent
  const secPart = buildSecondaryConstituentString(sel.secondaryConstituent);
  if (secPart) parts.push(secPart);

  // 6. Primary Type (UPPERCASE)
  let primary = sel.primaryType || '';
  if (primary) {
    // Append plasticity in parentheses if present
    if (sel.plasticity && sel.plasticity !== '') {
      primary += ' (' + sel.plasticity + ')';
    }
    parts.push(primary);
  }

  // Structure
  if (sel.structure && sel.structure !== '') {
    parts.push(sel.structure);
  }

  // Organic content note
  if (sel.organicContent && sel.organicContent !== 'none' && sel.organicContent !== '') {
    parts.push(sel.organicContent + ' organic content');
  }

  // Free text appended
  if (sel.freeText && sel.freeText.trim() !== '') {
    parts.push(sel.freeText.trim());
  }

  // Origin — always goes at the end preceded by a period
  let desc = parts.filter(Boolean).join(', ');

  if (sel.origin && sel.origin.trim() !== '') {
    if (desc) desc += '. ';
    desc += sel.origin.trim() + '.';
  } else if (desc) {
    desc += '.';
  }

  return desc;
}

function getConsistencyLabel(std, value) {
  const cohesive = std.consistency.cohesive.find(o => o.value === value);
  if (cohesive) return cohesive.label;
  const granular = std.consistency.granular.find(o => o.value === value);
  if (granular) return granular.label;
  return null;
}

function buildColourString(colourObj) {
  if (!colourObj) return '';
  const parts = [];
  if (colourObj.modifier && colourObj.modifier !== '') {
    parts.push(colourObj.modifier);
  }
  if (colourObj.basic && colourObj.basic !== '') {
    parts.push(colourObj.basic);
  }
  const main = parts.join(' ');
  if (colourObj.secondary && colourObj.secondary !== '') {
    return main + ' mottled ' + colourObj.secondary;
  }
  return main;
}

function buildSecondaryConstituentString(sc) {
  if (!sc) return '';
  const parts = [];
  // Major first (e.g. "gravelly")
  if (sc.major && sc.major !== '') {
    parts.push(sc.major);
  }
  // Minor with material (e.g. "trace SAND")
  if (sc.minor && sc.minor !== '' && sc.material && sc.material !== '') {
    const minorPhrase = sc.minor.replace(/_/g, ' ');
    parts.push(minorPhrase + ' ' + sc.material);
  } else if (sc.minor && sc.minor !== '') {
    parts.push(sc.minor.replace(/_/g, ' '));
  }
  return parts.join(', ');
}

/**
 * Build a formatted rock description string from selection values.
 * @param {Object} sel - selected values
 * @returns {string} formatted description
 */
function buildRockDescription(sel) {
  const parts = [];

  if (sel.strength && sel.strength !== '') {
    parts.push(sel.strength);
  }

  if (sel.weathering && sel.weathering !== '') {
    parts.push(sel.weathering);
  }

  const colourStr = buildColourString(sel.colour);
  if (colourStr) parts.push(colourStr);

  if (sel.grainSize && sel.grainSize !== '') {
    parts.push(sel.grainSize + ' grained');
  }

  if (sel.texture && sel.texture !== '') {
    parts.push(sel.texture);
  }

  let rockName = sel.rockName || '';
  if (rockName) {
    if (sel.grainSize && sel.grainSize !== '') {
      rockName = sel.grainSize + ' grained ' + rockName;
    }
    parts.push(rockName);
  }

  if (sel.discontinuities && sel.discontinuities !== '') {
    parts.push(sel.discontinuities + ' discontinuities');
  }

  if (sel.freeText && sel.freeText.trim() !== '') {
    parts.push(sel.freeText.trim());
  }

  return parts.filter(Boolean).join(', ') + '.';
}

// ─── SPT Calculator ──────────────────────────────────────────────────────────

/**
 * Calculate SPT N-value from blow counts.
 * @param {number} seating - seating drive blows (first 150mm)
 * @param {number} blow1 - 1st 75mm
 * @param {number} blow2 - 2nd 75mm
 * @param {number} blow3 - 3rd 75mm
 * @param {number} [blow4] - optional 4th 75mm if refusal
 * @returns {{ n: number|null, refusal: boolean, blows: number[], seating: number }}
 */
function calculateSPT(seating, blow1, blow2, blow3, blow4) {
  const blows = [blow1, blow2, blow3];
  if (blow4 !== undefined && blow4 !== null) blows.push(blow4);

  const refusal = blows.some(b => typeof b === 'string' && b.toUpperCase() === 'R');
  let n = null;

  if (!refusal) {
    n = (Number(blow2) || 0) + (Number(blow3) || 0);
  }

  return {
    n: n,
    refusal: refusal,
    blows: blows,
    seating: Number(seating) || 0
  };
}

// ─── Core Metrics Calculator ─────────────────────────────────────────────────

/**
 * Calculate TCR, SCR, and RQD from core run data.
 * @param {number} runLength - total run length in m
 * @param {number} recLength - recovered length in m
 * @param {number} solidLength - solid core length in m
 * @param {number} pieces100 - length of pieces >= 100mm in m
 * @returns {{ tcr: number, scr: number, rqd: number }}
 */
function calculateCoreMetrics(runLength, recLength, solidLength, pieces100) {
  if (!runLength || runLength <= 0) {
    return { tcr: 0, scr: 0, rqd: 0 };
  }

  return {
    tcr: Math.round(((recLength || 0) / runLength) * 100),
    scr: Math.round(((solidLength || 0) / runLength) * 100),
    rqd: Math.round(((pieces100 || 0) / runLength) * 100)
  };
}

// ─── DOM Rendering Helpers ───────────────────────────────────────────────────

function _makeFormGroup(label, selectHTML) {
  const div = document.createElement('div');
  div.className = 'desc-form-group';
  div.innerHTML = '<label class="desc-label">' + label + '</label>' + selectHTML;
  return div;
}

function _makeSelect(options, attrs) {
  const sel = document.createElement('select');
  if (attrs) Object.keys(attrs).forEach(k => sel.setAttribute(k, attrs[k]));
  sel.innerHTML = '<option value="">—</option>' +
    options.map(o => '<option value="' + o.value + '">' + o.label + '</option>').join('');
  return sel;
}

function _makeDatalistInput(listId, suggestions, placeholder, attrs) {
  const inp = document.createElement('input');
  inp.setAttribute('list', 'dl-' + listId);
  inp.placeholder = placeholder || '';
  inp.className = 'desc-input';
  if (attrs) Object.keys(attrs).forEach(k => inp.setAttribute(k, attrs[k]));
  const dl = document.createElement('datalist');
  dl.id = 'dl-' + listId;
  dl.innerHTML = suggestions.map(s => '<option value="' + s + '">').join('');
  const span = document.createElement('span');
  span.style.cssText = 'display:block;';
  span.appendChild(inp);
  span.appendChild(dl);
  return span;
}

// ─── Soil Picker Rendering ───────────────────────────────────────────────────

function renderSoilPickers(containerEl, onChange, initialValues) {
  if (!containerEl) return;
  var std = STANDARDS.BS5930;
  var vals = initialValues || {};
  var wrapper = document.createElement('div');
  wrapper.className = 'desc-builder-soil';

  function fire() { if (typeof onChange === 'function') onChange(); }

  // 1. Consistency
  var consGroup = document.createElement('div');
  consGroup.className = 'desc-form-group';
  consGroup.innerHTML = '<label class="desc-label">Consistency / Relative Density</label>';
  var consType = document.createElement('select');
  consType.innerHTML = '<option value="cohesive">Cohesive</option><option value="granular">Granular</option>';
  consType.className = 'desc-select';
  var consVal = _makeSelect(std.consistency.cohesive);
  consVal.setAttribute('data-pick', 'consistency');

  consType.addEventListener('change', function() {
    var list = consType.value === 'cohesive' ? std.consistency.cohesive : std.consistency.granular;
    consVal.innerHTML = '<option value="">—</option>' +
      list.map(function(o) { return '<option value="' + o.label.toLowerCase().replace(/ /g, '_') + '">' + o.label + '</option>'; }).join('');
    fire();
  });
  consVal.addEventListener('change', fire);
  consGroup.appendChild(consType);
  consGroup.appendChild(consVal);
  wrapper.appendChild(consGroup);

  if (vals.consistency) {
    var inCohesive = std.consistency.cohesive.some(function(o) { return o.label.toLowerCase().replace(/ /g, '_') === vals.consistency; });
    consType.value = inCohesive ? 'cohesive' : 'granular';
    consType.dispatchEvent(new Event('change'));
    consVal.value = vals.consistency;
  }

  // 2. Moisture
  var moistSel = _makeSelect(std.moisture.options, { 'data-pick': 'moisture' });
  moistSel.addEventListener('change', fire);
  if (vals.moisture) moistSel.value = vals.moisture;
  wrapper.appendChild(_makeFormGroup(std.moisture.label, moistSel.outerHTML));

  // 3. Plasticity
  var plastSel = _makeSelect(std.plasticity.options, { 'data-pick': 'plasticity' });
  plastSel.addEventListener('change', fire);
  if (vals.plasticity) plastSel.value = vals.plasticity;
  wrapper.appendChild(_makeFormGroup(std.plasticity.label, plastSel.outerHTML));

  // 4. Colour
  var colGroup = document.createElement('div');
  colGroup.className = 'desc-form-group';
  colGroup.innerHTML = '<label class="desc-label">Colour</label>';
  var colRow = document.createElement('div');
  colRow.className = 'desc-row-3';
  var colMod = _makeSelect(std.colour.modifiers, { 'data-pick': 'colour_modifier' });
  colMod.querySelector('option').text = '—';
  var colBasic = _makeSelect(std.colour.basic, { 'data-pick': 'colour_basic' });
  var colSec = _makeSelect(std.colour.secondary, { 'data-pick': 'colour_secondary' });
  colSec.querySelector('option').text = '—';
  colMod.addEventListener('change', fire);
  colBasic.addEventListener('change', fire);
  colSec.addEventListener('change', fire);
  colRow.appendChild(colMod);
  colRow.appendChild(colBasic);
  colRow.appendChild(colSec);
  colGroup.appendChild(colRow);
  wrapper.appendChild(colGroup);
  if (vals.colour) {
    if (vals.colour.modifier) colMod.value = vals.colour.modifier;
    if (vals.colour.basic) colBasic.value = vals.colour.basic;
    if (vals.colour.secondary) colSec.value = vals.colour.secondary;
  }

  // 5. Secondary Constituent
  var scGroup = _makeFormGroup('Secondary Constituent', '');
  scGroup.innerHTML = '<label class="desc-label">Secondary Constituent</label>';
  var scRow = document.createElement('div');
  scRow.className = 'desc-row-3';
  var scMinor = _makeSelect(std.secondaryConstituent.minor, { 'data-pick': 'sc_minor' });
  scMinor.querySelector('option').text = '—';
  var scMaterial = _makeSelect(std.secondaryConstituent.materialOptions, { 'data-pick': 'sc_material' });
  scMaterial.querySelector('option').text = '—';
  var scMajor = _makeSelect(std.secondaryConstituent.major, { 'data-pick': 'sc_major' });
  scMajor.querySelector('option').text = '—';
  scMinor.addEventListener('change', fire);
  scMaterial.addEventListener('change', fire);
  scMajor.addEventListener('change', fire);
  scRow.appendChild(scMinor);
  scRow.appendChild(scMaterial);
  scRow.appendChild(scMajor);
  scGroup.appendChild(scRow);
  wrapper.appendChild(scGroup);
  if (vals.secondaryConstituent) {
    if (vals.secondaryConstituent.minor) scMinor.value = vals.secondaryConstituent.minor;
    if (vals.secondaryConstituent.material) scMaterial.value = vals.secondaryConstituent.material;
    if (vals.secondaryConstituent.major) scMajor.value = vals.secondaryConstituent.major;
  }

  // 6. Primary Type
  var allPrimary = std.primaryType.options.concat(std.primaryType.composites);
  var ptSel = _makeSelect(allPrimary, { 'data-pick': 'primaryType' });
  ptSel.addEventListener('change', fire);
  if (vals.primaryType) ptSel.value = vals.primaryType;
  wrapper.appendChild(_makeFormGroup('Primary Type', ptSel.outerHTML));

  // 7. Origin
  var originGroup = document.createElement('div');
  originGroup.className = 'desc-form-group';
  originGroup.innerHTML = '<label class="desc-label">Origin / Geology</label>';
  var originInput = _makeDatalistInput('origin', std.origin.suggestions, 'e.g. Alluvium', { 'data-pick': 'origin' });
  originInput.querySelector('input').addEventListener('input', fire);
  originGroup.appendChild(originInput);
  wrapper.appendChild(originGroup);
  if (vals.origin) originGroup.querySelector('input').value = vals.origin;

  // 8. Organic Content
  var orgSel = _makeSelect(std.organicContent.options, { 'data-pick': 'organicContent' });
  orgSel.addEventListener('change', fire);
  if (vals.organicContent) orgSel.value = vals.organicContent;
  wrapper.appendChild(_makeFormGroup(std.organicContent.label, orgSel.outerHTML));

  // 9. Structure
  var structSel = _makeSelect(std.structure.options, { 'data-pick': 'structure' });
  structSel.addEventListener('change', fire);
  if (vals.structure) structSel.value = vals.structure;
  wrapper.appendChild(_makeFormGroup(std.structure.label, structSel.outerHTML));

  // Free text
  var ftGroup = document.createElement('div');
  ftGroup.className = 'desc-form-group';
  ftGroup.innerHTML = '<label class="desc-label">Additional Notes</label><input type="text" class="desc-input" data-pick="freeText" placeholder="Extra description details...">';
  ftGroup.querySelector('input').addEventListener('input', fire);
  wrapper.appendChild(ftGroup);
  if (vals.freeText) ftGroup.querySelector('input').value = vals.freeText;

  containerEl.innerHTML = '';
  containerEl.appendChild(wrapper);
}

// ─── Rock Picker Rendering ───────────────────────────────────────────────────

function renderRockPickers(containerEl, onChange, initialValues) {
  if (!containerEl) return;
  var std = STANDARDS.ROCK_BS5930;
  var vals = initialValues || {};
  var wrapper = document.createElement('div');
  wrapper.className = 'desc-builder-rock';

  function fire() { if (typeof onChange === 'function') onChange(); }

  // 1. Strength
  var strSel = _makeSelect(std.strength.options, { 'data-pick': 'strength' });
  strSel.addEventListener('change', fire);
  if (vals.strength) strSel.value = vals.strength;
  wrapper.appendChild(_makeFormGroup(std.strength.label, strSel.outerHTML));

  // 2. Weathering
  var weathGroup = document.createElement('div');
  weathGroup.className = 'desc-form-group';
  weathGroup.innerHTML = '<label class="desc-label">Weathering Grade</label>';
  var weathSys = document.createElement('select');
  weathSys.innerHTML = '<option value="primary">W1-W6 System</option><option value="alt">FR-RS System</option>';
  weathSys.className = 'desc-select';
  var weathVal = _makeSelect(std.weathering.system_primary);
  weathVal.setAttribute('data-pick', 'weathering');

  weathSys.addEventListener('change', function() {
    var list = weathSys.value === 'primary' ? std.weathering.system_primary : std.weathering.system_alt;
    weathVal.innerHTML = '<option value="">—</option>' +
      list.map(function(o) { return '<option value="' + o.value + '">' + o.label + '</option>'; }).join('');
    fire();
  });
  weathVal.addEventListener('change', fire);
  weathGroup.appendChild(weathSys);
  weathGroup.appendChild(weathVal);
  wrapper.appendChild(weathGroup);

  if (vals.weathering) {
    var inPrimary = std.weathering.system_primary.some(function(o) { return o.value === vals.weathering; });
    weathSys.value = inPrimary ? 'primary' : 'alt';
    weathSys.dispatchEvent(new Event('change'));
    weathVal.value = vals.weathering;
  }

  // 3. Colour
  var colGroup = document.createElement('div');
  colGroup.className = 'desc-form-group';
  colGroup.innerHTML = '<label class="desc-label">Colour</label>';
  var colRow = document.createElement('div');
  colRow.className = 'desc-row-3';
  var colMod = _makeSelect(std.colour.modifiers, { 'data-pick': 'colour_modifier' });
  colMod.querySelector('option').text = '—';
  var colBasic = _makeSelect(std.colour.basic, { 'data-pick': 'colour_basic' });
  var colSec = _makeSelect(std.colour.basic, { 'data-pick': 'colour_secondary' });
  colSec.querySelector('option').text = '—';
  colMod.addEventListener('change', fire);
  colBasic.addEventListener('change', fire);
  colSec.addEventListener('change', fire);
  colRow.appendChild(colMod);
  colRow.appendChild(colBasic);
  colRow.appendChild(colSec);
  colGroup.appendChild(colRow);
  wrapper.appendChild(colGroup);
  if (vals.colour) {
    if (vals.colour.modifier) colMod.value = vals.colour.modifier;
    if (vals.colour.basic) colBasic.value = vals.colour.basic;
    if (vals.colour.secondary) colSec.value = vals.colour.secondary;
  }

  // 4. Grain Size
  var gsGroup = document.createElement('div');
  gsGroup.className = 'desc-form-group';
  gsGroup.innerHTML = '<label class="desc-label">Grain Size</label>';
  var gsRow = document.createElement('div');
  gsRow.className = 'desc-row';
  var gsSel = _makeSelect(std.grainSize.options, { 'data-pick': 'grainSize' });
  gsSel.addEventListener('change', fire);
  var texSel = _makeSelect(std.grainSize.texture, { 'data-pick': 'texture' });
  texSel.querySelector('option').text = '—';
  texSel.addEventListener('change', fire);
  gsRow.appendChild(gsSel);
  gsRow.appendChild(texSel);
  gsGroup.appendChild(gsRow);
  wrapper.appendChild(gsGroup);
  if (vals.grainSize) gsSel.value = vals.grainSize;
  if (vals.texture) texSel.value = vals.texture;

  // 5. Rock Name
  var rnGroup = document.createElement('div');
  rnGroup.className = 'desc-form-group';
  rnGroup.innerHTML = '<label class="desc-label">ROCK NAME</label>';
  var rnCat = document.createElement('select');
  rnCat.innerHTML = '<option value="igneous">Igneous</option><option value="sedimentary">Sedimentary</option><option value="metamorphic">Metamorphic</option>';
  rnCat.className = 'desc-select';
  var rnVal = _makeSelect(std.rockName.igneous);
  rnVal.setAttribute('data-pick', 'rockName');
  rnCat.addEventListener('change', function() {
    rnVal.innerHTML = '<option value="">—</option>' +
      std.rockName[rnCat.value].map(function(o) { return '<option value="' + o.value + '">' + o.label + '</option>'; }).join('');
    fire();
  });
  rnVal.addEventListener('change', fire);
  rnGroup.appendChild(rnCat);
  rnGroup.appendChild(rnVal);
  wrapper.appendChild(rnGroup);
  if (vals.rockName) {
    for (var cat in std.rockName) {
      if (std.rockName[cat].some(function(o) { return o.value === vals.rockName; })) {
        rnCat.value = cat;
        rnCat.dispatchEvent(new Event('change'));
        rnVal.value = vals.rockName;
        break;
      }
    }
  }

  // 6. Discontinuities
  var discSel = _makeSelect(std.discontinuities.options, { 'data-pick': 'discontinuities' });
  discSel.addEventListener('change', fire);
  if (vals.discontinuities) discSel.value = vals.discontinuities;
  wrapper.appendChild(_makeFormGroup(std.discontinuities.label, discSel.outerHTML));

  // Free text
  var ftGroup = document.createElement('div');
  ftGroup.className = 'desc-form-group';
  ftGroup.innerHTML = '<label class="desc-label">Additional Notes</label><input type="text" class="desc-input" data-pick="freeText" placeholder="Extra description details...">';
  ftGroup.querySelector('input').addEventListener('input', fire);
  wrapper.appendChild(ftGroup);
  if (vals.freeText) ftGroup.querySelector('input').value = vals.freeText;

  containerEl.innerHTML = '';
  containerEl.appendChild(wrapper);
}

// ─── DOM Read / Write Helpers ────────────────────────────────────────────────

function _readPick(containerEl, pickName) {
  var el = containerEl.querySelector('[data-pick="' + pickName + '"]');
  if (!el) return '';
  return el.value || '';
}

function _writePick(containerEl, pickName, value) {
  var el = containerEl.querySelector('[data-pick="' + pickName + '"]');
  if (el && value !== undefined && value !== null) {
    el.value = value;
  }
}

// ─── Get Selections ──────────────────────────────────────────────────────────

function getSoilSelections(containerEl) {
  if (!containerEl) return {};
  return {
    consistency: _readPick(containerEl, 'consistency'),
    moisture: _readPick(containerEl, 'moisture'),
    plasticity: _readPick(containerEl, 'plasticity'),
    colour: {
      modifier: _readPick(containerEl, 'colour_modifier'),
      basic: _readPick(containerEl, 'colour_basic'),
      secondary: _readPick(containerEl, 'colour_secondary')
    },
    secondaryConstituent: {
      minor: _readPick(containerEl, 'sc_minor'),
      material: _readPick(containerEl, 'sc_material'),
      major: _readPick(containerEl, 'sc_major')
    },
    primaryType: _readPick(containerEl, 'primaryType'),
    origin: _readPick(containerEl, 'origin'),
    organicContent: _readPick(containerEl, 'organicContent'),
    structure: _readPick(containerEl, 'structure'),
    freeText: _readPick(containerEl, 'freeText')
  };
}

function getRockSelections(containerEl) {
  if (!containerEl) return {};
  return {
    strength: _readPick(containerEl, 'strength'),
    weathering: _readPick(containerEl, 'weathering'),
    colour: {
      modifier: _readPick(containerEl, 'colour_modifier'),
      basic: _readPick(containerEl, 'colour_basic'),
      secondary: _readPick(containerEl, 'colour_secondary')
    },
    grainSize: _readPick(containerEl, 'grainSize'),
    texture: _readPick(containerEl, 'texture'),
    rockName: _readPick(containerEl, 'rockName'),
    discontinuities: _readPick(containerEl, 'discontinuities'),
    freeText: _readPick(containerEl, 'freeText')
  };
}

// ─── Set Selections ──────────────────────────────────────────────────────────

function setSoilSelections(containerEl, values) {
  if (!containerEl || !values) return;
  _writePick(containerEl, 'consistency', values.consistency);
  _writePick(containerEl, 'moisture', values.moisture);
  _writePick(containerEl, 'plasticity', values.plasticity);
  _writePick(containerEl, 'primaryType', values.primaryType);
  _writePick(containerEl, 'origin', values.origin);
  _writePick(containerEl, 'organicContent', values.organicContent);
  _writePick(containerEl, 'structure', values.structure);
  _writePick(containerEl, 'freeText', values.freeText);
  if (values.colour) {
    _writePick(containerEl, 'colour_modifier', values.colour.modifier);
    _writePick(containerEl, 'colour_basic', values.colour.basic);
    _writePick(containerEl, 'colour_secondary', values.colour.secondary);
  }
  if (values.secondaryConstituent) {
    _writePick(containerEl, 'sc_minor', values.secondaryConstituent.minor);
    _writePick(containerEl, 'sc_material', values.secondaryConstituent.material);
    _writePick(containerEl, 'sc_major', values.secondaryConstituent.major);
  }
}

function setRockSelections(containerEl, values) {
  if (!containerEl || !values) return;
  _writePick(containerEl, 'strength', values.strength);
  _writePick(containerEl, 'weathering', values.weathering);
  _writePick(containerEl, 'grainSize', values.grainSize);
  _writePick(containerEl, 'texture', values.texture);
  _writePick(containerEl, 'rockName', values.rockName);
  _writePick(containerEl, 'discontinuities', values.discontinuities);
  _writePick(containerEl, 'freeText', values.freeText);
  if (values.colour) {
    _writePick(containerEl, 'colour_modifier', values.colour.modifier);
    _writePick(containerEl, 'colour_basic', values.colour.basic);
    _writePick(containerEl, 'colour_secondary', values.colour.secondary);
  }
}

// ─── Reset Pickers ───────────────────────────────────────────────────────────

function resetSoilPickers(containerEl) {
  if (!containerEl) return;
  var selects = containerEl.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    selects[i].selectedIndex = 0;
  }
  var inputs = containerEl.querySelectorAll('input');
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].value = '';
  }
}

function resetRockPickers(containerEl) {
  if (!containerEl) return;
  var selects = containerEl.querySelectorAll('select');
  for (var i = 0; i < selects.length; i++) {
    selects[i].selectedIndex = 0;
  }
  var inputs = containerEl.querySelectorAll('input');
  for (var j = 0; j < inputs.length; j++) {
    inputs[j].value = '';
  }
}

// ─── Set Free Text ───────────────────────────────────────────────────────────

function setFreeText(containerEl, text) {
  if (!containerEl) return;
  var ftEl = containerEl.querySelector('[data-pick="freeText"]');
  if (ftEl) ftEl.value = text || '';
}

// ─── Set Standard ────────────────────────────────────────────────────────────

function setStandard(std) {
  if (std === 'BS5930' || std === 'ISO14688' || std === 'AS1726') {
    _currentStandard = std;
  }
}

// ─── Get Options (for external inspection / custom UIs) ──────────────────────

function getSoilOptions(standard) {
  var s = standard || _currentStandard || 'BS5930';
  if (s === 'AS1726') return STANDARDS.AS1726;
  return STANDARDS.BS5930;
}

function getRockOptions(standard) {
  var s = standard || _currentStandard || 'BS5930';
  if (s === 'AS1726') return STANDARDS.ROCK_AS1726;
  return STANDARDS.ROCK_BS5930;
}

// ─── Module State ────────────────────────────────────────────────────────────

var _currentStandard = 'BS5930';

// ─── Exported API ────────────────────────────────────────────────────────────

export const DescBuilder = {
  // Current standard
  get standard() { return _currentStandard; },
  set standard(val) { setStandard(val); },

  // Option sets for UI construction
  getSoilOptions: getSoilOptions,
  getRockOptions: getRockOptions,

  // Description builders
  buildSoilDescription: buildSoilDescription,
  buildRockDescription: buildRockDescription,

  // Calculators
  calculateSPT: calculateSPT,
  calculateCoreMetrics: calculateCoreMetrics,

  // DOM rendering
  renderSoilPickers: renderSoilPickers,
  renderRockPickers: renderRockPickers,

  // DOM read
  getSoilSelections: getSoilSelections,
  getRockSelections: getRockSelections,

  // DOM write
  setSoilSelections: setSoilSelections,
  setRockSelections: setRockSelections,

  // Reset
  resetSoilPickers: resetSoilPickers,
  resetRockPickers: resetRockPickers,

  // Free text
  setFreeText: setFreeText,

  // Standard
  setStandard: setStandard
};