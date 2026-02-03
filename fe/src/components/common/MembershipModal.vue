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

      <h2 class="mb-4 text-2xl font-bold text-gray-900 dark:text-white">Điều khoản khách hàng</h2>
      <div class="space-y-4 text-gray-600 dark:text-gray-300 text-sm leading-relaxed max-h-[60vh] overflow-y-auto pr-2">
        <p>Chào mừng Quý khách đến với dịch vụ của chúng tôi. Vui lòng đọc kỹ các điều khoản sau trước khi sử dụng nền tảng, đăng ký tài khoản hoặc thực hiện giao dịch.</p>

        <h3 class="font-semibold">Đăng Ký & Bảo Mật Tài Khoản</h3>
        <p>- Đăng ký: Khi tạo tài khoản trên nền tảng, Quý khách phải cung cấp thông tin cá nhân chính xác, đầy đủ và kịp thời cập nhật. Thông tin sai lệch có thể dẫn đến việc tạm dừng hoặc hủy bỏ tài khoản.</p>
        <p>- Trách nhiệm bảo mật: Quý khách chịu trách nhiệm hoàn toàn về việc bảo mật thông tin đăng nhập (tên đăng nhập, mật khẩu, mã xác thực). Mọi hoạt động phát sinh từ tài khoản được coi là do chủ tài khoản thực hiện, trừ khi có bằng chứng khác.</p>
        <p>- Thông báo truy cập trái phép: Khi nghi ngờ tài khoản bị truy cập trái phép, Quý khách phải thông báo ngay cho chúng tôi để kịp thời áp dụng biện pháp bảo vệ.</p>
        <p>- Tạm ngưng & hủy: Chúng tôi có quyền tạm ngưng, giới hạn hoặc chấm dứt tài khoản khi phát hiện hành vi vi phạm Điều khoản, gian lận hoặc theo yêu cầu của cơ quan chức năng.</p>

        <h3 class="font-semibold">Thanh Toán & Giá Cả</h3>
        <p>- Giá công bố: Giá sản phẩm được hiển thị tại thời điểm đặt hàng và có thể được điều chỉnh trong trường hợp khuyến mại, lỗi kỹ thuật hoặc thay đổi chính sách.</p>
        <p>- Phương thức thanh toán: Chúng tôi chấp nhận các phương thức thanh toán được liệt kê trên trang; giao dịch được xử lý an toàn qua cổng thanh toán được chỉ định.</p>
<p>- Hoàn tiền & phí: Mọi khoản hoàn tiền sẽ tuân theo chính sách hoàn tiền; các khoản phí phát sinh (nếu có) sẽ được thông báo trước khi hoàn tất giao dịch.</p>

        <h3 class="font-semibold">Đặt Hàng & Xác Nhận</h3>
        <p>- Tạo đơn hàng: Đơn hàng được tạo khi Quý khách xác nhận thông tin sản phẩm, địa chỉ giao nhận và hoàn tất thanh toán (nếu áp dụng).</p>
        <p>- Xác nhận đơn: Sau khi tiếp nhận, chúng tôi sẽ gửi thông báo xác nhận qua email/SMS; chúng tôi có quyền từ chối hoặc hủy đơn trong trường hợp hết hàng, nghi ngờ gian lận hoặc sai sót về giá.</p>
        <p>- Thay đổi/hủy đơn: Yêu cầu thay đổi hoặc hủy đơn cần được gửi ngay cho bộ phận hỗ trợ; khả năng thực hiện phụ thuộc vào trạng thái xử lý đơn.</p>

        <h3 class="font-semibold">Giao Hàng & Nhận Hàng</h3>
        <p>- Thời gian giao: Thời hạn giao hàng là ước tính và có thể thay đổi theo khu vực, tình trạng kho và điều kiện vận chuyển.</p>
        <p>- Kiểm tra khi nhận: Quý khách nên kiểm tra hàng hóa trước khi ký nhận; khiếu nại về hư hỏng hoặc thiếu hụt cần được thông báo ngay theo hướng dẫn.</p>
        <p>- Giao nhận tại điểm: Khi nhận tại cửa hàng/điểm nhận, Quý khách cần xuất trình giấy tờ theo yêu cầu để xác nhận.</p>

        <h3 class="font-semibold">Đổi Trả & Hoàn Tiền</h3>
        <p>- Điều kiện đổi trả: Sản phẩm chỉ được đổi trả khi đáp ứng điều kiện nêu trong chính sách đổi trả (còn nguyên tem, chưa sử dụng, trong thời hạn cho phép).</p>
        <p>- Quy trình khiếu nại: Vui lòng gửi yêu cầu theo hướng dẫn; chúng tôi sẽ xác minh trước khi chấp nhận đổi trả.</p>
        <p>- Hoàn tiền: Thời gian và phương thức hoàn tiền phụ thuộc vào phương thức thanh toán ban đầu và quy trình xử lý nội bộ.</p>

        <h3 class="font-semibold">Quyền Riêng Tư & Bảo Vệ Dữ Liệu</h3>
        <p>- Mục đích thu thập: Chúng tôi thu thập và xử lý dữ liệu cá nhân nhằm mục đích cung cấp dịch vụ, xử lý đơn hàng và chăm sóc khách hàng.</p>
        <p>- Bảo mật dữ liệu: Chúng tôi áp dụng biện pháp kỹ thuật và tổ chức nhằm bảo vệ dữ liệu cá nhân khỏi truy cập trái phép, rò rỉ hoặc mất mát.</p>
        <p>- Chia sẻ thông tin: Dữ liệu chỉ được chia sẻ với bên thứ ba khi cần thiết để cung cấp dịch vụ (đối tác vận chuyển, cổng thanh toán) hoặc theo yêu cầu pháp luật.</p>
<p>- Quyền của Quý khách: Quý khách có quyền truy cập, chỉnh sửa, yêu cầu xóa hoặc hạn chế xử lý dữ liệu cá nhân theo quy định pháp luật.</p>

        <h3 class="font-semibold">Quyền Sở Hữu Trí Tuệ</h3>
        <p>- Nội dung bản quyền: Mọi nội dung trên nền tảng (hình ảnh, văn bản, logo, mã nguồn) là tài sản của chúng tôi hoặc được sử dụng có bản quyền; việc sao chép hoặc sử dụng cho mục đích thương mại cần có sự đồng ý bằng văn bản.</p>

        <h3 class="font-semibold">Trách Nhiệm & Giới Hạn</h3>
        <p>- Trách nhiệm của chúng tôi: Chúng tôi cam kết cung cấp dịch vụ chuyên nghiệp và chịu trách nhiệm đối với thiệt hại trực tiếp phát sinh từ lỗi của chúng tôi trong phạm vi pháp luật cho phép.</p>
        <p>- Giới hạn trách nhiệm: Chúng tôi không chịu trách nhiệm cho các thiệt hại gián tiếp, tổn thất lợi nhuận hoặc mất mát dữ liệu, trừ khi pháp luật quy định khác.</p>

        <h3 class="font-semibold">Thanh Toán Bồi Thường & Giải Quyết Tranh Chấp</h3>
        <p>- Bồi thường: Quý khách đồng ý bồi thường cho chúng tôi nếu hành động hoặc thông tin do Quý khách cung cấp gây thiệt hại hoặc vi phạm Điều khoản.</p>
        <p>- Giải quyết tranh chấp: Mọi tranh chấp sẽ được ưu tiên giải quyết bằng thương lượng; nếu không thành, vụ việc sẽ được giải quyết tại cơ quan có thẩm quyền theo pháp luật Việt Nam.</p>

        <h3 class="font-semibold">Sửa Đổi & Cập Nhật Điều Khoản</h3>
        <p>- Quyền sửa đổi: Chúng tôi có quyền sửa đổi, cập nhật Điều khoản để phù hợp với hoạt động kinh doanh và quy định pháp luật; mọi sửa đổi sẽ được công bố trên website và/hoặc thông báo đến Quý khách.</p>
        <p>- Thời điểm có hiệu lực: Các thay đổi có hiệu lực kể từ khi được công bố, trừ khi có quy định khác. Việc Quý khách tiếp tục sử dụng dịch vụ sau khi thay đổi sẽ được coi là chấp nhận các điều khoản mới.</p>
        <p>- Thông báo: Đối với các thay đổi có ảnh hưởng đáng kể đến quyền lợi Quý khách, chúng tôi sẽ cố gắng thông báo trước thông qua các kênh liên lạc đã đăng ký.</p>

        <p>Nếu Quý khách cần bản điều khoản chi tiết hơn hoặc có thắc mắc, vui lòng liên hệ bộ phận Chăm sóc Khách hàng để được hỗ trợ.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
defineEmits(['close']);
</script>
