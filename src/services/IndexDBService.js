
import { DB_CONFIG } from '../config';
import {CUSTOM_BUDGET_CATEGORIES} from "../data/customBudgetCategories";

class IndexDBService {
    constructor() {
        this.db = null;
    }

    async initDB() {
        if (this.db) return this.db;

        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_CONFIG.name, DB_CONFIG.version);

            request.onerror = () => {
                reject(new Error('Failed to open database'));
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this.db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;

                if (!db.objectStoreNames.contains(DB_CONFIG.stores.customBudgets)) {
                    const store = db.createObjectStore(DB_CONFIG.stores.customBudgets, {keyPath: 'id'});
                    store.createIndex('userEmail', 'userEmail', {unique: false});
                    store.createIndex('createdAt', 'createdAt', {unique: false});
                }

                // Add the paycheckBudgets object store
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.paycheckBudgets)) {
                    const paycheckStore = db.createObjectStore(DB_CONFIG.stores.paycheckBudgets, { keyPath: 'id' });
                    paycheckStore.createIndex('userEmail', 'userEmail', { unique: false });
                    paycheckStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(DB_CONFIG.stores.businessBudgets)) {
                    const businessStore = db.createObjectStore(DB_CONFIG.stores.businessBudgets, { keyPath: 'id' });
                    businessStore.createIndex('userEmail', 'userEmail', { unique: false });
                    businessStore.createIndex('createdAt', 'createdAt', { unique: false });
                }

                if (!db.objectStoreNames.contains(DB_CONFIG.stores.backupInfo)) {
                    const backupStore = db.createObjectStore(DB_CONFIG.stores.backupInfo, { keyPath: 'id' });
                    backupStore.createIndex('userEmail', 'userEmail', { unique: false });
                    backupStore.createIndex('timestamp', 'timestamp', { unique: false });
                }

                if (!db.objectStoreNames.contains(DB_CONFIG.stores.customCategories)) {
                    const customCategoriesStore = db.createObjectStore(DB_CONFIG.stores.customCategories, { keyPath: 'id' });
                    customCategoriesStore.createIndex('name', 'name', { unique: true });

                    // Add default custom budget categories
                    const defaultCustomCategories = [
                        'Housing',
                        'Food',
                        'Transportation',
                        'Utilities',
                        'Insurance',
                        'Healthcare',
                        'Saving & Investments',
                        'Debt Payments',
                        'Personal Spending',
                        'Recreation & Entertainment',
                        'Education',
                        'Gifts & Donations',
                        'Travel',
                        'Childcare',
                        'Taxes',
                        'Miscellaneous'
                    ];

                    defaultCustomCategories.forEach((category, index) => {
                        customCategoriesStore.add({
                            id: index + 1,
                            name: category
                        });
                    });
                }

                // Add the paycheckCategories object store
                if (!db.objectStoreNames.contains(DB_CONFIG.stores.paycheckCategories)) {
                    const categoriesStore = db.createObjectStore(DB_CONFIG.stores.paycheckCategories, { keyPath: 'id' });
                    categoriesStore.createIndex('name', 'name', { unique: true });

                    // Add default categories
                    const defaultCategories = [
                        'Mortgage/Rent',
                        'Utilities',
                        'Transportation',
                        'Insurance',
                        'Healthcare',
                        'Savings',
                        'Debt Repayment',
                        'Education',
                        'Childcare',
                        'Entertainment',
                        'Dining Out',
                        'Travel',
                        'Gifts/Donations',
                        'Personal Care',
                        'Home Supplies',
                        'Subscriptions',
                        'Emergency Expenses',
                        'Groceries',
                        'Retail Shopping'
                    ];

                    defaultCategories.forEach((category, index) => {
                        categoriesStore.add({
                            id: index + 1,
                            name: category
                        });
                    });
                }

                if (!db.objectStoreNames.contains(DB_CONFIG.stores.businessCategories)) {
                    const businessCategoriesStore = db.createObjectStore(DB_CONFIG.stores.businessCategories, { keyPath: 'id' });
                    businessCategoriesStore.createIndex('name', 'name', { unique: true });

                    // Add default business expense categories
                    const defaultBusinessCategories = [
                        // Transportation
                        'Airfare',
                        'Train Tickets',
                        'Taxi/Rideshare',
                        'Car Rental',
                        'Fuel/Gas',
                        'Parking Fees',
                        'Tolls',
                        'Mileage Reimbursement',
                        'Public Transit',

                        // Accommodation
                        'Hotel/Lodging',
                        'Airbnb/Rental',
                        'Extended Stay',

                        // Meals & Entertainment
                        'Business Meals',
                        'Client Entertainment',
                        'Team Meals',
                        'Per Diem Food',

                        // Office Expenses
                        'Office Supplies',
                        'Printing/Copying',
                        'Postage/Shipping',
                        'Software Subscriptions',
                        'Equipment Rental',

                        // Communication
                        'Mobile Phone',
                        'Internet Expenses',
                        'Conference Calls',

                        // Professional Services
                        'Legal Fees',
                        'Accounting Services',
                        'Consulting Fees',

                        // Marketing & Advertising
                        'Promotional Materials',
                        'Digital Advertising',
                        'Print Advertising',
                        'Trade Show Fees',

                        // Training & Development
                        'Conference Registration',
                        'Course Fees',
                        'Books & Materials',
                        'Professional Memberships',

                        // Client-Related
                        'Client Gifts',
                        'Meeting Expenses',
                        'Proposal Materials',

                        // Miscellaneous
                        'Bank Fees',
                        'Currency Exchange',
                        'Visa/Travel Documents',
                        'Travel Insurance'
                    ];

                    defaultBusinessCategories.forEach((category, index) => {
                        businessCategoriesStore.add({
                            id: index + 1,
                            name: category
                        });
                    });
                }
            };
        });
    }

    async getCustomBudgetsByEmail(userEmail) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.customBudgets], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.customBudgets);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addCustomBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.customBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.customBudgets);
            const request = store.add(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateCustomBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.customBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.customBudgets);

            const completeCustomBudget = {
                ...budget,
                items: budget.items.map(item => ({
                    ...item,
                    image: item.image || null
                })),
                budgetCategory: budget.budgetCategory || null,
                updatedAt: new Date().toISOString()
            };

            const request = store.put(completeCustomBudget);

            request.onsuccess = () => resolve(completeCustomBudget);
            request.onerror = () => reject(request.error);
        });
    }
    async deleteCustomBudget(budgetId) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.customBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.customBudgets);
            const request = store.delete(budgetId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
    async getPaycheckBudgetsByEmail(userEmail) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addPaycheckBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
            const request = store.add(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updatePaycheckBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);

            const completePaycheckBudget = {
                ...budget,
                items: budget.items.map(item => ({
                    ...item,
                    image: item.image || null
                })),
                updatedAt: new Date().toISOString()
            };

            const request = store.put(completePaycheckBudget);

            request.onsuccess = () => resolve(completePaycheckBudget);
            request.onerror = () => reject(request.error);
        });
    }

    async deletePaycheckBudget(budgetId) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
            const request = store.delete(budgetId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getBusinessBudgetsByEmail(userEmail) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.businessBudgets], 'readonly');
            const store = transaction.objectStore(DB_CONFIG.stores.businessBudgets);
            const index = store.index('userEmail');
            const request = index.getAll(IDBKeyRange.only(userEmail));

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async addBusinessBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.businessBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.businessBudgets);
            const request = store.add(budget);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }

    async updateBusinessBudget(budget) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.businessBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.businessBudgets);

            // Create a complete business budget object with consistent structure
            const completeBusinessBudget = {
                ...budget,
                items: budget.items.map(item => ({
                    ...item,
                    image: item.image || null
                })),
                updatedAt: new Date().toISOString()
            };

            const request = store.put(completeBusinessBudget);

            request.onsuccess = () => resolve(completeBusinessBudget);
            request.onerror = () => reject(request.error);
        });
    }

    async deleteBusinessBudget(budgetId) {
        if (!this.db) await this.initDB();

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([DB_CONFIG.stores.businessBudgets], 'readwrite');
            const store = transaction.objectStore(DB_CONFIG.stores.businessBudgets);
            const request = store.delete(budgetId);

            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getCategories(budgetType = 'paycheck', budgetCategory = null) {
        if (!this.db) await this.initDB();

        // Determine the appropriate store name based on budgetType
        let storeName;
        if (budgetType === 'business') {
            storeName = DB_CONFIG.stores.businessCategories;
        } else if (budgetType === 'custom') {
            storeName = DB_CONFIG.stores.customCategories;
        } else {
            storeName = DB_CONFIG.stores.paycheckCategories;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readonly');
            const store = transaction.objectStore(storeName);
            const request = store.getAll();

            request.onsuccess = () => {
                // Filter categories based on budgetCategory if specified
                let categories = request.result.sort((a, b) => a.name.localeCompare(b.name));

                if (budgetType === 'custom' && budgetCategory) {
                    // Include both predefined categories and user-added categories for this budget category
                    const userCategories = categories.filter(cat => cat.budgetCategory === budgetCategory);

                    // Get predefined categories if they exist
                    const customCategoryData = CUSTOM_BUDGET_CATEGORIES[budgetCategory];
                    if (customCategoryData && customCategoryData.categories) {
                        // Add user categories that aren't in the predefined list
                        return resolve([
                            ...customCategoryData.categories.map((name, index) => ({
                                id: `predefined-${index}`,
                                name
                            })),
                            ...userCategories.filter(cat =>
                                !customCategoryData.categories.includes(cat.name)
                            )
                        ]);
                    }

                    // If no predefined categories, return just the user categories for this budgetCategory
                    return resolve(userCategories);
                }

                resolve(categories);
            };
            request.onerror = () => reject(request.error);
        });
    }

    async addCategory(category, budgetType = 'paycheck', budgetCategory = null) {
        if (!this.db) await this.initDB();

        let storeName;
        if (budgetType === 'business') {
            storeName = DB_CONFIG.stores.businessCategories;
        } else if (budgetType === 'custom') {
            storeName = DB_CONFIG.stores.customCategories;
        } else {
            storeName = DB_CONFIG.stores.paycheckCategories;
        }

        const categoryToAdd = { ...category };
        if (budgetType === 'custom' && budgetCategory) {
            categoryToAdd.budgetCategory = budgetCategory;
        }

        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([storeName], 'readwrite');
            const store = transaction.objectStore(storeName);
            const request = store.add(categoryToAdd);

            request.onsuccess = () => resolve(request.result);
            request.onerror = () => reject(request.error);
        });
    }
    async clearUserData(userEmail) {
        if (!this.db) await this.initDB();

        // Clear custom budgets
        const customBudgets = await this.getCustomBudgetsByEmail(userEmail);
        const customBudgetPromises = customBudgets.map(budget =>
            new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.stores.customBudgets], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.stores.customBudgets);
                const request = store.delete(budget.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        );

        const paycheckBudgets = await this.getPaycheckBudgetsByEmail(userEmail);
        const paycheckBudgetPromises = paycheckBudgets.map(budget =>
            new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.stores.paycheckBudgets], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.stores.paycheckBudgets);
                const request = store.delete(budget.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        );

        const businessBudgets = await this.getBusinessBudgetsByEmail(userEmail);
        const businessBudgetPromises = businessBudgets.map(budget =>
            new Promise((resolve, reject) => {
                const transaction = this.db.transaction([DB_CONFIG.stores.businessBudgets], 'readwrite');
                const store = transaction.objectStore(DB_CONFIG.stores.businessBudgets);
                const request = store.delete(budget.id);
                request.onsuccess = () => resolve();
                request.onerror = () => reject(request.error);
            })
        );

        return Promise.all([
            ...customBudgetPromises,
            ...paycheckBudgetPromises,
            ...businessBudgetPromises
        ]);
    }
}

export const indexdbService = new IndexDBService();