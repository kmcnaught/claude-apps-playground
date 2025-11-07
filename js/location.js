// Location and Zone Detection Module

class LocationService {
    constructor() {
        this.currentZone = null;
        this.zonesData = null;
    }

    async loadZonesData() {
        try {
            const response = await fetch('data/zones.json');
            this.zonesData = await response.json();
            return this.zonesData;
        } catch (error) {
            console.error('Error loading zones data:', error);
            throw new Error('Failed to load zone data');
        }
    }

    async getZoneByZipCode(zipCode) {
        if (!this.zonesData) {
            await this.loadZonesData();
        }

        const zoneInfo = this.zonesData.zones[zipCode];

        if (!zoneInfo) {
            // For demo purposes, assign a default zone if ZIP not found
            return {
                zone: '7',
                subzone: 'a',
                fullZone: '7a',
                zipCode: zipCode,
                isEstimate: true
            };
        }

        return {
            ...zoneInfo,
            zipCode: zipCode,
            isEstimate: false
        };
    }

    async getCurrentLocation() {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by your browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude
                    });
                },
                (error) => {
                    let message = 'Unable to retrieve your location';
                    switch(error.code) {
                        case error.PERMISSION_DENIED:
                            message = 'Location permission denied';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            message = 'Location information unavailable';
                            break;
                        case error.TIMEOUT:
                            message = 'Location request timed out';
                            break;
                    }
                    reject(new Error(message));
                }
            );
        });
    }

    async reverseGeocode(latitude, longitude) {
        try {
            // Using BigDataCloud's free reverse geocoding API
            const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;

            const response = await fetch(url);
            const data = await response.json();

            if (data.postcode) {
                // Extract 5-digit ZIP from postcode
                const zipMatch = data.postcode.match(/\d{5}/);
                if (zipMatch) {
                    return zipMatch[0];
                }
            }

            throw new Error('Could not determine ZIP code from location');
        } catch (error) {
            console.error('Reverse geocoding error:', error);
            throw error;
        }
    }

    async detectZoneFromLocation() {
        try {
            const location = await this.getCurrentLocation();
            const zipCode = await this.reverseGeocode(location.latitude, location.longitude);
            const zoneInfo = await this.getZoneByZipCode(zipCode);
            this.currentZone = zoneInfo;
            return zoneInfo;
        } catch (error) {
            throw error;
        }
    }

    getZoneDetails(zone) {
        if (!this.zonesData) {
            return null;
        }

        const zoneNum = zone.toString();
        return this.zonesData.zoneInfo[zoneNum] || null;
    }

    setCurrentZone(zoneInfo) {
        this.currentZone = zoneInfo;
    }

    getCurrentZone() {
        return this.currentZone;
    }
}

export default LocationService;
