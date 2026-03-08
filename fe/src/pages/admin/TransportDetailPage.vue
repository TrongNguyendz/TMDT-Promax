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
          <p class="text-white/50 text-xs font-mono mt-1 tracking-widest uppercase">GHTK Ref: {{ order.ghtk_label || 'Generating...' }}</p>
        </div>
        <div class="text-right">
          <p class="text-white/40 text-[10px] uppercase tracking-widest">Estimated Arrival</p>
          <p class="text-white font-bold text-xl">{{ order.expected_delivery_date }}</p>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">
        <div class="p-8 space-y-8">
          <div class="flex gap-6">
            <div class="w-32 h-40 bg-black/20 rounded-3xl overflow-hidden border border-white/20 shadow-inner">
              <img :src="order.items[0].image" class="w-full h-full object-cover" />
            </div>
            <div class="flex-1 space-y-3">
              <h3 class="text-white text-2xl font-bold leading-tight">{{ order.items[0].name }}</h3>
              <div class="flex gap-3">
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 uppercase">Size: <b>{{ order.items[0].size }}</b></span>
                <span class="px-3 py-1 bg-white/5 border border-white/10 rounded-xl text-xs text-white/70 uppercase">Color: <b>{{ order.items[0].color }}</b></span>
              </div>
              <p class="text-2xl font-black text-white mt-4 italic">{{ formatPrice(order.amount) }}</p>
            </div>
          </div>

          <div class="space-y-4">
            <h4 class="text-white font-bold text-sm uppercase tracking-widest flex items-center gap-2">
              <div class="w-1.5 h-1.5 bg-white rounded-full"></div> Shipping Address
            </h4>
            <div class="p-5 bg-white/5 rounded-3xl border border-white/10 shadow-inner">
              <p class="text-white/80 text-sm leading-relaxed">{{ order.shipping_address }}</p>
            </div>
          </div>
        </div>

        <div class="p-8 bg-black/5">
          <h4 class="text-white font-bold text-sm uppercase tracking-widest mb-8 flex items-center gap-2">
            <div class="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div> Live Tracking
          </h4>
          
          <div class="relative space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-gradient-to-b before:from-white/40 before:to-transparent">
            <div 
              v-for="(step, index) in order.tracking_history" 
              :key="index"
              class="relative pl-10 group"
            >
              <div 
                class="absolute left-0 top-1.5 w-[24px] h-[24px] rounded-full border-4 border-[#1a1a1a] z-10 transition-all duration-500"
                :class="index === 0 ? 'bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] scale-110' : 'bg-white/20'"
              ></div>
              
              <div>
                <p class="text-sm font-bold uppercase tracking-tight" :class="index === 0 ? 'text-white' : 'text-white/40'">{{ step.status_text }}</p>
                <p class="text-[10px] font-mono mt-1" :class="index === 0 ? 'text-white/70' : 'text-white/20'">{{ step.time }}</p>
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
const formatPrice = (val) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
</script>