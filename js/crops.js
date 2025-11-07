// Crop Selection Module

class CropService {
    constructor() {
        this.cropsData = null;
        this.selectedCrops = [];
    }

    async loadCropsData() {
        try {
            const response = await fetch('data/crops.json');
            this.cropsData = await response.json();
            return this.cropsData;
        } catch (error) {
            console.error('Error loading crops data:', error);
            throw new Error('Failed to load crops data');
        }
    }

    getCropsForZone(zone) {
        if (!this.cropsData) {
            return [];
        }

        // Extract just the number from zones like "7a" or "7"
        const zoneNum = zone.toString().match(/\d+/)[0];

        // Filter crops that can grow in this zone
        return this.cropsData.crops.filter(crop =>
            crop.zones.includes(zoneNum)
        ).sort((a, b) => a.popularity - b.popularity);
    }

    selectTopCrops(crops, count = 10) {
        return crops.slice(0, count).map(crop => crop.id);
    }

    setSelectedCrops(cropIds) {
        this.selectedCrops = cropIds;
    }

    getSelectedCrops() {
        return this.selectedCrops;
    }

    toggleCrop(cropId) {
        const index = this.selectedCrops.indexOf(cropId);
        if (index > -1) {
            this.selectedCrops.splice(index, 1);
        } else {
            this.selectedCrops.push(cropId);
        }
        return this.selectedCrops;
    }

    getCropById(cropId) {
        if (!this.cropsData) {
            return null;
        }
        return this.cropsData.crops.find(crop => crop.id === cropId);
    }

    filterCrops(crops, searchTerm) {
        if (!searchTerm) {
            return crops;
        }

        const term = searchTerm.toLowerCase();
        return crops.filter(crop =>
            crop.name.toLowerCase().includes(term) ||
            crop.category.toLowerCase().includes(term)
        );
    }

    groupCropsByCategory(crops) {
        const grouped = {};
        crops.forEach(crop => {
            if (!grouped[crop.category]) {
                grouped[crop.category] = [];
            }
            grouped[crop.category].push(crop);
        });
        return grouped;
    }
}

export default CropService;
