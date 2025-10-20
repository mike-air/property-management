<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { ArrowLeft, Save, MapPin } from 'lucide-vue-next'
import MapComponent from '../components/MapComponent.vue'

const route = useRoute()
const router = useRouter()
const propertiesStore = usePropertiesStore()
const toastStore = useToastStore()

const isEditing = ref(false)
const isLoading = ref(false)
const isSaving = ref(false)

const property = computed(() => propertiesStore.currentProperty)

// Form data
const formData = ref({
  name: '',
  type: 'rental' as 'rental' | 'sale',
  owner: '',
  price: 0,
  status: 'available' as 'available' | 'occupied',
  latitude: 0,
  longitude: 0,
  description: '',
  bedrooms: 0,
  bathrooms: 0,
  squareFeet: 0,
  address: ''
})

onMounted(async () => {
  const propertyId = Number(route.params.id)
  if (propertyId) {
    await loadProperty(propertyId)
  }
})

const loadProperty = async (id: number) => {
  isLoading.value = true
  try {
    await propertiesStore.fetchProperty(id)
    if (property.value) {
      formData.value = {
        name: property.value.name,
        type: property.value.type,
        owner: property.value.owner,
        price: property.value.price,
        status: property.value.status,
        latitude: property.value.latitude,
        longitude: property.value.longitude,
        description: property.value.description || '',
        bedrooms: property.value.bedrooms || 0,
        bathrooms: property.value.bathrooms || 0,
        squareFeet: property.value.squareFeet || 0,
        address: property.value.address || ''
      }
    }
  } catch (error) {
    toastStore.error('Failed to load property details')
    router.push('/properties')
  } finally {
    isLoading.value = false
  }
}

const toggleEdit = () => {
  isEditing.value = !isEditing.value
  if (!isEditing.value && property.value) {
    // Reset form data when canceling edit
    formData.value = {
      name: property.value.name,
      type: property.value.type,
      owner: property.value.owner,
      price: property.value.price,
      status: property.value.status,
      latitude: property.value.latitude,
      longitude: property.value.longitude,
      description: property.value.description || '',
      bedrooms: property.value.bedrooms || 0,
      bathrooms: property.value.bathrooms || 0,
      squareFeet: property.value.squareFeet || 0,
      address: property.value.address || ''
    }
  }
}

const saveProperty = async () => {
  if (!property.value) return
  
  isSaving.value = true
  try {
    await propertiesStore.updateProperty(property.value.id, formData.value)
    toastStore.success('Property updated successfully')
    isEditing.value = false
  } catch (error) {
    toastStore.error('Failed to update property')
  } finally {
    isSaving.value = false
  }
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

const getStatusBadge = (status: string) => {
  if (status === 'available') {
    return 'status-badge status-available'
  }
  return 'status-badge status-occupied'
}
</script>

<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <button 
          @click="router.push('/properties')" 
          class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors mb-4"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Properties</span>
        </button>
        <div>
          <h1 class="text-3xl font-bold text-gray-900">
            {{ isEditing ? 'Edit Property' : 'Property Details' }}
          </h1>
          <p class="mt-2 text-gray-600">View and manage property information</p>
        </div>
      </div>

      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="mt-4 text-gray-600">Loading property details...</p>
      </div>

      <div v-else-if="property" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <!-- Property Information -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex justify-between items-start">
              <div>
                <h2 class="text-xl font-semibold text-gray-900">{{ property.name }}</h2>
                <p class="text-sm text-gray-600">{{ property.address }}</p>
              </div>
              <div class="flex space-x-2">
                <button
                  v-if="!isEditing"
                  @click="toggleEdit"
                  class="px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  Edit
                </button>
                <button
                  v-if="isEditing"
                  @click="toggleEdit"
                  class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  v-if="isEditing"
                  @click="saveProperty"
                  :disabled="isSaving"
                  class="flex items-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  <Save class="h-4 w-4" />
                  <span>{{ isSaving ? 'Saving...' : 'Save' }}</span>
                </button>
              </div>
            </div>
          </div>
          <div class="p-6">
            <!-- Basic Information -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  v-if="isEditing"
                  v-model="formData.name"
                  placeholder="Property name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.name }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Type</label>
                <select
                  v-if="isEditing"
                  v-model="formData.type"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="rental">Rental</option>
                  <option value="sale">For Sale</option>
                </select>
                <p v-else class="text-sm text-gray-900 capitalize">{{ property.type }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Owner</label>
                <input
                  v-if="isEditing"
                  v-model="formData.owner"
                  placeholder="Owner name"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.owner }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Price</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.price"
                  type="number"
                  placeholder="Price"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900 price">{{ formatPrice(property.price, property.type) }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <select
                  v-if="isEditing"
                  v-model="formData.status"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="available">Available</option>
                  <option value="occupied">Occupied</option>
                </select>
                <span v-else 
                  class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                  :class="property.status === 'available' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'"
                >
                  {{ property.status }}
                </span>
              </div>
            </div>

            <!-- Additional Details -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bedrooms</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.bedrooms"
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.bedrooms || 'N/A' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Bathrooms</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.bathrooms"
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.bathrooms || 'N/A' }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Square Feet</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.squareFeet"
                  type="number"
                  placeholder="0"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : 'N/A' }}</p>
              </div>
            </div>

            <!-- Description -->
            <div class="mb-6">
              <label class="block text-sm font-medium text-gray-700 mb-2">Description</label>
              <textarea
                v-if="isEditing"
                v-model="formData.description"
                placeholder="Property description"
                rows="3"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              ></textarea>
              <p v-else class="text-sm text-gray-900">{{ property.description || 'No description provided' }}</p>
            </div>

            <!-- Coordinates -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Latitude</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.latitude"
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.latitude }}</p>
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Longitude</label>
                <input
                  v-if="isEditing"
                  v-model.number="formData.longitude"
                  type="number"
                  step="0.000001"
                  placeholder="0.000000"
                  class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <p v-else class="text-sm text-gray-900">{{ property.longitude }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Map -->
        <div class="bg-white rounded-lg shadow-sm border border-gray-200">
          <div class="px-6 py-4 border-b border-gray-200">
            <h2 class="text-xl font-semibold text-gray-900 flex items-center">
              <MapPin class="h-5 w-5 mr-2" />
              Location
            </h2>
            <p class="text-sm text-gray-600">Property location on map</p>
          </div>
          <div class="p-6">
            <MapComponent
              :single-property="property"
              height="400px"
              :zoom="15"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <p class="text-gray-500 mb-4">Property not found</p>
        <button 
          @click="router.push('/properties')" 
          class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
        >
          Back to Properties
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
