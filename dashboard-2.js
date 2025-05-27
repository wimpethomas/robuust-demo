// Load the Visualization API and the corechart package.
google.charts.load('current', {'packages': ['corechart', 'bar', 'line']});

// Set a callback to run when the Google Visualization API is loaded.
google.charts.setOnLoadCallback(initializePage);

function initializePage() {
    // Get references for theme toggle
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Get references for sidebar elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const pageWrapper = document.querySelector('.page-wrapper'); // To add overlay for content

    // Create and append overlay
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    pageWrapper.appendChild(overlay); // Append to the page-wrapper to be correctly positioned

    // Function to toggle sidebar
    function toggleSidebar() {
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active'); // Toggle overlay visibility
    }

    // Event listener for menu toggle button
    menuToggle.addEventListener('click', toggleSidebar);

    // Event listener for close sidebar button
    closeSidebarButton.addEventListener('click', toggleSidebar);

    // Close sidebar when clicking outside on the overlay
    overlay.addEventListener('click', toggleSidebar);


    // Handle submenu expansion
    const submenuToggles = document.querySelectorAll('.has-submenu');
    submenuToggles.forEach(toggle => {
        toggle.addEventListener('click', function(event) {
            event.preventDefault(); // Prevent default link behavior
            const submenu = this.nextElementSibling; // Get the next sibling, which should be the submenu
            if (submenu && submenu.classList.contains('submenu')) {
                this.classList.toggle('expanded');
                submenu.classList.toggle('expanded');
            }
        });
    });


    // Function to get theme-dependent chart colors
    function getThemeColors() {
        const isDarkMode = body.classList.contains('dark-mode');
        // Retrieve CSS variables from the document's root element
        const rootStyles = getComputedStyle(document.documentElement);
        return {
            bgColor: isDarkMode ? rootStyles.getPropertyValue('--chart-bg-google').trim().replace(/'/g, '') : '#ffffff',
            textColor: isDarkMode ? rootStyles.getPropertyValue('--chart-text-google').trim().replace(/'/g, '') : '#666',
            gridColor: isDarkMode ? rootStyles.getPropertyValue('--chart-grid-google').trim().replace(/'/g, '') : '#e0e0e0',
            titleColor: isDarkMode ? rootStyles.getPropertyValue('--chart-title-google').trim().replace(/'/g, '') : '#333'
        };
    }

    // Function to draw the Line Chart (Daily Sales Trend)
    function drawLineChart() {
        const themeColors = getThemeColors();
        var data = google.visualization.arrayToDataTable([
            ['Day', 'Sales'],
            ['Mon', 1000],
            ['Tue', 1170],
            ['Wed', 660],
            ['Thu', 1030],
            ['Fri', 900],
            ['Sat', 1200],
            ['Sun', 1300]
        ]);

        var options = {
            title: 'Daily Sales',
            curveType: 'function',
            legend: { position: 'none' },
            colors: ['#007bff'], // Accent color for the line
            backgroundColor: themeColors.bgColor,
            chartArea: {
                left: 40,
                top: 20,
                right: 20,
                bottom: 40,
                width: '90%',
                height: '80%',
                backgroundColor: themeColors.bgColor
            },
            hAxis: {
                textStyle: { color: themeColors.textColor }
            },
            vAxis: {
                minValue: 0,
                gridlines: { color: themeColors.gridColor },
                textStyle: { color: themeColors.textColor }
            },
            tooltip: { isHtml: false },
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out'
            }
        };

        var chart = new google.visualization.LineChart(document.getElementById('line_chart_div'));
        chart.draw(data, options);
    }

    // Function to draw the Pie Chart (Browser Usage Share)
    function drawPieChart() {
        const themeColors = getThemeColors();
        var data = google.visualization.arrayToDataTable([
            ['Browser', 'Usage'],
            ['Chrome', 55],
            ['Firefox', 20],
            ['Safari', 15],
            ['Edge', 7],
            ['Other', 3]
        ]);

        var options = {
            title: 'Browser Usage Share',
            pieHole: 0.4, // Donut chart
            colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#6c757d'], // Custom colors
            backgroundColor: themeColors.bgColor,
            legend: {
                textStyle: { color: themeColors.textColor }
            },
            pieSliceTextStyle: {
                color: 'black', // Ensure slice labels are readable
            },
            tooltip: { isHtml: false },
            animation: {
                startup: true,
                duration: 1000,
                easing: 'out'
            }
        };

        var chart = new google.visualization.PieChart(document.getElementById('pie_chart_div'));
        chart.draw(data, options);
    }

    // Function to draw the Combo Chart (Monthly Metrics & Trend)
    function drawComboChart() {
        const themeColors = getThemeColors();
        var data = google.visualization.arrayToDataTable([
            ['Month', 'Sales', 'Expenses', 'Profit'],
            ['Jan', 15, 8, 7],
            ['Feb', 18, 9, 9],
            ['Mar', 12, 6, 6],
            ['Apr', 20, 10, 10],
            ['May', 22, 11, 11],
            ['Jun', 19, 9.5, 9.5],
            ['Jul', 23, 11.5, 11.5],
            ['Aug', 20, 10, 10],
            ['Sep', 25, 12, 13],
            ['Oct', 21, 10.5, 10.5],
            ['Nov', 24, 12, 12],
            ['Dec', 26, 13, 13]
        ]);

        var options = {
            vAxis: {
                minValue: 0,
                maxValue: 30,
                gridlines: { color: themeColors.gridColor },
                textStyle: { color: themeColors.textColor }
            },
            hAxis: {
                textStyle: { color: themeColors.textColor }
            },
            legend: {
                position: 'bottom',
                textStyle: { color: themeColors.textColor }
            },
            seriesType: 'bars',
            series: {
                0: { color: '#007bff' }, // Sales bars
                1: { color: '#ffc107' }, // Expenses bars
                2: { // Profit line
                    type: 'line',
                    color: '#28a745',
                    curveType: 'function',
                    lineWidth: 3,
                    pointSize: 6
                }
            },
            chartArea: {
                left: 40,
                top: 20,
                right: 20,
                bottom: 60, // Adjusted to make space for legend at the bottom
                width: '90%',
                height: '75%', // Adjusted height
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

    // Function to draw all charts
    function drawAllCharts() {
        drawLineChart();
        drawPieChart();
        drawComboChart();
    }

    // Function to apply the theme to the body and redraw all charts
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
        // Save preference to localStorage
        localStorage.setItem('theme', theme);

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
        } else {
            applyTheme('light');
        }
    });

    // Ensure charts redraw on window resize for responsiveness
    window.addEventListener('resize', drawAllCharts);
}