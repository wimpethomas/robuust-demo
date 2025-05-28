document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const currentMonthDisplay = document.getElementById('currentMonthDisplay');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const departmentFilter = document.getElementById('departmentFilter');
    const calendarGrid = document.getElementById('calendarGrid');
    const monthlyTotalsTableBody = document.getElementById('monthlyTotalsTableBody');

    let currentMonth = new Date(); // Start with current month
    currentMonth.setDate(1); // Set to the first day of the current month

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

    // --- Sample Coworker Data (Simulated for demonstration) ---
    const coworkersData = [
        { id: 'C001', name: 'Alice Smith', department: 'service' },
        { id: 'C002', name: 'Bob Johnson', department: 'kitchen' },
        { id: 'C003', name: 'Charlie Brown', department: 'bar' },
        { id: 'C004', name: 'Diana Prince', department: 'service' },
        { id: 'C005', name: 'Eve Davis', department: 'kitchen' },
        { id: 'C006', name: 'Frank White', department: 'service' },
        { id: 'C007', name: 'Grace Taylor', department: 'bar' },
        { id: 'C008', name: 'Harry Wilson', department: 'kitchen' },
        { id: 'C009', name: 'Ivy Moore', department: 'service' },
        { id: 'C010', name: 'Jack Green', department: 'bar' },
    ];

    // Function to generate dummy schedule data for a specific day
    function generateDailySchedule(coworker, date) {
        const random = Math.random();
        const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday

        if (random < 0.15) { // 15% chance of Day Off
            return { status: 'Day Off', hours: 0 };
        } else if (random < 0.45) { // 30% chance of being Scheduled (full shift)
            const startHour = Math.floor(Math.random() * (16 - 9) + 9); // 9 AM to 3 PM
            const duration = Math.floor(Math.random() * (9 - 6) + 6); // 6 to 8 hours
            const endHour = startHour + duration;
            return { status: 'Scheduled', time: `${startHour}:00 - ${endHour}:00`, hours: duration };
        } else if (random < 0.65) { // 20% chance of being Partially Scheduled
            const startHour = Math.floor(Math.random() * (16 - 10) + 10); // 10 AM to 3 PM
            const duration = Math.floor(Math.random() * (5 - 3) + 3); // 3 to 4 hours
            const endHour = startHour + duration;
            return { status: 'Partially Scheduled', time: `${startHour}:00 - ${endHour}:00`, hours: duration };
        } else if (random < 0.85) { // 20% chance of being Available (whole day)
            return { status: 'Available', hours: 0 };
        } else { // 15% chance of being Partially Available
            const startHour = Math.floor(Math.random() * (16 - 9) + 9);
            const endHour = startHour + Math.floor(Math.random() * (4 - 2) + 2); // Available for 2-3 hours
            return { status: 'Partially Available', time: `${startHour}:00 - ${endHour}:00`, hours: 0 };
        }
    }

    // Function to render the calendar and totals
    function renderCalendar() {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth(); // 0-indexed month
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 for Sunday, 1 for Monday...

        // Adjust first day for calendar grid (make Monday = 0)
        const startDayIndex = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1; // 0=Mon, 1=Tue... 6=Sun

        // Update month display
        currentMonthDisplay.textContent = new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'long' }).format(currentMonth);

        // Clear existing calendar and totals
        calendarGrid.innerHTML = '';
        monthlyTotalsTableBody.innerHTML = '';

        const selectedDepartment = departmentFilter.value;
        let monthlyTotalHoursPerCoworker = {};

        // Initialize total hours for each coworker
        coworkersData.forEach(coworker => {
            monthlyTotalHoursPerCoworker[coworker.id] = {
                name: coworker.name,
                department: coworker.department,
                totalHours: 0
            };
        });

        // Add empty days for the start of the month to align with Monday
        for (let i = 0; i < startDayIndex; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty-day');
            // Show last few days of previous month for context (optional)
            const prevMonthDate = new Date(year, month, 0); // Last day of previous month
            prevMonthDate.setDate(prevMonthDate.getDate() - (startDayIndex - 1 - i));
            const dayDateSpan = document.createElement('span');
            dayDateSpan.classList.add('day-date');
            dayDateSpan.textContent = prevMonthDate.getDate();
            emptyDay.appendChild(dayDateSpan);
            calendarGrid.appendChild(emptyDay);
        }

        // Render days of the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(year, month, day);
            const dayOfWeek = date.getDay(); // 0 for Sunday, 6 for Saturday

            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');
            if (dayOfWeek === 0 || dayOfWeek === 6) { // Sunday (0) or Saturday (6)
                dayCell.classList.add('weekend');
            }

            const dayDateSpan = document.createElement('span');
            dayDateSpan.classList.add('day-date');
            dayDateSpan.textContent = day;
            dayCell.appendChild(dayDateSpan);

            const dayContent = document.createElement('div');
            dayContent.classList.add('calendar-day-content');

            coworkersData.forEach(coworker => {
                if (selectedDepartment === 'all' || coworker.department === selectedDepartment) {
                    const schedule = generateDailySchedule(coworker, date); // Generate schedule for this specific day

                    if (schedule.status !== 'Available' && schedule.status !== 'Partially Available') { // Only show entries that are scheduled or day off
                        const scheduleItem = document.createElement('div');
                        scheduleItem.classList.add('schedule-item', schedule.status.toLowerCase().replace(/\s/g, '-')); // e.g., 'scheduled', 'day-off'

                        if (schedule.status === 'Scheduled' || schedule.status === 'Partially Scheduled') {
                            scheduleItem.innerHTML = `<strong>${coworker.name}:</strong> ${schedule.time}`;
                            monthlyTotalHoursPerCoworker[coworker.id].totalHours += schedule.hours;
                        } else if (schedule.status === 'Day Off') {
                            scheduleItem.innerHTML = `<strong>${coworker.name}:</strong> Day Off`;
                        }
                        dayContent.appendChild(scheduleItem);
                    }
                }
            });
            dayCell.appendChild(dayContent);
            calendarGrid.appendChild(dayCell);
        }

        // Add empty days for the end of the month to fill the last row (optional)
        const totalCells = startDayIndex + daysInMonth;
        const remainingCells = 42 - totalCells; // Max 6 weeks * 7 days = 42 cells (can be 35 also)
        const nextMonthStart = new Date(year, month + 1, 1);

        for (let i = 0; i < remainingCells; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty-day', 'past-month-day');
            const dayDateSpan = document.createElement('span');
            dayDateSpan.classList.add('day-date');
            dayDateSpan.textContent = nextMonthStart.getDate() + i;
            emptyDay.appendChild(dayDateSpan);

            // Add weekend class if it's a weekend day of next month
            const futureDate = new Date(year, month + 1, nextMonthStart.getDate() + i);
            if (futureDate.getDay() === 0 || futureDate.getDay() === 6) {
                emptyDay.classList.add('weekend');
            }

            calendarGrid.appendChild(emptyDay);
        }


        // Render Monthly Totals
        Object.values(monthlyTotalHoursPerCoworker).forEach(coworkerTotal => {
            if (selectedDepartment === 'all' || coworkerTotal.department === selectedDepartment) {
                const row = monthlyTotalsTableBody.insertRow();
                const nameCell = row.insertCell();
                nameCell.textContent = coworkerTotal.name;
                const deptCell = row.insertCell();
                deptCell.textContent = coworkerTotal.department.charAt(0).toUpperCase() + coworkerTotal.department.slice(1);
                const totalHoursCell = row.insertCell();
                totalHoursCell.textContent = `${coworkerTotal.totalHours} hrs`;
            }
        });
    }

    // --- Event Listeners ---
    prevMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() - 1);
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth.setMonth(currentMonth.getMonth() + 1);
        renderCalendar();
    });

    departmentFilter.addEventListener('change', renderCalendar);

    // Initial render
    renderCalendar();
});