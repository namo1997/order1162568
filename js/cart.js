// Cart Management Module
const OrderSystemCart = {
    _updateProductCardUI(productId, quantity) { // remarkText is no longer needed here
        // Footer quantity display (between +/- buttons)
        const footerQuantityDisplay = document.getElementById(`badge-${productId}`);
        if (footerQuantityDisplay) {
            footerQuantityDisplay.textContent = quantity;
        }

        // Top-of-card badge
        const topBadge = document.getElementById(`product-card-top-badge-${productId}`);
        if (topBadge) {
            topBadge.textContent = quantity;
            if (quantity > 0) {
                topBadge.classList.add('visible');
            } else {
                topBadge.classList.remove('visible');
            }
        }
    },

    _updateCartItem(productId, newQuantity, newRemark) {
        if (!OrderSystem.state.selectedOrderDate) {
            alert('กรุณาเลือกวันที่สั่งซื้อก่อน');
            return;
        }
        const currentDepartment = OrderSystem.state.currentUser?.department;
        if (!currentDepartment) {
            alert('เกิดข้อผิดพลาด: ไม่พบแผนกของคุณ กรุณาล็อกอินใหม่อีกครั้ง');
            return;
        }

        const product = OrderSystem.data.products.find(p => p.id === productId);
        if (!product) {
            console.error(`Product with ID ${productId} not found.`);
            return;
        }

        const existingItemIndex = OrderSystem.state.cart.findIndex(item => item.id === productId);

        if (newQuantity > 0) {
            if (existingItemIndex > -1) {
                OrderSystem.state.cart[existingItemIndex].quantity = newQuantity;
                OrderSystem.state.cart[existingItemIndex].remark = newRemark;
            } else {
                OrderSystem.state.cart.push({
                    ...product,
                    department: currentDepartment,
                    quantity: newQuantity,
                    remark: newRemark
                });
            }
            OrderSystemUI.showNotification(`อัปเดต ${product.name} ในตะกร้าแล้ว`, false);
        } else { // newQuantity is 0 or less
            if (existingItemIndex > -1) {
                OrderSystem.state.cart.splice(existingItemIndex, 1);
                OrderSystemUI.showNotification(`ลบ ${product.name} ออกจากตะกร้าแล้ว`, false);
            }
        }

        OrderSystemStorage.saveCart();
        OrderSystemUI.updateCartBadge();
        this._updateProductCardUI(productId, newQuantity); // Pass only quantity
        
        // If cart modal is open, re-render it
        if (document.getElementById('cartModal') && document.getElementById('cartModal').style.display === 'block') {
            this.render();
        }
    },
    incrementProductQuantity(productId) {
        const existingItem = OrderSystem.state.cart.find(item => item.id === productId);
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const remarkToPreserve = existingItem ? (existingItem.remark || '') : ''; // Preserve existing remark or empty for new
        this._updateCartItem(productId, currentQuantity + 1, remarkToPreserve);
    },

    decrementProductQuantity(productId) {
        const existingItem = OrderSystem.state.cart.find(item => item.id === productId);
        const currentQuantity = existingItem ? existingItem.quantity : 0;
        const remarkToPreserve = existingItem ? (existingItem.remark || '') : ''; // Preserve existing remark
        if (currentQuantity > 0) {
            this._updateCartItem(productId, currentQuantity - 1, remarkToPreserve);
        }
    },

    updateProductQuantityFromInput(productId, inputElement) {
        const newQuantity = parseInt(inputElement.value, 10);
        if (isNaN(newQuantity) || newQuantity < 0) {
            // Reset to cart value or 0 if not in cart
            const itemInCart = OrderSystem.state.cart.find(item => item.id === productId);
            inputElement.value = itemInCart ? itemInCart.quantity : 0;
            alert("กรุณาใส่จำนวนเป็นตัวเลขที่มากกว่าหรือเท่ากับ 0");
            return;
        }
        const currentRemark = OrderSystem.state.cart.find(item => item.id === productId)?.remark || document.getElementById(`remark-${productId}`)?.value || '';
        this._updateCartItem(productId, newQuantity, currentRemark);
    },

    updateProductRemark(productId, inputElement) {
        const newRemark = inputElement.value;
        const currentQuantity = OrderSystem.state.cart.find(item => item.id === productId)?.quantity || parseInt(document.getElementById(`qty-${productId}`)?.value, 10) || 0;
        this._updateCartItem(productId, currentQuantity, newRemark);
    },

    open() {
        document.getElementById('cartModal').style.display = 'block';
        this.render();
    },

    close() {
        document.getElementById('cartModal').style.display = 'none';
    },

    render() {
        const cartItemsDiv = document.getElementById('cartItems');
        const deleteBtn = document.getElementById('deleteOrderBtn');
        const checkoutBtn = document.getElementById('checkoutBtn');
        const cartTitle = document.getElementById('cartTitle');

        if (OrderSystem.state.existingOrderId) {
            cartTitle.textContent = 'แก้ไขคำสั่งซื้อ';
            deleteBtn.classList.remove('hidden');
            checkoutBtn.textContent = 'บันทึกการเปลี่ยนแปลง';
        } else {
           cartTitle.textContent = 'ตะกร้าสินค้า';
           deleteBtn.classList.add('hidden');
           checkoutBtn.textContent = 'ยืนยันการสั่งซื้อ';
       }

       if (OrderSystem.state.cart.length === 0) {
           cartItemsDiv.innerHTML = '<p style="text-align: center; color: #666;">ตะกร้าว่างเปล่า</p>';
           checkoutBtn.disabled = true;
           return;
       }
       
       checkoutBtn.disabled = false;
       
       cartItemsDiv.innerHTML = OrderSystem.state.cart.map(item => `
           <div class="cart-item">
               <div class="cart-item-info">
                   <div class="cart-item-name">${item.name}</div>
                   <div class="cart-item-dept">แผนก: ${
                       OrderSystem.data.departments.find(d => d.id === item.department)?.name || ''
                   }</div>
                   <input type="text" class="form-input remark-input-modal" style="margin-top: 0.5rem;" 
                          placeholder="เพิ่มหมายเหตุ..." 
                          value="${item.remark || ''}" 
                          onchange="OrderSystemCart.updateProductRemark('${item.id}', this)">
               </div>
               <div class="cart-item-controls">
                   <div class="quantity-controls">
                       <button class="quantity-btn" onclick="OrderSystemCart.decrementProductQuantity('${item.id}')">-</button>
                       <span>${item.quantity}</span>
                       <button class="quantity-btn" onclick="OrderSystemCart.incrementProductQuantity('${item.id}')">+</button>
                   </div>
                   <div style="font-weight: bold;">${item.unit}</div>
               </div>
           </div>
       `).join('');
   },

   async checkout() {
       const isEditing = !!OrderSystem.state.existingOrderId;
       if (OrderSystem.state.cart.length === 0 && isEditing) {
           this.deleteCurrentOrder();
           return;
       }
       if (OrderSystem.state.cart.length === 0) {
           alert('กรุณาเลือกสินค้าก่อน');
           return;
       }
       if (!confirm(isEditing ? 'ยืนยันการแก้ไขคำสั่งซื้อ?' : 'ยืนยันการสั่งซื้อ?')) return;

       const checkoutBtn = document.getElementById('checkoutBtn');
       checkoutBtn.disabled = true;
       checkoutBtn.innerHTML = '<span class="loading-spinner"></span> กำลังส่ง...';

       const payload = {
           action: 'submitOrder',
           data: {
               orderDate: OrderSystem.state.selectedOrderDate,
               user: { 
                   id: OrderSystem.state.currentUser.id, 
                   name: OrderSystem.state.currentUser.name 
               },
               cart: OrderSystem.state.cart,
               existingOrderId: OrderSystem.state.existingOrderId
           }
       };

       const result = await OrderSystemAPI.postData(payload);
       
       checkoutBtn.disabled = false;
       checkoutBtn.innerHTML = isEditing ? 'บันทึกการเปลี่ยนแปลง' : 'ยืนยันการสั่งซื้อ';
       
       if (result.status === 'success') {
           OrderSystemUI.showNotification(
               isEditing ? 'แก้ไขคำสั่งซื้อเรียบร้อยแล้ว' : 'ส่งคำสั่งซื้อเรียบร้อยแล้ว',
               false
           );
           OrderSystemOrders.resetOrderState();
           this.close();
           OrderSystemOrders.renderOrderDates();
       } else {
           OrderSystemUI.showNotification('เกิดข้อผิดพลาดในการส่งข้อมูล', true);
       }
   },

   async deleteCurrentOrder() {
       if (!OrderSystem.state.existingOrderId) return;
       if (!confirm('คุณต้องการยกเลิกคำสั่งซื้อนี้ทั้งหมดใช่หรือไม่?')) return;

       const result = await OrderSystemAPI.postData({ 
           action: 'deleteOrder', 
           data: { orderId: OrderSystem.state.existingOrderId } 
       });
       
       if (result.status === 'success') {
           OrderSystemUI.showNotification('ยกเลิกคำสั่งซื้อเรียบร้อยแล้ว', false);
           OrderSystemOrders.resetOrderState();
           this.close();
           OrderSystemOrders.renderOrderDates();
       } else {
           OrderSystemUI.showNotification('เกิดข้อผิดพลาดในการยกเลิกคำสั่งซื้อ', true);
       }
   }
};

// Expose to global for onclick handlers
window.OrderSystemCart = OrderSystemCart;