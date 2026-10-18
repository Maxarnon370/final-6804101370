import { test, expect } from '@playwright/test';

test('UT-02: product button state Add to cart -> Remove -> Add to cart', {
    annotation: {
        type: 'description',
        description: 'ตรวจสอบสถานะปุ่ม Add to cart และ Remove รวมถึง Cart Badge'
    }
}, async ({ page }) => {

    await test.step('Login เข้าสู่ระบบ', async () => {
        await page.goto('https://www.saucedemo.com/');
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.locator('[data-test="login-button"]').click();

        // 🟢 Assertion: ตรวจสอบว่าเข้าสู่หน้า Inventory สำเร็จ
        await expect(page).toHaveURL(/.*inventory.html/);
    });

    await test.step('ตรวจสอบปุ่มก่อนเพิ่มสินค้า', async () => {
        // 🟢 Assertion: ตรวจสอบว่าสินค้า Sauce Labs Backpack แสดงปุ่ม Add to cart
        const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        await expect(addToCartButton).toBeVisible();
        await expect(addToCartButton).toHaveText('Add to cart');
    });

    await test.step('เพิ่มสินค้าเข้า Cart', async () => {
        // กดปุ่ม Add to cart
        await page.locator('[data-test="add-to-cart-sauce-labs-backpack"]').click();

        // 🟢 Assertion 1: ตรวจสอบว่าปุ่มเปลี่ยนเป็น Remove
        const removeButton = page.locator('[data-test="remove-sauce-labs-backpack"]');
        await expect(removeButton).toBeVisible();
        await expect(removeButton).toHaveText('Remove');

        // 🟢 Assertion 2: ตรวจสอบว่า Cart Badge แสดงเลข 1
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toHaveText('1');
    });

    await test.step('ลบสินค้าออกจาก Cart', async () => {
        // กดปุ่ม Remove
        await page.locator('[data-test="remove-sauce-labs-backpack"]').click();

        // 🟢 Assertion 1: ตรวจสอบว่าปุ่มกลับมาเป็น Add to cart
        const addToCartButton = page.locator('[data-test="add-to-cart-sauce-labs-backpack"]');
        await expect(addToCartButton).toBeVisible();
        await expect(addToCartButton).toHaveText('Add to cart');

        // 🟢 Assertion 2: ตรวจสอบว่า Cart Badge ไม่แสดงตัวเลขอีกต่อไป (Hidden)
        const cartBadge = page.locator('.shopping_cart_badge');
        await expect(cartBadge).toBeHidden();
    });

});