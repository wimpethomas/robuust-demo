document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const revenueTypeSelect = document.getElementById('revenueType');
    const revenueSections = document.querySelectorAll('.revenue-section');

    // Select elements for summary cards (Overall section)
    const overallTotalRevenue = document.getElementById('overallTotalRevenue');
    const overallAverageCheck = document.getElementById('overallAverageCheck');
    const overallTransactions = document.getElementById('overallTransactions');

    // Google Charts specific setup
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(initializePage);

    function initializePage() {
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
            // Redraw chart if overall section is active when theme changes
            if (revenueTypeSelect.value === 'overall') {
                drawRevenueLineChart(); 
            }
        }

        // Check for saved theme preference on page load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            applyTheme(savedTheme);
        } else {
            // Default to dark mode as per Kassa.png if no preference saved
            applyTheme('dark'); 
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
        const mm = String(today.getMonth() + 1).padStart(2, '0');
        const dd = String(today.getDate()).padStart(2, '0');

        startDateInput.value = `${yyyy}-${mm}-01`; // Default to start of current month
        endDateInput.value = `${yyyy}-${mm}-${dd}`; // Default to today

        startDateInput.addEventListener('change', () => {
            renderRevenueData();
        });
        endDateInput.addEventListener('change', () => {
            renderRevenueData();
        });

        // --- Revenue Type Selector Logic ---
        revenueTypeSelect.addEventListener('change', () => {
            renderRevenueData();
        });

        // --- Aggregated Data (Extracted from images) ---
        const aggregatedRevenueData = {
            overall: {
                total: 15230.50,
                averageCheck: 45.20,
                transactions: 337,
                // dailyTrend data for chart will be generated dynamically
            },
            paymentMethods: [
                { name: 'Cash', baseRevenue: 3500.00, baseTransactions: 80 },
                { name: 'Card', baseRevenue: 9800.50, baseTransactions: 200 },
                { name: 'Mobile Pay', baseRevenue: 1930.00, baseTransactions: 57 }
            ],
            meals: [
                { name: 'SPARERIBS (VARKEN)', category: 'Main Course', baseQuantity: 120, baseRevenue: 2400.00 },
                { name: 'KOFFIE', category: 'Drinks', baseQuantity: 350, baseRevenue: 1050.00 },
                { name: 'OSSENHAAS', category: 'Main Course', baseQuantity: 80, baseRevenue: 2000.00 },
                { name: 'COCA COLA', category: 'Drinks', baseQuantity: 280, baseRevenue: 840.00 },
                { name: 'CREME BRULEE', category: 'Dessert', baseQuantity: 90, baseRevenue: 675.00 }
            ],
            coworkers: [
                { name: 'John Doe', baseSales: 5120.30, baseOrders: 110 },
                { name: 'Jane Smith', baseSales: 4800.10, baseOrders: 105 },
                { name: 'Peter Jones', baseSales: 3500.00, baseOrders: 70 }
            ]
        };

        // --- Helper function to generate random daily data ---
        function generateRandomDailyData(type, start, end) {
            const data = [];
            let currentDate = new Date(start);

            while (currentDate <= new Date(end)) {
                const dateString = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                if (type === 'overall') {
                    // Generate random daily revenue and transactions
                    const dailyRevenue = Math.random() * (aggregatedRevenueData.overall.total / 30) * (0.8 + Math.random() * 0.4); // ~30 days, +/- 20%
                    const dailyTransactions = Math.floor(Math.random() * (aggregatedRevenueData.overall.transactions / 30) * (0.8 + Math.random() * 0.4));
                    data.push({ date: dateString, revenue: dailyRevenue, transactions: dailyTransactions });
                } else if (type === 'paymentMethod') {
                    aggregatedRevenueData.paymentMethods.forEach(pm => {
                        const dailyRevenue = (pm.baseRevenue / 30) * (0.8 + Math.random() * 0.4);
                        data.push({ date: dateString, method: pm.name, revenue: dailyRevenue });
                    });
                } else if (type === 'meal') {
                    aggregatedRevenueData.meals.forEach(meal => {
                        const dailyQuantity = Math.floor((meal.baseQuantity / 30) * (0.8 + Math.random() * 0.4));
                        const dailyRevenue = (meal.baseRevenue / 30) * (0.8 + Math.random() * 0.4);
                        if (dailyQuantity > 0) { // Only add if sold
                            data.push({ date: dateString, name: meal.name, quantity: dailyQuantity, revenue: dailyRevenue });
                        }
                    });
                } else if (type === 'coworker') {
                    aggregatedRevenueData.coworkers.forEach(coworker => {
                        const dailySales = (coworker.baseSales / 30) * (0.8 + Math.random() * 0.4);
                        const dailyOrders = Math.floor((coworker.baseOrders / 30) * (0.8 + Math.random() * 0.4));
                        if (dailyOrders > 0) { // Only add if orders exist
                            data.push({ date: dateString, name: coworker.name, sales: dailySales, orders: dailyOrders });
                        }
                    });
                }
                currentDate.setDate(currentDate.getDate() + 1);
            }
            return data;
        }


        // --- Chart Drawing Function (Google Charts) ---
        function drawRevenueLineChart() {
            const isDarkMode = body.classList.contains('dark-mode');
            const textColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--chart-text-google') : '#666';
            const gridColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-google') : '#e0e0e0';
            const titleColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--chart-title-google') : '#333';
            const seriesColor = isDarkMode ? getComputedStyle(document.documentElement).getPropertyValue('--chart-series-color-1') : '#007bff';

            // Generate daily data for chart
            const chartDataArray = [['Date', 'Revenue']];
            const dailyOverallData = generateRandomDailyData('overall', startDateInput.value, endDateInput.value);
            dailyOverallData.forEach(day => {
                chartDataArray.push([day.date, parseFloat(day.revenue.toFixed(2))]);
            });

            if (chartDataArray.length <= 1) { // If no data for the period
                const chartDiv = document.getElementById('revenue_line_chart');
                chartDiv.innerHTML = '<p style="text-align: center; color: var(--subtitle-color);">No revenue data for this period.</p>';
                return;
            }

            var data = google.visualization.arrayToDataTable(chartDataArray);

            var options = {
                chartArea: { width: '85%', height: '70%', left: '10%', top: '15%' },
                legend: { position: 'none' },
                backgroundColor: 'transparent',
                colors: [seriesColor],
                hAxis: {
                    textStyle: { color: textColor },
                    gridlines: { color: gridColor },
                    baselineColor: gridColor,
                    format: 'MMM dd' // Format date on x-axis
                },
                vAxis: {
                    title: 'Revenue (€)',
                    textStyle: { color: textColor },
                    gridlines: { color: gridColor },
                    baselineColor: gridColor,
                    minValue: 0
                },
                tooltip: { isHtml: false },
                lineWidth: 3,
                pointSize: 5
            };

            var chart = new google.visualization.LineChart(document.getElementById('revenue_line_chart'));
            chart.draw(data, options);
        }

        // --- Render Revenue Data Function ---
        function renderRevenueData() {
            // Hide all sections first
            revenueSections.forEach(section => {
                section.classList.remove('active');
            });

            const selectedType = revenueTypeSelect.value;
            const targetSection = document.getElementById(`${selectedType}-revenue-section`);
            if (targetSection) {
                targetSection.classList.add('active');
            }

            const startDate = startDateInput.value;
            const endDate = endDateInput.value;

            if (selectedType === 'overall') {
                // Update summary cards with aggregated data from screenshot
                overallTotalRevenue.textContent = `€ ${aggregatedRevenueData.overall.total.toFixed(2)}`;
                overallAverageCheck.textContent = `€ ${aggregatedRevenueData.overall.averageCheck.toFixed(2)}`;
                overallTransactions.textContent = `${aggregatedRevenueData.overall.transactions}`;
                
                drawRevenueLineChart(); // Draw/Redraw chart for overall

                // Populate Daily Overall Revenue Table
                const dailyOverallTableBody = document.querySelector('.daily-overall-table tbody');
                dailyOverallTableBody.innerHTML = '';
                const dailyOverallData = generateRandomDailyData('overall', startDate, endDate);
                dailyOverallData.forEach(item => {
                    const row = dailyOverallTableBody.insertRow();
                    row.insertCell().textContent = item.date;
                    row.insertCell().textContent = `€ ${item.revenue.toFixed(2)}`;
                    row.insertCell().textContent = item.transactions;
                });

            } else if (selectedType === 'paymentMethod') {
                const dailyPaymentMethodTableBody = document.querySelector('.daily-paymentmethod-table tbody');
                dailyPaymentMethodTableBody.innerHTML = '';
                const dailyPaymentMethodData = generateRandomDailyData('paymentMethod', startDate, endDate);
                dailyPaymentMethodData.forEach(item => {
                    const row = dailyPaymentMethodTableBody.insertRow();
                    row.insertCell().textContent = item.date;
                    row.insertCell().textContent = item.method;
                    row.insertCell().textContent = `€ ${item.revenue.toFixed(2)}`;
                });

            } else if (selectedType === 'meal') {
                const dailyMealTableBody = document.querySelector('.daily-meal-table tbody');
                dailyMealTableBody.innerHTML = '';
                const dailyMealData = generateRandomDailyData('meal', startDate, endDate);
                dailyMealData.forEach(item => {
                    const row = dailyMealTableBody.insertRow();
                    row.insertCell().textContent = item.date;
                    row.insertCell().textContent = item.name;
                    row.insertCell().textContent = item.quantity;
                    row.insertCell().textContent = `€ ${item.revenue.toFixed(2)}`;
                });

            } else if (selectedType === 'coworker') {
                const dailyCoworkerTableBody = document.querySelector('.daily-coworker-table tbody');
                dailyCoworkerTableBody.innerHTML = '';
                const dailyCoworkerData = generateRandomDailyData('coworker', startDate, endDate);
                dailyCoworkerData.forEach(item => {
                    const row = dailyCoworkerTableBody.insertRow();
                    row.insertCell().textContent = item.date;
                    row.insertCell().textContent = item.name;
                    row.insertCell().textContent = `€ ${item.sales.toFixed(2)}`;
                    row.insertCell().textContent = item.orders;
                });
            }
        }

        // Initial render based on default selections
        renderRevenueData();

        // Ensure charts redraw on window resize for responsiveness
        window.addEventListener('resize', () => {
            if (revenueTypeSelect.value === 'overall') {
                drawRevenueLineChart();
            }
        });
    } // End of initializePage
});