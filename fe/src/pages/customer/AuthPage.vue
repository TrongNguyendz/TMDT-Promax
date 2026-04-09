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
            <form v-if="currentStep === 'login'" @submit.prevent="handleLogin" class="space-y-5">
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

              <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition shadow-lg text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'ĐANG ĐĂNG NHẬP...' : 'ĐĂNG NHẬP' }}
            </button>
            </form>

            <!-- Form Register -->
            <form v-else-if="currentStep === 'register'" @submit.prevent="handleRegister" class="space-y-4">
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

              <button 
              type="submit"
              :disabled="isSubmitting"
              class="w-full py-3.5 bg-white text-black font-bold rounded-2xl hover:bg-gray-100 transition shadow-lg text-sm tracking-wide disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {{ isSubmitting ? 'ĐANG TẠO TÀI KHOẢN...' : 'TẠO TÀI KHOẢN' }}
            </button>
            </form>
 
            <form 
  v-else-if="currentStep === 'verify'" 
  @submit.prevent="handleVerifyOTP" 
  class="space-y-6"
>
  <div class="text-center space-y-4">
    <p class="text-white/80 text-sm">
      Chúng tôi đã gửi mã OTP 6 số đến email của Bro:
    </p>
    
    <p class="text-white font-medium">
      {{ registerForm.email }}
    </p>
  </div>

  <!-- OTP Input - Đã fix hiển thị thứ tự từ trái sang phải -->
  <div class="relative">
    <input 
      v-model="otpInput" 
      type="text" 
      inputmode="numeric"
      maxlength="6"
      placeholder="000000"
      autocomplete="one-time-code"
      class="w-full text-center text-4xl font-mono tracking-[18px] 
             bg-white/10 border border-white/30 rounded-2xl 
             py-6 text-white placeholder-white/40 
             focus:outline-none focus:border-white/60 focus:ring-2 focus:ring-white/40
             transition-all duration-200"
      required 
    />
    
    <!-- Hiệu ứng overlay nhẹ để tăng tính thẩm mỹ -->
    <div class="absolute inset-0 pointer-events-none rounded-2xl border border-white/10"></div>
  </div>

  <!-- Button -->
 <button 
  type="submit"
  :disabled="isSubmitting"
  class="w-full py-4 bg-white text-black font-semibold rounded-2xl 
         hover:bg-gray-100 active:scale-[0.985] transition-all duration-200
         disabled:opacity-70 disabled:cursor-not-allowed shadow-xl"
>
  {{ isSubmitting ? 'ĐANG XÁC THỰC...' : 'XÁC THỰC TÀI KHOẢN' }}
</button>

  <!-- Resend OTP -->
  <div class="text-center">
    <button 
      type="button"
      @click="resendOTP"
      :disabled="isResending"
      class="text-white/70 hover:text-white text-sm transition-colors underline decoration-dotted"
    >
      {{ isResending ? 'Đang gửi lại...' : 'Gửi lại mã OTP' }}
    </button>
  </div>
</form>

            <!-- Chuyển đổi giữa Login / Register -->
            <div v-if="currentStep !== 'verify'" class="text-center mt-6 text-white/70 text-xs">
              {{ isLogin ? 'Chưa có tài khoản?' : 'Đã có tài khoản?' }}
              <button @click="toggleMode" class="font-bold text-white hover:underline ml-1">
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
import { ref, reactive, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useUserStore } from '../../stores/user';
import { useUIStore } from '../../stores/ui';
import { Login, Register, VerifyOTP, ResendOTP, ForgotPassword } from '../../utils/user_service_api';
import bgImage from '../../assets/auth.jpg';

const route = useRoute();
const router = useRouter();
const user = useUserStore();
const ui = useUIStore();

// ==================== STATE ====================
const currentStep = ref('login');        // 'login' | 'register' | 'verify'
const isLogin = ref(true);

const isSubmitting = ref(false);         // ← Loading chính cho nút submit
const isResending = ref(false);

const loginForm = reactive({ username: '', password: '' });
const registerForm = reactive({
  fullName: '',
  username: '',
  email: '',
  phone: '',
  password: '',
  confirm: '',
});

const otpInput = ref('');
const showForgot = ref(false);
const forgotEmail = ref('');
const isLoadingForgot = ref(false);

// Biến hỗ trợ UX khi chuyển từ login sang verify vì chưa kích hoạt
const cameFromUnactivatedLogin = ref(false);

// ==================== METHODS ====================

const toggleMode = () => {
  isLogin.value = !isLogin.value;
  currentStep.value = isLogin.value ? 'login' : 'register';
  resetForms();
};

const resetForms = () => {
  loginForm.username = '';
  loginForm.password = '';
  otpInput.value = '';
};

// ==================== LOGIN ====================
const handleLogin = async () => {
  if (isSubmitting.value) return;

  // Validate
  const username = loginForm.username.trim();
  const password = loginForm.password.trim();

  if (!username || !password) {
    ui.pushToast({ type: 'error', message: 'Vui lòng nhập đầy đủ thông tin' });
    return;
  }
  if (password.includes(' ')) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu không được chứa khoảng trắng' });
    return;
  }
  if (username.includes(' ')) {
    ui.pushToast({ type: 'error', message: 'Tên đăng nhập không được chứa khoảng trắng' });
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await Login({ username, email: username, password });
    const result = res.data;

    if (result.success && result.data?.token && result.data?.user) {
      // Đăng nhập thành công
      user.login({
        token: result.data.token,
        profile: {
          id: result.data.user.id,
          username: result.data.user.username,
          email: result.data.user.email,
          fullname: result.data.user.full_name,
          phone: result.data.user.phone,
          avatar_url: result.data.user.avatar_url,
          role: result.data.user.role,
        },
        role: result.data.user.role,
      });

      ui.pushToast({ type: 'success', message: 'Đăng nhập thành công!' });

      const redirect = route.query.redirect || '/';
      router.replace(result.data.user.role === 'admin' ? '/admin/welcome' : redirect);
      router.replace(result.data.user.role === 'staff' ? '/staff/welcome' : redirect);
    } 
    else if (result.message?.toLowerCase().includes('kích hoạt') || 
             result.message?.toLowerCase().includes('chưa được kích hoạt')) {
      
      // Chuyển sang màn hình xác thực OTP
      registerForm.email = username;
      cameFromUnactivatedLogin.value = true;
      currentStep.value = 'verify';

      ui.pushToast({
        type: 'warning',
        message: 'Tài khoản chưa được kích hoạt. Vui lòng nhập mã OTP đã gửi đến email.'
      });
    } 
    else {
      ui.pushToast({ type: 'error', message: result.message || 'Đăng nhập thất bại' });
    }
  } catch (err) {
    console.error('Login error:', err);

    const msg = err.response?.data?.message || 'Đăng nhập thất bại, vui lòng thử lại';

    if (msg.toLowerCase().includes('kích hoạt')) {
      registerForm.email = username;
      cameFromUnactivatedLogin.value = true;
      currentStep.value = 'verify';
      ui.pushToast({ type: 'warning', message: 'Tài khoản chưa được kích hoạt. Vui lòng xác thực OTP.' });
    } else {
      ui.pushToast({ type: 'error', message: msg });
    }
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== REGISTER ====================
// ==================== REGISTER ====================
// ==================== REGISTER ====================
const handleRegister = async () => {
  if (isSubmitting.value) return;

  // Trim tất cả input
  registerForm.fullName = registerForm.fullName.trim();
  registerForm.username = registerForm.username.trim();
  registerForm.email = registerForm.email.trim();
  registerForm.phone = registerForm.phone.trim();
  registerForm.password = registerForm.password.trim();
  registerForm.confirm = registerForm.confirm.trim();

  // ==================== VALIDATION (khớp với Joi schema backend) ====================

  // 1. Username - .alphanum().min(3).max(30)
  if (!registerForm.username) {
    ui.pushToast({ type: 'error', message: 'Username là bắt buộc' });
    return;
  }
  if (registerForm.username.length < 3) {
    ui.pushToast({ type: 'error', message: 'Username phải có ít nhất 3 ký tự' });
    return;
  }
  if (registerForm.username.length > 30) {
    ui.pushToast({ type: 'error', message: 'Username không được vượt quá 30 ký tự' });
    return;
  }
  if (!/^[a-zA-Z0-9]+$/.test(registerForm.username)) {
    ui.pushToast({ type: 'error', message: 'Username chỉ được chứa chữ cái (a-z, A-Z) và số (0-9), không dấu cách, không ký tự đặc biệt' });
    return;
  }

  // 2. Email
  if (!registerForm.email) {
    ui.pushToast({ type: 'error', message: 'Email là bắt buộc' });
    return;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(registerForm.email)) {
    ui.pushToast({ type: 'error', message: 'Email không đúng định dạng' });
    return;
  }

  // 3. Họ tên (full_name)
  if (!registerForm.fullName) {
    ui.pushToast({ type: 'error', message: 'Họ tên là bắt buộc' });
    return;
  }
  if (registerForm.fullName.length < 2) {
    ui.pushToast({ type: 'error', message: 'Họ tên phải có ít nhất 2 ký tự' });
    return;
  }
  if (registerForm.fullName.length > 100) {
    ui.pushToast({ type: 'error', message: 'Họ tên quá dài (tối đa 100 ký tự)' });
    return;
  }

  // 4. Số điện thoại (optional nhưng nếu nhập thì phải hợp lệ - khuyến nghị)
  if (registerForm.phone) {
    // Hỗ trợ cả số Việt Nam: 0xxx hoặc +84xxx
    const phoneClean = registerForm.phone.replace(/\s+/g, '');
    const vnPhoneRegex = /^(0|\+84)(3|5|7|8|9)\d{8}$/;
    if (!vnPhoneRegex.test(phoneClean)) {
      ui.pushToast({ 
        type: 'error', 
        message: 'Số điện thoại không hợp lệ. Ví dụ hợp lệ: 0912345678 hoặc +84912345678' 
      });
      return;
    }
  }

  // 5. Mật khẩu
  if (!registerForm.password) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu là bắt buộc' });
    return;
  }
  if (registerForm.password.length < 6) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu phải có ít nhất 6 ký tự' });
    return;
  }
  if (registerForm.password.length > 100) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu quá dài' });
    return;
  }
  if (registerForm.password.includes(' ')) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu không được chứa khoảng trắng' });
    return;
  }

  // 6. Xác nhận mật khẩu
  if (registerForm.password !== registerForm.confirm) {
    ui.pushToast({ type: 'error', message: 'Mật khẩu xác nhận không khớp' });
    return;
  }

  // ==================== GỌI API nếu tất cả hợp lệ ====================
  isSubmitting.value = true;

  try {
    const res = await Register({
      username: registerForm.username,
      email: registerForm.email,
      password: registerForm.password,
      full_name: registerForm.fullName,
      phone: registerForm.phone || undefined,   // không gửi nếu rỗng
    });

    const result = res.data;

    if (result.success) {
      ui.pushToast({ 
        type: 'success', 
        message: 'Đăng ký thành công! Vui lòng kiểm tra email để nhập mã OTP.' 
      });

      cameFromUnactivatedLogin.value = false;
      currentStep.value = 'verify';
    } else {
      ui.pushToast({ type: 'error', message: result.message || 'Đăng ký thất bại' });
    }
  } catch (err) {
    const errorMsg = err.response?.data?.message || 'Đăng ký thất bại, vui lòng thử lại';
    ui.pushToast({ type: 'error', message: errorMsg });
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== VERIFY OTP ====================
const handleVerifyOTP = async () => {
  if (otpInput.value.length !== 6) {
    ui.pushToast({ type: 'error', message: 'Mã OTP phải đủ 6 số' });
    return;
  }

  isSubmitting.value = true;

  try {
    const res = await VerifyOTP({
      email: registerForm.email,
      otp: otpInput.value
    });

    if (res.data.success) {
      ui.pushToast({ type: 'success', message: 'Xác thực tài khoản thành công! Bạn có thể đăng nhập ngay.' });

      // Quay về màn hình login
      currentStep.value = 'login';
      isLogin.value = true;
      otpInput.value = '';
      cameFromUnactivatedLogin.value = false;
    }
  } catch (err) {
    ui.pushToast({
      type: 'error',
      message: err.response?.data?.message || 'Mã OTP không đúng hoặc đã hết hạn'
    });
  } finally {
    isSubmitting.value = false;
  }
};

// ==================== RESEND OTP ====================
const resendOTP = async () => {
  if (isResending.value) return;

  isResending.value = true;
  try {
    await ResendOTP({ email: registerForm.email });
    ui.pushToast({ type: 'success', message: 'Đã gửi lại mã OTP' });
  } catch (err) {
    ui.pushToast({ type: 'error', message: 'Gửi lại OTP thất bại' });
  } finally {
    isResending.value = false;
  }
};

// ==================== FORGOT PASSWORD ====================
const handleForgotPassword = async () => {
  const email = forgotEmail.value.trim();
  if (!email) {
    ui.pushToast({ type: 'error', message: 'Vui lòng nhập email' });
    return;
  }

  isLoadingForgot.value = true;
  try {
    const res = await ForgotPassword({ email });
    if (res.data?.success) {
      ui.pushToast({ type: 'success', message: 'Link đặt lại mật khẩu đã được gửi đến email của bạn' });
      showForgot.value = false;
      forgotEmail.value = '';
    }
  } catch (err) {
    ui.pushToast({
      type: 'error',
      message: err.response?.data?.message || 'Không thể gửi yêu cầu, vui lòng thử lại'
    });
  } finally {
    isLoadingForgot.value = false;
  }
};
</script>