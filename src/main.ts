import './assets/main.css'
import 'leaflet/dist/leaflet.css'

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// Import vue-leaflet components
import { LMap, LTileLayer, LMarker, LPopup, LIcon } from '@vue-leaflet/vue-leaflet'

// Fix for default marker icons in Leaflet
import L from 'leaflet'
delete (L.Icon.Default.prototype as unknown as { _getIconUrl: unknown })._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
})

const app = createApp(App)
const pinia = createPinia()

// Register vue-leaflet components globally
app.component('LMap', LMap)
app.component('LTileLayer', LTileLayer)
app.component('LMarker', LMarker)
app.component('LPopup', LPopup)
app.component('LIcon', LIcon)

app.use(pinia)
app.use(router)

app.mount('#app')
