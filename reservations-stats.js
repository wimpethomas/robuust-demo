document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Element References ---
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const mealTypeFilter = document.getElementById('mealTypeFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const roomFilter = document.getElementById('roomFilter');

    // Summary Card elements
    const overallTotalSales = document.getElementById('overallTotalSales');
    const overallAvgOrderValue = document.getElementById('overallAvgOrderValue');
    const overallAvgCovers = document.getElementById('overallAvgCovers');
    const overallTopMeal = document.getElementById('overallTopMeal');
    const overallAvgWaitTime = document.getElementById('overallAvgWaitTime');
    const overallTableTurnover = document.getElementById('overallTableTurnover');
    const overallCustomerSat = document.getElementById('overallCustomerSat');

    const dailyStatsTableBody = document.querySelector('.daily-stats-table tbody');

    // --- Data Storage (Example Data - you'll integrate with your backend later) ---
    // This is placeholder data that simulates reservation and sales data.
    // In a real application, this would come from an API.
    const sampleReservationsAndSalesData = [
        { date: '2025-05-01', mealType: 'dinner', department: 'service', room: 'main', guests: 4, sales: 120.50, orders: 2, topMeal: 'Steak Frites', waitTime: 5, customerSat: 4.5 },
        { date: '2025-05-01', mealType: 'lunch', department: 'kitchen', room: 'terrace', guests: 2, sales: 55.00, orders: 1, topMeal: 'Caesar Salad', waitTime: 0, customerSat: 5.0 },
        { date: '2025-05-02', mealType: 'dinner', department: 'bar', room: 'main', guests: 3, sales: 90.75, orders: 1, topMeal: 'Pasta Carbonara', waitTime: 10, customerSat: 4.0 },
        { date: '2025-05-02', mealType: 'dinner', department: 'service', room: 'private', guests: 8, sales: 300.00, orders: 4, topMeal: 'Chef\'s Tasting Menu', waitTime: 15, customerSat: 4.8 },
        { date: '2025-05-03', mealType: 'breakfast', department: 'kitchen', room: 'main', guests: 2, sales: 30.00, orders: 1, topMeal: 'Pancakes', waitTime: 2, customerSat: 4.2 },
        { date: '2025-05-03', mealType: 'lunch', department: 'service', room: 'main', guests: 5, sales: 150.25, orders: 3, topMeal: 'Pizza Margherita', waitTime: 7, customerSat: 4.7 },
        { date: '2025-05-04', mealType: 'dinner', department: 'kitchen', room: 'main', guests: 4, sales: 110.00, orders: 2, topMeal: 'Steak Frites', waitTime: 8, customerSat: 4.6 },
        { date: '2025-05-04', mealType: 'drinks', department: 'bar', room: 'terrace', guests: 2, sales: 45.00, orders: 1, topMeal: 'Cocktail Mix', waitTime: 0, customerSat: 4.9 },
        { date: '2025-05-05', mealType: 'lunch', department: 'service', room: 'main', guests: 3, sales: 75.50, orders: 1, topMeal: 'Burger', waitTime: 3, customerSat: 4.1 },
        { date: '2025-05-05', mealType: 'dinner', department: 'kitchen', room: 'private', guests: 6, sales: 220.00, orders: 3, topMeal: 'Pasta Carbonara', waitTime: 12, customerSat: 4.3 },
        { date: '2025-05-06', mealType: 'dinner', department: 'service', room: 'main', guests: 5, sales: 180.00, orders: 2, topMeal: 'Chef\'s Tasting Menu', waitTime: 10, customerSat: 4.7 },
        { date: '2025-05-07', mealType: 'lunch', department: 'bar', room: 'terrace', guests: 2, sales: 60.00, orders: 1, topMeal: 'Caesar Salad', waitTime: 5, customerSat: 4.5 },
        { date: '2025-05-08', mealType: 'dinner', department: 'kitchen', room: 'main', guests: 7, sales: 250.00, orders: 3, topMeal: 'Steak Frites', waitTime: 10, customerSat: 4.8 },
        { date: '2025-05-09', mealType: 'dinner', department: 'service', room: 'main', guests: 3, sales: 95.00, orders: 1, topMeal: 'Burger', waitTime: 5, customerSat: 4.2 },
        { date: '2025-05-10', mealType: 'lunch', department: 'kitchen', room: 'private', guests: 10, sales: 400.00, orders: 5, topMeal: 'Pizza Margherita', waitTime: 15, customerSat: 4.9 },
    ];

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
        // Redraw charts when theme changes to ensure correct background/text color
        if (typeof google !== 'undefined' && google.charts.loaded) {
             drawCharts();
        }
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light mode for a fresh page
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Google Charts specific setup ---
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(initializePage);

    function initializePage() {
        // Set default date range to last 30 days
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(today.getDate() - 30);

        endDateInput.value = today.toISOString().split('T')[0];
        startDateInput.value = thirtyDaysAgo.toISOString().split('T')[0];

        // --- Helper Functions for Data Aggregation ---

        /**
         * Filters data based on date range and selected filters.
         * @param {Array} data - The raw data array.
         * @param {string} startDate - Start date (YYYY-MM-DD).
         * @param {string} endDate - End date (YYYY-MM-DD).
         * @param {string} mealType - Selected meal type ('all' or specific type).
         * @param {string} department - Selected department ('all' or specific department).
         * @param {string} room - Selected room ('all' or specific room).
         * @returns {Array} Filtered data.
         */
        function filterData(data, startDate, endDate, mealType, department, room) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setDate(end.getDate() + 1); // Include the end date

            return data.filter(item => {
                const itemDate = new Date(item.date);
                const isDateInRange = itemDate >= start && itemDate < end;
                const isMealTypeMatch = mealType === 'all' || item.mealType === mealType;
                const isDepartmentMatch = department === 'all' || item.department === department;
                const isRoomMatch = room === 'all' || item.room === room;
                return isDateInRange && isMealTypeMatch && isDepartmentMatch && isRoomMatch;
            });
        }

        /**
         * Calculates summary statistics for the filtered data.
         * @param {Array} filteredData - Data after applying filters.
         * @returns {Object} An object containing summary statistics.
         */
        function calculateSummaryStats(filteredData) {
            let totalSales = 0;
            let totalOrders = 0;
            let totalGuests = 0;
            let totalWaitTime = 0;
            let totalCustomerSat = 0;
            let customerSatCount = 0;
            let totalReservations = filteredData.length;

            const mealTypeCounts = {}; // For top meal logic later if needed
            const dailyDataMap = new Map(); // To aggregate data per day

            filteredData.forEach(item => {
                totalSales += item.sales;
                totalOrders += item.orders;
                totalGuests += item.guests;
                totalWaitTime += item.waitTime || 0; // Ensure waitTime is numeric

                if (item.customerSat !== undefined && item.customerSat !== null) {
                    totalCustomerSat += item.customerSat;
                    customerSatCount++;
                }

                // For daily aggregation (needed for table turnover and daily stats)
                if (!dailyDataMap.has(item.date)) {
                    dailyDataMap.set(item.date, { sales: 0, orders: 0, guests: 0, reservations: 0, meals: {} });
                }
                const dailyEntry = dailyDataMap.get(item.date);
                dailyEntry.sales += item.sales;
                dailyEntry.orders += item.orders;
                dailyEntry.guests += item.guests;
                dailyEntry.reservations++;
                dailyEntry.meals[item.topMeal] = (dailyEntry.meals[item.topMeal] || 0) + 1;
            });

            const avgOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;
            const avgCovers = totalReservations > 0 ? totalGuests / totalReservations : 0;
            const avgWaitTime = totalReservations > 0 ? totalWaitTime / totalReservations : 0;
            const avgCustomerSat = customerSatCount > 0 ? totalCustomerSat / customerSatCount : 0;

            // Calculate overall top meal
            const overallMealCounts = {};
            filteredData.forEach(item => {
                overallMealCounts[item.topMeal] = (overallMealCounts[item.topMeal] || 0) + 1;
            });
            let topMeal = 'N/A';
            let maxMealCount = 0;
            for (const meal in overallMealCounts) {
                if (overallMealCounts[meal] > maxMealCount) {
                    maxMealCount = overallMealCounts[meal];
                    topMeal = meal;
                }
            }

            // Calculate table turnover (simple average: reservations per day / avg tables)
            // This is a simplified calculation; real turnover is complex.
            const numberOfDays = Array.from(dailyDataMap.keys()).length;
            const avgReservationsPerDay = numberOfDays > 0 ? totalReservations / numberOfDays : 0;
            // Assuming an average of 10 tables for simplicity, adjust as needed
            const estimatedTables = 10; 
            const tableTurnover = estimatedTables > 0 ? avgReservationsPerDay / estimatedTables : 0;


            return {
                totalSales,
                avgOrderValue,
                avgCovers,
                topMeal,
                avgWaitTime,
                tableTurnover,
                customerSat: avgCustomerSat
            };
        }

        /**
         * Generates data for the Daily Statistics Table.
         * @param {string} startDate - Start date (YYYY-MM-DD).
         * @param {string} endDate - End date (YYYY-MM-DD).
         * @param {string} mealType - Selected meal type.
         * @param {string} department - Selected department.
         * @param {string} room - Selected room.
         * @returns {Array} Array of daily statistics.
         */
        function generateDailyData(startDate, endDate, mealType, department, room) {
            const filtered = filterData(sampleReservationsAndSalesData, startDate, endDate, mealType, department, room);
            const dailyAggregated = new Map();

            filtered.forEach(item => {
                if (!dailyAggregated.has(item.date)) {
                    dailyAggregated.set(item.date, {
                        totalSales: 0,
                        totalOrders: 0,
                        totalGuests: 0,
                        mealCounts: {}
                    });
                }
                const dailyEntry = dailyAggregated.get(item.date);
                dailyEntry.totalSales += item.sales;
                dailyEntry.totalOrders += item.orders;
                dailyEntry.totalGuests += item.guests;
                dailyEntry.mealCounts[item.topMeal] = (dailyEntry.mealCounts[item.topMeal] || 0) + 1;
            });

            const dailyData = [];
            Array.from(dailyAggregated.keys()).sort().forEach(date => {
                const entry = dailyAggregated.get(date);
                const avgOrderValue = entry.totalOrders > 0 ? entry.totalSales / entry.totalOrders : 0;

                let topMealToday = 'N/A';
                let maxMealCountToday = 0;
                for (const meal in entry.mealCounts) {
                    if (entry.mealCounts[meal] > maxMealCountToday) {
                        maxMealCountToday = entry.mealCounts[meal];
                        topMealToday = meal;
                    }
                }

                dailyData.push({
                    date: date,
                    totalSales: entry.totalSales,
                    totalOrders: entry.totalOrders,
                    avgOrderValue: avgOrderValue,
                    topMealToday: topMealToday
                });
            });
            return dailyData;
        }

        // --- Chart Drawing Functions ---

        /**
         * Draws the Daily Sales Trend Line Chart.
         * @param {Array} data - Array of daily statistics.
         */
        function drawDailySalesTrendChart(data) {
            const chartData = [['Date', 'Total Sales']];
            data.forEach(item => {
                chartData.push([item.date, item.totalSales]);
            });

            const dataTable = google.visualization.arrayToDataTable(chartData);

            const options = {
                title: 'Daily Sales Trend',
                curveType: 'function',
                legend: { position: 'bottom' },
                chartArea: { width: '80%', height: '70%' },
                colors: [body.classList.contains('dark-mode') ? '#7a9cff' : '#007bff'], // Accent color
                backgroundColor: {
                    fill: body.classList.contains('dark-mode') ? '#1f283e' : '#ffffff' // Card background
                },
                hAxis: {
                    textStyle: { color: body.classList.contains('dark-mode') ? '#e0e0e0' : '#333' },
                    gridlines: { color: body.classList.contains('dark-mode') ? '#3f4a6b' : '#ddd' }
                },
                vAxis: {
                    textStyle: { color: body.classList.contains('dark-mode') ? '#e0e0e0' : '#333' },
                    gridlines: { color: body.classList.contains('dark-mode') ? '#3f4a6b' : '#ddd' },
                    format: '€#,###.00'
                },
                titleTextStyle: { color: body.classList.contains('dark-mode') ? '#6a90ea' : '#007bff' }
            };

            const chart = new google.visualization.LineChart(document.getElementById('daily_sales_trend_chart'));
            chart.draw(dataTable, options);
        }

        /**
         * Draws the Meal Type Breakdown Pie Chart.
         * @param {Array} filteredData - Data after applying filters.
         */
        function drawMealTypeBreakdownChart(filteredData) {
            const mealTypeCounts = {};
            filteredData.forEach(item => {
                mealTypeCounts[item.mealType] = (mealTypeCounts[item.mealType] || 0) + 1;
            });

            const chartData = [['Meal Type', 'Count']];
            for (const mealType in mealTypeCounts) {
                chartData.push([mealType.charAt(0).toUpperCase() + mealType.slice(1), mealTypeCounts[mealType]]);
            }

            const dataTable = google.visualization.arrayToDataTable(chartData);

            const options = {
                title: 'Meal Type Breakdown',
                pieHole: 0.4, // Donut chart
                legend: { position: 'right', alignment: 'center', textStyle: { color: body.classList.contains('dark-mode') ? '#e0e0e0' : '#333' } },
                chartArea: { width: '90%', height: '80%' },
                backgroundColor: {
                    fill: body.classList.contains('dark-mode') ? '#1f283e' : '#ffffff'
                },
                pieSliceTextStyle: {
                    color: body.classList.contains('dark-mode') ? '#f0f2f5' : 'black', // Text color on slices
                },
                titleTextStyle: { color: body.classList.contains('dark-mode') ? '#6a90ea' : '#007bff' },
                // You can specify slice colors if you want consistency
                colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d', '#17a2b8']
            };

            const chart = new google.visualization.PieChart(document.getElementById('meal_type_breakdown_chart'));
            chart.draw(dataTable, options);
        }

        /**
         * Main function to render all statistics based on current filters.
         */
        function renderStatsData() {
            const startDate = startDateInput.value;
            const endDate = endDateInput.value;
            const selectedMealType = mealTypeFilter.value;
            const selectedDepartment = departmentFilter.value;
            const selectedRoom = roomFilter.value;

            const filtered = filterData(sampleReservationsAndSalesData, startDate, endDate, selectedMealType, selectedDepartment, selectedRoom);
            const summary = calculateSummaryStats(filtered);

            // Update Summary Cards
            overallTotalSales.textContent = `€ ${summary.totalSales.toFixed(2)}`;
            overallAvgOrderValue.textContent = `€ ${summary.avgOrderValue.toFixed(2)}`;
            overallAvgCovers.textContent = summary.avgCovers.toFixed(1);
            overallTopMeal.textContent = summary.topMeal;
            overallAvgWaitTime.textContent = `${summary.avgWaitTime.toFixed(0)} min`; // Rounded to nearest minute
            overallTableTurnover.textContent = `${summary.tableTurnover.toFixed(1)} times`;
            overallCustomerSat.textContent = `${summary.customerSat.toFixed(1)} / 5`;

            // Draw Charts with current filter settings
            drawDailySalesTrendChart(generateDailyData(startDate, endDate, selectedMealType, selectedDepartment, selectedRoom));
            drawMealTypeBreakdownChart(filtered);

            // Populate Daily Statistics Table
            dailyStatsTableBody.innerHTML = ''; // Clear existing rows
            
            // Generate data specific to the current filters for the table
            const dailyData = generateDailyData(startDate, endDate, selectedMealType, selectedDepartment, selectedRoom);
            
            if (dailyData.length === 0) {
                dailyStatsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--subtitle-color); padding: 20px;">No daily data for the selected period or filters.</td></tr>';
                return;
            }

            dailyData.forEach(item => {
                const row = dailyStatsTableBody.insertRow();
                row.insertCell().textContent = item.date;
                row.insertCell().textContent = `€ ${item.totalSales.toFixed(2)}`;
                row.insertCell().textContent = item.totalOrders;
                row.insertCell().textContent = `€ ${item.avgOrderValue.toFixed(2)}`;
                row.insertCell().textContent = item.topMealToday;
            });
        }

        // --- Event Listeners for Filters ---
        startDateInput.addEventListener('change', renderStatsData);
        endDateInput.addEventListener('change', renderStatsData);
        mealTypeFilter.addEventListener('change', renderStatsData);
        departmentFilter.addEventListener('change', renderStatsData);
        roomFilter.addEventListener('change', renderStatsData);

        // Initial render based on default selections when page loads
        renderStatsData();

        // Ensure charts redraw on window resize for responsiveness
        window.addEventListener('resize', drawCharts); // A generic redraw for all charts
        function drawCharts() {
            drawDailySalesTrendChart(generateDailyData(startDateInput.value, endDateInput.value, mealTypeFilter.value, departmentFilter.value, roomFilter.value));
            drawMealTypeBreakdownChart(filterData(sampleReservationsAndSalesData, startDateInput.value, endDateInput.value, mealTypeFilter.value, departmentFilter.value, roomFilter.value));
        }
    } // End of initializePage
});