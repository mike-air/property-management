import { test, expect } from '@playwright/test'

test.describe('Complete Property Management Flow', () => {
  test('should complete full user journey', async ({ page }) => {
    // 1. Start at login page
    await page.goto('/login')
    await expect(page.getByRole('heading', { name: 'Sign in' })).toBeVisible()

    // 2. Login
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/properties')

    // 3. Verify properties list
    await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible()
    await expect(page.locator('tbody tr')).toHaveCount(7)

    // 4. Test search functionality
    await page.getByRole('combobox', { name: 'Type' }).selectOption('Rental')
    await page.getByRole('button', { name: 'Search Properties' }).click()
    await expect(page.locator('h2')).toContainText('Properties (2)')

    // 5. Clear search and view property details
    await page.getByRole('button', { name: 'Clear All' }).click()
    await page.locator('tbody tr').first().getByRole('button', { name: 'View' }).click()
    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible()

    // 6. Edit property
    await page.getByRole('button', { name: 'Edit Property' }).click()
    await expect(page).toHaveURL(/\/properties\/\d+\/edit/)
    await expect(page.getByRole('heading', { name: 'Edit Property' })).toBeVisible()
    await page.getByRole('combobox', { name: 'Status' }).selectOption('Available')
    await page.getByRole('button', { name: 'Save Property' }).click()
    await expect(page).toHaveURL('/properties')

    // 7. Go back to properties list
    await page.getByRole('button', { name: 'Back to Properties' }).click()
    await expect(page).toHaveURL('/properties')

    // 8. Add new property
    await page.getByRole('button', { name: 'Add Property' }).click()
    await expect(page).toHaveURL('/properties/add')

    await page
      .getByRole('textbox', { name: 'e.g., Ocean View Apartment' })
      .fill('E2E Complete Test Property')
    await page.getByRole('textbox', { name: 'Owner name' }).fill('E2E Test Owner')
    await page.getByRole('spinbutton', { name: 'Price' }).fill('2500')
    await page
      .getByRole('textbox', { name: 'Property address' })
      .fill('456 E2E Test Avenue, Test City, CA')
    await page.getByRole('spinbutton', { name: 'Bedrooms' }).fill('3')
    await page.getByRole('spinbutton', { name: 'Bathrooms' }).fill('2')
    await page.getByRole('spinbutton', { name: 'Square Feet' }).fill('1500')
    await page
      .getByRole('textbox', { name: 'Property description...' })
      .fill('Complete E2E test property')

    await page.getByRole('button', { name: 'Create Property' }).click()
    await expect(page).toHaveURL('/properties')

    // 9. Verify new property was created
    await expect(page.locator('text=E2E Complete Test Property')).toBeVisible()
    await expect(page.locator('text=E2E Test Owner')).toBeVisible()
    await expect(page.locator('text=$2,500/month')).toBeVisible()

    // 10. Test advanced search with new property
    await page.getByRole('button', { name: 'Expand' }).click()
    await page.getByRole('spinbutton', { name: 'Min Price' }).fill('2000')
    await page.getByRole('button', { name: 'Search Properties' }).click()

    // Should show properties with price >= 2000
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    expect(count).toBeGreaterThan(0)

    // 11. Logout
    await page.getByRole('button', { name: 'Logout' }).click()
    await expect(page).toHaveURL('/login')
    await expect(page.locator('h2')).toHaveText('Login')
  })
})
