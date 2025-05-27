// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['corechart', 'bar', 'line']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(initializePage);

function initializePage() {
    // Get references for theme toggle
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Function to apply the theme to the body and redraw all charts
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
        // Redraw all charts with updated theme-specific options
        drawAllCharts();
    }

    // Check for saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to light mode if no preference saved
        applyTheme('light');
    }

    // Toggle theme on switch change
    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            applyTheme('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            applyTheme('light');
            localStorage.setItem('theme', 'light');
        }
    });

    // Initial draw of the charts (will be re-drawn by applyTheme)
    drawAllCharts();
}


function drawAllCharts() {
    // Determine if dark mode is currently active
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Define common chart theme colors based on the current mode
    const chartThemeColors = {
        bgColor: isDarkMode ? '#16213e' : '#ffffff',
        textColor: isDarkMode ? '#b0b0b0' : '#666',
        gridColor: isDarkMode ? '#3a3a5f' : '#e0e0e0',
        titleColor: isDarkMode ? '#e0e0e0' : '#333'
    };

    drawBarChart(chartThemeColors);
    drawLineChart(chartThemeColors);
    drawPieChart(chartThemeColors);
}

// --- Bar Chart ---
function drawBarChart(themeColors) {
    // Create the data table.
    var data = google.visualization.arrayToDataTable([
        ['Year', 'Sales', 'Expenses'],
        ['2018', 1000, 400],
        ['2019', 1170, 460],
        ['2020', 660, 1120],
        ['2021', 1030, 540],
        ['2022', 1200, 600],
        ['2023', 950, 480],
        ['2024', 1300, 700]
    ]);

    // Set chart options.
    var options = {
        title: 'Company Performance: Sales vs. Expenses',
        titleTextStyle: { color: themeColors.titleColor },
        chartArea: {
            width: '70%',
            backgroundColor: themeColors.bgColor // Chart area background
        },
        backgroundColor: themeColors.bgColor, // Overall chart background
        hAxis: {
            title: 'Total Amount',
            minValue: 0,
            textStyle: { color: themeColors.textColor },
            titleTextStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        vAxis: {
            title: 'Year',
            textStyle: { color: themeColors.textColor },
            titleTextStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        colors: ['#4CAF50', '#FF9800'], // Custom colors for bars (kept consistent)
        legend: {
            position: 'bottom',
            textStyle: { color: themeColors.textColor }
        },
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out'
        }
    };

    var chart = new google.charts.Bar(document.getElementById('bar_chart_div'));
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

// --- Line Chart ---
function drawLineChart(themeColors) {
    var data = new google.visualization.DataTable();
    data.addColumn('string', 'Month');
    data.addColumn('number', 'Sales');
    data.addColumn('number', 'Expenses');
    data.addRows([
        ['Jan', 300, 150],
        ['Feb', 400, 200],
        ['Mar', 350, 180],
        ['Apr', 500, 250],
        ['May', 450, 220],
        ['Jun', 600, 300],
        ['Jul', 550, 280]
    ]);

    var options = {
        title: 'Monthly Sales and Expenses',
        titleTextStyle: { color: themeColors.titleColor },
        backgroundColor: themeColors.bgColor, // Overall chart background
        chartArea: {
            backgroundColor: themeColors.bgColor // **FIXED**: Explicitly set chart area background
        },
        curveType: 'function',
        legend: {
            position: 'right',
            textStyle: { color: themeColors.textColor }
        },
        hAxis: {
            title: 'Month',
            textStyle: { color: themeColors.textColor },
            titleTextStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        vAxis: {
            title: 'Amount ($)',
            minValue: 0,
            textStyle: { color: themeColors.textColor },
            titleTextStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        colors: ['#2196F3', '#F44336'], // Custom colors for lines (kept consistent)
        pointSize: 5,
        animation: {
            startup: true,
            duration: 1200,
            easing: 'inAndOut'
        }
    };

    var chart = new google.charts.Line(document.getElementById('line_chart_div'));
    chart.draw(data, google.charts.Line.convertOptions(options));
}

// --- Pie Chart ---
function drawPieChart(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Browser', 'Users (Millions)'],
        ['Chrome', 65],
        ['Firefox', 15],
        ['Safari', 10],
        ['Edge', 7],
        ['Others', 3]
    ]);

    var options = {
        title: 'Global Browser Usage',
        titleTextStyle: { color: themeColors.titleColor },
        backgroundColor: themeColors.bgColor, // Overall chart background
        is3D: false, // **FIXED**: Changed to false for non-3D
        pieHole: 0.4, // Keep as donut chart
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9E9E9E'], // Custom colors for slices (kept consistent)
        legend: {
            position: 'labeled',
            textStyle: { color: themeColors.textColor }
        },
        sliceVisibilityThreshold: 0.05,
        chartArea: {
            width: '90%',
            height: '90%',
            backgroundColor: themeColors.bgColor // Chart area background for pie chart
        },
        tooltip: { trigger: 'focus' }
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie_chart_div'));
    chart.draw(data, options);
}