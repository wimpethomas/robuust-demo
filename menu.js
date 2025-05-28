document.addEventListener('DOMContentLoaded', () => {
    // Get references for sidebar elements
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const closeSidebarButton = document.getElementById('closeSidebar');
    const pageWrapper = document.querySelector('.page-container'); // To add overlay for content

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
});