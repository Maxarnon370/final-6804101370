import { test, expect } from '@playwright/test';

test('ST-01: complete purchase of two products', {
    annotation: {
        type: 'description',
        description: 'ทดสอบการซื้อ Backpack และ Bike Light ตั้งแต่ Login จนสั่งซื้อสำเร็จ'
    }
}, async ({ page }) => {

    await test.step('Login และตรวจสอบ Inventory', async () => {
        await page.goto('https://www.saucedemo.com/');
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        // 🟢 Assertion: ยืนยันว่า Login เข้าสู่หน้า Inventory เรียบร้อย
        await expect(page).toHaveURL(/.*inventory.html/);
        await expect(page.locator('.title')).toHaveText('Products');
    });

    await test.step('เพิ่มสินค้าสองรายการ', async () => {
        await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        await page.locator('[data-test="add-to-cart-sauce-labs-bike-light"]').click();

        // 🟢 Assertion: ตรวจสอบว่า Cart Badge แสดงตัวเลข 2
        await expect(page.locator('.shopping_cart_badge')).toHaveText('2');
    });

    await test.step('ตรวจสอบ Cart', async () => {
        await page.locator('.shopping_cart_link').click();

        // 🟢 Assertion: ตรวจสอบว่าเปิดหน้า Cart และมีสินค้า 2 ชิ้นตามที่เลือก
        await expect(page).toHaveURL(/.*cart.html/);
        const cartItems = page.locator('.cart_item');
        await expect(cartItems).toHaveCount(2);
        await expect(page.locator('.inventory_item_name').nth(0)).toHaveText('Sauce Labs Backpack');
        await expect(page.locator('.inventory_item_name').nth(1)).toHaveText('Sauce Labs Bike Light');
    });

    await test.step('กรอก Checkout Information', async () => {
        await page.locator('[data-test="checkout"]').click();

        // 🟢 Assertion: ตรวจสอบว่าเข้าหน้า Checkout Step One
        await expect(page).toHaveURL(/.*checkout-step-one.html/);

        // กรอกข้อมูลลูกค้า
        await page.locator('[data-test="firstName"]').fill('John');
        await page.locator('[data-test="lastName"]').fill('Doe');
        await page.locator('[data-test="postalCode"]').fill('10110');
        await page.locator('[data-test="continue"]').click();
    });

    await test.step('ตรวจสอบ Overview และสั่งซื้อ', async () => {
        // 🟢 Assertion 1: ยืนยันว่าอยู่หน้า Checkout Step Two (Overview)
        await expect(page).toHaveURL(/.*checkout-step-two.html/);

        // 🟢 Assertion 2: ตรวจสอบรายการสินค้าก่อนกดยืนยัน
        const overviewItems = page.locator('.cart_item');
        await expect(overviewItems).toHaveCount(2);

        // กดสั่งซื้อสินค้า
        await page.locator('[data-test="finish"]').click();
    });

    await test.step('ตรวจสอบ Order Complete', async () => {
        // 🟢 Assertion 1: ยืนยันว่าเข้าสู่หน้า Checkout Complete
        await expect(page).toHaveURL(/.*checkout-complete.html/);

        // 🟢 Assertion 2: ตรวจสอบข้อความแจ้งเตือนความสำเร็จ
        const completeHeader = page.locator('.complete-header');
        await expect(completeHeader).toBeVisible();
        await expect(completeHeader).toHaveText('Thank you for your order!');
    });

});