<template>
  <section class="space-y-6">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-xs font-semibold uppercase text-blue-600">So sánh sản phẩm</p>
        <h1 class="text-2xl font-bold text-gray-900 dark:text-white">Chọn 2 sản phẩm để so sánh</h1>
        <p class="mt-1 text-sm text-gray-500">Lựa chọn 2 sản phẩm cùng danh mục hoặc khác danh mục để so sánh nhanh các chỉ số.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">
        <button
          class="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100"
          @click="clearSelection"
          :disabled="selectedProducts.length === 0"
        >
          Xóa chọn
        </button>
        <span class="text-sm text-slate-500">Đã chọn <strong>{{ selectedProducts.length }}</strong>/2</span>
      </div>
    </div>

    <div class="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-900">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-200">
          <span class="text-blue-600">Sản phẩm đang so sánh:</span>
          <template v-if="selectedProducts.length === 0">
            <span class="text-gray-500">(Chưa chọn sản phẩm)</span>
          </template>
          <template v-else>
            <span v-for="p in selectedProducts" :key="p.id" class="rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">{{ p.name }}</span>
          </template>
        </div>
        <div class="text-xs text-gray-500">Chọn tối đa 2 sản phẩm</div>
      </div>
    </div>

    <div class="rounded-2xl border border-dashed border-gray-300 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 class="text-lg font-semibold text-gray-800 dark:text-white">Danh sách sản phẩm</h2>
          <p class="text-sm text-gray-500">Click chọn vào sản phẩm để thêm vào bảng so sánh.</p>
        </div>
        <input
          v-model="q"
          @input="updateFilter"
          type="text"
          placeholder="Tìm nhanh theo tên..."
          class="w-full max-w-sm rounded-lg border border-gray-300 px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
        />
      </div>

      <div class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="rounded-xl border p-3 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md dark:border-gray-700 dark:bg-gray-800"
        >
          <div class="flex items-start gap-3">
            <img :src="getPrimaryImage(product)" alt="" class="h-16 w-16 rounded-md object-cover" />
            <div class="min-w-0 flex-1">
              <p class="font-semibold text-sm text-gray-800 dark:text-gray-200 truncate">{{ product.name }}</p>
              <p class="mt-1 text-xs text-gray-500">{{ product.category_name || 'Không rõ danh mục' }}</p>
              <p class="mt-1 text-sm font-semibold text-red-600">{{ formatPrice(product.price) }}</p>
            </div>
          </div>

          <div class="mt-3 flex items-center justify-between">
            <button
              class="rounded-lg border px-2 py-1 text-xs font-medium transition hover:bg-blue-50 dark:hover:bg-blue-900/50"
              :class="selectedIds.has(product.id) ? 'border-blue-500 text-blue-600' : 'border-gray-300 text-gray-600 dark:text-gray-200'"
              @click="toggleSelect(product)"
            >
              {{ selectedIds.has(product.id) ? 'Đã chọn' : 'Chọn so sánh' }}
            </button>
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">Kho: {{ product.stock_quantity ?? 0 }}</span>
          </div>
        </div>
      </div>

      <div v-if="loading" class="mt-3 text-sm text-gray-500">Đang tải sản phẩm...</div>
      <div v-if="!loading && filteredProducts.length === 0" class="mt-3 text-sm text-gray-500">Không tìm thấy sản phẩm phù hợp với từ khóa.</div>
    </div>

    <div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-900">
      <div class="mb-3 flex items-center justify-between">
        <div>
          <h2 class="text-lg font-semibold">Bảng so sánh</h2>
          <p class="text-sm text-gray-500">So sánh nhanh 2 sản phẩm theo các tiêu chí quan trọng.</p>
        </div>
        <span class="text-xs text-gray-500">Vui lòng chọn đủ 2 sản phẩm</span>
      </div>

      <div v-if="selectedProducts.length < 2" class="rounded-xl border border-dashed border-gray-300 p-8 text-center text-gray-500">
        Vui lòng chọn thêm {{ 2 - selectedProducts.length }} sản phẩm để so sánh.
      </div>

      <div v-else>
        <div class="overflow-x-auto">
          <table class="w-full border-collapse text-left text-sm">
            <thead>
              <tr class="border-b border-gray-200 text-gray-600 dark:border-gray-700 dark:text-gray-300">
                <th class="py-2 px-2 font-semibold">Tiêu chí</th>
                <th class="py-2 px-2 font-semibold">{{ selectedProducts[0].name }}</th>
                <th class="py-2 px-2 font-semibold">{{ selectedProducts[1].name }}</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">Giá</td>
                <td class="py-2 px-2 text-red-600 dark:text-red-400">{{ formatPrice(selectedProducts[0].price) }}</td>
                <td class="py-2 px-2 text-red-600 dark:text-red-400">{{ formatPrice(selectedProducts[1].price) }}</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">Danh mục</td>
                <td class="py-2 px-2">{{ selectedProducts[0].category_name || 'N/A' }}</td>
                <td class="py-2 px-2">{{ selectedProducts[1].category_name || 'N/A' }}</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">Tồn kho</td>
                <td class="py-2 px-2">{{ selectedProducts[0].stock_quantity ?? 0 }}</td>
                <td class="py-2 px-2">{{ selectedProducts[1].stock_quantity ?? 0 }}</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">Khuyến mãi</td>
                <td class="py-2 px-2">{{ selectedProducts[0].discount_percent ? selectedProducts[0].discount_percent + '%' : 'Không' }}</td>
                <td class="py-2 px-2">{{ selectedProducts[1].discount_percent ? selectedProducts[1].discount_percent + '%' : 'Không' }}</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-700">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">Mô tả</td>
                <td class="py-2 px-2">{{ getShortText(selectedProducts[0].description) }}</td>
                <td class="py-2 px-2">{{ getShortText(selectedProducts[1].description) }}</td>
              </tr>
              <tr class="border-b border-gray-100 dark:border-gray-700" v-for="row in attributeRows" :key="row.name">
                <td class="py-2 px-2 font-medium text-gray-700 dark:text-gray-200">{{ row.name }}</td>
                <td class="py-2 px-2">{{ getAttributeValue(selectedProducts[0], row.key) }}</td>
                <td class="py-2 px-2">{{ getAttributeValue(selectedProducts[1], row.key) }}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useProductsStore } from '../../stores/products';

const route = useRoute();
const router = useRouter();
const productsStore = useProductsStore();

const loading = computed(() => productsStore.loading);
const q = ref('');
const selectedIds = reactive([]);

const parseCompareIds = () => {
  const ids = [];
  if (route.query.id1) ids.push(String(route.query.id1));
  if (route.query.id2) ids.push(String(route.query.id2));
  return [...new Set(ids)].slice(0, 2);
};

const setCompareIdsInUrl = (ids) => {
  const nextQuery = { ...route.query };
  if (ids[0]) nextQuery.id1 = ids[0]; else delete nextQuery.id1;
  if (ids[1]) nextQuery.id2 = ids[1]; else delete nextQuery.id2;
  router.replace({ query: nextQuery });
};

const syncSelectedIdsFromRoute = () => {
  const ids = parseCompareIds();
  selectedIds.splice(0, selectedIds.length, ...ids);
};

const getPrimaryImage = (p) => {
  if (p?.images?.length) {
    const main = p.images.find(i => i.is_primary);
    return main?.image_url || p.images[0]?.image_url;
  }
  return 'https://via.placeholder.com/120x120?text=No+Image';
};

const formatPrice = (value) => {
  if (value == null) return '0 đ';
  return Number(value).toLocaleString('vi-VN') + ' đ';
};

const updateFilter = () => {
  // reactive update from q
};

const products = computed(() => productsStore.products || []);
const filteredProducts = computed(() => {
  const text = q.value.trim().toLowerCase();
  if (!text) return products.value;
  return products.value.filter((p) => {
    const name = (p.name || '').toLowerCase();
    const category = (p.category_name || '').toLowerCase();
    return name.includes(text) || category.includes(text);
  });
});

const selectedProducts = computed(() => {
  const ids = new Set(selectedIds.map((i) => String(i)));
  return products.value.filter((p) => ids.has(String(p.id))).slice(0, 2);
});

const selectedCount = computed(() => selectedProducts.value.length);

const toggleSelect = (product) => {
  const id = String(product.id);
  const idx = selectedIds.findIndex((value) => String(value) === id);
  if (idx >= 0) {
    selectedIds.splice(idx, 1);
    setCompareIdsInUrl(selectedIds);
    return;
  }
  if (selectedIds.length >= 2) {
    window.alert('Chỉ được chọn tối đa 2 sản phẩm để so sánh.');
    return;
  }
  selectedIds.push(id);
  setCompareIdsInUrl(selectedIds);
};

const clearSelection = () => {
  selectedIds.splice(0, selectedIds.length);
  setCompareIdsInUrl([]);
};

const getShortText = (text) => {
  if (!text) return 'N/A';
  return text.length > 80 ? text.slice(0, 80).trim() + '...' : text;
};

const findAttribute = (product, key) => {
  if (!product?.attributes?.length) return '';
  const attr = product.attributes.find((a) => a.name?.toLowerCase() === key.toLowerCase());
  return attr?.value || '';
};

const attributeRows = [
  { name: 'Màu sắc', key: 'color' },
  { name: 'Kích thước', key: 'size' },
  { name: 'Chất liệu', key: 'material' }
];

const getAttributeValue = (product, key) => {
  const attr = findAttribute(product, key);
  return attr || 'N/A';
};

const selectedIdsSet = computed(() => new Set(selectedIds.map((id) => String(id))));

watch(
  () => [route.query.id1, route.query.id2],
  () => {
    syncSelectedIdsFromRoute();
  }
);

onMounted(async () => {
  if (!products.value.length) {
    await productsStore.fetchProducts({ page: 1, limit: 100 });
  }
  syncSelectedIdsFromRoute();
});
</script>

<style scoped>
</style>