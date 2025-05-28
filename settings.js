document.addEventListener('DOMContentLoaded', () => {
    const body = document.body;
    const darkModeButton = document.getElementById('darkModeButton'); // New dark mode button
    const settingsDarkModeToggle = document.getElementById('darkModeSetting'); // Setting page specific toggle

    // --- Dark Mode Logic (Consistent across pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            if (darkModeButton) {
                // Show sun icon for light mode (because clicking it will switch to light)
                darkModeButton.innerHTML = '<i class="fas fa-sun"></i>';
                darkModeButton.setAttribute('aria-label', 'Switch to Light Mode');
            }
            if (settingsDarkModeToggle) settingsDarkModeToggle.checked = true; // Sync settings toggle
        } else {
            body.classList.remove('dark-mode');
            if (darkModeButton) {
                // Show moon icon for dark mode (because clicking it will switch to dark)
                darkModeButton.innerHTML = '<i class="fas fa-moon"></i>';
                darkModeButton.setAttribute('aria-label', 'Switch to Dark Mode');
            }
            if (settingsDarkModeToggle) settingsDarkModeToggle.checked = false; // Sync settings toggle
        }
        localStorage.setItem('theme', theme);
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

    // Event listener for the settings page dark mode toggle (to keep in sync with the button)
    if (settingsDarkModeToggle) {
        settingsDarkModeToggle.addEventListener('change', () => {
            if (settingsDarkModeToggle.checked) {
                applyTheme('dark');
            } else {
                applyTheme('light');
            }
        });
    }

    // --- General Toggle Logic (Save state to LocalStorage) ---
    const toggles = document.querySelectorAll('.toggle-checkbox');
    toggles.forEach(toggle => {
        const settingId = toggle.id;
        const savedState = localStorage.getItem(settingId);
        if (savedState !== null) {
            toggle.checked = JSON.parse(savedState);
        }

        toggle.addEventListener('change', () => {
            localStorage.setItem(settingId, toggle.checked);
            console.log(`${settingId} is now ${toggle.checked}`);
            // Add any specific logic for the toggle here (e.g., enable/disable notifications)
        });
    });

    // --- Clickable List Logic ---
    const clickableLists = document.querySelectorAll('.settings-list.clickable-list li');
    clickableLists.forEach(item => {
        item.addEventListener('click', () => {
            const settingName = item.querySelector('span').textContent;
            alert(`Navigating to: ${settingName}`);
            // In a real application, you would navigate to another page or open a specific modal here.
        });
    });

    // --- Single Select List Logic ---
    const singleSelectLists = document.querySelectorAll('.settings-list.single-select-list');
    singleSelectLists.forEach(list => {
        const items = list.querySelectorAll('li');
        const localStorageKey = list.id || 'singleSelectSetting';
        let selectedValue = localStorage.getItem(localStorageKey);

        if (!selectedValue && items.length > 0) {
            selectedValue = items[0].dataset.value;
            localStorage.setItem(localStorageKey, selectedValue);
        }

        items.forEach(item => {
            if (item.dataset.value === selectedValue) {
                item.classList.add('selected');
                const checkIcon = item.querySelector('.fas.fa-check');
                if (checkIcon) checkIcon.style.display = 'inline-block';
            } else {
                const checkIcon = item.querySelector('.fas.fa-check');
                if (checkIcon) checkIcon.style.display = 'none';
            }

            item.addEventListener('click', () => {
                items.forEach(i => {
                    i.classList.remove('selected');
                    const icon = i.querySelector('.fas.fa-check');
                    if (icon) icon.style.display = 'none';
                });

                item.classList.add('selected');
                const clickedCheckIcon = item.querySelector('.fas.fa-check');
                if (clickedCheckIcon) clickedCheckIcon.style.display = 'inline-block';

                const newValue = item.dataset.value;
                localStorage.setItem(localStorageKey, newValue);
                console.log(`Single select value changed to: ${newValue}`);
            });
        });
    });

    // --- Multiselect Dropdown Logic (for 'Select Report Types') ---
    const reportTypesDropdown = document.querySelector('.multiselect-options-display');
    if (reportTypesDropdown) {
        const displayArea = reportTypesDropdown.querySelector('.multiselect-display-area');
        const optionsContainer = reportTypesDropdown.querySelector('.multiselect-options-container');
        const checkboxes = optionsContainer.querySelectorAll('.multiselect-checkbox-list input[type="checkbox"]');
        const settingId = 'reportTypesSelected';

        const updateMultiselectDisplay = () => {
            const selectedOptionsText = [];
            checkboxes.forEach(checkbox => {
                if (checkbox.checked) {
                    selectedOptionsText.push(checkbox.parentNode.textContent.trim());
                }
            });

            if (selectedOptionsText.length === 0) {
                displayArea.textContent = 'Select report types...';
                displayArea.classList.remove('selected-items');
            } else {
                displayArea.textContent = selectedOptionsText.join(', ');
                displayArea.classList.add('selected-items');
            }
            const selectedValues = Array.from(checkboxes)
                                    .filter(cb => cb.checked)
                                    .map(cb => cb.dataset.value);
            localStorage.setItem(settingId, JSON.stringify(selectedValues));
        };

        const savedReportTypes = JSON.parse(localStorage.getItem(settingId));
        if (savedReportTypes) {
            checkboxes.forEach(checkbox => {
                if (savedReportTypes.includes(checkbox.dataset.value)) {
                    checkbox.checked = true;
                }
            });
        }
        updateMultiselectDisplay();

        displayArea.addEventListener('click', () => {
            const isShown = optionsContainer.classList.toggle('show');
            displayArea.setAttribute('aria-expanded', isShown);
            if (isShown) {
                const firstCheckbox = optionsContainer.querySelector('.multiselect-checkbox-list input[type="checkbox"]');
                if (firstCheckbox) firstCheckbox.focus();
            }
        });

        const multiselectArrow = reportTypesDropdown.querySelector('.multiselect-arrow');
        if (multiselectArrow) {
            multiselectArrow.addEventListener('click', (e) => {
                e.stopPropagation();
                const isShown = optionsContainer.classList.toggle('show');
                displayArea.setAttribute('aria-expanded', isShown);
                if (isShown) {
                    const firstCheckbox = optionsContainer.querySelector('.multiselect-checkbox-list input[type="checkbox"]');
                    if (firstCheckbox) firstCheckbox.focus();
                }
            });
        }

        checkboxes.forEach(checkbox => {
            checkbox.addEventListener('change', updateMultiselectDisplay);
        });

        document.addEventListener('click', (event) => {
            if (!reportTypesDropdown.contains(event.target)) {
                optionsContainer.classList.remove('show');
                displayArea.setAttribute('aria-expanded', 'false');
            }
        });

        displayArea.addEventListener('keydown', (event) => {
            if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                displayArea.click();
            }
        });

        optionsContainer.addEventListener('keydown', (event) => {
            const focusableCheckboxes = Array.from(checkboxes).filter(cb => !cb.disabled);
            const currentFocusIndex = focusableCheckboxes.findIndex(cb => cb === document.activeElement);

            if (event.key === 'ArrowDown') {
                event.preventDefault();
                const nextIndex = (currentFocusIndex + 1) % focusableCheckboxes.length;
                focusableCheckboxes[nextIndex].focus();
            } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                const prevIndex = (currentFocusIndex - 1 + focusableCheckboxes.length) % focusableCheckboxes.length;
                focusableCheckboxes[prevIndex].focus();
            } else if (event.key === 'Escape') {
                event.preventDefault();
                optionsContainer.classList.remove('show');
                displayArea.setAttribute('aria-expanded', 'false');
                displayArea.focus();
            } else if (event.key === 'Enter' || event.key === ' ') {
                if (document.activeElement.type === 'checkbox') {
                    document.activeElement.checked = !document.activeElement.checked;
                    updateMultiselectDisplay();
                    event.preventDefault();
                }
            }
        });
    }

    // --- About List external link ---
    const licenseLinkItem = document.querySelector('.settings-list.about-list li:last-child');
    if (licenseLinkItem) {
        licenseLinkItem.addEventListener('click', () => {
            window.open('https://www.google.com/search?q=license+information', '_blank');
        });
        const licenseIcon = licenseLinkItem.querySelector('.fas.fa-external-link-alt');
        if (licenseIcon) {
            licenseIcon.style.pointerEvents = 'none';
        }
    }

    // --- Back button functionality ---
    const backButton = document.querySelector('.header-left .fa-arrow-left');
    if (backButton) {
        backButton.addEventListener('click', () => {
            history.back();
        });
    }
});