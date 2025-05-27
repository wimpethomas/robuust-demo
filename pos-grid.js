// This JS file is identical to pos-flex.js as the functionality is independent of the layout method.

document.addEventListener('DOMContentLoaded', () => {
    const productGrid = document.querySelector('.product-grid');
    const orderList = document.querySelector('.order-list');
    const billItems = document.querySelector('.bill-items');
    const totalAmountSpan = document.getElementById('total-amount');

    let order = {}; // { productName: { quantity: X, price: Y } }

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
            orderItemLi.innerHTML = `
                <span class="order-item-name">${name}</span>
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
                <span>€ ${item.price.toFixed(2)}</span>
                <span></span> `;
            billItems.appendChild(billItemLi);
        }

        totalAmountSpan.textContent = `€ ${total.toFixed(2)}`;
    }

    // Add product to order
    productGrid.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
            const name = productItem.dataset.name;
            const price = parseFloat(productItem.dataset.price);

            if (order[name]) {
                order[name].quantity++;
            } else {
                order[name] = { quantity: 1, price: price };
            }
            updateOrderDisplay();

            // Optional: Add visual feedback for selected product
            productItem.classList.add('selected');
            setTimeout(() => {
                productItem.classList.remove('selected');
            }, 300);
        }
    });

    // Handle quantity changes in order list
    orderList.addEventListener('click', (event) => {
        const button = event.target.closest('button');
        if (button) {
            const name = button.dataset.name;
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
    });

    // Initial display update
    updateOrderDisplay();
});