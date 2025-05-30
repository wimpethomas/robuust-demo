document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const monthSelect = document.getElementById('monthSelect');
    const yearSelect = document.getElementById('yearSelect');
    const currentMonthYearElem = document.getElementById('currentMonthYear');
    const prevMonthBtn = document.getElementById('prevMonthBtn');
    const nextMonthBtn = document.getElementById('nextMonthBtn');
    const calendarGrid = document.getElementById('calendarGrid');
    const roomGuestList = document.getElementById('roomGuestList');

    let currentMonth, currentYear;
        let currentDate = new Date(); // Start with today's date

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }    

    // --- Calendar and Reservation Data Logic ---

    // Dummy Reservation Data (Dynamic for demonstration)
    // This function generates random reservation data for a given month/year
    function generateDummyReservationData(year, month) {
        const data = {};
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const rooms = ["Main Dining", "Private Room 1", "Private Room 2", "Terrace A", "Terrace B", "Bar Area"];
        const numRooms = rooms.length;

        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            let totalGuests = 0;
            const dailyRooms = {};

            // Randomly decide if there are reservations for this day
            if (Math.random() > 0.3) { // 70% chance of having reservations
                const numReservations = Math.floor(Math.random() * 5) + 1; // 1 to 5 reservations
                for (let i = 0; i < numReservations; i++) {
                    const guests = Math.floor(Math.random() * 10) + 2; // 2 to 11 guests per reservation
                    totalGuests += guests;
                    const randomRoom = rooms[Math.floor(Math.random() * numRooms)];
                    dailyRooms[randomRoom] = (dailyRooms[randomRoom] || 0) + guests;
                }
            }
            data[dateStr] = { totalGuests, rooms: dailyRooms };
        }
        return data;
    }

    let monthlyReservationData = {}; // Stores the generated data for the current month

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    function renderCalendar() {
        calendarGrid.innerHTML = ''; // Clear existing days
        const today = new Date();
        const currentSelectedDate = new Date(currentYear, currentMonth);

        currentMonthYearElem.textContent = `${monthNames[currentMonth]} ${currentYear}`;

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        // Get the day of the week for the first day (0 = Sunday, 1 = Monday, ..., 6 = Saturday)
        // Adjust so that Monday is 0 and Sunday is 6
        let firstDayOfWeek = firstDayOfMonth.getDay();
        if (firstDayOfWeek === 0) firstDayOfWeek = 6; // Sunday becomes 6
        else firstDayOfWeek--; // Monday-Saturday become 0-5

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.classList.add('calendar-day', 'empty');
            calendarGrid.appendChild(emptyDay);
        }

        // Generate or retrieve dummy data for the current month
        monthlyReservationData = generateDummyReservationData(currentYear, currentMonth);

        // Add day cells for the current month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayCell = document.createElement('div');
            dayCell.classList.add('calendar-day');

            const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayData = monthlyReservationData[dateStr] || { totalGuests: 0, rooms: {} };

            dayCell.innerHTML = `
                <span class="day-holder">
                <span class="day-number">${day}</span>
                <span class="total-guests"><i class="fas fa-users"></i> ${dayData.totalGuests}</span>
                </span>
                <div class="room-guest-details"></div>
            `;

            const roomDetailsDiv = dayCell.querySelector('.room-guest-details');
            if (Object.keys(dayData.rooms).length > 0) {
                for (const room in dayData.rooms) {
                    const roomSpan = document.createElement('span');
                    roomSpan.textContent = `${room}: ${dayData.rooms[room]}`;
                    roomDetailsDiv.appendChild(roomSpan);
                }
            } else {
                roomDetailsDiv.textContent = 'No reservations';
                roomDetailsDiv.style.fontStyle = 'italic';
                roomDetailsDiv.style.color = 'var(--subtitle-color)';
            }


            // Add weekend class
            const dayOfWeek = new Date(currentYear, currentMonth, day).getDay();
            if (dayOfWeek === 0 || dayOfWeek === 6) { // 0 for Sunday, 6 for Saturday
                dayCell.classList.add('weekend');
            }

            // Highlight current day
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayCell.classList.add('current-day');
            }

            calendarGrid.appendChild(dayCell);
        }

        renderRoomSummary(); // Update room summary for the month
    }

    function renderRoomSummary() {
        roomGuestList.innerHTML = '';
        const monthlyRoomTotals = {};

        // Aggregate guests per room for the entire month
        for (const date in monthlyReservationData) {
            const dayData = monthlyReservationData[date];
            for (const room in dayData.rooms) {
                monthlyRoomTotals[room] = (monthlyRoomTotals[room] || 0) + dayData.rooms[room];
            }
        }

        if (Object.keys(monthlyRoomTotals).length === 0) {
            const li = document.createElement('li');
            li.style.textAlign = 'center';
            li.style.color = 'var(--subtitle-color)';
            li.style.fontStyle = 'italic';
            li.textContent = 'No reservations for this month.';
            roomGuestList.appendChild(li);
            return;
        }

        // Sort rooms alphabetically for consistent display
        const sortedRooms = Object.keys(monthlyRoomTotals).sort();

        sortedRooms.forEach(room => {
            const li = document.createElement('li');
            li.innerHTML = `<span class="room-name">${room}</span><span class="room-guests">${monthlyRoomTotals[room]} guests</span>`;
            roomGuestList.appendChild(li);
        });
    }


    // --- Month/Year Selector Population ---
    function populateMonthYearSelectors() {
        const now = new Date();
        currentMonth = now.getMonth();
        currentYear = now.getFullYear();

        // Populate months
        monthNames.forEach((month, index) => {
            const option = document.createElement('option');
            option.value = index;
            option.textContent = month;
            monthSelect.appendChild(option);
        });
        monthSelect.value = currentMonth;

        // Populate years (e.g., current year +/- 5 years)
        const startYear = currentYear - 2;
        const endYear = currentYear + 5;
        for (let year = startYear; year <= endYear; year++) {
            const option = document.createElement('option');
            option.value = year;
            option.textContent = year;
            yearSelect.appendChild(option);
        }
        yearSelect.value = currentYear;
    }

    // --- Event Listeners ---
    monthSelect.addEventListener('change', (event) => {
        currentMonth = parseInt(event.target.value);
        renderCalendar();
    });

    yearSelect.addEventListener('change', (event) => {
        currentYear = parseInt(event.target.value);
        renderCalendar();
    });

    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        monthSelect.value = currentMonth; // Update dropdown
        yearSelect.value = currentYear;   // Update dropdown
        renderCalendar();
    });

    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        monthSelect.value = currentMonth; // Update dropdown
        yearSelect.value = currentYear;   // Update dropdown
        renderCalendar();
    });  

    // Initial load
    populateMonthYearSelectors();
    renderCalendar(); // Render the calendar for the initial month/year
});