<template>
  <!-- Wrapper chính -->
  <div class="relative w-screen left-1/2 -ml-[50vw] flex flex-col min-h-[calc(100vh-64px)] font-sans -mt-8 -mb-20 overflow-hidden">
    
    <!-- 1. LỚP ẢNH NỀN -->
    <div class="absolute inset-0 z-0">
      <div 
        class="w-full h-full bg-cover bg-top bg-no-repeat"
        :style="{ backgroundImage: `url(${bgImage})` }"
      ></div>
    </div>

    <!-- 2. NỘI DUNG CHÍNH -->
    <div class="relative z-10 flex-1 flex items-center justify-center p-6 py-12">
      
      <div class="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        
        <!-- Form AUTH: Nhỏ hơn + dịch sang phải (bắt đầu từ cột 3, chiếm 4/12) -->
        <div class="col-span-1 lg:col-span-4 lg:col-start-2">
          <div class="bg-white/10 dark:bg-black/20 backdrop-blur-2xl rounded-3xl shadow-2xl p-8 border border-white/30 dark:border-white/10 max-w-md mx-auto">
            
            <!-- Header Form - Nhỏ gọn hơn -->
            <div class="text-center mb-8">
              <img 
                src="/src/assets/logoweb.png" 
                alt="Logo" 
                class="h-20 w-20 mx-auto mb-5 rounded-full object-cover shadow-xl border-4 border-white/40" 
              />
              
              <h2 class="text-2xl font-bold text-white mb-1 drop-shadow-md">
                {{ isLogin ? 'Chào mừng trở lại' : 'Tham gia cùng chúng tôi' }}
              </h2>
              <p class="text-white/70 text-xs drop-shadow">
                Khám phá thế giới thời trang đẳng cấp
              </p>
            </div>

            <!-- Form Login - Input mỏng hơn -->
            <form v-if="isLogin" @submit.prevent="handleLogin" class="space-y-5">
              <input 
                v-model="loginForm.username" 
                type="text" 
                placeholder="Email hoặc tên đăng nhập" 
                class="w-full px-5 py-3.5 bg-white/20 dark:bg-black/40 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 focus:border-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" 
                required 
              />
              <input 
                v-model="loginForm.password" 
                type="password" 
                placeholder="Mật khẩu" 
				
                class="w-full px-5 py-3.5 bg-white/20 dark:bg-black/40 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 focus:border-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" 
                required 
              />

              <div class="flex justify-between items-center text-xs">
                <!-- <label class="flex items-center gap-2 cursor-pointer text-white/80 hover:text-white transition">
                  <input type="checkbox" class="rounded border-white/60 text-white focus:ring-white/60" />
                  <span>Ghi nhớ tôi</span>
                </label> -->
                <button type="button" @click="showForgot = true" class="text-white/80 hover:text-white hover:underline transition">
                  Quên mật khẩu?
                </button>
              </div>

              <button type="submit" class="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition shadow-lg text-sm tracking-wide">
                ĐĂNG NHẬP
              </button>
            </form>

            <!-- Form Register -->
            <form v-else @submit.prevent="handleRegister" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <input v-model="registerForm.fullName" type="text" placeholder="Họ tên" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
                <input v-model="registerForm.username" type="text" placeholder="Username" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
              </div>
              <input v-model="registerForm.email" type="email" placeholder="Email" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
              <input v-model="registerForm.phone" type="tel" placeholder="Số điện thoại" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
              <div class="grid grid-cols-2 gap-3">
                <input v-model="registerForm.password" type="password" placeholder="Mật khẩu" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
                <input v-model="registerForm.confirm" type="password" placeholder="Nhập lại mật khẩu" class="w-full px-5 py-3 bg-white/20 border border-white/40 rounded-2xl text-white placeholder-white/70 focus:ring-4 focus:ring-white/60 outline-none transition text-sm backdrop-blur-md shadow-inner" required />
              </div>

              <button type="submit" class="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition shadow-lg text-sm tracking-wide">
                TẠO TÀI KHOẢN
              </button>
            </form>

            <div class="text-center mt-6 text-white/70 text-xs">
              {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
              <button @click="toggleMode" class="font-bold text-white hover:underline ml-1 transition">
                {{ isLogin ? 'Đăng ký ngay' : 'Đăng nhập' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Bên phải rộng rãi -->
        <div class="hidden lg:block lg:col-span-5"></div>
      </div>
    </div>

    <!-- Modal Quên mật khẩu (giữ nguyên loading) -->
    <div v-if="showForgot" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-md p-4">
      <div class="bg-white/20 backdrop-blur-2xl rounded-3xl p-8 w-full max-w-md shadow-2xl border border-white/30">
        <h3 class="text-2xl font-bold text-white mb-3 drop-shadow">Quên mật khẩu</h3>
        <p class="text-sm text-white/80 mb-6">Nhập email để nhận liên kết đặt lại mật khẩu.</p>
        
        <input 
          v-model="forgotEmail" 
          type="email" 
          placeholder="Email của bạn..." 
          class="w-full px-6 py-4 bg-white/30 border border-white/50 rounded-2xl mb-6 focus:outline-none focus:ring-4 focus:ring-white/70 text-white placeholder-white/70"
          :disabled="isLoading"
          required
        />
        
        <div class="flex justify-end gap-3">
          <button 
            @click="showForgot = false" 
            class="px-6 py-3 text-sm font-medium text-white/80 hover:bg-white/20 rounded-2xl transition"
            :disabled="isLoading"
          >
            Hủy
          </button>
          
          <button 
            @click="handleForgotPassword" 
            class="relative px-6 py-3 text-sm font-medium bg-white text-black rounded-2xl hover:bg-gray-100 transition flex items-center gap-2"
            :disabled="isLoading"
          >
            <svg v-if="isLoading" class="animate-spin h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            
            <span :class="{ 'opacity-0': isLoading }">Gửi</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useUIStore } from '../../stores/ui';
import { Login, Register, ForgotPassword } from '../../utils/user_service_api';
import bgImage from '../../assets/auth.jpg';
import axios from 'axios';

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const ui = useUIStore();

const isLogin = ref(true);
const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({
	fullName: '',
	username: '',
	email: '',
	phone: '',
	password: '',
	confirm: '',
	avatar_url: 'heheheh',
	role: 'customer',
	status: 'active'
});

const showForgot = ref(false);
const forgotEmail = ref('');
const isLoading = ref(false); // <-- Thêm biến loading
function toggleMode() {
	isLogin.value = !isLogin.value;
}

const handleLogin = async () => {
  // 1. Trim các trường nhập liệu
  loginForm.username = loginForm.username.trim();
  loginForm.password = loginForm.password.trim();   // ← Bổ sung trim password

  // 2. Kiểm tra bắt buộc (early return)
  if (!loginForm.username || !loginForm.password) {
    ui.pushToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
    return;
  }

  // Bổ sung: Không cho phép khoảng trắng trong mật khẩu
  if (loginForm.password.includes(' ')) {
    ui.pushToast({
      type: 'error',
      message: 'Mật khẩu không được chứa khoảng trắng (space)',
    });
    return;
  }

  // Bổ sung: Username không nên chứa khoảng trắng (phổ biến khi login bằng username)
  if (loginForm.username.includes(' ')) {
    ui.pushToast({
      type: 'error',
      message: 'Tên đăng nhập không được chứa khoảng trắng',
    });
    return;
  }

  try {
    const res = await Login({
      username: loginForm.username,
      email: loginForm.username,     // giữ nguyên logic cũ (hỗ trợ login bằng username hoặc email)
      password: loginForm.password,  // đã trim
    });

    const result = res.data;

    // Kiểm tra success rõ ràng hơn
    if (result.success && result.data?.token && result.data?.user) {
      user.login({
        token: result.data.token,
        profile: {
          id: result.data.user.id,
          username: result.data.user.username,
          email: result.data.user.email,
          fullname: result.data.user.full_name,   // chú ý key là fullname (không phải fullName)
          phone: result.data.user.phone,
          avatar_url: result.data.user.avatar_url,
          role: result.data.user.role,
        },
        role: result.data.user.role,
      });

      ui.pushToast({
        type: 'success',
        message: result.message || 'Đăng nhập thành công!',
      });

      // Reset form
      loginForm.username = '';
      loginForm.password = '';

      // Xử lý redirect
      const redirect = route.query.redirect || '/';

      if (result.data.user.role === 'admin') {
        router.replace('/admin/welcome');
      } else {
        router.replace(redirect);
      }
    } else {
      // Server trả success = false
      ui.pushToast({
        type: 'error',
        message: result.message || 'Đăng nhập thất bại',
      });
    }
  } catch (err) {
    console.error('Login error:', err);

    let errorMsg = 'Lỗi kết nối đến server, vui lòng thử lại sau';

    if (err.response?.data?.message) {
      errorMsg = err.response.data.message;
    } else if (err.response?.status === 401) {
      errorMsg = 'Tên đăng nhập hoặc mật khẩu không đúng';
    } else if (err.response?.status === 400) {
      errorMsg = 'Dữ liệu gửi lên không hợp lệ';
    } else if (err.response?.status === 429) {
      errorMsg = 'Quá nhiều lần thử, vui lòng thử lại sau vài phút';
    }

    ui.pushToast({ type: 'error', message: errorMsg });
  }
};

const handleRegister = async () => {
  // 1. Trim tất cả các trường (bao gồm password và confirm)
  registerForm.username  = registerForm.username.trim();
  registerForm.email     = registerForm.email.trim();
  registerForm.phone     = registerForm.phone.trim();
  registerForm.fullName  = registerForm.fullName.trim();
  registerForm.password  = registerForm.password.trim();
  registerForm.confirm   = registerForm.confirm.trim();

  // 2. Kiểm tra các điều kiện (early return để code dễ đọc)
  if (!registerForm.fullName ||
      !registerForm.username ||
      !registerForm.email ||
      !registerForm.phone ||
      !registerForm.password ||
      !registerForm.confirm) {
    ui.pushToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
    return;
  }

  if (registerForm.password !== registerForm.confirm) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
    return;
  }

  if (registerForm.password.length < 6) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu phải từ 6 ký tự trở lên' });
    return;
  }

  // Bổ sung: Không cho phép khoảng trắng (space) trong mật khẩu
  if (registerForm.password.includes(' ')) {
    ui.pushToast({
      type: 'error',
      message: 'Mật khẩu không được chứa khoảng trắng (space)',
    });
    return;
  }

  // Optional: Nếu muốn cấm mọi loại whitespace (tab, xuống dòng, v.v.)
  // if (/\s/.test(registerForm.password)) {
  //   ui.pushToast({ type: 'error', message: 'Mật khẩu không được chứa khoảng trắng hoặc ký tự trắng' });
  //   return;
  // }

  // Optional: Kiểm tra username không chứa space (rất phổ biến)
  if (registerForm.username.includes(' ')) {
    ui.pushToast({
      type: 'error',
      message: 'Tên đăng nhập không được chứa khoảng trắng',
    });
    return;
  }

  try {
    const res = await Register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,      // đã trim
      full_name: registerForm.fullName,
      phone: registerForm.phone,
      role: '',
    });

    const result = res.data;

    if (result.success && result.data) {
      ui.pushToast({ type: 'success', message: 'Đăng ký thành công!' });

      user.login({
        token: result.data.token,
        profile: {
          id: result.data.user.id,
          username: result.data.user.username,
          email: result.data.user.email,
          name: result.data.user.full_name,
          phone: result.data.user.phone,
          avatar: result.data.user.avatar_url,
          role: result.data.user.role,
        },
        role: result.data.user.role,
      });

      // Reset form
      registerForm.fullName = '';
      registerForm.username = '';
      registerForm.email    = '';
      registerForm.phone    = '';
      registerForm.password = '';
      registerForm.confirm  = '';

      router.replace('/');
    } else {
      // Trường hợp server trả success = false nhưng không throw error
      ui.pushToast({
        type: 'error',
        message: result.message || 'Đăng ký thất bại, vui lòng thử lại',
      });
    }
  } catch (err) {
    console.error('Lỗi đăng ký:', err);

    const errorMessage =
      err.response?.data?.message ||
      err.message ||
      'Đăng ký thất bại, vui lòng thử lại';

    ui.pushToast({ type: 'error', message: errorMessage });
  }
};

const handleForgotPassword = async () => {
	const email = String(forgotEmail.value || '').trim();
	if (!email) {
		ui.pushToast({ type: 'error', message: 'Vui lòng nhập email' });
		return;
	}
    isLoading.value = true; // Bắt đầu loading
	try {
		// Attempt to call backend forgot-password endpoint; if backend not available this will fail silently
		const res =  await ForgotPassword({ email });
		if (res.data && res.data.success) {
			ui.pushToast({ type: 'success', message: res.data.message || 'Yêu cầu đặt lại mật khẩu đã được gửi (kiểm tra email)' });
		} else {
			throw new Error(res.data.message || 'Không thể gửi yêu cầu, vui lòng thử lại sau');
		}
		showForgot.value = false;
		forgotEmail.value = '';
	} catch (err) {
		console.error('Forgot password error:', err);
		const msg = err.response?.data?.message || 'Không thể gửi yêu cầu, vui lòng thử lại sau';
		ui.pushToast({ type: 'error', message: msg });
	}
};
</script>
