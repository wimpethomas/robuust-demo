document.addEventListener('DOMContentLoaded', () => {
  const body = document.body;
  const robuustModal = document.getElementById('robuustModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const cancelModalBtn = document.getElementById('cancelModalBtn');
  const addBtn = document.getElementById('addBtn');
  const modalTabButtons = document.querySelectorAll('.modal-tab-btn');
  const modalContentSections = document.querySelectorAll('.modal-content-section');

  // Form elements
  const form = document.getElementById('form');
  const idInput = document.getElementById('id');
  const guestNameInput = document.getElementById('guestName');
  const guestsInput = document.getElementById('guests');
  const dateInput = document.getElementById('date');
  const timeInput = document.getElementById('time');
  const durationInput = document.getElementById('duration');
  const tableSelect = document.getElementById('tableSelect');
  const notesInput = document.getElementById('notes');

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

  // --- Modal Functions ---
  // Modal related event listeners
  addBtn.addEventListener('click', () => {
    openModal(); // Open modal for new reservation
  });  

  function openModal() {
    robuustModal.classList.add('visible');
    modalOverlay.classList.add('visible');
    body.style.overflow = 'hidden'; // Prevent scrolling of background content
    deleteBtn.style.display = 'none'; // Hide delete button for new
  }

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

  function closeModal() {
    robuustModal.classList.remove('visible');
    modalOverlay.classList.remove('visible');
    body.style.overflow = ''; // Allow scrolling again
  }

  closeModalBtn.addEventListener('click', closeModal);
  cancelModalBtn.addEventListener('click', closeModal);
  modalOverlay.addEventListener('click', (event) => {
    if (event.target === modalOverlay) { // Only close if overlay itself is clicked, not modal content
      closeModal();
    }
  });
});