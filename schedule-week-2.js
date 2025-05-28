document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    const currentWeekDisplay = document.getElementById('currentWeekDisplay');
    const prevWeekBtn = document.getElementById('prevWeekBtn');
    const nextWeekBtn = document.getElementById('nextWeekBtn');
    const departmentFilter = document.getElementById('departmentFilter');
    const weeklyScheduleGridContent = document.getElementById('weeklyScheduleGridContent');

    // Scheduling Modal Elements
    const openSchedulingModalBtn = document.getElementById('openSchedulingModalBtn');
    const schedulingModalOverlay = document.getElementById('schedulingModalOverlay');
    const schedulingModal = document.getElementById('schedulingModal');
    const closeSchedulingModalBtn = document.getElementById('closeSchedulingModalBtn');
    const cancelSchedulingModalBtn = document.getElementById('cancelSchedulingModalBtn');
    const saveSchedulingModalBtn = document.getElementById('saveSchedulingModalBtn');

    const modalPrevDayBtn = document.getElementById('modalPrevDayBtn');
    const modalNextDayBtn = document.getElementById('modalNextDayBtn');
    const modalCurrentDayDisplay = document.getElementById('modalCurrentDayDisplay');
    const modalScheduledDayTitle = document.getElementById('modalScheduledDayTitle');
    const modalAvailableCoworkersList = document.getElementById('modalAvailableCoworkersList');
    const modalAvailableCountSpan = document.getElementById('modalAvailableCount');
    const modalScheduledShiftsDiv = document.getElementById('modalScheduledShiftsDiv');

    let currentWeekStart = new Date(); // Stores the start of the current week (Monday)
    let currentModalDate = new Date(); // Stores the date currently displayed in the modal

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
        { id: 'C001', name: 'Alice Smith', department: 'service', jobTitle: 'Waiter', availability: {} },
        { id: 'C002', name: 'Bob Johnson', department: 'kitchen', jobTitle: 'Head Cook', availability: {} },
        { id: 'C003', name: 'Charlie Brown', department: 'bar', jobTitle: 'Bartender', availability: {} },
        { id: 'C004', name: 'Diana Prince', department: 'service', jobTitle: 'Hostess', availability: {} },
        { id: 'C005', name: 'Eve Davis', department: 'kitchen', jobTitle: 'Cook', availability: {} },
        { id: 'C006', name: 'Frank White', department: 'service', jobTitle: 'Waiter', availability: {} },
        { id: 'C007', name: 'Grace Taylor', department: 'bar', jobTitle: 'Bartender', availability: {} },
        { id: 'C008', name: 'Harry Wilson', department: 'kitchen', jobTitle: 'Cook', availability: {} },
        { id: 'C009', name: 'Ivy Moore', department: 'service', jobTitle: 'Waiter', availability: {} },
        { id: 'C010', name: 'Jack Green', department: 'bar', jobTitle: 'Bartender', availability: {} },
        { id: 'C011', name: 'Karen Hall', department: 'kitchen', jobTitle: 'Dishwasher', availability: {} },
        { id: 'C012', name: 'Liam King', department: 'service', jobTitle: 'Busser', availability: {} },
        { id: 'C013', name: 'Mia Lewis', department: 'service', jobTitle: 'Waiter', availability: {} },
        { id: 'C014', name: 'Noah Young', department: 'kitchen', jobTitle: 'Cook', availability: {} },
        { id: 'C015', name: 'Olivia Clark', department: 'bar', jobTitle: 'Bartender', availability: {} },
    ];

    // In-memory store for scheduled shifts (key: YYYY-MM-DD, value: array of shifts)
    // This will act as our "database" for the weekly schedule
    let weeklyScheduledShifts = {}; // { '2025-05-26': [{...shift1}, {...shift2}], '2025-05-27': [...] }

    // --- Helper Functions ---

    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function getWeekStart(date) {
        const d = new Date(date);
        const day = d.getDay(); // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
        const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust to Monday (or previous Monday if current day is Sunday)
        d.setDate(diff);
        d.setHours(0, 0, 0, 0); // Set to start of the day
        return d;
    }

    function getWeekEnd(date) {
        const start = getWeekStart(date);
        const end = new Date(start);
        end.setDate(start.getDate() + 6); // End of Sunday
        end.setHours(23, 59, 59, 999); // Set to end of the day
        return end;
    }

    function getDayName(date) {
        const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        return days[date.getDay()];
    }

    function generateRandomShiftData(coworker, dateStr) {
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

            let endHour = parseInt(shiftEnd.split(':')[0]);
            let endMinute = parseInt(shiftEnd.split(':')[1]);
            let adjustedShiftEnd = shiftEnd;
            if (endHour >= 24) {
                endHour -= 24;
                adjustedShiftEnd = `${String(endHour).padStart(2, '0')}:${String(endMinute).padStart(2, '0')} (+1)`;
            }

            return {
                id: `S${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                coworkerId: coworker.id,
                coworkerName: coworker.name,
                jobTitle: coworker.jobTitle,
                department: coworker.department,
                time: `${shiftStart} - ${adjustedShiftEnd}`,
                startTime: shiftStart,
                endTime: adjustedShiftEnd.includes('(+1)') ? '24:00' : adjustedShiftEnd,
                type: shiftType,
                title: shiftTitle,
                notes: `Standard ${shiftType}.`,
                hours: (parseInt(shiftEnd.split(':')[0]) - parseInt(shiftStart.split(':')[0]))
            };
        }
        return null;
    }

    // Initialize some dummy weekly shifts on load (for demonstration)
    function initializeDummyWeeklyShifts() {
        const today = new Date();
        const startOfWeek = getWeekStart(today);

        for (let i = 0; i < 7; i++) {
            const date = new Date(startOfWeek);
            date.setDate(startOfWeek.getDate() + i);
            const dateStr = formatDate(date);
            weeklyScheduledShifts[dateStr] = []; // Initialize empty array for each day

            // Generate some random shifts for a few coworkers each day
            coworkersData.forEach(coworker => {
                const shift = generateRandomShiftData(coworker, dateStr);
                if (shift) {
                    weeklyScheduledShifts[dateStr].push(shift);
                }
            });
        }
    }

    // Call this once on initial page load
    initializeDummyWeeklyShifts();


    // --- Main Weekly Schedule View Rendering ---
    function renderWeeklySchedule() {
        const startOfWeek = getWeekStart(currentWeekStart);
        const endOfWeek = getWeekEnd(currentWeekStart);
        currentWeekDisplay.textContent = `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

        // Update day headers with actual dates
        const dayDateSpans = document.querySelectorAll('.schedule-week-grid-container .day-header .day-date');
        let tempDate = new Date(startOfWeek);
        for (let i = 0; i < 7; i++) {
            dayDateSpans[i].textContent = `(${tempDate.getDate()}/${tempDate.getMonth() + 1})`;
            tempDate.setDate(tempDate.getDate() + 1);
        }

        weeklyScheduleGridContent.innerHTML = '';
        const jobTitles = [...new Set(coworkersData.map(c => c.jobTitle))].sort();
        const selectedDepartment = departmentFilter.value;

        jobTitles.forEach(jobTitle => {
            const jobTitleRow = document.createElement('div');
            jobTitleRow.classList.add('job-title-row');

            const jobTitleCell = document.createElement('div');
            jobTitleCell.classList.add('job-title-cell', 'header-label');
            jobTitleCell.textContent = jobTitle;
            jobTitleRow.appendChild(jobTitleCell);

            // Populate cells for each day
            let currentDay = new Date(startOfWeek);
            for (let i = 0; i < 7; i++) {
                const dateStr = formatDate(currentDay);
                const dayCell = document.createElement('div');
                dayCell.classList.add('schedule-day-cell');
                dayCell.dataset.date = dateStr;
                dayCell.dataset.jobTitle = jobTitle;

                const shiftsForDayAndJob = (weeklyScheduledShifts[dateStr] || []).filter(
                    s => s.jobTitle === jobTitle && (selectedDepartment === 'all' || s.department === selectedDepartment)
                );

                if (shiftsForDayAndJob.length > 0) {
                    shiftsForDayAndJob.forEach(shift => {
                        const shiftCard = document.createElement('div');
                        shiftCard.classList.add('weekly-shift-card');
                        shiftCard.innerHTML = `
                            <span class="coworker-name">${shift.coworkerName}</span>
                            <span class="shift-time">${shift.time}</span>
                            <span class="shift-title">${shift.title}</span>
                        `;
                        dayCell.appendChild(shiftCard);
                    });
                } else {
                    const noShiftText = document.createElement('span');
                    noShiftText.classList.add('no-shift-placeholder');
                    noShiftText.textContent = 'No one scheduled';
                    dayCell.appendChild(noShiftText);
                }
                jobTitleRow.appendChild(dayCell);
                currentDay.setDate(currentDay.getDate() + 1); // Move to next day
            }
            weeklyScheduleGridContent.appendChild(jobTitleRow);
        });
    }

    // --- Scheduling Modal Functions ---

    function openSchedulingModal() {
        schedulingModalOverlay.style.display = 'flex';
        // Set initial modal date to the current week's start
        currentModalDate = new Date(getWeekStart(currentWeekStart));
        renderModalSchedule();
    }

    function closeSchedulingModal() {
        schedulingModalOverlay.style.display = 'none';
        // Re-render the main weekly schedule to reflect any changes made in the modal
        renderWeeklySchedule();
    }

    function renderModalSchedule() {
        const dateStr = formatDate(currentModalDate);
        modalCurrentDayDisplay.textContent = `${getDayName(currentModalDate)}, ${dateStr}`;
        modalScheduledDayTitle.textContent = dateStr; // For the right pane title

        // --- Render Available Coworkers in Modal ---
        modalAvailableCoworkersList.innerHTML = '';
        let totalAvailableCount = 0;
        const availableCoworkersByJob = {};

        coworkersData.forEach(coworker => {
            const isScheduled = (weeklyScheduledShifts[dateStr] || []).some(shift => shift.coworkerId === coworker.id);

            // Simulate availability (e.g., some days off)
            // For modal, let's assume all coworkers are potentially available
            // unless they are already scheduled for this day
            if (!isScheduled) {
                if (!availableCoworkersByJob[coworker.jobTitle]) {
                    availableCoworkersByJob[coworker.jobTitle] = [];
                }
                availableCoworkersByJob[coworker.jobTitle].push(coworker);
                totalAvailableCount++;
            }
        });

        modalAvailableCountSpan.textContent = `(${totalAvailableCount})`;

        const sortedJobTitlesAvailable = Object.keys(availableCoworkersByJob).sort();

        sortedJobTitlesAvailable.forEach(jobTitle => {
            const jobGroup = document.createElement('div');
            jobGroup.classList.add('job-title-group'); // Re-using class from schedule-list.css

            const jobHeader = document.createElement('div');
            jobHeader.classList.add('job-title-header');
            jobHeader.textContent = jobTitle;
            jobGroup.appendChild(jobHeader);

            availableCoworkersByJob[jobTitle].forEach(coworker => {
                const coworkerItem = document.createElement('div');
                coworkerItem.classList.add('coworker-item');
                coworkerItem.dataset.coworkerId = coworker.id;
                coworkerItem.dataset.coworkerName = coworker.name;
                coworkerItem.dataset.jobTitle = coworker.jobTitle;
                coworkerItem.dataset.department = coworker.department;
                coworkerItem.textContent = coworker.name; // Simple name display

                coworkerItem.draggable = true;
                coworkerItem.addEventListener('dragstart', (e) => {
                    e.dataTransfer.setData('text/plain', JSON.stringify({
                        id: coworker.id,
                        name: coworker.name,
                        jobTitle: coworker.jobTitle,
                        department: coworker.department
                    }));
                    e.dataTransfer.effectAllowed = 'copy'; // Copy the coworker to schedule
                });
                jobGroup.appendChild(coworkerItem);
            });
            modalAvailableCoworkersList.appendChild(jobGroup);
        });

        // --- Render Scheduled Shifts in Modal ---
        modalScheduledShiftsDiv.innerHTML = '';
        const shiftsForCurrentDay = weeklyScheduledShifts[dateStr] || [];

        if (shiftsForCurrentDay.length === 0) {
            modalScheduledShiftsDiv.innerHTML = '<p class="no-shifts-message-modal">Drag & drop coworkers here to schedule them.</p>';
        } else {
            // Group shifts by job title and then by shift type/title
            const shiftsByJobTitle = {};
            shiftsForCurrentDay.forEach(shift => {
                if (!shiftsByJobTitle[shift.jobTitle]) {
                    shiftsByJobTitle[shift.jobTitle] = [];
                }
                shiftsByJobTitle[shift.jobTitle].push(shift);
            });

            const sortedJobTitlesScheduled = Object.keys(shiftsByJobTitle).sort();

            sortedJobTitlesScheduled.forEach(jobTitle => {
                const jobTitleBox = document.createElement('div');
                jobTitleBox.classList.add('job-title-shift-box'); // Re-using class from schedule-list.css

                const jobTitleHeader = document.createElement('h4');
                jobTitleHeader.classList.add('job-title-box-header');
                jobTitleHeader.textContent = jobTitle;
                jobTitleBox.appendChild(jobTitleHeader);

                // Sort shifts within this job title by start time
                shiftsByJobTitle[jobTitle].sort((a, b) => {
                    const parseTime = (timeStr) => {
                        const [hourStr, minuteStr] = timeStr.split(':');
                        return parseInt(hourStr) * 60 + parseInt(minuteStr);
                    };
                    return parseTime(a.startTime) - parseTime(b.startTime);
                });


                shiftsByJobTitle[jobTitle].forEach(shift => {
                    const shiftEntry = document.createElement('div');
                    shiftEntry.classList.add('shift-entry');
                    shiftEntry.dataset.shiftId = shift.id;
                    shiftEntry.dataset.coworkerId = shift.coworkerId; // Store coworker ID for unassigning

                    const shiftHeader = document.createElement('div');
                    shiftHeader.classList.add('shift-header');
                    shiftHeader.innerHTML = `<span>${shift.title}: ${shift.coworkerName}</span>`;

                    const shiftTime = document.createElement('span');
                    shiftTime.classList.add('shift-time');
                    shiftTime.textContent = shift.time;
                    shiftHeader.appendChild(shiftTime);

                    shiftEntry.appendChild(shiftHeader);

                    const shiftActions = document.createElement('div');
                    shiftActions.classList.add('shift-actions');
                    shiftActions.innerHTML = `
                        <i class="fas fa-trash-alt action-icon delete-shift" title="Remove Shift"></i>
                    `;
                    shiftEntry.appendChild(shiftActions);

                    // Add event listener for deleting shifts
                    shiftActions.querySelector('.delete-shift').addEventListener('click', () => {
                        removeShift(shift.id, dateStr);
                    });

                    jobTitleBox.appendChild(shiftEntry);
                });
                modalScheduledShiftsDiv.appendChild(jobTitleBox);
            });
        }

        // Add drag-and-drop target to the scheduled shifts div
        modalScheduledShiftsDiv.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            modalScheduledShiftsDiv.classList.add('drag-over');
        });

        modalScheduledShiftsDiv.addEventListener('dragleave', () => {
            modalScheduledShiftsDiv.classList.remove('drag-over');
        });

        modalScheduledShiftsDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            modalScheduledShiftsDiv.classList.remove('drag-over');

            const coworkerData = JSON.parse(e.dataTransfer.getData('text/plain'));
            const dateToSchedule = formatDate(currentModalDate);

            // Simple scheduling: assign a default shift type based on job title
            let newShift = {
                id: `S${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
                coworkerId: coworkerData.id,
                coworkerName: coworkerData.name,
                jobTitle: coworkerData.jobTitle,
                department: coworkerData.department,
                time: '09:00 - 17:00', // Default shift time
                startTime: '09:00',
                endTime: '17:00',
                type: `${coworkerData.jobTitle} Shift`,
                title: `Day ${coworkerData.jobTitle}`,
                notes: `Scheduled via drag & drop.`,
                hours: 8
            };

            // Add the new shift to our in-memory data
            if (!weeklyScheduledShifts[dateToSchedule]) {
                weeklyScheduledShifts[dateToSchedule] = [];
            }
            // Check if coworker is already scheduled for this day
            const isAlreadyScheduled = weeklyScheduledShifts[dateToSchedule].some(shift => shift.coworkerId === newShift.coworkerId);
            if (!isAlreadyScheduled) {
                weeklyScheduledShifts[dateToSchedule].push(newShift);
                renderModalSchedule(); // Re-render modal to show the new shift and update available list
            } else {
                alert(`${coworkerData.name} is already scheduled for this day.`);
            }
        });
    }

    function removeShift(shiftId, dateStr) {
        if (!weeklyScheduledShifts[dateStr]) return;

        const initialLength = weeklyScheduledShifts[dateStr].length;
        weeklyScheduledShifts[dateStr] = weeklyScheduledShifts[dateStr].filter(shift => shift.id !== shiftId);

        if (weeklyScheduledShifts[dateStr].length < initialLength) {
            renderModalSchedule(); // Re-render if a shift was actually removed
        }
    }


    // --- Event Listeners ---

    // Weekly navigation
    prevWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() - 7);
        renderWeeklySchedule();
    });

    nextWeekBtn.addEventListener('click', () => {
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
        renderWeeklySchedule();
    });

    departmentFilter.addEventListener('change', renderWeeklySchedule);

    // Scheduling Modal Event Listeners
    openSchedulingModalBtn.addEventListener('click', openSchedulingModal);
    closeSchedulingModalBtn.addEventListener('click', closeSchedulingModal);
    cancelSchedulingModalBtn.addEventListener('click', closeSchedulingModal);

    modalPrevDayBtn.addEventListener('click', () => {
        currentModalDate.setDate(currentModalDate.getDate() - 1);
        renderModalSchedule();
    });

    modalNextDayBtn.addEventListener('click', () => {
        currentModalDate.setDate(currentModalDate.getDate() + 1);
        renderModalSchedule();
    });

    saveSchedulingModalBtn.addEventListener('click', () => {
        // In a real application, you would send weeklyScheduledShifts to a backend here.
        // For this example, it's already updated in memory by drag/drop and delete actions.
        alert('Schedule saved successfully (in-memory)!');
        closeSchedulingModal();
    });


    // Initial setup
    currentWeekStart = getWeekStart(new Date()); // Ensure currentWeekStart is the start of the week
    renderWeeklySchedule();
});