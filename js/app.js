// Main Application Module
const OrderSystem = {
    // State management
    state: {
        currentUser: null,
        selectedOrderDate: null,
        selectedDepartment: '',
        selectedCategory: 'all',
        cart: [],
        activeAdminTab: 'manageDates',
        currentSummaryData: [],
        existingOrderId: null,
        isLoading: false
    },

    // Data stores
    data: {
        users: [],
        departments: [],
        categories: [],
        products: [],
        orderDates: [],
        units: []
    },

    // Initialize application
    async init() {
        console.log("Initializing Order System...");
        
        try {
            // Load all data
            await this.loadAllData();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Initialize UI
            document.getElementById('loginPage').classList.remove('hidden');
            document.getElementById('mainApp').classList.add('hidden');
            
            // Populate department filter
            this.populateDepartmentFilter();
            
            // Render user selection
            OrderSystemAuth.renderUserSelection();
            
        } catch (error) {
            console.error('Initialization error:', error);
            OrderSystemUI.showNotification(`ไม่สามารถโหลดข้อมูลได้: ${error.message}`, true);
        }
    },

    // Load all data from Google Sheets
    async loadAllData() {
        const loginBox = document.querySelector('.login-box');
        const originalTitle = loginBox.querySelector('.login-title').textContent;
        loginBox.querySelector('.login-title').textContent = 'กำลังโหลดข้อมูล...';

        try {
            const dataPromises = [
                OrderSystemAPI.fetchData('Users'), 
                OrderSystemAPI.fetchData('Departments'), 
                OrderSystemAPI.fetchData('Categories'),
                OrderSystemAPI.fetchData('Products'), 
                OrderSystemAPI.fetchData('OrderDates'), 
                OrderSystemAPI.fetchData('Units')
            ];
            
            [
                this.data.users, 
                this.data.departments, 
                this.data.categories, 
                this.data.products, 
                this.data.orderDates, 
                this.data.units
            ] = await Promise.all(dataPromises);
            
            console.log("All data loaded successfully");
            loginBox.querySelector('.login-title').textContent = originalTitle;
            
        } catch (error) {
            loginBox.querySelector('.login-title').textContent = 'เกิดข้อผิดพลาดในการโหลด';
            throw error;
        }
    },

    // Populate department filter dropdown
    populateDepartmentFilter() {
        const deptFilter = document.getElementById('departmentFilter');
        deptFilter.innerHTML = '<option value="all">ทุกแผนก</option>' + 
            this.data.departments.map(dept => 
                `<option value="${dept.id}">${dept.name}</option>`
            ).join('');
    },

    // Setup global event listeners
    setupEventListeners() {
        // Search input with debouncing
        let searchTimeout;
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    OrderSystemOrders.renderProducts();
                }, CONFIG.DEBOUNCE_DELAY);
            });
        }

        // Checkout button
        const checkoutBtn = document.getElementById('checkoutBtn');
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => OrderSystemCart.checkout());
        }

        // Window click to close modals
        window.onclick = function(event) {
            const cartModal = document.getElementById('cartModal');
            if (event.target === cartModal) OrderSystemCart.close();
        }

        // Sidebar related event listeners removed

        // Header shrink and sticky category section
        const header = document.querySelector('.header');
        const categorySection = document.getElementById('categorySection');
        const headerActions = document.querySelector('.header-actions');

        if (header && categorySection && headerActions) {
            window.addEventListener('scroll', function() {
                const scrollPosition = window.scrollY;

                if (scrollPosition > 50) { // Threshold for shrinking header
                    header.classList.add('scrolled');
                    headerActions.classList.add('icons-only');

                    // Make category section sticky below the shrunken header
                    const shrunkenHeaderHeight = header.offsetHeight;
                    if (!categorySection.classList.contains('sticky-active')) {
                        categorySection.classList.add('sticky-active');
                    }
                    categorySection.style.top = `${shrunkenHeaderHeight}px`;

                } else {
                    header.classList.remove('scrolled');
                    headerActions.classList.remove('icons-only');

                    // Unstick category section
                    if (categorySection.classList.contains('sticky-active')) {
                        categorySection.classList.remove('sticky-active');
                        categorySection.style.top = '0px'; // Reset top value
                    }
                }
            });
        }
    }
};

// Storage utilities
const OrderSystemStorage = {
    saveCart() {
        if (OrderSystem.state.cart.length > 0) {
            localStorage.setItem('orderCart', JSON.stringify({
                cart: OrderSystem.state.cart,
                orderDate: OrderSystem.state.selectedOrderDate,
                department: OrderSystem.state.selectedDepartment,
                timestamp: new Date().getTime()
            }));
        } else {
            localStorage.removeItem('orderCart');
        }
    },
    
    loadCart() {
        const saved = localStorage.getItem('orderCart');
        if (saved) {
            const data = JSON.parse(saved);
            // Check if data is less than 24 hours old
            if (new Date().getTime() - data.timestamp < 24 * 60 * 60 * 1000) {
                return data;
            } else {
                localStorage.removeItem('orderCart');
            }
        }
        return null;
    },

    saveUserPreferences() {
        if (OrderSystem.state.currentUser) {
            localStorage.setItem('userPreferences', JSON.stringify({
                lastCategory: OrderSystem.state.selectedCategory,
                userId: OrderSystem.state.currentUser.id
            }));
        }
    },

    loadUserPreferences() {
        const prefs = localStorage.getItem('userPreferences');
        return prefs ? JSON.parse(prefs) : null;
    }
};

// UI utilities
const OrderSystemUI = {
    showLoading(show, text = 'กำลังโหลด...') {
        const overlay = document.getElementById('loadingOverlay');
        const loadingText = document.getElementById('loadingText');
        if (show) {
            loadingText.textContent = text;
            overlay.classList.remove('hidden');
        } else {
            setTimeout(() => overlay.classList.add('hidden'), CONFIG.LOADING_DELAY);
        }
    },

    showNotification(message, isError = false) {
        const notification = document.createElement('div');
        notification.className = `notification-toast ${isError ? 'error' : 'success'}`;
        notification.innerHTML = `
            <span>${isError ? '❌' : '✅'}</span>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'fadeOut 0.3s';
            setTimeout(() => notification.remove(), 300);
        }, CONFIG.NOTIFICATION_DURATION);
    },

    updateCartBadge() {
        const totalItems = OrderSystem.state.cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartCountEl = document.getElementById('cartCount');
        const oldCount = parseInt(cartCountEl.textContent);
        cartCountEl.textContent = totalItems;
        
        if (totalItems > oldCount && totalItems > 0) {
            cartCountEl.style.animation = 'none';
            setTimeout(() => {
                cartCountEl.style.animation = 'pulse 0.3s';
            }, 10);
        }
    }
};

// API communication
const OrderSystemAPI = {
    async fetchData(sheetName, params = {}) {
        return new Promise((resolve, reject) => {
            const callbackName = `jsonp_callback_${Math.round(100000 * Math.random())}`;
            const timer = setTimeout(() => {
                delete window[callbackName];
                if (script.parentNode) document.body.removeChild(script);
                reject(new Error(`Timeout fetching data from ${sheetName}.`));
            }, 10000);

            window[callbackName] = function(data) {
                clearTimeout(timer);
                delete window[callbackName];
                if (script.parentNode) document.body.removeChild(script);
                if (data.error) {
                    reject(new Error(data.error));
                } else {
                    resolve(data);
                }
            };

            const queryString = new URLSearchParams(params).toString();
            const script = document.createElement('script');
            script.src = `${CONFIG.SCRIPT_URL}?sheet=${sheetName}&callback=${callbackName}&${queryString}`;
            script.onerror = () => {
                clearTimeout(timer);
                delete window[callbackName];
                if (script.parentNode) document.body.removeChild(script);
                reject(new Error(`Error fetching data from ${sheetName} via JSONP.`));
            };
            document.body.appendChild(script);
        });
    },

    async postData(payload) {
        OrderSystemUI.showNotification('กำลังส่งข้อมูล...', false);
        OrderSystemUI.showLoading(true);
        try {
            await fetch(CONFIG.SCRIPT_URL, {
                method: 'POST',
                mode: 'no-cors', 
                cache: 'no-cache',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify(payload)
            });
            return { status: 'success' };
        } catch (error) {
            console.error('Error posting data:', error);
            OrderSystemUI.showNotification('เกิดข้อผิดพลาดในการส่งข้อมูล', true);
            return { status: 'error', message: error.message };
        } finally {
            OrderSystemUI.showLoading(false);
        }
    }
};

// Legacy function mappings (for backward compatibility)
function goHome() { 
    const adminPanel = document.getElementById('adminPanel');
    const orderSection = document.getElementById('orderSection');

    // Ensure admin panel is hidden
    if (adminPanel) {
        adminPanel.style.display = 'none';
    }

    // Ensure order section is visible
    if (orderSection) {
        orderSection.style.display = 'block';
    }
    
    // Always reset the order interface to its initial state.
    if (typeof OrderSystemOrders !== 'undefined' && typeof OrderSystemOrders.resetOrderState === 'function') {
        OrderSystemOrders.resetOrderState();
    } else {
        console.error("OrderSystemOrders.resetOrderState() is not defined.");
    }
}
function logout() { 
    OrderSystemAuth.logout();
}
function openCart() { OrderSystemCart.open(); }
function closeCart() { OrderSystemCart.close(); }
function toggleAdminPanel() { 
    OrderSystemAdmin.toggle();
}
function showAdminTab(tab) { 
    OrderSystemAdmin.showTab(tab); 
}
function toggleOrderHistory() {
    const historyDiv = document.getElementById('orderHistory');
    if (historyDiv.classList.contains('hidden')) {
        historyDiv.classList.remove('hidden');
        OrderSystemOrders.loadOrderHistory();
    } else {
        historyDiv.classList.add('hidden');
    }
}
async function deleteCurrentOrder() { await OrderSystemCart.deleteCurrentOrder(); }
function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    document.getElementById('darkModeIcon').textContent = isDark ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDark);
}

// Load dark mode preference
if (localStorage.getItem('darkMode') === 'true') {
    document.body.classList.add('dark-mode');
    document.getElementById('darkModeIcon').textContent = '☀️';
}
// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Ctrl+K = เปิดค้นหาสินค้า
    if (e.ctrlKey && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('searchInput');
        if (searchInput) searchInput.focus();
    }
    
    // Ctrl+Shift+C = เปิดตะกร้า
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
        e.preventDefault();
        OrderSystemCart.open();
    }
    
    // Escape = ปิด Modal
    if (e.key === 'Escape') {
        const cartModal = document.getElementById('cartModal');
        if (cartModal.style.display === 'block') {
            OrderSystemCart.close();
        }
    }
});