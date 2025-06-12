// Admin Panel Module
const OrderSystemAdmin = {
    toggle() {
        const orderSection = document.getElementById('orderSection');
        const adminPanel = document.getElementById('adminPanel');
        
        if (adminPanel.style.display === 'block') {
            adminPanel.style.display = 'none';
            orderSection.style.display = 'block';
            OrderSystemOrders.renderOrderDates();
        } else {
            adminPanel.style.display = 'block';
            orderSection.style.display = 'none';
            this.showTab('manageDates');
        }
    },

    showTab(tab) {
        OrderSystem.state.activeAdminTab = tab;
        document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
        const clickedButton = Array.from(document.querySelectorAll('.admin-tab'))
            .find(button => button.getAttribute('onclick').includes(`'${tab}'`));
        if (clickedButton) clickedButton.classList.add('active');
        
        switch(tab) {
            case 'manageDates': this.renderManageDates(); break;
            case 'summary': this.renderOrderSummary(); break;
            case 'branches': this.renderBranches(); break; // เพิ่มบรรทัดนี้
        }
    },

    renderManageDates() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>จัดการวันสั่งซื้อ</h3>
                <p class="small-text">ฝ่ายจัดซื้อสามารถปิดรับออเดอร์ในแต่ละวันได้ที่นี่ ข้อมูลจะอัปเดตใน Google Sheet โดยตรง</p>
                <table class="admin-table">
                    <thead><tr><th>วันที่</th><th>สถานะ</th><th>การจัดการ</th></tr></thead>
                    <tbody>
                        ${[...OrderSystem.data.orderDates].sort((a, b) => new Date(b.date) - new Date(a.date)).map(d => `
                            <tr>
                                <td>${new Date(d.date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                <td><span style="color: ${d.status === 'open' ? 'green' : 'red'}; font-weight: bold;">${d.status === 'open' ? 'เปิดรับ' : 'ปิดแล้ว'}</span></td>
                                <td>
                                    ${d.status === 'open' ? `<button class="action-btn delete-btn" onclick="OrderSystemAdmin.closeOrderDate('${d.date}')">ปิดรับออเดอร์</button>` : 'ไม่มี'}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    async closeOrderDate(dateToClose) {
        if (!confirm(`คุณต้องการปิดรับออเดอร์ของวันที่ ${new Date(dateToClose).toLocaleDateString('th-TH')} ใช่หรือไม่?`)) return;
        const result = await OrderSystemAPI.postData({ action: 'closeDate', data: { dateToClose } });
        if (result.status === 'success') {
            OrderSystemUI.showNotification(`ส่งคำขอปิดรับออเดอร์แล้ว`, false);
            const dateObj = OrderSystem.data.orderDates.find(d => new Date(d.date).toISOString().split('T')[0] === new Date(dateToClose).toISOString().split('T')[0]);
            if (dateObj) {
                dateObj.status = 'closed';
                this.renderManageDates();
            }
        }
    },

    renderOrderSummary() {
        const content = document.getElementById('adminContent');
        const availableDates = [...new Set(OrderSystem.data.orderDates.map(d => d.date))].sort((a, b) => new Date(b) - new Date(a));

        content.innerHTML = `
            <div class="admin-section">
                <h3>สรุปยอดสั่งซื้อประจำวัน</h3>
                <p class="small-text">เลือกวันที่ต้องการดูยอดสรุป ระบบจะรวบรวมสินค้าชนิดเดียวกันจากทุกแผนก</p>
                <div class="form-group" style="display: flex; gap: 1rem; align-items: center;">
                    <select class="form-input" id="summaryDateSelect">
                        <option value="">-- เลือกวันที่ --</option>
                        ${availableDates.map(date => `<option value="${date}">${new Date(date).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</option>`).join('')}
                    </select>
                    <button class="login-btn" style="width: auto; padding: 0.75rem 1.5rem;" onclick="OrderSystemAdmin.getAndRenderSummary()">ดูสรุป</button>
                </div>
                <div id="summaryResult"></div>
                <div id="printButtonsContainer" class="hidden" style="margin-top: 2rem; display: flex; gap: 1rem;">
                    <button class="login-btn" onclick="OrderSystemAdmin.printSummary('consolidated')">🖨️ พิมพ์แบบรวมสินค้า</button>
                    <button class="login-btn" style="background: #667eea;" onclick="OrderSystemAdmin.printSummary('department')">🖨️ พิมพ์แบบแยกแผนก</button>
                </div>
            </div>
        `;
    },

    async getAndRenderSummary() {
        const selectedDate = document.getElementById('summaryDateSelect').value;
        const resultDiv = document.getElementById('summaryResult');
        const printContainer = document.getElementById('printButtonsContainer');
        
        if (!selectedDate) {
            resultDiv.innerHTML = '<p style="color: red;">กรุณาเลือกวันที่</p>';
            printContainer.classList.add('hidden');
            return;
        }
        
        OrderSystemUI.showLoading(true, 'กำลังโหลดข้อมูลสรุป...');
        resultDiv.innerHTML = '';
        printContainer.classList.add('hidden');
        
        try {
            const ordersForDay = await OrderSystemAPI.fetchData('Orders', { orderDate: selectedDate });
            OrderSystem.state.currentSummaryData = ordersForDay;

            if (ordersForDay.length === 0) {
                resultDiv.innerHTML = '<p>ไม่พบข้อมูลการสั่งซื้อสำหรับวันที่เลือก</p>';
                return;
            }

            const summary = {};
            ordersForDay.forEach(order => {
                const productId = order.productId;
                if (!summary[productId]) {
                    summary[productId] = { 
                        name: order.productName, 
                        icon: OrderSystem.data.products.find(p => p.id === productId)?.icon || '📦', 
                        totalQuantity: 0, 
                        departments: {} 
                    };
                }
                summary[productId].totalQuantity += Number(order.quantity);
                const deptName = OrderSystem.data.departments.find(d => d.id === order.department)?.name || order.department;
                if (!summary[productId].departments[deptName]) {
                    summary[productId].departments[deptName] = { qty: 0, remarks: [] };
                }
                summary[productId].departments[deptName].qty += Number(order.quantity);
                if (order.remark) {
                    summary[productId].departments[deptName].remarks.push(order.remark);
                }
            });

            resultDiv.innerHTML = `
                <h4>ยอดสรุปรวมสำหรับวันที่ ${new Date(selectedDate).toLocaleDateString('th-TH')}</h4>
                <table class="admin-table" style="margin-top: 1rem;">
                    <thead><tr><th>สินค้า</th><th style="text-align: right;">จำนวนรวม</th><th>สั่งจากแผนก (จำนวน/หมายเหตุ)</th></tr></thead>
                    <tbody>
                        ${Object.values(summary).sort((a,b) => a.name.localeCompare(b.name)).map(item => `
                            <tr>
                                <td>${item.icon} ${item.name}</td>
                                <td style="text-align: right; font-weight: bold;">${item.totalQuantity} ${OrderSystem.data.products.find(p=>p.name === item.name)?.unit || ''}</td>
                                <td>
                                    ${Object.entries(item.departments).map(([dept, data]) => `
                                        <div><b>${dept}:</b> ${data.qty}</div>
                                        ${data.remarks.length > 0 ? `
                                            <div style="font-size: 0.8em; color: #666; padding-left: 1rem;">
                                                ${data.remarks.map(r => `&bull; ${r}`).join('<br>')}
                                            </div>
                                        ` : ''}
                                    `).join('')}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>`;
            printContainer.classList.remove('hidden');
        } catch (error) {
            resultDiv.innerHTML = `<p style="color: red;">เกิดข้อผิดพลาดในการโหลดข้อมูลสรุป: ${error.message}</p>`;
        } finally {
            OrderSystemUI.showLoading(false);
        }
    },

    printSummary(mode) {
        if (OrderSystem.state.currentSummaryData.length === 0) {
            alert('ไม่มีข้อมูลสรุปให้พิมพ์');
            return;
        }

        const printArea = document.getElementById('print-area');
        const selectedDate = document.getElementById('summaryDateSelect').value;
        let printContent = `<h2>สรุปรายการสั่งซื้อประจำวันที่ ${new Date(selectedDate).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</h2>`;

        if (mode === 'consolidated') {
            const summaryTable = document.querySelector('#summaryResult table');
            if (summaryTable) {
                printContent += '<h3>แบบรวมสินค้า</h3>';
                printContent += summaryTable.outerHTML;
            } else {
                alert('ไม่พบตารางสรุป');
                return;
            }
        } else if (mode === 'department') {
            printContent += '<h3>แบบแยกตามแผนก</h3>';
            const ordersByDept = {};

            OrderSystem.state.currentSummaryData.forEach(order => {
                const deptName = OrderSystem.data.departments.find(d => d.id === order.department)?.name || order.department;
                if (!ordersByDept[deptName]) {
                    ordersByDept[deptName] = [];
                }
                ordersByDept[deptName].push(order);
            });

            for (const dept in ordersByDept) {
                printContent += `<h4>แผนก: ${dept}</h4>`;
                printContent += `
                    <table>
                        <thead>
                            <tr>
                                <th>สินค้า</th>
                                <th style="text-align: right;">จำนวน</th>
                                <th>หน่วย</th>
                                <th>หมายเหตุ</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${ordersByDept[dept].sort((a,b) => a.productName.localeCompare(b.productName)).map(item => `
                                <tr>
                                    <td>${OrderSystem.data.products.find(p => p.id === item.productId)?.icon || '📦'} ${item.productName}</td>
                                    <td style="text-align: right;">${item.quantity}</td>
                                    <td>${item.unit}</td>
                                    <td>${item.remark || ''}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                `;
            }
        }

        printArea.innerHTML = printContent;
        window.print();
    },

    renderUnits() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>จัดการหน่วยนับ</h3>
                <p class="small-text">เพิ่มหรือลบหน่วยนับที่ใช้ในระบบ การเปลี่ยนแปลงจะมีผลกับ Google Sheet โดยตรง</p>
                <div id="unitList">
                    ${OrderSystem.data.units.map((unit, index) => `
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                            <input type="text" class="form-input" value="${unit.name}" onchange="OrderSystemAdmin.updateLocalUnit(${index}, this.value)">
                            <button class="action-btn delete-btn" onclick="OrderSystemAdmin.deleteLocalUnit(${index})">ลบ</button>
                        </div>
                    `).join('')}
                </div>
                <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                    <input type="text" class="form-input" id="newUnitInput" placeholder="เพิ่มหน่วยนับใหม่...">
                    <button class="add-btn" style="margin-bottom: 0;" onclick="OrderSystemAdmin.addLocalUnit()">+ เพิ่ม</button>
                </div>
                <hr style="margin: 2rem 0;">
                <button class="login-btn" onclick="OrderSystemAdmin.saveUnits()">บันทึกการเปลี่ยนแปลงทั้งหมด</button>
            </div>
        `;
    },

    updateLocalUnit(index, value) {
        OrderSystem.data.units[index].name = value;
    },

    deleteLocalUnit(index) {
        OrderSystem.data.units.splice(index, 1);
        this.renderUnits();
    },

    addLocalUnit() {
        const input = document.getElementById('newUnitInput');
        const newUnitName = input.value.trim();
        if (newUnitName && !OrderSystem.data.units.some(u => u.name === newUnitName)) {
            OrderSystem.data.units.push({ name: newUnitName });
            this.renderUnits();
        } else {
            alert('หน่วยนับนี้มีอยู่แล้ว หรือชื่อไม่ถูกต้อง');
        }
    },

    async saveUnits() {
        if (!confirm('ยืนยันการบันทึกหน่วยนับทั้งหมด? การกระทำนี้จะเขียนทับข้อมูลใน Google Sheet')) return;
        const result = await OrderSystemAPI.postData({ action: 'updateUnits', data: { units: OrderSystem.data.units } });
        if (result.status === 'success') {
            OrderSystemUI.showNotification('บันทึกหน่วยนับเรียบร้อยแล้ว', false);
        }
    },

    renderProducts() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>ข้อมูลสินค้า</h3>
                <p class="small-text">ข้อมูลนี้ถูกดึงมาจาก Google Sheet โดยตรง หากต้องการแก้ไข กรุณาไปที่ไฟล์ Sheet</p>
                <table class="admin-table">
                    <thead><tr><th>รหัส</th><th>ชื่อสินค้า</th><th>รายละเอียด</th><th>หน่วยนับ</th><th>หมวดหมู่</th></tr></thead>
                    <tbody>
                        ${OrderSystem.data.products.map(product => `
                            <tr>
                                <td>${product.id}</td>
                                <td>${product.icon || ''} ${product.name}</td>
                                <td>${product.description}</td>
                                <td>${product.unit}</td>
                                <td>${OrderSystem.data.categories.find(c => c.id === product.category)?.name || product.category}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderDepartments() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>ข้อมูลแผนก</h3>
                 <p class="small-text">ข้อมูลนี้ถูกดึงมาจาก Google Sheet โดยตรง หากต้องการแก้ไข กรุณาไปที่ไฟล์ Sheet</p>
                <table class="admin-table">
                    <thead><tr><th>รหัส</th><th>ไอคอน</th><th>ชื่อแผนก</th></tr></thead>
                    <tbody>
                        ${OrderSystem.data.departments.map(dept => `
                            <tr>
                                <td>${dept.id}</td>
                                <td>${dept.icon}</td>
                                <td>${dept.name}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderCategories() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>ข้อมูลหมวดหมู่</h3>
                 <p class="small-text">ข้อมูลนี้ถูกดึงมาจาก Google Sheet โดยตรง หากต้องการแก้ไข กรุณาไปที่ไฟล์ Sheet</p>
                <table class="admin-table">
                    <thead><tr><th>รหัส</th><th>ชื่อหมวดหมู่</th></tr></thead>
                    <tbody>
                        ${OrderSystem.data.categories.map(cat => `
                            <tr>
                                <td>${cat.id}</td>
                                <td>${cat.name}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderUsers() {
        const content = document.getElementById('adminContent');
        content.innerHTML = `
            <div class="admin-section">
                <h3>ข้อมูลผู้ใช้</h3>
                 <p class="small-text">ข้อมูลนี้ถูกดึงมาจาก Google Sheet โดยตรง หากต้องการแก้ไข กรุณาไปที่ไฟล์ Sheet</p>
                <table class="admin-table">
                    <thead><tr><th>รหัส</th><th>ชื่อ-นามสกุล</th><th>สิทธิ์</th><th>แผนก</th></tr></thead>
                    <tbody>
                        ${OrderSystem.data.users.map(user => `
                            <tr>
                                <td>${user.id}</td>
                                <td>${user.name}</td>
                                <td>${user.role === 'admin' ? 'ผู้ดูแล' : 'ผู้ใช้งาน'}</td>
                                <td>${OrderSystem.data.departments.find(d => d.id === user.department)?.name || user.department}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    },

    renderBranches() {
      const content = document.getElementById('adminContent');
      content.innerHTML = `
        <div class="admin-section">
          <h3>ข้อมูลสาขา</h3>
          <p class="small-text">ข้อมูลนี้ถูกดึงมาจาก Google Sheet โดยตรง หากต้องการแก้ไข กรุณาไปที่ไฟล์ Sheet</p>
          <table class="admin-table">
            <thead><tr><th>รหัส</th><th>ชื่อสาขา</th><th>รหัสสาขา</th><th>ที่อยู่</th><th>เบอร์โทร</th><th>ผู้จัดการ</th><th>สถานะ</th></tr></thead>
            <tbody>
              ${OrderSystem.data.branches.map(branch => `
                <tr>
                  <td>${branch.id}</td>
                  <td>${branch.name}</td>
                  <td>${branch.code}</td>
                  <td>${branch.address}</td>
                  <td>${branch.phone}</td>
                  <td>${branch.manager}</td>
                  <td><span style="color: ${branch.status === 'active' ? 'green' : 'red'};">${branch.status === 'active' ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }
};

// Expose to global for onclick handlers
window.OrderSystemAdmin = OrderSystemAdmin;