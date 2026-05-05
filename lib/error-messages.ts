/**
 * Map error code → user-friendly Vietnamese message.
 * Reference: docs/api-docs.md § 14
 */

export const ERROR_MESSAGES: Record<number, string> = {
  // Auth (1001-1100)
  1001: "Email đã được sử dụng",
  1002: "Số điện thoại đã được sử dụng",
  1003: "Email/SĐT hoặc mật khẩu không đúng",
  1004: "Bạn không có quyền thực hiện hành động này",
  1005: "Vui lòng đăng nhập để tiếp tục",
  1011: "Tài khoản của bạn đã bị khoá",

  // JWT (1101-1200)
  1102: "Phiên đăng nhập không hợp lệ",
  1103: "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại",

  // Account (1201-1300)
  1201: "Không tìm thấy tài khoản",

  // Store (1301-1400)
  1301: "Không tìm thấy cửa hàng",
  1310: "Hệ thống chưa cấu hình kho trung tâm. Vui lòng liên hệ quản trị viên.",

  // Product (1501-1600)
  1501: "Sản phẩm không tồn tại",
  1507: "Slug đã được sử dụng",
  1508: "Chỉ được liên kết với sản phẩm gốc",

  // Variant (1901-2000)
  1907: "SKU đã được sử dụng",

  // Inventory (2201-2300)
  2201: "Không tìm thấy kho hàng này",
  2202: "Sản phẩm chưa có sẵn ở kho này",

  // Order (2301-2400)
  2301: "Không tìm thấy đơn hàng",
  2302: "Số lượng hàng trong kho không đủ",
  2303: "Trạng thái đơn hàng không hợp lệ",
  2304: "Không thể huỷ đơn ở trạng thái hiện tại",
  2305: "Bạn không có quyền truy cập đơn hàng này",

  // Payment (2401-2500)
  2402: "Đơn hàng đã được thanh toán",
  2404: "Chữ ký VNPay không hợp lệ",

  // Review (2501-2600)
  2504: "Bạn đã đánh giá sản phẩm này rồi",

  // File (9101-9200)
  9101: "Vui lòng chọn file",
  9102: "Loại file không được hỗ trợ",
  9104: "File vượt quá dung lượng cho phép",
};

const DEFAULT_MESSAGE = "Đã có lỗi xảy ra. Vui lòng thử lại.";

export function getErrorMessage(
  code: number | undefined | null,
  fallback?: string,
): string {
  if (code == null) return fallback || DEFAULT_MESSAGE;
  return ERROR_MESSAGES[code] || fallback || DEFAULT_MESSAGE;
}
