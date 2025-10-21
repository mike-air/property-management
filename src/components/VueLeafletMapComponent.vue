<template>
  <div class="map-container" :style="{ height: height }">
    <l-map
      ref="map"
      :zoom="zoom"
      :center="mapCenter"
      :options="mapOptions"
      @ready="onMapReady"
      @click="onMapClick"
    >
      <l-tile-layer
        :url="tileLayerUrl"
        :attribution="attribution"
      />
      
      <!-- Property markers -->
      <l-marker
        v-for="property in properties"
        :key="property.id"
        :lat-lng="[property.latitude, property.longitude]"
        :icon="getMarkerIcon(property)"
        @click="onMarkerClick(property)"
      >
        <l-popup>
          <div class="property-popup">
            <div class="popup-image">
              <img
                v-if="property.images && property.images.length > 0"
                :src="property.images.find(img => img.isPrimary)?.url || property.images[0]?.url || ''"
                :alt="property.name"
                class="w-full h-24 object-cover rounded-t-lg"
              />
              <div v-else class="w-full h-24 bg-gray-200 flex items-center justify-center rounded-t-lg">
                <span class="text-gray-500 text-sm">No Image</span>
              </div>
            </div>
            <div class="popup-content p-3">
              <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ property.name }}</h3>
              <p class="text-xs text-gray-600 mb-2">{{ property.address }}</p>
              <p class="text-sm font-bold text-blue-600 mb-2">
                {{ formatPrice(property.price, property.type) }}
              </p>
              <div class="flex items-center space-x-3 text-xs text-gray-500 mb-3">
                <span v-if="property.bedrooms">{{ property.bedrooms }} bed{{ property.bedrooms > 1 ? 's' : '' }}</span>
                <span v-if="property.bathrooms">{{ property.bathrooms }} bath{{ property.bathrooms > 1 ? 's' : '' }}</span>
                <span v-if="property.squareFeet">{{ property.squareFeet.toLocaleString() }} sqft</span>
              </div>
              <div class="flex space-x-2">
                <button
                  @click="viewProperty(property.id)"
                  class="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                >
                  View Details
                </button>
                <button
                  @click="editProperty(property.id)"
                  class="px-3 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
                >
                  Edit
                </button>
              </div>
            </div>
          </div>
        </l-popup>
      </l-marker>
      
      <!-- Single property marker (for property details view) -->
      <l-marker
        v-if="singleProperty"
        :lat-lng="[singleProperty.latitude, singleProperty.longitude]"
        :icon="getMarkerIcon(singleProperty)"
      >
        <l-popup>
          <div class="property-popup">
            <div class="popup-image">
              <img
                v-if="singleProperty.images && singleProperty.images.length > 0"
                :src="singleProperty.images.find(img => img.isPrimary)?.url || singleProperty.images[0]?.url || ''"
                :alt="singleProperty.name"
                class="w-full h-24 object-cover rounded-t-lg"
              />
              <div v-else class="w-full h-24 bg-gray-200 flex items-center justify-center rounded-t-lg">
                <span class="text-gray-500 text-sm">No Image</span>
              </div>
            </div>
            <div class="popup-content p-3">
              <h3 class="font-semibold text-gray-900 text-sm mb-1">{{ singleProperty.name }}</h3>
              <p class="text-xs text-gray-600 mb-2">{{ singleProperty.address }}</p>
              <p class="text-sm font-bold text-blue-600 mb-2">
                {{ formatPrice(singleProperty.price, singleProperty.type) }}
              </p>
              <div class="flex items-center space-x-3 text-xs text-gray-500">
                <span v-if="singleProperty.bedrooms">{{ singleProperty.bedrooms }} bed{{ singleProperty.bedrooms > 1 ? 's' : '' }}</span>
                <span v-if="singleProperty.bathrooms">{{ singleProperty.bathrooms }} bath{{ singleProperty.bathrooms > 1 ? 's' : '' }}</span>
                <span v-if="singleProperty.squareFeet">{{ singleProperty.squareFeet.toLocaleString() }} sqft</span>
              </div>
            </div>
          </div>
        </l-popup>
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import L from 'leaflet'
import type { Property } from '../services/api'

// Props
interface Props {
  properties?: Property[]
  singleProperty?: Property
  height?: string
  zoom?: number
  center?: [number, number]
  clickable?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  properties: () => [],
  singleProperty: undefined,
  height: '400px',
  zoom: 13,
  center: () => [37.7749, -122.4194], // Default to San Francisco
  clickable: false
})

// Emits
const emit = defineEmits<{
  markerClick: [property: Property]
  mapClick: [lat: number, lng: number]
  mapReady: []
}>()

// Refs
const map = ref()

// Map configuration
const mapOptions = {
  zoomControl: true,
  attributionControl: true,
}

const tileLayerUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
const attribution = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'

// Computed
const mapCenter = computed(() => {
  if (props.singleProperty) {
    return [props.singleProperty.latitude, props.singleProperty.longitude] as [number, number]
  }
  
  if (props.properties.length > 0) {
    // Calculate center based on all properties
    const avgLat = props.properties.reduce((sum, p) => sum + p.latitude, 0) / props.properties.length
    const avgLng = props.properties.reduce((sum, p) => sum + p.longitude, 0) / props.properties.length
    return [avgLat, avgLng] as [number, number]
  }
  
  return props.center
})

// Methods
const onMapReady = () => {
  console.log('Map is ready')
  
  // If we have properties, fit bounds to show them all
  if (props.properties.length > 0) {
    setTimeout(() => {
      const bounds = props.properties.map(p => [p.latitude, p.longitude])
      map.value.leafletObject.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 15
      })
    }, 100) // Small delay to ensure map is fully rendered
  }
  
  emit('mapReady')
}

const onMapClick = (event: any) => {
  if (props.clickable) {
    const { lat, lng } = event.latlng
    emit('mapClick', lat, lng)
  }
}

const onMarkerClick = (property: Property) => {
  // Don't emit markerClick - let the popup handle navigation
  console.log('Marker clicked:', property.name)
}

const viewProperty = (id: number) => {
  // Navigate to property details
  window.location.href = `/properties/${id}`
}

const editProperty = (id: number) => {
  // Navigate to edit property page
  window.location.href = `/properties/${id}/edit`
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

// Custom marker icons
const getMarkerIcon = (property: Property) => {
  const color = property.status === 'available' ? '#10B981' : '#EF4444' // Green for available, red for occupied
  const size = property.type === 'rental' ? 25 : 30 // Larger for rentals
  
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: bold;
        color: white;
        cursor: pointer;
      ">
        ${property.type === 'rental' ? 'R' : 'S'}
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2]
  })
}

// Watch for changes in properties to update map bounds
watch(() => props.properties, (newProperties) => {
  if (newProperties.length > 0 && map.value) {
    // Fit map to show all properties with better padding
    const bounds = newProperties.map(p => [p.latitude, p.longitude])
    map.value.leafletObject.fitBounds(bounds, { 
      padding: [50, 50], // More padding for better visibility
      maxZoom: 15 // Don't zoom in too much if properties are close
    })
  }
}, { deep: true })

// Watch for single property changes
watch(() => props.singleProperty, (newProperty) => {
  if (newProperty && map.value) {
    map.value.leafletObject.setView([newProperty.latitude, newProperty.longitude], 15)
  }
})

// Initialize map on mount
onMounted(() => {
  console.log('MapComponent mounted')
})
</script>

<style scoped>
.map-container {
  width: 100%;
  border-radius: 0.5rem;
  overflow: hidden;
  border: 1px solid #e5e7eb;
}

.property-popup {
  min-width: 250px;
  max-width: 300px;
}

.popup-image {
  width: 100%;
  overflow: hidden;
}

.popup-content {
  background: white;
}

.property-popup h3 {
  margin: 0 0 0.25rem 0;
}

.property-popup p {
  margin: 0 0 0.25rem 0;
}

.property-popup button {
  margin-top: 0.5rem;
}

/* Custom marker styles */
:deep(.custom-marker) {
  background: transparent !important;
  border: none !important;
}

:deep(.leaflet-popup-content-wrapper) {
  border-radius: 0.5rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
}

:deep(.leaflet-popup-tip) {
  background: white;
}
</style>
