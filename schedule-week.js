document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const currentWeekDisplay = document.getElementById('currentWeekDisplay');
    const weekNumberSpan = document.getElementById('weekNumber');
    const weekDatesSpan = document.getElementById('weekDates');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const departmentFilter = document.getElementById('departmentFilter');
    const scheduleTableBody = document.getElementById('scheduleTableBody');
    const scheduleTableFoot = document.getElementById('scheduleTableFoot');

    let currentWeekStart = new Date(); // Start with current week
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + (currentWeekStart.getDay() === 0 ? -6 : 1)); // Adjust to Monday of the current week

    // --- Dark Mode Toggle Logic (Consistent across pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light mode
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Sample Schedule Data (Simulated for demonstration) ---
    // In a real application, this would come from a backend API
    const coworkersData = [
        { id: 'C001', name: 'Alice Smith', department: 'service' },
        { id: 'C002', name: 'Bob Johnson', department: 'kitchen' },
        { id: 'C003', name: 'Charlie Brown', department: 'bar' },
        { id: 'C004', name: 'Diana Prince', department: 'service' },
        { id: 'C005', name: 'Eve Davis', department: 'kitchen' },
        { id: 'C006', name: 'Frank White', department: 'service' },
        { id: 'C007', name: 'Grace Taylor', department: 'bar' },
    ];

    // Function to generate dummy schedule data for a given week
    // This will create a mix of 'scheduled', 'available', and 'day-off' entries
    function generateScheduleForWeek(startDate) {
        const schedule = {};
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

        coworkersData.forEach(coworker => {
            schedule[coworker.id] = {
                name: coworker.name,
                department: coworker.department,
                days: {}
            };
            for (let i = 0; i < 7; i++) {
                const dayDate = new Date(startDate);
                dayDate.setDate(startDate.getDate() + i);
                const dayKey = days[i];

                const random = Math.random();
                if (random < 0.2) { // 20% chance of Day Off
                    schedule[coworker.id].days[dayKey] = { status: 'Day Off', hours: 0 };
                } else if (random < 0.6) { // 40% chance of being Scheduled
                    const startHour = Math.floor(Math.random() * (16 - 9) + 9); // Between 9 AM and 4 PM
                    const duration = Math.floor(Math.random() * (9 - 4) + 4); // Between 4 and 8 hours
                    const endHour = startHour + duration;
                    schedule[coworker.id].days[dayKey] = { status: 'Scheduled', time: `${startHour}:00 - ${endHour}:00`, hours: duration };
                } else { // 40% chance of being Available
                    schedule[coworker.id].days[dayKey] = { status: 'Available', hours: 0 };
                }
            }
        });
        return schedule;
    }

    function renderSchedule() {
        const selectedDepartment = departmentFilter.value;
        const scheduleData = generateScheduleForWeek(currentWeekStart);
        const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        const weekDates = [];

        // Clear existing table content
        scheduleTableBody.innerHTML = '';
        scheduleTableFoot.innerHTML = '';

        // Update week display
        const weekNumber = Math.ceil((currentWeekStart - new Date(currentWeekStart.getFullYear(), 0, 1)) / 86400000 / 7) + 1; // Approximate week number
        weekNumberSpan.textContent = weekNumber;

        const endDate = new Date(currentWeekStart);
        endDate.setDate(currentWeekStart.getDate() + 6);
        const dateFormatter = new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' });
        weekDatesSpan.textContent = `${dateFormatter.format(currentWeekStart)} - ${dateFormatter.format(endDate)}, ${currentWeekStart.getFullYear()}`;

        // Update header dates
        const headerCells = document.querySelectorAll('.schedule-table thead th');
        for (let i = 0; i < days.length; i++) {
            const dayDate = new Date(currentWeekStart);
            dayDate.setDate(currentWeekStart.getDate() + i);
            weekDates.push(dayDate);
            headerCells[i + 1].innerHTML = `${days[i]} <span class="date-small">${dayDate.getDate()}/${(dayDate.getMonth() + 1)}</span>`;
        }


        let departmentTotals = {};
        coworkersData.forEach(coworker => {
            if (selectedDepartment === 'all' || coworker.department === selectedDepartment) {
                const row = scheduleTableBody.insertRow();
                let weeklyTotalHours = 0;

                const nameCell = row.insertCell();
                nameCell.textContent = coworker.name;
                nameCell.classList.add('coworker-col');

                days.forEach(day => {
                    const cell = row.insertCell();
                    const entry = scheduleData[coworker.id].days[day];
                    if (entry.status === 'Scheduled') {
                        cell.innerHTML = `<div class="schedule-entry scheduled">${entry.time}</div>`;
                        weeklyTotalHours += entry.hours;
                    } else if (entry.status === 'Available') {
                        cell.innerHTML = `<div class="schedule-entry available">${entry.status}</div>`;
                    } else { // Day Off
                        cell.innerHTML = `<div class="schedule-entry day-off">${entry.status}</div>`;
                    }
                });

                const totalCell = row.insertCell();
                totalCell.textContent = `${weeklyTotalHours} hrs`;
                totalCell.classList.add('total-col');

                // Aggregate department totals
                if (!departmentTotals[coworker.department]) {
                    departmentTotals[coworker.department] = 0;
                }
                departmentTotals[coworker.department] += weeklyTotalHours;
            }
        });

        // Render totals row
        const totalRow = scheduleTableFoot.insertRow();
        const totalLabelCell = totalRow.insertCell();
        totalLabelCell.textContent = 'Totals';
        totalLabelCell.classList.add('coworker-col');

        let grandTotalHours = 0;
        days.forEach(day => {
            const dayTotalCell = totalRow.insertCell();
            let dayScheduledHours = 0;
            Object.values(scheduleData).forEach(coworkerSchedule => {
                if (selectedDepartment === 'all' || coworkerSchedule.department === selectedDepartment) {
                    const entry = coworkerSchedule.days[day];
                    if (entry.status === 'Scheduled') {
                        dayScheduledHours += entry.hours;
                    }
                }
            });
            dayTotalCell.textContent = `${dayScheduledHours} hrs`;
            grandTotalHours += dayScheduledHours;
        });

        const grandTotalCell = totalRow.insertCell();
        grandTotalCell.textContent = `${grandTotalHours} hrs`;
        grandTotalCell.classList.add('total-col');
    }

    // --- Event Listeners ---
    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderSchedule();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderSchedule();
    });

    departmentFilter.addEventListener('change', renderSchedule);

    // Initial render
    renderSchedule();
});