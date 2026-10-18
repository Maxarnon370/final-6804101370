import { test, expect } from '@playwright/test';

test('IT-01: top-down REAL Login -> browser-level Inventory STUB', {
    annotation: {
        type: 'description',
        description: 'ทดสอบ Login จริงร่วมกับ Inventory Stub ที่จำลองด้วย page.setContent()'
    }
}, async ({ page }) => {

    await test.step('Login ผ่านหน้าเว็บไซต์จริง', async () => {
        await page.goto('https://www.saucedemo.com/');
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        // 🟢 Assertion: ตรวจสอบว่า Login เข้าสู่หน้า Inventory จริงสำเร็จ
        await expect(page).toHaveURL(/.*inventory.html/);
    });

    await test.step('สร้าง Inventory Stub', async () => {
        // ใช้ page.setContent() สร้าง HTML จำลอง (Stub) สำหรับทดสอบ
        await page.setContent(`
      <html>
        <body>
          <h1 id="status">Mock Inventory Ready</h1>
          <div class="inventory_list">
            <div class="inventory_item">Mock Product 1</div>
            <div class="inventory_item">Mock Product 2</div>
          </div>
        </body>
      </html>
    `);
    });

    await test.step('ตรวจสอบผลจาก Stub', async () => {
        const statusHeader = page.locator('#status');
        const mockItems = page.locator('.inventory_item');

        // 🟢 Assertion 1: ตรวจสอบข้อความหัวข้อว่าแสดง 'Mock Inventory Ready'
        await expect(statusHeader).toHaveText('Mock Inventory Ready');

        // 🟢 Assertion 2: ตรวจสอบจำนวนสินค้าจำลองใน Stub ว่ามี 2 รายการ
        await expect(mockItems).toHaveCount(2);

        // 🟢 Assertion 3: ตรวจสอบชื่อสินค้าจำลองชิ้นแรก
        await expect(mockItems.first()).toHaveText('Mock Product 1');
    });

});