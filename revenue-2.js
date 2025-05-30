document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const darkModeButton = document.getElementById('darkModeButton');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const lastUpdateDateTime = document.getElementById('lastUpdateDateTime');

    // --- Dark Mode Toggle Logic (Consistent across pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeButton) {
                darkModeButton.innerHTML = '<i class="fas fa-sun"></i>'; // Sun icon for light mode
                darkModeButton.setAttribute('aria-label', 'Switch to Light Mode');
            }
        } else {
            body.classList.remove('dark-mode');
            if (darkModeButton) {
                darkModeButton.innerHTML = '<i class="fas fa-moon"></i>'; // Moon icon for dark mode
                darkModeButton.setAttribute('aria-label', 'Switch to Dark Mode');
            }
        }
        localStorage.setItem('theme', theme);
    }

    // Apply saved theme on load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('dark'); // Default to dark mode if no preference
    }

    // Event listener for the dark mode button
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

    // --- Date Inputs and Last Update ---
    // Set default date range to "today" or a relevant period
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    startDateInput.value = yesterday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    endDateInput.value = today.toISOString().split('T')[0];

    // Update last update time dynamically
    function updateLastUpdate() {
        const now = new Date();
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true };
        lastUpdateDateTime.textContent = now.toLocaleDateString('en-US', options);
    }

    updateLastUpdate();
    // You could set an interval to update this every minute if desired
    // setInterval(updateLastUpdate, 60 * 1000);

    // Add event listeners for date changes (no complex logic needed per request)
    startDateInput.addEventListener('change', () => {
        // You could add validation here: startDate <= endDate
        console.log('Start Date changed to:', startDateInput.value);
    });

    endDateInput.addEventListener('change', () => {
        // You could add validation here: endDate >= startDate
        console.log('End Date changed to:', endDateInput.value);
    });

    // Room Filter (no functionality needed, just visual)
    const roomFilter = document.getElementById('roomFilter');
    roomFilter.addEventListener('change', () => {
        console.log('Room filter changed to:', roomFilter.value);
    });

    // Placeholder for any future chart/data fetching logic
    // const fetchRevenueData = () => {
    //     console.log('Fetching revenue data for:', startDateInput.value, 'to', endDateInput.value, 'for room:', roomFilter.value);
    //     // In a real app, this would fetch data and update charts/tables
    // };

    // Initial data load (if any actual data were to be displayed)
    // fetchRevenueData();
});