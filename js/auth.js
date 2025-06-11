// Authentication Module
const OrderSystemAuth = {
    tempSelectedUser: null, // To store user temporarily before PIN verification
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
            this.tempSelectedUser = user;
            document.getElementById('pinModalTitle').textContent = `สวัสดี ${user.name}, กรุณาใส่รหัส PIN`;
            document.getElementById('pinInput').value = '';
            document.getElementById('pinError').style.display = 'none';
            document.getElementById('pinModal').style.display = 'block';
            document.getElementById('pinInput').focus();
        }
    },

    closePinModal() {
        document.getElementById('pinModal').style.display = 'none';
        this.tempSelectedUser = null;
    },

    submitPin() {
        const pinEntered = document.getElementById('pinInput').value;
        const pinErrorDiv = document.getElementById('pinError');

        if (!this.tempSelectedUser || !this.tempSelectedUser.pin) {
            pinErrorDiv.textContent = 'เกิดข้อผิดพลาด: ไม่พบข้อมูลผู้ใช้หรือ PIN';
            pinErrorDiv.style.display = 'block';
            return;
        }

        if (pinEntered === String(this.tempSelectedUser.pin)) { // Compare PIN
            this.completeLogin(this.tempSelectedUser);
            this.closePinModal();
        } else {
            pinErrorDiv.textContent = 'รหัส PIN ไม่ถูกต้อง';
            pinErrorDiv.style.display = 'block';
            document.getElementById('pinInput').value = '';
            document.getElementById('pinInput').focus();
            // Add shake animation to modal or input for better UX
            const pinModalContent = document.querySelector('#pinModal .cart-content');
            if(pinModalContent) {
                pinModalContent.classList.add('shake-animation');
                setTimeout(() => pinModalContent.classList.remove('shake-animation'), 500);
            }
        }
    },

    completeLogin(user) { // New function to handle login after PIN success
        if (user) { // Ensure user is still valid
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
        this.closePinModal(); // Ensure PIN modal is closed on logout
        document.getElementById('adminBtn').classList.add('hidden'); // Changed to adminBtn
        OrderSystemOrders.resetOrderState();
        OrderSystemStorage.saveUserPreferences();
        this.renderUserSelection();
    }
};

// Add event listener for Enter key in PIN input
document.addEventListener('DOMContentLoaded', () => {
    const pinInput = document.getElementById('pinInput');
    if (pinInput) {
        pinInput.addEventListener('keypress', function(event) {
            if (event.key === 'Enter') {
                OrderSystemAuth.submitPin();
            }
        });
    }
});

// Expose to global for onclick handlers
window.OrderSystemAuth = OrderSystemAuth;