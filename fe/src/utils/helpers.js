

export function debounce(fn, delay = 300) {
	let t = null;
	return (...args) => {
		clearTimeout(t);
		t = setTimeout(() => fn(...args), delay);
	};
}


// src/utils/voucherHelpers.js

// Định dạng tiền tệ VNĐ
export const formatCurrency = (value) => {
  if (!value && value !== 0) return '0 VNĐ';
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0,
  }).format(value);
};

// Định dạng ngày giờ
export const formatDate = (dateString) => {
  if (!dateString) return 'Chưa đặt';
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Định dạng mức giảm giá
export const formatDiscount = (voucher) => {
  if (!voucher) return '';
  if (voucher.discountType === 'percentage') {
    return `-${voucher.discountValue}%`;
  }
  return `-${formatCurrency(voucher.discountValue)}`;
};

// Lấy nhãn trạng thái (hết hạn / còn hạn)
export const getStatusLabel = (expiryDate) => {
  if (!expiryDate) return 'Không giới hạn';
  const now = new Date();
  const expiry = new Date(expiryDate);
  return now > expiry ? 'Hết hạn' : 'Còn hạn';
};

// Lấy class màu cho trạng thái
export const getStatusClass = (expiryDate) => {
  if (!expiryDate) return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
  const now = new Date();
  const expiry = new Date(expiryDate);
  return now > expiry
    ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    : 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
};