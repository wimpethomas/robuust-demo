document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const mealTypeFilter = document.getElementById('mealTypeFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const roomFilter = document.getElementById('roomFilter');

    // Select elements for summary cards
    const overallTotalSales = document.getElementById('overallTotalSales');
    const overallAvgOrderValue = document.getElementById('overallAvgOrderValue');
    const overallAvgCovers = document.getElementById('overallAvgCovers');
    const overallTopMeal = document.getElementById('overallTopMeal');
    const overallAvgWaitTime = document.getElementById('overallAvgWaitTime');
    const overallTableTurnover = document.getElementById('overallTableTurnover');
    const overallCustomerSat = document.getElementById('overallCustomerSat');

    // --- Aggregated Data (Moved here to be accessible throughout the script) ---
    const aggregatedStats = {
        totalSales: 15230.50,
        avgOrderValue: 45.20,
        avgCovers: 2.5,
        topSellingMeal: 'SPARERIBS (VARKEN)',
        avgWaitTime: 15, // in minutes
        tableTurnover: 90, // in minutes
        customerSatisfaction: 4.8, // out of 5

        // Meal Type breakdown percentages from screenshot (approximate)
        mealTypeBreakdown: {
            'Main Course': 0.40,
            'Drinks': 0.25,
            'Appetizer': 0.20,
            'Dessert': 0.15
        },
        
        // For generating dummy daily data:
        allMealTypes: ['Main Course', 'Appetizer', 'Dessert', 'Drinks'],
        allDepartments: ['Kitchen', 'Bar', 'Service'],
        allRooms: ['Main Dining', 'Terrace', 'Private Room'],
        allTopMeals: [
            'SPARERIBS (VARKEN)', 'CLUB SANDWICH', 'PASTA CARBONARA',
            'ZALMFILET', 'VEGGIE BURGER', 'FRIET MET SNACKS'
        ]
    };


    // Google Charts specific setup
    google.charts.load('current', {'packages': ['corechart']});
    google.charts.setOnLoadCallback(initializePage);

    function initializePage() {
        try { // Wrap the entire initializePage function in a try-catch for robust error handling

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
                drawCharts(); // Ensure charts are redrawn on theme change
            }

            const savedTheme = localStorage.getItem('theme');
            if (savedTheme) {
                applyTheme(savedTheme);
            } else {
                applyTheme('dark'); // Default to dark mode
            }

            darkModeToggle.addEventListener('change', () => {
                if (darkModeToggle.checked) {
                    applyTheme('dark');
                } else {
                    applyTheme('light');
                }
            });

            // --- Date Picker Logic (Consistent across pages) ---
            const today = new Date();
            const yyyy = today.getFullYear();
            const mm = String(today.getMonth() + 1).padStart(2, '0');
            const dd = String(today.getDate()).padStart(2, '0');

            startDateInput.value = `${yyyy}-${mm}-01`; // Default to start of current month
            endDateInput.value = `${yyyy}-${mm}-${dd}`; // Default to today

            startDateInput.addEventListener('change', renderStatsData);
            endDateInput.addEventListener('change', renderStatsData);
            mealTypeFilter.addEventListener('change', renderStatsData);
            departmentFilter.addEventListener('change', renderStatsData);
            roomFilter.addEventListener('change', renderStatsData);


            // --- Helper function to generate plausible daily data ---
            function generateDailyData(start, end, mealTypeFilterVal, departmentFilterVal, roomFilterVal) {
                const data = [];
                let currentDate = new Date(start);
                const endDateObj = new Date(end);
                
                if (isNaN(currentDate.getTime()) || isNaN(endDateObj.getTime()) || currentDate > endDateObj) {
                    return []; // Return empty if dates are invalid
                }

                const totalDays = (endDateObj.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24) + 1;
                if (totalDays <= 0) return [];

                let baseTotalSalesForPeriod = aggregatedStats.totalSales;

                if (mealTypeFilterVal !== 'all') {
                    // Match meal type filter more simply
                    const mealTypeKey = aggregatedStats.allMealTypes.find(type =>
                        type.toLowerCase().includes(mealTypeFilterVal.toLowerCase())
                    );
                    if (mealTypeKey && aggregatedStats.mealTypeBreakdown[mealTypeKey]) {
                        baseTotalSalesForPeriod = aggregatedStats.totalSales * aggregatedStats.mealTypeBreakdown[mealTypeKey];
                    } else {
                        baseTotalSalesForPeriod = 0; // If filtered meal type not found or has no sales breakdown
                    }
                }
                
                // Ensure there's always a minimum base sales if overall sales are present,
                // even if a specific filter results in zero. This prevents charts from always showing "no data"
                // if the filter slightly reduces sales to zero due to approximation.
                if (aggregatedStats.totalSales > 0 && baseTotalSalesForPeriod < 10) { // Set a low threshold, e.g., 10 to ensure some visibility
                    baseTotalSalesForPeriod = 10; 
                }


                const avgDailySalesEstimate = baseTotalSalesForPeriod / totalDays;

                while (currentDate <= endDateObj) {
                    const dateString = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

                    let dailySalesFactor = 1.0;
                    if (dayOfWeek === 5 || dayOfWeek === 6) { // Friday or Saturday
                        dailySalesFactor = 1.4 + (Math.random() * 0.6);
                    } else if (dayOfWeek === 0) { // Sunday
                        dailySalesFactor = 1.1 + (Math.random() * 0.4);
                    } else { // Weekdays (Mon-Thu)
                        dailySalesFactor = 0.7 + (Math.random() * 0.3);
                    }

                    let dailySales = avgDailySalesEstimate * dailySalesFactor * (0.95 + Math.random() * 0.1);

                    // Ensure minimum sales if overall sales > 0, so charts show something
                    if (aggregatedStats.totalSales > 0 && dailySales < 1) dailySales = 1 + (Math.random() * 5); // Ensure a small positive value
                    if (baseTotalSalesForPeriod === 0) dailySales = 0; // If filtered sales are truly zero, keep it zero

                    const dailyOrders = Math.max(0, Math.floor(dailySales / (aggregatedStats.avgOrderValue * (0.9 + Math.random() * 0.2))));
                    const dailyAvgOrderValue = dailyOrders > 0 ? dailySales / dailyOrders : 0;

                    let topMealToday = 'N/A';
                    if (mealTypeFilterVal === 'all') {
                        topMealToday = aggregatedStats.allTopMeals[Math.floor(Math.random() * aggregatedStats.allTopMeals.length)];
                    } else {
                        if (mealTypeFilterVal.toLowerCase().includes('main')) topMealToday = 'SPARERIBS (VARKEN)';
                        else if (mealTypeFilterVal.toLowerCase().includes('appe')) topMealToday = 'BRUSCHETTA';
                        else if (mealTypeFilterVal.toLowerCase().includes('dessert')) topMealToday = 'CHOCOLADE FONDUE';
                        else if (mealTypeFilterVal.toLowerCase().includes('drink')) topMealToday = 'COCKTAIL VAN DE MAAND';
                        else topMealToday = 'Item from ' + mealTypeFilterVal + ' Category';
                    }

                    data.push({
                        date: dateString,
                        totalSales: dailySales,
                        totalOrders: dailyOrders,
                        avgOrderValue: dailyAvgOrderValue,
                        topMealToday: topMealToday
                    });
                    currentDate.setDate(currentDate.getDate() + 1);
                }
                return data;
            }

            // --- Chart Drawing Functions ---
            function getThemeChartOptions() {
                const isDarkMode = body.classList.contains('dark-mode');
                const rootStyles = getComputedStyle(document.documentElement);
                return {
                    textColor: rootStyles.getPropertyValue('--chart-text-google').trim() || '#666',
                    gridColor: rootStyles.getPropertyValue('--chart-grid-google').trim() || '#e0e0e0',
                    titleColor: rootStyles.getPropertyValue('--chart-title-google').trim() || '#333',
                    seriesColor1: rootStyles.getPropertyValue('--chart-series-color-1').trim() || '#007bff',
                    seriesColor2: rootStyles.getPropertyValue('--chart-series-color-2').trim() || '#28a745',
                    seriesColor3: rootStyles.getPropertyValue('--chart-series-color-3').trim() || '#ffc107',
                    seriesColor4: rootStyles.getPropertyValue('--chart-series-color-4').trim() || '#dc3545',
                };
            }

            function drawDailySalesTrendChart() {
                const themeColors = getThemeChartOptions();
                const chartDiv = document.getElementById('daily_sales_trend_chart');
                if (!chartDiv) {
                    console.error("Chart div 'daily_sales_trend_chart' not found.");
                    return;
                }
                chartDiv.innerHTML = ''; // Clear previous content

                const dailyStats = generateDailyData(startDateInput.value, endDateInput.value, mealTypeFilter.value, departmentFilter.value, roomFilter.value);
                
                const chartDataArray = [['Date', 'Sales']];
                if (dailyStats.length === 0 || dailyStats.every(day => day.totalSales === 0)) {
                    chartDiv.innerHTML = '<p style="text-align: center; color: var(--subtitle-color);">No daily sales data for this period or filters.</p>';
                    return;
                }

                dailyStats.forEach(day => {
                    chartDataArray.push([day.date, parseFloat(day.totalSales.toFixed(2))]);
                });

                try {
                    var data = new google.visualization.arrayToDataTable(chartDataArray);

                    var options = {
                        chartArea: { width: '85%', height: '70%', left: '10%', top: '15%' },
                        legend: { position: 'none' },
                        backgroundColor: 'transparent',
                        colors: [themeColors.seriesColor1],
                        hAxis: {
                            textStyle: { color: themeColors.textColor },
                            gridlines: { color: themeColors.gridColor },
                            baselineColor: themeColors.gridColor,
                            format: 'MMM dd'
                        },
                        vAxis: {
                            title: 'Sales (€)',
                            textStyle: { color: themeColors.textColor },
                            gridlines: { color: themeColors.gridColor },
                            baselineColor: themeColors.gridColor,
                            minValue: 0
                        },
                        tooltip: { isHtml: false },
                        lineWidth: 3,
                        pointSize: 5
                    };
                    
                    var chart = new google.visualization.LineChart(chartDiv);
                    // Add an error listener for Google Charts
                    google.visualization.events.addListener(chart, 'error', function (e) {
                        chartDiv.innerHTML = `<p style="text-align: center; color: red;">Chart Error: ${e.message}</p>`;
                        console.error("Google Chart Error (Daily Sales Trend):", e);
                    });
                    chart.draw(data, options);
                } catch (e) {
                    chartDiv.innerHTML = `<p style="text-align: center; color: red;">Error drawing chart: ${e.message}</p>`;
                    console.error("Caught error drawing Daily Sales Trend Chart:", e);
                }
            }

            function drawMealTypeBreakdownChart() {
                const themeColors = getThemeChartOptions();
                const chartDiv = document.getElementById('meal_type_breakdown_chart');
                if (!chartDiv) {
                    console.error("Chart div 'meal_type_breakdown_chart' not found.");
                    return;
                }
                chartDiv.innerHTML = ''; // Clear previous content

                const chartDataArray = [['Meal Type', 'Sales']];
                const totalSalesForBreakdown = aggregatedStats.totalSales;

                let hasMeaningfulData = false;
                for (const mealType in aggregatedStats.mealTypeBreakdown) {
                    const percentage = aggregatedStats.mealTypeBreakdown[mealType];
                    let sales = totalSalesForBreakdown * percentage;
                    // Ensure a minimum value for display if total sales is low but present
                    if (totalSalesForBreakdown > 0 && sales < 1) sales = 1; 

                    chartDataArray.push([mealType, parseFloat(sales.toFixed(2))]);
                    if (sales > 0) hasMeaningfulData = true;
                }

                if (!hasMeaningfulData) {
                    chartDiv.innerHTML = '<p style="text-align: center; color: var(--subtitle-color);">No meal type data available.</p>';
                    return;
                }

                try {
                    var data = new google.visualization.arrayToDataTable(chartDataArray);

                    var options = {
                        chartArea: { width: '90%', height: '80%' },
                        legend: { textStyle: { color: themeColors.textColor } },
                        backgroundColor: 'transparent',
                        colors: [themeColors.seriesColor1, themeColors.seriesColor2, themeColors.seriesColor3, themeColors.seriesColor4],
                        pieSliceText: 'percentage',
                        tooltip: { isHtml: false },
                        title: 'Sales Breakdown by Meal Type',
                        titleTextStyle: { color: themeColors.titleColor },
                    };
                    
                    var chart = new google.visualization.PieChart(chartDiv);
                    // Add an error listener for Google Charts
                    google.visualization.events.addListener(chart, 'error', function (e) {
                        chartDiv.innerHTML = `<p style="text-align: center; color: red;">Chart Error: ${e.message}</p>`;
                        console.error("Google Chart Error (Meal Type Breakdown):", e);
                    });
                    chart.draw(data, options);
                } catch (e) {
                    chartDiv.innerHTML = `<p style="text-align: center; color: red;">Error drawing chart: ${e.message}</p>`;
                    console.error("Caught error drawing Meal Type Breakdown Chart:", e);
                }
            }
            
            function drawCharts() {
                drawDailySalesTrendChart();
                drawMealTypeBreakdownChart();
            }

            // --- Render Stats Data Function ---
            function renderStatsData() {
                const startDate = startDateInput.value;
                const endDate = endDateInput.value;
                const selectedMealType = mealTypeFilter.value;
                const selectedDepartment = departmentFilter.value;
                const selectedRoom = roomFilter.value;

                // Update summary cards with aggregated data from screenshot
                if (overallTotalSales) overallTotalSales.textContent = `€ ${aggregatedStats.totalSales.toFixed(2)}`;
                if (overallAvgOrderValue) overallAvgOrderValue.textContent = `€ ${aggregatedStats.avgOrderValue.toFixed(2)}`;
                if (overallAvgCovers) overallAvgCovers.textContent = `${aggregatedStats.avgCovers.toFixed(1)}`;
                if (overallTopMeal) overallTopMeal.textContent = aggregatedStats.topSellingMeal;
                if (overallAvgWaitTime) overallAvgWaitTime.textContent = `${aggregatedStats.avgWaitTime} min`;
                if (overallTableTurnover) overallTableTurnover.textContent = `${aggregatedStats.tableTurnover} min`;
                if (overallCustomerSat) overallCustomerSat.textContent = `${aggregatedStats.customerSatisfaction.toFixed(1)}/5`;
                
                // Redraw charts with current filter settings
                drawCharts();

                // Populate Daily Statistics Table
                const dailyStatsTableBody = document.querySelector('.daily-stats-table tbody');
                if (!dailyStatsTableBody) {
                    console.error("Daily stats table body not found.");
                    return;
                }
                dailyStatsTableBody.innerHTML = ''; // Clear existing rows
                
                const dailyData = generateDailyData(startDate, endDate, selectedMealType, selectedDepartment, selectedRoom);
                
                if (dailyData.length === 0) {
                    dailyStatsTableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--subtitle-color);">No daily data for the selected period or filters.</td></tr>';
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

            // Initial render based on default selections when page loads
            renderStatsData();

            // Ensure charts redraw on window resize for responsiveness
            window.addEventListener('resize', drawCharts);

        } catch (error) {
            // General error message if anything goes wrong in initializePage
            console.error("An unhandled error occurred in initializePage:", error);
            const mainContent = document.querySelector('.pos-main-content.stats-content');
            if (mainContent) {
                mainContent.innerHTML = `<p style="text-align: center; color: red;">An error occurred loading the statistics: ${error.message}. Please check your browser's console for more details.</p>`;
            }
        }
    } // End of initializePage
});