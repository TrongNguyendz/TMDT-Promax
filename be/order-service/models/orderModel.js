// order-service/models/orderModel.js
const db = require('../config/database');
const generateOrderNumber = require('../functions/orderNumber');

exports.createOrder = async (payload) => {
    // 1. TRÍCH XUẤT DỮ LIỆU LINH HOẠT (Hỗ trợ cả camelCase và snake_case)
    const { 
        user_id, userId,
        items, 
        shipping_address, address,
        shipping_fee = 0, 
        notes, note,
        payment_method, paymentMethod,
        customer_name, fullName,
        customer_phone, phone
    } = payload;
    
    // 2. CHUẨN HÓA THÔNG TIN KHÁCH HÀNG & ĐỊA CHỈ
    const finalUserId = user_id || userId;
    const finalFullName = customer_name || fullName || (shipping_address?.full_name) || 'Khách hàng';
    const finalPhone = customer_phone || phone || (shipping_address?.phone) || '';
    const finalNote = notes || note || '';
    const finalPaymentMethod = payment_method || paymentMethod || 'cod';

    // Xử lý địa chỉ: Nếu shipping_address là Object (từ form cũ) thì lấy .address, nếu là String (từ VNPAY chuẩn hóa) thì dùng luôn
    let finalAddressString = '';
    let finalCity = '';

    if (typeof shipping_address === 'object' && shipping_address !== null) {
        finalAddressString = shipping_address.address || '';
        finalCity = shipping_address.city || '';
    } else {
        finalAddressString = shipping_address || address || '';
    }

    // 3. TÍNH TOÁN TỔNG TIỀN (Sửa lỗi NaN)
    // Kiểm tra từng item để lấy price hoặc unit_price
    const calculatedTotal = (items || []).reduce((sum, item) => {
        const price = Number(item.unit_price || item.price || 0);
        const qty = Number(item.quantity || 0);
        return sum + (price * qty);
    }, 0);

    // Nếu frontend có gửi total_amount thì ưu tiên dùng, nếu không thì dùng số vừa tính
    const totalAmount = Number(payload.total_amount || payload.totalAmount || calculatedTotal);
    const finalAmount = totalAmount + Number(shipping_fee);
    const now = new Date().toISOString();

    console.log("--- MODEL DATABASE INSERT ---");
    console.log("Total Amount to save:", totalAmount);

    // 4. THỰC HIỆN TRANSACTION
    await db.run('BEGIN TRANSACTION');
    try {
        const orderNumber = generateOrderNumber();
        
        // Chèn vào bảng orders
        // Lưu ý: Đảm bảo các biến trong mảng không bị undefined (dùng || null)
        const orderRes = await db.run(`
            INSERT INTO orders (
                order_number, user_id, 
                shipping_fullname, shipping_phone, shipping_address, shipping_city,
                total_amount, shipping_fee, final_amount,
                status, payment_method, notes, created_at, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                orderNumber, 
                finalUserId || null,
                finalFullName || null, 
                finalPhone || null, 
                finalAddressString || null, 
                finalCity || null,
                totalAmount, // Giá trị này bây giờ chắc chắn là số
                shipping_fee, 
                finalAmount,
                payload.status || 'pending', 
                finalPaymentMethod, 
                finalNote, 
                now, 
                now
            ]
        );
        
        const orderId = orderRes.lastID;

        // 5. CHÈN CHI TIẾT SẢN PHẨM (order_items)
        if (items && items.length > 0) {
            for (const item of items) {
                // Lấy ID sản phẩm linh hoạt
                const finalProductId = item.product_id || item.productId || item.id;
                
                // Nếu vẫn không có ID, báo lỗi cụ thể thay vì để SQL crash
                if (!finalProductId) {
                    console.error("🚨 Item missing product_id:", item);
                    throw new Error("Dữ liệu sản phẩm không hợp lệ (thiếu ID)");
                }

                const itemPrice = Number(item.unit_price || item.price || 0);
                const itemQty = Number(item.quantity || 1);
                
                await db.run(`
                    INSERT INTO order_items (
                        order_id, product_id, product_name, product_image, 
                        unit_price, color, size, quantity, total_price
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                    [
                        orderId, 
                        finalProductId, // Bây giờ giá trị này chắc chắn có dữ liệu
                        item.product_name || item.name || 'Sản phẩm', 
                        item.product_image || item.image || null,
                        itemPrice, 
                        item.color || null, 
                        item.size || null, 
                        itemQty,
                        (itemPrice * itemQty)
                    ]
                );
            }
        }

        await db.run('COMMIT');
        return { id: orderId, order_number: orderNumber, final_amount: finalAmount };
        
    } catch (e) {
        await db.run('ROLLBACK');
        console.error("❌ SQL Error in Model:", e.message);
        throw e;
    }
};

exports.listOrders = async (userId = null) => {
    let sql = 'SELECT * FROM orders WHERE 1=1';
    const params = [];
    if (userId) {
        sql += ' AND user_id = ?';
        params.push(userId);
    }
    sql += ' ORDER BY created_at DESC';

    const orders = await db.all(sql, params);
    for (let order of orders) {
        order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [order.id]);
    }
    return orders;
};

exports.getOrderById = async (id) => {
    const order = await db.get('SELECT * FROM orders WHERE id = ?', [id]);
    if (order) {
        order.items = await db.all('SELECT * FROM order_items WHERE order_id = ?', [id]);
    }
    return order;
};

exports.updateStatus = async (id, status, paymentStatus = null) => {
    let sql = 'UPDATE orders SET status = ?, updated_at = CURRENT_TIMESTAMP';
    const params = [status];

    // 👇 KHÔNG CÓ ĐOẠN NÀY LÀ KHÔNG BAO GIỜ UPDATE ĐƯỢC
    if (paymentStatus) {
        sql += ', payment_status = ?';
        params.push(paymentStatus);
    }

    sql += ' WHERE id = ?'; // Hoặc WHERE order_number = ? tùy vào cái bạn gửi sang
    params.push(id);

    return await db.run(sql, params);
};

exports.deleteOrder = async (id) => {
    const result = await db.run('DELETE FROM orders WHERE id = ?', [id]);
    return result.changes > 0;
};
//CHANGE
exports.getStats = async () => {
    // 1. KPI Tổng quan (Doanh thu, Số đơn, SP đã bán)
    // Chỉ tính các đơn không bị hủy
    const kpi = await db.get(`
        SELECT 
            COUNT(id) as total_orders,
            SUM(CASE WHEN status != 'cancelled' THEN final_amount ELSE 0 END) as total_revenue,
            (SELECT COUNT(*) FROM order_items) as total_products_sold
        FROM orders
    `);

    // 2. Doanh thu theo tháng (6 tháng gần nhất)
    const revenueByMonth = await db.all(`
        SELECT 
            strftime('%m/%Y', created_at) as name, 
            SUM(final_amount) as value
        FROM orders 
        WHERE status != 'cancelled'
        GROUP BY strftime('%m/%Y', created_at)
        ORDER BY created_at DESC
        LIMIT 6
    `);

    // 3. Top 5 sản phẩm bán chạy
    const topProducts = await db.all(`
        SELECT 
            product_name as name, 
            SUM(quantity) as quantity, 
            SUM(total_price) as revenue
        FROM order_items
        GROUP BY product_name
        ORDER BY quantity DESC
        LIMIT 5
    `);

    // 4. Trạng thái đơn hàng
    const orderStatus = await db.all(`
        SELECT status as name, COUNT(*) as count 
        FROM orders 
        GROUP BY status
    `);
    
     // 5. Tính số lượng User đã từng đặt hàng (Không tính đơn hủy)
    const uniqueBuyers = await db.get(`
        SELECT COUNT(DISTINCT user_id) as count
        FROM orders
        WHERE status != 'cancelled'
    `);

    // 6. Tính doanh thu 7 ngày qua
    const revenueWeek = await db.get(`
        SELECT SUM(final_amount) as value
        FROM orders
        WHERE status != 'cancelled' 
        AND created_at >= date('now', '-6 days')
    `);

    return {
        kpi,
        revenueWeek: revenueWeek?.value || 0,
        payingUsers: uniqueBuyers?.count || 0,
        revenueByMonth: revenueByMonth.reverse(), // Đảo lại để tháng cũ bên trái
        topProducts,
        orderStatus
    };
};
