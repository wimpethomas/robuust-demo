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
    drawComboChart(chartThemeColors);
}

// --- Bar Chart ---
function drawBarChart(themeColors) {
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

    var options = {
        chartArea: {
            width: '70%',
            height: '80%',
            backgroundColor: themeColors.bgColor
        },
        backgroundColor: themeColors.bgColor,
        hAxis: {
            minValue: 0,
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        vAxis: {
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        colors: ['#4CAF50', '#FF9800'],
        legend: { position: 'none' },
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
        backgroundColor: themeColors.bgColor,
        chartArea: {
            backgroundColor: themeColors.bgColor,
            height: '80%'
        },
        curveType: 'function',
        legend: { position: 'none' },
        hAxis: {
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        vAxis: {
            minValue: 0,
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor }
        },
        colors: ['#2196F3', '#F44336'],
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
        backgroundColor: themeColors.bgColor,
        is3D: false,
        pieHole: 0.4,
        colors: ['#4285F4', '#EA4335', '#FBBC05', '#34A853', '#9E9E9E'],
        legend: { position: 'none' },
        sliceVisibilityThreshold: 0.05,
        chartArea: {
            width: '90%',
            height: '90%',
            backgroundColor: themeColors.bgColor
        },
        tooltip: { trigger: 'focus' }
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie_chart_div'));
    chart.draw(data, options);
}

// --- Combo Chart ---
function drawComboChart(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Point', 'Primary Metric', 'Secondary Metric', 'Overall Trend'],
        ['0', 20, null, 7],
        ['100', null, 17, 8],
        ['08', 21, null, 9],
        ['180', null, 18, 8],
        ['100*', null, 14, 8.5],
        ['40', 19, null, 11],
        ['196', null, 11, 14],
        ['160', 18, null, 17],
        ['200', null, 13, 18],
        ['240', null, 20, 17],
        ['280', 12, null, 13],
        ['320', null, 10, 11],
        ['360', 8, null, 10],
        ['400', null, 9, 9.5]
    ]);

    var options = {
        vAxis: {
            minValue: 0,
            maxValue: 25,
            gridlines: { color: themeColors.gridColor },
            textStyle: { color: themeColors.textColor }
        },
        hAxis: {
            textStyle: { color: themeColors.textColor }
        },
        legend: { position: 'none' },
        seriesType: 'bars',
        series: {
            0: { color: '#3f51b5' },
            1: { color: '#9fa8da' },
            2: {
                type: 'line',
                color: '#2196f3',
                curveType: 'function',
                lineWidth: 3,
                pointSize: 6
            }
        },
        chartArea: {
            left: 40,   // Adjusted: Reduced left padding
            top: 40,    // Adjusted: Reduced top padding
            right: 20,  // Adjusted: Reduced right padding slightly
            bottom: 40, // Adjusted: Reduced bottom padding
            width: '90%', // Adjusted: Increased width percentage
            height: '80%', // Adjusted: Increased height percentage for better fill
            backgroundColor: themeColors.bgColor
        },
        backgroundColor: themeColors.bgColor,
        animation: {
            startup: true,
            duration: 1500,
            easing: 'out'
        },
        tooltip: { isHtml: false }
    };

    var chart = new google.visualization.ComboChart(document.getElementById('combo_chart_div'));
    chart.draw(data, options);
}