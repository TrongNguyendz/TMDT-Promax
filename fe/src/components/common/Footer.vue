<template>
  <footer class="bg-gray-900 text-white py-12 mt-12">
    <div class="mx-auto max-w-7xl px-4">
      <!-- Footer Grid -->
      <div class="grid gap-8 sm:grid-cols-2 md:grid-cols-5 mb-8">
        <!-- Về chúng tôi -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">Về chúng tôi</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>
              <button
                @click="uiStore.openAboutModal()"
                class="hover:text-white text-left"
              >
                Thông tin
              </button>
            </li>
          </ul>
        </div>
        <!-- Tài khoản -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">Tài khoản</h3>
          <ul class="space-y-2 text-sm text-gray-300">
            <li>
              <button
                @click="uiStore.openMembershipModal()"
                class="hover:text-white text-left"
              >
                Tư cách thành viên
              </button>
            </li>
            <li>
              <RouterLink :to="profileLink" class="hover:text-white"
                >Hồ sơ</RouterLink
              >
            </li>
          </ul>
        </div>

        <!-- Bản tin điện tử -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">Bản tin điện tử</h3>
          <p class="mb-4 text-sm text-gray-300">
            Đăng ký ngay và là người đầu tiên năm được thông tin khi có mặt hàng
            mới, khuyến mại, các sự kiện sắp diễn ra tại cửa hàng và nhiều thông
            tin hữu ích khác.
          </p>
          <RouterLink
            to="/auth"
            class="inline-block bg-white text-gray-900 px-4 py-2 rounded font-semibold hover:bg-gray-100 transition-colors"
            >ĐĂNG KÝ NGAY</RouterLink
          >
        </div>

        <!-- Tài khoản xã hội -->
        <div>
          <h3 class="mb-4 text-lg font-semibold">Tài khoản xã hội</h3>
          <div class="flex gap-4">
            <a
              href="https://www.facebook.com/uniqlovnam"
              target="_blank"
              rel="noopener"
              class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12 transition-colors"
              title="Facebook"
            >
              <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path
                  d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"
                />
              </svg>
            </a>
            <a
              href="https://www.instagram.com/uniqlovnam/"
              target="_blank"
              rel="noopener"
              class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12 transition-colors"
              title="Instagram"
            >
              <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path
                  d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.117.6c-.88.266-1.5.578-2.122 1.201-.623.623-.935 1.242-1.2 2.122-.266.788-.467 1.658-.527 2.936C.008 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.528 2.936.266.879.578 1.5 1.201 2.122.623.623 1.242.935 2.122 1.2.788.267 1.658.468 2.936.528 1.28.058 1.687.072 4.947.072s3.667-.015 4.947-.072c1.277-.06 2.148-.261 2.936-.528.879-.266 1.5-.578 2.122-1.201.623-.623.935-1.242 1.2-2.122.267-.788.468-1.658.528-2.936.058-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.261-2.148-.528-2.936-.266-.879-.578-1.5-1.201-2.122-.623-.623-1.242-.935-2.122-1.2-.788-.267-1.658-.468-2.936-.528C15.667.008 15.26 0 12 0zm0 2.16c3.203 0 3.585.009 4.849.07 1.171.054 1.805.244 2.227.408.561.217.96.477 1.382.896.419.42.679.821.896 1.381.164.422.354 1.057.408 2.227.061 1.264.07 1.646.07 4.849s-.009 3.585-.07 4.849c-.054 1.171-.244 1.805-.408 2.227-.217.561-.477.96-.896 1.382-.42.419-.821.679-1.381.896-.422.164-1.057.354-2.227.408-1.264.061-1.646.07-4.849.07s-3.585-.009-4.849-.07c-1.171-.054-1.805-.244-2.227-.408-.561-.217-.96-.477-1.382-.896-.419-.42-.679-.821-.896-1.381-.164-.422-.354-1.057-.408-2.227-.061-1.264-.07-1.646-.07-4.849s.009-3.585.07-4.849c.054-1.171.244-1.805.408-2.227.217-.561.477-.96.896-1.382.42-.419.821-.679 1.381-.896.422-.164 1.057-.354 2.227-.408 1.264-.061 1.646-.07 4.849-.07zM5.838 12a6.162 6.162 0 1 1 12.324 0 6.162 6.162 0 0 1-12.324 0zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm4.965-10.322a1.44 1.44 0 1 1 2.881.001 1.44 1.44 0 0 1-2.881-.001z"
                />
              </svg>
            </a>
            <a
              href="https://www.youtube.com/@uniqlovietnam2317"
              target="_blank"
              rel="noopener"
              class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12 transition-colors"
              title="YouTube"
            >
              <svg class="w-6 h-6 fill-white" viewBox="0 0 24 24">
                <path
                  d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"
                />
              </svg>
            </a>
          </div>
        </div>
        <div>
          <!-- Địa chỉ -->
          <div>
            <h3 class="mb-4 text-lg font-semibold">Địa chỉ</h3>

            <p class="mb-4 text-sm text-gray-300">
              Số nhà 127 ,tổ 9 ,Nhân Trạch ,Phú Lương ,Hà Đông.
            </p>
            <div
              class="w-full h-36 sm:h-48 rounded overflow-hidden border border-gray-700"
            >
              <iframe
                src="https://www.google.com/maps?q=Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Ki%E1%BA%BFn+tr%C3%BAc+H%C3%A0+N%E1%BB%99i&hl=vi&z=19&output=embed"
                class="w-full h-full"
                style="border: 0"
                allowfullscreen
                loading="lazy"
                referrerpolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
            <!-- <a href="https://www.google.com/maps/place/Tr%C6%B0%E1%BB%9Dng+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+Ki%E1%BA%BFn+tr%C3%BAc+H%C3%A0+N%E1%BB%99i/@20.9803909,105.7889281,19z/data=!4m10!1m2!2m1!1sHanoi+University+of+Architecture!3m6!1s0x3135ade83ba9e115:0x6f4fdb5e1e9e39ed!8m2!3d20.9805574!4d105.7891549!15sCiBIYW5vaSBVbml2ZXJzaXR5IG9mIEFyY2hpdGVjdHVyZZIBEXB1YmxpY191bml2ZXJzaXR54AEA!16s%2Fm%2F0cr482r?hl=vi&entry=ttu&g_ep=EgoyMDI1MTIwOS4wIKXMDSoASAFQAw%3D%3D" target="_blank" rel="noopener" class="inline-block mt-2 text-sm text-gray-300 hover:text-white">Xem bản đồ lớn</a> -->
          </div>
        </div>
      </div>
      <!-- Divider -->
      <div class="border-t border-gray-700 pt-6">
        <p class="text-center text-sm text-gray-400">
          © {{ new Date().getFullYear() }} {{ appName }}. All rights reserved.
        </p>
      </div>
    </div>
  </footer>
</template>

<script setup>
import { computed } from "vue";
import { useUIStore } from "../../stores/ui";
import { useUserStore } from "../../stores/user";
import { APP_NAME } from "../../utils/constants";

const appName = APP_NAME;
const uiStore = useUIStore();
const userStore = useUserStore();

const profileLink = computed(() =>
  userStore.isAuthenticated ? "/profile" : "/auth",
);
</script>
