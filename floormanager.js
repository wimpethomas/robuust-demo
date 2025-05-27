document.addEventListener('DOMContentLoaded', () => {
    const tableRowsContainer = document.getElementById('table-rows-container');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const datePicker = document.getElementById('floorManagerDatePicker');
    const roomTabsContainer = document.querySelector('.room-tabs');

    // --- Data Definition (Random Tables and Orders) ---
    // Example data structure
    let tables = [
        {
            id: 'T1',
            name: 'Tafel 1',
            active: true,
            room: 'roomA',
            lastService: { type: 'K', timestamp: Date.now() - (10 * 60 * 1000) }, // 10 minutes ago kitchen
            orders: [
                { id: 'O1-1', name: 'SPARERIBS (VARKEN)', quantity: 2, placedAt: Date.now() - (12 * 60 * 1000), servedAt: Date.now() - (5 * 60 * 1000), type: 'K' },
                { id: 'O1-2', name: 'COCA COLA', quantity: 3, placedAt: Date.now() - (11 * 60 * 1000), servedAt: Date.now() - (8 * 60 * 1000), type: 'B' },
                { id: 'O1-3', name: 'ZALMPLET', quantity: 1, placedAt: Date.now() - (4 * 60 * 1000), servedAt: null, type: 'K' }, // Not served
                { id: 'O1-4', name: 'LEFFE BLOND', quantity: 2, placedAt: Date.now() - (2 * 60 * 1000), servedAt: null, type: 'B' }  // Not served
            ]
        },
        {
            id: 'T2',
            name: 'Tafel 2',
            active: true,
            room: 'roomA',
            lastService: { type: 'B', timestamp: Date.now() - (2 * 60 * 1000) }, // 2 minutes ago bar
            orders: [
                { id: 'O2-1', name: 'KOFFIE', quantity: 4, placedAt: Date.now() - (5 * 60 * 1000), servedAt: Date.now() - (3 * 60 * 1000), type: 'B' },
                { id: 'O2-2', name: 'CREME BRULEE', quantity: 2, placedAt: Date.now() - (1 * 60 * 1000), servedAt: null, type: 'K' } // Not served
            ]
        },
        {
            id: 'T3',
            name: 'Tafel 3',
            active: false, // Inactive table
            room: 'roomB',
            lastService: { type: 'K', timestamp: Date.now() - (60 * 60 * 1000) }, // 1 hour ago
            orders: [
                { id: 'O3-1', name: 'SAOTO COMPLEET', quantity: 1, placedAt: Date.now() - (65 * 60 * 1000), servedAt: Date.now() - (50 * 60 * 1000), type: 'K' }
            ]
        },
        {
            id: 'T4',
            name: 'Tafel 4',
            active: true,
            room: 'terrace',
            lastService: { type: 'K', timestamp: Date.now() - (25 * 60 * 1000) }, // 25 minutes ago kitchen
            orders: [
                { id: 'O4-1', name: 'OSSENHAAS', quantity: 3, placedAt: Date.now() - (30 * 60 * 1000), servedAt: Date.now() - (20 * 60 * 1000), type: 'K' },
                { id: 'O4-2', name: 'PINOT GRISIO (GLAS)', quantity: 6, placedAt: Date.now() - (28 * 60 * 1000), servedAt: Date.now() - (25 * 60 * 1000), type: 'B' },
                { id: 'O4-3', name: 'LOADED FRIES', quantity: 1, placedAt: Date.now() - (15 * 60 * 1000), servedAt: null, type: 'K' } // Not served, long time
            ]
        },
        {
            id: 'T5',
            name: 'Tafel 5',
            active: true,
            room: 'roomA',
            lastService: { type: 'B', timestamp: Date.now() - (5 * 60 * 1000) }, // 5 minutes ago bar
            orders: [
                { id: 'O5-1', name: 'FANTA', quantity: 2, placedAt: Date.now() - (7 * 60 * 1000), servedAt: Date.now() - (5 * 60 * 1000), type: 'B' },
                { id: 'O5-2', name: 'FUZE TEA GREEN', quantity: 1, placedAt: Date.now() - (3 * 60 * 1000), servedAt: null, type: 'B' }
            ]
        },
        {
            id: 'T6',
            name: 'Tafel 6',
            active: true,
            room: 'roomB',
            lastService: { type: 'K', timestamp: Date.now() - (4 * 60 * 1000) }, // 4 minutes ago kitchen
            orders: [
                { id: 'O6-1', name: 'TRUPI BBQ CHICKEN', quantity: 2, placedAt: Date.now() - (6 * 60 * 1000), servedAt: null, type: 'K' }
            ]
        },
        {
            id: 'T7',
            name: 'Tafel 7',
            active: true,
            room: 'terrace',
            lastService: { type: 'B', timestamp: Date.now() - (1 * 60 * 1000) }, // 1 minute ago bar
            orders: [
                { id: 'O7-1', name: 'KOFFIE', quantity: 1, placedAt: Date.now() - (2 * 60 * 1000), servedAt: null, type: 'B' }
            ]
        },
        {
            id: 'T8',
            name: 'Tafel 8',
            active: true,
            room: 'roomA',
            lastService: { type: 'K', timestamp: Date.now() - (11 * 60 * 1000) }, // 11 minutes ago kitchen
            orders: [
                { id: 'O8-1', name: 'GESEDDE TOMATEN SOEP', quantity: 2, placedAt: Date.now() - (13 * 60 * 1000), servedAt: null, type: 'K' },
                { id: 'O8-2', name: 'LE CLUB BEEFSTUK', quantity: 1, placedAt: Date.now() - (10 * 60 * 1000), servedAt: null, type: 'K' }
            ]
        },
        {
            id: 'T9',
            name: 'Tafel 9',
            active: false,
            room: 'roomB',
            lastService: { type: 'B', timestamp: Date.now() - (90 * 60 * 1000) }, // 1.5 hours ago
            orders: [
                { id: 'O9-1', name: 'HERTOG JAN ZSCL', quantity: 2, placedAt: Date.now() - (95 * 60 * 1000), servedAt: Date.now() - (92 * 60 * 1000), type: 'B' }
            ]
        },
        {
            id: 'T10',
            name: 'Tafel 10',
            active: true,
            room: 'terrace',
            lastService: { type: 'B', timestamp: Date.now() }, // Just now
            orders: [
                { id: 'O10-1', name: 'CHAUDFONTAINE STILL', quantity: 1, placedAt: Date.now() - (1 * 60 * 1000), servedAt: null, type: 'B' }
            ]
        }
    ];

    let currentRoomFilter = 'all'; // Default filter

    // --- Helper Functions ---

    function formatTimeDifference(ms) {
        if (ms < 0) return '0s'; // Should not happen for elapsed time
        const totalSeconds = Math.floor(ms / 1000);
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        if (minutes > 0) {
            return `${minutes}m ${seconds}s`;
        }
        return `${seconds}s`;
    }

    function getTimeClass(timeInMinutes) {
        if (timeInMinutes <= 5) {
            return 'green';
        } else if (timeInMinutes <= 10) {
            return 'neutral';
        } else {
            return 'red';
        }
    }

    // --- Rendering Function ---

    function renderTableRows() {
        tableRowsContainer.innerHTML = ''; // Clear existing rows

        const filteredTables = tables.filter(table => {
            return currentRoomFilter === 'all' || table.room === currentRoomFilter;
        });

        filteredTables.forEach(table => {
            const tableRow = document.createElement('div');
            tableRow.classList.add('table-row');
            if (!table.active) {
                tableRow.classList.add('inactive-table');
            }
            tableRow.dataset.tableId = table.id;
            tableRow.dataset.tableRoom = table.room; // Add room data attribute

            // Calculate time since last service
            const lastServiceTimeAgo = Date.now() - table.lastService.timestamp;
            const lastServiceMinutes = Math.floor(lastServiceTimeAgo / (60 * 1000));
            let lastServiceText = '';
            if (lastServiceMinutes < 1) {
                lastServiceText = `${table.lastService.type} (now)`;
            } else if (lastServiceMinutes < 60) {
                lastServiceText = `${table.lastService.type} (${lastServiceMinutes}m ago)`;
            } else {
                const hours = Math.floor(lastServiceMinutes / 60);
                const remainingMinutes = lastServiceMinutes % 60;
                lastServiceText = `${table.lastService.type} (${hours}h ${remainingMinutes}m ago)`;
            }

            tableRow.innerHTML = `
                <div class="table-summary">
                    <span class="table-number">${table.name.replace('Tafel ', '')}</span>
                    <span class="last-served-info">${lastServiceText}</span>
                </div>
                <div class="order-flow">
                    </div>
            `;

            const orderFlowContainer = tableRow.querySelector('.order-flow');

            table.orders.forEach(order => {
                const orderItem = document.createElement('div');
                orderItem.classList.add('order-item');
                orderItem.dataset.orderId = order.id;

                let serviceTimeDisplay = '';
                let timeClass = '';

                if (order.servedAt) {
                    const servedDuration = order.servedAt - order.placedAt;
                    serviceTimeDisplay = formatTimeDifference(servedDuration);
                    const servedMinutes = servedDuration / (60 * 1000);
                    timeClass = getTimeClass(servedMinutes); // Still apply color based on served time
                } else {
                    // This is the ticking timer for unserved items
                    const elapsed = Date.now() - order.placedAt;
                    serviceTimeDisplay = formatTimeDifference(elapsed);
                    const elapsedMinutes = elapsed / (60 * 1000);
                    timeClass = getTimeClass(elapsedMinutes);
                }

                orderItem.innerHTML = `
                    <span class="item-name">${order.name}</span>
                    <span class="item-quantity">x${order.quantity}</span>
                    <span class="service-time ${timeClass}">${serviceTimeDisplay}</span>
                `;
                orderFlowContainer.appendChild(orderItem);
            });

            tableRowsContainer.appendChild(tableRow);
        });
    }

    // --- Update Timers (Real-time) ---

    function updateTimers() {
        tables.forEach(table => {
            // Update last service time
            const lastServiceTimeAgo = Date.now() - table.lastService.timestamp;
            const lastServiceMinutes = Math.floor(lastServiceTimeAgo / (60 * 1000));
            let lastServiceText = '';
            if (lastServiceMinutes < 1) {
                lastServiceText = `${table.lastService.type} (now)`;
            } else if (lastServiceMinutes < 60) {
                lastServiceText = `${table.lastService.type} (${lastServiceMinutes}m ago)`;
            } else {
                const hours = Math.floor(lastServiceMinutes / 60);
                const remainingMinutes = lastServiceMinutes % 60;
                lastServiceText = `${table.lastService.type} (${hours}h ${remainingMinutes}m ago)`;
            }
            // Only update visible tables (respecting currentRoomFilter)
            const tableRowElement = document.querySelector(`.table-row[data-table-id="${table.id}"][data-table-room="${table.room}"]`);
            if (tableRowElement) {
                tableRowElement.querySelector('.last-served-info').textContent = lastServiceText;
            }

            // Update individual order timers
            table.orders.forEach(order => {
                if (!order.servedAt) { // Only update if not served
                    const elapsed = Date.now() - order.placedAt;
                    const serviceTimeDisplay = formatTimeDifference(elapsed);
                    const elapsedMinutes = elapsed / (60 * 1000);
                    const timeClass = getTimeClass(elapsedMinutes);

                    const orderItemElement = tableRowElement ? tableRowElement.querySelector(`.order-item[data-order-id="${order.id}"]`) : null;
                    if (orderItemElement) {
                        const serviceTimeSpan = orderItemElement.querySelector('.service-time');
                        serviceTimeSpan.textContent = serviceTimeDisplay;
                        // Update class if it changed
                        serviceTimeSpan.className = `service-time ${timeClass}`;
                    }
                }
            });
        });
    }

    // --- Dark Mode Toggle Logic ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('theme', theme); // Save preference
    }

    // Check for saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('dark'); // Default to dark mode if no preference
    }

    // Toggle theme on switch change
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Date Picker Logic ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const dd = String(today.getDate()).padStart(2, '0');
    datePicker.value = `${yyyy}-${mm}-${dd}`; // Set default to today

    datePicker.addEventListener('change', (event) => {
        console.log('Selected date:', event.target.value);
        // In a real application, you'd fetch data for this date
    });

    // --- Room Tabs Logic ---
    roomTabsContainer.addEventListener('click', (event) => {
        const targetButton = event.target.closest('.tab-button');
        if (targetButton) {
            // Remove 'active' from all buttons
            document.querySelectorAll('.room-tabs .tab-button').forEach(btn => {
                btn.classList.remove('active');
            });
            // Add 'active' to the clicked button
            targetButton.classList.add('active');
            
            currentRoomFilter = targetButton.dataset.room;
            renderTableRows(); // Re-render tables based on new filter
        }
    });


    // --- Initial Render and Live Updates ---
    renderTableRows(); // Initial render
    setInterval(updateTimers, 1000); // Update timers every second
});