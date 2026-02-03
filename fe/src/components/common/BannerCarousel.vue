<template>
  <div 
    class="relative w-screen left-1/2 -translate-x-1/2 aspect-video md:aspect-[2.5/1] overflow-hidden select-none z-0 group"
    :class="['-mt-6 lg:-mt-6']"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Slides container -->
    <div
      class="flex h-full transition-transform duration-700 cubic-bezier(0.4, 0, 0.2, 1)"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div v-for="(slide, index) in slides" :key="index" class="relative h-full w-full flex-shrink-0">
        <!-- Media: Image/Video -->
        <video
          v-if="slide.type === 'video'"
          :ref="el => { if (el) videoRefs[index] = el }" 
          class="h-full w-full object-cover"
          :src="slide.src"
          loop
          playsinline
          :muted="isMuted" 
        ></video>
        <!-- Ghi chú: Bỏ autoplay ở thẻ video để điều khiển bằng logic đồng bộ phía dưới -->
        
        <img
          v-else
          class="h-full w-full object-cover"
          :src="slide.src"
          :alt="slide.alt || 'Banner image'"
        />

        <!-- Overlay -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-black/60"></div>
        
        <!-- Text Content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h2 class="text-3xl md:text-6xl font-black italic tracking-tighter uppercase drop-shadow-2xl transition-all duration-700 delay-100"
              :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'">
            {{ slide.title }}
          </h2>
          <p v-if="slide.subtitle" 
             class="mt-4 text-xs md:text-lg font-bold uppercase tracking-[0.4em] opacity-90 drop-shadow-md transition-all duration-700 delay-300"
             :class="currentIndex === index ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'">
            {{ slide.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Nút Bật/Tắt âm thanh -->
    <div v-if="slides[currentIndex]?.type === 'video'" class="absolute bottom-8 right-8 z-20">
      <button 
        @click="toggleMute"
        class="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-xl transition-all duration-300 hover:bg-white hover:text-black active:scale-90"
      >
        <svg v-if="isMuted" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
<svg v-else class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>
    </div>

    <!-- Navigation Dots -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
      <button
        v-for="(_, index) in slides" :key="index"
        @click="goTo(index)"
        class="h-1 transition-all duration-500 rounded-full"
        :class="currentIndex === index ? 'w-12 bg-white' : 'w-3 bg-white/30 hover:bg-white/60'"
      ></button>
    </div>

    <!-- Nút điều hướng -->
    <button @click="prev" class="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7" /></svg>
    </button>
    <button @click="next" class="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex h-14 w-14 items-center justify-center rounded-full bg-white/10 backdrop-blur-md text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black">
      <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7" /></svg>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue';

const props = defineProps({
  slides: { type: Array, required: true, default: () => [] },
  interval: { type: Number, default: 10000 },
  autoplay: { type: Boolean, default: true }
});

const currentIndex = ref(0);
const isMuted = ref(true); 
const videoRefs = ref([]); // Mảng chứa tham chiếu đến các thẻ video
let timer = null;

const totalSlides = computed(() => props.slides.length);

// Hàm quan trọng: Đồng bộ trạng thái Video
const syncVideoStatus = () => {
  nextTick(() => {
    videoRefs.value.forEach((video, index) => {
      if (!video) return;

      if (index === currentIndex.value) {
        // Video đang hiển thị: Phát
        video.play().catch(e => console.log("Autoplay blocked hoặc lỗi:", e));
      } else {
        // Video không hiển thị: Dừng và đưa về đầu (để tiết kiệm tài nguyên)
        video.pause();
        video.currentTime = 0; 
      }
    });
  });
};

// Theo dõi sự thay đổi của slide để điều khiển video
watch(currentIndex, () => {
syncVideoStatus();
});

const toggleMute = () => {
  isMuted.value = !isMuted.value;
};

const next = () => {
  if (totalSlides.value === 0) return;
  currentIndex.value = (currentIndex.value + 1) % totalSlides.value;
};

const prev = () => {
  if (totalSlides.value === 0) return;
  currentIndex.value = (currentIndex.value - 1 + totalSlides.value) % totalSlides.value;
};

const goTo = (index) => {
  currentIndex.value = index;
  resetTimer();
};

const resetTimer = () => {
  if (timer) clearInterval(timer);
  if (!props.autoplay || totalSlides.value <= 1) return;
  timer = setInterval(next, props.interval);
};

const handleMouseEnter = () => timer && clearInterval(timer);
const handleMouseLeave = () => resetTimer();

onMounted(() => {
  resetTimer();
  syncVideoStatus(); // Chạy video cho slide đầu tiên
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>