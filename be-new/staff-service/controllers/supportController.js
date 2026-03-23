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
        const ticketId = req.params.id;

        // Chỉ lấy ticket cơ bản, không populate gì cả
        const ticket = await SupportTicket.findById(ticketId).lean();

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket không tồn tại'
            });
        }

        // Lấy tất cả message của ticket, sắp xếp theo thời gian tăng dần
        const messages = await SupportMessage.find({ ticket_id: ticketId })
            .sort({ created_at: 1 })
            .lean();

        // Trả về response tối giản
        res.json({
            success: true,
            data: {
                ticket: ticket,
                messages: messages
            }
        });
    } catch (error) {
        console.error('Lỗi khi lấy ticket + messages:', error);

        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy thông tin ticket'
        });
    }
};
// ====================== CREATE TICKET ======================
exports.createTicket = async (req, res) => {
    try {
        const ticket = new SupportTicket(req.body);
        await ticket.save();
        res.status(201).json({ success: true, data: ticket });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== SEND MESSAGE ======================
exports.sendMessage = async (req, res) => {
    try {
        const { sender_type, sender_id, content, message_type = 'text' } = req.body;
        const ticket_id = req.params.id;
        const ticket = await SupportTicket.findById(ticket_id);
        if (!ticket) return res.status(404).json({ success: false, message: 'Ticket không tồn tại' });
        const message = new SupportMessage({
            ticket_id,
            sender_type,
            sender_id,
            content,
            message_type
        });

        await message.save();

        res.status(201).json({ success: true, data: message });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// ====================== MARK AS READ ======================
exports.markAsRead = async (req, res) => {
    try {
        await SupportMessage.updateMany(
            { ticket_id: req.params.id, sender_type: 'customer', is_read: false },
            { is_read: true }
        );

        await SupportTicket.findByIdAndUpdate(req.params.id, { unread_count_staff: 0 });

        res.json({ success: true, message: 'Đã đánh dấu đã đọc' });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

/**
 * Lấy danh sách ticket theo user_id
 * GET /api/support/tickets/user/:userId
 * Query params hỗ trợ: status, page, limit, sort (tùy chọn)
 */
exports.getTicketsByUserId = async (req, res) => {
    try {
        const userId = Number(req.params.userId);
        if (!userId || isNaN(userId)) {
            return res.status(400).json({
                success: false,
                message: 'userId phải là số hợp lệ'
            });
        }

        const { status, page = 1, limit = 10, sort = 'last_message_at' } = req.query;

        const query = { user_id: userId };
        if (status) query.status = status;

        const skip = (Number(page) - 1) * Number(limit);
        const limitNum = Number(limit);

        // Xác định hướng sort (-1 = mới nhất trước)
        let sortOption = { last_message_at: -1 };
        if (sort === 'created_at') {
            sortOption = { created_at: -1 };
        } else if (sort === 'created_at_asc') {
            sortOption = { created_at: 1 };
        }

        const [tickets, total] = await Promise.all([
            SupportTicket.find(query)
                .sort(sortOption)
                .skip(skip)
                .limit(limitNum)
                .lean(),

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
        console.error('Lỗi getTicketsByUserId:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Lỗi server khi lấy ticket của user'
        });
    }
};