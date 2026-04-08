const { SupportTicket, SupportMessage } = require('../models/supportModel');

// ====================== LIST TICKETS ======================
// exports.listTickets = async (req, res) => {
//     try {
//         const { status, staffId, page = 1, limit = 20 } = req.query;

//         const query = {};
//         if (status) query.status = status;
//         if (staffId) query.assigned_staff_id = Number(staffId);

//         const skip = (Number(page) - 1) * Number(limit);

//         const [tickets, total] = await Promise.all([
//             SupportTicket.find(query)
//                 .sort({ last_message_at: -1 })
//                 .skip(skip)
//                 .limit(Number(limit))
//                 .populate('user_id', 'username full_name')
//                 .populate('assigned_staff_id', 'full_name')
//                 .lean(),
//             SupportTicket.countDocuments(query)
//         ]);

//         res.json({
//             success: true,
//             data: tickets,
//             pagination: {
//                 total,
//                 page: Number(page),
//                 limit: Number(limit),
//                 pages: Math.ceil(total / limit)
//             }
//         });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

exports.listTickets = async (req, res) => {
    try {
        const { status, staffId, page = 1, limit = 20 } = req.query;

        const query = {};
        if (status) query.status = status;
        if (staffId) query.assigned_staff_id = Number(staffId);

        const skip = (Number(page) - 1) * Number(limit);
        const limitNum = Number(limit);

        const [tickets, total] = await Promise.all([
            SupportTicket.find(query)
                .sort({ last_message_at: -1 })
                .skip(skip)
                .limit(limitNum)
                .lean(),   // ← trả về plain JS object, nhanh & nhẹ

            SupportTicket.countDocuments(query)
        ]);

        res.json({
            success: true,
            data: tickets,
            pagination: {
                total,
                page: Number(page),
                limit: limitNum,
                pages: Math.ceil(total / limitNum)
            }
        });
    } catch (error) {
        console.error('Lỗi listTickets:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy danh sách ticket'
        });
    }
};

// ====================== GET ONE TICKET + MESSAGES ======================
// exports.getTicket = async (req, res) => {
//     try {
//         const ticketId = req.params.id;
//         const ticketData = await SupportTicket.findById(ticketId)
//             .populate('user_id', 'username full_name')
//             .populate('assigned_staff_id', 'full_name')
//             .lean();
//         console.log('ticketData', ticketData);
//         if (!ticketData) return res.status(404).json({ success: false, message: 'Ticket không tồn tại' });

//         const messages = await SupportMessage.find({ ticket_id: ticketId })
//             .sort({ created_at: 1 })
//             .lean();
//         console.log('messages', messages);
//         res.json({ success: true, data: ticketData, messages });
//     } catch (error) {
//         res.status(500).json({ success: false, message: error.message });
//     }
// };

// ====================== GET ONE TICKET + MESSAGES (phiên bản đơn giản, không populate) ======================
exports.getTicket = async (req, res) => {
    try {
        const ticket = await SupportTicket.findById(req.params.id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket không tồn tại' });

        // Phải query riêng mảng messages
        const messages = await SupportMessage.find({ ticket_id: ticket._id }).sort({ created_at: 1 });

        res.json({ success: true, data: { ticket, messages } });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ====================== CREATE TICKET ======================
exports.createTicket = async (req, res) => {
    try {
        const { user_id, subject, customer_name } = req.body; 

        if (!user_id) {
            return res.status(400).json({ success: false, message: "Thiếu user_id" });
        }

        const ticket = new SupportTicket({
            user_id: Number(user_id),
            customer_name: customer_name || `Khách hàng #${user_id}`, // Lưu tên thật vào DB
            subject: subject || "Hỗ trợ khách hàng",
            status: 'open',
            last_message_at: new Date()
        });

        const savedTicket = await ticket.save();
        
        // Bắn Socket báo cho Admin biết có Ticket mới tinh vừa được tạo
        if (req.app.get('io')) {
             req.app.get('io').emit('global_ticket_update', { type: 'new_ticket' });
        }

        res.status(201).json({ success: true, data: savedTicket });
    } catch (error) {
        console.error("Lỗi tạo ticket:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ====================== SEND MESSAGE ======================
exports.sendMessage = async (req, res) => {
    try {
        const { id } = req.params; 
        const { content, sender_type, sender_id, message_type, file_url } = req.body;

        const ticket = await SupportTicket.findById(id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Không tìm thấy Ticket' });

        let statusChanged = false;

        // ✅ LOGIC TỰ ĐỘNG NHẢY TRẠNG THÁI
        if (sender_type === 'staff' && ticket.status === 'open') {
            // Admin tiếp quản đơn mới
            ticket.status = 'in_progress';
            ticket.assigned_staff_id = sender_id;
            statusChanged = true;
        } else if (sender_type === 'customer' && (ticket.status === 'resolved' || ticket.status === 'closed')) {
            // Khách nhắn vào đơn đã xong -> Hồi sinh đơn
            ticket.status = 'in_progress';
            statusChanged = true;
        }

        if (statusChanged) await ticket.save();

        // Tạo tin nhắn mới
        const newMessage = new SupportMessage({
            ticket_id: id,
            sender_type,
            sender_id,
            content: content || '',
            message_type: message_type || 'text',
            file_url: file_url || null
        });

        const savedMessage = await newMessage.save();

        // Bắn Socket Real-time
        const io = req.app.get('io');
        if (io) {
            const messageData = { ...savedMessage.toObject(), ticket_id: id };
            io.to(id).emit('receive_message', messageData);
            
            // Nếu có đổi trạng thái, báo cho Sidebar cập nhật
            io.emit('global_ticket_update', { 
                ...messageData, 
                type: statusChanged ? 'status_changed' : 'new_message',
                new_status: ticket.status 
            });
        }

        res.json({ success: true, data: savedMessage });
    } catch (error) {
        console.error("LỖI SENDMESSAGE:", error);
        res.status(500).json({ success: false, message: error.message });
    }
};
// ====================== MARK AS READ ======================
exports.markAsRead = async (req, res) => {
    try {
        const ticketId = req.params.id;
        
        await SupportMessage.updateMany(
            { ticket_id: ticketId, sender_type: 'customer', is_read: false },
            { is_read: true }
        );

        await SupportTicket.findByIdAndUpdate(ticketId, { unread_count_staff: 0 });

        // 🔥 Real-time: Thông báo cho bên kia biết tin nhắn đã được đọc (nếu cần UI update)
        const io = req.app.get('io');
        if (io) {
            io.to(ticketId).emit('messages_marked_read', { ticketId });
        }

        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
// ====================== UPDATE TICKET STATUS ======================
exports.updateTicketStatus = async (req, res) => {
    try {
        const ticketId = req.params.id;
        const { status } = req.body;

        // Chỉ cho phép các trạng thái có trong Schema
        const validStatuses = ['open', 'in_progress', 'resolved', 'closed'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Trạng thái không hợp lệ' });
        }

        const updatedTicket = await SupportTicket.findByIdAndUpdate(
            ticketId,
            { status: status },
            { new: true }
        );

        if (!updatedTicket) {
            return res.status(404).json({ success: false, message: 'Không tìm thấy Ticket' });
        }

        // Báo cho toàn hệ thống biết để tự động nhảy tab bên giao diện
        const io = req.app.get('io');
        if (io) {
            io.emit('global_ticket_update', { type: 'status_changed', ticket_id: ticketId, status });
        }

        res.json({ success: true, data: updatedTicket, message: 'Cập nhật trạng thái thành công' });
    } catch (error) {
        console.error('Lỗi updateTicketStatus:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

exports.getTicketsByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId); 
        // Tìm ticket mới nhất của user này
        const tickets = await SupportTicket.find({ user_id: userId })
            .sort({ createdAt: -1 })
            .lean();
        
        res.json({ success: true, data: tickets });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};