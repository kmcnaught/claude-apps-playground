# Custom Planting Calendar

A simple, accessible web application for creating personalized vegetable garden planting calendars based on your location and crop preferences.

## Features

- **Location Detection**: Enter ZIP code or use current location
- **Smart Crop Selection**: See crops suitable for your hardiness zone
- **Custom Calendars**: Generate planting schedules tailored to your selections
- **Multiple Layouts**:
  - Monthly TODO list
  - Visual calendar
  - Kid-friendly version
- **Print-Ready**: Optimized for printing
- **Fully Accessible**: WCAG 2.2 compliant

## Getting Started

### Local Development

1. Clone this repository
2. Open `index.html` in a web browser
3. For full functionality (geolocation), serve via HTTP:
   ```bash
   # Using Python 3
   python3 -m http.server 8000

   # Using Node.js
   npx serve
   ```
4. Visit `http://localhost:8000`

### GitHub Pages Deployment

This is a static site ready for GitHub Pages:

1. Push to your GitHub repository
2. Go to Settings → Pages
3. Select branch to deploy (e.g., `main`)
4. Your site will be available at `https://username.github.io/repo-name`

## Project Structure

```
.
├── index.html              # Main HTML file
├── css/
│   ├── styles.css         # Main styles
│   └── print.css          # Print-specific styles
├── js/
│   ├── main.js            # App initialization and UI
│   ├── location.js        # Location/zone detection
│   ├── crops.js           # Crop selection logic
│   └── calendar.js        # Calendar generation
└── data/
    ├── crops.json         # Crop database
    ├── zones.json         # Hardiness zone data
    └── planting-schedules.json  # Planting schedules by zone
```

## How It Works

1. **Step 1 - Location**: Enter your ZIP code or use geolocation to determine your USDA hardiness zone
2. **Step 2 - Crops**: Select from vegetables that grow well in your zone (top 10 pre-selected)
3. **Step 3 - Calendar**: View and print your custom planting calendar in your preferred layout

## Data Sources

Currently using placeholder data for demonstration. In production, data should be sourced from:

- **USDA Hardiness Zones**: Via Frostline API or similar
- **Planting Schedules**: University extension services, Old Farmer's Almanac
- **Crop Information**: Open-source gardening databases

## Browser Requirements

- Modern browsers (Chrome, Firefox, Safari, Edge)
- JavaScript enabled
- Geolocation support (optional, manual ZIP entry available)

## Accessibility

This app follows WCAG 2.2 guidelines:

- Keyboard navigable
- Screen reader compatible
- Sufficient color contrast (4.5:1 for text, 3:1 for UI components)
- Clear labels and instructions
- Focus indicators
- No reliance on color alone for information

## Future Enhancements

- [ ] Expand crop database
- [ ] Add more hardiness zones
- [ ] Companion planting suggestions
- [ ] Export to ICS (calendar) format
- [ ] Multi-season planning
- [ ] Regional varieties

## Contributing

Contributions welcome! Please ensure:

- Maintain accessibility standards
- Add new crops with complete planting data
- Test across browsers
- Update documentation

## License

MIT License - feel free to use and modify for your own projects.
