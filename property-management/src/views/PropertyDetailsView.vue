<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { ArrowLeft, Save, MapPin, FileText, AlertCircle, Loader2 } from 'lucide-vue-next'
import VueLeafletMapComponent from '../components/VueLeafletMapComponent.vue'
import ImageGallery from '../components/ImageGallery.vue'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select'

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
  // Initialize realtime updates
  propertiesStore.initializeRealtimeUpdates()
})

// Cleanup on unmount
onUnmounted(() => {
  propertiesStore.stopRealtimeUpdates()
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
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Failed to load property details'
    toastStore.error(errorMessage)
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
    const errorMessage = error instanceof Error ? error.message : 'Failed to update property'
    toastStore.error(errorMessage)
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
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <Loader2 class="w-8 h-8 text-blue-600 animate-spin" />
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">Loading property details</h3>
        <p class="text-gray-500">Please wait while we fetch the property information...</p>
      </div>

          <div v-else-if="property" class="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <!-- Property Images -->
            <div class="bg-white rounded-lg shadow-sm border border-gray-200">
              <div class="px-6 py-4 border-b border-gray-200">
                <h2 class="text-xl font-semibold text-gray-900">Property Images</h2>
                <p class="text-sm text-gray-600">Photos of the property</p>
              </div>
              <div class="p-6">
                <ImageGallery :images="property.images || []" />
              </div>
            </div>

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
            <!-- Property Information with Clean Dividers -->
            <div class="space-y-0">
              <!-- Name -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Name</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model="formData.name"
                      placeholder="Property name"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900">{{ property.name }}</p>
                  </div>
                </div>
              </div>

              <!-- Type -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Type</label>
                  <div class="text-right">
                    <Select v-if="isEditing" v-model="formData.type">
                      <SelectTrigger class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rental">Rental</SelectItem>
                        <SelectItem value="sale">For Sale</SelectItem>
                      </SelectContent>
                    </Select>
                    <span v-else 
                      class="status-badge"
                      :class="property.type === 'rental' ? 'status-rental' : 'status-sale'"
                    >
                      {{ property.type }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Owner -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Owner</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model="formData.owner"
                      placeholder="Owner name"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900">{{ property.owner }}</p>
                  </div>
                </div>
              </div>

              <!-- Price -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Price</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.price"
                      type="number"
                      placeholder="Price"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900 font-medium">{{ formatPrice(property.price, property.type) }}</p>
                  </div>
                </div>
              </div>

              <!-- Status -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Status</label>
                  <div class="text-right">
                    <Select v-if="isEditing" v-model="formData.status">
                      <SelectTrigger class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Available</SelectItem>
                        <SelectItem value="occupied">Occupied</SelectItem>
                      </SelectContent>
                    </Select>
                    <span v-else 
                      class="status-badge"
                      :class="property.status === 'available' ? 'status-available' : 'status-occupied'"
                    >
                      {{ property.status }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Bedrooms -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Bedrooms</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.bedrooms"
                      type="number"
                      placeholder="0"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900">{{ property.bedrooms || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Bathrooms -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Bathrooms</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.bathrooms"
                      type="number"
                      placeholder="0"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900">{{ property.bathrooms || 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Square Feet -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Square Feet</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.squareFeet"
                      type="number"
                      placeholder="0"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900">{{ property.squareFeet ? `${property.squareFeet.toLocaleString()} sq ft` : 'N/A' }}</p>
                  </div>
                </div>
              </div>

              <!-- Description -->
              <div class="row-divider">
                <div class="flex justify-between items-start">
                  <label class="text-sm font-medium text-gray-700 mt-1">Description</label>
                  <div class="text-right w-64">
                    <textarea
                      v-if="isEditing"
                      v-model="formData.description"
                      placeholder="Property description"
                      rows="3"
                      class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm resize-none"
                    ></textarea>
                    <p v-else-if="property.description" class="text-sm text-gray-900 text-left">{{ property.description }}</p>
                    <div v-else class="flex items-center space-x-2 text-sm text-gray-500">
                      <FileText class="w-4 h-4" />
                      <span>No description provided</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Latitude -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Latitude</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.latitude"
                      type="number"
                      step="0.000001"
                      placeholder="0.000000"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900 font-mono">{{ property.latitude }}</p>
                  </div>
                </div>
              </div>

              <!-- Longitude -->
              <div class="row-divider">
                <div class="flex justify-between items-center">
                  <label class="text-sm font-medium text-gray-700">Longitude</label>
                  <div class="text-right">
                    <input
                      v-if="isEditing"
                      v-model.number="formData.longitude"
                      type="number"
                      step="0.000001"
                      placeholder="0.000000"
                      class="w-64 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                    <p v-else class="text-sm text-gray-900 font-mono">{{ property.longitude }}</p>
                  </div>
                </div>
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
            <VueLeafletMapComponent
              :single-property="property"
              height="400px"
              :zoom="15"
            />
          </div>
        </div>
      </div>

      <div v-else class="text-center py-12">
        <div class="flex flex-col items-center space-y-4">
          <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
            <AlertCircle class="w-8 h-8 text-gray-400" />
          </div>
          <div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">Property not found</h3>
            <p class="text-gray-500 mb-4">The property you're looking for doesn't exist or has been removed</p>
            <button 
              @click="router.push('/properties')" 
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
            >
              <ArrowLeft class="w-4 h-4 mr-2" />
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
