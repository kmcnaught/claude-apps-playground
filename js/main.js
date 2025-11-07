// Main Application Module
import LocationService from './location.js';
import CropService from './crops.js';
import CalendarService from './calendar.js';

class PlantingCalendarApp {
    constructor() {
        this.locationService = new LocationService();
        this.cropService = new CropService();
        this.calendarService = new CalendarService();
        this.currentZone = null;
        this.availableCrops = [];
        this.citiesData = null;

        this.init();
    }

    async init() {
        // Load all data
        await Promise.all([
            this.locationService.loadZonesData(),
            this.cropService.loadCropsData(),
            this.calendarService.loadScheduleData(),
            this.loadCitiesData()
        ]);

        this.populateCitiesList();
        this.setupEventListeners();

        // Auto-detect location on page load
        this.autoDetectLocation();

        // Load and display build info
        this.loadBuildInfo();
    }

    async loadBuildInfo() {
        try {
            const response = await fetch('build-info.json');
            const buildInfo = await response.json();

            const buildInfoEl = document.getElementById('build-info');
            buildInfoEl.innerHTML = `
                <small>
                    Last deployed: ${buildInfo.date}
                    <span style="opacity: 0.6;">| Build #${buildInfo.runNumber} | ${buildInfo.commitShort}</span>
                </small>
            `;
        } catch (error) {
            // Build info not available (local dev or error)
            const buildInfoEl = document.getElementById('build-info');
            buildInfoEl.innerHTML = '<small>Development version</small>';
        }
    }

    async loadCitiesData() {
        try {
            const response = await fetch('data/cities.json');
            this.citiesData = await response.json();
            return this.citiesData;
        } catch (error) {
            console.error('Error loading cities data:', error);
            return null;
        }
    }

    populateCitiesList() {
        if (!this.citiesData) return;

        const datalist = document.getElementById('cities-list');
        this.citiesData.cities.forEach(city => {
            const option = document.createElement('option');
            option.value = city.name;
            option.setAttribute('data-zip', city.zip);
            datalist.appendChild(option);
        });
    }

    async autoDetectLocation() {
        const statusDiv = document.getElementById('auto-detect-status');

        try {
            const zoneInfo = await this.locationService.detectZoneFromIP();
            this.currentZone = zoneInfo;
            this.showDetectedLocation(zoneInfo);
            statusDiv.hidden = true;
            document.getElementById('confirm-location-btn').disabled = false;
        } catch (error) {
            // Show location picker if auto-detect fails
            statusDiv.hidden = true;
            this.showLocationPicker();
        }
    }

    showDetectedLocation(zoneInfo) {
        const detectedDiv = document.getElementById('detected-location');
        const locationNameEl = document.getElementById('location-name');

        let locationText = '';
        if (zoneInfo.city && zoneInfo.region) {
            locationText = `${zoneInfo.city}, ${zoneInfo.region}`;
        } else if (zoneInfo.zipCode) {
            locationText = `ZIP ${zoneInfo.zipCode}`;
        }

        const methodText = zoneInfo.method === 'ip' ? ' (from your IP address)' : '';
        locationNameEl.textContent = locationText + methodText;

        detectedDiv.hidden = false;
        this.displayZoneInfo(zoneInfo);
    }

    showLocationPicker() {
        document.getElementById('detected-location').hidden = true;
        document.getElementById('location-picker').hidden = false;
        document.getElementById('location-input').focus();
    }

    hideLocationPicker() {
        document.getElementById('location-picker').hidden = true;
        if (this.currentZone) {
            this.showDetectedLocation(this.currentZone);
        }
    }

    setupEventListeners() {
        // Location section
        const changeLocationBtn = document.getElementById('change-location-btn');
        const cancelChangeBtn = document.getElementById('cancel-change-btn');
        const locationInput = document.getElementById('location-input');
        const usePreciseLocationBtn = document.getElementById('use-precise-location-btn');
        const confirmLocationBtn = document.getElementById('confirm-location-btn');

        changeLocationBtn.addEventListener('click', () => {
            this.showLocationPicker();
        });

        cancelChangeBtn.addEventListener('click', () => {
            this.hideLocationPicker();
            locationInput.value = '';
        });

        // Handle both city selection and ZIP code entry
        locationInput.addEventListener('input', (e) => {
            const value = e.target.value.trim();

            // Check if it's a ZIP code
            if (/^\d{5}$/.test(value)) {
                this.handleLocationInput(value, 'zip');
            }
            // Update ARIA expanded state
            e.target.setAttribute('aria-expanded', value.length > 0);
        });

        locationInput.addEventListener('change', (e) => {
            const value = e.target.value.trim();
            // Check if it's a city from the list
            const city = this.citiesData?.cities.find(c => c.name === value);
            if (city) {
                this.handleLocationInput(value, 'city');
            }
        });

        usePreciseLocationBtn.addEventListener('click', () => {
            this.handleUsePreciseLocation();
        });

        confirmLocationBtn.addEventListener('click', () => {
            this.showCropSelection();
        });

        // Crop selection section
        const cropSearch = document.getElementById('crop-search');
        const selectAllBtn = document.getElementById('select-all-btn');
        const deselectAllBtn = document.getElementById('deselect-all-btn');
        const backToLocationBtn = document.getElementById('back-to-location-btn');
        const generateCalendarBtn = document.getElementById('generate-calendar-btn');

        cropSearch.addEventListener('input', (e) => {
            this.filterCrops(e.target.value);
        });

        selectAllBtn.addEventListener('click', () => {
            this.selectAllCrops();
        });

        deselectAllBtn.addEventListener('click', () => {
            this.deselectAllCrops();
        });

        backToLocationBtn.addEventListener('click', () => {
            this.showLocationSection();
        });

        generateCalendarBtn.addEventListener('click', () => {
            this.generateCalendar();
        });

        // Calendar section
        const layoutRadios = document.querySelectorAll('input[name="layout"]');
        const printCalendarBtn = document.getElementById('print-calendar-btn');
        const startOverBtn = document.getElementById('start-over-btn');

        layoutRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.updateCalendarLayout(e.target.value);
            });
        });

        printCalendarBtn.addEventListener('click', () => {
            window.print();
        });

        startOverBtn.addEventListener('click', () => {
            this.resetApp();
        });
    }

    async handleLocationInput(value, type) {
        if (!value) return;

        if (type === 'zip') {
            // Handle ZIP code
            try {
                const zoneInfo = await this.locationService.getZoneByZipCode(value);
                this.currentZone = zoneInfo;
                this.hideLocationPicker();
                this.showDetectedLocation(zoneInfo);
                document.getElementById('confirm-location-btn').disabled = false;
            } catch (error) {
                console.error('Error with ZIP code:', error);
            }
        } else if (type === 'city') {
            // Handle city selection
            const city = this.citiesData.cities.find(c => c.name === value);
            if (!city) return;

            let zoneInfo;
            if (city.zip) {
                // US city with ZIP
                zoneInfo = await this.locationService.getZoneByZipCode(city.zip);
            } else if (city.zone) {
                // International city with direct zone
                const zoneMatch = city.zone.match(/^(\d+)([ab]?)$/);
                if (zoneMatch) {
                    zoneInfo = {
                        zone: zoneMatch[1],
                        subzone: zoneMatch[2] || '',
                        fullZone: city.zone,
                        city: city.name.split(',')[0],
                        region: city.country,
                        method: 'city-select',
                        isEstimate: false
                    };
                }
            }

            if (zoneInfo) {
                this.currentZone = zoneInfo;
                this.hideLocationPicker();
                this.showDetectedLocation(zoneInfo);
                document.getElementById('confirm-location-btn').disabled = false;
            }
        }
    }

    async handleUsePreciseLocation() {
        const btn = document.getElementById('use-precise-location-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = '<span class="loading"></span> Getting location...';
        btn.disabled = true;

        try {
            const zoneInfo = await this.locationService.detectZoneFromPreciseLocation();
            zoneInfo.method = 'gps';
            this.currentZone = zoneInfo;
            this.hideLocationPicker();
            this.showDetectedLocation(zoneInfo);
            document.getElementById('confirm-location-btn').disabled = false;
        } catch (error) {
            alert(error.message);
        } finally {
            btn.innerHTML = originalText;
            btn.disabled = false;
        }
    }

    displayZoneInfo(zoneInfo) {
        const zoneCard = document.getElementById('zone-info-card');
        const zoneNumber = document.getElementById('zone-number');
        const zoneDescription = document.getElementById('zone-description');

        const zoneDetails = this.locationService.getZoneDetails(zoneInfo.zone);

        zoneNumber.textContent = zoneInfo.fullZone;

        if (zoneDetails) {
            zoneDescription.innerHTML = `
                ${zoneDetails.description}<br>
                Last Frost: ~${zoneDetails.avgLastFrost} | First Frost: ~${zoneDetails.avgFirstFrost}
            `;
        }

        zoneCard.hidden = false;
    }

    showCropSelection() {
        document.getElementById('location-section').hidden = true;
        document.getElementById('crop-section').hidden = false;

        this.availableCrops = this.cropService.getCropsForZone(this.currentZone.fullZone);
        this.renderCropList();

        // Pre-select top 10 crops
        const topCrops = this.cropService.selectTopCrops(this.availableCrops, 10);
        this.cropService.setSelectedCrops(topCrops);
        this.updateCropCheckboxes();
    }

    renderCropList() {
        const cropList = document.getElementById('crop-list');
        const html = this.availableCrops.map(crop => `
            <div class="crop-item">
                <input
                    type="checkbox"
                    id="crop-${crop.id}"
                    name="crop"
                    value="${crop.id}"
                    data-crop-id="${crop.id}"
                >
                <label for="crop-${crop.id}">
                    ${crop.name}
                    <span class="crop-category">${crop.category}</span>
                </label>
            </div>
        `).join('');

        cropList.innerHTML = html;

        // Add event listeners to checkboxes
        cropList.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', (e) => {
                this.cropService.toggleCrop(e.target.value);
                this.updateGenerateButton();
            });
        });
    }

    updateCropCheckboxes() {
        const selectedCrops = this.cropService.getSelectedCrops();
        document.querySelectorAll('input[name="crop"]').forEach(checkbox => {
            checkbox.checked = selectedCrops.includes(checkbox.value);
        });
        this.updateGenerateButton();
    }

    filterCrops(searchTerm) {
        const filtered = this.cropService.filterCrops(this.availableCrops, searchTerm);
        const selectedCrops = this.cropService.getSelectedCrops();

        document.querySelectorAll('.crop-item').forEach(item => {
            const checkbox = item.querySelector('input[type="checkbox"]');
            const cropId = checkbox.value;
            const crop = this.availableCrops.find(c => c.id === cropId);

            if (filtered.includes(crop)) {
                item.style.display = 'flex';
            } else {
                item.style.display = 'none';
            }
        });
    }

    selectAllCrops() {
        const allCropIds = this.availableCrops.map(crop => crop.id);
        this.cropService.setSelectedCrops(allCropIds);
        this.updateCropCheckboxes();
    }

    deselectAllCrops() {
        this.cropService.setSelectedCrops([]);
        this.updateCropCheckboxes();
    }

    updateGenerateButton() {
        const selectedCount = this.cropService.getSelectedCrops().length;
        const btn = document.getElementById('generate-calendar-btn');
        btn.disabled = selectedCount === 0;
    }

    showLocationSection() {
        document.getElementById('crop-section').hidden = true;
        document.getElementById('location-section').hidden = false;
    }

    generateCalendar() {
        const selectedCropIds = this.cropService.getSelectedCrops();
        const selectedCrops = selectedCropIds.map(id =>
            this.cropService.getCropById(id)
        );

        const calendar = this.calendarService.generateMonthlyCalendar(
            selectedCrops,
            this.currentZone.fullZone
        );

        this.currentCalendar = calendar;

        // Show calendar section
        document.getElementById('crop-section').hidden = true;
        document.getElementById('calendar-section').hidden = false;

        // Display zone in header
        document.getElementById('selected-zone').textContent = this.currentZone.fullZone;

        // Render with default layout (monthly)
        this.updateCalendarLayout('monthly');
    }

    updateCalendarLayout(layout) {
        const output = document.getElementById('calendar-output');
        let html = '';

        switch (layout) {
            case 'monthly':
                html = this.calendarService.renderMonthlyTodo(this.currentCalendar);
                break;
            case 'visual':
                html = this.calendarService.renderVisualCalendar(this.currentCalendar);
                break;
            case 'kids':
                html = this.calendarService.renderKidFriendly(this.currentCalendar);
                break;
        }

        output.innerHTML = html;
    }

    resetApp() {
        // Reset form inputs
        document.getElementById('zipcode').value = '';
        document.getElementById('zone-result').innerHTML = '';
        document.getElementById('crop-search').value = '';
        document.getElementById('confirm-location-btn').disabled = true;

        // Reset services
        this.cropService.setSelectedCrops([]);
        this.currentZone = null;
        this.currentCalendar = null;

        // Show location section
        document.getElementById('calendar-section').hidden = true;
        document.getElementById('crop-section').hidden = true;
        document.getElementById('location-section').hidden = false;

        // Reset layout to monthly
        document.querySelector('input[name="layout"][value="monthly"]').checked = true;
    }
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new PlantingCalendarApp();
    });
} else {
    new PlantingCalendarApp();
}
