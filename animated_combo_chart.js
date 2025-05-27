// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['corechart']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(initializePage);

function initializePage() {
    // Get references for theme toggle
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Function to apply the theme to the body and redraw the chart
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
        // Redraw the chart with updated theme-specific options
        drawAnimatedComboChart();
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

    // Initial draw of the chart (will be re-drawn by applyTheme)
    drawAnimatedComboChart();
}


function drawAnimatedComboChart() {
    // Determine if dark mode is currently active
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Define colors based on the current theme
    const chartBgColor = isDarkMode ? '#16213e' : '#ffffff';
    const chartTextColor = isDarkMode ? '#b0b0b0' : '#666';
    const chartGridColor = isDarkMode ? '#3a3a5f' : '#e0e0e0';
    const chartTitleColor = isDarkMode ? '#e0e0e0' : '#333';


    // Create the data table.
    var data = google.visualization.arrayToDataTable([
        // Headers: Month, Sales (Bar), Expenses (Bar), Profit (Bar), Target (Line)
        ['Month', 'Sales', 'Expenses', 'Profit', 'Target'],
        ['Jan',  165,      938,         522,      700],
        ['Feb',  135,      1120,        599,      800],
        ['Mar',  157,      1167,        587,      850],
        ['Apr',  139,      1110,        615,      800],
        ['May',  136,      691,         629,      900]
    ]);

    // Set chart options, dynamically setting colors based on theme
    var options = {
        title : 'Monthly Sales, Expenses, Profit, and Target',
        titleTextStyle: {
            color: chartTitleColor,
            fontSize: 18,
            bold: true
        },
        backgroundColor: chartBgColor, // Chart background color
        vAxis: {
            title: 'Amount ($)',
            minValue: 0,
            gridlines: {
                color: chartGridColor // Grid lines color
            },
            textStyle: {
                color: chartTextColor // Y-axis label text color
            },
            titleTextStyle: {
                color: chartTextColor // Y-axis title text color
            }
        },
        hAxis: {
            title: 'Month',
            textStyle: {
                color: chartTextColor // X-axis label text color
            },
            titleTextStyle: {
                color: chartTextColor // X-axis title text color
            }
        },
        legend: {
            position: 'bottom',
            textStyle: {
                color: chartTextColor // Legend text color
            }
        },
        seriesType: 'bars', // Default all series to bars
        series: {
            // Series 0: Sales (Bar) - green
            // Series 1: Expenses (Bar) - yellow
            // Series 2: Profit (Bar) - blue
            // Series 3: Target (Line) - orange
            3: {
                type: 'line',
                color: '#FF5722', // Line color (kept distinct, not themed)
                lineWidth: 4,
                pointSize: 8,
                curveType: 'function'
            }
        },
        colors: ['#4CAF50', '#FFC107', '#2196F3'], // Colors for Sales, Expenses, Profit bars (kept distinct)
        chartArea: {
            left: 80,
            top: 60,
            right: 20,
            bottom: 80,
            width: '80%',
            height: '70%'
        },
        animation: {
            duration: 1500,
            easing: 'inAndOut',
            startup: true
        },
        tooltip: {
            trigger: 'focus'
        }
    };

    // Instantiate and draw our chart, passing in the data and options.
    var chart = new google.visualization.ComboChart(document.getElementById('animated_combo_chart_div'));
    chart.draw(data, options);
}