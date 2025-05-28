document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const departmentFilter = document.getElementById('departmentFilter');
    const coworkerSearchInput = document.getElementById('coworkerSearch');
    const coworkerTableBody = document.getElementById('coworkerTableBody');

    // Coworker Detail Modal Elements
    const coworkerDetailModalOverlay = document.getElementById('coworkerDetailModalOverlay');
    const coworkerDetailModal = document.getElementById('coworkerDetailModal');
    const closeCoworkerDetailModalBtn = document.getElementById('closeCoworkerDetailModalBtn');
    const cancelCoworkerDetailModalBtn = document.getElementById('cancelCoworkerDetailModalBtn');
    const saveCoworkerDetailModalBtn = document.getElementById('saveCoworkerDetailModalBtn');

    const coworkerDetailModalTitle = document.getElementById('coworkerDetailModalTitle');
    const detailTotalHoursMonth = document.getElementById('detailTotalHoursMonth');
    const detailAvgHoursDay = document.getElementById('detailAvgHoursDay');
    const detailPendingEntries = document.getElementById('detailPendingEntries');
    const dailyClockEntriesTableBody = document.getElementById('dailyClockEntriesTableBody');
    const addDailyClockEntryBtn = document.getElementById('addDailyClockEntryBtn');

    let currentDisplayDate = new Date(); // Stores the month currently displayed
    let selectedDepartment = 'all'; // Default to all departments
    let searchTerm = ''; // Default search term
    let selectedCoworkerIdForDetail = null; // Stores the ID of the coworker in the detail view

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

    // --- Sample Data (Reusing and extending from timesheet-admin-period.js for consistency) ---
    const coworkersData = [
        { id: 'CW001', name: 'Alice Smith', department: 'service' },
        { id: 'CW002', name: 'Bob Johnson', department: 'kitchen' },
        { id: 'CW003', name: 'Charlie Brown', department: 'bar' },
        { id: 'CW004', name: 'Diana Prince', department: 'service' },
        { id: 'CW005', name: 'Eve Davis', department: 'kitchen' },
        { id: 'CW006', name: 'Frank White', department: 'bar' },
    ];

    // Simulated Clock In/Out Data
    // Structure: { 'YYYY': { 'MM': { 'YYYY-MM-DD': { 'coworkerId': [{ timeIn: 'HH:MM', timeOut: 'HH:MM', status: 'Approved', notes: '' }] } } } }
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
                            id: `ENTRY_${dateStr}_${coworker.id}_${i}`,
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
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        if (timekeepingData[year] && timekeepingData[year][month]) {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyData = timekeepingData[year][month][dateStr];

                if (dailyData && dailyData[coworkerId]) {
                    daysWorked++;
                    dailyData[coworkerId].forEach(entry => {
                        totalHours += calculateDuration(entry.timeIn, entry.timeOut);
                    });
                }
            }
        }
        return { totalHours, daysWorked };
    }

    // --- Render Coworker List ---
    function renderCoworkerList() {
        coworkerTableBody.innerHTML = '';
        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth(); // 0-indexed

        currentMonthDisplay.textContent = new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' });
        generateDummyTimekeepingData(year, month); // Ensure data exists for the current month

        let filteredCoworkers = coworkersData.filter(coworker => {
            const matchesDepartment = selectedDepartment === 'all' || coworker.department === selectedDepartment;
            const matchesSearch = coworker.name.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesDepartment && matchesSearch;
        });

        if (filteredCoworkers.length === 0) {
            coworkerTableBody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--subtitle-color);">No coworkers found matching the criteria.</td></tr>';
            return;
        }

        filteredCoworkers.forEach(coworker => {
            const { totalHours } = calculateTotalHoursForCoworker(coworker.id, year, month);

            const row = coworkerTableBody.insertRow();
            row.classList.add('clickable-row');
            row.dataset.coworkerId = coworker.id; // Store coworker ID

            row.insertCell().textContent = coworker.name;
            row.insertCell().textContent = coworker.department.charAt(0).toUpperCase() + coworker.department.slice(1); // Capitalize department
            row.insertCell().textContent = `${totalHours.toFixed(1)}h`;

            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.innerHTML = `
                <button class="action-button small-button view-detail-btn" data-coworker-id="${coworker.id}">View Details</button>
            `;

            row.addEventListener('click', (e) => {
                // Prevent opening modal if a button within the row was clicked
                if (!e.target.closest('.view-detail-btn')) {
                    openCoworkerDetailModal(coworker.id);
                }
            });
            actionsCell.querySelector('.view-detail-btn').addEventListener('click', () => openCoworkerDetailModal(coworker.id));
        });
    }

    // --- Coworker Detail Modal Functions ---
    function openCoworkerDetailModal(coworkerId) {
        selectedCoworkerIdForDetail = coworkerId;
        const coworker = coworkersData.find(c => c.id === coworkerId);
        if (!coworker) {
            alert('Coworker not found!');
            return;
        }

        const year = currentDisplayDate.getFullYear();
        const month = currentDisplayDate.getMonth(); // 0-indexed

        coworkerDetailModalTitle.textContent = `${coworker.name}'s Timesheet - ${new Date(year, month).toLocaleString('en-US', { month: 'long', year: 'numeric' })}`;

        const { totalHours, daysWorked } = calculateTotalHoursForCoworker(coworkerId, year, month);
        detailTotalHoursMonth.textContent = `${totalHours.toFixed(1)}h`;
        detailAvgHoursDay.textContent = `${daysWorked > 0 ? (totalHours / daysWorked).toFixed(1) : 0.0}h`;

        renderDailyClockEntriesTable(coworkerId, year, month);

        coworkerDetailModalOverlay.style.display = 'flex';
    }

    function renderDailyClockEntriesTable(coworkerId, year, month) {
        dailyClockEntriesTableBody.innerHTML = '';
        let pendingCount = 0;
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const entriesForCoworker = [];

        if (timekeepingData[year] && timekeepingData[year][month]) {
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                const dailyData = timekeepingData[year][month][dateStr];

                if (dailyData && dailyData[coworkerId]) {
                    dailyData[coworkerId].forEach(entry => {
                        entriesForCoworker.push({ date: dateStr, ...entry });
                        if (entry.status === 'Pending') {
                            pendingCount++;
                        }
                    });
                }
            }
        }
        detailPendingEntries.textContent = pendingCount;

        if (entriesForCoworker.length === 0) {
            dailyClockEntriesTableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: var(--subtitle-color);">No clock entries for this coworker in the selected month.</td></tr>';
        } else {
            // Sort entries by date (most recent first)
            entriesForCoworker.sort((a, b) => new Date(b.date) - new Date(a.date));

            entriesForCoworker.forEach(entry => {
                const duration = calculateDuration(entry.timeIn, entry.timeOut);
                const row = dailyClockEntriesTableBody.insertRow();
                row.dataset.entryId = entry.id; // For easy identification
                row.dataset.date = entry.date;
                row.dataset.coworkerId = coworkerId;

                row.insertCell().textContent = entry.date;
                row.insertCell().textContent = entry.timeIn;
                row.insertCell().textContent = entry.timeOut;
                row.insertCell().textContent = `${duration.toFixed(2)}h`;
                row.insertCell().textContent = entry.status;
                row.cells[4].classList.add(`status-${entry.status.toLowerCase()}`);

                const actionsCell = row.insertCell();
                actionsCell.classList.add('actions-cell');
                actionsCell.innerHTML = `
                    <i class="fas fa-edit action-icon edit-entry" title="Edit Entry"></i>
                    <i class="fas fa-trash-alt action-icon delete-entry" title="Delete Entry"></i>
                `;

                actionsCell.querySelector('.edit-entry').addEventListener('click', (e) => editClockEntry(row, entry, coworkerId));
                actionsCell.querySelector('.delete-entry').addEventListener('click', (e) => deleteClockEntry(entry.id, entry.date, coworkerId));
            });
        }
    }

    function editClockEntry(row, entry, coworkerId) {
        const newTimeIn = prompt('Enter new Time In (HH:MM)', entry.timeIn);
        const newTimeOut = prompt('Enter new Time Out (HH:MM)', entry.timeOut);
        const newStatus = prompt('Enter new Status (Approved/Pending/Rejected)', entry.status);


        if (newTimeIn !== null && newTimeOut !== null && newStatus !== null) {
            const dateStr = entry.date; // Use the date from the entry itself
            const year = new Date(dateStr).getFullYear();
            const month = new Date(dateStr).getMonth();

            if (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr] && timekeepingData[year][month][dateStr][coworkerId]) {
                const coworkerEntries = timekeepingData[year][month][dateStr][coworkerId];
                const entryIndex = coworkerEntries.findIndex(e => e.id === entry.id);

                if (entryIndex !== -1) {
                    coworkerEntries[entryIndex].timeIn = newTimeIn;
                    coworkerEntries[entryIndex].timeOut = newTimeOut;
                    coworkerEntries[entryIndex].status = newStatus;
                    alert('Entry updated! Click Save Changes to confirm.');
                    renderDailyClockEntriesTable(coworkerId, year, month); // Re-render modal table
                    renderCoworkerList(); // Re-render main list to update total hours
                }
            }
        }
    }

    function deleteClockEntry(entryId, dateStr, coworkerId) {
        if (confirm('Are you sure you want to delete this clock entry?')) {
            const year = new Date(dateStr).getFullYear();
            const month = new Date(dateStr).getMonth();

            if (timekeepingData[year] && timekeepingData[year][month] && timekeepingData[year][month][dateStr] && timekeepingData[year][month][dateStr][coworkerId]) {
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
                renderDailyClockEntriesTable(coworkerId, year, month); // Re-render modal table
                renderCoworkerList(); // Re-render main list to update total hours
            }
        }
    }

    function addDailyClockEntry() {
        const timeIn = prompt('Enter Time In (HH:MM)');
        const timeOut = prompt('Enter Time Out (HH:MM)');
        const status = prompt('Enter Status (Approved/Pending/Rejected)', 'Pending');

        if (timeIn && timeOut && status) {
            const date = prompt('Enter Date for new entry (YYYY-MM-DD)');
            if (!date) {
                alert('Date is required to add an entry.');
                return;
            }

            const year = new Date(date).getFullYear();
            const month = new Date(date).getMonth(); // 0-indexed

            if (!timekeepingData[year]) timekeepingData[year] = {};
            if (!timekeepingData[year][month]) timekeepingData[year][month] = {};
            if (!timekeepingData[year][month][date]) timekeepingData[year][month][date] = {};
            if (!timekeepingData[year][month][date][selectedCoworkerIdForDetail]) timekeepingData[year][month][date][selectedCoworkerIdForDetail] = [];

            const newEntry = {
                id: `ENTRY_${date}_${selectedCoworkerIdForDetail}_${Date.now()}`,
                timeIn: timeIn,
                timeOut: timeOut,
                status: status,
                notes: ''
            };
            timekeepingData[year][month][date][selectedCoworkerIdForDetail].push(newEntry);
            alert('New entry added! Click Save Changes to confirm.');
            renderDailyClockEntriesTable(selectedCoworkerIdForDetail, year, month); // Re-render modal table
            renderCoworkerList(); // Re-render main list to update total hours
        } else {
            alert('Time In, Time Out, and Status are required to add an entry.');
        }
    }

    function closeCoworkerDetailModal() {
        coworkerDetailModalOverlay.style.display = 'none';
        selectedCoworkerIdForDetail = null;
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() - 1);
        renderCoworkerList();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentDisplayDate.setMonth(currentDisplayDate.getMonth() + 1);
        renderCoworkerList();
    });

    departmentFilter.addEventListener('change', (e) => {
        selectedDepartment = e.target.value;
        renderCoworkerList();
    });

    coworkerSearchInput.addEventListener('input', (e) => {
        searchTerm = e.target.value;
        renderCoworkerList();
    });

    closeCoworkerDetailModalBtn.addEventListener('click', closeCoworkerDetailModal);
    cancelCoworkerDetailModalBtn.addEventListener('click', closeCoworkerDetailModal);
    addDailyClockEntryBtn.addEventListener('click', addDailyClockEntry);

    saveCoworkerDetailModalBtn.addEventListener('click', () => {
        // In a real application, you would send the updated timekeepingData
        // for the selected coworker and month to a backend here.
        alert('Coworker entries saved successfully (in-memory)!');
        closeCoworkerDetailModal();
    });


    // Initial setup
    renderCoworkerList();
});