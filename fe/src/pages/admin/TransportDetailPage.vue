<template>
  <div class="max-w-4xl mx-auto px-4 py-8 relative z-10">
    <button @click="$emit('back')" class="mb-6 flex items-center gap-2 text-white/70 hover:text-white transition group text-sm uppercase tracking-widest">
      <span class="p-2 bg-white/10 rounded-full group-hover:bg-white/20 transition">←</span>
      Quay lại danh sách
    </button>

    <div class="bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[40px] overflow-hidden shadow-2xl">
      <div class="p-8 border-b border-white/10 bg-white/5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 class="text-white text-3xl font-black italic tracking-tighter uppercase">Order Details</h2>
          <p class="text-white/50 text-xs font-mono mt-1 tracking-widest uppercase">
            REF: {{ order.client_order_code || 'GHTK_ORDER_PENDING' }}
          </p>
        </div>
        <div class="text-right">
          <p class="text-white/40 text-[10px] uppercase tracking-widest">Pickup Time</p>
          <p class="text-white font-bold text-xl">{{ formatDate(order.pickup_time) }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        <div class="p-8 space-y-8">
          <div v-for="(item, idx) in order.items" :key="idx" class="flex gap-6">
            <div class="w-32 h-40 bg-black/20 rounded-3xl overflow-hidden border border-white/20 shadow-inner flex items-center justify-center">
              <img v-if="item.image" :src="item.image" class="w-full h-full object-cover" />
              <div v-else class="text-white/20 text-xs text-center p-4 uppercase tracking-tighter">No Image Available</div>
            </div>
            <div class="flex-1 space-y-3">
              <h3 class="text-white text-2xl font-bold leading-tight">{{ item.name }}</h3>
              <div class="flex flex-wrap gap-2">
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 uppercase">Code: <b>{{ item.code }}</b></span>
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 uppercase">Qty: <b>{{ item.quantity }}</b></span>
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 uppercase">Weight: <b>{{ item.weight }}g</b></span>
              </div>
              <p class="text-2xl font-black text-white mt-4 italic">{{ formatPrice(item.price) }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div> Shipping To
            </h4>
            <div class="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
              <p class="text-white font-bold mb-1">{{ order.to_name }} <span class="text-white/50 font-normal ml-2">| {{ order.to_phone }}</span></p>
              <p class="text-white/80 text-sm leading-relaxed">
                {{ order.to_address }}
              </p>
              <div class="mt-3 pt-3 border-t border-white/5 text-[10px] text-white/40 uppercase tracking-widest">
                Note: {{ order.note }}
              </div>
            </div>
          </div>
        </div>

        <div class="p-8 bg-black/5">
          <h4 class="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Order Summary
          </h4>
          
          <div class="space-y-6">
            <div class="flex justify-between items-end border-b border-white/10 pb-4">
              <span class="text-white/50 text-xs uppercase tracking-widest">Total COD</span>
              <span class="text-white text-3xl font-black italic">{{ formatPrice(order.cod_amount) }}</span>
            </div>

            <div class="relative space-y-8 mt-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-white/40 before:to-transparent">
              <div class="relative pl-10 group">
                <div class="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-[#1a1a1a] z-10 bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110"></div>
                <div>
                  <p class="text-sm font-bold uppercase tracking-tight text-white">Đã tiếp nhận đơn hàng</p>
                  <p class="text-[10px] font-mono mt-1 text-white/70">Vừa xong</p>
                </div>
              </div>
              
              <div v-if="!order.tracking_history" class="relative pl-10 group opacity-40">
                <div class="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-[#1a1a1a] z-10 bg-white/20"></div>
                <div>
                  <p class="text-sm font-bold uppercase tracking-tight text-white/40">Đang chờ điều phối</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps(['order']);

// Format tiền tệ
const formatPrice = (val) => {
  if (!val) return '0 ₫';
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
};

// Format ngày tháng từ Timestamp (1692840132)
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  const date = new Date(timestamp * 1000); // Nhân 1000 vì GHTK/GHN thường dùng giây
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};
</script>