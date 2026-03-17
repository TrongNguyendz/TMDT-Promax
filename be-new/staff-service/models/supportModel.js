const mongoose = require('mongoose');

const SupportTicketSchema = new mongoose.Schema({
    user_id: {
        type: Number,
        required: false
    },
    guest_email: {
        type: String,
        lowercase: true,
        trim: true,
        sparse: true
    },
    guest_name: {
        type: String,
        trim: true
    },
    order_id: {
        type: Number,
        ref: 'Order',
        required: false
    },
    subject: {
        type: String,
        required: true,
        trim: true
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'resolved', 'closed'],
        default: 'open'
    },
    assigned_staff_id: {
        type: Number,
        ref: 'Staff',
        required: false
    },
    last_message_at: {
        type: Date,
        default: Date.now
    },
    unread_count_staff: {
        type: Number,
        default: 0
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
}, { timestamps: true });

const SupportMessageSchema = new mongoose.Schema({
    ticket_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SupportTicket',
        required: true
    },
    sender_type: {
        type: String,
        enum: ['customer', 'staff', 'system'],
        required: true
    },
    sender_id: {
        type: Number,           // user_id hoặc staff_id
        required: true
    },
    message_type: {
        type: String,
        enum: ['text', 'image', 'file'],
        default: 'text'
    },
    content: {
        type: String,
        required: true
    },
    file_url: {
        type: String,
        trim: true
    },
    is_read: {
        type: Boolean,
        default: false
    },
    created_at: { type: Date, default: Date.now }
});

// ====================== AUTO UPDATE TICKET ======================
SupportMessageSchema.post('save', async function (doc) {
    await mongoose.model('SupportTicket').findByIdAndUpdate(
        doc.ticket_id,
        {
            last_message_at: doc.created_at,
            $inc: { unread_count_staff: doc.sender_type === 'customer' ? 1 : 0 }
        }
    );
});

// ====================== MODELS ======================
const SupportTicket = mongoose.model('SupportTicket', SupportTicketSchema);
const SupportMessage = mongoose.model('SupportMessage', SupportMessageSchema);

module.exports = { SupportTicket, SupportMessage };