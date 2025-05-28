// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['corechart', 'bar', 'line']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(initializePage);

function initializePage() {
    const darkModeButton = document.getElementById('darkModeButton'); // New dark mode button
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDatesButton = document.getElementById('applyDates');

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
        drawAllCharts();
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
}

function drawAllCharts() {
    const isDarkMode = document.body.classList.contains('dark-mode');

    // Fetch colors from CSS variables to ensure consistency
    const chartThemeColors = {
        bgColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-bg-google').replace(/'/g, '').trim(),
        textColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-text-google').replace(/'/g, '').trim(),
        gridColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-grid-google').replace(/'/g, '').trim(),
        titleColor: getComputedStyle(document.documentElement).getPropertyValue('--chart-title-google').replace(/'/g, '').trim()
    };

    drawBarChart(chartThemeColors);
    drawPieChartCategory(chartThemeColors);
    drawPieChartMonth(chartThemeColors);
    drawPieChartDepartment(chartThemeColors);
}

// --- Bar Chart (Omzet per dag) ---
function drawBarChart(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Dag', 'Omzet'],
        ['Ma', 100],
        ['Di', 150],
        ['Wo', 80],
        ['Do', 200],
        ['Vr', 120],
        ['Za', 250],
        ['Zo', 180],
        ['Ma', 130],
        ['Di', 190],
        ['Wo', 100],
        ['Do', 220],
        ['Vr', 140],
        ['Za', 270],
        ['Zo', 200]
    ]);

    var options = {
        chartArea: {
            width: '90%',
            height: '80%',
            backgroundColor: themeColors.bgColor
        },
        backgroundColor: themeColors.bgColor,
        hAxis: {
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor },
            baselineColor: themeColors.gridColor
        },
        vAxis: {
            minValue: 0,
            textStyle: { color: themeColors.textColor },
            gridlines: { color: themeColors.gridColor },
            baselineColor: themeColors.gridColor
        },
        colors: ['#4285F4'],
        legend: { position: 'none' },
        animation: {
            startup: true,
            duration: 1000,
            easing: 'out'
        },
        bar: { groupWidth: '80%' }
    };

    var chart = new google.charts.Bar(document.getElementById('bar_chart_div'));
    chart.draw(data, google.charts.Bar.convertOptions(options));
}

// --- Pie Chart (Omzet per categorie) ---
function drawPieChartCategory(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Categorie', 'Omzet'],
        ['Drinks', 35],
        ['Food', 45],
        ['Desserts', 10],
        ['Appetizers', 10]
    ]);

    var options = {
        backgroundColor: themeColors.bgColor,
        pieHole: 0.4,
        colors: ['#3f51b5', '#2196f3', '#4CAF50', '#FF9800'],
        legend: {
            position: 'labeled',
            textStyle: { color: themeColors.textColor }
        },
        sliceVisibilityThreshold: 0,
        chartArea: {
            width: '90%',
            height: '90%',
            backgroundColor: themeColors.bgColor
        },
        tooltip: { trigger: 'focus' },
        fontName: 'Inter'
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie_chart_category_div'));
    chart.draw(data, options);
}

// --- Pie Chart (Omzet per maand) ---
function drawPieChartMonth(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Maand', 'Omzet'],
        ['Jan', 15],
        ['Feb', 20],
        ['Mar', 25],
        ['Apr', 20],
        ['May', 20]
    ]);

    var options = {
        backgroundColor: themeColors.bgColor,
        pieHole: 0.4,
        colors: ['#3f51b5', '#2196f3', '#4CAF50', '#FF9800', '#9c27b0'],
        legend: {
            position: 'labeled',
            textStyle: { color: themeColors.textColor }
        },
        sliceVisibilityThreshold: 0,
        chartArea: {
            width: '90%',
            height: '90%',
            backgroundColor: themeColors.bgColor
        },
        tooltip: { trigger: 'focus' },
        fontName: 'Inter'
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie_chart_month_div'));
    chart.draw(data, options);
}

// --- Pie Chart (Omzet per afdeling) ---
function drawPieChartDepartment(themeColors) {
    var data = google.visualization.arrayToDataTable([
        ['Afdeling', 'Omzet'],
        ['Keuken', 50],
        ['Bar', 30],
        ['Zaal', 20]
    ]);

    var options = {
        backgroundColor: themeColors.bgColor,
        pieHole: 0.4,
        colors: ['#3f51b5', '#2196f3', '#4CAF50'],
        legend: {
            position: 'labeled',
            textStyle: { color: themeColors.textColor }
        },
        sliceVisibilityThreshold: 0,
        chartArea: {
            width: '90%',
            height: '90%',
            backgroundColor: themeColors.bgColor
        },
        tooltip: { trigger: 'focus' },
        fontName: 'Inter'
    };

    var chart = new google.visualization.PieChart(document.getElementById('pie_chart_department_div'));
    chart.draw(data, options);
}