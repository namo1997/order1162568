// Google Apps Script Code (Code.gs)
// ===============================================

// Configuration
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE'; // ใส่ ID ของ Google Sheet
const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

// Sheet names
const SHEETS = {
  USERS: 'Users',
  DEPARTMENTS: 'Departments',
  CATEGORIES: 'Categories',
  PRODUCTS: 'Products',
  ORDERS: 'Orders',
  ORDER_DATES: 'OrderDates',
  UNITS: 'Units'
};

// ==========================================
// INITIALIZATION FUNCTIONS
// ==========================================

// Function to create all sheets with headers and sample data
function initializeSpreadsheet() {
  createUsersSheet();
  createDepartmentsSheet();
  createCategoriesSheet();
  createProductsSheet();
  createOrdersSheet();
  createOrderDatesSheet();
  createUnitsSheet();
  
  // Format all sheets
  formatAllSheets();
  
  SpreadsheetApp.flush();
  return "Spreadsheet initialized successfully!";
}

// Create Users sheet
function createUsersSheet() {
  let sheet = ss.getSheetByName(SHEETS.USERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.USERS);
  } else {
    sheet.clear();
  }
  
  // Headers
  const headers = ['id', 'username', 'password', 'name', 'role', 'department'];
  
  // Sample data
  const sampleData = [
    [1, '', '', 'สมชาย ใจดี', 'user', 'D1'],
    [2, '', '', 'สมหญิง รักดี', 'admin', 'D1'],
    [3, '', '', 'สมศักดิ์ ทำงานดี', 'user', 'D2'],
    [4, '', '', 'สมใจ คิดดี', 'user', 'D2'],
    [5, '', '', 'ผู้จัดการ ฝ่ายจัดซื้อ', 'admin', 'D3'],
    [6, '', '', 'พนักงาน คลังสินค้า', 'user', 'D3'],
    [7, '', '', 'หัวหน้า ฝ่ายการเงิน', 'user', 'D4'],
    [8, '', '', 'เจ้าหน้าที่ บัญชี', 'user', 'D4']
  ];
  
  // Set headers
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  // Set data
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  // Auto-resize columns
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create Departments sheet
function createDepartmentsSheet() {
  let sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.DEPARTMENTS);
  } else {
    sheet.clear();
  }
  
  const headers = ['id', 'name', 'icon'];
  const sampleData = [
    ['D1', 'แผนกบัญชี', '📊'],
    ['D2', 'แผนก IT', '💻'],
    ['D3', 'แผนกจัดซื้อ', '🛒'],
    ['D4', 'แผนกการเงิน', '💰'],
    ['D5', 'แผนกบุคคล', '👥'],
    ['D6', 'แผนกการตลาด', '📈']
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create Categories sheet
function createCategoriesSheet() {
  let sheet = ss.getSheetByName(SHEETS.CATEGORIES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.CATEGORIES);
  } else {
    sheet.clear();
  }
  
  const headers = ['id', 'name'];
  const sampleData = [
    ['C1', 'อุปกรณ์สำนักงาน'],
    ['C2', 'อาหารและเครื่องดื่ม'],
    ['C3', 'ผลิตภัณฑ์ทำความสะอาด'],
    ['C4', 'วัสดุคอมพิวเตอร์'],
    ['C5', 'เครื่องเขียน']
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create Products sheet
function createProductsSheet() {
  let sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.PRODUCTS);
  } else {
    sheet.clear();
  }
  
  const headers = ['id', 'name', 'description', 'unit', 'category', 'icon'];
  const sampleData = [
    // อุปกรณ์สำนักงาน
    ['P001', 'กระดาษ A4', '80 แกรม 500 แผ่น', 'รีม', 'C1', '📄'],
    ['P002', 'กระดาษ A3', '80 แกรม 500 แผ่น', 'รีม', 'C1', '📄'],
    ['P003', 'ซองเอกสาร A4', 'ซองน้ำตาล ขนาด A4', 'กล่อง', 'C1', '📧'],
    ['P004', 'คลิปหนีบกระดาษ', 'คลิปโลหะ ขนาดกลาง', 'กล่อง', 'C1', '📎'],
    ['P005', 'ลวดเย็บกระดาษ', 'เบอร์ 10', 'กล่อง', 'C1', '📌'],
    
    // เครื่องเขียน
    ['P006', 'ปากกาลูกลื่น', 'สีน้ำเงิน 0.5 มม.', 'แท่ง', 'C5', '✏️'],
    ['P007', 'ปากกาลูกลื่น', 'สีดำ 0.5 มม.', 'แท่ง', 'C5', '✏️'],
    ['P008', 'ปากกาเน้นข้อความ', 'สีเหลือง', 'แท่ง', 'C5', '🖍️'],
    ['P009', 'ดินสอ 2B', 'ดินสอไม้ 2B', 'แท่ง', 'C5', '✏️'],
    ['P010', 'ยางลบ', 'ยางลบดินสอ', 'ก้อน', 'C5', '🧽'],
    
    // อาหารและเครื่องดื่ม
    ['P011', 'น้ำดื่ม', 'ขวด 1.5 ลิตร', 'แพ็ค', 'C2', '💧'],
    ['P012', 'กาแฟ 3in1', 'กาแฟสำเร็จรูป', 'กล่อง', 'C2', '☕'],
    ['P013', 'น้ำตาล', 'น้ำตาลทรายขาว', 'กิโลกรัม', 'C2', '🍯'],
    ['P014', 'ครีมเทียม', 'ครีมเทียมผง', 'กล่อง', 'C2', '🥛'],
    ['P015', 'ขนมปัง', 'ขนมปังแผ่น', 'แพ็ค', 'C2', '🍞'],
    
    // ผลิตภัณฑ์ทำความสะอาด
    ['P016', 'น้ำยาล้างจาน', 'ขนาด 500 มล.', 'ขวด', 'C3', '🧴'],
    ['P017', 'น้ำยาถูพื้น', 'ขนาด 1000 มล.', 'ขวด', 'C3', '🧹'],
    ['P018', 'ผ้าไมโครไฟเบอร์', 'ผ้าเช็ดอเนกประสงค์', 'ผืน', 'C3', '🧽'],
    ['P019', 'ถุงขยะดำ', 'ขนาด 30x40 นิ้ว', 'แพ็ค', 'C3', '🗑️'],
    ['P020', 'น้ำยาล้างห้องน้ำ', 'ขนาด 900 มล.', 'ขวด', 'C3', '🚽'],
    
    // วัสดุคอมพิวเตอร์
    ['P021', 'แผ่น CD-R', 'แผ่นซีดีเปล่า', 'กล่อง', 'C4', '💿'],
    ['P022', 'USB Flash Drive', '32 GB', 'อัน', 'C4', '💾'],
    ['P023', 'สายแลน', 'CAT6 ยาว 5 เมตร', 'เส้น', 'C4', '🔌'],
    ['P024', 'เมาส์', 'เมาส์ออปติคอล USB', 'ตัว', 'C4', '🖱️'],
    ['P025', 'แป้นพิมพ์', 'คีย์บอร์ด USB ภาษาไทย/อังกฤษ', 'ตัว', 'C4', '⌨️']
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create Orders sheet
function createOrdersSheet() {
  let sheet = ss.getSheetByName(SHEETS.ORDERS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.ORDERS);
  } else {
    sheet.clear();
  }
  
  const headers = ['orderId', 'orderDate', 'userId', 'userName', 'department', 'productId', 'productName', 'quantity', 'unit', 'remark', 'timestamp'];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  // Format date columns
  sheet.getRange('B:B').setNumberFormat('yyyy-mm-dd');
  sheet.getRange('K:K').setNumberFormat('yyyy-mm-dd hh:mm:ss');
  
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create OrderDates sheet
function createOrderDatesSheet() {
  let sheet = ss.getSheetByName(SHEETS.ORDER_DATES);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.ORDER_DATES);
  } else {
    sheet.clear();
  }
  
  const headers = ['date', 'status'];
  
  // Create sample order dates for the next 30 days
  const today = new Date();
  const sampleData = [];
  
  for (let i = 0; i < 30; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    sampleData.push([date, 'open']);
  }
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  // Format date column
  sheet.getRange('A:A').setNumberFormat('yyyy-mm-dd');
  
  for (let i = 1; i <= headers.length; i++) {
    sheet.autoResizeColumn(i);
  }
}

// Create Units sheet
function createUnitsSheet() {
  let sheet = ss.getSheetByName(SHEETS.UNITS);
  if (!sheet) {
    sheet = ss.insertSheet(SHEETS.UNITS);
  } else {
    sheet.clear();
  }
  
  const headers = ['name'];
  const sampleData = [
    ['ชิ้น'],
    ['อัน'],
    ['ตัว'],
    ['กล่อง'],
    ['แพ็ค'],
    ['รีม'],
    ['แท่ง'],
    ['ก้อน'],
    ['ขวด'],
    ['ผืน'],
    ['เส้น'],
    ['กิโลกรัม'],
    ['ลิตร'],
    ['มิลลิลิตร']
  ];
  
  sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  sheet.getRange(1, 1, 1, headers.length).setBackground('#4a86e8').setFontColor('white').setFontWeight('bold');
  
  if (sampleData.length > 0) {
    sheet.getRange(2, 1, sampleData.length, headers.length).setValues(sampleData);
  }
  
  sheet.autoResizeColumn(1);
}

// Format all sheets
function formatAllSheets() {
  const allSheets = ss.getSheets();
  
  allSheets.forEach(sheet => {
    // Freeze header row
    sheet.setFrozenRows(1);
    
    // Add borders
    const dataRange = sheet.getDataRange();
    dataRange.setBorder(true, true, true, true, true, true);
    
    // Set font
    dataRange.setFontFamily('Sarabun');
    
    // Alternate row colors
    const numRows = dataRange.getNumRows();
    if (numRows > 1) {
      for (let i = 2; i <= numRows; i++) {
        if (i % 2 === 0) {
          sheet.getRange(i, 1, 1, dataRange.getNumColumns()).setBackground('#f8f9fa');
        }
      }
    }
  });
}

// ==========================================
// MENU FUNCTIONS
// ==========================================

// Create custom menu
function onOpen() {
  const ui = SpreadsheetApp.getUi();
  ui.createMenu('🛠️ ระบบสั่งของ')
    .addItem('📋 สร้างตารางทั้งหมด', 'initializeSpreadsheet')
    .addItem('👥 สร้างตาราง Users', 'createUsersSheet')
    .addItem('🏢 สร้างตาราง Departments', 'createDepartmentsSheet')
    .addItem('📁 สร้างตาราง Categories', 'createCategoriesSheet')
    .addItem('📦 สร้างตาราง Products', 'createProductsSheet')
    .addItem('🛒 สร้างตาราง Orders', 'createOrdersSheet')
    .addItem('📅 สร้างตาราง OrderDates', 'createOrderDatesSheet')
    .addItem('📏 สร้างตาราง Units', 'createUnitsSheet')
    .addSeparator()
    .addItem('🎨 จัดรูปแบบตารางทั้งหมด', 'formatAllSheets')
    .addItem('🗑️ ล้างคำสั่งซื้อทั้งหมด', 'clearAllOrders')
    .addItem('📊 สรุปยอดสั่งซื้อวันนี้', 'getTodaySummary')
    .addToUi();
}

// Clear all orders
function clearAllOrders() {
  const ui = SpreadsheetApp.getUi();
  const response = ui.alert(
    'ยืนยันการลบ',
    'คุณต้องการลบคำสั่งซื้อทั้งหมดใช่หรือไม่?',
    ui.ButtonSet.YES_NO
  );
  
  if (response == ui.Button.YES) {
    const sheet = ss.getSheetByName(SHEETS.ORDERS);
    const lastRow = sheet.getLastRow();
    if (lastRow > 1) {
      sheet.deleteRows(2, lastRow - 1);
    }
    ui.alert('ลบคำสั่งซื้อทั้งหมดเรียบร้อยแล้ว');
  }
}

// Get today's order summary
function getTodaySummary() {
  const sheet = ss.getSheetByName(SHEETS.ORDERS);
  const data = sheet.getDataRange().getValues();
  const today = Utilities.formatDate(new Date(), 'GMT+7', 'yyyy-MM-dd');
  
  const todayOrders = data.slice(1).filter(row => {
    const orderDate = Utilities.formatDate(new Date(row[1]), 'GMT+7', 'yyyy-MM-dd');
    return orderDate === today;
  });
  
  if (todayOrders.length === 0) {
    SpreadsheetApp.getUi().alert('ไม่มีคำสั่งซื้อสำหรับวันนี้');
    return;
  }
  
  // Group by product
  const summary = {};
  todayOrders.forEach(order => {
    const productName = order[6];
    const quantity = order[7];
    const unit = order[8];
    
    if (!summary[productName]) {
      summary[productName] = {
        quantity: 0,
        unit: unit
      };
    }
    summary[productName].quantity += quantity;
  });
  
  // Create summary message
  let message = `สรุปคำสั่งซื้อวันที่ ${today}\n\n`;
  Object.entries(summary).forEach(([product, data]) => {
    message += `${product}: ${data.quantity} ${data.unit}\n`;
  });
  
  SpreadsheetApp.getUi().alert('สรุปยอดสั่งซื้อวันนี้', message, SpreadsheetApp.getUi().ButtonSet.OK);
}

// ==========================================
// EXISTING API FUNCTIONS (unchanged)
// ==========================================

// Main function to handle requests
function doGet(e) {
  const params = e.parameter;
  const callback = params.callback;
  const sheet = params.sheet;
  
  try {
    let data = [];
    
    switch(sheet) {
      case 'Users':
        data = getUsers();
        break;
      case 'Departments':
        data = getDepartments();
        break;
      case 'Categories':
        data = getCategories();
        break;
      case 'Products':
        data = getProducts();
        break;
      case 'Orders':
        data = getOrders(params);
        break;
      case 'OrderDates':
        data = getOrderDates();
        break;
      case 'Units':
        data = getUnits();
        break;
      default:
        throw new Error('Invalid sheet name');
    }
    
    // Return JSONP response
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify(data) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
      
  } catch (error) {
    return ContentService
      .createTextOutput(callback + '(' + JSON.stringify({error: error.toString()}) + ')')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
}

// Handle POST requests
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const action = data.action;
    
    switch(action) {
      case 'submitOrder':
        return handleSubmitOrder(data.data);
      case 'deleteOrder':
        return handleDeleteOrder(data.data);
      case 'closeDate':
        return handleCloseDate(data.data);
      case 'updateUnits':
        return handleUpdateUnits(data.data);
      default:
        throw new Error('Invalid action');
    }
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({status: 'error', message: error.toString()}))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Get Users data
function getUsers() {
  const sheet = ss.getSheetByName(SHEETS.USERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Get Departments data
function getDepartments() {
  const sheet = ss.getSheetByName(SHEETS.DEPARTMENTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Get Categories data
function getCategories() {
  const sheet = ss.getSheetByName(SHEETS.CATEGORIES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Get Products data
function getProducts() {
  const sheet = ss.getSheetByName(SHEETS.PRODUCTS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// Get Orders data with filters
function getOrders(params) {
  const sheet = ss.getSheetByName(SHEETS.ORDERS);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  let orders = data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
  
  // Apply filters
  if (params.userId) {
    orders = orders.filter(order => order.userId == params.userId);
  }
  
  if (params.orderDate) {
    orders = orders.filter(order => {
      const orderDateStr = Utilities.formatDate(new Date(order.orderDate), 'GMT+7', 'yyyy-MM-dd');
      const paramDateStr = Utilities.formatDate(new Date(params.orderDate), 'GMT+7', 'yyyy-MM-dd');
      return orderDateStr === paramDateStr;
    });
  }
  
  return orders;
}

// Get Order Dates data
function getOrderDates() {
  const sheet = ss.getSheetByName(SHEETS.ORDER_DATES);
  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  
  return data.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      if (header === 'date' && row[index]) {
        // Format date consistently
        obj[header] = Utilities.formatDate(new Date(row[index]), 'GMT+7', 'yyyy-MM-dd');
      } else {
        obj[header] = row[index];
      }
    });
    return obj;
  });
}

// Get Units data
function getUnits() {
  const sheet = ss.getSheetByName(SHEETS.UNITS);
  const data = sheet.getDataRange().getValues();
  
  return data.slice(1).map(row => ({
    name: row[0]
  }));
}

// Handle order submission
function handleSubmitOrder(orderData) {
  const sheet = ss.getSheetByName(SHEETS.ORDERS);
  const { orderDate, user, cart, existingOrderId } = orderData;
  
  // If editing existing order, delete old entries first
  if (existingOrderId) {
    deleteOrdersByOrderId(existingOrderId);
  }
  
  // Generate new order ID
  const orderId = existingOrderId || generateOrderId();
  const timestamp = new Date();
  
  // Get product details
  const products = getProducts();
  
  // Prepare rows to insert
  const newRows = cart.map(item => {
    const product = products.find(p => p.id === item.id);
    return [
      orderId,
      new Date(orderDate),
      user.id,
      user.name,
      item.department,
      item.id,
      product.name,
      item.quantity,
      product.unit,
      item.remark || '',
      timestamp
    ];
  });
  
  // Insert new rows
  if (newRows.length > 0) {
    const startRow = sheet.getLastRow() + 1;
    const range = sheet.getRange(startRow, 1, newRows.length, newRows[0].length);
    range.setValues(newRows);
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success', orderId: orderId}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle order deletion
function handleDeleteOrder(data) {
  const { orderId } = data;
  deleteOrdersByOrderId(orderId);
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Delete orders by order ID
function deleteOrdersByOrderId(orderId) {
  const sheet = ss.getSheetByName(SHEETS.ORDERS);
  const data = sheet.getDataRange().getValues();
  
  // Find rows to delete (from bottom to top)
  for (let i = data.length - 1; i >= 1; i--) {
    if (data[i][0] === orderId) {
      sheet.deleteRow(i + 1);
    }
  }
}

// Handle closing order date
function handleCloseDate(data) {
  const { dateToClose } = data;
  const sheet = ss.getSheetByName(SHEETS.ORDER_DATES);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  // Find and update the date row
  for (let i = 1; i < values.length; i++) {
    const rowDate = Utilities.formatDate(new Date(values[i][0]), 'GMT+7', 'yyyy-MM-dd');
    const targetDate = Utilities.formatDate(new Date(dateToClose), 'GMT+7', 'yyyy-MM-dd');
    
    if (rowDate === targetDate) {
      sheet.getRange(i + 1, 2).setValue('closed');
      break;
    }
  }
  
  return ContentService
    .createTextOutput(JSON.stringify({status: 'success'}))
    .setMimeType(ContentService.MimeType.JSON);
}

// Handle updating units
function handleUpdateUnits(data) {
  const { units } = data;
  const sheet = ss.getSheetByName(SHEETS.UNITS);
  
  // Clear existing data (except header)
  const lastRow = sheet.getLastRow();
  if (lastRow > 1) {
    sheet.deleteRows(2, lastRow - 1);
  }
  
  // Insert new units
  if (units.length > 0) {
    const newData = units.map(unit => [unit.name]);
    sheet.getRange(2, 1, newData.length, 1).setValues(newData);
  }
  
  return ContentService
   .createTextOutput(JSON.stringify({status: 'success'}))
   .setMimeType(ContentService.MimeType.JSON);
}

// Generate unique order ID
function generateOrderId() {
 const timestamp = new Date().getTime();
 const random = Math.floor(Math.random() * 1000);
 return `ORD-${timestamp}-${random}`;
}

// Utility function to format sheet data
function getSheetData(sheetName) {
 const sheet = ss.getSheetByName(sheetName);
 const data = sheet.getDataRange().getValues();
 const headers = data[0];
 
 return data.slice(1).map(row => {
   let obj = {};
   headers.forEach((header, index) => {
     obj[header] = row[index];
   });
   return obj;
 });
}