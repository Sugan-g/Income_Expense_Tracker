//Load saved transaction or empty array if none 
let transactions = JSON.parse(localStorage.getItem('transactions')) || [];
//make nextId continues from last transactions
let nextId = transactions.length > 0 ? Math.max(...transactions.map(t => t.id)) + 1 : 1;

const submitBtn = document.querySelector('#form button');
let editingId = null;
let tbody = null;

function init() {
    //DOM Elements
    const descInput = document.getElementById('desc');
    const expAmount = document.getElementById('amount');
    tbody = document.getElementById('table-body');
    let currentEditRow = null;
    nextId = 1;
    document.getElementById('form').addEventListener('submit', function (e) {
        e.preventDefault();

        const desc = descInput.value.trim();
        const amnt = expAmount.value.trim();
        if (desc === '') {
            alert("Please enter description");
            return;
        } else if (amnt === '') {
            alert("Please enter  amount");
            return;
        }
        if (editingId != null) {
            const index = transactions.findIndex(t => t.id === editingId);
            if (index > -1) {
                transactions[index].desc = desc;
                transactions[index].amount = Number(amnt);
            }
            localStorage.setItem('transactions', JSON.stringify(transactions));
            editingId = null;

        } else {
            const newTransaction = {
                id: nextId,
                desc: desc,
                amount: Number(amnt)
            };
            transactions.push(newTransaction);
            //save updated array to local storage 
            localStorage.setItem('transactions', JSON.stringify(transactions));
            nextId++;
        }
        descInput.value = '';
        expAmount.value = '';
        document.querySelector('#form button').textContent = 'Add';
        updateTable();
    });
}


function editRow(id) {
    const row = tbody.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        const descExp = row.cells[0].innerText;
        const amtExp = row.cells[1].innerText.replace(/,/g, '');

        document.getElementById('desc').value = descExp;
        document.getElementById('amount').value = amtExp;
        editingId = id;
        document.querySelector('#form button').textContent = "Update";
    }

}

function deleteRow(id) {
    transactions = transactions.filter(t => t.id !== id);
    localStorage.setItem('transactions', JSON.stringify(transactions));
    const row = tbody.querySelector(`tr[data-id="${id}"]`);
    if (row) {
        row.remove();
    }
    updateTotals();
}

//function to update to total
function updateTotals() {
    let income = 0;
    let expense = 0;
    transactions.forEach(txn => {
        const amt = Number(txn.amount);
        if (!isNaN(amt)) {
            if (amt > 0) {
                income += amt;
            } else {
                expense += amt;
            }
        }

    });
    //update the income ,expense and total balance

    document.getElementById("inc-amt").textContent = income.toFixed(2);
    document.getElementById("exp-amt").textContent = Math.abs(expense).toFixed(2);
    document.getElementById("balance").textContent = (income + expense).toFixed(2);
}


function updateTable(filter = "all") {
    if (!tbody) return;
    tbody.innerHTML = "";
    //radio button filter
    let filtertransactions = transactions;
    if (filter == "income") {
        filtertransactions = transactions.filter(t => t.amount > 0);
    } else if (filter == "expense") {
        filtertransactions = transactions.filter(t => t.amount < 0);
    }
    filtertransactions.forEach(t => {
        const tr = document.createElement("tr");
        tr.setAttribute("data-id", t.id);
        tr.innerHTML = `
        <td>${t.desc}</td>
        <td class="${t.amount > 0 ? 'plus' : 'minus'}"> ${Number(t.amount).toFixed(2)}</td>
        <td>
        <button class="btn-action btn-edit" onclick="editRow(${t.id})">Edit</button>
        <button class="btn-action btn-delete" onclick="deleteRow(${t.id})">Delete</button>
        </td>
        `;
        tbody.appendChild(tr);

    });
    updateTotals();
}

//while page load existing data will be on table and totals
document.addEventListener('DOMContentLoaded', () => {
    init();
    updateTable();
    updateTotals();

    //enable filter functionality 
    document.querySelectorAll('input[name="filter"]').forEach(radio => {
        radio.addEventListener('change', function () {
            updateTable(this.value);
        });
    });
});

document.getElementById('reset-btn').addEventListener('click', function () {
    document.getElementById("desc").value = '';
    document.getElementById("amount").value = '';
    editingId = null;
    document.querySelector('#form button[type="submit"]').textContent = "Add Transaction";
});