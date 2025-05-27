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
    const optionGroup = document.getElementById('optionGroup');

    // Payment Modal elements
    const paymentModal = document.getElementById('paymentModal');
    const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
    const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
    const cancelPaymentModalBtn = document.getElementById('cancelPaymentModalBtn');
    const outstandingAmountSpan = document.getElementById('outstandingAmount');
    const paymentMethodGrid = document.getElementById('paymentMethodGrid');
    const receivedAmountInput = document.getElementById('receivedAmount');
    const changeAmountSpan = document.getElementById('changeAmount');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // Split Payment elements (NEW)
    const splitModesSelection = document.getElementById('splitModesSelection');
    const splitModeNoneBtn = document.getElementById('splitModeNone');
    const splitModeLosBtn = document.getElementById('splitModeLos');
    const splitModeEvenBtn = document.getElementById('splitModeEven');
    const splitModeOnDishBtn = document.getElementById('splitModeOnDish');

    const splitOptionsContainer = document.querySelector('.split-options-container');

    const splitModeLosContent = document.getElementById('splitModeLosContent');
    const numPeopleLosInput = document.getElementById('numPeopleLos');
    const losPaymentLinesContainer = document.getElementById('losPaymentLines');
    const addLosPaymentLineBtn = document.getElementById('addLosPaymentLineBtn');
    const calculateRemainingLosBtn = document.getElementById('calculateRemainingLosBtn');
    const losRemainingAmountSpan = document.getElementById('losRemainingAmount');

    const splitModeEvenContent = document.getElementById('splitModeEvenContent');
    const numPeopleEvenInput = document.getElementById('numPeopleEven');
    const amountPerPersonSpan = document.getElementById('amountPerPerson');
    const evenPaymentSectionsContainer = document.getElementById('evenPaymentSections');

    const splitModeOnDishContent = document.getElementById('splitModeOnDishContent');
    const addOnDishPaymentLineBtn = document.getElementById('addOnDishPaymentLineBtn');
    const onDishRemainingAmountSpan = document.getElementById('onDishRemainingAmount');
    const draggableOrderItemsList = document.getElementById('draggableOrderItems');
    const onDishPaymentSectionsContainer = document.getElementById('onDishPaymentSections');

    let order = {}; // { uniqueKey: { name, price, quantity, note, options } }
    let currentProductForModal = null;
    let currentSplitMode = 'none'; // 'none', 'los', 'even', 'ondish'
    let paymentLinesLos = []; // Stores individual payment lines for 'Los' mode
    let onDishPaymentBills = []; // Stores payment bills for 'Op gerecht' mode

    // Helper to get total price of a single order item (including its options)
    function getOrderItemTotalPrice(item) {
        let price = item.quantity * item.price;
        item.options.forEach(option => {
            price += item.quantity * option.price;
        });
        return price;
    }

    // Function to calculate the total order amount
    function calculateTotal() {
        let total = 0;
        for (const key in order) {
            total += getOrderItemTotalPrice(order[key]);
        }
        return total;
    }

    // Function to update the order list and bill
    function updateOrderDisplay() {
        orderList.innerHTML = '';
        billItems.innerHTML = '';
        let total = 0;

        for (const key in order) {
            const item = order[key];
            const itemTotalPrice = getOrderItemTotalPrice(item);
            total += itemTotalPrice;

            // Add to Order List
            const orderItemLi = document.createElement('li');
            orderItemLi.classList.add('order-item');
            let itemDetails = `${item.name}`;
            if (item.note) {
                itemDetails += `<br><span class="order-item-note">Opmerking: ${item.note}</span>`;
            }
            if (item.options && item.options.length > 0) {
                const optionsText = item.options.map(opt => opt.name).join(', ');
                itemDetails += `<br><span class="order-item-options">Extra's: ${optionsText}</span>`;
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

    // Function to open the payment modal
    function openPaymentModal() {
        paymentModal.classList.remove('large-modal-content'); // Reset to default size
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

        // Reset split modes and hide content
        selectSplitMode('none');

        paymentModal.style.display = 'flex';
    }

    // Function to close the payment modal
    function closePaymentModal() {
        paymentModal.style.display = 'none';
    }

    // Function to calculate and display change
    function calculateChange() {
        const outstanding = parseFloat(outstandingAmountSpan.textContent.replace('€ ', ''));
        const received = parseFloat(receivedAmountInput.value) || 0;
        const change = received - outstanding;
        changeAmountSpan.textContent = `€ ${Math.max(0, change).toFixed(2)}`; // Don't show negative change
    }

    // Function to select a split mode (NEW)
    function selectSplitMode(mode) {
        currentSplitMode = mode;
        // Update active button state
        document.querySelectorAll('.split-mode-button').forEach(btn => {
            if (btn.dataset.splitMode === mode) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });

        // Hide all split mode content
        document.querySelectorAll('.split-mode-content').forEach(content => {
            content.classList.remove('active');
            content.classList.add('hidden'); // Ensure it's hidden properly
        });

        // Show content for the selected mode
        if (mode === 'los') {
            paymentModal.classList.add('large-modal-content'); // Expand modal for los
            splitModeLosContent.classList.add('active');
            splitModeLosContent.classList.remove('hidden');
            initializeLosSplit();
        } else if (mode === 'even') {
            paymentModal.classList.add('large-modal-content'); // Expand modal for even
            splitModeEvenContent.classList.add('active');
            splitModeEvenContent.classList.remove('hidden');
            initializeEvenSplit();
        } else if (mode === 'ondish') {
            paymentModal.classList.add('large-modal-content'); // Expand modal for ondish
            splitModeOnDishContent.classList.add('active');
            splitModeOnDishContent.classList.remove('hidden');
            initializeOnDishSplit();
        } else { // 'none' mode
            paymentModal.classList.remove('large-modal-content'); // Shrink modal for normal
        }

        // Reset received amount and change when changing split mode
        const total = calculateTotal();
        receivedAmountInput.value = total.toFixed(2);
        calculateChange();
    }

    // --- Split Mode: Los (Separate) Logic ---
    function initializeLosSplit() {
        numPeopleLosInput.value = 1;
        paymentLinesLos = []; // Clear previous lines
        addLosPaymentLine(); // Add an initial line
        updateLosRemaining();
    }

    function addLosPaymentLine() {
        const lineIndex = paymentLinesLos.length;
        const lineDiv = document.createElement('div');
        lineDiv.classList.add('split-payment-line');
        lineDiv.dataset.lineIndex = lineIndex;

        const paymentMethodsHtml = `
            <select class="payment-method-dropdown">
                <option value="Contant">Contant</option>
                <option value="Pin">Pin</option>
                <option value="Creditcard">Creditcard</option>
                <option value="Overboeking">Overboeking</option>
                <option value="Cadeaubon">Cadeaubon</option>
                <option value="Factuur">Factuur</option>
            </select>
        `;

        lineDiv.innerHTML = `
            <span>Persoon ${lineIndex + 1}</span>
            <input type="number" class="los-amount-input" value="0.00" step="0.01">
            ${paymentMethodsHtml}
            <button class="delete-line-btn"><i class="fas fa-times-circle"></i></button>
        `;

        losPaymentLinesContainer.appendChild(lineDiv);

        const newLine = { amount: 0, method: 'Contant' };
        paymentLinesLos.push(newLine);

        // Event listeners for the new line
        const amountInput = lineDiv.querySelector('.los-amount-input');
        amountInput.addEventListener('input', (e) => {
            newLine.amount = parseFloat(e.target.value) || 0;
            updateLosRemaining();
        });

        const methodDropdown = lineDiv.querySelector('.payment-method-dropdown');
        methodDropdown.addEventListener('change', (e) => {
            newLine.method = e.target.value;
        });

        const deleteBtn = lineDiv.querySelector('.delete-line-btn');
        deleteBtn.addEventListener('click', () => {
            paymentLinesLos.splice(lineIndex, 1);
            losPaymentLinesContainer.removeChild(lineDiv);
            updateLosRemaining();
            // Re-index displayed person numbers
            losPaymentLinesContainer.querySelectorAll('.split-payment-line').forEach((el, idx) => {
                el.querySelector('span').textContent = `Persoon ${idx + 1}`;
                el.dataset.lineIndex = idx;
            });
        });

        updateLosRemaining();
    }

    function updateLosRemaining() {
        const totalOutstanding = calculateTotal();
        let paidSum = paymentLinesLos.reduce((sum, line) => sum + line.amount, 0);
        const remaining = totalOutstanding - paidSum;
        losRemainingAmountSpan.textContent = `€ ${Math.max(0, remaining).toFixed(2)}`;
    }

    // --- Split Mode: Gelijkmatig (Even) Logic ---
    function initializeEvenSplit() {
        numPeopleEvenInput.value = 1;
        updateEvenSplitPayments();
    }

    function updateEvenSplitPayments() {
        const total = calculateTotal();
        const numPeople = parseInt(numPeopleEvenInput.value) || 1;
        const amountPerPerson = total / numPeople;
        amountPerPersonSpan.textContent = `€ ${amountPerPerson.toFixed(2)}`;

        evenPaymentSectionsContainer.innerHTML = ''; // Clear previous sections

        for (let i = 0; i < numPeople; i++) {
            const personSection = document.createElement('div');
            personSection.classList.add('person-payment-section');
            personSection.innerHTML = `
                <span class="person-label">Persoon ${i + 1}:</span>
                <span class="person-amount">&euro; ${amountPerPerson.toFixed(2)}</span>
                <div class="payment-method-grid-small" data-person-index="${i}">
                    <div class="payment-method-box-small selected" data-method="Contant">Contant</div>
                    <div class="payment-method-box-small" data-method="Pin">Pin</div>
                    <div class="payment-method-box-small" data-method="Creditcard">Creditcard</div>
                </div>
            `;
            evenPaymentSectionsContainer.appendChild(personSection);
        }

        // Add event listeners for payment method selection in Even mode
        evenPaymentSectionsContainer.querySelectorAll('.payment-method-grid-small').forEach(grid => {
            grid.addEventListener('click', (event) => {
                const clickedBox = event.target.closest('.payment-method-box-small');
                if (clickedBox) {
                    grid.querySelectorAll('.payment-method-box-small').forEach(box => {
                        box.classList.remove('selected');
                    });
                    clickedBox.classList.add('selected');
                }
            });
        });
    }

    // --- Split Mode: Op gerecht (On Dish) Logic ---
    function initializeOnDishSplit() {
        renderDraggableOrderItems();
        onDishPaymentBills = []; // Clear existing bills
        addOnDishPaymentBill(); // Add initial bill
        updateOnDishRemaining();
    }

    function renderDraggableOrderItems() {
        draggableOrderItemsList.innerHTML = '';
        for (const key in order) {
            const item = order[key];
            const itemLi = document.createElement('li');
            itemLi.classList.add('on-dish-item');
            itemLi.setAttribute('draggable', 'true');
            itemLi.dataset.itemKey = key; // Store the original order item key
            itemLi.innerHTML = `
                <span class="item-name">${item.name} x ${item.quantity}</span>
                <span class="item-price">&euro; ${getOrderItemTotalPrice(item).toFixed(2)}</span>
            `;
            draggableOrderItemsList.appendChild(itemLi);

            // Add drag event listeners
            itemLi.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', itemLi.dataset.itemKey);
                itemLi.classList.add('dragging');
            });
            itemLi.addEventListener('dragend', () => {
                itemLi.classList.remove('dragging');
            });
        }
    }

    function addOnDishPaymentBill() {
        const billIndex = onDishPaymentBills.length;
        const newBill = {
            id: `bill-${Date.now()}-${billIndex}`, // Unique ID for each bill
            items: [], // Array of itemKeys
            total: 0,
            method: 'Contant' // Default payment method
        };
        onDishPaymentBills.push(newBill);

        const billDiv = document.createElement('div');
        billDiv.classList.add('on-dish-payment-target');
        billDiv.dataset.billId = newBill.id;
        billDiv.innerHTML = `
            <div class="target-header">
                <span>Bill ${billIndex + 1}</span>
                <button class="delete-target-btn" data-bill-id="${newBill.id}"><i class="fas fa-trash-alt"></i></button>
            </div>
            <ul class="target-item-list">
                </ul>
            <div class="payment-method-grid-small" data-bill-id="${newBill.id}">
                <div class="payment-method-box-small selected" data-method="Contant">Contant</div>
                <div class="payment-method-box-small" data-method="Pin">Pin</div>
                <div class="payment-method-box-small" data-method="Creditcard">Creditcard</div>
            </div>
            <div class="target-total" id="onDishBillTotal-${newBill.id}">€ 0.00</div>
        `;
        onDishPaymentSectionsContainer.appendChild(billDiv);

        // Add drag/drop event listeners to the new bill target
        billDiv.addEventListener('dragover', (e) => {
            e.preventDefault(); // Allow drop
            billDiv.classList.add('drag-over');
        });
        billDiv.addEventListener('dragleave', () => {
            billDiv.classList.remove('drag-over');
        });
        billDiv.addEventListener('drop', (e) => {
            e.preventDefault();
            billDiv.classList.remove('drag-over');
            const itemKey = e.dataTransfer.getData('text/plain');
            assignItemToBill(itemKey, newBill.id);
        });

        // Event listener for payment method selection within the bill
        billDiv.querySelector('.payment-method-grid-small').addEventListener('click', (event) => {
            const clickedBox = event.target.closest('.payment-method-box-small');
            if (clickedBox) {
                const billId = clickedBox.closest('.payment-method-grid-small').dataset.billId;
                const bill = onDishPaymentBills.find(b => b.id === billId);
                if (bill) {
                    bill.method = clickedBox.dataset.method;
                    clickedBox.closest('.payment-method-grid-small').querySelectorAll('.payment-method-box-small').forEach(box => {
                        box.classList.remove('selected');
                    });
                    clickedBox.classList.add('selected');
                }
            }
        });

        // Event listener for delete bill button
        billDiv.querySelector('.delete-target-btn').addEventListener('click', (e) => {
            const billIdToDelete = e.target.closest('.delete-target-btn').dataset.billId;
            deleteOnDishPaymentBill(billIdToDelete);
        });
    }

    function assignItemToBill(itemKey, billId) {
        const item = order[itemKey];
        if (!item) return;

        // Check if item is already assigned to any bill
        let alreadyAssigned = false;
        onDishPaymentBills.forEach(bill => {
            if (bill.items.includes(itemKey)) {
                alreadyAssigned = true;
            }
        });

        if (alreadyAssigned) {
            alert('Dit gerecht is al aan een rekening toegewezen!');
            return;
        }

        const targetBill = onDishPaymentBills.find(bill => bill.id === billId);
        if (targetBill) {
            targetBill.items.push(itemKey);
            updateOnDishBillDisplay(targetBill);
            updateOnDishRemaining();
            // Remove item from draggable list
            document.querySelector(`.on-dish-item[data-item-key="${itemKey}"]`).remove();
        }
    }

    function updateOnDishBillDisplay(bill) {
        const billDiv = document.querySelector(`.on-dish-payment-target[data-bill-id="${bill.id}"]`);
        const itemList = billDiv.querySelector('.target-item-list');
        const totalSpan = billDiv.querySelector(`#onDishBillTotal-${bill.id}`);

        itemList.innerHTML = '';
        let currentBillTotal = 0;
        bill.items.forEach(itemKey => {
            const item = order[itemKey];
            if (item) {
                const itemTotalPrice = getOrderItemTotalPrice(item);
                currentBillTotal += itemTotalPrice;
                const itemLi = document.createElement('li');
                itemLi.classList.add('target-item');
                itemLi.innerHTML = `
                    <span>${item.name} x ${item.quantity}</span>
                    <span>&euro; ${itemTotalPrice.toFixed(2)}</span>
                `;
                itemList.appendChild(itemLi);
            }
        });
        bill.total = currentBillTotal; // Update bill object's total
        totalSpan.textContent = `€ ${currentBillTotal.toFixed(2)}`;
    }

    function updateOnDishRemaining() {
        const totalOrder = calculateTotal();
        let assignedTotal = onDishPaymentBills.reduce((sum, bill) => sum + bill.total, 0);
        const remaining = totalOrder - assignedTotal;
        onDishRemainingAmountSpan.textContent = `€ ${remaining.toFixed(2)}`;
    }

    function deleteOnDishPaymentBill(billIdToDelete) {
        const billIndex = onDishPaymentBills.findIndex(b => b.id === billIdToDelete);
        if (billIndex > -1) {
            const removedBill = onDishPaymentBills.splice(billIndex, 1)[0];
            // Return items from the removed bill back to the draggable list
            removedBill.items.forEach(itemKey => {
                const item = order[itemKey];
                if (item) {
                    const itemLi = document.createElement('li');
                    itemLi.classList.add('on-dish-item');
                    itemLi.setAttribute('draggable', 'true');
                    itemLi.dataset.itemKey = itemKey;
                    itemLi.innerHTML = `
                        <span class="item-name">${item.name} x ${item.quantity}</span>
                        <span class="item-price">&euro; ${getOrderItemTotalPrice(item).toFixed(2)}</span>
                    `;
                    draggableOrderItemsList.appendChild(itemLi);
                    // Re-add drag listeners
                    itemLi.addEventListener('dragstart', (e) => {
                        e.dataTransfer.setData('text/plain', itemLi.dataset.itemKey);
                        itemLi.classList.add('dragging');
                    });
                    itemLi.addEventListener('dragend', () => {
                        itemLi.classList.remove('dragging');
                    });
                }
            });

            // Remove the bill div from DOM
            const billDiv = document.querySelector(`.on-dish-payment-target[data-bill-id="${billIdToDelete}"]`);
            if (billDiv) {
                billDiv.remove();
            }

            // Re-label bills
            onDishPaymentSectionsContainer.querySelectorAll('.on-dish-payment-target').forEach((el, idx) => {
                el.querySelector('.target-header span').textContent = `Bill ${idx + 1}`;
            });

            updateOnDishRemaining();
        }
    }


    // --- Event Listeners ---

    // Event listener for product clicks (opens item modal)
    productGrid.addEventListener('click', (event) => {
        const productItem = event.target.closest('.product-item');
        if (productItem) {
            const name = productItem.dataset.name;
            const price = parseFloat(productItem.dataset.price);
            const code = productItem.dataset.code;

            if (name === 'Truki Ribs') {
                openItemModal({ name, price, code });
            } else {
                const key = name;
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
            const key = button.dataset.key;
            if (order[key]) {
                if (button.classList.contains('increase')) {
                    order[key].quantity++;
                } else if (button.classList.contains('decrease')) {
                    order[key].quantity--;
                    if (order[key].quantity <= 0) {
                        delete order[key];
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
        if (event.target === itemModal) {
            closeItemModal();
        }
    });

    // Add Note/Options button in item modal
    addNoteBtn.addEventListener('click', () => {
        if (currentProductForModal) {
            const note = kitchenNoteTextarea.value.trim();
            
            const selectedOptions = Array.from(document.querySelectorAll('.option-box.selected')).map(optionBox => {
                return {
                    name: optionBox.dataset.value,
                    price: parseFloat(optionBox.dataset.price)
                };
            });

            const productName = currentProductForModal.name;
            const productPrice = currentProductForModal.price;

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

    // Open Payment Modal Button
    openPaymentModalBtn.addEventListener('click', openPaymentModal);

    // Payment Modal Close buttons
    closePaymentModalBtn.addEventListener('click', closePaymentModal);
    cancelPaymentModalBtn.addEventListener('click', closePaymentModal);
    paymentModal.addEventListener('click', (event) => {
        if (event.target === paymentModal && !event.target.closest('.modal-content')) { // Only close if clicking on the overlay itself, not children
            closePaymentModal();
        }
    });

    // Payment method selection in payment modal (for non-split mode)
    paymentMethodGrid.addEventListener('click', (event) => {
        const clickedBox = event.target.closest('.payment-method-box');
        if (clickedBox) {
            document.querySelectorAll('.payment-method-box').forEach(box => {
                box.classList.remove('selected');
            });
            clickedBox.classList.add('selected');
        }
    });

    // Received Amount input change listener
    receivedAmountInput.addEventListener('input', calculateChange);

    // Split mode selection buttons (NEW)
    splitModesSelection.addEventListener('click', (event) => {
        const button = event.target.closest('.split-mode-button');
        if (button) {
            selectSplitMode(button.dataset.splitMode);
        }
    });

    // Los Split: Add new payment line
    addLosPaymentLineBtn.addEventListener('click', addLosPaymentLine);
    numPeopleLosInput.addEventListener('input', () => {
        const targetLines = parseInt(numPeopleLosInput.value) || 1;
        while (paymentLinesLos.length < targetLines) {
            addLosPaymentLine();
        }
        while (paymentLinesLos.length > targetLines && paymentLinesLos.length > 0) {
            // Remove the last line
            paymentLinesLos.pop();
            losPaymentLinesContainer.lastElementChild.remove();
        }
        updateLosRemaining();
        // Re-index displayed person numbers after adding/removing
        losPaymentLinesContainer.querySelectorAll('.split-payment-line').forEach((el, idx) => {
            el.querySelector('span').textContent = `Persoon ${idx + 1}`;
            el.dataset.lineIndex = idx;
        });
    });

    // Los Split: Calculate remaining
    calculateRemainingLosBtn.addEventListener('click', updateLosRemaining);

    // Even Split: Number of people input
    numPeopleEvenInput.addEventListener('input', updateEvenSplitPayments);

    // On Dish Split: Add new payment bill
    addOnDishPaymentLineBtn.addEventListener('click', addOnDishPaymentBill);

    // Checkout button logic
    checkoutBtn.addEventListener('click', () => {
        const totalOutstanding = calculateTotal();
        let paymentInfo = [];
        let paymentSuccess = false;

        if (currentSplitMode === 'none') {
            const received = parseFloat(receivedAmountInput.value) || 0;
            if (received < totalOutstanding) {
                alert('Ontvangen bedrag is te laag!');
                return;
            }
            const selectedMethod = document.querySelector('.payment-method-box.selected');
            const method = selectedMethod ? selectedMethod.dataset.method : 'Onbekend';
            paymentInfo.push({
                amount: totalOutstanding.toFixed(2),
                received: received.toFixed(2),
                change: (received - totalOutstanding).toFixed(2),
                method: method,
                type: 'Normal'
            });
            paymentSuccess = true;

        } else if (currentSplitMode === 'los') {
            const paidByLines = paymentLinesLos.reduce((sum, line) => sum + line.amount, 0);
            const remainingLos = totalOutstanding - paidByLines;

            if (remainingLos > 0.01) { // Allow for small floating point discrepancies
                alert(`Er is nog € ${remainingLos.toFixed(2)} openstaand.`);
                return;
            }

            paymentLinesLos.forEach((line, index) => {
                paymentInfo.push({
                    person: `Persoon ${index + 1}`,
                    amount: line.amount.toFixed(2),
                    method: line.method,
                    type: 'Los'
                });
            });
            paymentSuccess = true;

        } else if (currentSplitMode === 'even') {
            const numPeople = parseInt(numPeopleEvenInput.value) || 1;
            const amountPerPerson = totalOutstanding / numPeople;
            for (let i = 0; i < numPeople; i++) {
                const personSection = evenPaymentSectionsContainer.querySelector(`.payment-method-grid-small[data-person-index="${i}"]`);
                const selectedMethod = personSection.querySelector('.payment-method-box-small.selected');
                const method = selectedMethod ? selectedMethod.dataset.method : 'Contant';
                paymentInfo.push({
                    person: `Persoon ${i + 1}`,
                    amount: amountPerPerson.toFixed(2),
                    method: method,
                    type: 'Gelijkmatig'
                });
            }
            paymentSuccess = true;

        } else if (currentSplitMode === 'ondish') {
            const remainingOnDish = parseFloat(onDishRemainingAmountSpan.textContent.replace('€ ', ''));
            if (remainingOnDish > 0.01) {
                alert(`Nog niet alle gerechten zijn aan een rekening toegewezen. Nog ${remainingOnDish.toFixed(2)} openstaand.`);
                return;
            }
            onDishPaymentBills.forEach((bill, index) => {
                paymentInfo.push({
                    bill: `Bill ${index + 1}`,
                    items: bill.items.map(key => order[key].name + ' x ' + order[key].quantity),
                    amount: bill.total.toFixed(2),
                    method: bill.method,
                    type: 'Op gerecht'
                });
            });
            paymentSuccess = true;
        }

        if (paymentSuccess) {
            let alertMessage = 'Betaling voltooid!\n\n';
            paymentInfo.forEach(p => {
                if (p.type === 'Normal') {
                    alertMessage += `Totaal: € ${p.amount}\nOntvangen: € ${p.received}\nWisselgeld: € ${p.change}\nBetaalmethode: ${p.method}\n`;
                } else if (p.type === 'Los' || p.type === 'Gelijkmatig') {
                    alertMessage += `${p.person}: € ${p.amount} (${p.method})\n`;
                } else if (p.type === 'Op gerecht') {
                    alertMessage += `${p.bill}: € ${p.amount} (${p.method})\n  Gerechten: ${p.items.join(', ')}\n`;
                }
            });
            alert(alertMessage);

            // Clear the order and close modal after successful payment
            order = {}; // Clear the order
            updateOrderDisplay(); // Update display to show empty order
            closePaymentModal();
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