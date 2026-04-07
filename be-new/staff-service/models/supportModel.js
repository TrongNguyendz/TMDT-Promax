const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
    user_id: { type: Number, required: false },
    customer_name: { type: String, trim: true }, // Đổi từ guest_name -> customer_name cho bao quát
    guest_email: { type: String, lowercase: true, trim: true, sparse: true },
    order_id: { type: Number, ref: 'Order', required: false },
    subject: { type: String, required: true, trim: true },
    priority: { type: String, enum: ['low', 'medium', 'high', 'urgent'], default: 'medium' },
    status: { type: String, enum: ['open', 'in_progress', 'resolved', 'closed'], default: 'open' },
    assigned_staff_id: { type: Number, ref: 'Staff', required: false },
    last_message_at: { type: Date, default: Date.now },
    
    // Đếm tin nhắn chưa đọc cho cả 2 bên
    unread_count_staff: { type: Number, default: 0 },
    unread_count_customer: { type: Number, default: 0 }
}, { 
    // Dùng timestamps có sẵn của Mongoose nhưng ép nó xài snake_case cho đồng bộ
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } 
});

const SupportMessageSchema = new mongoose.Schema({
    ticket_id: { type: mongoose.Schema.Types.ObjectId, ref: 'SupportTicket', required: true },
    sender_type: { type: String, enum: ['customer', 'staff', 'system'], required: true },
    sender_id: { type: Number, required: true },
    message_type: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
    
    // Bỏ required: true để gửi ảnh không kèm chữ không bị lỗi
    content: { type: String, default: '' }, 
    file_url: { type: String, trim: true },
    
    is_read: { type: Boolean, default: false }
}, { 
    timestamps: { createdAt: 'created_at', updatedAt: false } // Tin nhắn không cần updated_at
});

// ====================== AUTO UPDATE TICKET (MỞ RỘNG) ======================
SupportMessageSchema.post('save', async function (doc) {
    const isCustomer = doc.sender_type === 'customer';
    
    await mongoose.model('SupportTicket').findByIdAndUpdate(
        doc.ticket_id,
        {
            last_message_at: doc.created_at,
            // Nếu khách gửi -> tăng unread cho staff. Nếu staff gửi -> tăng unread cho khách.
            $inc: { 
                unread_count_staff: isCustomer ? 1 : 0,
                unread_count_customer: !isCustomer ? 1 : 0
            }
        }
    );
});

// ====================== MODELS ======================
const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);
const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema);

module.exports = { SupportTicket, SupportMessage };