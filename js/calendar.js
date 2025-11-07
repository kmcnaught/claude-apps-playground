// Calendar Generation Module

class CalendarService {
    constructor() {
        this.scheduleData = null;
    }

    async loadScheduleData() {
        try {
            const response = await fetch('data/planting-schedules.json');
            this.scheduleData = await response.json();
            return this.scheduleData;
        } catch (error) {
            console.error('Error loading schedule data:', error);
            throw new Error('Failed to load planting schedule data');
        }
    }

    getScheduleForCrop(cropId, zone) {
        if (!this.scheduleData) {
            return null;
        }

        const cropSchedule = this.scheduleData.schedules[cropId];
        if (!cropSchedule) {
            return null;
        }

        // Extract just the number from zones like "7a" or "7"
        const zoneNum = zone.toString().match(/\d+/)[0];

        return cropSchedule.zones[zoneNum] || null;
    }

    generateMonthlyCalendar(crops, zone) {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];

        const calendar = months.map(month => ({
            name: month,
            tasks: []
        }));

        crops.forEach(crop => {
            const schedule = this.getScheduleForCrop(crop.id, zone);
            if (!schedule) return;

            // Add start indoors tasks
            if (schedule.startIndoors) {
                const monthIndex = this.getMonthIndex(schedule.startIndoors.start);
                if (monthIndex !== -1) {
                    calendar[monthIndex].tasks.push({
                        type: 'indoor',
                        crop: crop,
                        action: 'Start seeds indoors',
                        dates: `${schedule.startIndoors.start} - ${schedule.startIndoors.end}`,
                        notes: schedule.notes
                    });
                }
            }

            // Add transplant tasks
            if (schedule.transplantOutdoors) {
                const monthIndex = this.getMonthIndex(schedule.transplantOutdoors.start);
                if (monthIndex !== -1) {
                    calendar[monthIndex].tasks.push({
                        type: 'outdoor',
                        crop: crop,
                        action: 'Transplant outdoors',
                        dates: `${schedule.transplantOutdoors.start} - ${schedule.transplantOutdoors.end}`,
                        notes: schedule.notes
                    });
                }
            }

            // Add direct sow tasks
            if (schedule.directSow) {
                const monthIndex = this.getMonthIndex(schedule.directSow.start);
                if (monthIndex !== -1) {
                    calendar[monthIndex].tasks.push({
                        type: 'outdoor',
                        crop: crop,
                        action: 'Direct sow outdoors',
                        dates: `${schedule.directSow.start} - ${schedule.directSow.end}`,
                        notes: schedule.notes
                    });
                }
            }

            // Add harvest tasks
            if (schedule.harvest) {
                const monthIndex = this.getMonthIndex(schedule.harvest.start);
                if (monthIndex !== -1) {
                    calendar[monthIndex].tasks.push({
                        type: 'harvest',
                        crop: crop,
                        action: 'Harvest',
                        dates: `${schedule.harvest.start} - ${schedule.harvest.end}`,
                        notes: schedule.notes
                    });
                }
            }
        });

        return calendar.filter(month => month.tasks.length > 0);
    }

    getMonthIndex(dateString) {
        const monthNames = {
            'Jan': 0, 'Feb': 1, 'Mar': 2, 'Apr': 3, 'May': 4, 'Jun': 5,
            'Jul': 6, 'Aug': 7, 'Sep': 8, 'Oct': 9, 'Nov': 10, 'Dec': 11
        };

        const monthAbbr = dateString.substring(0, 3);
        return monthNames[monthAbbr] ?? -1;
    }

    renderMonthlyTodo(calendar) {
        const html = calendar.map(month => `
            <div class="month-section">
                <h3>${month.name}</h3>
                <ul class="task-list">
                    ${month.tasks.map(task => `
                        <li class="task-item">
                            <span class="task-type ${task.type}">${this.getTaskTypeLabel(task.type)}</span>
                            <span class="crop-name">${task.crop.name}</span> -
                            ${task.action}
                            <div class="task-dates">${task.dates}</div>
                            ${task.notes ? `<div class="task-notes">${task.notes}</div>` : ''}
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        return `<div class="monthly-todo">${html}</div>`;
    }

    renderVisualCalendar(calendar) {
        const html = calendar.map(month => `
            <div class="calendar-month">
                <h3>${month.name}</h3>
                <div class="calendar-activities">
                    ${month.tasks.map(task => `
                        <div class="activity ${task.type}">
                            <strong>${task.crop.name}:</strong> ${task.action} (${task.dates})
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('');

        return `<div class="visual-calendar">${html}</div>`;
    }

    renderKidFriendly(calendar) {
        const html = calendar.map(month => `
            <div class="month-section">
                <h3>${this.getMonthEmoji(month.name)} ${month.name}</h3>
                <ul class="task-list">
                    ${month.tasks.map(task => `
                        <li class="task-item">
                            <div class="task-checkbox"></div>
                            <div>
                                <strong>${task.crop.name}</strong>: ${task.action}
                            </div>
                        </li>
                    `).join('')}
                </ul>
            </div>
        `).join('');

        return `<div class="kid-friendly monthly-todo">${html}</div>`;
    }

    getTaskTypeLabel(type) {
        const labels = {
            'indoor': 'Indoors',
            'outdoor': 'Outdoors',
            'harvest': 'Harvest'
        };
        return labels[type] || type;
    }

    getMonthEmoji(month) {
        const emojis = {
            'January': '❄️',
            'February': '💝',
            'March': '🌱',
            'April': '🌷',
            'May': '🌸',
            'June': '☀️',
            'July': '🎆',
            'August': '🌻',
            'September': '🍂',
            'October': '🎃',
            'November': '🦃',
            'December': '🎄'
        };
        return emojis[month] || '📅';
    }
}

export default CalendarService;
