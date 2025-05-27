document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const reportDateInput = document.getElementById('reportDate');

    // Summary Card Elements
    const totalSalesElem = document.getElementById('totalSales');
    const totalTransactionsElem = document.getElementById('totalTransactions');
    const avgOrderValueElem = document.getElementById('avgOrderValue');
    const avgCoversElem = document.getElementById('avgCovers');
    const totalDiscountElem = document.getElementById('totalDiscount');
    const totalCancellationsElem = document.getElementById('totalCancellations');

    // Table Elements
    const transactionTableBody = document.querySelector('.transaction-table tbody');

    // Chart Placeholders (for Google Charts)
    const productCategoryChartDiv = document.getElementById('product_category_chart');
    const paymentMethodChartDiv = document.getElementById('payment_method_chart');

    // Function to get theme-dependent chart colors
    function getThemeColors() {
        const isDarkMode = body.classList.contains('dark-mode');
        // These properties are defined in day-reports.css
        return {
            bgColor: isDarkMode ? getComputedStyle(body).getPropertyValue('--chart-bg-google').trim() : getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-google').trim(),
            textColor: isDarkMode ? getComputedStyle(body).getPropertyValue('--chart-text-google').trim() : getComputedStyle(document.documentElement).getPropertyValue('--chart-text-google').trim(),
            gridColor: isDarkMode ? getComputedStyle(body).getPropertyValue('--chart-grid-google').trim() : getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-google').trim(),
            titleColor: isDarkMode ? getComputedStyle(body).getPropertyValue('--chart-title-google').trim() : getComputedStyle(document.documentElement).getPropertyValue('--chart-title-google').trim(),
            // Add more colors if your charts use them
            sliceColors: isDarkMode ? ['#92a8d1', '#6a8bb1', '#4a5c7c', '#2f3d52', '#007bff'] : ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d']
        };
    }

    // Dummy Data Generation for Charts
    function generateProductCategoryData() {
        const categories = ['Food', 'Drinks (Non-Alc)', 'Drinks (Alc)', 'Desserts', 'Snacks'];
        const data = [['Category', 'Sales (Revenue)']];
        categories.forEach(cat => {
            data.push([cat, Math.floor(Math.random() * 500) + 100]); // Random sales data
        });
        return data;
    }

    function generatePaymentMethodData() {
        const methods = ['Cash', 'Card', 'Online', 'Voucher', 'Other'];
        const data = [['Method', 'Sales (Revenue)']];
        methods.forEach(method => {
            data.push([method, Math.floor(Math.random() * 300) + 50]); // Random sales data
        });
        return data;
    }

    // Draw Product Category Sales Chart
    function drawProductCategoryChart() {
        const themeColors = getThemeColors();
        var data = google.visualization.arrayToDataTable(generateProductCategoryData());

        var options = {
            title: 'Product Category Sales Breakdown',
            backgroundColor: { fill: themeColors.bgColor },
            titleTextStyle: { color: themeColors.titleColor },
            legend: { textStyle: { color: themeColors.textColor } },
            pieSliceText: 'percentage',
            colors: themeColors.sliceColors,
            is3D: true // Example: make it 3D
        };

        // Check if the div exists before drawing
        if (productCategoryChartDiv) {
            var chart = new google.visualization.PieChart(productCategoryChartDiv);
            chart.draw(data, options);
        }
    }

    // Draw Payment Method Sales Chart
    function drawPaymentMethodChart() {
        const themeColors = getThemeColors();
        var data = google.visualization.arrayToDataTable(generatePaymentMethodData());

        var options = {
            title: 'Sales by Payment Method',
            backgroundColor: { fill: themeColors.bgColor },
            titleTextStyle: { color: themeColors.titleColor },
            legend: { textStyle: { color: themeColors.textColor } },
            colors: themeColors.sliceColors,
            hAxis: {
                textStyle: { color: themeColors.textColor },
                gridlines: { color: themeColors.gridColor }
            },
            vAxis: {
                textStyle: { color: themeColors.textColor },
                gridlines: { color: themeColors.gridColor }
            },
            chartArea: { width: '80%', height: '70%' }
        };

        // Check if the div exists before drawing
        if (paymentMethodChartDiv) {
            var chart = new google.visualization.BarChart(paymentMethodChartDiv);
            chart.draw(data, options);
        }
    }

    // Function to draw all charts (moved to higher scope)
    function drawCharts() {
        // Only attempt to draw charts if Google Charts API is loaded
        if (typeof google !== 'undefined' && typeof google.visualization !== 'undefined') {
            drawProductCategoryChart();
            drawPaymentMethodChart();
        } else {
            console.warn("Google Charts API not yet loaded. Skipping chart drawing.");
        }
    }

    // --- Dark Mode Toggle Logic (Consistent with existing pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('theme', theme);

        // Redraw charts if they exist and the API is loaded
        drawCharts();
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light mode for reports if no preference saved
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Google Charts Setup ---
    google.charts.load('current', { 'packages': ['corechart', 'bar', 'line'] });
    google.charts.setOnLoadCallback(initializePage);

    function initializePage() {
        // --- Data Population for Summary and Table ---
        function generateDailyReportData(date) {
            // This would typically come from an API based on the selected date
            // For now, generate dummy data
            const sales = (Math.random() * 2000 + 1000).toFixed(2);
            const transactions = Math.floor(Math.random() * 100 + 50);
            const avgOrderVal = (sales / transactions).toFixed(2);
            const avgCovers = (Math.random() * 4 + 1).toFixed(0);
            const discount = (Math.random() * 100).toFixed(2);
            const cancellations = (Math.random() * 50).toFixed(2);

            const transactionData = [];
            for (let i = 0; i < transactions; i++) {
                const hour = Math.floor(Math.random() * 8) + 12; // 12 PM to 8 PM
                const minute = Math.floor(Math.random() * 60);
                const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
                const table = `Table ${Math.floor(Math.random() * 20) + 1}`;
                const orderId = `ORD${Math.floor(Math.random() * 9000) + 1000}`;
                const total = (Math.random() * 50 + 10).toFixed(2);
                const paymentMethods = ['Card', 'Cash', 'Online', 'Split'];
                const paymentMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
                const statuses = ['Completed', 'Cancelled', 'Pending'];
                const status = statuses[Math.floor(Math.random() * statuses.length)];
                const servers = ['Alice', 'Bob', 'Charlie', 'Diana'];
                const server = servers[Math.floor(Math.random() * servers.length)];

                transactionData.push({ time, table, orderId, total, paymentMethod, status, server });
            }

            return {
                summary: {
                    totalSales: sales,
                    totalTransactions: transactions,
                    avgOrderValue: avgOrderVal,
                    avgCovers: avgCovers,
                    totalDiscount: discount,
                    totalCancellations: cancellations
                },
                transactions: transactionData
            };
        }

        function renderDailyReport(date) {
            const data = generateDailyReportData(date);

            // Update Summary Cards
            totalSalesElem.textContent = `€ ${data.summary.totalSales}`;
            totalTransactionsElem.textContent = data.summary.totalTransactions;
            avgOrderValueElem.textContent = `€ ${data.summary.avgOrderValue}`;
            avgCoversElem.textContent = data.summary.avgCovers;
            totalDiscountElem.textContent = `€ ${data.summary.totalDiscount}`;
            totalCancellationsElem.textContent = `€ ${data.summary.totalCancellations}`;

            // Populate Transaction Breakdown Table
            transactionTableBody.innerHTML = '';
            if (data.transactions.length === 0) {
                transactionTableBody.innerHTML = '<tr><td colspan=\"7\" style=\"text-align: center; color: var(--subtitle-color);\">No transactions for this date.</td></tr>';
            } else {
                data.transactions.forEach(tx => {
                    const row = transactionTableBody.insertRow();
                    row.insertCell().textContent = tx.time;
                    row.insertCell().textContent = tx.table;
                    row.insertCell().textContent = tx.orderId;
                    row.insertCell().textContent = `€ ${tx.total}`;
                    row.insertCell().textContent = tx.paymentMethod;
                    const statusCell = row.insertCell();
                    statusCell.textContent = tx.status;
                    statusCell.classList.add(`status-${tx.status.toLowerCase().replace(/\s/g, '-')}`); // For status styling
                    row.insertCell().textContent = tx.server;
                });
            }

            // Redraw charts
            drawCharts();
        }

        // Set initial date to today
        const today = new Date().toISOString().split('T')[0];
        reportDateInput.value = today;
        renderDailyReport(today); // Render initial data

        // Event Listener for Date Change
        reportDateInput.addEventListener('change', (event) => {
            renderDailyReport(event.target.value);
        });

        // Ensure charts redraw on window resize for responsiveness
        window.addEventListener('resize', drawCharts);
    } // End of initializePage
});