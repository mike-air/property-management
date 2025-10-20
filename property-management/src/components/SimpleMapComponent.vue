<template>
  <div class="map-container" :style="{ height: height }">
    <div ref="mapElement" class="w-full h-full"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import * as L from 'leaflet'
import 'leaflet/dist/leaflet.css'
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
const mapElement = ref<HTMLElement>()
let map: L.Map | null = null
let markers: L.Marker[] = []

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
const initMap = () => {
  if (!mapElement.value) return
  
  // Create map
  map = L.map(mapElement.value).setView(mapCenter.value, props.zoom)
  
  // Add tile layer
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map)
  
  // Add markers
  addMarkers()
  
  // Add click handler
  if (props.clickable) {
    map.on('click', (e) => {
      emit('mapClick', e.latlng.lat, e.latlng.lng)
    })
  }
  
  emit('mapReady')
  console.log('Map initialized successfully')
}

const addMarkers = () => {
  if (!map) return
  
  // Clear existing markers
  markers.forEach(marker => map?.removeLayer(marker))
  markers = []
  
  // Add single property marker
  if (props.singleProperty) {
    const marker = createMarker(props.singleProperty)
    markers.push(marker)
    marker.addTo(map)
    map.setView([props.singleProperty.latitude, props.singleProperty.longitude], 15)
    return
  }
  
  // Add multiple property markers
  if (props.properties.length > 0) {
    props.properties.forEach(property => {
      const marker = createMarker(property)
      markers.push(marker)
      marker.addTo(map!)
    })
    
    // Fit map to show all markers
    if (props.properties.length > 1) {
      const group = new L.FeatureGroup(markers)
      map.fitBounds(group.getBounds().pad(0.1))
    }
  }
}

const createMarker = (property: Property) => {
  const marker = L.marker([property.latitude, property.longitude])
  
  // Create popup content
  const popupContent = `
    <div class="property-popup">
      <h3 class="font-semibold text-gray-900">${property.name}</h3>
      <p class="text-sm text-gray-600">${property.address}</p>
      <p class="text-sm font-medium text-blue-600">${formatPrice(property.price, property.type)}</p>
      <div class="mt-2 flex space-x-2">
        <button onclick="window.viewProperty(${property.id})" class="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
          View Details
        </button>
        <button onclick="window.editProperty(${property.id})" class="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700">
          Edit
        </button>
      </div>
    </div>
  `
  
  marker.bindPopup(popupContent)
  
  // Add click handler
  marker.on('click', () => {
    emit('markerClick', property)
  })
  
  return marker
}

const formatPrice = (price: number, type: string) => {
  if (type === 'rental') {
    return `$${price.toLocaleString()}/month`
  }
  return `$${price.toLocaleString()}`
}

// Watch for changes
watch(() => props.properties, () => {
  if (map) {
    addMarkers()
  }
}, { deep: true })

watch(() => props.singleProperty, () => {
  if (map) {
    addMarkers()
  }
})

// Lifecycle
onMounted(async () => {
  await nextTick()
  initMap()
})

// Expose methods to window for popup buttons
if (typeof window !== 'undefined') {
  (window as any).viewProperty = (id: number) => {
    console.log('View property:', id)
  }
  (window as any).editProperty = (id: number) => {
    console.log('Edit property:', id)
  }
}
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
