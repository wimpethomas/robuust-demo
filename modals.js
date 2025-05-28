document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // --- Dark Mode Toggle Logic (Consistent across pages) ---
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('theme', theme);
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        applyTheme('light'); // Default to light mode
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Modal Logic ---
    const openModalBtns = document.querySelectorAll('.open-modal-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal-btn');
    const modalOverlays = document.querySelectorAll('.modal-overlay');

    // Function to open a specific modal
    function openModal(modalId) {
        const modalOverlay = document.getElementById(`${modalId}Overlay`);
        if (modalOverlay) {
            modalOverlay.style.display = 'flex';
            document.body.classList.add('modal-open'); // Prevent scrolling
            // Focus on the modal for accessibility
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.focus();
            }
        }
    }

    // Function to close a specific modal
    function closeModal(modalId) {
        const modalOverlay = document.getElementById(`${modalId}Overlay`);
        if (modalOverlay) {
            modalOverlay.style.display = 'none';
            document.body.classList.remove('modal-open'); // Re-enable scrolling
        }
    }

    // Event listeners for opening modals
    openModalBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.currentTarget.dataset.modalId;
            openModal(modalId);
        });
    });

    // Event listeners for closing modals
    closeModalBtns.forEach(button => {
        button.addEventListener('click', (event) => {
            const modalId = event.currentTarget.dataset.modalId;
            closeModal(modalId);
        });
    });

    // Close modal when clicking outside the modal content (on the overlay)
    modalOverlays.forEach(overlay => {
        overlay.addEventListener('click', (event) => {
            if (event.target === overlay) {
                const modalId = overlay.id.replace('Overlay', '');
                closeModal(modalId);
            }
        });
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            modalOverlays.forEach(overlay => {
                if (overlay.style.display === 'flex') { // Find the currently open modal
                    const modalId = overlay.id.replace('Overlay', '');
                    closeModal(modalId);
                }
            });
        }
    });
});