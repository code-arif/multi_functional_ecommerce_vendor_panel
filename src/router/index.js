import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import VendorLayout from '@/components/layout/VendorLayout.vue'
import LoginPage from '@/pages/LoginPage.vue'

const routes = [
  {
    path: '/login',
    name: 'login',
    component: LoginPage,
    meta: { guest: true },
  },

  {
    path: '/',
    component: VendorLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        name: 'dashboard',
        component: () => import('@/pages/DashboardPage.vue'),
      },

      // Products
      {
        path: 'products',
        name: 'products',
        component: () => import('@/pages/products/ProductsPage.vue'),
      },
      {
        path: 'products/create',
        name: 'products-create',
        component: () => import('@/pages/products/ProductFormPage.vue'),
      },
      {
        path: 'products/:id',
        name: 'products-detail',
        component: () => import('@/pages/products/ProductDetailPage.vue'),
      },
      {
        path: 'products/:id/edit',
        name: 'products-edit',
        component: () => import('@/pages/products/ProductFormPage.vue'),
      },

      // Orders
      {
        path: 'orders',
        name: 'orders',
        component: () => import('@/pages/orders/OrdersPage.vue'),
      },
      {
        path: 'orders/:id',
        name: 'orders-detail',
        component: () => import('@/pages/orders/OrderDetailPage.vue'),
      },

      // Inventory
      {
        path: 'inventory',
        name: 'inventory',
        component: () => import('@/pages/inventory/InventoryPage.vue'),
      },
      {
        path: 'inventory/logs',
        name: 'inventory-logs',
        component: () => import('@/pages/inventory/InventoryLogsPage.vue'),
      },

      // Coupons
      {
        path: 'coupons',
        name: 'coupons',
        component: () => import('@/pages/coupons/CouponsPage.vue'),
      },

      // Reviews
      {
        path: 'reviews',
        name: 'reviews',
        component: () => import('@/pages/reviews/ReviewsPage.vue'),
      },

      // Wallet & Finance
      {
        path: 'wallet',
        name: 'wallet',
        component: () => import('@/pages/wallet/WalletPage.vue'),
      },
      {
        path: 'wallet/payouts',
        name: 'wallet-payouts',
        component: () => import('@/pages/wallet/PayoutsPage.vue'),
      },
      {
        path: 'wallet/transactions',
        name: 'wallet-transactions',
        component: () => import('@/pages/wallet/TransactionsPage.vue'),
      },

      // Shipping
      {
        path: 'shipping',
        name: 'shipping',
        component: () => import('@/pages/shipping/ShippingPage.vue'),
      },
      {
        path: 'shipping/pickups',
        name: 'shipping-pickups',
        component: () => import('@/pages/shipping/PickupsPage.vue'),
      },

      // Support Tickets
      {
        path: 'support',
        name: 'support',
        component: () => import('@/pages/support/SupportPage.vue'),
      },
      {
        path: 'support/:id',
        name: 'support-detail',
        component: () => import('@/pages/support/TicketDetailPage.vue'),
      },

      // Settings
      {
        path: 'settings',
        name: 'settings',
        component: () => import('@/pages/settings/ShopSettingsPage.vue'),
      },
      {
        path: 'settings/documents',
        name: 'settings-documents',
        component: () => import('@/pages/settings/DocumentsPage.vue'),
      },
      {
        path: 'settings/addresses',
        name: 'settings-addresses',
        component: () => import('@/pages/settings/AddressesPage.vue'),
      },
      {
        path: 'settings/bank',
        name: 'settings-bank',
        component: () => import('@/pages/settings/BankSettingsPage.vue'),
      },
      {
        path: 'settings/staff',
        name: 'settings-staff',
        component: () => import('@/pages/settings/StaffPage.vue'),
      },
    ],
  },

  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 }),
})

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()
  if (to.meta.requiresAuth && !auth.isLoggedIn) return next('/login')
  if (to.meta.guest && auth.isLoggedIn) return next('/')
  next()
})

export default router
