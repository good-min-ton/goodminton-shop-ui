/**
 * Nút hiện/ẩn nằm trong components/ui/input.tsx nên mọi ô mật khẩu của dự án
 * đều dùng chung một đường mã. Test đặt ở trang đăng nhập là đủ đại diện.
 *
 * Neo ^ trong getByLabel là bắt buộc: tên khả truy cập của nút là "Hiện mật
 * khẩu", nên /Mật khẩu/ không neo sẽ khớp cả ô lẫn nút.
 */
import { test, expect } from '@playwright/test';

type Probe = { __submitted?: boolean };

test('a password field starts masked and the toggle reveals it', async ({
  page,
}) => {
  await page.goto('/login');

  const field = page.getByLabel(/^Mật khẩu/);
  await field.fill('MatKhauBiMat123');
  await expect(field).toHaveAttribute('type', 'password');

  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();

  // type phải đổi hẳn: giữ type="password" thì trình duyệt vẫn che ký tự, bất
  // kể CSS làm gì.
  await expect(field).toHaveAttribute('type', 'text');
  await expect(field).toHaveValue('MatKhauBiMat123');

  await page.getByRole('button', { name: 'Ẩn mật khẩu' }).click();
  await expect(field).toHaveAttribute('type', 'password');
});

test('the toggle does not submit the form it sits in', async ({ page }) => {
  await page.goto('/login');

  // Mặc định của <button> trong form là type="submit". Thiếu type="button" thì
  // bấm vào con mắt sẽ gửi biểu mẫu - hỏng theo cách chỉ lộ ra khi dùng thật.
  //
  // Bắt thẳng sự kiện submit chứ không suy từ thông báo lỗi hiện ra: bản đầu
  // của test này khẳng định "không thấy lỗi validation" và vẫn xanh cả khi đã
  // cố tình bỏ type="button".
  //
  // Phải chờ form xuất hiện trước khi gắn listener. Trang nằm trong
  // RedirectIfAuthed nên form chỉ được vẽ sau khi mount; gắn sớm hơn thì
  // querySelector trả về null và phép thử lặng lẽ không kiểm tra gì.
  await page.getByLabel(/^Mật khẩu/).fill('MatKhauBiMat123');
  await page.evaluate(() => {
    const form = document.querySelector('form');
    if (!form) throw new Error('chưa có form để theo dõi');
    (window as unknown as Probe).__submitted = false;
    form.addEventListener('submit', () => {
      (window as unknown as Probe).__submitted = true;
    });
  });

  await page.getByRole('button', { name: 'Hiện mật khẩu' }).click();

  expect(
    await page.evaluate(() => (window as unknown as Probe).__submitted),
  ).toBe(false);
  await expect(page.getByLabel(/^Mật khẩu/)).toHaveValue('MatKhauBiMat123');
});
