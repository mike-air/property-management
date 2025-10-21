import { test, expect } from '@playwright/test'

test.describe('Authentication', () => {
  test('should display login page when not authenticated', async ({ page }) => {
    await page.goto('/properties')

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in login form
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')

    // Click sign in button
    await page.getByRole('button', { name: 'Continue' }).click()

    // Should redirect to properties page
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible()

    // Wait for navigation to be visible and check user email
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('nav').getByText('admin@example.com')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login')

    // Fill in invalid credentials
    await page.getByRole('textbox', { name: 'Email' }).fill('invalid@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('wrongpassword')

    // Click sign in button
    await page.getByRole('button', { name: 'Continue' }).click()

    // Should stay on login page
    await expect(page).toHaveURL('/login')
  })

  test('should logout successfully', async ({ page }) => {
    // First login
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Verify we're logged in
    await expect(page).toHaveURL('/properties')

    // Click logout button
    await page.getByRole('button', { name: 'Logout' }).click()

    // Should redirect to login page
    await expect(page).toHaveURL('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()
  })

  test('should persist login state on page refresh', async ({ page }) => {
    // Login
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Continue' }).click()

    // Verify we're on properties page
    await expect(page).toHaveURL('/properties')

    // Refresh the page
    await page.reload()

    // Should still be logged in
    await expect(page).toHaveURL('/properties')
    await expect(page.locator('nav')).toBeVisible()
    await expect(page.locator('nav').getByText('admin@example.com')).toBeVisible()
  })
})
