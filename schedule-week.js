document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const weekDisplay = document.getElementById('weekDisplay');
    const prevWeekBtn = document.getElementById('prevWeek');
    const nextWeekBtn = document.getElementById('nextWeek');
    const scheduleGrid = document.querySelector('.schedule-grid');
    const dayHeaders = document.querySelectorAll('.day-header .date-info');

    let currentWeekStart = new Date(); // Start from today's week
    currentWeekStart.setHours(0, 0, 0, 0); // Normalize to start of day

    // Adjust currentWeekStart to be the Monday of the current week
    const dayOfWeek = currentWeekStart.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const diff = currentWeekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust if Sunday
    currentWeekStart.setDate(diff); // Set to Monday

    // Mock Schedule Data for a week view: by coworker, then by day
    // Each day can have multiple shifts or "Vrij" (off)
    const mockWeekSchedule = {
        // Data for a specific week, keyed by the Monday's date of that week (YYYY-MM-DD)
        "2025-05-26": { // Example for the week starting May 26, 2025 (assuming Monday)
            "Jan Jansen": {
                "Monday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Tuesday": [{ type: 'Vrij' }],
                "Wednesday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Thursday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Friday": [{ type: 'Ochtend', time: '08:00 - 12:00' }, { type: 'Middag', time: '12:00 - 18:00' }],
                "Saturday": [{ type: 'Custom', text: 'Training' }],
                "Sunday": [{ type: 'Vrij' }]
            },
            "Piet de Vries": {
                "Monday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Tuesday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Wednesday": [{ type: 'Vrij' }],
                "Thursday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Friday": [{ type: 'Vrij' }],
                "Saturday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Sunday": [{ type: 'Avond', time: '18:00 - 23:00' }]
            },
            "Anna Klaassen": {
                "Monday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Tuesday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Wednesday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Thursday": [{ type: 'Vrij' }],
                "Friday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Saturday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Sunday": [{ type: 'Middag', time: '12:00 - 18:00' }]
            },
            "Dirk Brandsen": {
                "Monday": [{ type: 'Vrij' }],
                "Tuesday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Wednesday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Thursday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Friday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Saturday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Sunday": [{ type: 'Vrij' }]
            },
             "Eva Schmidt": {
                "Monday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Tuesday": [{ type: 'Vrij' }],
                "Wednesday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Thursday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Friday": [{ type: 'Ochtend', time: '08:00 - 12:00' }, { type: 'Middag', time: '12:00 - 18:00' }],
                "Saturday": [{ type: 'Custom', text: 'Overleg' }],
                "Sunday": [{ type: 'Vrij' }]
            }
            // Add more coworkers and their weekly schedules
        },
        // Add more weeks if needed
        "2025-06-02": { // Example for the week starting June 2, 2025
            "Jan Jansen": {
                "Monday": [{ type: 'Vrij' }],
                "Tuesday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Wednesday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Thursday": [{ type: 'Vrij' }],
                "Friday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Saturday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Sunday": [{ type: 'Middag', time: '12:00 - 18:00' }]
            },
            "Piet de Vries": {
                "Monday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Tuesday": [{ type: 'Vrij' }],
                "Wednesday": [{ type: 'Ochtend', time: '08:00 - 12:00' }],
                "Thursday": [{ type: 'Middag', time: '12:00 - 18:00' }],
                "Friday": [{ type: 'Vrij' }],
                "Saturday": [{ type: 'Avond', time: '18:00 - 23:00' }],
                "Sunday": [{ type: 'Ochtend', time: '08:00 - 12:00' }]
            }
        }
    };

    // --- Theme Toggle Logic (retained from previous versions) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light mode
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Week Schedule Generation Logic ---

    // Helper to get week number (ISO 8601)
    function getWeekNumber(d) {
        // Copy date so don't modify original
        d = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
        // Set to nearest Thursday: current date + 4 - current day number
        // Make Sunday's day number 7
        d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
        // Get first day of year
        var yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
        // Calculate full weeks to nearest Thursday
        var weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
        return weekNo;
    }

    function formatDate(date) {
        const d = new Date(date);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
        return `${day}-${month}`;
    }

    function renderWeekSchedule() {
        // Clear all dynamically generated rows/cells
        const existingCoworkerRows = scheduleGrid.querySelectorAll('.coworker-row');
        existingCoworkerRows.forEach(row => row.remove());

        // Update week display (e.g., "Week 22, 2024")
        const weekNum = getWeekNumber(currentWeekStart);
        weekDisplay.textContent = `Week ${weekNum}, ${currentWeekStart.getFullYear()}`;

        // Update day headers with actual dates
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        let tempDate = new Date(currentWeekStart);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Normalize today for comparison

        for (let i = 0; i < 7; i++) {
            dayHeaders[i].textContent = formatDate(tempDate);
            // Highlight current day column
            const headerCell = dayHeaders[i].closest('.grid-header');
            if (tempDate.toDateString() === today.toDateString()) {
                headerCell.classList.add('current-day-column');
            } else {
                headerCell.classList.remove('current-day-column');
            }
            tempDate.setDate(tempDate.getDate() + 1);
        }

        // Reset tempDate to Monday for cell generation
        tempDate = new Date(currentWeekStart);

        // Get schedule for the current week (key is Monday's date)
        const weekKey = `${currentWeekStart.getFullYear()}-${String(currentWeekStart.getMonth() + 1).padStart(2, '0')}-${String(currentWeekStart.getDate()).padStart(2, '0')}`;
        const currentWeekData = mockWeekSchedule[weekKey] || {};

        // Get sorted list of all coworker names
        const allCoworkerNames = Object.keys(currentWeekData).sort();

        // Generate rows for each coworker
        allCoworkerNames.forEach(coworkerName => {
            const coworkerRow = document.createElement('div');
            coworkerRow.classList.add('coworker-row'); // A class for the whole row (optional, can be implicit)

            // Coworker Name Cell
            const nameCell = document.createElement('div');
            nameCell.classList.add('coworker-name-cell');
            nameCell.textContent = coworkerName;
            coworkerRow.appendChild(nameCell);

            // Availability Cells for each day
            for (let i = 0; i < 7; i++) {
                const dayName = days[i]; // 'Monday', 'Tuesday', etc.
                const cell = document.createElement('div');
                cell.classList.add('availability-cell');

                // Check if this cell's date is today
                let cellDate = new Date(currentWeekStart);
                cellDate.setDate(currentWeekStart.getDate() + i);
                cellDate.setHours(0,0,0,0); // Normalize

                if (cellDate.toDateString() === today.toDateString()) {
                    cell.classList.add('current-day-highlight');
                }

                const dayAvailability = currentWeekData[coworkerName] ? currentWeekData[coworkerName][dayName] : null;

                if (dayAvailability && dayAvailability.length > 0) {
                    dayAvailability.forEach(shift => {
                        const shiftBlock = document.createElement('div');
                        shiftBlock.classList.add('shift-block', `shift-${shift.type.toLowerCase().replace(' ', '-')}`);
                        shiftBlock.textContent = shift.type === 'Vrij' ? 'Vrij' : (shift.text || `${shift.type} ${shift.time}`);
                        cell.appendChild(shiftBlock);
                    });
                } else {
                    // Optionally display 'Geen dienst' or similar if no shifts
                    // const noShift = document.createElement('div');
                    // noShift.classList.add('shift-block', 'shift-off');
                    // noShift.textContent = 'Geen dienst';
                    // cell.appendChild(noShift);
                }

                // Add '+' button for adding shifts to an individual cell
                const addShiftBtn = document.createElement('button');
                addShiftBtn.classList.add('add-shift-btn');
                addShiftBtn.innerHTML = '&#43;'; // Plus icon
                addShiftBtn.title = `Add shift for ${coworkerName} on ${dayName}`;
                addShiftBtn.addEventListener('click', () => {
                    alert(`Add shift for ${coworkerName} on ${dayName} ${formatDate(cellDate)}`);
                    // In a real application, this would open a modal for adding/editing shifts
                });
                cell.appendChild(addShiftBtn);

                coworkerRow.appendChild(cell);
            }
            scheduleGrid.appendChild(coworkerRow);
        });

        // Apply bottom border removal to the true last row of cells
        const allCells = scheduleGrid.querySelectorAll('.coworker-row .availability-cell, .coworker-row .coworker-name-cell');
        const numRows = allCoworkerNames.length; // Number of coworker rows
        const cellsPerRow = 8; // 1 name cell + 7 availability cells

        for (let i = 0; i < allCells.length; i++) {
            const rowIdx = Math.floor(i / cellsPerRow);
            if (rowIdx === numRows - 1) { // Cells in the last logical row (last coworker)
                allCells[i].style.borderBottom = 'none';
            } else {
                allCells[i].style.borderBottom = '1px solid var(--schedule-border)';
            }
        }
    }

    // Event Listeners for Week Navigation
    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeekSchedule();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeekSchedule();
    });

    // Initial render of the week schedule
    renderWeekSchedule();
});