class BudgetApp {
    // Inicjalizacja zmiennych
    switcherInput = null;
    descriptionInput = null;
    valueInput = null;
    enterButton = null;
    balanceList = null;
    balanceListIncomes = null;
    balanceListExpenses = null;
    deleteButtons = null;
    totalBudgetInfo = null;
    error = null;
    categoryInput = null;
    subcategoryInput = null;
    dateInput = null;
    currency = 'PLN';
    totalBudget = 0;
    editedItem = null;
    balanceItems = [];
    numberOfItems = 0;

    UiSelectors = {
        switcherInput: 'switcher',
        descriptionInput: 'description',
        valueInput: 'value',
        enterButton: '[data-enter-button]',
        balanceList: '[data-balance-list]',
        balanceListIncomes: '[data-balance-list-incomes]',
        balanceListExpenses: '[data-balance-list-expenses]',
        itemDescription: '[data-item-description]',
        itemValue: '[data-item-value]',
        totalBudgetInfo: '[data-total-budget-info]',
        deleteButton: '[data-delete-button]',
        editButton: '[data-edit-button]',
        error: '[data-error]',
        categoryInput: 'category',
        subcategoryInput: 'subcategory',
        dateInput: 'date',
    };
    
    

    initializeApp() {
        // Inicjalizacja elementów DOM
        this.enterButton = document.querySelector(this.UiSelectors.enterButton);
        this.descriptionInput = document.getElementById 
        (this.UiSelectors.descriptionInput);
        this.valueInput = document.getElementById 
        (this.UiSelectors.valueInput);
        this.switcherInput = document.getElementById
        (this.UiSelectors.switcherInput);
        //this.categoryInput = document.getElementById(this.UiSelectors.categoryInput);
        //this.subcategoryInput = document.getElementById(this.UiSelectors.subcategoryInput);
        //this.dateInput = document.getElementById(this.UiSelectors.dateInput);
        this.categoryInput = document.getElementById('category');
        this.subcategoryInput = document.getElementById('subcategory');
        this.dateInput = document.getElementById('date');
        this.balanceList = document.querySelector
        (this.UiSelectors.balanceList);
        this.balanceListIncomes = document.querySelector
        (this.UiSelectors.balanceListIncomes);
        this.balanceListExpenses = document.querySelector
        (this.UiSelectors.balanceListExpenses);
        this.totalBudgetInfo = document.querySelector
        (this.UiSelectors.totalBudgetInfo);
        this.error = document.querySelector
        (this.UiSelectors.error);
        document.getElementById('menu-icon').addEventListener('click', () => {
            const categoryList = document.getElementById('category-list');
            categoryList.style.display = categoryList.style.display === 'none' ? 'block' : 'none';
            const subcategoryList = document.getElementById('subcategory-list');
            subcategoryList.style.display = subcategoryList.style.display === 'none' ? 'block' : 'none';
        });
        

        // Dodaj event listenery
        this.addEventListeners();
        // Pobierz dane z localStorage 
      //  this.getLocalStorage();

        // Dodaj kategorie i podkategorie do listy
        this.generateCategoryList();

        // Dodaj event listenery do kategorii i podkategorii
        this.addCategoryEventListeners();

        // Dodaj podkategorie do listy
        this.generateSubcategoryList();

        // Dodaj event listenery do podkategorii
        this.addSubcategoryEventListeners();

        // Wyświetl wszystkie transakcje
        this.displayTransactions(this.balanceItems);

        //// Dodaj event listener do przycisku wylogowania
        //document.getElementById('logout').addEventListener('click', () => {
        //    localStorage.removeItem('token');
        //    window.location.href = 'BudgetApppart1.html';
        //});
        
        // Dodaj elementy do listy z localStorage
        // this.balanceItems.forEach(({id, description, value, isPlus, }) => {
        // isPlus 
        //     ? this.balanceListIncomes.insertAdjacentHTML(
        //         'beforeend',
        //          this.createItem(id, isPlus, description, value)
        //         )
        //     : this.balanceListExpenses.insertAdjacentHTML(
        //         'beforeend',
        //          this.createItem(id, isPlus, description, value)
        //         );
    //  } );

        this.balanceItems.forEach(({ id, description, value, isPlus, category, subcategory, date }) => {
        const element = isPlus ? this.balanceListIncomes : this.balanceListExpenses;
        element.insertAdjacentHTML('beforeend', this.createItem(id, isPlus, description, value, category, subcategory, date));
    });

        // Zaktualizuj całkowity budżet
        this.updateTotalBudget();
        this.toggleListVisibility();
    }

    addEventListeners() {
        this.enterButton.addEventListener('click', () => 
            this.addItem());
        this.descriptionInput.addEventListener('blur', () => this.hideError());
        this.valueInput.addEventListener('blur', () => this.hideError());

        this.categoryInput.addEventListener('blur', (e) => this.hideError());
        this.subcategoryInput.addEventListener('blur', (e) => this.hideError());
        this.dateInput.addEventListener('blur', (e) => this.hideError());

        this.categoryInput.addEventListener('change', (e) => this.updateSubcategories(e.target.value));
        

        this.balanceList.addEventListener('click', (e) => {
            this.listClickHandler(e.target);
        });


        document.addEventListener('keyup', (e) => {
            if(e.key === 'Enter') {
                this.addItem();
            }
        });
    }

    createItem(id, isPositive, description, price, category, subcategory, date) {
        return `
        <li class="list_item" id="${id}">
            <label class="item_label">
                <span>Description:</span>
                <p class="item_description" data-item-description>${description}</p>
            </label>
            <label class="item_label">
                <span>Value:</span>
                <p class="item_value ${isPositive ? 'item_value--income' : 'item_value--expense'}" data-item-value>
                    ${this.formatPrice(parseFloat(price), isPositive)}
                </p>
            </label>
            <label class="item_label">
                <span>Category:</span>
                <p class="item_category">${category}</p>
            </label>
            <label class="item_label">
                <span>Subcategory:</span>
                <p class="item_subcategory">${subcategory}</p>
            </label>
            <label class="item_label">
                <span>Date:</span>
                <p class="item_date">${date}</p>
            </label>
            <div class="item_buttons">
                <button class="item_button item_button--edit" data-edit-button title="Edit"></button>
                <button class="item_button item_button--delete" data-delete-button title="Delete"></button>
            </div>
        </li>
        `
    }

    addItem() {
        const newItem = this.getInputsValues();
        if(!newItem) {
            this.showError();
            return;
        }

        if(this.editedItem) {
            this.updateItem();
            return;
        }
        const isNotChecked = !this.switcherInput.checked;
        const element = isNotChecked 
        ? this.balanceListIncomes 
        : this.balanceListExpenses;

        this.balanceItems.push(newItem);

        element.insertAdjacentHTML(
            'beforeend',
            this.createItem(
                newItem.id, 
                newItem.isPlus, 
                newItem.description, 
                newItem.value,
                newItem.category, 
                newItem.subcategory, 
                newItem.date
            )
        );
        this.resetInputsValues();

        this.updateTotalBudget();

        this.numberOfItems++;
        this.toggleListVisibility();
        this.setLocalStorage();

    }

    deleteItem(target) {
        const { element, id } = this.getListElement(target);
        const items = [...this.balanceItems];
        this.balanceItems = items.filter((item) => item.id !== id);
        

        element.remove();
        this.toggleListVisibility();
        this.setLocalStorage();
        this.updateTotalBudget();

    }

//     editItem(target) {
//     const { element, id } = this.getListElement(target);
//     this.editedItem = element;
//     const item = this.balanceItems.find((item) => item.id == id);

//     if (item) {
//         const { description, value, isPlus, category, subcategory, date } = item;
//         console.log(`Editing item: ${id}, ${description}, ${value}, ${isPlus}, ${category}, ${subcategory}, ${date}`);
//         this.descriptionInput.value = description;
//         this.valueInput.value = value;
//         this.switcherInput.checked = !isPlus;
//         this.categoryInput.value = category;
//         this.subcategoryInput.value = subcategory;
//         this.dateInput.value = date;
//     } else {
//         console.error('Item not found for editing');
//     }
// }


    editItem(target) {
        const { element, id } = this.getListElement(target);
        this.editedItem = element;
        const { description, value, isPlus, category, subcategory, 
            date } = this.balanceItems.find((item) => item.id == id);

        this.descriptionInput.value = description;
        this.valueInput.value = value;
        this.switcherInput.checked = !isPlus;
        this.categoryInput.value = category;
        this.subcategoryInput.value = subcategory;
        this.dateInput.date = date;

        this.toggleListVisibility();
        this.setLocalStorage();
        this.updateTotalBudget();

    }

    updateItem() {
        const items = [...this.balanceItems];
        let willBeUpdated = true;
        items.forEach((item) => {
            if(item.id === this.editedItem.id) {
                if(item.isPlus === !this.switcherInput.checked) {
                    // Aktualizacja wartości i opisu
                    item.value = this.valueInput.value;
                    item.description = this.descriptionInput.value;
                    item.category = this.categoryInput.value;
                    item.subcategory = this.subcategoryInput.value;
                    item.date = this.dateInput.date;
                }
                else {
                    // Usunięcie i dodanie nowego elementu w przypadku zmiany typu (przychód/wydatek)
                    this.deleteItem(this.editedItem.querySelector(this.UiSelectors.deleteButton));
                     this.editedItem = null;
                     this.addItem();
                     willBeUpdated = false;
                }
            }
        }); 

        if(!willBeUpdated) {
            return;
        }

        // Aktualizacja listy elementów
        this.balanceItems = items;
        this.editedItem.querySelector(this.UiSelectors.itemDescription).textContent = this.descriptionInput.value;
        this.editedItem.querySelector(this.UiSelectors.itemValue).textContent = this.formatPrice(parseFloat
            (this.valueInput.value /*, 10*/), !this.switcherInput.checked);

            // Aktualizacja całkowitego budżetu
            this.updateTotalBudget();
            // Zresetowanie wartości pól formularza
            this.resetInputsValues();
            // Przełączanie widoczności listy
            this.toggleListVisibility();
            // Zapis do localStorage
            this.setLocalStorage();
    }

   

    // createItem(id, isPositive, description, price, category, subcategory, date) {
    //     return `
    //     <li class="list_item" id="${id}">
    //                         <p class="item_description" data-item-description>${description}</p>
    //                         <p class="item_value ${isPositive ? 'item_value--income' : 'item_value--expense'}" data-item-value>${this.formatPrice(parseFloat(price /*, 10*/), isPositive)} </p>
    //                         <p class="item_category">${category}</p>
    //                         <p class="item_subcategory">${subcategory}</p>
    //                         <p class="item_date">${date}</p>
    //                         <div class="item_buttons">
    //                             <button class="item_button item_button--edit" data-edit-button title="Edit"></button>
    //                             <button class="item_button item_button--delete" data-delete-button title="Delete"></button>
    //                         </div>
    //                     </li>
    //     `;
    // }

    listClickHandler(target) {
        if(target.dataset && target.dataset.editButton !== undefined) {
            this.editItem(target);
        }
        if(target.dataset && target.dataset.deleteButton !== undefined) {
            this.deleteItem(target);
         }
    }

    getListElement(target) {
        const listElement = target.parentElement.parentElement;
        const listElementId = listElement.id; 

        return {element: listElement, id: listElementId};
    }

    getInputsValues() {
        const isPlus = !this.switcherInput.checked;
        const description = this.descriptionInput.value;
        const value = this.valueInput.value;
        const category = this.categoryInput.value;
        const subcategory = this.subcategoryInput.value;
        const date = this.dateInput.value;

        

        if(value > 0 && description) {
            return {
                id: this.editedItem ? this.editedItem.id :`${this.numberOfItems}`,
                isPlus,
                description,
                value,
                category,
                subcategory,
                date
            };
        }

        return null;
    }

    resetInputsValues() {
        this.descriptionInput.value = '';
        this.valueInput.value = '';
        this.switcherInput.checked = true;
    }

    updateTotalBudget() {
        this.totalBudget = 0;
        this.balanceItems.forEach(({isPlus, value}) => {
            isPlus 
            ? (this.totalBudget += parseFloat(value /*, 10*/)) 
            : (this.totalBudget -= parseFloat(value/*, 10*/))
        });

        this.totalBudgetInfo.innerHTML = `Your total budget is <span class="${
            this.totalBudget >= 0 
            ? 'balance_heading--positive' 
            : 'balance_heading--negative'}">
        ${this.formatPrice(Math.abs(this.totalBudget), this.totalBudget >= 0 ? true : false
    )}</span>`;
    }

    toggleListVisibility() {
        this.balanceListExpenses.children.length 
        ? this.balanceListExpenses.parentElement.classList.remove('hide')
        : this.balanceListExpenses.parentElement.classList.add('hide');
        this.balanceListIncomes.children.length
        ? this.balanceListIncomes.parentElement.classList.remove('hide')
        : this.balanceListIncomes.parentElement.classList.add('hide');
    }

    formatPrice(price, isPositive) {
        return `${isPositive ? '+' : '-'} ${this.setNumberOfDigits(price, 2)} ${this.currency}`;

    }

    setNumberOfDigits(number, digits) {
        return number.toFixed(digits);
    }

    setLocalStorage() {
        localStorage.setItem('balanceItems', JSON.stringify(this.balanceItems));
        localStorage.setItem('numberOfItems', JSON.stringify(this.numberOfItems));
    }

    getLocalStorage() {
        this.balanceItems = localStorage.getItem('balanceItems') 
        ? JSON.parse(localStorage.getItem('balanceItems'))
        : [];
        this.numberOfItems = localStorage.getItem('numberOfItems')
        ? JSON.parse(localStorage.getItem('numberOfItems'))
        : 0;
    }

    generateCategoryList() {
        const categories = {};
        this.balanceItems.forEach(item => {
            if (!categories[item.category]) {
                categories[item.category] = new Set();
            }
            categories[item.category].add(item.subcategory);
        });

        const categoryList = document.getElementById('category-list');
        categoryList.innerHTML = '';

        Object.keys(categories).forEach(category => {
            const categoryItem = document.createElement('li');
            categoryItem.textContent = category;
            const subcategoryList = document.createElement('ul');
            subcategoryList.style.display = 'none';

            categories[category].forEach(subcategory => {
                const subcategoryItem = document.createElement('li');
                subcategoryItem.dataset.subcategory = subcategory;
                subcategoryItem.textContent = subcategory;
                subcategoryList.appendChild(subcategoryItem);
            });

            categoryItem.appendChild(subcategoryList);
            categoryItem.addEventListener('click', () => {
                subcategoryList.style.display = subcategoryList.style.display === 'none' ? 'block' : 'none';
            });

            categoryList.appendChild(categoryItem);
        });
    }

    addCategoryEventListeners() {
        const categoryItems = document.querySelectorAll('[data-category]');
        categoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                e.stopPropagation();
                const category = e.target.dataset.category;
                this.filterTransactionsBySubcategory(category);
            });
        });
    }


    generateSubcategoryList() {
        const subcategories = new Set(this.balanceItems.map(item => item.subcategory));
        const subcategoryList = document.getElementById('subcategory-list');
        subcategoryList.innerHTML = '';

        subcategories.forEach(subcategory => {
            const listItem = document.createElement('li');
            listItem.dataset.subcategory = subcategory;
            listItem.textContent = subcategory;
            subcategoryList.appendChild(listItem);
        });
    }

    addSubcategoryEventListeners() {
        const subcategoryItems = document.querySelectorAll('[data-subcategory]');
        subcategoryItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const subcategory = e.target.dataset.subcategory;
                this.filterTransactionsBySubcategory(subcategory);
            });
        });
    }

    

    filterTransactionsByCategory(category) {
        const filteredTransactions = this.balanceItems.filter(transaction => transaction.category === category);
        this.displayTransactions(filteredTransactions);
    }

    filterTransactionsBySubcategory(subcategory) {
        const filteredTransactions = this.balanceItems.filter(transaction => transaction.subcategory === subcategory);
        this.displayTransactions(filteredTransactions);
    }

    displayTransactions(transactions) {
        const transactionList = document.getElementById('transaction-list');
        transactionList.innerHTML = '';

        transactions.forEach(transaction => {
            const transactionItem = document.createElement('li');
            transactionItem.textContent = `${transaction.description} - ${transaction.value} ${this.currency}`;
            transactionList.appendChild(transactionItem);
        });
    }

    showError() {
        this.error.classList.remove('hide');
    }

    hideError() {
        this.error.classList.add('hide');
    }

    updateSubcategories(category) {
        const subcategories = {
            Daily: ['Equipment', 'Transport'],
            Seasonal: ['Projects', 'Personnel'],
            Others: ['Others', 'Events'],
        };
        this.subcategoryInput.innerHTML = '<option value="">Select Subcategory</option>';
        if (subcategories[category]) {
            subcategories[category].forEach(sub => {
                const option = document.createElement('option');
                option.value = sub;
                option.textContent = sub;
                this.subcategoryInput.appendChild(option);
            });
        }
    }


    
}

// document.addEventListener('DOMContentLoaded', () => {
//     const form = document.getElementById('transaction-form');
//     const categoryInput = document.getElementById('category');
//     const menuIcon = document.getElementById('menu-icon');
//     const categoryMenu = document.getElementById('category-menu');
//     const categoryItems = document.querySelectorAll('.category');

//     // Pokaż/ukryj menu po kliknięciu ikony menu
//     menuIcon.addEventListener('click', () => {
//         categoryMenu.classList.toggle('hidden');
//     });

//     // Pokaż/ukryj podkategorie po kliknięciu kategorii
//     categoryItems.forEach(item => {
//         item.addEventListener('click', () => {
//             const subcategory = item.querySelector('.subcategory');
//             subcategory.classList.toggle('hidden');
//         });
//     });

//     // Ustaw domyślną kategorię, jeśli nie została podana
//     form.addEventListener('submit', (event) => {
//         if (categoryInput.value.trim() === '') {
//             categoryInput.value = 'Others';
//         }
//     });
// });

document.addEventListener('DOMContentLoaded', () => {
    const app = new BudgetApp();
    app.initializeApp();

    const form = document.getElementById('transaction-form');
    const categoryInput = document.getElementById('category');
    const menuIcon = document.getElementById('menu-icon');
    const categoryMenu = document.getElementById('category-menu');
    const categoryItems = document.querySelectorAll('.category');

    menuIcon.addEventListener('click', () => {
        categoryMenu.classList.toggle('hidden');
    });

    categoryItems.forEach(item => {
        item.addEventListener('click', () => {
            const category = item.querySelector('.category');
            category.classList.toggle('hidden');
        });
    });

    form.addEventListener('submit', (event) => {
        if (categoryInput.value.trim() === '') {
            categoryInput.value = 'Others';
        }
    });
});
