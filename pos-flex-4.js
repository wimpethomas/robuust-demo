document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const orderList = document.querySelector('.order-list');
    const billItems = document.querySelector('.bill-items');
    const totalAmountSpan = document.getElementById('total-amount');
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;

    // Item Modal elements
    const itemModal = document.getElementById('itemModal');
    const closeModalBtn = document.getElementById('closeModalBtn');
    const cancelModalBtn = document.getElementById('cancelModalBtn');
    const addNoteBtn = document.getElementById('addNoteBtn');
    const modalProductName = document.getElementById('modalProductName');
    const kitchenNoteTextarea = document.getElementById('kitchenNote');
    const optionGroup = document.getElementById('optionGroup'); // Reference to the option group container

    // Payment Modal elements (NEW)
    const paymentModal = document.getElementById('paymentModal');
    const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
    const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
    const cancelPaymentModalBtn = document.getElementById('cancelPaymentModalBtn');
    const outstandingAmountSpan = document.getElementById('outstandingAmount');
    const paymentMethodGrid = document.getElementById('paymentMethodGrid');
    const receivedAmountInput = document.getElementById('receivedAmount');
    const changeAmountSpan = document.getElementById('changeAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    let order = {}; // { productName: { quantity: X, price: Y, note: '', options: [] } }
    let currentProductForModal = null; // Stores data of the product that opened the item modal

    // Function to calculate the total order amount
    function calculateTotal() {
        let total = 0;
        for (const key in order) {
            const item = order[key];
            let itemTotalPrice = item.quantity * item.price;
            item.options.forEach(option => {
                itemTotalPrice += item.quantity * option.price;
            });
            total += itemTotalPrice;
        }
        return total;
    }

    // Function to update the order list and bill
    function updateOrderDisplay() {
        orderList.innerHTML = '';
        billItems.innerHTML = '';
        let total = 0;

        // Iterate through all items in the order object
        for (const key in order) {
            const item = order[key];
            let itemTotalPrice = item.quantity * item.price;

            // Calculate total price including options
            let optionsText = [];
            item.options.forEach(option => {
                itemTotalPrice += item.quantity * option.price;
                optionsText.push(`${option.name}`);
            });

            total += itemTotalPrice;

            // Add to Order List
            const orderItemLi = document.createElement('li');
            orderItemLi.classList.add('order-item');
            let itemDetails = `${item.name}`;
            if (item.note) {
                itemDetails += `<br><span class="order-item-note">Opmerking: ${item.note}</span>`;
            }
            if (optionsText.length > 0) {
                itemDetails += `<br><span class="order-item-options">Extra's: ${optionsText.join(', ')}</span>`;
            }

            orderItemLi.innerHTML = `
                <span class="order-item-name">${itemDetails}</span>
                <div class="quantity-controls">
                    <button class="quantity-btn decrease" data-key="${key}">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn increase" data-key="${key}">+</button>
                </div>
            `;
            orderList.appendChild(orderItemLi);

            // Add to Bill Items
            const billItemLi = document.createElement('li');
            billItemLi.classList.add('bill-item');
            billItemLi.innerHTML = `
                <span>${item.name}</span>
                <span>${item.quantity}</span>
                <span>&euro; ${itemTotalPrice.toFixed(2)}</span>
                <span>Gang 1</span>
            `;
            billItems.appendChild(billItemLi);
        }

        totalAmountSpan.textContent = `€ ${total.toFixed(2)}`;
    }

    // Function to open the item modal
    function openItemModal(product) {
        currentProductForModal = product;
        modalProductName.textContent = product.name;
        kitchenNoteTextarea.value = ''; // Clear previous notes

        // Deselect all option boxes
        document.querySelectorAll('.option-box').forEach(optionBox => {
            optionBox.classList.remove('selected');
        });

        itemModal.style.display = 'flex';
    }

    // Function to close the item modal
    function closeItemModal() {
        itemModal.style.display = 'none';
        currentProductForModal = null; // Clear current product
    }

    // Function to open the payment modal (NEW)
    function openPaymentModal() {
        const total = calculateTotal();
        outstandingAmountSpan.textContent = `€ ${total.toFixed(2)}`;
        receivedAmountInput.value = total.toFixed(2); // Pre-fill with total amount
        calculateChange(); // Calculate change immediately
        
        // Ensure one payment method is selected by default (e.g., Contant)
        document.querySelectorAll('.payment-method-box').forEach(box => {
            box.classList.remove('selected');
        });
        const defaultPaymentMethod = document.querySelector('.payment-method-box[data-method="Contant"]');
        if (defaultPaymentMethod) {
            defaultPaymentMethod.classList.add('selected');
        }

        paymentModal.style.display = 'flex';
    }

    // Function to close the payment modal (NEW)
    function closePaymentModal() {
        paymentModal.style.display = 'none';
    }

    // Function to calculate and display change (NEW)
    function calculateChange() {
        const outstanding = parseFloat(outstandingAmountSpan.textContent.replace('€ ', ''));
        const received = parseFloat(receivedAmountInput.value) || 0;
        const change = received - outstanding;
        changeAmountSpan.textContent = `€ ${Math.max(0, change).toFixed(2)}`; // Don't show negative change
    }

    // Event listener for product clicks (opens item modal)
    productGrid.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
            const name = productItem.dataset.name;
            const price = parseFloat(productItem.dataset.price);
            const code = productItem.dataset.code;

            if (name === 'Truki Ribs') { // Example: 'Truki Ribs' requires modal
                openItemModal({ name, price, code });
            } else {
                // Existing logic for other products
                // Ensure to create a unique key if notes/options are added to regular items later
                const key = name; // Simple key for products without modal interaction
                if (order[key]) {
                    order[key].quantity++;
                } else {
                    order[key] = { name: name, price: price, quantity: 1, note: '', options: [] };
                }
                updateOrderDisplay();
            }
        }
    });

    // Event listener for quantity controls in order list
    orderList.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button && button.classList.contains('quantity-btn')) {
            const key = button.dataset.key; // Use data-key for unique item identification
            if (order[key]) {
                if (button.classList.contains('increase')) {
                    order[key].quantity++;
                } else if (button.classList.contains('decrease')) {
                    order[key].quantity--;
                    if (order[key].quantity <= 0) {
                        delete order[key]; // Remove item if quantity is 0 or less
                    }
                }
                updateOrderDisplay();
            }
        }
    });

    // Event listener for option boxes within the item modal
    optionGroup.addEventListener('click', (event) => {
        const optionBox = event.target.closest('.option-box');
        if (optionBox) {
            optionBox.classList.toggle('selected');
        }
    });

    // Item Modal close buttons
    closeModalBtn.addEventListener('click', closeItemModal);
    cancelModalBtn.addEventListener('click', closeItemModal);
    itemModal.addEventListener('click', (event) => {
        if (event.target === itemModal) { // Close if clicked outside modal content
            closeItemModal();
        }
    });

    // Add Note/Options button in item modal
    addNoteBtn.addEventListener('click', () => {
        if (currentProductForModal) {
            const note = kitchenNoteTextarea.value.trim();
            
            // Collect selected options from the option boxes
            const selectedOptions = Array.from(document.querySelectorAll('.option-box.selected')).map(optionBox => {
                return {
                    name: optionBox.dataset.value,
                    price: parseFloat(optionBox.dataset.price)
                };
            });

            const productName = currentProductForModal.name;
            const productPrice = currentProductForModal.price;

            // Create a unique key for the item based on its name, note, and selected options
            // This ensures that items with different notes/options are treated as distinct line items
            const optionsString = selectedOptions.map(opt => `${opt.name}:${opt.price.toFixed(2)}`).sort().join('|');
            const uniqueItemKey = `${productName}__${note}__${optionsString}`;

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
            closeItemModal();
        }
    });

    // Open Payment Modal Button (NEW)
    openPaymentModalBtn.addEventListener('click', openPaymentModal);

    // Payment Modal Close buttons (NEW)
    closePaymentModalBtn.addEventListener('click', closePaymentModal);
    cancelPaymentModalBtn.addEventListener('click', closePaymentModal);
    paymentModal.addEventListener('click', (event) => {
        if (event.target === paymentModal) { // Close if clicked outside modal content
            closePaymentModal();
        }
    });

    // Payment method selection in payment modal (NEW)
    paymentMethodGrid.addEventListener('click', (event) => {
        const clickedBox = event.target.closest('.payment-method-box');
        if (clickedBox) {
            // Remove 'selected' from all other boxes
            document.querySelectorAll('.payment-method-box').forEach(box => {
                box.classList.remove('selected');
            });
            // Add 'selected' to the clicked box
            clickedBox.classList.add('selected');
        }
    });

    // Received Amount input change listener (NEW)
    receivedAmountInput.addEventListener('input', calculateChange);

    // Checkout button in payment modal (NEW)
    checkoutBtn.addEventListener('click', () => {
        const outstanding = parseFloat(outstandingAmountSpan.textContent.replace('€ ', ''));
        const received = parseFloat(receivedAmountInput.value) || 0;
        const change = received - outstanding;

        if (received < outstanding) {
            alert('Ontvangen bedrag is te laag!');
            return;
        }

        const selectedMethod = document.querySelector('.payment-method-box.selected');
        const paymentMethod = selectedMethod ? selectedMethod.dataset.method : 'Onbekend';

        alert(`Betaling succesvol!
            Totaal: € ${outstanding.toFixed(2)}
            Ontvangen: € ${received.toFixed(2)}
            Wisselgeld: € ${change.toFixed(2)}
            Betaalmethode: ${paymentMethod}`);

        // Clear the order and close modal after successful payment
        order = {}; // Clear the order
        updateOrderDisplay(); // Update display to show empty order
        closePaymentModal();
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