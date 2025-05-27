document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const ratingFilter = document.getElementById('ratingFilter');
    const statusFilter = document.getElementById('statusFilter');
    const reviewSearchInput = document.getElementById('reviewSearch');
    const reviewsTableBody = document.querySelector('.reviews-table tbody');

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

    // --- Sample Review Data (based on "Reviews.png") ---
    const reviewsData = [
        { id: 'REV001', guestName: 'Jan de Groot', date: '2024-05-26', rating: 5, comment: 'Fantastic food and excellent service!', status: 'Published' },
        { id: 'REV002', guestName: 'Sophie Meier', date: '2024-05-25', rating: 4, comment: 'Enjoyed the atmosphere, but the waiting time was a bit long.', status: 'Published' },
        { id: 'REV003', guestName: 'Piet Jansen', date: '2024-05-24', rating: 3, comment: 'Food was okay, but service could be better.', status: 'Pending' },
        { id: 'REV004', guestName: 'Maria Rossi', date: '2024-05-23', rating: 5, comment: 'Loved the spareribs! Will definitely come back.', status: 'Published' },
        { id: 'REV005', guestName: 'David Lee', date: '2024-05-22', rating: 2, comment: 'Disappointed with the vegetarian options.', status: 'Pending' },
        { id: 'REV006', guestName: 'Lisa Kim', date: '2024-05-21', rating: 4, comment: 'Great cocktails and friendly staff.', status: 'Published' },
        { id: 'REV007', guestName: 'Omar Khan', date: '2024-05-20', rating: 1, comment: 'Worst dining experience ever. Cold food and rude service.', status: 'Archived' },
        { id: 'REV008', guestName: 'Lena Schmidt', date: '2024-05-19', rating: 5, comment: 'A hidden gem! Perfect for a relaxed evening.', status: 'Published' },
    ];

    // --- Helper function to generate star icons ---
    function getStarRating(rating) {
        let stars = '';
        for (let i = 0; i < 5; i++) {
            if (i < rating) {
                stars += '<i class="fas fa-star"></i>'; // Filled star
            } else {
                stars += '<i class="far fa-star"></i>'; // Empty star
            }
        }
        return `<span class="rating-stars">${stars}</span>`;
    }

    // --- Render Reviews Table ---
    function renderReviews() {
        const selectedRating = ratingFilter.value;
        const selectedStatus = statusFilter.value;
        const searchTerm = reviewSearchInput.value.toLowerCase();

        reviewsTableBody.innerHTML = ''; // Clear existing rows

        const filteredReviews = reviewsData.filter(review => {
            const matchesRating = selectedRating === 'all' || review.rating === parseInt(selectedRating);
            const matchesStatus = selectedStatus === 'all' || review.status.toLowerCase() === selectedStatus;
            
            const matchesSearchTerm = Object.values(review).some(value => 
                String(value).toLowerCase().includes(searchTerm)
            );

            return matchesRating && matchesStatus && matchesSearchTerm;
        }).sort((a, b) => new Date(b.date) - new Date(a.date)); // Sort by date descending

        if (filteredReviews.length === 0) {
            reviewsTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--subtitle-color);">No reviews found for the selected criteria.</td></tr>';
            return;
        }

        filteredReviews.forEach(review => {
            const row = reviewsTableBody.insertRow();
            row.insertCell().textContent = review.id;
            row.insertCell().textContent = review.guestName;
            row.insertCell().textContent = review.date;
            row.insertCell().innerHTML = getStarRating(review.rating);
            
            // Truncate comment for display
            const commentCell = row.insertCell();
            const displayComment = review.comment.length > 50 ? review.comment.substring(0, 47) + '...' : review.comment;
            commentCell.textContent = displayComment;

            const statusCell = row.insertCell();
            statusCell.textContent = review.status;
            statusCell.classList.add(`status-${review.status.toLowerCase()}`);
            
            // Actions cell
            const actionsCell = row.insertCell();
            actionsCell.classList.add('actions-cell');
            actionsCell.innerHTML = `
                <i class="fas fa-edit action-icon edit" title="Edit"></i>
                ${review.status === 'Pending' ? '<i class="fas fa-check-circle action-icon publish" title="Publish"></i>' : ''}
                <i class="fas fa-trash-alt action-icon delete" title="Delete"></i>
            `;
        });
    }

    // --- Event Listeners ---
    ratingFilter.addEventListener('change', renderReviews);
    statusFilter.addEventListener('change', renderReviews);
    reviewSearchInput.addEventListener('input', renderReviews); // Live search

    // Initial render
    renderReviews();
});