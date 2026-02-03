<template>
  <div
    class="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 backdrop-blur-sm"
    @click.self="$emit('close')"
  >
    <div class="relative w-full max-w-2xl rounded-lg bg-white p-6 shadow-2xl dark:bg-gray-800">
      <button
        @click="$emit('close')"
        class="absolute top-4 right-4 rounded-full p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        aria-label="Đóng"
      >
        <svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
        </svg>
      </button>

      <header class="mb-4">
        <h2 class="text-2xl font-bold text-gray-900 dark:text-white">Về Chúng Tôi</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">Tổng quan về {{ appName }} và cam kết phục vụ khách hàng.</p>
      </header>

      <section class="text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2 space-y-4">
        <p class="font-semibold">- Giới thiệu</p>
        <p>
          {{ appName }} là nền tảng thương mại điện tử uy tín, cung cấp đa dạng các mặt hàng chất lượng cao, phục vụ nhu cầu mua sắm trực tuyến của khách hàng trên khắp cả nước. Chúng tôi kết hợp công nghệ, dịch vụ khách hàng và quy trình vận hành chuyên nghiệp để mang lại trải nghiệm liền mạch.
        </p>

        <p class="font-semibold">- Sứ mệnh</p>
        <p>
          Sứ mệnh của chúng tôi là tạo ra trải nghiệm mua sắm an toàn, tiện lợi và minh bạch, giúp khách hàng tiếp cận sản phẩm chất lượng với dịch vụ hậu mãi tận tâm.
        </p>

        <p class="font-semibold">- Giá trị cốt lõi</p>
        <p>
          - Chất lượng: Cam kết cung cấp sản phẩm đạt tiêu chuẩn. <br />
          - Trung thực: Minh bạch trong thông tin và giao dịch. <br />
          - Khách hàng là trọng tâm: Luôn lắng nghe và cải thiện dịch vụ. 
        </p>

        <p class="font-semibold">- Dịch vụ & Hỗ trợ</p>
        <p>
          Chúng tôi hỗ trợ khách hàng qua nhiều kênh: email, hotline và hệ thống hỗ trợ trực tuyến. Mọi thắc mắc về đơn hàng, đổi trả, bảo hành xin vui lòng liên hệ để được hướng dẫn chi tiết.
        </p>

        <p class="text-xs text-gray-500 dark:text-gray-400">Cảm ơn Quý khách đã tin tưởng sử dụng dịch vụ của {{ appName }}.</p>
      </section>

      
    </div>
  </div>
</template>

<script setup>
import { APP_NAME } from '../../utils/constants';

defineEmits(['close']);
const appName = APP_NAME;
</script>
