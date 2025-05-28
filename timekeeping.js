document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const coworkerNameDisplay = document.getElementById('coworkerNameDisplay');
    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const clockInBtn = document.getElementById('clockInBtn');
    const clockOutBtn = document.getElementById('clockOutBtn');

    const totalHoursMonth = document.getElementById('totalHoursMonth');
    const avgHoursDay = document.getElementById('avgHoursDay');
    const pendingEntriesCount = document.getElementById('pendingEntries');
    const nextShiftDisplay = document.getElementById('nextShift');
    const dailyClockEntriesTableBody = document.getElementById('dailyClockEntriesTableBody');
    const requestCorrectionBtn = document.getElementById('requestCorrectionBtn');

    // Correction Request Modal Elements
    const correctionRequestModalOverlay = document.getElementById('correctionRequestModalOverlay');
    const correctionRequestModal = document.getElementById('correctionRequestModal');
    const closeCorrectionModalBtn = document.getElementById('closeCorrectionModalBtn');
    const cancelCorrectionModalBtn = document.getElementById('cancelCorrectionModalBtn');
    const submitCorrectionRequestBtn = document.getElementById('submitCorrectionRequestBtn');

    const correctionForm = document.getElementById('correctionForm');
    const correctionEntryIdInput = document.getElementById('correctionEntryId');
    const correctionOriginalDateInput = document.getElementById('correctionOriginalDate');
    const correctionCoworkerIdInput = document.getElementById('correctionCoworkerId');
    const correctionDateInput = document.getElementById('correctionDate');
    const correctionTimeInInput = document.getElementById('correctionTimeIn');
    const correctionTimeOutInput = document.getElementById('correctionTimeOut');
    const correctionStatusInput = document.getElementById('correctionStatus');
    const correctionNotesInput = document.getElementById('correctionNotes');

    let currentDisplayDate = new Date(); // Stores the month currently displayed
    let currentCoworkerId = 'CW001'; // !!! SIMULATED: In a real app, this would come from user session
    let currentCoworker = null;
    let clockInTime = null; // Stores Date object of clock-in for the current shift

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

    // --- Sample Data (Consistent with admin views) ---
    const coworkersData = [
        { id: 'CW001', name: 'Alice Smith', department: 'service', schedule: {
            // Example schedule (simplified: year-month-day: { start: 'HH:MM', end: 'HH:MM' })
            '2025-05-27': { start: '09:00', end: '17:00' },
            '2025-05-28': { start: '10:00', end: '18:00' },
            '2025-05-29': { start: '11:00', end: '19:00' },
            '2025-06-02': { start: '09:30', end: '17:30' }
        }},
        { id: 'CW002', name: 'Bob Johnson', department: 'kitchen', schedule: {} },
        { id: 'CW003', name: 'Charlie Brown', department: 'bar', schedule: {} },
        { id: 'CW004', name: 'Diana Prince', department: 'service', schedule: {} },
        { id: 'CW005', name: 'Eve Davis', department: 'kitchen', schedule: {} },
        { id: 'CW006', name: 'Frank White', department: 'bar', schedule: {} },
    ];

    // Simulated Clock In/Out Data
    // Structure: { 'YYYY': { 'MM': { 'YYYY-MM-DD': { 'coworkerId': [{ id: 'ENTRY_ID', timeIn: 'HH:MM', timeOut: 'HH:MM', status: 'Approved', notes: '' }] } } } }
    const timekeepingData = {};

    function generateDummyTimekeepingData(year, month) {
        if (timekeepingData[year] && timekeepingData[year][month]) {
            return; // Data already generated for this month
        }
        timekeepingData[year] = timekeepingData[year] || {};
        timekeepingData[year][month] = timekeepingData[year][month] || {};

        const daysInMonth = new Date(year, month + 1, 0).getDate();

        coworkersData.forEach(coworker => {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyEntries = [];

                // Simulate some work days for each coworker
                if (Math.random() > 0.4) { // 60% chance of working a day
                    const numEntries = Math.random() > 0.85 ? 2 : 1; // 15% chance of split shift

                    for (let i = 0; i < numEntries; i++) {
                        let startHour = Math.floor(Math.random() * 8) + 8; // 8 AM to 3 PM
                        let endHour = startHour + Math.floor(Math.random() * 4) + 4; // 4 to 7 hours duration
                        if (endHour > 23) endHour = 23; // Max end at 11 PM

                        let timeIn = `${String(startHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;
                        let timeOut = `${String(endHour).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`;

                        dailyEntries.push({
                            id: `ENTRY_${dateStr}_${coworker.id}_${i}_${Date.now() + i}`, // Unique ID
                            timeIn: timeIn,
                            timeOut: timeOut,
                            status: Math.random() > 0.15 ? 'Approved' : 'Pending', // 15% pending
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
    generateDummyTimekeepingData(today.getFullYear(), today.getMonth() - 1);
    generateDummyTimekeepingData(today.getFullYear(), today.getMonth() + 1);


    // --- Helper Functions ---
    function formatTime(date) {
        return date.toTimeString().slice(0, 5); // HH:MM
    }

    function calculateDuration(timeIn, timeOut) {
        if (!timeIn || !timeOut || timeIn === '' || timeOut === '') {
            return 0;
        }

        const [inHour, inMinute] = timeIn.split(':').map(Number);
        const [outHour, outMinute] = timeOut.split(':').map(Number);

        let durationMinutes = (outHour * 60 + outMinute) - (inHour * 60 + inMinute);
        if (durationMinutes < 0) { // Handle overnight shifts (assume max 24h cycle)
            durationMinutes += 24 * 60;
        }
        return durationMinutes / 60; // Return in hours
    }

    function calculateTotalHoursForCoworker(coworkerId, year, month) {
        let totalHours = 0;
        let daysWorked = 0;
        let pendingEntries = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        if (timekeepingData[year] && timekeepingData[year][month]) {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyData = timekeepingData[year][month][dateStr];

                if (dailyData && dailyData[coworkerId]) {
                    daysWorked++;
                    dailyData[coworkerId].forEach(entry => {
                        totalHours += calculateDuration(entry.timeIn, entry.timeOut);
                        if (entry.status === 'Pending') {
                            pendingEntries++;
                        }
                    });
                }
            }
        }
        return { totalHours, daysWorked, pendingEntries };
    }

    function getNextShift(coworkerId) {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1);

        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const coworker = coworkersData.find(c => c.id === coworkerId);
        if (!coworker || !coworker.schedule) {
            return 'N/A';
        }

        // Check today's schedule
        const todayDateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(currentDay).padStart(2, '0')}`;
        if (coworker.schedule[todayDateStr]) {
            const shift = coworker.schedule[todayDateStr];
            // Check if current time is before end of today's shift
            const [endHour, endMinute] = shift.end.split(':').map(Number);
            const endTime = new Date(today);
            endTime.setHours(endHour, endMinute, 0, 0);

            if (today < endTime) {
                return `Today: ${shift.start} - ${shift.end}`;
            }
        }

        // Check tomorrow's schedule
        const tomorrowDateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
        if (coworker.schedule[tomorrowDateStr]) {
            const shift = coworker.schedule[tomorrowDateStr];
            return `Tomorrow: ${shift.start} - ${shift.end}`;
        }

        // Check for upcoming shifts in the next 7 days
        for (let i = 2; i <= 7; i++) {
            const futureDate = new Date(today);
            futureDate.setDate(today.getDate() + i);
            const futureDateStr = `${futureDate.getFullYear()}-${String(futureDate.getMonth() + 1).padStart(2, '0')}-${String(futureDate.getDate()).padStart(2, '0')}`;
            if (coworker.schedule[futureDateStr]) {
                const shift = coworker.schedule[futureDateStr];
                return `${futureDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}: ${shift.start} - ${shift.end}`;
            }
        }

        return 'No upcoming shifts';
    }


    // --- Render Timekeeping Data ---
    function renderTimekeepingData() {
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth(); // 0-indexed

        currentMonthDisplay.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        generateDummyTimekeepingData(year, month); // Ensure data exists for the current month

        const { totalHours, daysWorked, pendingEntries } = calculateTotalHoursForCoworker(currentCoworkerId, year, month);
        totalHoursMonth.textContent = `${totalHours.toFixed(1)}h`;
        avgHoursDay.textContent = `${daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0.0}h`;
        pendingEntriesCount.textContent = pendingEntries;
        nextShiftDisplay.textContent = getNextShift(currentCoworkerId);

        renderDailyClockEntriesTable(currentCoworkerId, year, month);
    }

    function renderDailyClockEntriesTable(coworkerId, year, month) {
        dailyClockEntriesTableBody.innerHTML = '';
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const entriesForCoworker = [];

        if (timekeepingData[year] && timekeepingData[year][month]) {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyData = timekeepingData[year][month][dateStr];

                if (dailyData && dailyData[coworkerId]) {
                    dailyData[coworkerId].forEach(entry => {
                        entriesForCoworker.push({ date: dateStr, ...entry });
                    });
                }
            }
        }

        if (entriesForCoworker.length === 0) {
            dailyClockEntriesTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--subtitle-color);">No clock entries for this month.</td></tr>';
            return;
        }

        // Sort entries by date (most recent first)
        entriesForCoworker.sort((a, b) => new Date(b.date) - new Date(a.date));

        entriesForCoworker.forEach(entry => {
            const duration = calculateDuration(entry.timeIn, entry.timeOut);
            const row = dailyClockEntriesTableBody.insertRow();
            row.dataset.entryId = entry.id; // For easy identification

            row.insertCell().textContent = entry.date;
            row.insertCell().textContent = entry.timeIn;
            row.insertCell().textContent = entry.timeOut;
            row.insertCell().textContent = `${duration.toFixed(2)}h`;
            row.insertCell().textContent = entry.status;
            row.cells[4].classList.add(`status-${entry.status.toLowerCase()}`);
            row.insertCell().textContent = entry.notes || '-';

            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.innerHTML = `
                <i class="fas fa-edit action-icon edit-entry" title="Request Correction"></i>
                ${entry.status === 'Pending' ? '<i class="fas fa-check-circle action-icon approve-entry" title="Approve Entry (Simulated)"></i>' : ''}
            `;
            // For a coworker view, 'approve-entry' might not be visible, or it could be 'mark as reviewed'
            // For this simulation, we'll keep it as a placeholder for potential self-review or future admin functionality.

            actionsCell.querySelector('.edit-entry').addEventListener('click', () => openCorrectionRequestModal(entry, coworkerId));
        });
    }

    // --- Clock In/Out Functionality ---
    function updateClockButtons() {
        const hasClockedIn = localStorage.getItem(`clockIn_${currentCoworkerId}`);
        if (hasClockedIn) {
            clockInBtn.disabled = true;
            clockOutBtn.disabled = false;
        } else {
            clockInBtn.disabled = false;
            clockOutBtn.disabled = true;
        }
    }

    function handleClockIn() {
        const now = new Date();
        const timeIn = formatTime(now);
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // In a real app, this would be sent to the server.
        // For simulation, we'll store it locally and mark it as 'pending'.
        localStorage.setItem(`clockIn_${currentCoworkerId}`, now.toISOString()); // Store ISO string for date context
        localStorage.setItem(`clockInTimeStr_${currentCoworkerId}`, timeIn);
        localStorage.setItem(`clockInDateStr_${currentCoworkerId}`, dateStr);

        alert(`Clocked In at ${timeIn} on ${dateStr}!`);
        updateClockButtons();
    }

    function handleClockOut() {
        const clockInISO = localStorage.getItem(`clockIn_${currentCoworkerId}`);
        const storedTimeIn = localStorage.getItem(`clockInTimeStr_${currentCoworkerId}`);
        const storedDateStr = localStorage.getItem(`clockInDateStr_${currentCoworkerId}`);

        if (!clockInISO || !storedTimeIn || !storedDateStr) {
            alert('Error: No active clock-in found.');
            return;
        }

        const now = new Date();
        const timeOut = formatTime(now);
        const dateStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

        // Ensure the clock-out is for the same day as clock-in, or handle overnight shifts if needed
        const clockInDate = new Date(clockInISO);
        const clockOutDate = new Date(now);

        // For simplicity, we'll assume same-day shifts for now, unless it's a clear overnight scenario.
        if (dateStr !== storedDateStr && clockOutDate.getTime() < clockInDate.getTime()) {
             // If date changed but time is earlier, assume next day.
             // This simple check might need more robust logic for complex overnight scenarios.
        }

        const year = clockInDate.getFullYear();
        const month = clockInDate.getMonth();

        // Add entry to simulated timekeeping data
        if (!timekeepingData[year]) timekeepingData[year] = {};
        if (!timekeepingData[year][month]) timekeepingData[year][month] = {};
        if (!timekeepingData[year][month][storedDateStr]) timekeepingData[year][month][storedDateStr] = {};
        if (!timekeepingData[year][month][storedDateStr][currentCoworkerId]) {
            timekeepingData[year][month][storedDateStr][currentCoworkerId] = [];
        }

        const newEntry = {
            id: `ENTRY_${storedDateStr}_${currentCoworkerId}_${Date.now()}`,
            timeIn: storedTimeIn,
            timeOut: timeOut,
            status: 'Pending', // New entries are always pending for review
            notes: 'Clocked in/out via system.'
        };
        timekeepingData[year][month][storedDateStr][currentCoworkerId].push(newEntry);

        localStorage.removeItem(`clockIn_${currentCoworkerId}`);
        localStorage.removeItem(`clockInTimeStr_${currentCoworkerId}`);
        localStorage.removeItem(`clockInDateStr_${currentCoworkerId}`);

        alert(`Clocked Out at ${timeOut}! Entry submitted for review.`);
        updateClockButtons();
        renderTimekeepingData(); // Re-render the table to show the new entry
    }

    // --- Correction Request Modal Functions ---
    function openCorrectionRequestModal(entry = null) {
        correctionForm.reset();
        correctionEntryIdInput.value = '';
        correctionOriginalDateInput.value = '';
        correctionCoworkerIdInput.value = currentCoworkerId; // Always current user

        if (entry) {
            correctionEntryIdInput.value = entry.id;
            correctionOriginalDateInput.value = entry.date;
            correctionDateInput.value = entry.date;
            correctionTimeInInput.value = entry.timeIn;
            correctionTimeOutInput.value = entry.timeOut;
            correctionStatusInput.value = entry.status;
            correctionNotesInput.value = entry.notes || '';
            document.getElementById('correctionModalTitle').textContent = `Request Correction for ${entry.date}`;
        } else {
            // For adding a new entry (manual correction request for a missing entry)
            document.getElementById('correctionModalTitle').textContent = `Request New Entry / Correction`;
            const today = new Date();
            const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
            correctionDateInput.value = dateStr;
            correctionStatusInput.value = 'Pending';
        }
        correctionRequestModalOverlay.style.display = 'flex';
    }

    function closeCorrectionRequestModal() {
        correctionRequestModalOverlay.style.display = 'none';
        correctionForm.reset();
    }

    function handleSubmitCorrectionRequest(event) {
        event.preventDefault(); // Prevent default form submission

        const entryId = correctionEntryIdInput.value;
        const originalDate = correctionOriginalDateInput.value;
        const coworkerId = correctionCoworkerIdInput.value;

        const newDate = correctionDateInput.value;
        const newTimeIn = correctionTimeInInput.value;
        const newTimeOut = correctionTimeOutInput.value;
        const newStatus = correctionStatusInput.value;
        const newNotes = correctionNotesInput.value;

        if (!newDate || !newTimeIn) {
            alert('Date and Time In are required for a correction request.');
            return;
        }

        const entryYear = new Date(newDate).getFullYear();
        const entryMonth = new Date(newDate).getMonth();

        // Ensure data structure exists for the target date
        if (!timekeepingData[entryYear]) timekeepingData[entryYear] = {};
        if (!timekeepingData[entryYear][entryMonth]) timekeepingData[entryYear][entryMonth] = {};
        if (!timekeepingData[entryYear][entryMonth][newDate]) timekeepingData[entryYear][entryMonth][newDate] = {};
        if (!timekeepingData[entryYear][entryMonth][newDate][coworkerId]) {
            timekeepingData[entryYear][entryMonth][newDate][coworkerId] = [];
        }

        if (entryId) { // Editing an existing entry
            const originalYear = new Date(originalDate).getFullYear();
            const originalMonth = new Date(originalDate).getMonth();

            let found = false;
            // Remove from original location if date changed
            if (originalDate !== newDate) {
                if (timekeepingData[originalYear] && timekeepingData[originalYear][originalMonth] &&
                    timekeepingData[originalYear][originalMonth][originalDate] &&
                    timekeepingData[originalYear][originalMonth][originalDate][coworkerId]) {

                    const originalEntries = timekeepingData[originalYear][originalMonth][originalDate][coworkerId];
                    const originalIndex = originalEntries.findIndex(e => e.id === entryId);
                    if (originalIndex !== -1) {
                        originalEntries.splice(originalIndex, 1); // Remove it
                        if (originalEntries.length === 0) {
                            delete timekeepingData[originalYear][originalMonth][originalDate][coworkerId];
                        }
                        found = true;
                    }
                }
            } else { // Date didn't change, update in place
                if (timekeepingData[entryYear][entryMonth][newDate][coworkerId]) {
                    const targetEntries = timekeepingData[entryYear][entryMonth][newDate][coworkerId];
                    const targetIndex = targetEntries.findIndex(e => e.id === entryId);
                    if (targetIndex !== -1) {
                        targetEntries[targetIndex] = {
                            id: entryId,
                            timeIn: newTimeIn,
                            timeOut: newTimeOut,
                            status: 'Pending', // Force pending for any correction request
                            notes: newNotes
                        };
                        found = true;
                    }
                }
            }

            if (!found) { // This handles cases where the entry was moved/deleted previously or not found
                // If not found in original, add it as a new entry with the specified ID
                timekeepingData[entryYear][entryMonth][newDate][coworkerId].push({
                    id: entryId,
                    timeIn: newTimeIn,
                    timeOut: newTimeOut,
                    status: 'Pending',
                    notes: newNotes
                });
            }

            alert('Correction request submitted for an existing entry!');

        } else { // Adding a brand new entry as a correction
            const newCorrectionEntry = {
                id: `CORRECTION_${newDate}_${coworkerId}_${Date.now()}`,
                timeIn: newTimeIn,
                timeOut: newTimeOut,
                status: 'Pending', // New entries are always pending
                notes: newNotes
            };
            timekeepingData[entryYear][entryMonth][newDate][coworkerId].push(newCorrectionEntry);
            alert('New entry correction request submitted!');
        }

        closeCorrectionRequestModal();
        renderTimekeepingData(); // Re-render table to show changes
    }


    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderTimekeepingData();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderTimekeepingData();
    });

    clockInBtn.addEventListener('click', handleClockIn);
    clockOutBtn.addEventListener('click', handleClockOut);

    requestCorrectionBtn.addEventListener('click', () => openCorrectionRequestModal());

    closeCorrectionModalBtn.addEventListener('click', closeCorrectionRequestModal);
    cancelCorrectionModalBtn.addEventListener('click', closeCorrectionRequestModal);
    submitCorrectionRequestBtn.addEventListener('click', handleSubmitCorrectionRequest);


    // Initial setup
    currentCoworker = coworkersData.find(c => c.id === currentCoworkerId);
    if (currentCoworker) {
        coworkerNameDisplay.textContent = currentCoworker.name;
    } else {
        coworkerNameDisplay.textContent = 'Coworker Not Found';
        // Disable functionality if no user is found
        clockInBtn.disabled = true;
        clockOutBtn.disabled = true;
        requestCorrectionBtn.disabled = true;
    }

    renderTimekeepingData();
    updateClockButtons(); // Check initial clock state
});