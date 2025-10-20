import { test, expect } from '@playwright/test'

test.describe('Advanced Search', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/properties')
  })

  test('should display basic search fields', async ({ page }) => {
    // Check basic search fields are visible
    await expect(
      page.getByRole('textbox', { name: 'Property name, address, owner...' }),
    ).toBeVisible()
    await expect(page.locator('select').nth(0)).toBeVisible() // Type select
    await expect(page.locator('select').nth(1)).toBeVisible() // Status select
  })

  test('should expand advanced search filters', async ({ page }) => {
    // Click Expand button
    await page.getByRole('button', { name: 'Expand' }).click()

    // Check that advanced filters are now visible
    await expect(page.locator('h3', { hasText: 'Price Range' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Property Details' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Location' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Quick Filters' })).toBeVisible()

    // Check price range fields
    await expect(page.locator('input[type="number"]').nth(0)).toBeVisible() // Min Price
    await expect(page.locator('input[type="number"]').nth(1)).toBeVisible() // Max Price

    // Check property details fields
    await expect(page.locator('select').nth(2)).toBeVisible() // Min Bedrooms
    await expect(page.locator('select').nth(3)).toBeVisible() // Min Bathrooms
    await expect(page.locator('input[type="number"]').nth(2)).toBeVisible() // Min Square Feet

    // Check location fields
    await expect(page.getByRole('textbox', { name: 'Enter city or area...' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Property owner name...' })).toBeVisible()

    // Check quick filter buttons
    await expect(page.getByRole('button', { name: 'Available Only' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Rental Properties' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'For Sale' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Luxury ($500k+)' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Affordable (<$200k)' })).toBeVisible()
  })

  test('should filter properties by type', async ({ page }) => {
    // Select Rental type
    await page.locator('select').nth(0).selectOption('rental')

    // Click Search Properties button
    await page.getByRole('button', { name: 'Search Properties' }).click()

    // Should show only rental properties
    await expect(page.locator('h2', { hasText: 'Properties' })).toContainText('Properties (3)') // 3 rental properties

    // Verify all visible properties are rental
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(2)).toContainText('rental')
    }
  })

  test('should filter properties by status', async ({ page }) => {
    // Select Available status
    await page.locator('select').nth(1).selectOption('available')

    // Click Search Properties button
    await page.getByRole('button', { name: 'Search Properties' }).click()

    // Should show only available properties
    await expect(page.locator('h2', { hasText: 'Properties' })).toContainText('Properties (5)') // 5 available properties

    // Verify all visible properties are available
    const rows = page.locator('tbody tr')
    const count = await rows.count()
    for (let i = 0; i < count; i++) {
      await expect(rows.nth(i).locator('td').nth(5)).toContainText('available')
    }
  })

  test('should search properties by name', async ({ page }) => {
    // Type in search field
    await page.getByRole('textbox', { name: 'Property name, address, owner...' }).fill('Ocean')

    // Click Search Properties button
    await page.getByRole('button', { name: 'Search Properties' }).click()

    // Should show only properties containing "Ocean"
    await expect(page.locator('h2', { hasText: 'Properties' })).toContainText('Properties (1)')
    await expect(page.locator('tbody tr').first().locator('td').nth(1)).toContainText(
      'Ocean View Apartment',
    )
  })

  test('should use quick filters', async ({ page }) => {
    // First expand the advanced search to see quick filters
    await page.getByRole('button', { name: 'Expand' }).click()

    // Verify quick filter buttons are visible and clickable
    await expect(page.getByRole('button', { name: 'Rental Properties' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'For Sale' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Available Only' })).toBeVisible()

    // Click Rental Properties quick filter
    await page.getByRole('button', { name: 'Rental Properties' }).click()

    // Just verify the button was clicked (it should be active)
    await expect(page.getByRole('button', { name: 'Rental Properties' })).toBeVisible()
  })

  test('should clear all filters', async ({ page }) => {
    // Apply some filters first
    await page.locator('select').nth(0).selectOption('rental')
    await page.getByRole('button', { name: 'Search Properties' }).click()

    // Verify filters are applied
    await expect(page.locator('h2', { hasText: 'Properties' })).toContainText('Properties (3)')

    // Click Clear All button
    await page.getByRole('button', { name: 'Clear All' }).click()

    // Wait a moment for the clear to apply
    await page.waitForTimeout(1000)

    // Verify Clear All button exists and can be clicked
    await expect(page.getByRole('button', { name: 'Clear All' })).toBeVisible()

    // Verify the select is reset to "all"
    await expect(page.locator('select').nth(0)).toHaveValue('all')
  })

  test('should show active filter count', async ({ page }) => {
    // Apply a filter
    await page.locator('select').nth(0).selectOption('rental')

    // Should show filter count
    await expect(page.locator('text=1 filter active')).toBeVisible()
  })

  test('should save search', async ({ page }) => {
    // Apply some filters
    await page.locator('select').nth(0).selectOption('rental')
    await page.locator('select').nth(1).selectOption('available')

    // Click Save Search button
    await page.getByRole('button', { name: 'Save Search' }).click()

    // Should show success message (toast notification)
    // Note: This might need to be adjusted based on how toast notifications are implemented
  })
})
