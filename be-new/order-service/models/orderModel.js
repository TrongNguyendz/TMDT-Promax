const mongoose = require('mongoose');
const generateOrderNumber = require('../functions/orderNumber');

// Định nghĩa Schema cho Item 
const OrderItemSchema = new mongoose.Schema({
    product_id: { type: String, required: true },
    product_name: String,
    product_image: String,
    unit_price: Number,
    color: String,
    size: String,
    quantity: Number,
    total_price: Number
});

//  Định nghĩa Schema cho Order
const OrderSchema = new mongoose.Schema({
    order_number: { type: String, unique: true },
    user_id: { type: String, required: true },
    
    // Snapshot Address
    shipping_fullname: String,
    shipping_phone: String,
    shipping_address: String,
    shipping_city: String,

    // Money
    total_amount: Number,
    shipping_fee: { type: Number, default: 0 },
    discount_amount: { type: Number, default: 0 },
    coupon_code: String,
    final_amount: Number,

    // Status
    status: { type: String, default: 'pending' },
    payment_method: { type: String, default: 'cod' },
    payment_status: { type: String, default: 'unpaid' },
    paid_at: Date,
    notes: String,
    
    items: [OrderItemSchema] 
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

OrderSchema.set('toJSON', {
    virtuals: true,
    versionKey: false,
    transform: function (doc, ret) { delete ret._id; }
});

const Order = mongoose.model('Order', OrderSchema);

module.exports = {
    // --- Tạo đơn hàng ---
    createOrder: async (payload) => {
        const { 
            user_id, items, shipping_address, 
            shipping_fee = 0, discount_amount = 0, coupon_code, notes, payment_method, status = 'pending'
        } = payload;

        // Tính toán tiền từ items
        const totalAmount = items.reduce((sum, item) => sum + (Number(item.unit_price) * Number(item.quantity)), 0);
        const finalAmount = Math.max(0, totalAmount + Number(shipping_fee) - Number(discount_amount));

        // Tạo Document
        const newOrder = new Order({
            order_number: generateOrderNumber(),
            user_id,
            shipping_fullname: shipping_address.full_name,
            shipping_phone: shipping_address.phone,
            shipping_address: shipping_address.address,
            shipping_city: shipping_address.city,
            total_amount: totalAmount,  // Tổng tiền hàng từ items
            shipping_fee,
            discount_amount,
            coupon_code,
            final_amount: finalAmount,  // Tổng cuối cùng sau shipping và discount
            payment_method,
            notes,
            status,
            items: items.map(item => ({
                product_id: item.product_id,
                product_name: item.product_name,
                product_image: item.product_image,
                unit_price: item.unit_price,
                color: item.color,
                size: item.size,
                quantity: item.quantity,
                total_price: item.unit_price * item.quantity
            }))
        });

        return await newOrder.save();
    },

    // --- Lấy danh sách ---
    listOrders: async (userId = null) => {
        const query = userId ? { user_id: userId } : {};
        return await Order.find(query).sort({ created_at: -1 });
    },

    // --- Lấy chi tiết ---
    getOrderById: async (id) => { 
        if (mongoose.Types.ObjectId.isValid(id)) {
            return await Order.findById(id);
        } else {
            return await Order.findOne({ order_number: id });
        }
    },

    // --- Cập nhật trạng thái ---
    updateStatus: async (id, status, paymentStatus = null) => {
        const updates = { status };
        if (paymentStatus) updates.payment_status = paymentStatus;
        if (paymentStatus === 'paid') updates.paid_at = new Date();

        const result = await Order.findByIdAndUpdate(id, updates, { new: true });
        return result;
    },

    // Xóa 
    deleteOrder: async (id) => {
        const result = await Order.findByIdAndDelete(id);
        return !!result;
    },

    // BÁO CÁO THỐNG KÊ
    getStats: async () => {
    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 6);

    const [
        kpi,
        revenueWeek,
        uniqueBuyers,
        revenueByMonth,
        topProducts,
        orderStatus
    ] = await Promise.all([

        // 1. KPI Tổng (chỉ tính delivered)
        Order.aggregate([
            { $match: { status: "delivered" } },
            {
                $group: {
                    _id: null,
                    total_orders: { $sum: 1 },
                    total_revenue: { $sum: "$final_amount" },
                    total_products: { $sum: { $size: "$items" } }
                }
            }
        ]),

        // 2. Doanh thu tuần
        Order.aggregate([
            {
                $match: {
                    status: "delivered",
                    created_at: { $gte: sevenDaysAgo }
                }
            },
            {
                $group: {
                    _id: null,
                    value: { $sum: "$final_amount" }
                }
            }
        ]),

        // 3. Người mua (distinct)
        Order.distinct("user_id", {
            status: "delivered"
        }),

        // 4. Doanh thu theo tháng
        Order.aggregate([
            { $match: { status: "delivered" } },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: "%m/%Y",
                            date: "$created_at",
                            timezone: "+07:00"
                        }
                    },
                    value: { $sum: "$final_amount" }
                }
            },
            { $sort: { "_id": -1 } },
            { $limit: 6 }
        ]),

        // 5. Top sản phẩm
        Order.aggregate([
            { $match: { status: "delivered" } },
            { $unwind: "$items" },
            {
                $group: {
                    _id: "$items.product_name",
                    name: { $first: "$items.product_name" },
                    quantity: { $sum: "$items.quantity" },
                    revenue: { $sum: "$items.total_price" }
                }
            },
            { $sort: { quantity: -1 } },
            { $limit: 5 }
        ]),

        // 6. Trạng thái đơn hàng (GIỮ NGUYÊN - không filter)
        Order.aggregate([
            {
                $group: {
                    _id: "$status",
                    name: { $first: "$status" },
                    count: { $sum: 1 }
                }
            }
        ])
    ]);

    return {
        kpi: kpi[0] || {
            total_orders: 0,
            total_revenue: 0,
            total_products: 0
        },
        revenueWeek: revenueWeek[0]?.value || 0,
        payingUsers: uniqueBuyers.length,
        revenueByMonth: revenueByMonth
            .map(m => ({ name: m._id, value: m.value }))
            .reverse(),
        topProducts,
        orderStatus
    };
}
};