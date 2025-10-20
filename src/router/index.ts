import { createRouter, createWebHistory } from 'vue-router'
import LoginView from '../views/LoginView.vue'
import PropertiesView from '../views/PropertiesView.vue'
import PropertyDetailsView from '../views/PropertyDetailsView.vue'
import AddPropertyView from '../views/AddPropertyView.vue'
import EditPropertyView from '../views/EditPropertyView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/properties',
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresGuest: true },
    },
    {
      path: '/properties',
      name: 'properties',
      component: PropertiesView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/add',
      name: 'add-property',
      component: AddPropertyView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id',
      name: 'property-details',
      component: PropertyDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/properties/:id/edit',
      name: 'edit-property',
      component: EditPropertyView,
      meta: { requiresAuth: true },
    },
  ],
})

// Navigation guards
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresGuest = to.matched.some((record) => record.meta.requiresGuest)

  // Get auth state from localStorage directly to avoid Pinia context issues
  const token = localStorage.getItem('auth_token')
  const isAuthenticated = !!token

  if (requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (requiresGuest && isAuthenticated) {
    next('/properties')
  } else {
    next()
  }
})

export default router
