document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const orderList = document.querySelector('.order-list');
    const billItems = document.querySelector('.bill-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Modal elements
    const itemModal = document.getElementById('itemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const modalProductName = document.getElementById('modalProductName');
    const kitchenNoteTextarea = document.getElementById('kitchenNote');

    let order = {}; // { productName: { quantity: X, price: Y, note: '', options: [] } }
    let currentProductForModal = null; // Stores data of the product that opened the modal

    // Function to update the order list and bill
    function updateOrderDisplay() {
        orderList.innerHTML = '';
        billItems.innerHTML = '';
        let total = 0;

        for (const name in order) {
            const item = order[name];
            const itemTotal = item.quantity * item.price;
            total += itemTotal;

            // Add to Order List
            const orderItemLi = document.createElement('li');
            orderItemLi.classList.add('order-item');
            let itemDetails = `${name}`;
            if (item.note) {
                itemDetails += ` <span class="order-item-note">(Note: ${item.note})</span>`;
            }
            if (item.options && item.options.length > 0) {
                itemDetails += ` <span class="order-item-options">(Options: ${item.options.join(', ')})</span>`;
            }

            orderItemLi.innerHTML = `
                <span class="order-item-name">${itemDetails}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-name="${name}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-name="${name}">+</button>
                </div>
            `;
            orderList.appendChild(orderItemLi);

            // Add to Bill Items
            const billItemLi = document.createElement('li');
            billItemLi.classList.add('bill-item');
            billItemLi.innerHTML = `
                <span>${name}</span>
                <span>${item.quantity}</span>
                <span>&euro; ${item.price.toFixed(2)}</span>
                <span>Gang 1</span>
            `;
            billItems.appendChild(billItemLi);
        }

        totalAmountSpan.textContent = `€ ${total.toFixed(2)}`;
    }

    // Function to open the modal
    function openModal(product) {
        currentProductForModal = product;
        modalProductName.textContent = product.name;
        kitchenNoteTextarea.value = ''; // Clear previous notes
        // Reset checkboxes if needed, or handle based on product if options are specific
        document.querySelectorAll('.option-group input[type="checkbox"]').forEach(checkbox => {
            checkbox.checked = false;
        });
        itemModal.style.display = 'flex';
    }

    // Function to close the modal
    function closeModal() {
        itemModal.style.display = 'none';
        currentProductForModal = null; // Clear current product
    }

    // Event listener for product clicks
    productGrid.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
            const name = productItem.dataset.name;
            const price = parseFloat(productItem.dataset.price);
            const code = productItem.dataset.code;

            if (name === 'Truki Ribs') {
                openModal({ name, price, code });
            } else {
                // Existing logic for other products
                if (order[name]) {
                    order[name].quantity++;
                } else {
                    order[name] = { quantity: 1, price: price, note: '', options: [] };
                }
                updateOrderDisplay();
            }
        }
    });

    // Event listener for quantity controls in order list
    orderList.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            const name = button.dataset.name;
            if (order[name]) { // Ensure item exists in order
                if (button.classList.contains('increase')) {
                    order[name].quantity++;
                } else if (button.classList.contains('decrease')) {
                    order[name].quantity--;
                    if (order[name].quantity <= 0) {
                        delete order[name]; // Remove item if quantity is 0 or less
                    }
                }
                updateOrderDisplay();
            }
        }
    });

    // Modal close buttons
    closeModalBtn.addEventListener('click', closeModal);
    cancelModalBtn.addEventListener('click', closeModal);
    itemModal.addEventListener('click', (event) => {
        if (event.target === itemModal) { // Close if clicked outside modal content
            closeModal();
        }
    });

    // Add Note/Options button in modal
    addNoteBtn.addEventListener('click', () => {
        if (currentProductForModal) {
            const note = kitchenNoteTextarea.value.trim();
            const selectedOptions = Array.from(document.querySelectorAll('.option-group input[type="checkbox"]:checked'))
                                       .map(cb => cb.value);

            const productName = currentProductForModal.name;
            const productPrice = currentProductForModal.price;

            // Add item to order with note and options
            // For simplicity, if the same product is added again with different notes/options,
            // it will be treated as a separate line item. A more complex system might
            // group identical items but keep separate notes/options.
            // For this example, we'll just add it as a new distinct entry in the order if note/options differ.
            // If the user adds 'Truki Ribs' multiple times, each with potentially different notes/options,
            // we need to distinguish them. A simple way is to append a unique identifier,
            // or better, store it as an object that contains the name, note, and options.

            // To allow adding multiple 'Truki Ribs' with different notes/options,
            // we'll treat them as distinct entries. A simple way is to add the note/options
            // to the product name key, or iterate through the order.
            // For now, let's just simplify and add it with full details.

            const uniqueItemKey = `${productName}-${note}-${selectedOptions.sort().join('-')}`;
            if (order[uniqueItemKey]) {
                order[uniqueItemKey].quantity++;
            } else {
                order[uniqueItemKey] = {
                    name: productName,
                    price: productPrice,
                    quantity: 1,
                    note: note,
                    options: selectedOptions
                };
            }
            updateOrderDisplay();
            closeModal();
        }
    });


    // Dark Mode Toggle Logic
    function applyTheme(theme) {
        if (theme === 'dark') {
            body.classList.add('dark-mode');
            darkModeToggle.checked = true;
        } else {
            body.classList.remove('dark-mode');
            darkModeToggle.checked = false;
        }
        localStorage.setItem('theme', theme); // Save preference
    }

    // Check for saved theme preference on page load
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
        applyTheme(savedTheme);
    } else {
        // Default to dark mode as per Kassa.png if no preference saved
        applyTheme('dark'); 
    }

    // Toggle theme on switch change
    darkModeToggle.addEventListener('change', () => {
        if (darkModeToggle.checked) {
            applyTheme('dark');
        } else {
            applyTheme('light');
        }
    });

    // Initial display update
    updateOrderDisplay();
});