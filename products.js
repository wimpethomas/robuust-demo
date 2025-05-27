document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Select all checkboxes for the desktop table
    const selectAllDesktopCheckbox = document.getElementById('selectAllDesktop');
    const productCheckboxesDesktop = document.querySelectorAll('.product-checkbox-desktop');

    // Select the action buttons (now containing both save and drag handle)
    const actionButtons = document.querySelectorAll('.action-button');

    const typeFilter = document.getElementById('typeFilter');
    const groupFilter = document.getElementById('groupFilter');
    const departmentFilter = document.getElementById('departmentFilter');
    const searchInput = document.getElementById('searchDish');

    const productRows = document.querySelectorAll('.products-table tbody tr'); // All product rows

    // Modal elements
    const newProductModal = document.getElementById('newProductModal');
    const openModalBtn = document.getElementById('headerButton3'); // The '+' button
    const modalCloseBtn = document.getElementById('modalCloseBtn');
    const modalCancelBtn = document.getElementById('modalCancelBtn');
    const modalTabButtons = document.querySelectorAll('.modal-tab-btn');
    const modalContentSections = document.querySelectorAll('.modal-content-section');


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
        // Default to dark mode if no preference saved, matching initial state
        applyTheme('dark');
        localStorage.setItem('theme', 'dark');
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

    // --- Checkbox functionality ---
    if (selectAllDesktopCheckbox) {
        selectAllDesktopCheckbox.addEventListener('change', (event) => {
            productCheckboxesDesktop.forEach(checkbox => {
                checkbox.checked = event.target.checked;
            });
        });
    }

    productCheckboxesDesktop.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            if (selectAllDesktopCheckbox) {
                if (!checkbox.checked) {
                    selectAllDesktopCheckbox.checked = false;
                } else {
                    const allChecked = Array.from(productCheckboxesDesktop).every(cb => cb.checked);
                    selectAllDesktopCheckbox.checked = allChecked;
                }
            }
        });
    });

    // Action button click handler (now handles both save and drag handle)
    actionButtons.forEach(button => {
        button.addEventListener('click', (event) => {
            const row = event.target.closest('tr');
            const productId = row.dataset.productId;
            const productName = row.querySelector('td:nth-child(2)').textContent;

            // Check if the save icon is visible (desktop view) or drag handle (mobile view)
            if (window.innerWidth > 768) { // Assuming 768px is the breakpoint
                // Save functionality for desktop
                console.log(`Saving product: ${productName} (ID: ${productId})`);
                alert(`Saving "${productName}" (Functionality not implemented)`);
            } else {
                // Drag handle functionality for mobile
                console.log(`Dragging product: ${productName} (ID: ${productId})`);
                alert(`Drag action for "${productName}" (Functionality not implemented)`);
            }
        });
    });

    // Filter and search functionality
    function applyFilters() {
        const type = typeFilter.value.toLowerCase();
        const group = groupFilter.value.toLowerCase();
        const department = departmentFilter.value.toLowerCase();
        const searchTerm = searchInput.value.toLowerCase();

        productRows.forEach(row => {
            const name = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
            // Get data from data-attributes for consistency and robustness against hidden columns
            const rowType = row.dataset.type ? row.dataset.type.toLowerCase() : '';
            const rowGroup = row.dataset.group ? row.dataset.group.toLowerCase() : '';
            const rowDepartment = row.dataset.department ? row.dataset.department.toLowerCase() : '';

            const matchesType = type === '' || rowType.includes(type);
            const matchesGroup = group === '' || rowGroup.includes(group);
            const matchesDepartment = department === '' || rowDepartment.includes(department);
            const matchesSearch = name.includes(searchTerm);

            if (matchesType && matchesGroup && matchesDepartment && matchesSearch) {
                row.style.display = ''; // Show row
            } else {
                row.style.display = 'none'; // Hide row
            }
        });
    }

    // Add event listeners for filters and search
    typeFilter.addEventListener('change', applyFilters);
    groupFilter.addEventListener('change', applyFilters);
    departmentFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('keyup', applyFilters); // Use keyup for real-time search

    // Initial filter application in case default values are set
    applyFilters();

    // --- Modal functionality ---
    openModalBtn.addEventListener('click', () => {
        newProductModal.classList.add('visible');
    });

    modalCloseBtn.addEventListener('click', () => {
        newProductModal.classList.remove('visible');
    });

    modalCancelBtn.addEventListener('click', () => {
        newProductModal.classList.remove('visible');
    });

    // Close modal if overlay is clicked
    newProductModal.addEventListener('click', (event) => {
        if (event.target === newProductModal) {
            newProductModal.classList.remove('visible');
        }
    });

    // Tab switching within modal
    modalTabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove 'active' from all buttons and sections
            modalTabButtons.forEach(btn => btn.classList.remove('active'));
            modalContentSections.forEach(section => section.classList.remove('active'));

            // Add 'active' to the clicked button
            button.classList.add('active');

            // Show the corresponding content section
            const targetTabId = button.dataset.tab + '-tab'; // e.g., 'main' -> 'main-tab'
            document.getElementById(targetTabId).classList.add('active');
        });
    });

    // Initialize first tab as active when modal is opened (or on page load if visible by default)
    // For this setup, we'll keep it simple and just ensure the 'main' tab is active by default in HTML/CSS
    // and rely on the click handler for switching.
});