document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const guestTypeFilter = document.getElementById('guestTypeFilter');
    const lastVisitFilter = document.getElementById('lastVisitFilter');
    const guestSearchInput = document.getElementById('guestSearch');
    const guestsTableBody = document.querySelector('.guests-table tbody');

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
        applyTheme('dark'); // Default to dark mode
    }

    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // --- Sample Guest Data (based on "Guests.png") ---
    const guestsData = [
        { id: 'GUEST001', name: 'M. de Vries', email: 'm.devries@example.com', phone: '06-12345678', visits: 15, lastVisit: '2024-05-20', loyaltyPoints: 250, type: 'Regular' },
        { id: 'GUEST002', name: 'A. Jansen', email: 'a.jansen@example.com', phone: '06-87654321', visits: 10, lastVisit: '2024-04-10', loyaltyPoints: 180, type: 'Regular' },
        { id: 'GUEST003', name: 'S. Bakker', email: 's.bakker@example.com', phone: '06-11223344', visits: 2, lastVisit: '2024-05-25', loyaltyPoints: 30, type: 'New' },
        { id: 'GUEST004', name: 'J. Peeters', email: 'j.peeters@example.com', phone: '06-99887766', visits: 25, lastVisit: '2024-05-01', loyaltyPoints: 500, type: 'VIP' },
        { id: 'GUEST005', name: 'L. Smit', email: 'l.smit@example.com', phone: '06-22334455', visits: 7, lastVisit: '2024-03-15', loyaltyPoints: 100, type: 'Regular' },
        { id: 'GUEST006', name: 'B. Meijer', email: 'b.meijer@example.com', phone: '06-33445566', visits: 1, lastVisit: '2024-05-27', loyaltyPoints: 10, type: 'New' },
        { id: 'GUEST007', name: 'C. Wouters', email: 'c.wouters@example.com', phone: '06-44556677', visits: 12, lastVisit: '2023-11-01', loyaltyPoints: 200, type: 'Regular' },
        { id: 'GUEST008', name: 'D. Visser', email: 'd.visser@example.com', phone: '06-55667788', visits: 30, lastVisit: '2024-01-20', loyaltyPoints: 600, type: 'VIP' },
    ];

    // --- Helper function to check if date is within range ---
    function isDateWithinRange(dateStr, range) {
        const visitDate = new Date(dateStr);
        const now = new Date();
        let oldestDate;

        switch (range) {
            case 'all': return true;
            case 'month':
                oldestDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
                return visitDate >= oldestDate;
            case '3months':
                oldestDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
                return visitDate >= oldestDate;
            case 'year':
                oldestDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
                return visitDate >= oldestDate;
            default: return true;
        }
    }

    // --- Render Guests Table ---
    function renderGuests() {
        const selectedGuestType = guestTypeFilter.value;
        const selectedLastVisit = lastVisitFilter.value;
        const searchTerm = guestSearchInput.value.toLowerCase();

        guestsTableBody.innerHTML = ''; // Clear existing rows

        const filteredGuests = guestsData.filter(guest => {
            const matchesType = selectedGuestType === 'all' || guest.type.toLowerCase() === selectedGuestType;
            const matchesLastVisit = isDateWithinRange(guest.lastVisit, selectedLastVisit);
            
            const matchesSearchTerm = Object.values(guest).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );

            return matchesType && matchesLastVisit && matchesSearchTerm;
        }).sort((a, b) => new Date(b.lastVisit) - new Date(a.lastVisit)); // Sort by last visit descending

        if (filteredGuests.length === 0) {
            guestsTableBody.innerHTML = '<tr><td colspan="9" style="text-align: center; color: var(--subtitle-color);">No guests found for the selected criteria.</td></tr>';
            return;
        }

        filteredGuests.forEach(guest => {
            const row = guestsTableBody.insertRow();
            row.insertCell().textContent = guest.id;
            row.insertCell().textContent = guest.name;
            row.insertCell().textContent = guest.email;
            row.insertCell().textContent = guest.phone;
            row.insertCell().textContent = guest.visits;
            row.insertCell().textContent = guest.lastVisit;
            row.insertCell().textContent = guest.loyaltyPoints;
            row.insertCell().textContent = guest.type;
            
            // Actions cell
            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.innerHTML = `
                <i class="fas fa-edit action-icon edit" title="Edit"></i>
                <i class="fas fa-trash-alt action-icon delete" title="Delete"></i>
            `;
        });
    }

    // --- Event Listeners ---
    guestTypeFilter.addEventListener('change', renderGuests);
    lastVisitFilter.addEventListener('change', renderGuests);
    guestSearchInput.addEventListener('input', renderGuests); // Live search

    // Initial render
    renderGuests();
});