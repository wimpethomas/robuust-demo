document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const coworkerFilter = document.getElementById('coworkerFilter');
    const calendarDaysContainer = document.getElementById('calendarDays');

    // Daily Detail Modal Elements
    const dailyDetailModalOverlay = document.getElementById('dailyDetailModalOverlay');
    const dailyDetailModal = document.getElementById('dailyDetailModal');
    const closeDailyDetailModalBtn = document.getElementById('closeDailyDetailModalBtn');
    const cancelDailyDetailModalBtn = document.getElementById('cancelDailyDetailModalBtn');
    const saveDailyDetailModalBtn = document.getElementById('saveDailyDetailModalBtn');

    const dailyDetailModalTitle = document.getElementById('dailyDetailModalTitle');
    const detailTotalHours = document.getElementById('detailTotalHours');
    const detailBreaks = document.getElementById('detailBreaks');
    const detailAdjustments = document.getElementById('detailAdjustments');
    const detailCoworkerName = document.getElementById('detailCoworkerName');
    const clockEntriesTableBody = document.getElementById('clockEntriesTableBody');
    const addClockEntryBtn = document.getElementById('addClockEntryBtn');

    let currentDisplayDate = new Date(); // Stores the month currently displayed in the calendar
    let selectedCoworkerId = 'all'; // Default to all coworkers
    let selectedDayForDetail = null; // Stores the date clicked for the daily detail view

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

    // --- Sample Data ---
    const coworkersData = [
        { id: 'CW001', name: 'Alice Smith', department: 'service' },
        { id: 'CW002', name: 'Bob Johnson', department: 'kitchen' },
        { id: 'CW003', name: 'Charlie Brown', department: 'bar' },
        { id: 'CW004', name: 'Diana Prince', department: 'service' },
        { id: 'CW005', name: 'Eve Davis', department: 'kitchen' },
    ];

    // Simulated Clock In/Out Data for demonstration
    // Structure: { 'YYYY-MM-DD': { 'coworkerId': [{ timeIn: 'HH:MM', timeOut: 'HH:MM', status: 'Approved', notes: '' }] } }
    const timekeepingData = {};

    function generateDummyTimekeepingData(year, month) {
        timekeepingData[year] = timekeepingData[year] || {};
        timekeepingData[year][month] = timekeepingData[year][month] || {};

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        coworkersData.forEach(coworker => {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyEntries = [];

                // Simulate some work days
                if (Math.random() > 0.3) { // 70% chance of working a day
                    const numEntries = Math.random() > 0.8 ? 2 : 1; // 20% chance of split shift

                    for (let i = 0; i < numEntries; i++) {
                        let startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 3 PM
                        let endHour = startHour + Math.floor(Math.random() * 4) + 4; // 4 to 7 hours duration
                        if (endHour > 23) endHour = 23; // Max end at 11 PM

                        let timeIn = `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
                        let timeOut = `${String(endHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

                        dailyEntries.push({
                            id: `ENTRY_${dateStr}_${coworker.id}_${i}`,
                            timeIn: timeIn,
                            timeOut: timeOut,
                            status: Math.random() > 0.1 ? 'Approved' : 'Pending', // 10% pending
                            notes: ''
                        });
                    }
                }
                if (dailyEntries.length > 0) {
                    if (!timekeepingData[year][month][dateStr]) {
                        timekeepingData[year][month][dateStr] = {};
                    }
                    timekeepingData[year][month][dateStr][coworker.id] = dailyEntries;
                }
            }
        });
    }

    // Initialize data for current month and some surrounding months
    const today = new Date();
    generateDummyTimekeepingData(today.getFullYear(), today.getMonth());
    generateDummyTimekeepingData(today.getFullYear(), today.getMonth() - 1); // Previous month
    generateDummyTimekeepingData(today.getFullYear(), today.getMonth() + 1); // Next month


    // --- Helper Functions ---
    function formatTime(date) {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function calculateDuration(timeIn, timeOut) {
        if (!timeIn || !timeOut || timeIn === '' || timeOut === '') {
            return 0; // Or handle as error/invalid
        }

        const [inHour, inMinute] = timeIn.split(':').map(Number);
        const [outHour, outMinute] = timeOut.split(':').map(Number);

        let durationMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
        if (durationMinutes < 0) { // Handle overnight shifts (assume max 24h cycle)
            durationMinutes += 24 * 60;
        }
        return durationMinutes / 60; // Return in hours
    }

    function calculateTotalHoursForDay(dateStr, coworkerId) {
        let totalHours = 0;
        const year = new Date(dateStr).getFullYear();
        const month = new Date(dateStr).getMonth();

        const dailyData = (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr]) ?
            timekeepingData[year][month][dateStr] : null;

        if (dailyData) {
            if (coworkerId === 'all') {
                // Sum hours for all coworkers for the day
                Object.values(dailyData).forEach(entries => {
                    entries.forEach(entry => {
                        totalHours += calculateDuration(entry.timeIn, entry.timeOut);
                    });
                });
            } else {
                // Sum hours for specific coworker for the day
                const coworkerEntries = dailyData[coworkerId];
                if (coworkerEntries) {
                    coworkerEntries.forEach(entry => {
                        totalHours += calculateDuration(entry.timeIn, entry.timeOut);
                    });
                }
            }
        }
        return totalHours;
    }

    // --- Calendar Rendering ---
    function renderCalendar() {
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth(); // 0-indexed

        currentMonthDisplay.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        calendarDaysContainer.innerHTML = '';

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // Adjust to Monday (0 for Sunday, 1 for Monday, ..., 6 for Saturday)
        const firstDayOfWeek = (firstDayOfMonth.getDay() === 0 ? 6 : firstDayOfMonth.getDay() - 1); // 0 = Mon, 6 = Sun

        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarDaysContainer.appendChild(emptyCell);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const totalHours = calculateTotalHoursForDay(dateStr, selectedCoworkerId);

            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            if (date.toDateString() === new Date().toDateString()) {
                dayCell.classList.add('current-day');
            }
            if (totalHours > 0) {
                dayCell.classList.add('has-entries');
            }
            dayCell.dataset.date = dateStr; // Store full date string

            dayCell.innerHTML = `
                <div class="day-number">${day}</div>
                <div class="total-hours">${totalHours.toFixed(1)}h</div>
            `;
            dayCell.addEventListener('click', () => openDailyDetailModal(dateStr));
            calendarDaysContainer.appendChild(dayCell);
        }

        // Add empty cells for days after the last day of the month (to fill the last row)
        const totalCells = firstDayOfWeek + daysInMonth;
        const remainingCells = (7 - (totalCells % 7)) % 7; // Cells needed to complete the last row
        for (let i = 0; i < remainingCells; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day', 'empty');
            calendarDaysContainer.appendChild(emptyCell);
        }
    }

    // --- Daily Detail Modal Functions ---
    function openDailyDetailModal(dateStr) {
        selectedDayForDetail = dateStr;
        const dateObj = new Date(dateStr);
        dailyDetailModalTitle.textContent = `${new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`;

        // Get the coworker name for the detail view.
        // If 'all' is selected, we might want to sum hours across all coworkers,
        // but the detail view is usually per coworker.
        // For now, let's just show data for the first coworker if 'all' is selected
        // or for the specific coworker. In a real app, you'd likely have a way to select
        // a coworker in the modal or show entries for all.
        const coworkerName = (selectedCoworkerId === 'all') ? 'All Coworkers (Summary)' :
            coworkersData.find(c => c.id === selectedCoworkerId)?.name || 'Unknown Coworker';

        detailCoworkerName.textContent = coworkerName;

        renderClockEntriesTable();
        dailyDetailModalOverlay.style.display = 'flex';
    }

    function renderClockEntriesTable() {
        clockEntriesTableBody.innerHTML = '';
        const dateStr = selectedDayForDetail;
        const year = new Date(dateStr).getFullYear();
        const month = new Date(dateStr).getMonth();

        let entriesToDisplay = [];
        const dailyData = (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr]) ?
            timekeepingData[year][month][dateStr] : null;

        if (dailyData) {
            if (selectedCoworkerId === 'all') {
                // Aggregate all entries for all coworkers for this day
                Object.values(dailyData).forEach(coworkerEntries => {
                    coworkerEntries.forEach(entry => {
                        const coworker = coworkersData.find(c => c.id === entry.coworkerId || entry.coworkerId === undefined); // handle undefined coworkerId for old dummy data
                        entriesToDisplay.push({ ...entry, coworkerName: coworker ? coworker.name : 'N/A' });
                    });
                });
            } else {
                // Show entries for the specific selected coworker
                const coworkerEntries = dailyData[selectedCoworkerId];
                if (coworkerEntries) {
                    entriesToDisplay = coworkerEntries.map(entry => ({ ...entry, coworkerName: coworkersData.find(c => c.id === selectedCoworkerId)?.name }));
                }
            }
        }

        let totalHoursForDay = 0;
        let totalBreaks = 0; // For simplicity, we'll just count entries for now. A real system would track actual break times.
        let totalAdjustments = 0; // Not implemented in dummy data

        if (entriesToDisplay.length === 0) {
            clockEntriesTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--subtitle-color);">No clock entries for this day.</td></tr>';
        } else {
            entriesToDisplay.forEach(entry => {
                const duration = calculateDuration(entry.timeIn, entry.timeOut);
                totalHoursForDay += duration;

                const row = clockEntriesTableBody.insertRow();
                row.dataset.entryId = entry.id; // For easy identification if editing/deleting

                row.insertCell().textContent = entry.timeIn;
                row.insertCell().textContent = entry.timeOut;
                row.insertCell().textContent = `${duration.toFixed(2)}h`;
                row.insertCell().textContent = entry.status;
                row.cells[3].classList.add(`status-${entry.status.toLowerCase()}`);

                const actionsCell = row.insertCell();
                actionsCell.classList.add('actions-cell');
                actionsCell.innerHTML = `
                    <i class="fas fa-edit action-icon edit-entry" title="Edit Entry"></i>
                    <i class="fas fa-trash-alt action-icon delete-entry" title="Delete Entry"></i>
                `;

                actionsCell.querySelector('.edit-entry').addEventListener('click', (e) => editClockEntry(row, entry));
                actionsCell.querySelector('.delete-entry').addEventListener('click', (e) => deleteClockEntry(entry.id, dateStr, entry.coworkerId || selectedCoworkerId)); // Use entry's coworkerId or the selected one
            });
        }

        detailTotalHours.textContent = `${totalHoursForDay.toFixed(1)}h`;
        detailBreaks.textContent = `${entriesToDisplay.length > 0 ? entriesToDisplay.length - 1 : 0}`; // Simplistic break count
        detailAdjustments.textContent = `${totalAdjustments.toFixed(1)}h`;
    }

    function editClockEntry(row, entry) {
        // Simple inline editing for demonstration
        const newTimeIn = prompt('Enter new Time In (HH:MM)', entry.timeIn);
        const newTimeOut = prompt('Enter new Time Out (HH:MM)', entry.timeOut);

        if (newTimeIn !== null && newTimeOut !== null) {
            const dateStr = selectedDayForDetail;
            const year = new Date(dateStr).getFullYear();
            const month = new Date(dateStr).getMonth();

            if (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr]) {
                const coworkerEntries = timekeepingData[year][month][dateStr][entry.coworkerId || selectedCoworkerId];
                if (coworkerEntries) {
                    const entryIndex = coworkerEntries.findIndex(e => e.id === entry.id);
                    if (entryIndex !== -1) {
                        coworkerEntries[entryIndex].timeIn = newTimeIn;
                        coworkerEntries[entryIndex].timeOut = newTimeOut;
                        // For a real app, also update status/notes if part of the edit
                        alert('Entry updated! Click Save Changes to confirm.');
                        renderClockEntriesTable(); // Re-render to show updated values
                        renderCalendar(); // Re-render main calendar to update total hours if changed
                    }
                }
            }
        }
    }

    function deleteClockEntry(entryId, dateStr, coworkerId) {
        if (confirm('Are you sure you want to delete this clock entry?')) {
            const year = new Date(dateStr).getFullYear();
            const month = new Date(dateStr).getMonth();

            if (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr]) {
                if (timekeepingData[year][month][dateStr][coworkerId]) {
                    timekeepingData[year][month][dateStr][coworkerId] = timekeepingData[year][month][dateStr][coworkerId].filter(e => e.id !== entryId);
                    // If no more entries for this coworker on this day, remove the coworker entry
                    if (timekeepingData[year][month][dateStr][coworkerId].length === 0) {
                        delete timekeepingData[year][month][dateStr][coworkerId];
                    }
                    // If no more entries for this day, remove the day entry
                    if (Object.keys(timekeepingData[year][month][dateStr]).length === 0) {
                        delete timekeepingData[year][month][dateStr];
                    }
                    alert('Entry deleted! Click Save Changes to confirm.');
                    renderClockEntriesTable(); // Re-render modal table
                    renderCalendar(); // Re-render main calendar to update total hours
                }
            }
        }
    }

    function addClockEntry() {
        const timeIn = prompt('Enter Time In (HH:MM)');
        const timeOut = prompt('Enter Time Out (HH:MM)');

        if (timeIn && timeOut) {
            const dateStr = selectedDayForDetail;
            const year = new Date(dateStr).getFullYear();
            const month = new Date(dateStr).getMonth();
            const targetCoworkerId = selectedCoworkerId === 'all' ? coworkersData[0].id : selectedCoworkerId; // Default to first coworker if 'all'
            
            if (!timekeepingData[year]) timekeepingData[year] = {};
            if (!timekeepingData[year][month]) timekeepingData[year][month] = {};
            if (!timekeepingData[year][month][dateStr]) timekeepingData[year][month][dateStr] = {};
            if (!timekeepingData[year][month][dateStr][targetCoworkerId]) timekeepingData[year][month][dateStr][targetCoworkerId] = [];

            const newEntry = {
                id: `ENTRY_${dateStr}_${targetCoworkerId}_${Date.now()}`,
                timeIn: timeIn,
                timeOut: timeOut,
                status: 'Pending', // New entries are pending by default
                notes: ''
            };
            timekeepingData[year][month][dateStr][targetCoworkerId].push(newEntry);
            alert('New entry added! Click Save Changes to confirm.');
            renderClockEntriesTable(); // Re-render modal table
            renderCalendar(); // Re-render main calendar to update total hours
        } else {
            alert('Both Time In and Time Out are required to add an entry.');
        }
    }


    function closeDailyDetailModal() {
        dailyDetailModalOverlay.style.display = 'none';
        selectedDayForDetail = null; // Clear selected day
    }

    // --- Populate Coworker Filter ---
    function populateCoworkerFilter() {
        coworkerFilter.innerHTML = '<option value="all">All Coworkers</option>';
        coworkersData.forEach(coworker => {
            const option = document.createElement('option');
            option.value = coworker.id;
            option.textContent = coworker.name;
            coworkerFilter.appendChild(option);
        });
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderCalendar();
    });

    coworkerFilter.addEventListener('change', (e) => {
        selectedCoworkerId = e.target.value;
        renderCalendar(); // Re-render calendar based on selected coworker
    });

    closeDailyDetailModalBtn.addEventListener('click', closeDailyDetailModal);
    cancelDailyDetailModalBtn.addEventListener('click', closeDailyDetailModal);
    addClockEntryBtn.addEventListener('click', addClockEntry);

    saveDailyDetailModalBtn.addEventListener('click', () => {
        // In a real application, you would send the updated timekeepingData
        // for the selected day and coworker to a backend here.
        alert('Daily entries saved successfully (in-memory)!');
        closeDailyDetailModal();
    });


    // Initial setup
    populateCoworkerFilter();
    renderCalendar();
});