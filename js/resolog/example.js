// Synthetic training data; never a measured site or client project.
export function exampleProject(purpose = 'geotechnical') { const data = {
  "version": 2,
  "project": {
    "name": "Demonstration borehole",
    "client": "EXAMPLE DATA — synthetic observations",
    "jobNo": "DEMO",
    "defaults": {
      "example": true
    }
  },
  "holes": [
    {
      "hole": {
        "id": "example-hole",
        "name": "EXAMPLE-BH01",
        "type": "soil",
        "depth": 12,
        "drillMethod": "PD",
        "dia": 150,
        "order": 0
      },
      "intervals": [
        {
          "id": "ex-0",
          "topDepth": 0,
          "baseDepth": 0.4,
          "pattern": "topsoil",
          "description": "Dark brown TOPSOIL with fine roots.",
          "order": 0
        },
        {
          "id": "ex-1",
          "topDepth": 0.4,
          "baseDepth": 3,
          "pattern": "clay",
          "description": "Firm reddish brown sandy CLAY.",
          "order": 1
        },
        {
          "id": "ex-2",
          "topDepth": 3,
          "baseDepth": 7.5,
          "pattern": "sand",
          "description": "Medium dense brown silty fine to medium SAND.",
          "order": 2
        },
        {
          "id": "ex-3",
          "topDepth": 7.5,
          "baseDepth": 12,
          "pattern": "gravel",
          "description": "Dense sandy GRAVEL with subangular fragments.",
          "order": 3
        }
      ],
      "fieldTests": [
        {
          "depth": 1.5,
          "type": "SPT",
          "intervalId": "ex-1",
          "data": {
            "seating": 3,
            "blow1": "4",
            "blow2": "5",
            "blow3": "6",
            "n": 11
          }
        },
        {
          "depth": 4.5,
          "type": "SPT",
          "intervalId": "ex-2",
          "data": {
            "seating": 3,
            "blow1": "6",
            "blow2": "8",
            "blow3": "10",
            "n": 18
          }
        },
        {
          "depth": 9,
          "type": "SPT",
          "intervalId": "ex-3",
          "data": {
            "seating": 3,
            "blow1": "12",
            "blow2": "15",
            "blow3": "18",
            "n": 33
          }
        }
      ],
      "samples": [
        {
          "type": "D",
          "topDepth": 0.5,
          "baseDepth": 1,
          "label": "EX-D01"
        },
        {
          "type": "U",
          "topDepth": 2,
          "baseDepth": 2.45,
          "label": "EX-U01"
        },
        {
          "type": "D",
          "topDepth": 5,
          "baseDepth": 5.5,
          "label": "EX-D02"
        }
      ],
      "waterStrikes": [
        {
          "depth": 4.2,
          "restLevel": 3.8,
          "remarks": "Synthetic observation for demonstration only"
        }
      ],
      "casing": []
    }
  ]
};
  data.project.defaults.examplePurpose = purpose;
  data.project.name = 'EXAMPLE — '+purpose+' log';
  const h = data.holes[0]; h.hole.purpose = purpose;
  if(purpose === 'mining') {
    h.hole.type = 'core'; h.hole.drillMethod = 'DC';
    h.intervals = [
      {id:'mine-1',topDepth:0,baseDepth:2,pattern:'laterite',description:'Reddish brown residual soil and weathered rock fragments.'},
      {id:'mine-2',topDepth:2,baseDepth:6,pattern:'schist',description:'Grey quartz-mica SCHIST; moderately weathered, closely fractured.',weathering:'MW',strength:'R2',tcr:85,rqd:42,defectSpacing:80},
      {id:'mine-3',topDepth:6,baseDepth:12,pattern:'quartzite',description:'Light grey QUARTZITE with thin mica-rich bands; slightly weathered, strong.',weathering:'SW',strength:'R4',tcr:97,rqd:76,defectSpacing:250}
    ];
    h.fieldTests=[]; h.waterStrikes=[];
  }
  if(purpose === 'groundwater' || purpose === 'environmental') {
    h.fieldTests=[];
    h.casing=[{topDepth:0,baseDepth:7.5,type:'Plain uPVC casing',dia:125},{topDepth:7.5,baseDepth:12,type:'Slotted uPVC screen',dia:125}];
  }
  if(purpose === 'testpit') {
    h.hole.type='testpit';h.hole.depth=3;h.hole.drillMethod='TP';h.intervals=h.intervals.slice(0,2);h.fieldTests=[];h.waterStrikes=[];h.samples=h.samples.filter(s=>s.baseDepth<=3);
  }
  return data;
}
