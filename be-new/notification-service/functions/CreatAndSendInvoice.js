// functions/CreateAndSendInvoice.js

const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const nodemailer = require('nodemailer');

// Thư mục lưu hóa đơn tạm (tự tạo nếu chưa có)
const INVOICE_DIR = path.join(__dirname, '..', 'invoices');
if (!fs.existsSync(INVOICE_DIR)) {
  fs.mkdirSync(INVOICE_DIR, { recursive: true });
}



// Thay toàn bộ phần tạo transporter cũ bằng cái này (đặt ở đầu file)

// === Ở ĐẦU FILE – TẠO TRANSPORTER DUY NHẤT, KHÔNG CLOSE BAO GIỜ ===
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,                    // STARTTLS
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD || process.env.GMAIL_PASS
  },
  // === Phần quan trọng để fix lỗi IPv6 ===
  family: 4,                        // Buộc dùng IPv4 (rất hiệu quả)
  
  // Các tùy chọn timeout & pool (giữ lại nhưng tối ưu hơn)
  pool: true,
  maxConnections: 5,
  maxMessages: Infinity,            // Thường nên để Infinity khi dùng pool
  connectionTimeout: 15000,
  greetingTimeout: 15000,
  socketTimeout: 30000,

  // Tùy chọn TLS an toàn hơn
  tls: {
    rejectUnauthorized: true,       // Nên để true nếu có thể (false chỉ để test)
    ciphers: 'SSLv3'                // Một số server cần cái này
  }
});

// Kiểm tra kết nối khi server khởi động
transporter.verify((err, success) => {
  if (err) {
    console.error('❌ Lỗi cấu hình email:', err);
  } else {
    console.log('✅ Transporter email sẵn sàng (kết nối tái sử dụng)');
  }
});



// Đường dẫn tài nguyên
const FONT_PATH = path.join(__dirname, 'DejaVuSans.ttf');
const LOGO_PATH = path.join(__dirname, 'logo1.jpg');

function generateInvoicePDF(invoiceData, outputPath) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const stream = fs.createWriteStream(outputPath);
    doc.pipe(stream);

    // Font tiếng Việt
    if (fs.existsSync(FONT_PATH)) {
      doc.registerFont('DejaVuSans', FONT_PATH);
      doc.font('DejaVuSans');
    } else {
      doc.font('Helvetica');
      console.warn('⚠️ DejaVuSans.ttf không tìm thấy – có thể bị lỗi font tiếng Việt');
    }

    // === HEADER ===
    if (fs.existsSync(LOGO_PATH)) {
      doc.image(LOGO_PATH, 50, 30, { width: 80 });
    }

    doc.fontSize(28).fillColor('#4e73df').text(invoiceData.company.name, 180, 50);
    doc.fontSize(12).fillColor('#999999').text(invoiceData.company.slogan || '', 180, 85);

    doc.fontSize(24).fillColor('#4e73df').text('HÓA ĐƠN', 50, 130, { align: 'center' });

    doc.fontSize(12).fillColor('black')
       .text(`Mã hóa đơn: ${invoiceData.invoiceNumber}`, 50, 170)
       .text(`Thời gian: ${invoiceData.date}`, 400, 170, { align: 'right', width: 150 });

    // === THÔNG TIN SHOP & KHÁCH HÀNG ===
    const infoY = 210;
    doc.fontSize(12).fillColor('#4e73df').text('Shop:', 50, infoY, { underline: true });
    doc.fillColor('black').text(invoiceData.company.name, 50, infoY + 20);
    doc.text(invoiceData.company.address || '', 50, infoY + 35);
doc.text(`sdt: ${invoiceData.company.phone || ''}`, 50, infoY + 50);
    doc.text(`Website: ${invoiceData.company.website || ''}`, 50, infoY + 65);
    doc.text(`Mã số thuế: ${invoiceData.company.taxCode || ''}`, 50, infoY + 80);

    doc.fillColor('#4e73df').text('Khách hàng:', 330, infoY, { underline: true });
    doc.fillColor('black').text(invoiceData.customer.name || 'Khách lẻ', 330, infoY + 20);
    doc.text(invoiceData.customer.address || '', 330, infoY + 35);
    doc.text(`sdt: ${invoiceData.customer.phone || ''}`, 330, infoY + 80);

    doc.strokeColor('#d3d3d3').lineWidth(1)
       .moveTo(50, infoY + 110).lineTo(550, infoY + 110).stroke();

    // === BẢNG SẢN PHẨM ===
    let tableTop = infoY + 130;
    const baseRowHeight = 40;
    const leftMargin = 50;
    const colWidths = [230, 50, 110, 130];
    const positions = [
      leftMargin,
      leftMargin + colWidths[0],
      leftMargin + colWidths[0] + colWidths[1] - 10,
      leftMargin + colWidths[0] + colWidths[1] + colWidths[2] - 10
    ];
    const tableWidth = colWidths.reduce((a, b) => a + b, 0);

    function drawTableHeader(y) {
      doc.fillColor('#d6e4f0').rect(leftMargin, y, tableWidth, baseRowHeight).fill();
      doc.fillColor('black').fontSize(12);
      doc.text('Sản phẩm', positions[0] + 15, y + 12);
      doc.text('SL', positions[1] + 12, y + 12);
      doc.text('Giá (VND)', positions[2] + 5, y + 12, { width: colWidths[2], align: 'right' });
      doc.text('Tổng (VND)', positions[3] + 5, y + 12, { width: colWidths[3], align: 'right' });
    }

    doc.fillColor('black').fontSize(11);
    let y = tableTop;
    drawTableHeader(y);
    y += baseRowHeight;

    (invoiceData.items || []).forEach((item, index) => {
      const descHeight = doc.heightOfString(item.description || item.name || 'Sản phẩm', { width: colWidths[0] - 20 });
      const rowH = Math.max(baseRowHeight, descHeight + 16);

      if (y + rowH > doc.page.height - 200) {
        doc.addPage();
        drawTableHeader(80);
        y = 80 + baseRowHeight;
      }

      if (index % 2 === 1) {
        doc.fillColor('#f2f9fc').rect(leftMargin, y, tableWidth, rowH).fill();
        doc.fillColor('black');
      }

      doc.strokeColor('#e0e0e0').lineWidth(0.5)
         .rect(leftMargin, y, tableWidth, rowH).stroke();

      doc.text(item.description || item.name || 'Sản phẩm', positions[0] + 10, y + 8, { width: colWidths[0] - 20 });
      doc.text((item.quantity || 1).toString(), positions[1], y + 8, { width: colWidths[1], align: 'center' });
      doc.text((item.unitPrice || 0).toLocaleString('vi-VN'), positions[2], y + 8, { width: colWidths[2], align: 'right' });
      doc.text((item.total || item.unitPrice * item.quantity || 0).toLocaleString('vi-VN'), positions[3], y + 8, { width: colWidths[3], align: 'right' });

      y += rowH;
    });

    // === TỔNG CỘNG ===
    const lastY = y;
let totalY = lastY + 30;
    if (totalY + 140 > doc.page.height - 50) {
      doc.addPage();
      totalY = 80;
    }

    doc.fillColor('#f2f9fc').rect(300, totalY - 10, 250, 110).fill();

    doc.fillColor('black').fontSize(13)
       .text('Tổng đơn hàng:', 310, totalY)
       .text(`${(invoiceData.subtotal || 0).toLocaleString('vi-VN')} VND`, 420, totalY, { align: 'right' });

    doc.text('giảm giá:', 310, totalY + 30)
    .text(`${(invoiceData.discount || 0).toLocaleString('vi-VN')} VND`, 420, totalY + 30, { align: 'right' });

    doc.text('VAT (10%):', 310, totalY + 50)
       .text(`${(invoiceData.tax || 0).toLocaleString('vi-VN')} VND`, 420, totalY + 50, { align: 'right' });

    doc.fontSize(18).fillColor('#4e73df')
       .text('TOTAL:', 310, totalY + 70)
       .text(`${(invoiceData.total + invoiceData.tax || 0).toLocaleString('vi-VN')} VND`, 380, totalY + 70, { width: 150, align: 'center' });

    // === FOOTER ===
    let noteY = totalY + 120;
    if (noteY + 80 > doc.page.height - 50) {
      doc.addPage();
      noteY = 80;
    }

    doc.fontSize(11).fillColor('#999999')
       .text(invoiceData.notes || 'Cảm ơn quý khách đã mua sắm!', 50, noteY, { align: 'left', width: 500 });

    doc.fontSize(12).fillColor('#4e73df')
       .text('Cảm ơn quý khách đã mua sắm tại GOGHEVENT Fashion!', 50, doc.page.height - 100, { align: 'center', width: 500 });

    doc.end();

    stream.on('finish', () => resolve(outputPath));
    stream.on('error', reject);
  });
}

async function sendInvoiceEmail(pdfPath, customerEmail, invoiceData) {
//   const transporter = getTransporter();

  const mailOptions = {
    from: `"${invoiceData.company.name}" <${process.env.GMAIL_USER}>`,
    to: customerEmail,
    subject: `Hóa đơn ${invoiceData.invoiceNumber} - ${invoiceData.company.name}`,
    text: `Kính gửi quý khách ${invoiceData.customer.name},\n\nĐính kèm là hóa đơn mua hàng của quý khách tại ${invoiceData.company.name}.\n\nTrân trọng,\n${invoiceData.company.name}`,
    attachments: [{
      filename: `HoaDon_${invoiceData.invoiceNumber}.pdf`,
      path: pdfPath
    }]
  };

  await transporter.sendMail(mailOptions);
}

async function createAndSendInvoice(invoiceData) {
  if (!invoiceData || !invoiceData.invoiceNumber || !invoiceData.customer?.email) {
    throw new Error('Dữ liệu hóa đơn không hợp lệ');
  }

  const pdfPath = path.join(INVOICE_DIR, `hoa-don-${invoiceData.invoiceNumber}.pdf`);
  console.log("1. Bắt đầu tạo PDF");

  try {
    await generateInvoicePDF(invoiceData, pdfPath);
    console.log("2. Đã tạo PDF xong, chuẩn bị gửi Email");

    await sendInvoiceEmail(pdfPath, invoiceData.customer.email, invoiceData);
    console.log("3. Đã gọi hàm gửi Email thành công");

    // Xóa file tạm sau khi gửi
    if (fs.existsSync(pdfPath)) {
      fs.unlinkSync(pdfPath);
      console.log('🗑️ Đã xóa file PDF tạm');
    }
    return { success: true, message: 'Gửi hóa đơn thành công' };
  } catch (error) {
    // Cleanup nếu lỗi
if (fs.existsSync(pdfPath)) fs.unlinkSync(pdfPath);
    console.error('❌ Lỗi tạo/gửi hóa đơn:', error);
    throw error; // Quan trọng: để controller bắt được
  }
}

async function sendPasswordEmail(userEmail, password, userName = '') {
  // const transporter = getTransporter(); // giữ nguyên như cũ

  const companyName = process.env.COMPANY_NAME || 'Công ty của bạn';
  const supportEmail = process.env.SUPPORT_EMAIL || process.env.GMAIL_USER;

  const mailOptions = {
    from: `"${companyName}" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: `Mật khẩu tài khoản ${companyName} của bạn`,
    html: `
      <!DOCTYPE html>
      <html lang="vi">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Mật khẩu tài khoản</title>
      </head>
      <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: Arial, Helvetica, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #f4f7fa; padding: 40px 0;">
          <tr>
            <td align="center">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">
                
                <!-- Header -->
                <tr>
                  <td style="background-color: #2563eb; padding: 30px 40px; text-align: center;">
                    <h1 style="color: #ffffff; margin: 0; font-size: 28px;">${companyName}</h1>
                  </td>
                </tr>

                <!-- Content -->
                <tr>
                  <td style="padding: 40px;">
                    <h2 style="color: #1f2937; margin-top: 0; font-size: 24px;">Chào ${userName || 'bạn'},</h2>
                    
                    <p style="color: #374151; font-size: 16px; line-height: 1.6;">
                      Tài khoản của bạn đã được tạo/thiết lập thành công. Dưới đây là mật khẩu tạm thời:
                    </p>

                    <!-- Password Box -->
                    <div style="background-color: #f8fafc; border: 2px dashed #64748b; border-radius: 8px; padding: 20px; text-align: center; margin: 25px 0;">
                      <p style="margin: 0 0 8px 0; color: #64748b; font-size: 14px;">MẬT KHẨU TẠM THỜI</p>
                      <p style="margin: 0; font-size: 26px; font-weight: bold; letter-spacing: 4px; color: #1e40af; font-family: monospace;">
                        ${password}
                      </p>
                    </div>

                    <p style="color: #ef4444; font-weight: 600; background-color: #fee2e2; padding: 12px 16px; border-radius: 8px; border-left: 4px solid #ef4444;">
                      ⚠️ Vui lòng đổi mật khẩu ngay sau khi đăng nhập lần đầu để đảm bảo an toàn cho tài khoản.
                    </p>

                    <p style="color: #374151; font-size: 16px; line-height: 1.6; margin-top: 30px;">
                      Nếu bạn không phải là người yêu cầu tạo tài khoản này, vui lòng liên hệ ngay với chúng tôi để được hỗ trợ.
                    </p>
                  </td>
                </tr>

                <!-- Footer -->
                <tr>
                  <td style="background-color: #f8fafc; padding: 30px 40px; text-align: center; border-top: 1px solid #e5e7eb;">
                    <p style="margin: 0; color: #6b7280; font-size: 14px;">
                      Trân trọng,<br>
                      <strong>Đội ngũ ${companyName}</strong>
                    </p>
                    <p style="margin: 15px 0 0 0; color: #9ca3af; font-size: 13px;">
                      Nếu cần hỗ trợ, hãy liên hệ: <a href="mailto:${supportEmail}" style="color: #2563eb; text-decoration: none;">${supportEmail}</a>
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Signature -->
              <p style="margin-top: 20px; color: #9ca3af; font-size: 12px;">
                Email này được gửi tự động. Vui lòng không trả lời trực tiếp.
              </p>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `,
    text: `Mật khẩu tài khoản của bạn là: ${password}\n\nVui lòng đổi mật khẩu ngay sau khi đăng nhập để đảm bảo an toàn.` // fallback cho client không hỗ trợ HTML
  };

  await transporter.sendMail(mailOptions);
  return { success: true, message: 'Email đã được gửi thành công' };
}

async function sendActivationOTP(userEmail, otp) {
  // Nếu transporter chưa được khai báo ở đầu file, bạn có thể dùng getTransporter() như hàm cũ
  // const transporter = getTransporter();

  const mailOptions = {
    from: `"${process.env.COMPANY_NAME}" <${process.env.GMAIL_USER}>`,
    to: userEmail,
    subject: 'Mã kích hoạt tài khoản của bạn',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
        <h2 style="color: #2563eb;">Xác thực email đăng ký</h2>
        <p>Chào bạn,</p>
        <p>Chúng tôi đã nhận được yêu cầu đăng ký tài khoản. Đây là mã kích hoạt (OTP) của bạn:</p>
        
        <div style="background-color: #f8fafc; padding: 20px; text-align: center; font-size: 32px; letter-spacing: 8px; font-weight: bold; color: #1e40af; margin: 20px 0; border-radius: 6px;">
          ${otp}
        </div>

        <p><strong>Mã này sẽ hết hạn sau 10 phút.</strong></p>
        <p>Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
        
        <p style="margin-top: 30px; font-size: 14px; color: #64748b;">
          Nếu bạn không thực hiện đăng ký, vui lòng bỏ qua email này.
        </p>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Đã gửi OTP đến: ${userEmail}`);
    return { success: true };
  } catch (error) {
    console.error('Lỗi gửi OTP email:', error);
    throw error; // Để controller bắt lỗi
  }
}

module.exports = {
  createAndSendInvoice,
  sendPasswordEmail,
  sendActivationOTP
};