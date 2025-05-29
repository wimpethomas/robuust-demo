document.addEventListener('DOMContentLoaded', () => {
    const reservationGrid = document.querySelector('.reservation-grid');
    const currentDateDisplay = document.getElementById('currentDateDisplay');
    const prevDayBtn = document.getElementById('prevDayBtn');
    const nextDayBtn = document.getElementById('nextDayBtn');
    const roomFilter = document.getElementById('roomFilter');
    const reservationSearchInput = document.getElementById('reservationSearch');
    const dayViewBtn = document.getElementById('dayViewBtn');
    const monthViewBtn = document.getElementById('monthViewBtn'); // Placeholder for future month view
    const body = document.body;

    let currentDate = new Date(); // Start with today's date

   // Slider elements
    const reservationSlider = document.getElementById('reservationSlider');
    const reservationSliderOverlay = document.getElementById('reservationSliderOverlay');
    const closeSliderBtn = document.getElementById('closeSliderBtn');
    const cancelSliderBtn = document.getElementById('cancelSliderBtn');
    const addReservationBtn = document.getElementById('addReservationBtn'); // New button in header
    const sliderTitle = document.getElementById('sliderTitle');

    // Form elements
    const reservationForm = document.getElementById('reservationForm');
    const reservationIdInput = document.getElementById('reservationId');
    const guestNameInput = document.getElementById('guestName');
    const guestsInput = document.getElementById('guests');
    const reservationDateInput = document.getElementById('reservationDate');
    const reservationTimeInput = document.getElementById('reservationTime');
    const durationInput = document.getElementById('duration');
    const tableSelect = document.getElementById('tableSelect');
    const notesInput = document.getElementById('notes');
    const deleteReservationBtn = document.getElementById('deleteReservationBtn');
    const saveReservationBtn = document.getElementById('saveReservationBtn');
    const darkModeToggle = document.getElementById('darkModeToggle');    

   // --- Dark Mode Logic (Consistent across pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeButton) {
                // Show sun icon for light mode (because clicking it will switch to light)
                darkModeButton.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeButton.setAttribute('aria-label', 'Switch to Light Mode');
            }
        } else {
            body.classList.remove('dark-mode');
            if (darkModeButton) {
                // Show moon icon for dark mode (because clicking it will switch to dark)
                darkModeButton.innerHTML = '<i class="fas fa-moon"></i>';
                darkModeButton.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('dark'); // Default to dark mode if no preference
    }

    // Event listener for the new dark mode button
    if (darkModeButton) {
        darkModeButton.addEventListener('click', () => {
            const currentTheme = body.classList.contains('dark-mode') ? 'dark' : 'light';
            if (currentTheme === 'dark') {
                applyTheme('light');
            } else {
                applyTheme('dark');
            }
        });
    }

    // --- Sample Data ---
    const tables = [
        { id: 'T1', name: 'Table 1 (Main)', room: 'main', capacity: 4 },
        { id: 'T2', name: 'Table 2 (Main)', room: 'main', capacity: 4 },
        { id: 'T3', name: 'Table 3 (Main)', room: 'main', capacity: 6 },
        { id: 'T4', name: 'Table 4 (Terrace)', room: 'terrace', capacity: 2 },
        { id: 'T5', name: 'Table 5 (Terrace)', room: 'terrace', capacity: 4 },
        { id: 'T6', name: 'Table 6 (Private)', room: 'private', capacity: 8 },
        { id: 'T7', name: 'Table 7 (Main)', room: 'main', capacity: 4 },
        { id: 'T8', name: 'Table 8 (Main)', room: 'main', capacity: 2 },
        { id: 'T9', name: 'Table 9 (Terrace)', room: 'terrace', capacity: 6 },
        { id: 'T10', name: 'Table 10 (Private)', room: 'private', capacity: 10 },
    ];

    // Generate time slots from 17:00 to 23:00 every 30 minutes
    const timeSlots = [];
    for (let h = 17; h <= 23; h++) {
        timeSlots.push(`${String(h).padStart(2, '0')}:00`);
        if (h < 23) {
            timeSlots.push(`${String(h).padStart(2, '0')}:30`);
        }
    }
    const SLOT_INTERVAL_MINUTES = 30; // Each slot represents 30 minutes

    // Sample reservations (dummy data)
    let reservationsData = [
        { id: 'RES001', date: '2025-05-27', tableId: 'T1', time: '18:00', duration: 90, guestName: 'Familie Jansen', guests: 4, notes: 'Birthday dinner' },
        { id: 'RES002', date: '2025-05-27', tableId: 'T3', time: '19:30', duration: 120, guestName: 'Mr. Smith', guests: 2, notes: '' },
        { id: 'RES003', date: '2025-05-27', tableId: 'T4', time: '17:00', duration: 60, guestName: 'Alice Johnson', guests: 2, notes: 'Window seat preferred' },
        { id: 'RES004', date: '2025-05-27', tableId: 'T6', time: '20:00', duration: 150, guestName: 'Group B. de Boer', guests: 8, notes: 'Corporate event' },
        { id: 'RES005', date: '2025-05-28', tableId: 'T2', time: '18:30', duration: 90, guestName: 'Emma de Vries', guests: 3, notes: '' },
        { id: 'RES006', date: '2025-05-28', tableId: 'T1', time: '17:30', duration: 60, guestName: 'Jan Pieterse', guests: 2, notes: '' },
        { id: 'RES007', date: '2025-05-27', tableId: 'T1', time: '17:00', duration: 60, guestName: 'Klaas Dijkstra', guests: 2, notes: 'Quick bite' }, // Overlap test
    ];

    // Helper to format date as YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    // Helper to parse time string (HH:MM) to minutes from midnight
    function timeToMinutes(timeStr) {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
    }

    // Helper to format date for display (e.g., Tuesday, May 27, 2025)
    function formatDisplayDate(date) {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    }

    // Function to render the reservation grid
    function renderReservationGrid() {
        reservationGrid.innerHTML = ''; // Clear existing grid
        reportDateRangeInput.textContent = formatDisplayDate(currentDate);

        // Filter tables by room
        const selectedRoom = roomFilter.value;
        const filteredTables = selectedRoom === 'all'
            ? tables
            : tables.filter(table => table.room === selectedRoom);

        // Filter reservations by current date and search term
        const todayFormatted = formatDate(currentDate);
        const searchTerm = reservationSearchInput.value.toLowerCase();

        const dailyReservations = reservationsData.filter(res =>
            res.date === todayFormatted &&
            (res.guestName.toLowerCase().includes(searchTerm) ||
             res.tableId.toLowerCase().includes(searchTerm) ||
             res.notes.toLowerCase().includes(searchTerm))
        );

        // Set up grid columns dynamically based on time slots (+1 for table names)
        reservationGrid.style.gridTemplateColumns = `120px repeat(${timeSlots.length}, 1fr)`; // 120px for table labels

        // Create Header Row (empty top-left cell + time slots)
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('grid-header-cell');
        reservationGrid.appendChild(emptyCell);

        timeSlots.forEach(slot => {
            const headerCell = document.createElement('div');
            headerCell.classList.add('grid-header-cell');
            headerCell.textContent = slot;
            reservationGrid.appendChild(headerCell);
        });

        // Create Rows for Each Table
        filteredTables.forEach(table => {
            // Table Label Cell
            const tableLabelCell = document.createElement('div');
            tableLabelCell.classList.add('grid-table-label');
            tableLabelCell.textContent = table.name;
            reservationGrid.appendChild(tableLabelCell);

            // Keep track of which slots are covered by a reservation
            const coveredSlots = new Set();

            timeSlots.forEach((slotTime, index) => {
                const slotMinutes = timeToMinutes(slotTime);

                // If this slot is already covered by a previously rendered reservation, skip it
                if (coveredSlots.has(index)) {
                    return;
                }

                // Find a reservation that starts at this slot or overlaps significantly
                let reservationToDisplay = null;
                for (const res of dailyReservations) {
                    if (res.tableId === table.id) {
                        const resStartMinutes = timeToMinutes(res.time);
                        const resEndMinutes = resStartMinutes + res.duration;

                        // Check if the reservation starts exactly at this slot
                        if (resStartMinutes === slotMinutes) {
                            reservationToDisplay = res;
                            break;
                        }
                    }
                }

                if (reservationToDisplay) {
                    // Calculate how many slots this reservation spans
                    const startSlotIndex = timeSlots.findIndex(s => timeToMinutes(s) === timeToMinutes(reservationToDisplay.time));
                    const endReservationMinutes = timeToMinutes(reservationToDisplay.time) + reservationToDisplay.duration;
                    
                    let spanCount = 0;
                    for (let i = startSlotIndex; i < timeSlots.length; i++) {
                        const currentSlotMinutes = timeToMinutes(timeSlots[i]);
                        const nextSlotMinutes = currentSlotMinutes + SLOT_INTERVAL_MINUTES;

                        if (nextSlotMinutes <= endReservationMinutes) {
                            spanCount++;
                        } else {
                            // If the reservation ends mid-slot, ensure it at least takes the current slot
                            if (currentSlotMinutes < endReservationMinutes) {
                                spanCount++;
                            }
                            break;
                        }
                    }
                    
                    // Ensure minimum span of 1
                    spanCount = Math.max(1, spanCount);

                    const reservedCell = document.createElement('div');
                    reservedCell.classList.add('grid-time-slot', 'reserved');
                    reservedCell.style.gridColumn = `span ${spanCount}`; // Span multiple columns
                    reservedCell.innerHTML = `
                        <span class="guest-name">${reservationToDisplay.guestName}</span>
                        <span class="guests-count">${reservationToDisplay.guests} pers.</span>
                    `;
                    reservedCell.dataset.reservationInfo = `
                        Name: ${reservationToDisplay.guestName} (${reservationToDisplay.guests} pers.)
                        Time: ${reservationToDisplay.time} - ${timeSlots[Math.min(timeSlots.length - 1, startSlotIndex + spanCount -1)] || timeSlots[timeSlots.length -1]} (Duration: ${reservationToDisplay.duration} min.)
                        Notes: ${reservationToDisplay.notes || 'N/A'}
                        Table: ${table.name}
                    `;
                    reservedCell.dataset.reservationId = reservationToDisplay.id; // Store ID for easy lookup

                    // Add click listener
                    reservedCell.addEventListener('click', (event) => {
                        event.stopPropagation(); // Prevent parent clicks
                        alert(`Reservation Details:\n` + reservedCell.dataset.reservationInfo);
                        // In a real app, this would open a modal to edit reservation
                    });

                    reservationGrid.appendChild(reservedCell);

                    // Mark all covered slots as processed
                    for (let i = 0; i < spanCount; i++) {
                        coveredSlots.add(index + i);
                    }

                } else {
                    // If no reservation, create an empty clickable slot
                    const timeSlotCell = document.createElement('div');
                    timeSlotCell.classList.add('grid-time-slot', 'empty-slot');
                    timeSlotCell.addEventListener('click', () => {
                        alert(`Add new reservation for ${table.name} at ${slotTime}`);
                    });
                    reservationGrid.appendChild(timeSlotCell);
                }
            });
        });
    }

    // --- Event Listeners ---
    prevDayBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() - 1);
        renderReservationGrid();
    });

    nextDayBtn.addEventListener('click', () => {
        currentDate.setDate(currentDate.getDate() + 1);
        renderReservationGrid();
    });

    roomFilter.addEventListener('change', renderReservationGrid);
    reservationSearchInput.addEventListener('input', renderReservationGrid); // Live search

    // Toggle button for day/month view - currently only day view is implemented
    dayViewBtn.addEventListener('click', () => {
        dayViewBtn.classList.add('active');
        monthViewBtn.classList.remove('active');
        // Logic to show day view (already visible)
    });

    monthViewBtn.addEventListener('click', () => {
        monthViewBtn.classList.add('active');
        dayViewBtn.classList.remove('active');
        alert('Month view coming soon!'); // Placeholder for future implementation
        // Logic to switch to month view
    });

    // --- Slider Functions ---
    function openSlider(reservation = null, suggestedTableId = null, suggestedTime = null) {
        reservationSlider.classList.add('visible');
        reservationSliderOverlay.classList.add('visible');
        body.style.overflow = 'hidden'; // Prevent scrolling of background content

        if (reservation) {
            sliderTitle.textContent = 'Edit Reservation';
            reservationIdInput.value = reservation.id;
            guestNameInput.value = reservation.guestName;
            guestsInput.value = reservation.guests;
            reservationDateInput.value = reservation.date;
            reservationTimeInput.value = reservation.time;
            durationInput.value = reservation.duration;
            tableSelect.value = reservation.tableId;
            notesInput.value = reservation.notes;
            deleteReservationBtn.style.display = 'block'; // Show delete button for existing
        } else {
            sliderTitle.textContent = 'Add New Reservation';
            reservationIdInput.value = '';
            reservationForm.reset(); // Clear all form fields
            // Pre-fill date with current displayed date
            reservationDateInput.value = formatDate(currentDate);
            // Pre-fill table and time if clicked on a specific empty slot
            if (suggestedTableId) {
                tableSelect.value = suggestedTableId;
            }
            if (suggestedTime) {
                reservationTimeInput.value = suggestedTime;
            }
            // Default guests and duration if not pre-filled
            if (!guestsInput.value) guestsInput.value = 2;
            if (!durationInput.value) durationInput.value = 90;
            deleteReservationBtn.style.display = 'none'; // Hide delete button for new
        }
    }

    function closeSlider() {
        reservationSlider.classList.remove('visible');
        reservationSliderOverlay.classList.remove('visible');
        body.style.overflow = ''; // Allow scrolling again
    }    

    // Slider related event listeners
    addReservationBtn.addEventListener('click', () => {
        openSlider(); // Open slider for new reservation
    });

    closeSliderBtn.addEventListener('click', closeSlider);
    cancelSliderBtn.addEventListener('click', closeSlider);
    reservationSliderOverlay.addEventListener('click', closeSlider); // Close when clicking outside    

    // Initial render
    renderReservationGrid();
});