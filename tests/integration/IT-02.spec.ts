import { test, expect, BrowserContext, Page } from '@playwright/test';

// 🟢 Driver Helper Function: จำลองตั้งค่า Session Cookie เพื่อข้ามขั้นตอน Login
async function driverOpenInventory(context: BrowserContext): Promise<Page> {
    await context.addCookies([
        {
            name: 'session-username',
            value: 'standard_user',
            domain: 'www.saucedemo.com',
            path: '/',
        },
    ]);
    const page = await context.newPage();
    await page.goto('https://www.saucedemo.com/inventory.html');
    return page;
}

test('IT-02: DRIVER login state -> REAL Inventory and Cart', {
    annotation: {
        type: 'description',
        description: 'ใช้ Driver เตรียมสถานะ Login เพื่อทดสอบ Inventory และ Cart จริง'
    }
}, async ({ browser }) => {
    // สร้าง BrowserContext ใหม่ขึ้นมาจัดการด้วยตนเอง
    const context = await browser.newContext();
    let page: Page;

    try {
        await test.step('สร้าง Driver และเปิด Inventory', async () => {
            // เรียกใช้ driver helper function เพื่อเซ็ต Cookie และเปิดหน้า Inventory
            page = await driverOpenInventory(context);

            // 🟢 Assertion: ตรวจสอบว่าเปิดเข้าสู่หน้า Inventory จริงสำเร็จ
            await expect(page).toHaveURL(/.*inventory.html/);
        });

        await test.step('ตรวจสอบ Inventory จริง', async () => {
            const items = page.locator('.inventory_item');

            // 🟢 Assertion: ตรวจสอบว่าสินค้าในหน้า Inventory จริงมีครบ 6 รายการ
            await expect(items).toHaveCount(6);
        });

        await test.step('เพิ่มสินค้า 2 รายการ', async () => {
            // คลิกเพิ่มสินค้า Sauce Labs Backpack และ Bike Light
            await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
            await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

            // 🟢 Assertion: ตรวจสอบว่า Cart Badge แสดงตัวเลขเท่ากับ 2
            const cartBadge = page.locator('.shopping_cart_badge');
            await expect(cartBadge).toHaveText('2');
        });

        await test.step('ตรวจสอบสินค้าใน Cart', async () => {
            // กดเปิดหน้า ตะกร้าสินค้า (Cart)
            await page.locator('.shopping_cart_link').click();

            // 🟢 Assertion 1: ตรวจสอบว่าเปลี่ยนมาหน้า cart.html เรียบร้อย
            await expect(page).toHaveURL(/.*cart.html/);

            // 🟢 Assertion 2: ตรวจสอบรายการสินค้าทั้งสองในตะกร้า
            const cartItems = page.locator('.cart_item');
            await expect(cartItems).toHaveCount(2);
            await expect(page.locator('.inventory_item_name').nth(0)).toHaveText('Sauce Labs Backpack');
            await expect(page.locator('.inventory_item_name').nth(1)).toHaveText('Sauce Labs Bike Light');
        });

    } finally {
        // 🟢 ปิด BrowserContext ที่สร้างขึ้นเมื่อทดสอบเสร็จสิ้น
        await context.close();
    }
});