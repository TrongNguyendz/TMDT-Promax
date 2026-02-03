import random
import calendar
import re
import unicodedata
from dataclasses import dataclass, asdict
from typing import Dict, List, Tuple, Optional

# ----------------------------
# Config & vocab
# ----------------------------

SYNONYMS = {
    "giảm giá": ["sale", "hạ giá", "xả kho", "deal hot", "giảm mạnh"],
    "khuyến mãi": ["promo", "ưu đãi", "ưu đãi sốc", "km"],
    "nhận quà": ["nhận gift", "nhận quà tặng", "nhận quà liền"],
    "liên hệ": ["LH", "call", "liên lạc", "ib", "inbox"],
    "đăng ký": ["đk", "ghi danh", "tham gia", "register"],
    "quà": ["gift", "phần quà", "quà tặng"],
    "voucher": ["mã giảm", "coupon", "mã ưu đãi", "code"],
    "freeship": ["miễn phí vận chuyển", "freeship", "ship 0đ"],
}

EMOJI_LIST = ["🎁", "🔥", "💸", "✅", "❗", "🌟", "📱", "📣", "⏳", "🛒", "💥", "🧾"]

# Dùng placeholder để tránh tạo nội dung spam có thể dùng thật
URL_PLACEHOLDERS = ["<URL>", "<LINK>", "<WEBSITE>"]
PHONE_PLACEHOLDERS = ["<PHONE>", "<HOTLINE>"]
MONEY_LIST = ["100k", "200k", "500k", "1.000.000đ", "50.000đ", "2.500.000đ", "10K", "20k", "375.000đ", "3 triệu", "5tr"]
VOUCHER_LIST = ["10%", "20%", "30%", "50%", "100k", "200k", "FREESHIP", "GIAM50"]

PRODUCT_LIST = [
    "điện thoại", "laptop", "máy tính bảng", "tai nghe", "đồng hồ", "giày dép",
    "quần áo", "nước hoa", "mỹ phẩm", "serum", "kem dưỡng", "collagen"
]
REALESTATE_LIST = ["đất nền", "shophouse", "căn hộ", "chung cư", "khu đô thị", "khu nghỉ dưỡng"]

OFFER_LIST = ["ưu đãi", "khuyến mãi", "flash sale", "deal hot", "tri ân", "giá sốc"]
BANK_LOAN_TERMS = ["vay nhanh", "hỗ trợ tài chính", "giải ngân", "lãi suất", "hồ sơ đơn giản", "duyệt nhanh"]
SCAM_TERMS = ["trúng thưởng", "nhận quà", "xác minh", "kích hoạt", "hoàn tiền", "hỗ trợ"]

CODE_SWITCH = {
    "ngay": ["now", "liền", "asap"],
    "miễn phí": ["free", "0đ", "free of charge"],
    "nhanh tay": ["hurry", "nhanh lên", "gấp"],
    "còn": ["left", "còn lại", "remain"],
}

SLANG = ["vcl", "vl", "nha", "ạ", "nè", "hihi", "kk", "ok", "oke", "z", "hnay", "mai", "r", "ko", "k", "đc"]

# New: Scam keywords from "Lừa đảo .docx" integrated for diversity
# Divided into categories for better organization and random selection

FINANCE_SCAM_KEYWORDS = [
    "việc nhẹ lương cao", "thu nhập khủng", "kiếm tiền triệu mỗi ngày", "làm giàu nhanh chóng", "giàu trong 30 ngày",
    "thu nhập 50-100 triệu/tháng", "lương từ 20-50 triệu", "không cần kinh nghiệm", "không cần bằng cấp", "không cần học vấn",
    "không cần chứng chỉ", "làm tại nhà", "làm việc online", "làm việc từ xa", "làm thêm tại nhà", "chỉ cần điện thoại",
    "chỉ cần máy tính", "chỉ cần 30 phút mỗi ngày", "làm việc tự do", "thời gian linh hoạt", "đầu tư sinh lời gấp đôi",
    "lãi suất 5% mỗi ngày", "lãi suất 30% mỗi tháng", "sinh lời 100% trong tháng", "hoàn vốn sau 7 ngày", "hoàn vốn gấp 10 lần",
    "nhân đôi tài sản", "nhân 3 lần số tiền", "tăng trưởng 500%", "lợi nhuận khủng", "cam kết lãi suất", "đảm bảo sinh lời",
    "không rủi ro", "không thua lỗ", "an toàn tuyệt đối", "bảo đảm 100%", "uy tín hàng đầu", "công ty quốc tế",
    "có giấy phép kinh doanh", "được cấp phép", "hợp pháp 100%", "minh bạch rõ ràng", "đã chi trả cho hàng ngàn người",
    "hàng triệu người tham gia", "cộng đồng toàn cầu", "mạng lưới thế giới", "cơ hội hiếm có", "cơ hội nghìn năm có một",
    "cơ hội vàng", "cơ hội đổi đời", "cơ hội cuối cùng", "chỉ còn 10 suất", "chỉ còn 5 chỗ", "sắp đóng đăng ký", "sắp hết hạn",
    "khẩn cấp", "nhanh tay kẻo lỡ", "đừng bỏ lỡ", "bỏ lỡ sẽ tiếc", "không có lần sau", "chỉ hôm nay", "chỉ trong 24h",
    "ưu đãi có một không hai", "khuyến mãi độc quyền", "tặng ngay 10 triệu", "thưởng 5 triệu khi tham gia", "bonus 20 triệu",
    "miễn phí hoàn toàn", "không mất phí", "0 đồng tham gia", "đăng ký ngay hôm nay", "tham gia ngay", "click ngay",
    "inbox ngay", "liên hệ ngay", "chuyển khoản ngay để giữ chỗ", "đặt cọc để được ưu tiên", "cần ứng trước để xử lý",
    "phí kích hoạt tài khoản", "phí mở tài khoản", "vốn ban đầu tối thiểu", "gửi trước 1 triệu", "nạp ít rút nhiều",
    "vay 5 triệu nhận 7 triệu", "code giảm giá độc quyền", "mã khuyến mãi đặc biệt", "tài khoản VIP miễn phí",
    "nâng cấp tài khoản đặc biệt", "được chọn làm đại sứ thương hiệu", "trở thành cộng tác viên", "kiếm tiền từ giới thiệu",
    "hoa hồng 30%", "hoa hồng không giới hạn", "thu nhập thụ động mãi mãi", "làm 1 lần hưởng lợi mãi mãi", "bí quyết làm giàu",
    "bí mật triệu phú", "chiến lược đầu tư thông minh", "hệ thống tự động kiếm tiền", "robot giao dịch tự động",
    "lấy lại tiền bị lừa đảo", "hoàn tiền bị chiếm đoạt", "thu hồi tiền mất", "truy lại số tiền", "tìm lại tài sản bị lừa",
    "giúp bạn lấy lại tiền", "dịch vụ thu hồi nợ", "đòi lại tiền cho bạn", "chỉ với 100 nghìn", "chỉ cần 200 nghìn",
    "phí rất nhỏ", "chi phí thấp", "mất ít được nhiều", "đầu tư ít thu về gấp bội", "bỏ ra 500k nhận lại 50 triệu",
    "nộp phí trước lấy tiền sau", "đóng tiền hồ sơ", "phí xử lý vụ việc", "chi phí thuê luật sư", "tiền công chạy việc",
    "phí môi giới ngân hàng", "tư vấn pháp lý miễn phí", "hỗ trợ nạn nhân lừa đảo", "trung tâm hỗ trợ nạn nhân",
    "tổ chức phi lợi nhuận", "đội ngũ chuyên gia", "chuyên truy tìm lừa đảo", "chuyên xử lý gian lận", "công ty điều tra tư",
    "thám tử tư", "chuyên gia an ninh mạng", "hacker mũ trắng", "kỹ sư công nghệ", "chuyên gia phục hồi dữ liệu",
    "lấy lại mật khẩu", "phá khóa tài khoản", "hack lại tài khoản bị mất", "truy tìm tội phạm", "xác định kẻ lừa đảo",
    "có địa chỉ kẻ gian", "biết rõ thông tin lừa đảo", "đã nắm được thông tin", "cơ quan công an đang xử lý",
    "công an đã vào cuộc", "đang điều tra", "sắp bắt được", "kẻ lừa đảo đã sa lưới", "đã bị bắt giữ", "đang tạm giam",
    "đang giam giữ tài khoản ngân hàng", "phong tỏa tài sản", "đóng băng số tiền", "kê biên tài sản", "thu giữ tài khoản",
    "bồi thường cho nạn nhân", "chi trả bồi thường", "quỹ bồi thường", "ngân hàng sẽ hoàn tiền", "bảo hiểm sẽ chi trả",
    "nhà nước hỗ trợ", "chính phủ đền bù", "chương trình hỗ trợ quốc gia", "dự án hỗ trợ nạn nhân", "đợt chi trả bồi thường",
    "danh sách được bồi thường", "bạn nằm trong danh sách", "được duyệt hồ sơ", "đủ điều kiện nhận", "hợp lệ để nhận tiền",
    "xác minh là nạn nhân thật", "chứng minh bị lừa", "cung cấp bằng chứng", "gửi chứng từ chuyển khoản", "sao kê giao dịch",
    "biên lai nộp tiền", "ảnh chụp màn hình", "tin nhắn lừa đảo", "số tài khoản kẻ lừa", "thông tin người nhận tiền",
    "tên chủ tài khoản lừa đảo", "ngân hàng của kẻ gian", "giấy tờ tùy thân của bạn", "CMND/CCCD để đối chiếu",
    "mã số thuế cá nhân", "thông tin tài khoản ngân hàng của bạn", "số tài khoản nhận bồi thường", "tên chủ tài khoản",
    "chi nhánh ngân hàng", "mã BIC/SWIFT", "số điện thoại đăng ký", "email xác nhận", "địa chỉ thường trú",
    "hộ khẩu thường trú", "giấy xác nhận tạm trú", "hợp đồng lao động", "sổ bảo hiểm xã hội", "chứng minh thu nhập",
    "cam kết không khiếu nại", "ký cam kết bảo mật", "ký giấy ủy quyền xử lý"
]

PUBLIC_SERVICE_SCAM_KEYWORDS = [
    "giải quyết hồ sơ nhanh", "làm nhanh trong ngày", "không cần chờ đợi", "ưu tiên xử lý", "xử lý khẩn cấp",
    "thủ tục đơn giản", "không cần giấy tờ phức tạp", "không cần bản gốc", "chỉ cần bản photo", "chỉ cần hình chụp",
    "gửi qua Zalo là được", "chuyển qua email là xong", "làm online không cần đến", "làm từ xa", "ship tận nhà",
    "giao tận nơi miễn phí", "có người quen trong ngành", "có mối quan hệ", "quen thủ trưởng", "quen cán bộ",
    "biết người trong đó", "xin được ngay", "đảm bảo đậu", "chắc chắn thành công", "lo hết mọi thứ",
    "không cần làm gì cả", "cứ yên tâm", "giao phó hết cho tôi", "bảo đảm an toàn", "tuyệt đối bí mật",
    "không để lộ thông tin", "xóa hồ sơ vi phạm", "xóa bằng lái bị tịch thu", "xóa án tích", "xóa nợ xấu",
    "xóa blacklist", "xóa truy nã", "giải quyết lệnh truy nã", "dỡ bỏ lệnh cấm xuất cảnh", "xử lý nợ thuế",
    "giảm án", "đình chỉ vụ án", "rút đơn kiện", "hòa giải nhanh", "không phải ra tòa", "không phải hầu tòa",
    "đóng tiền là xong", "nộp phạt qua tài khoản cá nhân", "chuyển khoản cho tôi", "tôi nộp hộ", "đưa tiền mặt",
    "cần tiền hoạt động", "phí môi giới", "phí xin phép", "chi phí vận động", "tiền chạy án", "tiền chạy việc",
    "tiền cảm ơn", "tiền 'đút lót'", "tiền 'bôi trơn'", "bôi trơn mới giải quyết nhanh", "không đưa tiền thì chờ mãi",
    "muốn nhanh phải trả thêm", "đưa trước làm sau", "nộp tiền rồi nhận kết quả", "chuyển tiền mới xử lý",
    "thanh toán trước 50%", "cần ứng trước chi phí", "văn phòng đại diện", "trung tâm hỗ trợ pháp lý", "công ty tư vấn",
    "luật sư giỏi nhất", "chuyên gia hàng đầu", "tỷ lệ thành công 99%", "chưa bao giờ thất bại", "đã giúp hàng nghìn người",
    "kinh nghiệm 20 năm", "am hiểu quy trình", "nắm rõ thủ tục", "hiểu hết luật lệ", "trực tiếp làm việc với cơ quan",
    "có liên hệ với lãnh đạo", "quen bí thư tỉnh ủy", "biết chủ tịch UBND", "thân với giám đốc công an",
    "cấp trên chỉ đạo", "theo chỉ thị khẩn", "văn bản mật", "thông báo nội bộ", "chỉ thị đột xuất",
    "phải xử lý ngay hôm nay", "quá thời hạn sẽ bị xử lý", "nếu không giải quyết sẽ bị bắt", "không hợp tác sẽ bị phạt nặng",
    "bỏ qua sẽ bị truy tố", "làm ngay kẻo muộn", "hạn cuối hôm nay", "sau hôm nay sẽ không giải quyết được",
    "quá giờ sẽ tịch thu tài sản", "chậm trễ sẽ bị bắt giam", "báo cáo vụ lừa đảo", "trình báo công an", "làm đơn tố cáo",
    "khởi tố vụ án", "mở hồ sơ điều tra", "thụ lý đơn khiếu nại", "chúng tôi sẽ xử lý", "đội đặc nhiệm",
    "lực lượng chống lừa đảo", "phòng an ninh mạng", "cục an ninh mạng A06", "công an bộ phận", "tổ công tác đặc biệt",
    "biệt đội truy quét", "chiến dịch truy quét tội phạm", "đợt cao điểm truy bắt", "tập trung xử lý", "ưu tiên giải quyết",
    "nhanh chóng xét xử", "xử lý trong 7 ngày", "giải quyết trong 24h", "khẩn trương điều tra", "gấp rút điều tra",
    "chỉ đạo khẩn", "theo yêu cầu thủ trưởng", "theo lệnh bộ trưởng", "chỉ thị của thủ tướng", "theo nghị định mới",
    "luật mới có hiệu lực", "chính sách bảo vệ nạn nhân", "quyền lợi nạn nhân được bảo vệ", "bảo mật tuyệt đối",
    "giữ bí mật danh tính", "ẩn danh khi báo cáo", "không cần đến trụ sở", "làm việc qua điện thoại", "họp qua video call",
    "gửi hồ sơ qua email", "nộp đơn online", "xử lý trực tuyến", "thanh toán phí online", "chuyển khoản phí hồ sơ",
    "lệ phí thụ lý", "phí công chứng hồ sơ", "phí đóng dấu công an", "chi phí làm biên bản", "phí sao lục hồ sơ",
    "phí đối chiếu chứng từ", "tiền công giám định", "phí thuê chuyên gia", "chi phí pháp y", "tiền công an kiểm tra",
    "phí xác minh hiện trường", "chi phí lấy lời khai", "phí triệu tập nhân chứng", "tiền đi lại", "phụ cấp công tác phí",
    "hỗ trợ xăng xe", "chi phí phát sinh", "phí khẩn cấp", "tăng cường lực lượng", "huy động thêm nhân lực",
    "tổ công tác liên ngành", "phối hợp nhiều đơn vị", "liên hệ quốc tế", "làm việc với Interpol",
    "phối hợp với công an nước ngoài", "truy tìm ra nước ngoài", "tội phạm đã bỏ trốn", "đang lẩn trốn ở nước ngoài",
    "cần dẫn độ về nước", "thủ tục dẫn độ phức tạp", "chi phí cao", "cần huy động ngân sách", "ngân sách không đủ",
    "cần sự đóng góp của dân", "kêu gọi ủng hộ", "vận động quyên góp", "góp phần phá án", "đóng góp cho công lý",
    "giúp đỡ nạn nhân khác", "tránh người khác bị lừa", "bảo vệ cộng đồng", "vì lợi ích xã hội", "trách nhiệm công dân",
    "nghĩa vụ của người dân", "hợp tác với cơ quan chức năng", "hỗ trợ lực lượng công an", "cung cấp thông tin",
    "tố giác tội phạm", "tích cực phối hợp", "không hợp tác sẽ bị phạt", "cản trở điều tra", "che giấu tội phạm",
    "đồng phạm nếu không khai", "bị liên lụy nếu giấu diếm", "buộc tội che giấu", "chịu trách nhiệm hình sự",
    "bị xử lý theo pháp luật", "bị truy tố nếu không phối hợp"
]

PRIZE_SCAM_KEYWORDS = [
    "chúc mừng bạn đã trúng thưởng", "xin chúc mừng", "chúc mừng khách hàng may mắn", "bạn là người chiến thắng",
    "bạn đã được chọn", "may mắn nhất hôm nay", "người thứ 1 triệu", "khách hàng vàng", "thành viên đặc biệt",
    "được chọn ngẫu nhiên", "quay số trúng", "số điện thoại may mắn", "sim may mắn", "tài khoản may mắn", "ID trúng thưởng",
    "username trúng giải", "giải độc đắc", "giải siêu khủng", "giải khổng lồ", "giá trị lên đến", "trị giá", "tổng giá trị",
    "quà tặng trị giá 500 triệu", "phần thưởng khủng", "quà siêu to", "giải thưởng cực lớn", "chưa từng có",
    "lần đầu tiên trong lịch sử", "phá kỷ lục", "kỷ lục mới", "cao nhất từ trước đến nay", "lớn nhất năm", "sự kiện lịch sử",
    "chương trình khủng nhất", "nhận ngay", "nhận thưởng ngay hôm nay", "về tay ngay", "có luôn trong hôm nay",
    "được giao tận nhà", "ship tận nơi miễn phí", "hoàn toàn miễn phí", "100% miễn phí", "không mất phí",
    "không tốn đồng nào", "chỉ cần xác nhận", "chỉ cần điền thông tin", "cung cấp thông tin cá nhân",
    "gửi CMND và sổ hộ khẩu", "chụp ảnh giấy tờ", "xác minh danh tính", "cập nhật địa chỉ", "cập nhật tài khoản ngân hàng",
    "nhận tiền về tài khoản", "chuyển khoản trong hôm nay", "thanh toán ngay", "nhưng cần đóng phí", "có một khoản phí nhỏ",
    "phí xử lý 500k", "phí vận chuyển 300k", "lệ phí hành chính 1 triệu", "thuế 10%", "thuế VAT", "phí kích hoạt giải thưởng",
    "phí mở khóa", "chi phí công chứng", "phí xác thực", "tiền bảo lãnh", "tiền đặt cọc giữ giải", "cần ứng trước",
    "chuyển trước nhận sau", "không chuyển sẽ mất giải", "không xác nhận sẽ hủy", "quá hạn sẽ trao cho người khác",
    "hết thời gian chờ", "chỉ còn 2 giờ", "chỉ còn 60 phút", "đếm ngược thời gian", "sắp hết hạn", "thời hạn cuối",
    "đây là cơ hội cuối cùng", "không có lần thứ 2", "bỏ lỡ sẽ rất tiếc", "tiếc cả đời", "hối hận mãi", "người khác đang chờ",
    "nhiều người muốn nhận", "hàng ngàn người mơ ước", "hiếm có khó tìm", "ngàn năm có một", "trăm năm có một",
    "nhất định phải nhận", "đừng bỏ qua", "nhanh tay lên", "mau lên kẻo lỡ", "hãy hành động ngay", "quyết định ngay",
    "trả lời ngay", "phản hồi trong 10 phút", "gọi lại số này ngay", "nhắn tin xác nhận ngay", "giải cứu giải thưởng",
    "hỗ trợ nhận giải", "dịch vụ nhận thưởng hộ", "đại diện nhận giải", "ủy quyền nhận thưởng", "tư vấn nhận giải",
    "hướng dẫn lĩnh thưởng", "giải thưởng bị treo", "giải bị đóng băng", "giải bị tạm giữ", "giải bị kẹt",
    "cần mở khóa giải thưởng", "kích hoạt giải thưởng", "giải phóng giải thưởng", "xử lý giải thưởng",
    "thông quan giải thưởng", "giải quyết thủ tục", "hoàn tất hồ sơ", "bổ sung giấy tờ", "cập nhật thông tin đầy đủ",
    "xác minh chính xác", "đối chiếu thông tin", "thẩm định hồ sơ trúng thưởng", "kiểm tra tính hợp lệ",
    "xác nhận đủ điều kiện", "giải thưởng hợp pháp", "nguồn gốc minh bạch", "chương trình được cấp phép",
    "do nhà nước quản lý", "bộ tài chính giám sát", "cục quản lý giải thưởng", "phòng quản lý chương trình",
    "ủy ban giám sát", "hội đồng trao giải", "ban tổ chức chương trình", "đơn vị phát hành giải", "nhà tài trợ chính",
    "công ty bảo hiểm giải thưởng", "bảo lãnh giải thưởng", "quỹ chi trả giải", "tài khoản giải thưởng",
    "nguồn tiền đã sẵn sàng", "tiền đã được duyệt", "đã chuyển vào hệ thống", "đang chờ giải ngân", "sẵn sàng chuyển khoản",
    "nhưng có lỗi hệ thống", "lỗi kỹ thuật", "gặp sự cố", "cần khắc phục", "cần bảo trì", "cần nâng cấp",
    "cần đồng bộ dữ liệu", "cần cập nhật thông tin ngân hàng", "ngân hàng bạn chưa liên kết", "tài khoản chưa xác thực",
    "cần xác thực tài khoản nhận", "cần kích hoạt tài khoản", "tài khoản chưa đủ hạng", "nâng cấp tài khoản lên VIP",
    "mở tài khoản cao cấp", "tài khoản thường không nhận được", "cần tài khoản đặc biệt", "yêu cầu tài khoản doanh nghiệp",
    "chỉ chuyển cho tài khoản xác minh", "phải là tài khoản lâu năm", "tài khoản phải có giao dịch",
    "số dư tối thiểu 1 triệu", "cần có tiền trong tài khoản để xác minh", "chứng minh khả năng tài chính",
    "xác nhận có khả năng nhận", "đảm bảo an toàn giao dịch", "bảo mật khi chuyển tiền lớn", "giao dịch lớn cần xác thực",
    "chuyển tiền trên 100 triệu cần phí", "thuế giải thưởng cao", "giải trên 50 triệu phải đóng thuế trước",
    "thuế TNCN 10%", "nộp thuế mới nhận giải", "sau khi nộp thuế sẽ hoàn lại", "chỉ ứng trước", "hoàn trả sau khi nhận giải",
    "bù trừ vào giải thưởng", "trừ trực tiếp vào số tiền", "nhận ròng sau thuế", "số tiền thực nhận", "giải thưởng sau thuế",
    "tiền về tay", "tiền vào ví", "tiền vào tài khoản", "kiểm tra ngay tài khoản", "tiền đã về", "đã chuyển thành công",
    "giao dịch thành công", "vui lòng kiểm tra", "xác nhận đã nhận", "báo lại khi nhận được", "phản hồi kết quả",
    "nếu chưa về thì liên hệ lại", "có vấn đề gì liên hệ hotline"
]

TELCO_SCAM_KEYWORDS = [
    "tài khoản sắp bị khóa", "SIM sắp bị thu hồi", "thuê bao sắp hết hạn", "sắp ngừng hoạt động", "cần cập nhật ngay",
    "cần xác thực ngay", "cập nhật trong 24h", "không cập nhật sẽ mất số", "không xác thực sẽ khóa", "bỏ qua sẽ không dùng được",
    "mất quyền sử dụng", "vi phạm chính sách", "vi phạm điều khoản", "sử dụng sai mục đích", "phát hiện hành vi bất thường",
    "giao dịch nghi vấn", "đăng nhập từ thiết bị lạ", "có người truy cập trái phép", "tài khoản bị xâm nhập",
    "phát hiện đăng nhập lạ", "bảo mật tài khoản", "khóa tạm thời để bảo vệ", "cần mở khóa ngay", "xác minh để mở lại",
    "gửi thông tin xác minh", "cung cấp mã OTP", "cung cấp mã PIN", "gửi số CMND", "chụp ảnh thẻ căn cước",
    "selfie cầm CMND", "truy cập link để xác thực", "nhấn vào link ngay", "tải app chính thức", "cài đặt ứng dụng mới",
    "phiên bản cập nhật", "bản cập nhật bảo mật", "cần cài đặt ngay", "không cài sẽ lỗi", "không cập nhật sẽ không dùng được",
    "ưu đãi độc quyền", "khuyến mãi giới hạn", "chỉ dành cho bạn", "khách hàng thân thiết", "được chọn đặc biệt",
    "tặng gói cước 12 tháng", "miễn phí 1 năm", "data không giới hạn miễn phí", "tặng 100GB", "tặng 1000 phút gọi",
    "ưu đãi không thể bỏ lỡ", "giá shock", "giảm giá sốc", "chỉ hôm nay", "flash sale", "sale khủng", "giảm đến 90%",
    "giảm cực mạnh", "rẻ vô đối", "chưa từng có", "không thể tin được", "đơn hàng đang chờ", "bạn có đơn hàng chưa thanh toán",
    "đơn hàng sắp hủy", "hủy đơn nếu không thanh toán", "vui lòng thanh toán ngay", "chuyển khoản ngay", "đơn hàng COD",
    "shipper đang đợi", "tài xế đang gọi", "không liên lạc được", "giao hàng thất bại", "cần xác nhận địa chỉ",
    "địa chỉ sai", "sai số điện thoại", "cập nhật thông tin giao hàng", "phụ phí giao hàng", "thiếu tiền ship",
    "cần bổ sung phí", "đơn thiếu tiền", "bù thêm tiền COD", "đơn hàng bị giữ tại bưu cục", "hàng bị tạm giữ",
    "cần nộp phụ phí", "phí lưu kho", "phí lưu bưu cục", "vượt quá thời gian miễn phí", "tính phí lưu hàng",
    "hàng sẽ bị trả về", "không nhận sẽ hủy", "xác nhận nhận hàng", "đánh giá sản phẩm để nhận thưởng", "review 5 sao nhận 100k",
    "chia sẻ để nhận voucher", "mời bạn bè nhận quà", "giới thiệu nhận hoa hồng", "trở thành cộng tác viên",
    "kiếm tiền từ giới thiệu", "không cần vốn", "không cần kỹ năng", "làm việc tự do không ràng buộc", "khôi phục tài khoản",
    "lấy lại mật khẩu", "reset tài khoản", "mở khóa thuê bao", "gỡ khóa SIM", "mở lại số bị khóa", "kích hoạt lại SIM cũ",
    "phục hồi số đã hủy", "lấy lại số đã mất", "đòi lại số bị thu hồi", "tranh chấp quyền sở hữu số", "chứng minh quyền sở hữu",
    "giấy tờ chủ sở hữu", "hợp đồng thuê bao gốc", "đăng ký ban đầu", "người đăng ký đầu tiên", "chủ thuê bao hợp pháp",
    "quyền sử dụng số", "quyền lợi khách hàng", "bảo vệ quyền lợi", "khiếu nại nhà mạng", "khiếu nại dịch vụ",
    "đòi bồi thường", "yêu cầu bồi thường thiệt hại", "mất cước oan", "trừ tiền không rõ nguyên nhân", "giao dịch lạ",
    "phát sinh cước bất thường", "bị tính phí sai", "tính tiền nhiều hơn", "hoàn lại tiền cước", "hoàn phí",
    "hoàn trả giao dịch", "chính sách hoàn tiền", "đền bù cho khách hàng", "xin lỗi và bồi thường", "gửi lời xin lỗi",
    "thư xin lỗi chính thức", "thông báo lỗi hệ thống", "nhận lỗi của nhà mạng", "sự cố từ phía chúng tôi",
    "lỗi kỹ thuật đã khắc phục", "đã xử lý xong", "đã sửa lỗi", "đã nâng cấp hệ thống", "đã bảo trì xong",
    "dịch vụ đã hoạt động trở lại", "mạng đã ổn định", "tín hiệu đã tốt", "đường truyền đã mạnh", "băng thông đã cải thiện",
    "tốc độ đã nhanh hơn", "nâng cấp miễn phí", "tăng dung lượng miễn phí", "tặng thêm data", "bù đắp bằng data",
    "tặng gói cước bù", "miễn phí 1 tháng để bồi thường", "hoàn cước 3 tháng", "giảm giá đặc biệt", "ưu đãi riêng cho bạn",
    "khách hàng bị ảnh hưởng", "danh sách khách hàng bồi thường", "chương trình đền bù", "đợt chi trả bồi thường",
    "nhận bồi thường tại", "đến điểm giao dịch", "đến văn phòng nhà mạng", "mang theo CMND và hợp đồng",
    "chuẩn bị giấy tờ đầy đủ", "không cần đến trực tiếp", "làm việc qua hotline", "giải quyết qua tổng đài",
    "chuyển tiền bồi thường", "chi trả qua tài khoản", "chuyển khoản vào số bạn cung cấp", "nhập số tài khoản",
    "xác nhận thông tin tài khoản", "tên ngân hàng", "mã chi nhánh", "họ tên chủ tài khoản phải trùng với chủ thuê bao",
    "đối chiếu thông tin", "xác thực danh tính", "sinh trắc học khuôn mặt", "quét vân tay qua điện thoại",
    "xác thực giọng nói", "trả lời câu hỏi bảo mật", "nhập mã số bí mật", "mã số chỉ bạn biết",
    "mật khẩu đặt khi đăng ký", "câu trả lời bảo mật khi mở sim", "thông tin cá nhân nhạy cảm", "ngày tháng năm sinh",
    "nơi sinh", "quê quán", "nghề nghiệp", "nơi làm việc", "thu nhập hàng tháng", "mục đích sử dụng số",
    "lý do mở thuê bao"
]

# Map scam types to their keyword lists for dynamic generation
SCAM_KEYWORD_MAP = {
    "finance": FINANCE_SCAM_KEYWORDS,
    "public_service": PUBLIC_SERVICE_SCAM_KEYWORDS,
    "prize": PRIZE_SCAM_KEYWORDS,
    "telco": TELCO_SCAM_KEYWORDS,
    "promo": [],  # Original types can be extended or kept simple
    "real_estate": [],
    "loan": [],
    "scam_like": []
}

# ----------------------------
# Utilities
# ----------------------------

def set_seed(seed: Optional[int] = None):
    if seed is not None:
        random.seed(seed)

def random_date(start_year=2004, end_year=2025) -> str:
    year = random.randint(start_year, end_year)
    month = random.randint(1, 12)
    _, max_day = calendar.monthrange(year, month)
    day = random.randint(1, max_day)
    return f"{day:02d}/{month:02d}/{year}"

def random_time() -> str:
    return f"{random.randint(0,23):02d}:{random.randint(0,59):02d}"

def remove_diacritics(text: str) -> str:
    text = unicodedata.normalize("NFD", text)
    return re.sub(r"[\u0300-\u036f]", "", text)

def synonym_replace(text: str, prob=0.25) -> str:
    for src, tgt_list in SYNONYMS.items():
        if src in text and random.random() < prob:
            text = text.replace(src, random.choice(tgt_list))
    return text

def code_switch_replace(text: str, prob=0.15) -> str:
    for src, tgt_list in CODE_SWITCH.items():
        if src in text and random.random() < prob:
            text = re.sub(rf"\b{re.escape(src)}\b", random.choice(tgt_list), text, flags=re.IGNORECASE)
    return text

def random_casing(text: str, prob=0.35) -> str:
    r = random.random()
    if r < prob/3:
        return text.upper()
    if r < 2*prob/3:
        return text.lower()
    return text

def random_whitespace_noise(text: str, prob=0.2) -> str:
    if random.random() < prob:
        # chèn khoảng trắng ngẫu nhiên
        text = re.sub(r"\s+", " ", text).strip()
        parts = text.split(" ")
        for _ in range(random.randint(1, 3)):
            i = random.randint(0, len(parts)-1)
            parts[i] = parts[i] + (" " * random.randint(1, 3))
        text = " ".join(parts)
    return text

def inject_typo(text: str, prob=0.15) -> str:
    # bỏ dấu
    if random.random() < prob:
        text = remove_diacritics(text)
    # hoán vị ký tự
    if random.random() < prob and len(text) > 3:
        idx = random.randint(0, len(text)-2)
        lst = list(text)
        lst[idx], lst[idx+1] = lst[idx+1], lst[idx]
        text = "".join(lst)
    # kéo dài ký tự (đẹpppp)
    if random.random() < prob:
        text = re.sub(r"([aăâeêioôơuưy])", lambda m: m.group(1) * random.randint(1, 3), text, count=1, flags=re.IGNORECASE)
    return text

def random_punct_noise(text: str, prob=0.25) -> str:
    if random.random() < prob:
        punct = random.choice(["!!!", "...", "?!", "!!! 😍", "~~", "!!!🔥", "!!", "…"])
        text += punct
    # chèn dấu trong câu
    if random.random() < prob:
        text = text.replace(" ", random.choice([" ", "  ", " | ", " - ", " • "]))
    return text

def obfuscate_placeholder(text: str, prob=0.3) -> str:
    """
    Obfuscation kiểu dataset để model học: <URL> -> hxxp : // <URL> , dot, (.) ...
    (vẫn không tạo link thật)
    """
    if random.random() < prob:
        text = text.replace("<URL>", random.choice(["hxxp://<URL>", "<URL> (.)", "<U R L>", "link: <URL>"]))
    if random.random() < prob:
        text = text.replace("<PHONE>", random.choice(["<P H O N E>", "<PHONE> (hotline)", "0xxx-xxx-xxx", "<HOTLINE>"]))
    return text

def maybe_add_emoji(text: str, prob=0.6) -> str:
    if random.random() < prob:
        k = random.randint(1, 2)
        return text + " " + " ".join(random.choice(EMOJI_LIST) for _ in range(k))
    return text

def random_suffix(text: str, prob=0.25) -> str:
    if random.random() < prob:
        suffix = random.choice([" nha", " ạ", " nè", " hihi", " kk", " :)"])
        return text + suffix
    return text

def apply_noise_pipeline(text: str, profile: str = "medium") -> str:
    """
    profile: low / medium / high
    """
    if profile == "low":
        p_syn, p_typo, p_cs, p_ws, p_punct, p_obf = 0.15, 0.08, 0.08, 0.10, 0.12, 0.15
    elif profile == "high":
        p_syn, p_typo, p_cs, p_ws, p_punct, p_obf = 0.45, 0.30, 0.25, 0.25, 0.35, 0.45
    else:
        p_syn, p_typo, p_cs, p_ws, p_punct, p_obf = 0.28, 0.15, 0.15, 0.18, 0.22, 0.25

    text = synonym_replace(text, prob=p_syn)
    text = code_switch_replace(text, prob=p_cs)
    text = inject_typo(text, prob=p_typo)
    text = random_whitespace_noise(text, prob=p_ws)
    text = obfuscate_placeholder(text, prob=p_obf)
    text = random_casing(text, prob=0.35)
    text = random_punct_noise(text, prob=p_punct)
    text = maybe_add_emoji(text, prob=0.55)
    text = random_suffix(text, prob=0.25)
    return text.strip()

# ----------------------------
# Message generators
# ----------------------------

# Updated: Expanded spam templates with new types and dynamic keyword integration
SPAM_TEMPLATES_BY_TYPE: Dict[str, List[str]] = {
    "promo": [
        "Giảm giá {voucher} cho {product}, áp dụng {date}. Xem tại {url}. Liên hệ {phone}",
        "Flash sale {voucher} hôm nay, {offer} cực lớn cho {product}. Mở {url} để nhận ngay",
        "Tặng mã {voucher} khi đặt {product}. Đăng ký tại {url}",
        "Freeship + {voucher} cho đơn từ {money}. Nhận tại {url}",
    ],
    "real_estate": [
        "Mở bán {real_estate} vị trí đẹp, hỗ trợ 0% trong {time_window}. Liên hệ {phone}",
        "{real_estate} trung tâm, số lượng có hạn. Đăng ký xem thông tin {url}",
    ],
    "loan": [
        "Hỗ trợ {loan_term}, {loan_term2}. Đăng ký {url} hoặc liên hệ {phone}",
        "Cần tiền gấp? {loan_term} - {loan_term2}. Điền form {url}",
    ],
    "scam_like": [
        "Bạn vừa {scam_term} {prize}k. Vui lòng {action} qua {url} hoặc gọi {phone}",
        "Thông báo: tài khoản của bạn cần {action}. Truy cập {url} để xác minh",
    ],
    # New types based on "Lừa đảo .docx"
    "finance": [
        "{kw1} với {kw2}, {kw3}. Liên hệ {phone} để {kw4}",
        "Cơ hội {kw1} {kw2}, đảm bảo {kw3}. Đăng ký tại {url}",
        "{kw1} {money}, {kw2}. Chuyển khoản ngay để {kw3}",
    ],
    "public_service": [
        "{kw1} hồ sơ {kw2}, {kw3}. Liên hệ {phone}",
        "Giải quyết {kw1} nhanh chóng, {kw2}. Truy cập {url}",
        "Cần {kw1} để {kw2}, chuyển khoản {money} cho {kw3}",
    ],
    "prize": [
        "{kw1}! Bạn trúng {kw2} {money}. Xác nhận tại {url}",
        "Chúc mừng {kw1}, nhận {kw2} ngay. Liên hệ {phone} để {kw3}",
        "{kw1} {kw2}, nhưng cần {kw3} {money}",
    ],
    "telco": [
        "{kw1} sắp bị {kw2}, cần {kw3} ngay. Gọi {phone}",
        "Thông báo {kw1}, cập nhật tại {url} để {kw2}",
        "{kw1} {kw2}, chuyển {money} để {kw3}",
    ],
}

HAM_TEMPLATES_BY_TYPE: Dict[str, List[str]] = {
    "friend": [
        "Mai m thi rồi, t chúc m may mắn nha",
        "Tới muộn tí nha, kẹt xe {slang}",
        "Ê mai đi cf nhóm k? T 4h xong việc, qua đón nhé",
        "Trưa nay ăn gì zợ? Tao chán cơm vp {slang}",
        "Nhớ mang bài tập theo nha, ko là toi cả đám",
    ],
    "family": [
        "Con ơi mai ghé chợ mua 1 bó rau muống với 2 quả cà chua nha",
        "Ba chuyển tiền học rồi đó, kiểm tra xem vô tk chưa",
        "Tối về sớm nha, trời mưa đó",
    ],
    "transactional": [
        "Mã OTP của bạn là {otp}. Có hiệu lực trong 5 phút. Không chia sẻ mã này.",
        "Đơn hàng #{order_id} đã giao thành công. Cảm ơn bạn đã mua sắm!",
        "Bạn vừa thanh toán {money} lúc {time}. Số dư: {balance}.",
        "Thông báo: hệ thống sẽ bảo trì từ 0h đến 4h sáng mai.",
    ],
    "school_work": [
        "Các em lưu ý nộp bài giữa kỳ đúng hạn. Thầy không nhận file sau 23h ngày 15/05.",
        "Cả lớp note lại: Sáng mai học bù 7h30 tại D205.",
        "Nhớ kiểm tra lịch học tuần này trên cổng LMS nhé, có thay đổi môn.",
    ],
}

def pick_noise_profile() -> str:
    r = random.random()
    if r < 0.2:
        return "low"
    if r < 0.85:
        return "medium"
    return "high"

def gen_spam() -> Tuple[str, Dict]:
    spam_type = random.choice(list(SPAM_TEMPLATES_BY_TYPE.keys()))
    template = random.choice(SPAM_TEMPLATES_BY_TYPE[spam_type])

    # Select keywords dynamically if available for the type
    keywords = SCAM_KEYWORD_MAP.get(spam_type, [])
    kw_data = {}
    if keywords:
        num_kw = random.randint(3, 5)  # Pick 3-5 keywords for diversity
        selected_kw = random.sample(keywords, min(num_kw, len(keywords)))
        for i, kw in enumerate(selected_kw, 1):
            kw_data[f"kw{i}"] = kw

    data = {
        "voucher": random.choice(VOUCHER_LIST),
        "product": random.choice(PRODUCT_LIST),
        "real_estate": random.choice(REALESTATE_LIST),
        "offer": random.choice(OFFER_LIST),
        "money": random.choice(MONEY_LIST),
        "date": random_date(2004, 2025),
        "url": random.choice(URL_PLACEHOLDERS),
        "phone": random.choice(PHONE_PLACEHOLDERS),
        "time_window": random.choice(["7 ngày", "14 ngày", "tháng này", "cuối tuần này"]),
        "loan_term": random.choice(BANK_LOAN_TERMS),
        "loan_term2": random.choice(BANK_LOAN_TERMS),
        "scam_term": random.choice(SCAM_TERMS),
        "action": random.choice(["xác minh", "kích hoạt", "cập nhật", "liên kết", "đổi mật khẩu"]),
        "prize": random.choice([50, 100, 200, 500, 1000, 2000]),
        "slang": random.choice(SLANG),
        **kw_data  # Merge dynamic keywords
    }

    msg = template.format(**data)
    profile = pick_noise_profile()
    msg = apply_noise_pipeline(msg, profile=profile)

    meta = {
        "category": spam_type,
        "noise_profile": profile,
        "has_url": int("<URL>" in msg or "<LINK>" in msg or "<WEBSITE>" in msg),
        "has_phone": int("<PHONE>" in msg or "<HOTLINE>" in msg or "0xxx" in msg),
        "has_money": int(any(m in msg for m in MONEY_LIST)),
    }
    return msg, meta

def gen_ham() -> Tuple[str, Dict]:
    ham_type = random.choice(list(HAM_TEMPLATES_BY_TYPE.keys()))
    template = random.choice(HAM_TEMPLATES_BY_TYPE[ham_type])

    otp = random.randint(100000, 999999)
    order_id = random.randint(1000000, 9999999)
    balance = f"{random.randint(0,9)}.{random.randint(0,999):03d}.{random.randint(0,999):03d}đ"

    data = {
        "otp": otp,
        "order_id": order_id,
        "money": random.choice(MONEY_LIST),
        "time": random_time(),
        "balance": balance,
        "slang": random.choice(SLANG),
    }

    msg = template.format(**data)
    profile = pick_noise_profile()
    # ham nhiễu nhẹ hơn một chút để realistic
    if profile == "high":
        profile = "medium"
    msg = apply_noise_pipeline(msg, profile=profile)

    meta = {
        "category": ham_type,
        "noise_profile": profile,
        "has_url": 0,
        "has_phone": 0,
        "has_money": int(any(m in msg for m in MONEY_LIST)),
    }
    return msg, meta

def gen_spam() -> Tuple[str, Dict]:
    spam_type = random.choice(list(SPAM_TEMPLATES_BY_TYPE.keys()))
    
    # Chọn template
    template = random.choice(SPAM_TEMPLATES_BY_TYPE[spam_type])
    
    # Xác định số lượng kw cần thiết dựa trên template
    import re
    kw_placeholders = re.findall(r'\{kw(\d+)\}', template)
    if kw_placeholders:
        max_needed = max(int(num) for num in kw_placeholders)
        num_kw = max_needed
    else:
        num_kw = 0
    
    # Chọn keyword (nếu có)
    keywords = SCAM_KEYWORD_MAP.get(spam_type, [])
    kw_data = {}
    if keywords and num_kw > 0:
        # Chỉ lấy đủ số lượng cần, tránh dư/thiếu
        selected_kw = random.sample(keywords, min(num_kw, len(keywords)))
        for i, kw in enumerate(selected_kw, 1):
            kw_data[f"kw{i}"] = kw
    
    data = {
        "voucher": random.choice(VOUCHER_LIST),
        "product": random.choice(PRODUCT_LIST),
        "real_estate": random.choice(REALESTATE_LIST),
        "offer": random.choice(OFFER_LIST),
        "money": random.choice(MONEY_LIST),
        "date": random_date(2004, 2025),
        "url": random.choice(URL_PLACEHOLDERS),
        "phone": random.choice(PHONE_PLACEHOLDERS),
        "time_window": random.choice(["7 ngày", "14 ngày", "tháng này", "cuối tuần này"]),
        "loan_term": random.choice(BANK_LOAN_TERMS),
        "loan_term2": random.choice(BANK_LOAN_TERMS),
        "scam_term": random.choice(SCAM_TERMS),
        "action": random.choice(["xác minh", "kích hoạt", "cập nhật", "liên kết", "đổi mật khẩu"]),
        "prize": random.choice([50, 100, 200, 500, 1000, 2000]),
        "slang": random.choice(SLANG),
        **kw_data
    }

    # Nếu thiếu placeholder nào (do ít keyword hơn yêu cầu), thay bằng chuỗi mặc định
    # để tránh lỗi
    try:
        msg = template.format(**data)
    except KeyError as e:
        missing_key = str(e).strip("'")
        if missing_key.startswith("kw"):
            data[missing_key] = "[thông tin bổ sung]"
            msg = template.format(**data)
        else:
            raise  # các lỗi khác thì vẫn raise lên

    profile = pick_noise_profile()
    msg = apply_noise_pipeline(msg, profile=profile)

    meta = {
        "category": spam_type,
        "noise_profile": profile,
        "has_url": int(any(p in msg for p in ["<URL>", "<LINK>", "<WEBSITE>"])),
        "has_phone": int(any(p in msg for p in ["<PHONE>", "<HOTLINE>", "0xxx"])),
        "has_money": int(any(m in msg for m in MONEY_LIST)),
    }
    return msg, meta

# ----------------------------
# Dataset builder
# ----------------------------

@dataclass
class Sample:
    message: str
    label: str  # "spam" or "ham"
    category: str
    noise_profile: str
    has_url: int
    has_phone: int
    has_money: int

def generate_dataset(
    num_messages: int = 10000,
    spam_ratio: float = 0.3,
    seed: Optional[int] = 42
) -> List[Dict]:
    set_seed(seed)
    data: List[Sample] = []

    num_spam = int(num_messages * spam_ratio)
    num_ham = num_messages - num_spam

    for _ in range(num_spam):
        msg, meta = gen_spam()
        data.append(Sample(message=msg, label="spam", **meta))  # Changed label to "spam" for consistency

    for _ in range(num_ham):
        msg, meta = gen_ham()
        data.append(Sample(message=msg, label="ham", **meta))

    random.shuffle(data)
    return [asdict(x) for x in data]

if __name__ == "__main__":
    import pandas as pd

    dataset = generate_dataset(num_messages=50000, spam_ratio=0.3, seed=7)
    df = pd.DataFrame(dataset)

    df.to_csv("vietnamese_sms_dataset_richer_upgraded.csv", index=False, encoding="utf-8-sig")
    print("Saved: vietnamese_sms_dataset_richer_upgraded.csv")
    print(df.head(20))