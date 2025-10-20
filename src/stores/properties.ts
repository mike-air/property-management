import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { apiService, type Property, type CreatePropertyRequest } from '../services/api'
import { useToastStore } from './toast'
import { sseService, type PropertyUpdateEvent } from '../services/sse'

interface AdvancedFilters {
  search?: string
  type?: string
  status?: string
  minPrice?: number
  maxPrice?: number
  minBedrooms?: number
  minBathrooms?: number
  minSquareFeet?: number
  location?: string
  owner?: string
}

export const usePropertiesStore = defineStore('properties', () => {
  // State
  const properties = ref<Property[]>([])
  const currentProperty = ref<Property | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Pagination state
  const currentPage = ref(1)
  const pageSize = ref(10)

  // Filter and search state
  const searchQuery = ref('')
  const sortBy = ref('name')
  const sortOrder = ref<'asc' | 'desc'>('asc')
  const typeFilter = ref<'all' | 'rental' | 'sale'>('all')
  const statusFilter = ref<'all' | 'available' | 'occupied'>('all')
  const advancedFilters = ref<AdvancedFilters>({})

  // Getters
  const filteredProperties = computed(() => {
    let filtered = [...properties.value]

    // Apply advanced filters first
    if (advancedFilters.value) {
      const filters = advancedFilters.value

      // Search filter
      if (filters.search) {
        const query = filters.search.toLowerCase()
        filtered = filtered.filter(
          (property) =>
            property.name.toLowerCase().includes(query) ||
            property.owner.toLowerCase().includes(query) ||
            property.description?.toLowerCase().includes(query) ||
            property.address?.toLowerCase().includes(query),
        )
      }

      // Type filter
      if (filters.type && filters.type !== 'all') {
        filtered = filtered.filter((property) => property.type === filters.type)
      }

      // Status filter
      if (filters.status && filters.status !== 'all') {
        filtered = filtered.filter((property) => property.status === filters.status)
      }

      // Price range filter
      if (filters.minPrice !== undefined) {
        filtered = filtered.filter((property) => property.price >= filters.minPrice!)
      }
      if (filters.maxPrice !== undefined) {
        filtered = filtered.filter((property) => property.price <= filters.maxPrice!)
      }

      // Bedrooms filter
      if (filters.minBedrooms !== undefined && filters.minBedrooms > 0) {
        filtered = filtered.filter((property) => (property.bedrooms || 0) >= filters.minBedrooms!)
      }

      // Bathrooms filter
      if (filters.minBathrooms !== undefined && filters.minBathrooms > 0) {
        filtered = filtered.filter((property) => (property.bathrooms || 0) >= filters.minBathrooms!)
      }

      // Square feet filter
      if (filters.minSquareFeet !== undefined) {
        filtered = filtered.filter(
          (property) => (property.squareFeet || 0) >= filters.minSquareFeet!,
        )
      }

      // Location filter
      if (filters.location) {
        const location = filters.location.toLowerCase()
        filtered = filtered.filter((property) => property.address?.toLowerCase().includes(location))
      }

      // Owner filter
      if (filters.owner) {
        const owner = filters.owner.toLowerCase()
        filtered = filtered.filter((property) => property.owner.toLowerCase().includes(owner))
      }
    }

    // Apply legacy filters (for backward compatibility)
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

    if (typeFilter.value !== 'all') {
      filtered = filtered.filter((property) => property.type === typeFilter.value)
    }

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

  const totalCount = computed(() => filteredProperties.value.length)
  const totalPages = computed(() => Math.ceil(totalCount.value / pageSize.value))
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
    const toastStore = useToastStore()

    try {
      const response = await apiService.getProperties(params)
      properties.value = response.data
      currentPage.value = response.page

      // Show success toast only if there are filters applied
      if (params?.search || params?.type || params?.status) {
        toastStore.success(`Found ${response.data.length} properties matching your criteria`)
      }

      return response
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch properties'
      error.value = errorMessage
      toastStore.error(`Failed to load properties: ${errorMessage}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const fetchProperty = async (id: number) => {
    isLoading.value = true
    error.value = null
    const toastStore = useToastStore()

    try {
      const property = await apiService.getProperty(id)
      currentProperty.value = property
      return property
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch property'
      error.value = errorMessage
      toastStore.error(`Failed to load property: ${errorMessage}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const createProperty = async (propertyData: CreatePropertyRequest) => {
    isLoading.value = true
    error.value = null
    const toastStore = useToastStore()

    try {
      const newProperty = await apiService.createProperty(propertyData)
      properties.value.unshift(newProperty)
      toastStore.success(`Property "${newProperty.name}" created successfully`)
      return newProperty
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create property'
      error.value = errorMessage
      toastStore.error(`Failed to create property: ${errorMessage}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const updateProperty = async (id: number, propertyData: Partial<CreatePropertyRequest>) => {
    isLoading.value = true
    error.value = null
    const toastStore = useToastStore()

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

      toastStore.success(`Property "${updatedProperty.name}" updated successfully`)
      return updatedProperty
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update property'
      error.value = errorMessage
      toastStore.error(`Failed to update property: ${errorMessage}`)
      throw err
    } finally {
      isLoading.value = false
    }
  }

  const deleteProperty = async (id: number) => {
    isLoading.value = true
    error.value = null
    const toastStore = useToastStore()

    try {
      // Get property name before deletion for toast message
      const propertyToDelete = properties.value.find((p: Property) => p.id === id)
      const propertyName = propertyToDelete?.name || 'Property'

      await apiService.deleteProperty(id)

      // Remove from properties array
      properties.value = properties.value.filter((p: Property) => p.id !== id)

      // Clear current property if it's the same
      if (currentProperty.value?.id === id) {
        currentProperty.value = null
      }

      toastStore.success(`Property "${propertyName}" deleted successfully`)
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete property'
      error.value = errorMessage
      toastStore.error(`Failed to delete property: ${errorMessage}`)
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

  const setFilters = (filters: AdvancedFilters) => {
    advancedFilters.value = filters
    currentPage.value = 1
  }

  const clearFilters = () => {
    searchQuery.value = ''
    typeFilter.value = 'all'
    statusFilter.value = 'all'
    advancedFilters.value = {}
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

  // Realtime updates
  const initializeRealtimeUpdates = () => {
    sseService.addEventListener(handleRealtimeUpdate)
    sseService.connect()
  }

  const stopRealtimeUpdates = () => {
    sseService.removeEventListener(handleRealtimeUpdate)
    sseService.disconnect()
  }

  const handleRealtimeUpdate = (event: PropertyUpdateEvent) => {
    switch (event.type) {
      case 'property_created':
        // Add new property to the list
        properties.value.unshift(event.property as Property)
        break

      case 'property_updated':
        // Update existing property
        const updateIndex = properties.value.findIndex((p) => p.id === event.property.id)
        if (updateIndex !== -1) {
          properties.value[updateIndex] = event.property as Property
        }

        // Update current property if it's the same
        if (currentProperty.value?.id === event.property.id) {
          currentProperty.value = event.property as Property
        }
        break

      case 'property_deleted':
        // Remove property from list
        properties.value = properties.value.filter((p) => p.id !== event.property.id)

        // Clear current property if it's the same
        if (currentProperty.value?.id === event.property.id) {
          currentProperty.value = null
        }
        break
    }
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
    setFilters,
    clearFilters,
    clearError,
    clearCurrentProperty,

    // Realtime updates
    initializeRealtimeUpdates,
    stopRealtimeUpdates,
  }
})
