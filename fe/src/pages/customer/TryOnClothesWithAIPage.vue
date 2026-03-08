<template>
  <section v-if="product">
    <!-- Try-On Section -->
    <div class="mt-2">
      <h3 class="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
        Phòng thử đồ ảo
        <button @click="showTryOnGuide = true"
          class="text-sm text-blue-600 hover:text-blue-800 hover:underline flex items-center gap-1 transition-colors cursor-pointer ml-3 inline-flex">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Yêu cầu về ảnh
        </button>
      </h3>

      <!-- Giai đoạn 1: Chọn ảnh người dùng + Chọn màu sản phẩm -->
      <transition name="fade" mode="out-in">
        <div v-if="!isTryingOn" key="select" class="grid gap-8 md:grid-cols-2">
          <!-- Cột 1: Upload ảnh người dùng -->
          <div class="h-full flex flex-col">
            <div
              class="rounded-lg border-2 border-dashed border-gray-300 p-8 text-center dark:border-gray-600 bg-gray-50 dark:bg-gray-800 flex-1 flex flex-col items-center justify-center relative overflow-hidden group">
              <div v-if="!tryOnImage">
                <svg class="mx-auto mb-4 h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                </svg>
                <p class="mb-4 text-gray-600 dark:text-gray-400">
                  Kéo thả hoặc chọn ảnh của bạn
                </p>
                <button @click="$refs.fileInput.click()"
                  class="inline-block rounded-lg bg-gray-900 px-6 py-2 text-white hover:bg-gray-800 dark:bg-white dark:text-black transition">
                  Chọn ảnh
                </button>
              </div>
              <div v-else class="relative w-full h-full flex items-center justify-center">
                <img :src="tryOnImage" class="max-h-[400px] max-w-full rounded shadow-md object-contain"
                  alt="Ảnh của bạn" />
                <button @click="clearTryOnImage"
                  class="absolute top-2 right-2 bg-white/90 text-red-600 p-2 rounded-full hover:bg-white shadow-sm transition">
                  ✕
                </button>
              </div>
              <input ref="fileInput" type="file" accept="image/*" @change="handleTryOnImageUpload" class="hidden" />
            </div>
          </div>

          <!-- Cột 2: Chọn màu sản phẩm -->
          <div class="flex flex-col h-full">
            <div v-if="colors.length === 0"
              class="p-6 text-center text-gray-500 border rounded-lg bg-gray-50 dark:bg-gray-800">
              Sản phẩm này chưa có biến thể màu sắc để thử.
            </div>
            <div v-else class="flex-1 flex flex-col">
              <h4 class="mb-3 font-semibold text-gray-800 dark:text-white">
                Chọn mẫu thử:
                <span v-if="tryOnSelectedColor"
                  class="ml-2 text-xs font-normal text-blue-600 bg-blue-50 px-2 py-1 rounded-full border border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800">
                  {{ tryOnSelectedColor.name }}
                </span>
              </h4>
              <div class="grid grid-cols-3 gap-3 max-h-[400px] overflow-y-auto p-1 custom-scrollbar">
                <div v-for="color in colors" :key="color.hex" @click="tryOnSelectColor(color)"
                  class="cursor-pointer rounded-lg border-2 overflow-hidden transition-all duration-200 relative group bg-white dark:bg-gray-800"
                  :class="tryOnSelectedColor?.hex === color.hex
                      ? 'border-gray-900 dark:border-gray-100 shadow-md ring-2 ring-gray-300 dark:ring-gray-700 scale-[1.02]'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-400'
                    ">
                  <div class="aspect-[3/4] w-full bg-gray-100 dark:bg-gray-900 relative">
                    <img v-if="getColorImage(color.hex)" :src="getColorImage(color.hex)"
                      class="w-full h-full object-cover" :alt="color.name" />
                    <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                      <svg class="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span class="text-[10px]">Chưa có ảnh</span>
                    </div>
                    <div v-if="tryOnSelectedColor?.hex === color.hex"
                      class="absolute top-2 right-2 bg-gray-900 text-white rounded-full p-0.5 shadow-sm dark:bg-white dark:text-black">
                      <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  </div>
                  <div class="p-2 text-center border-t dark:border-gray-600">
                    <div class="flex items-center justify-center gap-1.5">
                      <div class="w-3 h-3 rounded-full border border-gray-300 shadow-sm"
                        :style="{ backgroundColor: color.hex }"></div>
                      <span class="text-xs font-medium truncate max-w-[80px]">{{ color.name }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Nút bắt đầu thử đồ -->
            <div class="mt-6">
              <button @click="startTryOn" :disabled="!tryOnImage || !tryOnSelectedColor"
                class="w-full rounded-lg bg-gray-900 py-3.5 font-bold text-white shadow-lg hover:bg-gray-800 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none transition-all transform active:scale-[0.98] flex items-center justify-center gap-2 dark:bg-white dark:text-black dark:hover:bg-gray-200">
                <span>🤖</span>
                <span>BẮT ĐẦU THỬ ĐỒ NGAY</span>
              </button>
              <p v-if="!tryOnImage" class="text-xs text-center mt-2 text-red-500 animate-pulse">
                * Vui lòng tải ảnh của bạn lên trước
              </p>
              <p v-if="tryOnImage && !tryOnSelectedColor" class="text-xs text-center mt-2 text-red-500 animate-pulse">
                * Vui lòng chọn một màu sản phẩm
              </p>
            </div>
          </div>
        </div>

        <!-- Giai đoạn 2: Đang hiển thị kết quả thử đồ -->
        <div v-else key="result" class="relative">
          <!-- Nút quay lại -->
          <button @click="backToSelection"
            class="mb-6 inline-flex items-center gap-2 text-gray-700 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại chọn màu khác
          </button>

          <!-- Khu vực hiển thị kết quả thử đồ -->
          <div class="grid gap-8 md:grid-cols-2 items-center">
            <!-- Ảnh người dùng gốc -->
            <div class="text-center">
              <p class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3">
                Ảnh của bạn
              </p>
              <div
                class="rounded-lg border border-gray-300 dark:border-gray-700 p-4 bg-gray-50 dark:bg-gray-800 inline-block">
                <img :src="tryOnImage" class="max-h-[500px] max-w-full rounded object-contain shadow-lg"
                  alt="Ảnh gốc" />
              </div>
            </div>

            <!-- Kết quả thử đồ (giả lập - bạn sẽ thay bằng ảnh từ AI sau) -->
            <!-- Kết quả thử đồ -->
            <div class="text-center">
              <p
                class="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-3 flex items-center justify-center gap-2">
                Kết quả thử đồ
                <span
                  class="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full dark:bg-green-900/30 dark:text-green-300">
                  Màu: {{ tryOnSelectedColor.name }}
                </span>
              </p>

              <div
                class="rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 min-h-[500px] flex items-center justify-center overflow-hidden shadow-lg">
                <!-- Đang xử lý -->
                <div v-if="isProcessing" class="text-center py-12">
                  <div
                    class="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-900 mb-4">
                  </div>
                  <p class="text-lg font-medium text-gray-700 dark:text-gray-300">
                    Đang xử lý thử đồ ảo...
                  </p>
                  <p class="text-sm text-gray-500 mt-2">
                    Đang xử lý thử đồ ảo... ({{ pollAttempts }} /
                    {{ pollMaxAttempts }}) <br />Có thể mất 30–120 giây tùy
                    ảnh
                  </p>
                </div>

                <!-- Đã có kết quả -->
                <img v-else-if="tryOnResultImage" :src="tryOnResultImage"
                  class="max-h-[500px] max-w-full rounded object-contain" alt="Kết quả thử đồ ảo" />

                <!-- Lỗi hoặc chưa có -->
                <div v-else class="text-center text-gray-500 dark:text-gray-400">
                  <svg class="mx-auto mb-4 h-20 w-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p class="text-lg font-medium">Không thể tạo kết quả</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>
    </div>
  </section>
  <div v-else class="container mx-auto px-4 py-8 animate-pulse">
    <div class="h-64 bg-gray-200 rounded"></div>
  </div>

  <!-- MODAL HƯỚNG DẪN THỬ ĐỒ AI -->
  <div v-if="showTryOnGuide"
    class="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm"
    @click.self="showTryOnGuide = false">
    <div
      class="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
      <!-- Header -->
      <div class="flex justify-between items-center p-5 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
        <h3 class="text-lg font-bold text-gray-900 dark:text-white">
          Hướng dẫn chụp ảnh để thử đồ AI
        </h3>
        <button @click="showTryOnGuide = false"
          class="text-gray-500 hover:text-gray-800 dark:hover:text-white transition-colors">
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Nội dung chính -->
      <div class="p-6 overflow-y-auto custom-scrollbar text-sm space-y-6 text-gray-700 dark:text-gray-300">
        <p class="font-medium text-base">
          Để AI xử lý chính xác và cho kết quả thử đồ đẹp nhất, vui lòng tuân
          thủ các yêu cầu sau:
        </p>

        <ul class="list-disc pl-5 space-y-3">
          <li><strong>Định dạng ảnh:</strong> JPG, JPEG, PNG</li>
          <li>
            <strong>Dung lượng ảnh:</strong> Không quá
            <span class="font-semibold text-blue-600 dark:text-blue-400">3 MB</span>
          </li>
          <li>
            <strong>Độ phân giải ảnh:</strong> Nhỏ hơn
            <span class="font-semibold text-blue-600 dark:text-blue-400">4096 × 4096 px</span>
          </li>
          <li>
            <strong>Yêu cầu về tư thế (ảnh người mặc):</strong>
            <ul class="list-circle pl-5 mt-1 space-y-1 text-gray-600 dark:text-gray-400">
              <li>Ảnh chụp <strong>toàn thân chính diện</strong></li>
              <li>
                Hai tay phải được nhìn thấy rõ (không che khuất, không bắt chéo)
              </li>
              <li>
                Tránh các tư thế dang tay rộng, bắt chéo tay hoặc động tác quá
                phô trương
              </li>
            </ul>
          </li>
          <li>
            <strong>Loại trang phục phù hợp:</strong> Hoa văn và họa tiết
            <strong>đơn giản</strong>. Ví dụ: quần jean, áo polo, đồ tập yoga,
            váy, vest, áo thun, v.v.
          </li>
          <li>
            <strong>Ảnh quần áo (flat-lay):</strong>
            <ul class="list-circle pl-5 mt-1 space-y-1 text-gray-600 dark:text-gray-400">
              <li>
                Ảnh <strong>trải phẳng</strong> (flat-lay), rõ nét và ngay ngắn
              </li>
              <li><strong>Phông nền</strong> đơn giản, sạch sẽ, đủ ánh sáng</li>
              <li>Chỉ hiển thị <strong>một món đồ duy nhất</strong></li>
              <li>Không xếp chồng hoặc phối cùng các trang phục khác</li>
              <li>
                Trang phục phải <strong>chiếm phần lớn khung hình</strong>
              </li>
            </ul>
          </li>
        </ul>

        <!-- PHẦN ẢNH VÍ DỤ MỚI -->

        <!-- PHẦN ẢNH MINH HỌA ĐÚNG / SAI -->
        <div class="mt-6">
          <h4 class="font-semibold text-base mb-4 text-gray-800 dark:text-gray-200">
            Ảnh minh họa đúng / sai
          </h4>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- Ảnh ĐÚNG -->
            <div class="space-y-3">
              <div
                class="relative rounded-lg overflow-hidden border border-green-200 dark:border-green-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[300px]">
                <img src="https://ai-resource.ailabtools.com/try-on-clothes/doc/example/CorrectExample-1.webp"
                  alt="Ảnh đúng: rõ nét, nền trắng, chỉ 1 món đồ"
                  class="w-full max-h-[70vh] h-auto object-contain p-4 mx-auto" loading="lazy" />
                <div class="absolute top-3 left-3 bg-green-600 text-white text-xs font-bold px-3 py-1 rounded shadow">
                  ĐÚNG
                </div>
              </div>
              <p class="text-sm text-center text-green-700 dark:text-green-400">
                Ảnh rõ nét, nền trắng, chỉ 1 món đồ
              </p>
            </div>

            <!-- Ảnh SAI -->
            <div class="space-y-3">
              <div
                class="relative rounded-lg overflow-hidden border border-red-200 dark:border-red-800 shadow-sm bg-gray-50 dark:bg-gray-900 flex items-center justify-center min-h-[300px]">
                <img src="https://ai-resource.ailabtools.com/try-on-clothes/doc/example/SideView-1.webp"
                  alt="Ảnh sai: người bị che, nền phức tạp, không rõ nét"
                  class="w-full max-h-[70vh] h-auto object-contain p-4 mx-auto" loading="lazy" />
                <div class="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-3 py-1 rounded shadow">
                  SAI
                </div>
              </div>
              <p class="text-sm text-center text-red-700 dark:text-red-400">
                Ảnh người bị che, nền phức tạp, không rõ nét
              </p>
            </div>
          </div>

          <p class="text-xs text-gray-500 dark:text-gray-400 mt-6 italic text-center">
            Ảnh ví dụ chỉ mang tính minh họa. Hãy chụp ảnh thật theo đúng hướng
            dẫn để có kết quả tốt nhất.
          </p>
        </div>

        <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-100 dark:border-blue-800">
          <p class="text-sm font-medium text-blue-800 dark:text-blue-300">
            Lưu ý: Ảnh không đáp ứng yêu cầu có thể dẫn đến kết quả thử đồ không
            chính xác hoặc thất bại.
          </p>
        </div>
      </div>

      <!-- Footer -->
      <div class="p-5 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-right">
        <button @click="showTryOnGuide = false"
          class="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Đã hiểu
        </button>
      </div>
    </div>
  </div>
  <!-- END CHANGE -->
</template>

<script setup>
import { onMounted, ref } from "vue";
import { useRoute } from "vue-router";
import { useProductsStore } from "../../stores/products";
import { postAIRequest, getAIResponse } from "../../utils/AI_service";

const route = useRoute();
const productStore = useProductsStore();

// State Product Detail
const product = ref(null);
const colors = ref([]);
const productImages = ref([]);
const imageColorMap = ref({});

// State Try On
const tryOnImage = ref("");
const tryOnSelectedColor = ref(null);
const fileInput = ref(null);
const isTryingOn = ref(false);
const tryOnResultImage = ref("");
const isProcessing = ref(false);
const pollAttempts = ref(0);
const pollMaxAttempts = ref(40);
const showTryOnGuide = ref(false);

/**
 * Chuyển bất kỳ URL ảnh về Blob định dạng PNG
 */
async function convertImageToPNG(imageUrl) {
  const img = new Image();
  img.crossOrigin = "anonymous";

  return new Promise((resolve, reject) => {
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);

      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error("Chuyển đổi thất bại"));
          }
        },
        "image/png",
        0.95,
      );
    };

    img.onerror = () => reject(new Error("Không load được ảnh"));
    img.src = imageUrl;
  });
}

async function startTryOn() {
  if (!tryOnImage.value || !tryOnSelectedColor.value) return;

  isTryingOn.value = true;
  isProcessing.value = true;
  tryOnResultImage.value = "";
  pollAttempts.value = 0;

  try {
    const personBlob = dataURLtoBlob(tryOnImage.value);
    const personFile = new File([personBlob], "person.jpg", {
      type: "image/jpeg",
    });

    const clothesUrl =
      getColorImage(tryOnSelectedColor.value.hex) || productImages.value[0];

    let clothesBlob;
    try {
      clothesBlob = await convertImageToPNG(clothesUrl);
    } catch (err) {
      console.error("Lỗi chuyển đổi ảnh sản phẩm:", err);
      alert("Ảnh sản phẩm không tương thích, không thể thử đồ ảo");
      isProcessing.value = false;
      return;
    }

    const clothesFile = new File([clothesBlob], "clothes.png", {
      type: "image/png",
    });

    const payload = {
      task_type: "async",
      person_image: personFile,
      clothes_image: clothesFile,
      clothes_type: "upper_body",
    };

    const postResponse = await postAIRequest(payload);
    const taskId = postResponse.data.task_id;

    if (!taskId) throw new Error("Không nhận được task_id");

    console.log("✅ Task đã tạo:", taskId);

    while (pollAttempts.value < pollMaxAttempts.value) {
      pollAttempts.value++;
      console.log(`🔄 Poll lần ${pollAttempts.value}...`);

      await new Promise((resolve) => setTimeout(resolve, 5000));

      const pollResponse = await getAIResponse(taskId);
      const resultData = pollResponse.data;

      console.log("📥 Poll response:", resultData);

      if (resultData.task_status === 2 && resultData.data?.image) {
        tryOnResultImage.value = resultData.data.image;
        isProcessing.value = false;
        console.log("🎉 THÀNH CÔNG! Ảnh thử đồ:", tryOnResultImage.value);
        return;
      }

      if (resultData.error_code !== 0 || resultData.error_msg) {
        throw new Error(
          resultData.error_msg || "AI xử lý thất bại (mã lỗi từ server)",
        );
      }

      if (resultData.task_status === 0) {
        console.log("⏳ Đang xử lý... tiếp tục chờ");
        continue;
      }

      console.log(
        "⏳ Trạng thái task:",
        resultData.task_status,
        "- Chưa xong, chờ thêm...",
      );
    }

    throw new Error("⏰ Timeout: Đã chờ quá lâu mà AI chưa xử lý xong");
  } catch (error) {
    console.error("❌ Lỗi thử đồ ảo:", error);
    alert(`Không thể thử đồ: ${error.message || "Lỗi không xác định"}`);
    isProcessing.value = false;
    tryOnResultImage.value = "";
  }
}

function dataURLtoBlob(dataURL) {
  const arr = dataURL.split(",");
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) u8arr[n] = bstr.charCodeAt(n);
  return new Blob([u8arr], { type: mime });
}

function backToSelection() {
  isTryingOn.value = false;
}

function getColorImage(hex) {
  const idx = imageColorMap.value[hex.toLowerCase()];
  if (idx !== undefined) return productImages.value[idx];
  return productImages.value[0];
}

function tryOnSelectColor(color) {
  tryOnSelectedColor.value = color;
}

function handleTryOnImageUpload(e) {
  const file = e.target.files?.[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => (tryOnImage.value = e.target.result);
  reader.readAsDataURL(file);
}

function clearTryOnImage() {
  tryOnImage.value = "";
  if (fileInput.value) fileInput.value.value = "";
}

onMounted(async () => {
  const id = route.params.id;
  await productStore.fetchProductById(id);
  const data = productStore.currentProduct;

  if (data) {
    product.value = {
      id: data.id,
      name: data.name,
    };

    if (data.attributes) {
      data.attributes.forEach((attr) => {
        const name = attr.attribute_name.toLowerCase();
        if (name === "màu") {
          const match = attr.attribute_value.match(/^(.*)\s\((#.*)\)$/);
          if (match) colors.value.push({ name: match[1], hex: match[2] });
          else
            colors.value.push({ name: attr.attribute_value, hex: "#000000" });
        }
      });
    }

    if (colors.value.length > 0) {
      tryOnSelectedColor.value = colors.value[0];
    }

    if (data.images && data.images.length > 0) {
      const sortedImages = [...data.images].sort(
        (a, b) => a.sort_order - b.sort_order,
      );
      productImages.value = sortedImages.map((img) => img.image_url);

      imageColorMap.value = {};

      sortedImages.forEach((img, index) => {
        if (img.color) {
          const normalizedColor = img.color.toLowerCase();
          if (imageColorMap.value[normalizedColor] === undefined) {
            imageColorMap.value[normalizedColor] = index;
          }
        }
      });
    } else {
      productImages.value = ["https://placehold.co/600x600?text=No+Image"];
    }
  }
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
