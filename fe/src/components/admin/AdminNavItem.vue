<!-- components/admin/AdminNavItem.vue -->
<template>
  <RouterLink
    :to="to"
    class="group relative flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm transition-all duration-300"
    :class="active 
      ? 'bg-gray-900 text-white shadow-xl shadow-gray-200 dark:bg-white dark:text-black dark:shadow-none font-bold' 
      : 'text-gray-500 hover:bg-gray-50 dark:text-gray-400 dark:hover:bg-gray-900 hover:text-gray-900 dark:hover:text-white'"
  >
    <!-- Indicator Bar: Đổi sang trắng (light) hoặc đen (dark) -->
    <div v-if="active" class="absolute left-0 h-5 w-1 rounded-r-full bg-white dark:bg-black"></div>
    
    <span class="shrink-0 transition-transform duration-300 group-hover:scale-110">
      <slot />
    </span>
    
    <span class="flex-1 tracking-tight">{{ label }}</span>

    <svg v-if="!active" class="w-4 h-4 opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
    </svg>
  </RouterLink>
</template>

<script setup>
defineProps({ to: String, label: String, active: Boolean })
</script>
