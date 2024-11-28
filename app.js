document.getElementById('transactionForm').addEventListener('submit', createTransaction);
document.getElementById('filterType').addEventListener('change', loadTransactions);

function createTransaction(e) {
    e.preventDefault();

    let type = document.getElementById('type').value;
    let category = document.getElementById('category').value;
    let amount = document.getElementById('amount').value;
    let date = document.getElementById('date').value;

    fetch('http://localhost:5000/transactions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ type, category, amount, date })
    })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Transaction created!') {
            loadTransactions();
        }
    });
}

function loadTransactions() {
    let filterType = document.getElementById('filterType').value;
    
    fetch('http://localhost:5000/transactions')
    .then(response => response.json())
    .then(transactions => {
        let transactionContainer = document.getElementById('transactions');
        transactionContainer.innerHTML = '';
        transactions.forEach(transaction => {
            if (filterType === 'All' || transaction.type === filterType) {
                transactionContainer.innerHTML += `
                    <div class="transaction" data-id="${transaction.id}">
                        <p>Type: ${transaction.type}</p>
                        <p>Category: ${transaction.category}</p>
                        <p>Amount: ${transaction.amount}</p>
                        <p>Date: ${transaction.date}</p>
                        <div class="transaction-buttons">
                            <button onclick="editTransaction(${transaction.id})">Edit</button>
                            <button onclick="deleteTransaction(${transaction.id})">Delete</button>
                        </div>
                    </div>
                `;
            }
        });
    });
}

function deleteTransaction(id) {
    fetch(`http://localhost:5000/transactions/${id}`, { method: 'DELETE' })
    .then(response => response.json())
    .then(data => {
        if (data.message === 'Transaction deleted!') {
            loadTransactions();
        }
    });
}

function editTransaction(id) {
    let transactionElement = document.querySelector(`.transaction[data-id="${id}"]`);
    let type = transactionElement.querySelector('p:nth-child(1)').innerText.split(': ')[1];
    let category = transactionElement.querySelector('p:nth-child(2)').innerText.split(': ')[1];
    let amount = transactionElement.querySelector('p:nth-child(3)').innerText.split(': ')[1];
    let date = transactionElement.querySelector('p:nth-child(4)').innerText.split(': ')[1];

    document.getElementById('type').value = type;
    document.getElementById('category').value = category;
    document.getElementById('amount').value = amount;
    document.getElementById('date').value = date;

    document.getElementById('transactionForm').addEventListener('submit', function updateTransaction(e) {
        e.preventDefault();

        fetch(`http://localhost:5000/transactions/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                type: document.getElementById('type').value,
                category: document.getElementById('category').value,
                amount: document.getElementById('amount').value,
                date: document.getElementById('date').value,
            })
        })
        .then(response => response.json())
        .then(data => {
            if (data.message === 'Transaction updated!') {
                loadTransactions();
                document.getElementById('transactionForm').removeEventListener('submit', updateTransaction);
                document.getElementById('transactionForm').reset();
            }
        });
    });
}

window.onload = loadTransactions;
