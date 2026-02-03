<template>
	<section class="bg-gray-900 text-white py-12">
		<div class="mx-auto max-w-7xl px-4">
			<!-- Footer Grid -->
			<div class="grid gap-8 sm:grid-cols-2 md:grid-cols-5 mb-8">
				<!-- Về Uniqlo -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Về Uniqlo</h3>
					<ul class="space-y-2 text-sm text-gray-300">
						<li><RouterLink to="/about" class="hover:text-white">Thông tin</RouterLink></li>
						<li><RouterLink to="/about" class="hover:text-white">Danh sách cửa hàng</RouterLink></li>
						<li><RouterLink to="/about" class="hover:text-white">Cơ Hội Nghề Nghiệp</RouterLink></li>
					</ul>
				</div>

				<!-- Trợ giúp -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Trợ giúp</h3>
					<ul class="space-y-2 text-sm text-gray-300">
						<li><RouterLink to="/about" class="hover:text-white">FAQ</RouterLink></li>
						<li><RouterLink to="/about" class="hover:text-white">Chính sách trả hàng</RouterLink></li>
						<li><RouterLink to="/about" class="hover:text-white">Chính sách bảo mật</RouterLink></li>
						<li><RouterLink to="/about" class="hover:text-white">Tiếp cận</RouterLink></li>
					</ul>
				</div>

				<!-- Tài khoản -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Tài khoản</h3>
					<ul class="space-y-2 text-sm text-gray-300">
						<li><RouterLink to="/profile" class="hover:text-white">Tư cách thành viên</RouterLink></li>
						<li><RouterLink to="/profile" class="hover:text-white">Hộ số</RouterLink></li>
						<li><RouterLink to="/profile" class="hover:text-white">Coupons</RouterLink></li>
					</ul>
				</div>

				<!-- Bản tin điện tử -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Bản tin điện tử</h3>
					<p class="mb-4 text-sm text-gray-300">Đăng ký ngay và là người đầu tiên năm được thông tin khi có mặt hàng mới, khuyến mại, các sự kiện sắp diễn ra tại cửa hàng và nhiều thông tin hữu ích khác.</p>
					<RouterLink to="/auth" class="inline-block bg-white text-gray-900 px-4 py-2 rounded font-semibold hover:bg-gray-100">ĐĂNG KÝ NGAY</RouterLink>
				</div>

				<!-- Tài khoản xã hội -->
				<div>
					<h3 class="mb-4 text-lg font-semibold">Tài khoản xã hội UNIQLO</h3>
					<div class="flex gap-4">
						<a href="https://facebook.com" target="_blank" rel="noopener" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12" title="Facebook">
							<span class="text-xl">f</span>
						</a>
						<a href="https://instagram.com" target="_blank" rel="noopener" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12" title="Instagram">
							<span class="text-xl">📷</span>
						</a>
						<a href="https://youtube.com" target="_blank" rel="noopener" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12" title="YouTube">
							<span class="text-xl">▶</span>
						</a>
						<a href="https://tiktok.com" target="_blank" rel="noopener" class="bg-gray-700 hover:bg-gray-600 p-3 rounded-full inline-flex items-center justify-center w-12 h-12" title="TikTok">
							<span class="text-xl">♪</span>
						</a>
					</div>
				</div>
			</div>

			<!-- Divider -->
			<div class="border-t border-gray-700 pt-6">
				<p class="text-center text-sm text-gray-400">© 2024 E-Commerce. All rights reserved.</p>
			</div>
		</div>
	</section>
</template>

<script setup>
</script>


