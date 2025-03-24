document.addEventListener("DOMContentLoaded", function () {
    let expenses = JSON.parse(localStorage.getItem("expenses")) || [];
    let vendors = JSON.parse(localStorage.getItem("vendors")) || ["Amazon", "Flipkart", "Local Store", "Walmart"];
    let editIndex = null;

    let vendorDropdown = document.getElementById("expense-vendor");
    let vendorPopup = document.getElementById("vendor-popup");
    let newVendorInput = document.getElementById("new-vendor-name");

    function updateVendorDropdown() {
        vendorDropdown.innerHTML = '<option value="" disabled selected>Select Vendor</option>';
        vendors.forEach(vendor => {
            let option = document.createElement("option");
            option.value = vendor;
            option.textContent = vendor;
            vendorDropdown.appendChild(option);
        });
    }

    updateVendorDropdown();

    // Open Add Vendor Popup
    document.getElementById("add-vendor-btn").addEventListener("click", function () {
        vendorPopup.style.display = "block";
    });

    // Close Popup
    document.getElementById("close-popup-btn").addEventListener("click", function () {
        vendorPopup.style.display = "none";
    });

    // Save Vendor
    document.getElementById("save-vendor-btn").addEventListener("click", function () {
        let newVendor = newVendorInput.value.trim();
        if (newVendor !== "" && !vendors.includes(newVendor)) {
            vendors.push(newVendor);
            localStorage.setItem("vendors", JSON.stringify(vendors));
            updateVendorDropdown();
        }
        newVendorInput.value = "";
        vendorPopup.style.display = "none";
    });

    // Remove Vendor
    document.getElementById("remove-vendor-btn").addEventListener("click", function () {
        let selectedVendor = prompt("Enter the vendor name to remove:");
        if (selectedVendor && vendors.includes(selectedVendor)) {
            vendors = vendors.filter(vendor => vendor !== selectedVendor);
            localStorage.setItem("vendors", JSON.stringify(vendors));
            updateVendorDropdown();
        }
    });

    // Handle Add & Edit Expense
    document.getElementById("expense-form").addEventListener("submit", function (event) {
        event.preventDefault();

        let date = document.getElementById("expense-date").value;
        let vendor = document.getElementById("expense-vendor").value;
        let invoice = document.getElementById("expense-invoice").value;
        let amount = document.getElementById("expense-amount").value;
        let status = document.getElementById("expense-status").value;
        let remarks = document.getElementById("expense-remarks").value;

        let expense = { date, vendor, invoice, amount, status, remarks };

        if (editIndex !== null) {
            expenses[editIndex] = expense;
            editIndex = null;
            document.getElementById("add-edit-btn").innerText = "Add Expense";
        } else {
            expenses.push(expense);
        }

        saveData();
        updateTable();
        document.getElementById("expense-form").reset();
    });

    function saveData() {
        localStorage.setItem("expenses", JSON.stringify(expenses));
    }

    function updateTable(filteredExpenses = expenses) {
        let table = document.getElementById("expense-list");
        table.innerHTML = "";

        let totalFiltered = 0;

        filteredExpenses.forEach((expense, index) => {
            let row = table.insertRow();
            row.innerHTML = `
                <td>${expense.date}</td>
                <td>${expense.vendor}</td>
                <td>${expense.invoice}</td>
                <td>${expense.amount}</td>
                <td>${expense.status}</td>
                <td>${expense.remarks}</td>
                <td>
                    <button onclick="editExpense(${index})">Edit</button>
                    <button onclick="deleteExpense(${index})">Delete</button>
                </td>
            `;
            totalFiltered += parseFloat(expense.amount);
        });

        document.getElementById("filtered-total-expenses").textContent = `Filtered Total Expenses: ₹${totalFiltered}`;
    }

    window.editExpense = function (index) {
        let expense = expenses[index];
        document.getElementById("expense-date").value = expense.date;
        document.getElementById("expense-vendor").value = expense.vendor;
        document.getElementById("expense-invoice").value = expense.invoice;
        document.getElementById("expense-amount").value = expense.amount;
        document.getElementById("expense-status").value = expense.status;
        document.getElementById("expense-remarks").value = expense.remarks;

        editIndex = index;
        document.getElementById("add-edit-btn").innerText = "Save Changes";
    };

    window.deleteExpense = function (index) {
        expenses.splice(index, 1);
        saveData();
        updateTable();
    };

    // Filter by Month
    document.getElementById("filter-btn").addEventListener("click", function () {
        let selectedMonth = document.getElementById("filter-month").value;
        let filteredExpenses = expenses.filter(exp => exp.date.startsWith(selectedMonth));
        updateTable(filteredExpenses);
    });

    // Search Expenses
    document.getElementById("search-expense").addEventListener("input", function () {
        let searchValue = this.value.toLowerCase();
        let filtered = expenses.filter(exp => 
            exp.vendor.toLowerCase().includes(searchValue) || 
            exp.invoice.toLowerCase().includes(searchValue)
        );
        updateTable(filtered);
    });

    // Export to Excel
    document.getElementById("export-btn").addEventListener("click", function () {
        let ws = XLSX.utils.json_to_sheet(expenses);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Expenses");
        XLSX.writeFile(wb, "Expenses.xlsx");
    });

    updateTable();
});
