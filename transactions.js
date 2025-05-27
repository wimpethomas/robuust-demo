document.addEventListener('DOMContentLoaded', () => {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const body = document.body;
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const transactionTypeSelect = document.getElementById('transactionType');
    const transactionSections = document.querySelectorAll('.transaction-section');

    // Select elements for summary cards (All Transactions section)
    const totalTransactionsCard = document.getElementById('totalTransactions');
    const averageCheckCard = document.getElementById('averageCheck');
    const averageCoversCard = document.getElementById('averageCovers');

    // --- Dark Mode Toggle Logic (Copied from revenue.js for consistency) ---
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

    // --- Date Picker Logic (Copied from revenue.js) ---
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');

    startDateInput.value = `${yyyy}-${mm}-01`; // Default to start of current month
    endDateInput.value = `${yyyy}-${mm}-${dd}`; // Default to today

    startDateInput.addEventListener('change', () => {
        renderTransactionData();
    });
    endDateInput.addEventListener('change', () => {
        renderTransactionData();
    });

    // --- Transaction Type Selector Logic ---
    transactionTypeSelect.addEventListener('change', () => {
        renderTransactionData();
    });

    // --- Aggregated Data (Extracted from Transactions.png) ---
    const aggregatedTransactionsData = {
        totalTransactions: 337,
        averageCheck: 45.20,
        averageCovers: 2.5,
        paymentMethods: ['Cash', 'Card', 'Mobile Pay'],
        coworkers: ['John Doe', 'Jane Smith', 'Peter Jones']
    };

    // --- Helper function to generate a random transaction ID ---
    function generateTransactionId() {
        return 'TRN-' + Math.random().toString(36).substr(2, 9).toUpperCase();
    }

    // --- Helper function to generate a random time ---
    function generateRandomTime() {
        const hours = Math.floor(Math.random() * 8) + 12; // Between 12 PM and 7 PM
        const minutes = Math.floor(Math.random() * 60);
        return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
    }

    // --- Helper function to generate random daily transaction data ---
    function generateRandomDailyTransactionData(type, start, end) {
        const data = [];
        let currentDate = new Date(start);

        while (currentDate <= new Date(end)) {
            const dateString = currentDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const numTransactionsToday = Math.floor(aggregatedTransactionsData.totalTransactions / 30 * (0.8 + Math.random() * 0.4)); // Distribute transactions over ~30 days

            if (type === 'all') {
                for (let i = 0; i < numTransactionsToday; i++) {
                    const transactionId = generateTransactionId();
                    const time = generateRandomTime();
                    const table = Math.floor(Math.random() * 20) + 1; // Random table 1-20
                    const amount = aggregatedTransactionsData.averageCheck * (0.8 + Math.random() * 0.4); // Vary amount around avg check
                    const paymentMethod = aggregatedTransactionsData.paymentMethods[Math.floor(Math.random() * aggregatedTransactionsData.paymentMethods.length)];
                    const coworker = aggregatedTransactionsData.coworkers[Math.floor(Math.random() * aggregatedTransactionsData.coworkers.length)];
                    
                    data.push({
                        date: dateString,
                        time: time,
                        transactionId: transactionId,
                        table: table,
                        amount: amount,
                        paymentMethod: paymentMethod,
                        coworker: coworker
                    });
                }
            } else if (type === 'perPaymentMethod') {
                const dailyPaymentMethodSummary = {};
                for (let i = 0; i < numTransactionsToday; i++) {
                    const amount = aggregatedTransactionsData.averageCheck * (0.8 + Math.random() * 0.4);
                    const paymentMethod = aggregatedTransactionsData.paymentMethods[Math.floor(Math.random() * aggregatedTransactionsData.paymentMethods.length)];

                    if (!dailyPaymentMethodSummary[paymentMethod]) {
                        dailyPaymentMethodSummary[paymentMethod] = { transactions: 0, amount: 0 };
                    }
                    dailyPaymentMethodSummary[paymentMethod].transactions++;
                    dailyPaymentMethodSummary[paymentMethod].amount += amount;
                }
                for (const method in dailyPaymentMethodSummary) {
                    data.push({
                        date: dateString,
                        paymentMethod: method,
                        totalTransactions: dailyPaymentMethodSummary[method].transactions,
                        totalAmount: dailyPaymentMethodSummary[method].amount
                    });
                }
            } else if (type === 'perCoworker') {
                const dailyCoworkerSummary = {};
                for (let i = 0; i < numTransactionsToday; i++) {
                    const amount = aggregatedTransactionsData.averageCheck * (0.8 + Math.random() * 0.4);
                    const coworker = aggregatedTransactionsData.coworkers[Math.floor(Math.random() * aggregatedTransactionsData.coworkers.length)];

                    if (!dailyCoworkerSummary[coworker]) {
                        dailyCoworkerSummary[coworker] = { transactions: 0, sales: 0 };
                    }
                    dailyCoworkerSummary[coworker].transactions++;
                    dailyCoworkerSummary[coworker].sales += amount;
                }
                for (const coworker in dailyCoworkerSummary) {
                    data.push({
                        date: dateString,
                        coworkerName: coworker,
                        totalTransactions: dailyCoworkerSummary[coworker].transactions,
                        totalSales: dailyCoworkerSummary[coworker].sales
                    });
                }
            }
            currentDate.setDate(currentDate.getDate() + 1);
        }
        return data;
    }

    // --- Render Transaction Data Function ---
    function renderTransactionData() {
        // Hide all sections first
        transactionSections.forEach(section => {
            section.classList.remove('active');
        });

        const selectedType = transactionTypeSelect.value;
        const targetSection = document.getElementById(`${selectedType}-transactions-section`);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        const startDate = startDateInput.value;
        const endDate = endDateInput.value;

        if (selectedType === 'all') {
            // Update summary cards with aggregated data from screenshot
            totalTransactionsCard.textContent = `${aggregatedTransactionsData.totalTransactions}`;
            averageCheckCard.textContent = `€ ${aggregatedTransactionsData.averageCheck.toFixed(2)}`;
            averageCoversCard.textContent = `${aggregatedTransactionsData.averageCovers.toFixed(1)}`;
            
            // Populate Daily All Transactions Table
            const dailyAllTransactionsTableBody = document.querySelector('.daily-all-transactions-table tbody');
            dailyAllTransactionsTableBody.innerHTML = '';
            const dailyData = generateRandomDailyTransactionData('all', startDate, endDate);
            dailyData.forEach(item => {
                const row = dailyAllTransactionsTableBody.insertRow();
                row.insertCell().textContent = item.date;
                row.insertCell().textContent = item.time;
                row.insertCell().textContent = item.transactionId;
                row.insertCell().textContent = item.table;
                row.insertCell().textContent = `€ ${item.amount.toFixed(2)}`;
                row.insertCell().textContent = item.paymentMethod;
                row.insertCell().textContent = item.coworker;
            });

        } else if (selectedType === 'perPaymentMethod') {
            const dailyPaymentMethodTableBody = document.querySelector('.daily-paymentmethod-transactions-table tbody');
            dailyPaymentMethodTableBody.innerHTML = '';
            const dailyData = generateRandomDailyTransactionData('perPaymentMethod', startDate, endDate);
            dailyData.forEach(item => {
                const row = dailyPaymentMethodTableBody.insertRow();
                row.insertCell().textContent = item.date;
                row.insertCell().textContent = item.paymentMethod;
                row.insertCell().textContent = item.totalTransactions;
                row.insertCell().textContent = `€ ${item.totalAmount.toFixed(2)}`;
            });

        } else if (selectedType === 'perCoworker') {
            const dailyCoworkerTableBody = document.querySelector('.daily-coworker-transactions-table tbody');
            dailyCoworkerTableBody.innerHTML = '';
            const dailyData = generateRandomDailyTransactionData('perCoworker', startDate, endDate);
            dailyData.forEach(item => {
                const row = dailyCoworkerTableBody.insertRow();
                row.insertCell().textContent = item.date;
                row.insertCell().textContent = item.coworkerName;
                row.insertCell().textContent = item.totalTransactions;
                row.insertCell().textContent = `€ ${item.totalSales.toFixed(2)}`;
            });
        }
    }

    // Initial render based on default selections
    renderTransactionData();
});