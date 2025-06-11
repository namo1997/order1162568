// Authentication Module
const OrderSystemAuth = {
    renderUserSelection() {
        const grid = document.getElementById('usersGrid');
        const searchTerm = document.getElementById('userSearch').value.toLowerCase();
        const selectedDept = document.getElementById('departmentFilter').value;
        
        let filteredUsers = OrderSystem.data.users;
        
        // Filter by department
        if (selectedDept !== 'all') {
            filteredUsers = filteredUsers.filter(u => u.department === selectedDept);
        }
        
        // Filter by search
        if (searchTerm) {
            filteredUsers = filteredUsers.filter(u => 
                u.name.toLowerCase().includes(searchTerm)
            );
        }
        
        // Sort by name
        filteredUsers.sort((a, b) => a.name.localeCompare(b.name));
        
        grid.innerHTML = filteredUsers.map(user => {
            const dept = OrderSystem.data.departments.find(d => d.id === user.department);
            return `
                <div class="user-card ${user.role === 'admin' ? 'admin' : ''}" 
                     onclick="OrderSystemAuth.selectUser(${user.id})">
                    ${user.role === 'admin' ? '<div class="admin-badge">ADMIN</div>' : ''}
                    <div class="user-avatar">${dept?.icon || '👤'}</div>
                    <div class="user-name">${user.name}</div>
                    <div class="user-dept">${dept?.name || 'ไม่ระบุแผนก'}</div>
                </div>
            `;
        }).join('');
        
        if (filteredUsers.length === 0) {
            grid.innerHTML = '<p style="text-align: center; color: #666; grid-column: 1 / -1;">ไม่พบผู้ใช้ที่ตรงกับการค้นหา</p>';
        }
    },
    
    filterUsersByDepartment() {
        this.renderUserSelection();
    },
    
    searchUsers() {
        this.renderUserSelection();
    },
    
    selectUser(userId) {
        const user = OrderSystem.data.users.find(u => u.id === userId);
        if (user) {
            OrderSystem.state.currentUser = user;
            OrderSystem.state.selectedDepartment = user.department;
            
            // Update UI
            document.getElementById('loginPage').classList.add('hidden');
            document.getElementById('mainApp').classList.remove('hidden');
            
            const deptName = OrderSystem.data.departments.find(d => d.id === user.department)?.name || 'ไม่พบแผนก';
            document.getElementById('currentUser').textContent = `${user.name} (${deptName})`; // Changed to currentUser
            
            if (user.role === 'admin') {
                document.getElementById('adminBtn').classList.remove('hidden'); // Changed to adminBtn
            }
            
            // Load saved cart if exists
            const savedCart = OrderSystemStorage.loadCart();
            if (savedCart && savedCart.department === user.department) {
                OrderSystem.state.cart = savedCart.cart;
                OrderSystem.state.selectedOrderDate = savedCart.orderDate;
                OrderSystemUI.updateCartBadge();
            }
            
            // Load user preferences
            const prefs = OrderSystemStorage.loadUserPreferences();
            if (prefs && prefs.userId === user.id) {
                OrderSystem.state.selectedCategory = prefs.lastCategory || 'all';
            }
            
            OrderSystemOrders.renderOrderDates();
            OrderSystemOrders.renderCategories();
            
            OrderSystemUI.showNotification(`ยินดีต้อนรับ ${user.name}`, false);
        }
    },

    logout() {
        OrderSystem.state.currentUser = null;
        document.getElementById('loginPage').classList.remove('hidden');
        document.getElementById('mainApp').classList.add('hidden');
        document.getElementById('userSearch').value = '';
        document.getElementById('departmentFilter').value = 'all';
        document.getElementById('adminBtn').classList.add('hidden'); // Changed to adminBtn
        OrderSystemOrders.resetOrderState();
        OrderSystemStorage.saveUserPreferences();
        this.renderUserSelection();
    }
};

// Expose to global for onclick handlers
window.OrderSystemAuth = OrderSystemAuth;