<template>
  <div class="map-container" :style="{ height: height }">
    <l-map
      ref="map"
      :zoom="zoom"
      :center="center"
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
        @click="onMarkerClick(property)"
      >
        <l-popup>
          <div class="property-popup">
            <h3 class="font-semibold text-gray-900">{{ property.name }}</h3>
            <p class="text-sm text-gray-600">{{ property.address }}</p>
            <p class="text-sm font-medium text-blue-600">
              {{ formatPrice(property.price, property.type) }}
            </p>
            <div class="mt-2 flex space-x-2">
              <button
                @click="viewProperty(property.id)"
                class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                View Details
              </button>
              <button
                @click="editProperty(property.id)"
                class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
              >
                Edit
              </button>
            </div>
          </div>
        </l-popup>
        
        <!-- Custom marker icon based on property type -->
        <l-icon
          :icon-url="getMarkerIcon(property.type, property.status)"
          :icon-size="[25, 41]"
          :icon-anchor="[12, 41]"
        />
      </l-marker>
      
      <!-- Single property marker (for property details view) -->
      <l-marker
        v-if="singleProperty"
        :lat-lng="[singleProperty.latitude, singleProperty.longitude]"
      >
        <l-popup>
          <div class="property-popup">
            <h3 class="font-semibold text-gray-900">{{ singleProperty.name }}</h3>
            <p class="text-sm text-gray-600">{{ singleProperty.address }}</p>
            <p class="text-sm font-medium text-blue-600">
              {{ formatPrice(singleProperty.price, singleProperty.type) }}
            </p>
          </div>
        </l-popup>
        
        <l-icon
          :icon-url="getMarkerIcon(singleProperty.type, singleProperty.status)"
          :icon-size="[25, 41]"
          :icon-anchor="[12, 41]"
        />
      </l-marker>
    </l-map>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'
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
  emit('mapReady')
}

const onMapClick = (event: any) => {
  if (props.clickable) {
    const { lat, lng } = event.latlng
    emit('mapClick', lat, lng)
  }
}

const onMarkerClick = (property: Property) => {
  emit('markerClick', property)
}

const viewProperty = (id: number) => {
  // This will be handled by the parent component
  console.log('View property:', id)
}

const editProperty = (id: number) => {
  // This will be handled by the parent component
  console.log('Edit property:', id)
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

const getMarkerIcon = (type: string, status: string) => {
  // Create different colored markers based on property type and status
  const color = type === 'rental' ? 'blue' : 'green'
  const statusColor = status === 'available' ? color : 'red'
  
  // Return a colored marker icon URL
  return `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${statusColor}.png`
}

// Watch for changes in properties to update map bounds
watch(() => props.properties, (newProperties) => {
  if (newProperties.length > 0 && map.value) {
    // Fit map to show all properties
    const bounds = newProperties.map(p => [p.latitude, p.longitude])
    map.value.leafletObject.fitBounds(bounds, { padding: [20, 20] })
  }
}, { deep: true })

// Watch for single property changes
watch(() => props.singleProperty, (newProperty) => {
  if (newProperty && map.value) {
    map.value.leafletObject.setView([newProperty.latitude, newProperty.longitude], 15)
  }
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
  min-width: 200px;
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
</style>
