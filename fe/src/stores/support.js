import { defineStore } from 'pinia';
import { ref } from 'vue';
import SupportService from '../utils/support_service_api';

export const useSupportStore = defineStore('support', () => {
    const tickets = ref([]);
    const currentTicket = ref(null);
    const messages = ref([]);
    const loading = ref(false);

    const fetchAllTickets = async (params = { status: 'open' }) => {
        loading.value = true;
        try {
            const res = await SupportService.getTickets(params);
            tickets.value = res.data.data.map(t => ({
                id: t._id,
                customer: t.user_name || t.guest_name || `Khách #${t._id.slice(-5)}`,
                lastMessage: t.last_message_content || '',
                lastMessageTime: t.last_message_at,
                unread_count_staff: t.unread_count_staff || 0,
                priority: t.priority
            }));
        } finally { loading.value = false; }
    };

    const fetchMyActiveTicket = async (userId) => {
        const res = await SupportService.getTicketsByUserId(userId, { status: 'open', limit: 1 });
        return res.data.data?.[0] || null;
    };

    const fetchTicketDetails = async (ticketId) => {
        if (!ticketId || ticketId === 'undefined') return null;
        loading.value = true;
        try {
            const res = await SupportService.getTicketById(ticketId);
            const data = res.data.data;
            currentTicket.value = { ...data.ticket, id: data.ticket._id };
            messages.value = data.messages.map(m => ({
                text: m.content,
                time: m.created_at,
                sender_id: String(m.sender_id),
                sender_type: m.sender_type,
                isAdmin: m.sender_type === 'staff', 
                isStaff: m.sender_type === 'staff' 
            }));
            return data;
        } finally { loading.value = false; }
    };

    const markAsRead = async (ticketId) => {
        if (!ticketId || ticketId === 'undefined') return;
        await SupportService.markAsRead(ticketId);
        const t = tickets.value.find(x => x.id === ticketId);
        if (t) t.unread_count_staff = 0;
    };

    return { 
        tickets, currentTicket, messages, loading,
        fetchAllTickets, fetchMyActiveTicket, fetchTicketDetails, markAsRead,
        createNewTicket: (data) => SupportService.createTicket(data),
        sendChatMessage: (id, data) => SupportService.sendMessage(id, data),
        pushNewMessage: (msg) => { messages.value.push(msg); }
    };
});