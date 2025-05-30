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
});