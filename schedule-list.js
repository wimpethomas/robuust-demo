document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const scheduleDateInput = document.getElementById('scheduleDate');
    const scheduleTimeSelect = document.getElementById('scheduleTime');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const departmentFilter = document.getElementById('departmentFilter');

    const availableCoworkersList = document.getElementById('availableCoworkersList');
    const availableCountSpan = document.getElementById('availableCount');
    const scheduledShiftsDiv = document.getElementById('scheduledShifts');

    let currentDisplayDate = new Date(); // Start with today's date

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
        { id: 'C001', name: 'Alice Smith', department: 'service', jobTitle: 'Waiter', availability: [] },
        { id: 'C002', name: 'Bob Johnson', department: 'kitchen', jobTitle: 'Head Cook', availability: [] },
        { id: 'C003', name: 'Charlie Brown', department: 'bar', jobTitle: 'Bartender', availability: [] },
        { id: 'C004', name: 'Diana Prince', department: 'service', jobTitle: 'Hostess', availability: [] },
        { id: 'C005', name: 'Eve Davis', department: 'kitchen', jobTitle: 'Cook', availability: [] },
        { id: 'C006', name: 'Frank White', department: 'service', jobTitle: 'Waiter', availability: [] },
        { id: 'C007', name: 'Grace Taylor', department: 'bar', jobTitle: 'Bartender', availability: [] },
        { id: 'C008', name: 'Harry Wilson', department: 'kitchen', jobTitle: 'Cook', availability: [] },
        { id: 'C009', name: 'Ivy Moore', department: 'service', jobTitle: 'Waiter', availability: [] },
        { id: 'C010', name: 'Jack Green', department: 'bar', jobTitle: 'Bartender', availability: [] },
        { id: 'C011', name: 'Karen Hall', department: 'kitchen', jobTitle: 'Dishwasher', availability: [] },
        { id: 'C012', name: 'Liam King', department: 'service', jobTitle: 'Busser', availability: [] },
        { id: 'C013', name: 'Mia Lewis', department: 'service', jobTitle: 'Waiter', availability: [] },
        { id: 'C014', name: 'Noah Young', department: 'kitchen', jobTitle: 'Cook', availability: [] },
        { id: 'C015', name: 'Olivia Clark', department: 'bar', jobTitle: 'Bartender', availability: [] },
    ];

    // Define minimum staffing requirements per job title per time slot
    const staffingRequirements = {
        'morning': { 'Head Cook': 1, 'Cook': 1, 'Waiter': 2, 'Hostess': 1, 'Bartender': 1, 'Dishwasher': 1, 'Busser': 1 },
        'afternoon': { 'Head Cook': 1, 'Cook': 2, 'Waiter': 3, 'Hostess': 1, 'Bartender': 2, 'Dishwasher': 1, 'Busser': 1 },
        'evening': { 'Head Cook': 1, 'Cook': 2, 'Waiter': 4, 'Hostess': 2, 'Bartender': 3, 'Dishwasher': 2, 'Busser': 2 },
        'late-night': { 'Head Cook': 0, 'Cook': 1, 'Waiter': 1, 'Hostess': 0, 'Bartender': 1, 'Dishwasher': 1, 'Busser': 0 },
        'all': { 'Head Cook': 1, 'Cook': 3, 'Waiter': 5, 'Hostess': 2, 'Bartender': 3, 'Dishwasher': 2, 'Busser': 2 }, // Combined max needs
    };

    // --- Helper Functions ---

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function parseTime(timeStr) {
        // Handle "HH:MM (+1)" format for parsing
        const cleanedTimeStr = timeStr.includes('(+1)') ? '24:00' : timeStr; // Treat as 24:00 for comparison
        const [hourStr, minuteStr] = cleanedTimeStr.split(':');
        return parseInt(hourStr) * 60 + parseInt(minuteStr); // minutes from midnight
    }

    function isInTimeSlot(shiftStart, shiftEnd, selectedTimeSlot) {
        if (selectedTimeSlot === 'all') return true;

        const timeSlots = {
            'morning': { start: parseTime('06:00'), end: parseTime('12:00') },
            'afternoon': { start: parseTime('12:00'), end: parseTime('18:00') },
            'evening': { start: parseTime('18:00'), end: parseTime('24:00') },
            'late-night': { start: parseTime('00:00'), end: parseTime('06:00') }
        };

        const slot = timeSlots[selectedTimeSlot];
        if (!slot) return false;

        const shiftStartMin = parseTime(shiftStart);
        const shiftEndMin = parseTime(shiftEnd);

        // Handle overnight shifts for late-night or shifts crossing midnight
        if (selectedTimeSlot === 'late-night') {
            // Shift is overnight if it starts before midnight and ends after, or entirely in the late-night slot
            // Or shift starts in late-night slot and ends after midnight
            // This is a simplified overlap check. For complex overnight scenarios, you might need to duplicate shifts
            // or use a more robust date-time library.
            const slotEndAdjusted = slot.end; // 6:00 (next day)
            const slotStartAdjusted = slot.start; // 0:00 (current day)

            // Case 1: Shift entirely within late-night (e.g., 01:00-05:00)
            if (shiftStartMin >= slotStartAdjusted && shiftEndMin <= slotEndAdjusted && shiftStartMin < shiftEndMin) {
                return true;
            }
            // Case 2: Shift starts before 00:00 but ends within late-night (e.g., 22:00-02:00)
            if (shiftStartMin >= parseTime('00:00') && shiftEndMin <= slotEndAdjusted) { // This is already covered by Case 1
                 // We need to ensure we don't accidentally pick up shifts from *previous* day's evening
                 // Let's assume shiftEndMin is relative to its own day.
                 // A shift like 22:00 - 02:00 should appear in 'late-night' for 00:00-06:00
                 // This requires knowing if the shift 'crosses midnight'.
                 // For simplicity, let's just check if *any part* of the shift falls into the selected slot.
            }

            // More robust overlap check for any time slot:
            // A  ----- B
            //    C ----- D
            // Overlap if (A < D and B > C)
            const shiftSpanStart = shiftStartMin;
            const shiftSpanEnd = shiftEndMin >= shiftStartMin ? shiftEndMin : shiftEndMin + 1440; // Add 24 hours if it's an overnight shift

            const slotSpanStart = slot.start;
            const slotSpanEnd = slot.end >= slot.start ? slot.end : slot.end + 1440; // Add 24 hours for overnight slots

            return (shiftSpanStart < slotSpanEnd && shiftSpanEnd > slotSpanStart);

        } else {
             // For other slots, simple overlap check
            return (shiftStartMin < slot.end && shiftEndMin > slot.start);
        }
    }


    // Function to generate dummy shift data for a day
    // This is a simplified version; in a real app, this would come from a backend.
    let currentDayShifts = []; // Store shifts for the currently viewed day

    function generateShiftsForDay(date, filterDepartment = 'all') {
        const shifts = [];
        const todayStr = formatDate(date);
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = daysOfWeek[date.getDay()];

        coworkersData.forEach(coworker => {
            // Simulate random availability (e.g., some days off, some partial availability)
            const randomAvailability = Math.random();
            let availabilityStatus = 'available';
            let availabilityTime = '';

            if (randomAvailability < 0.15) { // 15% chance of being Day Off
                availabilityStatus = 'day-off';
            } else if (randomAvailability < 0.35) { // 20% chance of being Partially Available
                const startHour = Math.floor(Math.random() * (12 - 8) + 8); // 8 AM - 11 AM
                const endHour = startHour + Math.floor(Math.random() * (4 - 2) + 2); // 2-3 hrs available
                availabilityStatus = 'partially-available';
                availabilityTime = `${String(startHour).padStart(2, '0')}:00 - ${String(endHour).padStart(2, '0')}:00`;
            }

            coworker.availability[todayStr] = { status: availabilityStatus, time: availabilityTime };

            // Simulate actual shifts being generated and assigned to some coworkers
            // Only generate shifts if not on day off and within the filtered department
            if (availabilityStatus !== 'day-off' && (filterDepartment === 'all' || coworker.department === filterDepartment)) {
                const randomShift = Math.random();
                if (randomShift < 0.6) { // 60% chance of having a shift
                    let shiftStart, shiftEnd, shiftType, shiftTitle;
                    const department = coworker.department;

                    if (department === 'kitchen') {
                        const start = [8, 12, 16][Math.floor(Math.random() * 3)]; // 8am, 12pm, 4pm
                        const duration = Math.floor(Math.random() * (9 - 6) + 6); // 6-8 hours
                        shiftStart = `${String(start).padStart(2, '0')}:00`;
                        shiftEnd = `${String(start + duration).padStart(2, '0')}:00`;
                        shiftType = 'Cook Shift';
                        shiftTitle = (start < 12) ? 'Morning Cook' : (start < 17) ? 'Afternoon Cook' : 'Evening Cook';
                    } else if (department === 'service') {
                        const start = [9, 13, 17][Math.floor(Math.random() * 3)]; // 9am, 1pm, 5pm
                        const duration = Math.floor(Math.random() * (8 - 5) + 5); // 5-7 hours
                        shiftStart = `${String(start).padStart(2, '0')}:00`;
                        shiftEnd = `${String(start + duration).padStart(2, '0')}:00`;
                        shiftType = coworker.jobTitle === 'Hostess' ? 'Host Shift' : 'Service Shift';
                        shiftTitle = (start < 12) ? 'Lunch Service' : (start < 17) ? 'Afternoon Service' : 'Dinner Service';
                    } else if (department === 'bar') {
                        const start = [10, 14, 18][Math.floor(Math.random() * 3)]; // 10am, 2pm, 6pm
                        const duration = Math.floor(Math.random() * (8 - 5) + 5); // 5-7 hours
                        shiftStart = `${String(start).padStart(2, '0')}:00`;
                        shiftEnd = `${String(start + duration).padStart(2, '0')}:00`;
                        shiftType = 'Bar Shift';
                        shiftTitle = (start < 14) ? 'Day Bar' : (start < 18) ? 'Afternoon Bar' : 'Evening Bar';
                    }

                    // Ensure shiftEnd doesn't go past 24:00 (midnight)
                    let endHour = parseInt(shiftEnd.split(':')[0]);
                    let endMinute = parseInt(shiftEnd.split(':')[1]);
                    let adjustedShiftEnd = shiftEnd;
                    if (endHour >= 24) {
                        endHour -= 24; // If it goes past midnight, it's the next day
                        adjustedShiftEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} (+1)`; // Indicate next day
                    }


                    shifts.push({
                        id: `S${Math.random().toString(36).substr(2, 9)}`,
                        coworkerId: coworker.id,
                        coworkerName: coworker.name,
                        jobTitle: coworker.jobTitle,
                        department: coworker.department,
                        time: `${shiftStart} - ${adjustedShiftEnd}`,
                        startTime: shiftStart,
                        endTime: adjustedShiftEnd.includes('(+1)') ? '24:00' : adjustedShiftEnd, // For comparison, treat +1 as end of current day
                        type: shiftType,
                        title: shiftTitle, // New property for shift title
                        notes: `Standard ${shiftType} on ${dayName}.`,
                        hours: (parseInt(shiftEnd.split(':')[0]) - parseInt(shiftStart.split(':')[0])) // Simple hour calc
                    });
                }
            }
        });

        // Filter out shifts that don't fall into the selected time slot
        const selectedTimeSlot = scheduleTimeSelect.value;
        return shifts.filter(shift => isInTimeSlot(shift.startTime, shift.endTime, selectedTimeSlot));
    }


    function renderScheduleList() {
        const todayStr = formatDate(currentDisplayDate);
        scheduleDateInput.value = todayStr;

        const selectedDepartment = departmentFilter.value;
        const selectedTimeSlot = scheduleTimeSelect.value;

        // Generate shifts for the day (this is where actual data would be fetched)
        currentDayShifts = generateShiftsForDay(currentDisplayDate, selectedDepartment);

        // --- Render Available Coworkers ---
        availableCoworkersList.innerHTML = '';
        let totalAvailableCount = 0;
        const availableCoworkersByJob = {};

        // Group coworkers by job title and determine availability
        coworkersData.forEach(coworker => {
            if (selectedDepartment === 'all' || coworker.department === selectedDepartment) {
                const availability = coworker.availability[todayStr];
                const isScheduled = currentDayShifts.some(shift => shift.coworkerId === coworker.id);

                if (!isScheduled && availability && (availability.status === 'available' || availability.status === 'partially-available')) {
                    if (!availableCoworkersByJob[coworker.jobTitle]) {
                        availableCoworkersByJob[coworker.jobTitle] = [];
                    }
                    availableCoworkersByJob[coworker.jobTitle].push({
                        id: coworker.id,
                        name: coworker.name,
                        department: coworker.department,
                        jobTitle: coworker.jobTitle,
                        availability: availability
                    });
                    totalAvailableCount++;
                }
            }
        });

        availableCountSpan.textContent = `(${totalAvailableCount})`;

        // Sort job titles alphabetically
        const sortedJobTitlesAvailable = Object.keys(availableCoworkersByJob).sort();

        sortedJobTitlesAvailable.forEach(jobTitle => {
            const jobGroup = document.createElement('div');
            jobGroup.classList.add('job-title-group');

            const jobHeader = document.createElement('div');
            jobHeader.classList.add('job-title-header');
            jobHeader.textContent = jobTitle;

            // Staffing status for this job title and time slot
            const requiredStaff = staffingRequirements[selectedTimeSlot]?.[jobTitle] || 0;
            const currentStaff = currentDayShifts.filter(s => s.jobTitle === jobTitle && isInTimeSlot(s.startTime, s.endTime, selectedTimeSlot)).length;
            const staffingDiff = requiredStaff - currentStaff;

            const staffingStatusSpan = document.createElement('span');
            staffingStatusSpan.classList.add('staffing-status');

            if (staffingDiff > 0) {
                staffingStatusSpan.classList.add('staffing-needed');
                staffingStatusSpan.textContent = `+${staffingDiff}`;
            } else {
                staffingStatusSpan.classList.add('staffing-met');
                staffingStatusSpan.innerHTML = '<i class="fas fa-check"></i>';
            }
            jobHeader.appendChild(staffingStatusSpan);
            jobGroup.appendChild(jobHeader);

            availableCoworkersByJob[jobTitle].forEach(coworker => {
                const coworkerItem = document.createElement('div');
                coworkerItem.classList.add('coworker-item');
                coworkerItem.dataset.coworkerId = coworker.id;
                coworkerItem.dataset.jobTitle = coworker.jobTitle;

                const nameSpan = document.createElement('span');
                nameSpan.classList.add('coworker-name');
                nameSpan.textContent = coworker.name;
                coworkerItem.appendChild(nameSpan);

                if (coworker.availability.status === 'partially-available' && coworker.availability.time) {
                    const hoursSpan = document.createElement('span');
                    hoursSpan.classList.add('coworker-hours');
                    hoursSpan.textContent = `(${coworker.availability.time} available)`;
                    coworkerItem.appendChild(hoursSpan);
                }

                // Add drag-and-drop functionality (simplified for this example)
                coworkerItem.draggable = true;
                coworkerItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', coworker.id);
                    e.dataTransfer.effectAllowed = 'copyMove';
                });

                jobGroup.appendChild(coworkerItem);
            });
            availableCoworkersList.appendChild(jobGroup);
        });

        // --- Render Scheduled Shifts by Job Title ---
        scheduledShiftsDiv.innerHTML = '';
        if (currentDayShifts.length === 0) {
            scheduledShiftsDiv.innerHTML = '<p class="no-shifts-message">No shifts scheduled for the selected filters.</p>';
            return;
        }

        // Group shifts by job title
        const shiftsByJobTitle = {};
        currentDayShifts.forEach(shift => {
            if (!shiftsByJobTitle[shift.jobTitle]) {
                shiftsByJobTitle[shift.jobTitle] = [];
            }
            shiftsByJobTitle[shift.jobTitle].push(shift);
        });

        // Sort job titles alphabetically for consistent display
        const sortedJobTitlesScheduled = Object.keys(shiftsByJobTitle).sort();

        sortedJobTitlesScheduled.forEach(jobTitle => {
            const jobTitleBox = document.createElement('div');
            jobTitleBox.classList.add('job-title-shift-box'); // New class for the box

            const jobTitleHeader = document.createElement('h4');
            jobTitleHeader.classList.add('job-title-box-header'); // Header for the box
            jobTitleHeader.textContent = jobTitle;
            jobTitleBox.appendChild(jobTitleHeader);

            // Sort shifts within this job title by start time
            shiftsByJobTitle[jobTitle].sort((a, b) => parseTime(a.startTime) - parseTime(b.startTime));

            shiftsByJobTitle[jobTitle].forEach(shift => {
                const shiftEntry = document.createElement('div');
                shiftEntry.classList.add('shift-entry');
                shiftEntry.dataset.shiftId = shift.id;

                const shiftHeader = document.createElement('div');
                shiftHeader.classList.add('shift-header');
                // Display shift title (e.g., "Morning Cook") and coworker name
                shiftHeader.innerHTML = `<span>${shift.title}: ${shift.coworkerName}</span>`;

                const shiftTime = document.createElement('span');
                shiftTime.classList.add('shift-time');
                shiftTime.textContent = shift.time;
                shiftHeader.appendChild(shiftTime);

                shiftEntry.appendChild(shiftHeader);

                const shiftDetails = document.createElement('div');
                shiftDetails.classList.add('shift-details');
                shiftDetails.innerHTML = `
                    <span><strong>Department:</strong> ${shift.department.charAt(0).toUpperCase() + shift.department.slice(1)}</span>
                    <span><strong>Notes:</strong> ${shift.notes}</span>
                `;
                shiftEntry.appendChild(shiftDetails);

                const shiftActions = document.createElement('div');
                shiftActions.classList.add('shift-actions');
                shiftActions.innerHTML = `
                    <i class="fas fa-edit action-icon edit" title="Edit Shift"></i>
                    <i class="fas fa-trash-alt action-icon delete" title="Delete Shift"></i>
                `;
                shiftEntry.appendChild(shiftActions);

                jobTitleBox.appendChild(shiftEntry);
            });
            scheduledShiftsDiv.appendChild(jobTitleBox);
        });
    }

    // --- Event Listeners ---

    // Date navigation
    scheduleDateInput.value = formatDate(currentDisplayDate); // Set initial date
    scheduleDateInput.addEventListener('change', (e) => {
        currentDisplayDate = new Date(e.target.value);
        renderScheduleList();
    });

    prevDayBtn.addEventListener('click', () => {
        currentDisplayDate.setDate(currentDisplayDate.getDate() - 1);
        renderScheduleList();
    });

    nextDayBtn.addEventListener('click', () => {
        currentDisplayDate.setDate(currentDisplayDate.getDate() + 1);
        renderScheduleList();
    });

    // Filters
    departmentFilter.addEventListener('change', renderScheduleList);
    scheduleTimeSelect.addEventListener('change', renderScheduleList);

    // Initial render
    renderScheduleList();
});