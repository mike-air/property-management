import { test, expect } from '@playwright/test'

test.describe('Property Details', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Continue' }).click()
    await expect(page).toHaveURL('/properties')

    // Navigate to first property details
    await page.locator('tbody tr').first().getByRole('button', { name: 'View' }).click()
    await expect(page).toHaveURL(/\/properties\/\d+/)
  })

  test('should display property details correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible()

    // Check property name (look for the property name in the page, not first h2)
    await expect(page.locator('text=City Center Studio')).toBeVisible()

    // Check property information sections
    await expect(page.locator('h2', { hasText: 'Property Images' }).first()).toBeVisible()
    await expect(page.locator('h2', { hasText: 'Location' })).toBeVisible()
  })

  test('should display property information fields', async ({ page }) => {
    // Check basic information fields
    await expect(page.locator('text=Name')).toBeVisible()
    await expect(page.locator('text=Type')).toBeVisible()
    await expect(page.locator('text=Owner')).toBeVisible()
    await expect(page.locator('text=Price')).toBeVisible()
    await expect(page.locator('text=Status')).toBeVisible()

    // Check property details fields
    await expect(page.locator('text=Bedrooms')).toBeVisible()
    await expect(page.locator('text=Bathrooms')).toBeVisible()
    await expect(page.locator('text=Square Feet')).toBeVisible()

    // Check description field
    await expect(page.locator('text=Description')).toBeVisible()

    // Check coordinates
    await expect(page.locator('text=Latitude')).toBeVisible()
    await expect(page.locator('text=Longitude')).toBeVisible()
  })

  test('should navigate to edit page when clicking Edit Property button', async ({ page }) => {
    // Click Edit Property button
    await page.getByRole('button', { name: 'Edit Property' }).click()

    // Should navigate to edit page
    await expect(page).toHaveURL(/\/properties\/\d+\/edit/)
    await expect(page.getByRole('heading', { name: 'Edit Property' })).toBeVisible()
  })

  test('should edit property information', async ({ page }) => {
    // Navigate to edit page
    await page.getByRole('button', { name: 'Edit Property' }).click()
    await expect(page).toHaveURL(/\/properties\/\d+\/edit/)

    // Change status from occupied to available
    await page.locator('select').nth(1).selectOption('available')

    // Save changes
    await page.getByRole('button', { name: 'Save Property' }).click()

    // Should return to properties list
    await expect(page).toHaveURL('/properties')
  })

  test('should cancel edit without saving', async ({ page }) => {
    // Navigate to edit page
    await page.getByRole('button', { name: 'Edit Property' }).click()
    await expect(page).toHaveURL(/\/properties\/\d+\/edit/)

    // Change some field
    await page.locator('input[placeholder="Property name"]').fill('Modified Name')

    // Click Cancel
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Should return to properties list
    await expect(page).toHaveURL('/properties')
  })

  test('should navigate back to properties list', async ({ page }) => {
    // Click Back to Properties button
    await page.getByRole('button', { name: 'Back to Properties' }).click()

    // Should navigate back to properties list
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible()
  })

  test('should display property images', async ({ page }) => {
    // Check that image section is visible
    await expect(page.locator('h2', { hasText: 'Property Images' }).first()).toBeVisible()

    // Check for image gallery or no images message
    const hasImages = await page.locator('text=No images available').isVisible()
    const hasImageGallery = (await page.locator('img').count()) > 0

    // Either should have images or show "no images" message
    expect(hasImages || hasImageGallery).toBeTruthy()
  })

  test('should display location map section', async ({ page }) => {
    // Check that location section is visible
    await expect(page.locator('h2', { hasText: 'Location' })).toBeVisible()
    await expect(page.locator('text=Property location on map')).toBeVisible()
  })

  test('should show property coordinates', async ({ page }) => {
    // Check that coordinates are displayed
    await expect(page.locator('text=Latitude')).toBeVisible()
    await expect(page.locator('text=Longitude')).toBeVisible()

    // Check that coordinate values are shown
    const latText = await page.locator('text=Latitude').locator('..').textContent()
    const lngText = await page.locator('text=Longitude').locator('..').textContent()

    // Just verify coordinates exist and are valid numbers
    expect(latText).toMatch(/-?\d+\.?\d*/) // Should contain a number
    expect(lngText).toMatch(/-?\d+\.?\d*/) // Should contain a number
  })
})
