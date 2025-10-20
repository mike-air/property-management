<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { Plus, Eye, Edit, Trash2, ArrowLeft, ArrowRight, Map, List, Grid3X3, Home, Image, Loader2 } from 'lucide-vue-next'
import VueLeafletMapComponent from '../components/VueLeafletMapComponent.vue'
import AdvancedSearch, { type SearchFilters } from '../components/AdvancedSearch.vue'
import ConfirmationDialog from '../components/ConfirmationDialog.vue'
import type { Property } from '../services/api'

const router = useRouter()
const propertiesStore = usePropertiesStore()
const toastStore = useToastStore()

const searchQuery = ref('')
const typeFilter = ref('all')
const statusFilter = ref('all')
const sortBy = ref('name')
const sortOrder = ref<'asc' | 'desc'>('asc')
const viewMode = ref<'table' | 'grid' | 'map'>('grid')
const searchFilters = ref({})

// Confirmation dialog state
const showDeleteDialog = ref(false)
const propertyToDelete = ref<Property | null>(null)
const isDeleting = ref(false)

const isLoading = computed(() => propertiesStore.isLoading)
const properties = computed(() => propertiesStore.paginatedProperties)
const totalCount = computed(() => propertiesStore.totalCount)
const currentPage = computed(() => propertiesStore.currentPage)
const totalPages = computed(() => propertiesStore.totalPages)

onMounted(async () => {
  await loadProperties()
  // Initialize realtime updates
  propertiesStore.initializeRealtimeUpdates()
})

// Cleanup on unmount
onUnmounted(() => {
  propertiesStore.stopRealtimeUpdates()
})

const loadProperties = async () => {
  try {
    await propertiesStore.fetchProperties({
      page: currentPage.value,
      limit: 10,
      search: searchQuery.value || undefined,
      sortBy: sortBy.value,
      sortOrder: sortOrder.value,
      type: typeFilter.value !== 'all' ? typeFilter.value as 'rental' | 'sale' : undefined,
      status: statusFilter.value !== 'all' ? statusFilter.value as 'available' | 'occupied' : undefined
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load properties'
    toastStore.error(errorMessage)
    toastStore.error('Failed to load properties')
  }
}

const handleSort = (field: string) => {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc'
  } else {
    sortBy.value = field
    sortOrder.value = 'asc'
  }
  propertiesStore.setSorting(sortBy.value, sortOrder.value)
  loadProperties()
}

const goToPage = (page: number) => {
  propertiesStore.goToPage(page)
  loadProperties()
}

const viewProperty = (id: number) => {
  router.push(`/properties/${id}`)
}

const editProperty = (id: number) => {
  router.push(`/properties/${id}/edit`)
}

const addProperty = () => {
  router.push('/properties/add')
}

const deleteProperty = (id: number) => {
  const property = properties.value.find(p => p.id === id)
  if (property) {
    propertyToDelete.value = property
    showDeleteDialog.value = true
  }
}

const confirmDelete = async () => {
  if (!propertyToDelete.value) return
  
  isDeleting.value = true
  try {
    await propertiesStore.deleteProperty(propertyToDelete.value.id)
    await loadProperties()
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to delete property'
    toastStore.error(errorMessage)
  } finally {
    isDeleting.value = false
    showDeleteDialog.value = false
    propertyToDelete.value = null
  }
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  propertyToDelete.value = null
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

const onMapMarkerClick = (property: Property) => {
  viewProperty(property.id as number)
}

const handleAdvancedSearch = (filters: SearchFilters) => {
  searchFilters.value = filters
  // Apply the filters to the store - this will trigger reactive updates
  propertiesStore.setFilters(filters)
  // No need to call fetchProperties() since filtering is client-side
}

const handleSaveSearch = (filters: SearchFilters) => {
  // In a real app, this would save to the backend
  console.log('Saving search:', filters)
  toastStore.success('Search saved successfully!')
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header with Background Image -->
      <div class="relative mb-8 rounded-xl overflow-hidden">
        <!-- Background Image -->
        <div class="absolute inset-0 bg-gradient-to-r from-blue-600/90 to-blue-700/90">
          <img
            src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=2000&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
            alt="Property management background"
            class="w-full h-full object-cover opacity-20"
          />
        </div>
        
        <!-- Content -->
        <div class="relative px-8 py-12">
          <div class="flex justify-between items-center">
            <div>
              <h1 class="text-4xl font-bold text-white mb-2">Properties</h1>
              <p class="text-xl text-blue-100">Manage your property portfolio</p>
            </div>
            <button 
              @click="router.push('/properties/add')" 
              class="flex items-center space-x-2 px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-lg transition-colors shadow-lg"
            >
              <Plus class="h-5 w-5" />
              <span>Add Property</span>
            </button>
          </div>
        </div>
      </div>

      <!-- Advanced Search -->
      <AdvancedSearch
        v-model="searchFilters"
        @search="handleAdvancedSearch"
        @save-search="handleSaveSearch"
      />

      <!-- Properties Table -->
      <div class="bg-white rounded-lg shadow-sm border border-gray-200">
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex justify-between items-center">
            <div>
              <h2 class="text-lg font-semibold text-gray-900">Properties ({{ totalCount }})</h2>
              <p class="text-sm text-gray-600">Your property listings</p>
            </div>
            <div class="flex items-center space-x-2">
              <div class="flex bg-gray-100 rounded-lg p-1">
                <button
                  @click="viewMode = 'table'"
                  :class="[
                    'flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'table'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  ]"
                >
                  <List class="h-4 w-4" />
                  <span>Table</span>
                </button>
                <button
                  @click="viewMode = 'grid'"
                  :class="[
                    'flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'grid'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  ]"
                >
                  <Grid3X3 class="h-4 w-4" />
                  <span>Grid</span>
                </button>
                <button
                  @click="viewMode = 'map'"
                  :class="[
                    'flex items-center space-x-2 px-3 py-1 rounded-md text-sm font-medium transition-colors',
                    viewMode === 'map'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  ]"
                >
                  <Map class="h-4 w-4" />
                  <span>Map</span>
                </button>
              </div>
            </div>
          </div>
        </div>
        <div class="p-6">
          <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
            <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <Loader2 class="w-8 h-8 text-blue-600 animate-spin" />
            </div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Loading properties</h3>
            <p class="text-gray-500">Please wait while we fetch your properties...</p>
          </div>

          <div v-else-if="properties.length === 0" class="text-center py-12">
            <div class="flex flex-col items-center space-y-4">
              <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Home class="w-8 h-8 text-gray-400" />
              </div>
              <div>
                <h3 class="text-lg font-medium text-gray-900 mb-2">No properties found</h3>
                <p class="text-gray-500 mb-4">Get started by adding your first property</p>
                <button
                  @click="addProperty"
                  class="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus class="w-4 h-4 mr-2" />
                  Add Property
                </button>
              </div>
            </div>
          </div>

          <!-- Table View -->
          <div v-else-if="viewMode === 'table'" class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('name')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Name</span>
                      <span v-if="sortBy === 'name'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('type')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Type</span>
                      <span v-if="sortBy === 'type'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('owner')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Owner</span>
                      <span v-if="sortBy === 'owner'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('price')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Price</span>
                      <span v-if="sortBy === 'price'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th
                    class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                    @click="handleSort('status')"
                  >
                    <div class="flex items-center space-x-1">
                      <span>Status</span>
                      <span v-if="sortBy === 'status'" class="text-blue-600">
                        {{ sortOrder === 'asc' ? '↑' : '↓' }}
                      </span>
                    </div>
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="property in properties" :key="property.id" class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="w-12 h-12 rounded-lg overflow-hidden bg-gray-100">
                      <img
                        v-if="property.images && property.images.length > 0"
                        :src="property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || ''"
                        :alt="property.name"
                        class="w-full h-full object-cover"
                      />
                      <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Image class="w-4 h-4 mb-1" />
                        <span class="text-xs">No Image</span>
                      </div>
                    </div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{{ property.name }}</td>
                      <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <span 
                          class="status-badge"
                          :class="property.type === 'rental' ? 'status-rental' : 'status-sale'"
                        >
                          {{ property.type }}
                        </span>
                      </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ property.owner }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ formatPrice(property.price, property.type) }}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span 
                      class="status-badge"
                      :class="property.status === 'available' ? 'status-available' : 'status-occupied'"
                    >
                      {{ property.status }}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                      <button
                        @click="viewProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="View Details"
                      >
                        <Eye class="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        @click="editProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 transition-colors"
                        title="Edit Property"
                      >
                        <Edit class="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        @click="deleteProperty(property.id)"
                        class="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 transition-colors"
                        title="Delete Property"
                      >
                        <Trash2 class="h-3 w-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Grid View -->
          <div v-else-if="viewMode === 'grid'" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
              v-for="property in properties" 
              :key="property.id"
              class="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              @click="viewProperty(property.id)"
            >
              <!-- Property Image -->
              <div class="aspect-w-16 aspect-h-12 bg-gray-100">
                <div class="w-full h-48 bg-gray-100 relative">
                  <img
                    v-if="property.images && property.images.length > 0"
                    :src="property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || ''"
                    :alt="property.name"
                    class="w-full h-full object-cover"
                  />
                  <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                    <Image class="w-8 h-8 mb-2" />
                    <span class="text-sm">No Image</span>
                  </div>
                  
                  <!-- Status Badge -->
                  <div class="absolute top-3 right-3">
                    <span 
                      class="status-badge text-xs px-2 py-1"
                      :class="property.status === 'available' ? 'status-available' : 'status-occupied'"
                    >
                      {{ property.status }}
                    </span>
                  </div>
                  
                  <!-- Type Badge -->
                  <div class="absolute top-3 left-3">
                    <span 
                      class="status-badge text-xs px-2 py-1"
                      :class="property.type === 'rental' ? 'status-rental' : 'status-sale'"
                    >
                      {{ property.type }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Property Details -->
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">{{ property.name }}</h3>
                <p class="text-sm text-gray-600 mb-2">{{ property.owner }}</p>
                <p class="text-lg font-bold text-blue-600 mb-3">{{ formatPrice(property.price, property.type) }}</p>
                
                <!-- Property Info -->
                <div class="flex items-center justify-between text-sm text-gray-500 mb-4">
                  <div v-if="property.bedrooms" class="flex items-center">
                    <span>{{ property.bedrooms }} bed{{ property.bedrooms > 1 ? 's' : '' }}</span>
                  </div>
                  <div v-if="property.bathrooms" class="flex items-center">
                    <span>{{ property.bathrooms }} bath{{ property.bathrooms > 1 ? 's' : '' }}</span>
                  </div>
                  <div v-if="property.squareFeet" class="flex items-center">
                    <span>{{ property.squareFeet.toLocaleString() }} sq ft</span>
                  </div>
                </div>
                
                <!-- Action Buttons -->
                <div class="flex space-x-2">
                  <button
                    @click.stop="viewProperty(property.id)"
                    class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-md transition-colors"
                  >
                    <Eye class="h-4 w-4" />
                    <span>View</span>
                  </button>
                  <button
                    @click.stop="editProperty(property.id)"
                    class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                  >
                    <Edit class="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    @click.stop="deleteProperty(property.id)"
                    class="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm font-medium text-red-700 bg-red-100 hover:bg-red-200 rounded-md transition-colors"
                  >
                    <Trash2 class="h-4 w-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Map View -->
          <div v-else-if="viewMode === 'map'" class="h-96">
            <VueLeafletMapComponent
              :properties="properties"
              height="384px"
              :zoom="10"
              @marker-click="onMapMarkerClick"
            />
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="mt-6 flex items-center justify-between">
            <button
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="currentPage === 1"
              @click="goToPage(currentPage - 1)"
            >
              <ArrowLeft class="h-4 w-4" />
              <span>Previous</span>
            </button>

            <div class="flex space-x-1">
              <button
                v-for="page in Math.min(5, totalPages)"
                :key="page"
                :class="[
                  'px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 bg-white border border-gray-300 hover:bg-gray-50'
                ]"
                @click="goToPage(page)"
              >
                {{ page }}
              </button>
            </div>

            <button
              class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              :disabled="currentPage === totalPages"
              @click="goToPage(currentPage + 1)"
            >
              <span>Next</span>
              <ArrowRight class="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Dialog -->
    <ConfirmationDialog
      :is-open="showDeleteDialog"
      title="Delete Property"
      subtitle="This action cannot be undone"
      :message="`Are you sure you want to delete '${propertyToDelete?.name}'?`"
      :details="propertyToDelete ? `This will permanently remove ${propertyToDelete.name} from the system.` : ''"
      confirm-text="Delete Property"
      :is-loading="isDeleting"
      @confirm="confirmDelete"
      @cancel="cancelDelete"
    />
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
