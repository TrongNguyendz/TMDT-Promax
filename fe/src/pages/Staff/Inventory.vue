<template>
  <div class="space-y-8">
    <h1 class="text-2xl lg:text-3xl font-black text-gray-900 dark:text-white">Kho hàng</h1>

    <!-- SEARCH + FILTER -->
    <div class="flex flex-col md:flex-row items-center gap-4 w-full">
      
      <!-- search -->
      <input
        v-model="searchKeyword"
        type="text"
        placeholder="Tìm theo tên hoặc mã..."
        class="flex-1 px-4 py-2 border rounded-xl w-full dark:bg-gray-900"
      />

      <!-- filter -->
      <select
        v-model="sortBy"
        class="w-30 md:w-56 px-4 py-2 border rounded-xl dark:bg-gray-900"
      >
        <option value="">Không sắp xếp</option>
        <option value="stock">Tổng tồn</option>
        <option value="sold">Đã bán</option>
        <option value="ratio">Tỉ lệ bán</option>
      </select>

    </div>

    <!-- INVENTORY LIST -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div
        v-for="item in paginatedInventory"
        :key="item.id"
        class="bg-white dark:bg-gray-900 rounded-2xl shadow-sm overflow-hidden border border-gray-200 dark:border-gray-800"
      >
        <div class="p-6">
          <h3 class="text-xl font-bold mb-2">{{ item.name }}</h3>
          <p class="text-gray-600 dark:text-gray-400 mb-4">
            Mã: {{ item.code }} • Size: {{ item.size }}
          </p>

          <div class="grid grid-cols-2 gap-4 mb-6">
            <div>
              <p class="text-sm text-gray-500">Tổng tồn</p>
              <p class="text-2xl font-bold">{{ item.totalStock }}</p>
            </div>
            <div>
              <p class="text-sm text-gray-500">Đã bán</p>
              <p class="text-2xl font-bold text-teal-600">{{ item.sold }}</p>
            </div>
          </div>

          <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2">
            <div
              :style="{ width: `${(item.sold / item.totalStock) * 100}%` }"
              class="bg-teal-500 h-3 rounded-full"
            ></div>
          </div>

          <p class="text-sm text-right text-gray-500">
            {{ Math.round((item.sold / item.totalStock) * 100) }}% đã bán
          </p>
        </div>
      </div>
    </div>
    <div class="flex gap-2 justify-center mt-6">
    <button
        @click="changePage(currentPage-1)"
        :disabled="currentPage===1"
        class="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        Prev
      </button>

      <button
        v-for="page in totalPages"
        :key="page"
        @click="changePage(page)"
        :class="[
          'px-3 py-1 border rounded-lg',
          page===currentPage ? 'bg-teal-500 text-white' : ''
        ]"
      >
        {{ page }}
      </button>

      <button
        @click="changePage(currentPage+1)"
        :disabled="currentPage===totalPages"
        class="px-3 py-1 border rounded-lg disabled:opacity-50"
      >
        Next
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";

const searchKeyword = ref("");
const sortBy = ref("");

const currentPage = ref(1);
const itemsPerPage = 6;

const inventory = ref([
  { id: 1, name: "Áo thun oversize 2026", code: "AT-001", size: "M/L/XL", sold: 187, totalStock: 1200 },
  { id: 2, name: "Quần jeans slim fit", code: "QJ-002", size: "28-34", sold: 320, totalStock: 850 },
  { id: 3, name: "Váy maxi dài", code: "VM-003", size: "S/M/L", sold: 68, totalStock: 200 },
  { id: 4, name: "Áo hoodie basic", code: "AH-004", size: "M/L/XL", sold: 210, totalStock: 500 },
  { id: 5, name: "Áo sơ mi form rộng", code: "SM-005", size: "M/L", sold: 95, totalStock: 300 },
  { id: 6, name: "Quần short thể thao", code: "QS-006", size: "M/L/XL", sold: 140, totalStock: 400 },
  { id: 7, name: "Áo khoác bomber", code: "AK-007", size: "M/L", sold: 60, totalStock: 150 },
  { id: 8, name: "Váy công sở", code: "VC-008", size: "S/M/L", sold: 120, totalStock: 350 }
]);

// SEARCH + SORT
const filteredInventory = computed(() => {
  let data = [...inventory.value];

  if (searchKeyword.value) {
    const keyword = searchKeyword.value.toLowerCase();
    data = data.filter(
      item =>
        item.name.toLowerCase().includes(keyword) ||
        item.code.toLowerCase().includes(keyword)
    );
  }

  if (sortBy.value === "stock") data.sort((a,b)=>b.totalStock-a.totalStock);
  if (sortBy.value === "sold") data.sort((a,b)=>b.sold-a.sold);
  if (sortBy.value === "ratio") data.sort((a,b)=> (b.sold/b.totalStock)-(a.sold/a.totalStock));

  return data;
});

// TOTAL PAGE
const totalPages = computed(() =>
  Math.ceil(filteredInventory.value.length / itemsPerPage)
);

// DATA THEO TRANG
const paginatedInventory = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  return filteredInventory.value.slice(start, start + itemsPerPage);
});

// CHANGE PAGE
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
  }
};
</script>