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
              :style="{ width: `${(item.totalStock ? (item.sold / item.totalStock) * 100 : 0)}%` }"
              class="bg-teal-500 h-3 rounded-full"
            ></div>
          </div>

          <p class="text-sm text-right text-gray-500">
            {{ Math.round((item.totalStock ? (item.sold / item.totalStock) * 100 : 0)) }}% đã bán
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
import { ref, computed, onMounted } from "vue";
import { getlistproduct } from "../../utils/product_service_api";

const searchKeyword = ref("");
const sortBy = ref("");

const currentPage = ref(1);
const itemsPerPage = 6;

const inventory = ref([]);

const loadInventory = async () => {
  try {
    const res = await getlistproduct();
    const data = res.data.data || [];

    inventory.value = data.map(p => ({
      id: p._id || p.id,
      name: p.name,
      code: p.sku || p.code,
      size: p.attributes
      ?.filter(a => a.attribute_name === "Size")
      .map(a => a.attribute_value)
      .join('/') || '---',

      // ⚠️ cần backend trả
      sold: p.sold || 0,
      totalStock: p.stock_quantity || 0
    }));

  } catch (err) {
    console.error('❌ Load inventory lỗi:', err);
  }
};

// SEARCH + SORT
const filteredInventory = computed(() => {
  let data = [...inventory.value];

  if (searchKeyword.value) {
    const keyword = String(searchKeyword.value).toLowerCase();
    data = data.filter(
      item =>
        (item.name || '').toLowerCase().includes(keyword) ||
        (item.code || '').toLowerCase().includes(keyword)
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

onMounted(() => {
  loadInventory();
});
</script>