// Orders Management Module
const OrderSystemOrders = {
    resetOrderState() {
        OrderSystem.state.cart = [];
        OrderSystemUI.updateCartBadge();
        OrderSystem.state.selectedOrderDate = null;
        OrderSystem.state.selectedDepartment = OrderSystem.state.currentUser ?
            OrderSystem.state.currentUser.department : '';
        OrderSystem.state.selectedCategory = 'all';
        OrderSystem.state.existingOrderId = null;
        document.getElementById('categorySection').classList.add('hidden');
        if (document.getElementById('productsGrid')) {
            document.getElementById('productsGrid').innerHTML = ''; // Clear products grid
        }
        OrderSystemStorage.saveCart();
        this.renderOrderDates(); // Re-render date choices
    },

    async renderOrderDates() {
        const grid = document.getElementById('orderDateGrid');
        if (!grid) {
            console.error("orderDateGrid not found");
            return;
        }

        OrderSystemUI.showLoading(true, 'กำลังโหลดวันที่สั่งซื้อ...');
        grid.innerHTML = ''; // Clear previous dates

        try {
            // 1. Filter for open dates
            const allOpenDates = OrderSystem.data.orderDates.filter(d => d.status === 'open');

            // 2. Sort open dates: oldest first
            const sortedOpenDates = [...allOpenDates].sort((a, b) => new Date(a.date) - new Date(b.date));

            // 3. Select top 2 oldest (first available) dates
            const displayDates = sortedOpenDates.slice(0, 2);

            if (displayDates.length === 0) {
                grid.innerHTML = '<p>ไม่มีวันที่เปิดให้สั่งซื้อในขณะนี้</p>';
                document.getElementById('categorySection').classList.add('hidden');
                OrderSystemUI.showLoading(false);
                return;
            }

            const userOrders = await OrderSystemAPI.fetchData('Orders', {
                userId: OrderSystem.state.currentUser.id
            });

            grid.innerHTML = displayDates.map(d => {
                const hasOrder = userOrders.some(o => o.orderDate === d.date);
                return `
                <button class="dept-card ${OrderSystem.state.selectedOrderDate === d.date ? 'active' : ''}"
                        onclick="OrderSystemOrders.selectOrderDate(this, '${d.date}')">
                    <div>📅</div>
                    <div>${new Date(d.date).toLocaleDateString('th-TH', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</div>
                    ${hasOrder ? `<div class="edit-order-btn"
                        onclick="event.stopPropagation(); OrderSystemOrders.editOrder('${d.date}')">
                        ดู/แก้ไขคำสั่งซื้อ
                    </div>` : ''}
                </button>
            `}).join('');

            // Manage category section visibility based on current selectedOrderDate
            const categorySection = document.getElementById('categorySection');
            const isSelectedDateDisplayedAndValid = OrderSystem.state.selectedOrderDate &&
                                                  displayDates.some(d => d.date === OrderSystem.state.selectedOrderDate);

            categorySection.classList.toggle('hidden', !isSelectedDateDisplayedAndValid);

        } catch (error) {
            OrderSystemUI.showNotification('ไม่สามารถโหลดข้อมูลวันที่ได้', true);
        } finally {
            OrderSystemUI.showLoading(false);
        }
    },

    selectOrderDate(element, date) {
        if (OrderSystem.state.selectedOrderDate !== date) {
            this.resetOrderState();
            // OrderSystemUI.updateCartBadge(); // resetOrderState already calls renderOrderDates which implies cart update if needed
        }
        OrderSystem.state.selectedOrderDate = date;
        document.querySelectorAll('#orderDateGrid .dept-card').forEach(card =>
            card.classList.remove('active')
        );
        if (element) { // Ensure element exists before adding class
             element.classList.add('active');
        }
        document.getElementById('categorySection').classList.remove('hidden');
        if(document.getElementById('searchInput')) {
            document.getElementById('searchInput').value = '';
        }
        this.renderCategories(); // Ensure categories are rendered
        this.renderProducts();
    },

    async editOrder(date) {
        OrderSystemUI.showLoading(true, 'กำลังโหลดคำสั่งซื้อเดิม...');
        try {
            const userOrders = await OrderSystemAPI.fetchData('Orders', {
                userId: OrderSystem.state.currentUser.id,
                orderDate: date
            });

            if (userOrders && userOrders.length > 0) {
                OrderSystem.state.cart = userOrders.map(order => ({
                    ...OrderSystem.data.products.find(p => p.id === order.productId),
                    quantity: order.quantity,
                    remark: order.remark,
                    department: order.department // Ensure department is carried over
                }));
                OrderSystem.state.existingOrderId = userOrders[0].orderId; // Assuming orderId is consistent for all items in an order
                OrderSystem.state.selectedOrderDate = date;

                document.querySelectorAll('#orderDateGrid .dept-card').forEach(card => {
                    if (card.getAttribute('onclick').includes(`'${date}'`)) {
                        card.classList.add('active');
                    } else {
                        card.classList.remove('active');
                    }
                });

                document.getElementById('categorySection').classList.remove('hidden');
                this.renderCategories(); // Render categories as well
                this.renderProducts();
                OrderSystemUI.updateCartBadge();
                OrderSystemStorage.saveCart();
                OrderSystemCart.open();
            } else {
                OrderSystemUI.showNotification('ไม่พบคำสั่งซื้อเดิม', true);
            }
        } catch (error) {
            OrderSystemUI.showNotification('เกิดข้อผิดพลาดในการโหลดคำสั่งซื้อ', true);
        } finally {
            OrderSystemUI.showLoading(false);
        }
    },

    renderCategories() {
        const tabs = document.getElementById('categoryTabs');
        if (!tabs) return; // Guard clause
        const savedCategory = OrderSystem.state.selectedCategory || 'all';

        tabs.innerHTML = `
            <button class="category-tab ${savedCategory === 'all' ? 'active' : ''}"
                    onclick="OrderSystemOrders.filterCategory(this, 'all')">ทั้งหมด</button>
            ${OrderSystem.data.categories.map(cat => `
                <button class="category-tab ${savedCategory === cat.id ? 'active' : ''}"
                        onclick="OrderSystemOrders.filterCategory(this, '${cat.id}')">${cat.name}</button>
            `).join('')}
        `;
    },

    filterCategory(element, categoryId) {
        OrderSystem.state.selectedCategory = categoryId;
        OrderSystemStorage.saveUserPreferences();
        document.querySelectorAll('.category-tab').forEach(tab => tab.classList.remove('active'));
        if (element) { // Ensure element exists
            element.classList.add('active');
        }
        this.renderProducts();
    },

    renderProducts() {
        const grid = document.getElementById('productsGrid');
        if (!grid) return; // Guard clause

        const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';

        // Show loading state
        grid.classList.add('loading');
        grid.innerHTML = '<div class="loading-spinner"></div>';

        setTimeout(() => {
            let filteredProducts = OrderSystem.state.selectedCategory === 'all'
                ? OrderSystem.data.products
                : OrderSystem.data.products.filter(p =>
                    p.category && p.category.trim().toLowerCase() ===
                    OrderSystem.state.selectedCategory.toLowerCase()
                );

            if (searchTerm) {
                filteredProducts = filteredProducts.filter(p =>
                    p.name.toLowerCase().includes(searchTerm)
                );
            }

            grid.classList.remove('loading');

            if (filteredProducts.length === 0) {
                grid.innerHTML = `<p style="text-align: center; color: #666; grid-column: 1 / -1;">
                    ไม่พบสินค้าที่ตรงกับการค้นหา</p>`;
                return;
            }

            grid.innerHTML = filteredProducts.map(product => {
                const itemInCart = OrderSystem.state.cart.find(item => item.id === product.id);
                const quantity = itemInCart ? itemInCart.quantity : 0;

                return `
                <div class="product-card" onclick="OrderSystemCart.incrementProductQuantity('${product.id}')">
                    <div class="quantity-badge ${quantity > 0 ? 'visible' : ''}" id="product-card-top-badge-${product.id}">${quantity}</div>
                    <div class="product-image">
                        ${product.imageUrl ? `<img src="${product.imageUrl}" alt="${product.name}">` : (product.icon || '📦')}
                    </div>
                    <div class="product-info">
                        <div class="product-name-unit-wrapper">
                            <span class="product-name">${product.name}</span>
                            <span class="product-unit-inline">(${product.unit || 'N/A'})</span>
                        </div>
                        <div class="product-description">${product.description}</div>
                        <div class="product-footer">
                            <div class="product-card-controls">
                                <button class="quantity-btn card-quantity-btn decrement-btn" aria-label="ลดจำนวน" onclick="event.stopPropagation(); OrderSystemCart.decrementProductQuantity('${product.id}')">-</button>
                                <span class="quantity-display" id="badge-${product.id}">${quantity}</span>
                                <button class="quantity-btn card-quantity-btn increment-btn" aria-label="เพิ่มจำนวน" onclick="event.stopPropagation(); OrderSystemCart.incrementProductQuantity('${product.id}')">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `}).join('');
        }, 100); // Small delay to allow UI to update with loading spinner
    },

    async loadOrderHistory() {
        const historyDiv = document.getElementById('orderHistory');
        if (!historyDiv) return;

        OrderSystemUI.showLoading(true, 'กำลังโหลดประวัติการสั่งซื้อ...');
        try {
            const orders = await OrderSystemAPI.fetchData('Orders', {
                userId: OrderSystem.state.currentUser.id
            });

            // Group orders by date
            const ordersByDate = {};
            orders.forEach(order => {
                if (!ordersByDate[order.orderDate]) {
                    ordersByDate[order.orderDate] = [];
                }
                ordersByDate[order.orderDate].push(order);
            });

            const sortedDates = Object.keys(ordersByDate).sort((a, b) => new Date(b) - new Date(a));

            if (sortedDates.length === 0) {
                historyDiv.innerHTML = '<p>ไม่พบประวัติการสั่งซื้อ</p>';
            } else {
                historyDiv.innerHTML = sortedDates.slice(0, 10).map(date => `
                    <div class="history-item">
                        <div class="history-date">
                            ${new Date(date).toLocaleDateString('th-TH', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </div>
                        <div class="history-products">
                            ${ordersByDate[date].map(item =>
                                `• ${item.productName} (${item.quantity} ${item.unit || ''}) ${item.remark ? `<em>(${item.remark})</em>` : ''}`
                            ).join('<br>')}
                        </div>
                    </div>
                `).join('');
            }
        } catch (error) {
            historyDiv.innerHTML = '<p style="color: red;">ไม่สามารถโหลดประวัติได้</p>';
            OrderSystemUI.showNotification('ไม่สามารถโหลดประวัติได้', true);
        } finally {
            OrderSystemUI.showLoading(false);
        }
    }
};

// Expose to global for onclick handlers
window.OrderSystemOrders = OrderSystemOrders;
