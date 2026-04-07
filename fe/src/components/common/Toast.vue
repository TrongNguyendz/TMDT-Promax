<template>
  <div class="pointer-events-none fixed inset-0 z-50 flex flex-col items-end justify-start p-4 pt-20">
    <!-- pt-20 để tránh chồng lên header/navbar cố định -->
    <div class="flex w-full max-w-md flex-col gap-3">
      <TransitionGroup name="toast" tag="div">
        <div
          v-for="t in toasts"
          :key="t.id"
          class="pointer-events-auto flex min-w-80 items-center justify-between gap-4 rounded-xl border px-5 py-4 shadow-xl backdrop-blur-sm transition-all"
          :class="{
            'border-green-300 bg-green-50/90 text-green-900 dark:border-green-800 dark:bg-green-950/90 dark:text-green-200': t.type !== 'error',
            'border-red-300 bg-red-50/90 text-red-900 dark:border-red-800 dark:bg-red-950/90 dark:text-red-200': t.type === 'error'
          }"
        >
          <!-- Icon đơn giản -->
          <div class="flex-shrink-0 text-xl">
            <span v-if="t.type === 'error'">✕</span>
            <span v-else>✓</span>
          </div>

          <!-- Message -->
          <p class="flex-1 text-base font-medium">{{ t.message }}</p>

          <!-- Nút đóng -->
          <button
            class="flex-shrink-0 text-sm font-medium opacity-70 transition hover:opacity-100"
            @click="remove(t.id)"
          >
            Đóng
          </button>
        </div>
      </TransitionGroup>
    </div>
  </div>
</template>

<script setup>
import { storeToRefs } from 'pinia';
import { useUIStore } from '../../stores/ui';

const ui = useUIStore();
const { toasts } = storeToRefs(ui);

function remove(id) {
  ui.removeToast(id);
}
</script>

<style scoped>
/* Hiệu ứng từ trên xuống + scale nhẹ */
.toast-enter-active,
.toast-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.toast-enter-from {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

.toast-leave-to {
  opacity: 0;
  transform: translateY(-30px) scale(0.95);
}

/* Khi di chuyển vị trí trong danh sách (khi có toast mới thêm hoặc xóa) */
.toast-move {
  transition: transform 1s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>