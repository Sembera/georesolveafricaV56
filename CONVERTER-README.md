# G-Resconvt - Professional Coordinate Converter

## Overview
G-Resconvt is a fully functional, professional-grade coordinate transformation tool from **Georesolve Africa**, specifically designed for East African countries. This standalone web application supports all major coordinate reference systems (CRS) used across Uganda, Rwanda, Burundi, Tanzania, Kenya, Somalia, and the Democratic Republic of Congo (DRC).

Part of the G-Resolve suite of professional geoscience tools, G-Resconvt brings world-class coordinate transformation capabilities to East African professionals.

## Features

### ✅ Supported Countries & Systems
- **Uganda** - Arc 1960 (UTM 35N/S, 36N/S)
- **Rwanda** - Rwanda 2000 (RGR 2000, UTM 35S/36S)
- **Burundi** - Arc 1960 (UTM 35S/36S)
- **Tanzania** - Arc 1960 (UTM 35S/36S/37S)
- **Kenya** - Kenya 1960 & Arc 1960 (UTM 37N/S)
- **Somalia** - WGS84 (UTM 38N/39N)
- **DRC** - WGS84 (UTM 32S-36S) + Belgian Congo 1950 (legacy)

### 📐 Coordinate Formats
- **Decimal Degrees (DD)** - e.g., 0.3476, 32.5825
- **Degrees Minutes Seconds (DMS)** - e.g., 0°20'51.4"N, 32°34'57"E
- **Degrees + Decimal Minutes (DDM)** - e.g., 0°20.856'N, 32°34.95'E
- **UTM** - Easting, Northing, Zone, Hemisphere

### 🔄 Conversion Capabilities
- Any CRS → Any CRS
- All format combinations (DD ↔ DMS ↔ DDM ↔ UTM)
- Accurate datum transformations using 3-parameter Helmert
- Auto-detection of UTM zones from lat/long
- Manual UTM zone override available

### 📊 Input Methods
1. **Single Point Conversion**
   - Direct coordinate entry in any format
   - Real-time format switching
   - Instant conversion

2. **Batch Processing**
   - CSV file upload
   - Copy-paste multiple coordinates
   - Process hundreds of points at once

### 📤 Output Options
- Interactive results table
- Download as CSV
- Copy to clipboard
- Multiple format outputs (DD, DMS, DDM)
- Error reporting for invalid coordinates

## Quick Start

Simply open **g-resconvt.html** in any modern web browser - no installation required!

Or access it through the **Georesolve Africa Resources** page at resources.html.

## Usage Guide

### Single Point Conversion

1. **Select Input Format**
   - Choose from DD, DMS, DDM, or UTM
   - Input fields update automatically

2. **Enter Coordinates**
   - For DD: Enter latitude and longitude
   - For DMS: Enter degrees, minutes, seconds
   - For DDM: Enter degrees and decimal minutes
   - For UTM: Enter easting, northing, zone, hemisphere

3. **Select CRS Systems**
   - Input CRS: Original coordinate system
   - Output CRS: Desired coordinate system

4. **Convert**
   - Click "Convert" button
   - View results in table format
   - See all available formats (DD, DMS, DDM)

### Batch/CSV Processing

1. **Prepare Your Data**
   - CSV format: `Name,Latitude,Longitude` or `Name,X,Y`
   - First row can be a header (optional)
   - Minimum 2 columns required (coordinates)

2. **Upload or Paste**
   - Upload CSV file via drag-and-drop or browse
   - OR paste coordinates directly (one per line)

3. **Select CRS Systems**
   - Choose input and output coordinate systems

4. **Convert All**
   - Process entire dataset
   - View results in scrollable table
   - Download converted coordinates as CSV

### Sample CSV Format
```csv
Name,Latitude,Longitude
Kampala Uganda,0.3476,32.5825
Kigali Rwanda,-1.9441,30.0619
Bujumbura Burundi,-3.3731,29.9189
```

## Supported EPSG Codes

### Global Systems
- **EPSG:4326** - WGS84 Geographic
- **EPSG:32635-32639** - WGS84 / UTM Zones 35N-39N
- **EPSG:32732-32739** - WGS84 / UTM Zones 32S-39S

### Uganda (Arc 1960)
- **EPSG:4209** - Arc 1960 Geographic
- **EPSG:21095** - Arc 1960 / UTM 35N
- **EPSG:21035** - Arc 1960 / UTM 35S
- **EPSG:21096** - Arc 1960 / UTM 36N
- **EPSG:21036** - Arc 1960 / UTM 36S

### Rwanda (RGR 2000)
- **EPSG:4759** - Rwanda 2000 Geographic
- **EPSG:32735** - Rwanda 2000 / UTM 35S
- **EPSG:32736** - Rwanda 2000 / UTM 36S

### Burundi (Arc 1960)
- **EPSG:4209** - Arc 1960 Geographic
- **EPSG:21035** - Arc 1960 / UTM 35S
- **EPSG:21036** - Arc 1960 / UTM 36S

### Tanzania (Arc 1960)
- **EPSG:4209** - Arc 1960 Geographic
- **EPSG:21035** - Arc 1960 / UTM 35S
- **EPSG:21036** - Arc 1960 / UTM 36S
- **EPSG:21037** - Arc 1960 / UTM 37S

### Kenya
- **EPSG:4210** - Kenya 1960 Geographic
- **EPSG:21097** - Arc 1960 / UTM 37N
- **EPSG:21037** - Arc 1960 / UTM 37S

### Somalia (WGS84)
- **EPSG:4326** - WGS84 Geographic
- **EPSG:32638** - WGS84 / UTM 38N
- **EPSG:32639** - WGS84 / UTM 39N

### DRC (WGS84)
- **EPSG:4326** - WGS84 Geographic
- **EPSG:32732** - WGS84 / UTM 32S
- **EPSG:32733** - WGS84 / UTM 33S
- **EPSG:32734** - WGS84 / UTM 34S
- **EPSG:32735** - WGS84 / UTM 35S
- **EPSG:32736** - WGS84 / UTM 36S

### DRC Legacy (Belgian Congo 1950)
- **EPSG:4196** - Belgian Congo 1950 Geographic
- **EPSG:3347** - Belgian Congo 1950 / UTM 34S
- **EPSG:3348** - Belgian Congo 1950 / UTM 35S

## Technical Details

### Technologies Used
- **Proj4js** - Coordinate transformation library
- **Pure JavaScript** - No framework dependencies
- **HTML5 & CSS3** - Modern, responsive design
- **CDN-based** - No installation required

### Datum Transformations
The converter uses accurate Helmert transformation parameters:

- **Arc 1960**: `+towgs84=-160,-6,-302,0,0,0,0`
- **Belgian Congo 1950**: `+towgs84=-103.746,-9.614,-255.95,0,0,0,0`
- **Rwanda 2000**: WGS84-based (no transformation needed)

### Browser Compatibility
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Embedding Options

### Option 1: Standalone Page
```html
<a href="g-resconvt.html" target="_blank">
    Open G-Resconvt Converter
</a>
```

### Option 2: iFrame Embed
```html
<iframe
    src="g-resconvt.html"
    width="100%"
    height="800px"
    frameborder="0"
    style="border: 1px solid #ccc; border-radius: 8px;">
</iframe>
```

### Option 3: New Window/Tab
```javascript
function openConverter() {
    window.open(
        'g-resconvt.html',
        'GResconvt',
        'width=1200,height=800,scrollbars=yes,resizable=yes'
    );
}
```

## File Structure
```
g-resconvt.html             # Main application (standalone)
sample-coordinates.csv      # Sample data for testing
CONVERTER-README.md         # This documentation
```

## Validation & Error Handling

### Coordinate Validation
- Latitude range: -90° to 90°
- Longitude range: -180° to 180°
- UTM easting/northing range checks
- Invalid input detection

### Error Messages
- Clear, user-friendly error descriptions
- Row-by-row error reporting in batch mode
- Warning alerts for partial failures
- Success confirmations

## Best Practices

### For Accurate Results
1. **Use the correct input CRS** - Verify your source coordinate system
2. **Check coordinate order** - Ensure lat/lon or X/Y order matches your data
3. **Validate outputs** - Cross-check critical conversions
4. **Use appropriate zones** - Select UTM zones that cover your area of interest

### For Batch Processing
1. **Clean your data** - Remove empty rows and invalid entries
2. **Include headers** - Use descriptive column names
3. **Test with samples** - Verify with a few points before batch processing
4. **Download results** - Save conversions for record-keeping

## Troubleshooting

### Common Issues

**Q: Coordinates look wrong after conversion**
- Verify you selected the correct input CRS
- Check if lat/lon order is reversed (should be Y, X)
- Ensure coordinate values are in the expected range

**Q: CSV upload not working**
- Check file format (must be .csv)
- Verify comma separation
- Ensure at least 2 numeric columns exist

**Q: Some batch conversions failed**
- Review error messages in results table
- Check for out-of-range coordinates
- Verify CRS compatibility with coordinate locations

**Q: UTM conversion issues**
- Confirm correct zone selection
- Verify hemisphere (North/South)
- Check easting/northing values are reasonable

## Accuracy Notes

### Transformation Accuracy
- Geographic ↔ Geographic: ±2-5 meters
- Geographic ↔ UTM: Sub-meter accuracy
- Arc 1960 ↔ WGS84: ±5-10 meters (datum shift)
- Belgian Congo 1950 ↔ WGS84: ±10-20 meters (older datum)

### Precision
- Decimal Degrees: 6 decimal places (~0.1 meters)
- DMS: 4 decimal places for seconds (~3 meters)
- UTM: 3 decimal places (millimeter precision)

## Branding

**G-Resconvt** is part of the **G-Resolve** suite of professional geoscience tools by **Georesolve Africa**:

- **G-Resolog** - Professional geotechnical borehole logging
- **G-Resconvt** - Professional coordinate system converter
- More tools coming soon!

## License & Credits
G-Resconvt is powered by:
- **Proj4js** - Open-source projection library
- **EPSG Database** - Coordinate system definitions
- **Georesolve Africa** - Professional geoscience solutions

## Support
For issues, questions, or feature requests:
- Visit: [Georesolve Africa Resources](https://georesolve.africa/resources.html)
- Email: info@georesolve.africa

## Version
**Version 1.0** - Released 2025
- Initial release with full East Africa support
- All major CRS systems included (45+ EPSG codes)
- Single and batch processing
- Multiple format conversions
- Integrated with Georesolve Africa resources platform
