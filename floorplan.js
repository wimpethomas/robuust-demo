document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDatesButton = document.getElementById('applyDates');

    // Function to apply the theme
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            themeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            themeToggle.checked = false;
        }
    }

    // Check for saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to dark mode if no preference saved
        applyTheme('dark');
        localStorage.setItem('theme', 'dark'); // Save dark mode as default
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

    // Set default dates (e.g., today's date for a floorplan/reservation system)
    const today = new Date();
    const todayString = today.toISOString().split('T')[0];
    startDateInput.value = todayString;
    endDateInput.value = todayString;

    // Add event listener for the Apply Dates button
    applyDatesButton.addEventListener('click', () => {
        const startDate = startDateInput.value;
        const endDate = endDateInput.value;
        console.log(`Selected Date Range: ${startDate} to ${endDate} for Floorplan`);
        // In a real application, you would filter floorplan data or reservations here
        // based on the selected dates.
        alert(`Floorplan for ${startDate} to ${endDate} applied! (Functionality not implemented)`);
    });
});