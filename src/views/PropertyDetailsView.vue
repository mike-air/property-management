<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { usePropertiesStore } from '../stores/properties'
import { useToastStore } from '../stores/toast'
import { ArrowLeft, Save, MapPin, FileText, AlertCircle, Loader2, Bed, Bath, Square, Calendar, DollarSign, Home, User } from 'lucide-vue-next'
import VueLeafletMapComponent from '../components/VueLeafletMapComponent.vue'

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

const requestTour = () => {
  toastStore.success('Tour request sent! We\'ll contact you soon.')
}

const contactAgent = () => {
  toastStore.info('Contacting property agent...')
}



</script>

<template>
  <div class="min-h-screen bg-white">
    <!-- Back Navigation -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <button 
          @click="router.push('/properties')" 
          class="flex items-center space-x-2 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft class="h-4 w-4" />
          <span>Back to Properties</span>
        </button>
      </div>
    </div>

    <div v-if="isLoading" class="flex flex-col items-center justify-center py-24">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <Loader2 class="w-8 h-8 text-blue-600 animate-spin" />
      </div>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Loading property details</h3>
      <p class="text-gray-500">Please wait while we fetch the property information...</p>
    </div>

    <div v-else-if="property" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Hero Section: Property Images -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <!-- Main Image -->
        <div class="lg:col-span-2">
          <div class="relative aspect-4/3 bg-gray-100 rounded-xl overflow-hidden">
            <img
              v-if="property.images && property.images.length > 0"
              :src="property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || ''"
              :alt="property.name"
              class="w-full h-full object-cover"
            />
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-gray-400">
              <Home class="w-16 h-16 mb-4" />
              <span class="text-lg">No Image Available</span>
            </div>
            
            <!-- Status Badge -->
            <div class="absolute top-4 left-4">
              <span
                class="px-3 py-1 text-sm font-medium rounded-full"
                :class="property.status === 'available' 
                  ? 'bg-green-100 text-green-800' 
                  : 'bg-red-100 text-red-800'"
              >
                {{ property.status === 'available' ? 'Available' : 'Occupied' }}
              </span>
            </div>
          </div>
        </div>

        <!-- Image Gallery -->
        <div class="lg:col-span-1">
          <div class="grid grid-cols-2 gap-3 h-full">
            <div
              v-for="image in (property.images || []).slice(0, 4)"
              :key="image.id"
              class="aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:opacity-90 transition-opacity"
            >
              <img
                :src="image.url"
                :alt="image.alt"
                class="w-full h-full object-cover"
              />
            </div>
            <div
              v-if="(property.images || []).length > 4"
              class="aspect-square bg-gray-100 rounded-lg flex items-center justify-center cursor-pointer hover:bg-gray-200 transition-colors"
            >
              <span class="text-sm font-medium text-gray-600">
                +{{ (property.images || []).length - 4 }} more
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Property Details & Actions -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column: Property Information -->
        <div class="lg:col-span-2">
          <!-- Property Header -->
          <div class="mb-6">
            <h1 class="text-3xl font-bold text-gray-900 mb-2">{{ property.name }}</h1>
            <p class="text-lg text-gray-600 mb-4">{{ property.address }}</p>
            
            <!-- Price -->
            <div class="mb-4">
              <div class="text-4xl font-bold text-gray-900 mb-2">
                {{ formatPrice(property.price, property.type) }}
              </div>
              <p class="text-sm text-gray-600">
                Est.: ${{ Math.round(property.price * 1.2).toLocaleString() }}/mo Get pre-qualified
              </p>
            </div>

            <!-- Key Metrics -->
            <div class="flex items-center space-x-6 mb-6">
              <div class="flex items-center space-x-2">
                <Bed class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ property.bedrooms || 0 }} beds</span>
              </div>
              <div class="flex items-center space-x-2">
                <Bath class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ property.bathrooms || 0 }} baths</span>
              </div>
              <div class="flex items-center space-x-2">
                <Square class="h-5 w-5 text-gray-400" />
                <span class="text-sm text-gray-600">{{ property.squareFeet ? `${property.squareFeet.toLocaleString()} sqft` : 'N/A' }}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span
                  class="px-2 py-1 text-xs font-medium rounded-full"
                  :class="property.type === 'rental' 
                    ? 'bg-blue-100 text-blue-800' 
                    : 'bg-purple-100 text-purple-800'"
                >
                  {{ property.type }}
                </span>
              </div>
            </div>
          </div>

          <!-- Property Details Grid -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <Home class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Property Type</p>
                  <p class="text-sm text-gray-600 capitalize">{{ property.type }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <Calendar class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Built</p>
                  <p class="text-sm text-gray-600">2024</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <Square class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Lot Size</p>
                  <p class="text-sm text-gray-600">{{ property.squareFeet ? `${Math.round(property.squareFeet * 1.2).toLocaleString()} sqft` : 'N/A' }}</p>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="flex items-center space-x-3">
                <DollarSign class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Price per sqft</p>
                  <p class="text-sm text-gray-600">${{ property.squareFeet ? Math.round(property.price / property.squareFeet).toLocaleString() : 'N/A' }}/sqft</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <User class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Owner</p>
                  <p class="text-sm text-gray-600">{{ property.owner }}</p>
                </div>
              </div>
              
              <div class="flex items-center space-x-3">
                <MapPin class="h-5 w-5 text-gray-400" />
                <div>
                  <p class="text-sm font-medium text-gray-900">Location</p>
                  <p class="text-sm text-gray-600">{{ property.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Description -->
          <div class="mb-8">
            <h3 class="text-lg font-semibold text-gray-900 mb-4">About this property</h3>
            <p v-if="property.description" class="text-gray-600 leading-relaxed">
              {{ property.description }}
            </p>
            <div v-else class="flex items-center space-x-2 text-gray-500">
              <FileText class="w-4 h-4" />
              <span>No description provided</span>
            </div>
          </div>
        </div>

        <!-- Right Column: Map & Actions -->
        <div class="lg:col-span-1">
          <div class="sticky top-8 space-y-6">
            <!-- Map Section -->
            <div class="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div class="px-6 py-4 border-b border-gray-200">
                <h3 class="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin class="h-5 w-5 mr-2" />
                  Location
                </h3>
                <p class="text-sm text-gray-600">Property location on map</p>
              </div>
              <div class="p-6">
                <VueLeafletMapComponent
                  :single-property="property"
                  height="300px"
                  :zoom="15"
                />
              </div>
            </div>

            <!-- Call to Action Buttons -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <button
                @click="requestTour"
                class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors mb-3"
              >
                Request a tour
              </button>
              <p class="text-xs text-gray-500 text-center mb-4">as early as tomorrow at 9:00 am</p>
              
              <button
                @click="contactAgent"
                class="w-full border border-blue-600 text-blue-600 hover:bg-blue-50 font-semibold py-3 px-6 rounded-lg transition-colors"
              >
                Contact agent
              </button>
            </div>

            <!-- Edit Controls (Admin) -->
            <div class="bg-white rounded-xl border border-gray-200 p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4">Property Management</h3>
              
              <div class="space-y-4">
                <button
                  v-if="!isEditing"
                  @click="toggleEdit"
                  class="w-full px-4 py-2 text-sm font-medium text-blue-700 bg-blue-100 hover:bg-blue-200 rounded-lg transition-colors"
                >
                  Edit Property
                </button>
                
                <div v-if="isEditing" class="space-y-3">
                  <button
                    @click="toggleEdit"
                    class="w-full px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    @click="saveProperty"
                    :disabled="isSaving"
                    class="w-full flex items-center justify-center space-x-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                  >
                    <Save class="h-4 w-4" />
                    <span>{{ isSaving ? 'Saving...' : 'Save Changes' }}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-24">
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
</template>

<style scoped>
/* All styles now handled by Tailwind classes */
</style>
