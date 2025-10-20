import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService, type Property, type CreatePropertyRequest } from '../services/api'

export const usePropertiesStore = defineStore('properties', () => {
  // State
  const properties = ref<Property[]>([])
  const currentProperty = ref<Property | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const currentPage = ref(1)
  const totalPages = ref(1)
  const totalCount = ref(0)
  const pageSize = ref(10)

  // Filter and search state
  const searchQuery = ref('')
  const sortBy = ref('name')
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const typeFilter = ref<'all' | 'rental' | 'sale'>('all')
  const statusFilter = ref<'all' | 'available' | 'occupied'>('all')

  // Getters
  const filteredProperties = computed(() => {
    let filtered = [...properties.value]

    // Apply search filter
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      filtered = filtered.filter(
        (property) =>
          property.name.toLowerCase().includes(query) ||
          property.owner.toLowerCase().includes(query) ||
          property.description?.toLowerCase().includes(query) ||
          property.address?.toLowerCase().includes(query),
      )
    }

    // Apply type filter
    if (typeFilter.value !== 'all') {
      filtered = filtered.filter((property) => property.type === typeFilter.value)
    }

    // Apply status filter
    if (statusFilter.value !== 'all') {
      filtered = filtered.filter((property) => property.status === statusFilter.value)
    }

    // Apply sorting
    filtered.sort((a, b) => {
      const aValue = a[sortBy.value as keyof Property]
      const bValue = b[sortBy.value as keyof Property]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortOrder.value === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortOrder.value === 'asc' ? aValue - bValue : bValue - aValue
      }

      return 0
    })

    return filtered
  })

  const paginatedProperties = computed(() => {
    const start = (currentPage.value - 1) * pageSize.value
    const end = start + pageSize.value
    return filteredProperties.value.slice(start, end)
  })

  const hasNextPage = computed(() => currentPage.value < totalPages.value)
  const hasPreviousPage = computed(() => currentPage.value > 1)

  // Actions
  const fetchProperties = async (params?: {
    page?: number
    limit?: number
    search?: string
    sortBy?: string
    sortOrder?: 'asc' | 'desc'
    type?: 'rental' | 'sale'
    status?: 'available' | 'occupied'
  }) => {
    isLoading.value = true
    error.value = null

    try {
      const response = await apiService.getProperties(params)
      properties.value = response.data
      totalCount.value = response.total
      currentPage.value = response.page
      totalPages.value = Math.ceil(response.total / response.limit)

      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchProperty = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      const property = await apiService.getProperty(id)
      currentProperty.value = property
      return property
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createProperty = async (propertyData: CreatePropertyRequest) => {
    isLoading.value = true
    error.value = null

    try {
      const newProperty = await apiService.createProperty(propertyData)
      properties.value.unshift(newProperty)
      totalCount.value++
      return newProperty
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProperty = async (id: number, propertyData: Partial<CreatePropertyRequest>) => {
    isLoading.value = true
    error.value = null

    try {
      const updatedProperty = await apiService.updateProperty(id, propertyData)

      // Update in properties array
      const index = properties.value.findIndex((p: Property) => p.id === id)
      if (index !== -1) {
        properties.value[index] = updatedProperty
      }

      // Update current property if it's the same
      if (currentProperty.value?.id === id) {
        currentProperty.value = updatedProperty
      }

      return updatedProperty
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProperty = async (id: number) => {
    isLoading.value = true
    error.value = null

    try {
      await apiService.deleteProperty(id)

      // Remove from properties array
      properties.value = properties.value.filter((p: Property) => p.id !== id)
      totalCount.value--

      // Clear current property if it's the same
      if (currentProperty.value?.id === id) {
        currentProperty.value = null
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property'
      error.value = errorMessage
      throw err
    } finally {
      isLoading.value = false
    }
  }

  // Pagination actions
  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages.value) {
      currentPage.value = page
    }
  }

  const nextPage = () => {
    if (hasNextPage.value) {
      currentPage.value++
    }
  }

  const previousPage = () => {
    if (hasPreviousPage.value) {
      currentPage.value--
    }
  }

  // Filter and search actions
  const setSearchQuery = (query: string) => {
    searchQuery.value = query
    currentPage.value = 1 // Reset to first page when searching
  }

  const setSorting = (field: string, order: 'asc' | 'desc') => {
    sortBy.value = field
    sortOrder.value = order
  }

  const setTypeFilter = (type: 'all' | 'rental' | 'sale') => {
    typeFilter.value = type
    currentPage.value = 1
  }

  const setStatusFilter = (status: 'all' | 'available' | 'occupied') => {
    statusFilter.value = status
    currentPage.value = 1
  }

  const clearFilters = () => {
    searchQuery.value = ''
    typeFilter.value = 'all'
    statusFilter.value = 'all'
    sortBy.value = 'name'
    sortOrder.value = 'asc'
    currentPage.value = 1
  }

  const clearError = () => {
    error.value = null
  }

  const clearCurrentProperty = () => {
    currentProperty.value = null
  }

  return {
    // State
    properties,
    currentProperty,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalCount,
    pageSize,
    searchQuery,
    sortBy,
    sortOrder,
    typeFilter,
    statusFilter,

    // Getters
    filteredProperties,
    paginatedProperties,
    hasNextPage,
    hasPreviousPage,

    // Actions
    fetchProperties,
    fetchProperty,
    createProperty,
    updateProperty,
    deleteProperty,
    goToPage,
    nextPage,
    previousPage,
    setSearchQuery,
    setSorting,
    setTypeFilter,
    setStatusFilter,
    clearFilters,
    clearError,
    clearCurrentProperty,
  }
})
