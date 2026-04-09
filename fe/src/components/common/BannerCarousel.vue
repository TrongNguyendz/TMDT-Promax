<template>
  <div 
    class="relative w-screen left-1/2 -translate-x-1/2 aspect-video md:aspect-[2.5/1] overflow-hidden select-none z-0 group"
    :class="['-mt-6 lg:-mt-6']"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- Slides container -->
    <div
      class="flex h-full transition-transform duration-700 ease-out"
      :style="{ transform: `translateX(-${currentIndex * 100}%)` }"
    >
      <div v-for="(slide, index) in slides" :key="index" class="relative h-full w-full flex-shrink-0">
        <!-- Media: Image/Video -->
        <video
          v-if="slide.type === 'video'"
          :ref="el => { if (el) videoRefs[index] = el }"
          class="h-full w-full object-cover brightness-110 contrast-105"
          :src="slide.src"
          loop
          playsinline
          :muted="isMuted"
        ></video>

        <img
          v-else
          class="h-full w-full object-cover brightness-110 contrast-105"
          :src="slide.src"
          :alt="slide.alt || 'Banner image'"
        />

        <!-- Overlay nhẹ hơn nhiều để banner sáng rõ -->
        <div class="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/40"></div>
        
        <!-- Text Content -->
        <div class="absolute inset-0 flex flex-col items-center justify-center text-center text-white p-4">
          <h2 
            class="text-3xl md:text-6xl font-black italic tracking-[-0.04em] uppercase drop-shadow-[0_4px_20px_rgba(0,0,0,0.6)] transition-all duration-700"
            :class="currentIndex === index 
              ? 'translate-y-0 opacity-100 scale-100' 
              : 'translate-y-8 opacity-0 scale-95'"
          >
            {{ slide.title }}
          </h2>
          <p v-if="slide.subtitle" 
             class="mt-4 text-xs md:text-lg font-bold uppercase tracking-[0.5em] drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)] transition-all duration-700 delay-200"
             :class="currentIndex === index 
               ? 'translate-y-0 opacity-100' 
               : 'translate-y-6 opacity-0'">
            {{ slide.subtitle }}
          </p>
        </div>
      </div>
    </div>

    <!-- Nút Bật/Tắt âm thanh (glassmorphism hiện đại) -->
    <div v-if="slides[currentIndex]?.type === 'video'" class="absolute bottom-8 right-8 z-20">
      <button 
        @click="toggleMute"
        class="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white shadow-2xl transition-all duration-300 hover:bg-white hover:text-black hover:scale-110 active:scale-95"
      >
        <svg v-if="isMuted" xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2.5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
        </svg>
      </button>
    </div>

    <!-- Navigation Dots (sáng và nổi bật hơn) -->
    <div class="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-3 z-10">
      <button
        v-for="(_, index) in slides" :key="index"
        @click="goTo(index)"
        class="h-1.5 rounded-full transition-all duration-500 shadow-md"
        :class="currentIndex === index 
          ? 'w-14 bg-white shadow-white/50' 
          : 'w-3 bg-white/60 hover:bg-white/90'"
      ></button>
    </div>

    <!-- Nút điều hướng (đẹp hơn, sáng hơn) -->
    <button 
      @click="prev" 
      class="absolute left-6 top-1/2 -translate-y-1/2 hidden lg:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black hover:scale-110"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
      </svg>
    </button>

    <button 
      @click="next" 
      class="absolute right-6 top-1/2 -translate-y-1/2 hidden lg:flex h-14 w-14 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-xl border border-white/30 text-white opacity-0 transition-all duration-300 group-hover:opacity-100 hover:bg-white hover:text-black hover:scale-110"
    >
      <svg xmlns="http://www.w3.org/2000/svg" class="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="3">
        <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
      </svg>
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
const videoRefs = ref([]);
let timer = null;

const totalSlides = computed(() => props.slides.length);

const syncVideoStatus = () => {
  nextTick(() => {
    videoRefs.value.forEach((video, index) => {
      if (!video) return;
      if (index === currentIndex.value) {
        video.play().catch(e => console.log("Autoplay blocked:", e));
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  });
};

watch(currentIndex, syncVideoStatus);

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
  syncVideoStatus();
});

onUnmounted(() => {
  if (timer) clearInterval(timer);
});
</script>