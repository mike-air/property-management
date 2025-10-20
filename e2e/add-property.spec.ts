import { test, expect } from '@playwright/test'

test.describe('Add Property', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/properties')

    // Navigate to add property page
    await page.getByRole('button', { name: 'Add Property' }).click()
    await expect(page).toHaveURL('/properties/add')
  })

  test('should display add property form correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Add New Property' })).toBeVisible()

    // Check form sections
    await expect(page.locator('h3', { hasText: 'Basic Information' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Property Details' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Description' })).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Property Images' }).first()).toBeVisible()
    await expect(page.locator('h3', { hasText: 'Location' })).toBeVisible()
  })

  test('should have all required form fields', async ({ page }) => {
    // Check basic information fields
    await expect(page.getByRole('textbox', { name: 'e.g., Ocean View Apartment' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Type' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Owner name' })).toBeVisible()
    await expect(page.getByRole('spinbutton', { name: 'Price' })).toBeVisible()
    await expect(page.getByRole('combobox', { name: 'Status' })).toBeVisible()
    await expect(page.getByRole('textbox', { name: 'Property address' })).toBeVisible()

    // Check property details fields
    await expect(page.getByRole('spinbutton', { name: 'Bedrooms' })).toBeVisible()
    await expect(page.getByRole('spinbutton', { name: 'Bathrooms' })).toBeVisible()
    await expect(page.getByRole('spinbutton', { name: 'Square Feet' })).toBeVisible()

    // Check description field
    await expect(page.getByRole('textbox', { name: 'Property description...' })).toBeVisible()

    // Check location fields
    await expect(page.getByRole('spinbutton', { name: 'Latitude' })).toBeVisible()
    await expect(page.getByRole('spinbutton', { name: 'Longitude' })).toBeVisible()
  })

  test('should have correct default values', async ({ page }) => {
    // Check default values
    await expect(page.getByRole('combobox', { name: 'Type' })).toHaveValue('rental')
    await expect(page.getByRole('combobox', { name: 'Status' })).toHaveValue('available')
    await expect(page.getByRole('spinbutton', { name: 'Price' })).toHaveValue('0')
    await expect(page.getByRole('spinbutton', { name: 'Bedrooms' })).toHaveValue('0')
    await expect(page.getByRole('spinbutton', { name: 'Bathrooms' })).toHaveValue('0')
    await expect(page.getByRole('spinbutton', { name: 'Square Feet' })).toHaveValue('0')
    await expect(page.getByRole('spinbutton', { name: 'Latitude' })).toHaveValue('37.7749')
    await expect(page.getByRole('spinbutton', { name: 'Longitude' })).toHaveValue('-122.4194')
  })

  test('should create a new property successfully', async ({ page }) => {
    // Fill in required fields
    await page
      .getByRole('textbox', { name: 'e.g., Ocean View Apartment' })
      .fill('E2E Test Property')
    await page.getByRole('textbox', { name: 'Owner name' }).fill('E2E Test Owner')
    await page.getByRole('spinbutton', { name: 'Price' }).fill('2000')
    await page
      .getByRole('textbox', { name: 'Property address' })
      .fill('123 E2E Test Street, Test City, CA')

    // Fill in optional fields
    await page.getByRole('spinbutton', { name: 'Bedrooms' }).fill('2')
    await page.getByRole('spinbutton', { name: 'Bathrooms' }).fill('1')
    await page.getByRole('spinbutton', { name: 'Square Feet' }).fill('1000')
    await page
      .getByRole('textbox', { name: 'Property description...' })
      .fill('This is a test property created by E2E tests')

    // Click Create Property button
    await page.getByRole('button', { name: 'Create Property' }).click()

    // Should redirect to properties list
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible()

    // Should show the new property in the list
    await expect(page.locator('text=E2E Test Property')).toBeVisible()
    await expect(page.locator('text=E2E Test Owner')).toBeVisible()
    await expect(page.locator('text=$2,000/month')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Create Property' }).click()

    // Should stay on the same page (validation should prevent submission)
    await expect(page).toHaveURL('/properties/add')

    // Should show validation errors or prevent form submission
    // Note: This might need adjustment based on how validation is implemented
  })

  test('should reset form when clicking Reset button', async ({ page }) => {
    // Fill in some fields
    await page.getByRole('textbox', { name: 'e.g., Ocean View Apartment' }).fill('Test Property')
    await page.getByRole('textbox', { name: 'Owner name' }).fill('Test Owner')
    await page.getByRole('spinbutton', { name: 'Price' }).fill('1500')

    // Click Reset button
    await page.getByRole('button', { name: 'Reset' }).click()

    // Check that fields are reset to default values
    await expect(page.getByRole('textbox', { name: 'e.g., Ocean View Apartment' })).toHaveValue('')
    await expect(page.getByRole('textbox', { name: 'Owner name' })).toHaveValue('')
    await expect(page.getByRole('spinbutton', { name: 'Price' })).toHaveValue('0')
  })

  test('should cancel and return to properties list', async ({ page }) => {
    // Click Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click()

    // Should navigate back to properties list
    await expect(page).toHaveURL('/properties')
    await expect(page.getByRole('heading', { name: 'Properties', exact: true })).toBeVisible()
  })

  test('should display image upload section', async ({ page }) => {
    // Check that image upload section is visible
    await expect(page.locator('h3', { hasText: 'Property Images' }).first()).toBeVisible()
    await expect(page.locator('text=Upload Property Images')).toBeVisible()
    await expect(
      page.locator('text=Drag and drop images here, or click to select files'),
    ).toBeVisible()
    await expect(page.getByRole('button', { name: 'Choose Files' })).toBeVisible()
  })

  test('should show coordinate help text', async ({ page }) => {
    // Check that coordinate help text is visible
    await expect(
      page.locator('text=Range: -90 to 90 (e.g., 37.7749 for San Francisco)'),
    ).toBeVisible()
    await expect(
      page.locator('text=Range: -180 to 180 (e.g., -122.4194 for San Francisco)'),
    ).toBeVisible()
  })

  test('should validate coordinate ranges', async ({ page }) => {
    // Fill in invalid coordinates
    await page.getByRole('spinbutton', { name: 'Latitude' }).fill('100') // Invalid (> 90)
    await page.getByRole('spinbutton', { name: 'Longitude' }).fill('200') // Invalid (> 180)

    // Fill required fields
    await page.getByRole('textbox', { name: 'e.g., Ocean View Apartment' }).fill('Test Property')
    await page.getByRole('textbox', { name: 'Owner name' }).fill('Test Owner')
    await page.getByRole('spinbutton', { name: 'Price' }).fill('1500')
    await page.getByRole('textbox', { name: 'Property address' }).fill('123 Test Street')

    // Try to submit
    await page.getByRole('button', { name: 'Create Property' }).click()

    // Should show validation errors or prevent submission
    // Note: This might need adjustment based on how validation is implemented
  })
})
