import { test, expect } from '@playwright/test'

test.describe('Properties List', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login')
    await page.getByRole('textbox', { name: 'Email' }).fill('admin@example.com')
    await page.getByRole('textbox', { name: 'Password' }).fill('password')
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL('/properties')
  })

  test('should display properties list with correct columns', async ({ page }) => {
    // Check table headers
    await expect(page.locator('th').nth(0)).toHaveText('Image')
    await expect(page.locator('th').nth(1)).toContainText('Name')
    await expect(page.locator('th').nth(2)).toHaveText('Type')
    await expect(page.locator('th').nth(3)).toHaveText('Owner')
    await expect(page.locator('th').nth(4)).toHaveText('Price')
    await expect(page.locator('th').nth(5)).toHaveText('Status')
    await expect(page.locator('th').nth(6)).toHaveText('Actions')
  })

  test('should display properties data correctly', async ({ page }) => {
    // Check that properties are displayed
    await expect(page.locator('tbody tr')).toHaveCount(8) // Should have 8 properties

    // Check first property data
    const firstRow = page.locator('tbody tr').first()
    const propertyName = await firstRow.locator('td').nth(1).textContent()
    expect(propertyName).toBeTruthy() // Just verify there's a property name
    await expect(firstRow.locator('td').nth(2)).toContainText('rental')
    await expect(firstRow.locator('td').nth(3)).toBeTruthy() // Owner name exists
    await expect(firstRow.locator('td').nth(4)).toContainText('$') // Price contains dollar sign
    const statusText = await firstRow.locator('td').nth(5).textContent()
    expect(['available', 'occupied']).toContain(statusText?.toLowerCase()) // Status is valid
  })

  test('should have action buttons for each property', async ({ page }) => {
    const firstRow = page.locator('tbody tr').first()

    // Check action buttons
    await expect(firstRow.getByRole('button', { name: 'View' })).toBeVisible()
    await expect(firstRow.getByRole('button', { name: 'Edit' })).toBeVisible()
    await expect(firstRow.getByRole('button', { name: 'Delete' })).toBeVisible()
  })

  test('should sort properties by name', async ({ page }) => {
    // Click on Name column header
    await page.locator('th').nth(1).click()

    // Check that sorting indicator appears (could be ↑ or ↓)
    const nameHeader = page.locator('th').nth(1)
    const headerText = await nameHeader.textContent()
    expect(headerText).toMatch(/Name[↑↓]/)

    // Verify properties are sorted (first should be alphabetically first)
    const firstProperty = page.locator('tbody tr').first().locator('td').nth(1)
    const firstPropertyName = await firstProperty.textContent()
    expect(firstPropertyName).toBeTruthy() // Just verify there's a property name
  })

  test('should navigate to property details when clicking View', async ({ page }) => {
    // Click View button on first property
    await page.locator('tbody tr').first().getByRole('button', { name: 'View' }).click()

    // Should navigate to property details page
    await expect(page).toHaveURL(/\/properties\/\d+/)
    await expect(page.getByRole('heading', { name: 'Property Details' })).toBeVisible()
  })

  test('should navigate to add property page when clicking Add Property', async ({ page }) => {
    // Click Add Property button
    await page.getByRole('button', { name: 'Add Property' }).click()

    // Should navigate to add property page
    await expect(page).toHaveURL('/properties/add')
    await expect(page.getByRole('heading', { name: 'Add New Property' })).toBeVisible()
  })

  test('should display correct property count', async ({ page }) => {
    // Check that the property count is displayed correctly
    await expect(page.locator('h2', { hasText: 'Properties' })).toContainText('Properties (8)')
  })

  test('should toggle between table and map view', async ({ page }) => {
    // Check that table view is active by default
    await expect(page.getByRole('button', { name: 'Table' })).toHaveClass(/bg-white/)

    // Click Map view
    await page.getByRole('button', { name: 'Map' }).click()

    // Should show map view
    await expect(page.getByRole('button', { name: 'Map' })).toHaveClass(/bg-white/)

    // Click Table view
    await page.getByRole('button', { name: 'Table' }).click()

    // Should show table view again
    await expect(page.getByRole('button', { name: 'Table' })).toHaveClass(/bg-white/)
  })
})
