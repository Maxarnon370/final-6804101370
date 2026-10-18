import { test, expect } from '@playwright/test';

test('ST-02: checkout validation and recovery', {
    annotation: {
        type: 'description',
        description: 'ตรวจสอบ Checkout Validation และการแก้ไขข้อมูลจนสั่งซื้อสำเร็จ'
    }
}, async ({ page }) => {

    await test.step('Login เพิ่มสินค้า และเปิด Checkout', async () => {
        await page.goto('https://www.saucedemo.com/');
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        // เพิ่มสินค้าเข้า Cart
        await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();
        await page.locator('.shopping_cart_link').click();

        // กดปุ่ม Checkout เพื่อเข้าสู่หน้ากรอกข้อมูล
        await page.locator('[data-test="checkout"]').click();

        // 🟢 Assertion: ยืนยันว่าเข้าสู่หน้า Checkout Step One สำเร็จ
        await expect(page).toHaveURL(/.*checkout-step-one.html/);
    });

    await test.step('ตรวจสอบ First Name is required', async () => {
        // กด Continue โดยไม่กรอกข้อมูลใดๆ
        await page.locator('[data-test="continue"]').click();

        // 🟢 Assertion: ตรวจสอบข้อความแจ้งเตือน Error เมื่อไม่ได้กรอก First Name
        const errorMessage = page.locator('[data-test="error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Error: First Name is required');
    });

    await test.step('ตรวจสอบ Last Name is required', async () => {
        // กรอกเฉพาะ First Name แล้วกด Continue
        await page.locator('[data-test="firstName"]').fill('John');
        await page.locator('[data-test="continue"]').click();

        // 🟢 Assertion: ตรวจสอบข้อความแจ้งเตือน Error เมื่อไม่ได้กรอก Last Name
        const errorMessage = page.locator('[data-test="error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Error: Last Name is required');
    });

    await test.step('ตรวจสอบ Postal Code is required', async () => {
        // กรอก Last Name เพิ่มเติม แล้วกด Continue
        await page.locator('[data-test="lastName"]').fill('Doe');
        await page.locator('[data-test="continue"]').click();

        // 🟢 Assertion: ตรวจสอบข้อความแจ้งเตือน Error เมื่อไม่ได้กรอก Postal Code
        const errorMessage = page.locator('[data-test="error"]');
        await expect(errorMessage).toBeVisible();
        await expect(errorMessage).toContainText('Error: Postal Code is required');
    });

    await test.step('แก้ไขข้อมูลและสั่งซื้อสำเร็จ', async () => {
        // กรอก Postal Code ที่เหลือจนครบถ้วนแล้วกด Continue
        await page.locator('[data-test="postalCode"]').fill('10110');
        await page.locator('[data-test="continue"]').click();

        // 🟢 Assertion 1: ยืนยันว่าผ่าน Validation เข้าสู่หน้า Overview (Step Two)
        await expect(page).toHaveURL(/.*checkout-step-two.html/);

        // กด Finish เพื่อยืนยันการสั่งซื้อ
        await page.locator('[data-test="finish"]').click();

        // 🟢 Assertion 2: ยืนยันว่าสั่งซื้อสำเร็จและแสดงข้อความ Thank you for your order!
        await expect(page).toHaveURL(/.*checkout-complete.html/);
        const completeHeader = page.locator('.complete-header');
        await expect(completeHeader).toBeVisible();
        await expect(completeHeader).toHaveText('Thank you for your order!');
    });

});