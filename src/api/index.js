import axios from 'axios'
import { useToast } from 'vue-toastification'

const BASE = import.meta.env.VITE_VENDOR_API_URL || 'http://localhost:8000/api/v1'

export const client = axios.create({
  baseURL: BASE,
  headers: { Accept: 'application/json' },
  timeout: 20000,
})

client.interceptors.request.use(cfg => {
  const t = localStorage.getItem('vendor_token')
  if (t) cfg.headers.Authorization = `Bearer ${t}`
  return cfg
})

let inactiveRedirectLock = false
let onVendorInactiveHandler = null

export function setVendorInactiveHandler(fn) {
  onVendorInactiveHandler = fn
}

client.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('vendor_token')
    localStorage.removeItem('vendor_user')
    localStorage.removeItem('vendor_shop')
    if (window.location.pathname !== '/login') {
      window.location.href = '/login'
    }
  } else if (err.response?.status === 403 && err.response?.data?.code === 'VENDOR_NOT_ACTIVE') {
    const payload = err.response.data.data || {}
    if (!inactiveRedirectLock) {
      inactiveRedirectLock = true
      useToast().warning(err.response.data.message || 'Your shop account is currently inactive.')
      if (onVendorInactiveHandler) {
        onVendorInactiveHandler(payload)
      }
      setTimeout(() => { inactiveRedirectLock = false }, 2500)
    }
  } else if (err.response?.status === 403) {
    useToast().error(err.response?.data?.message || 'Access denied.')
  } else if (err.response?.status === 500) {
    useToast().error('Server error. Please try again.')
  }
  return Promise.reject(err)
})

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
export const authApi = {
  login:       d => client.post('/auth/vendor/login', d),
  sendOtp:     d => client.post('/auth/vendor/otp/send', d),
  verifyOtp:   d => client.post('/auth/vendor/otp/verify', d),
  logout:      () => client.post('/auth/logout'),
  me:          () => client.get('/auth/me'),
  register:    d => client.post('/auth/vendor/register', d),
}

// ═══════════════════════════════════════════
// VENDOR PROFILE & SHOP
// ═══════════════════════════════════════════
export const vendorApi = {
  profile:        ()   => client.get('/vendor/profile'),
  updateProfile:  d    => client.post('/vendor/profile?_method=PUT', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument: d    => client.post('/vendor/documents', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  documents:      ()   => client.get('/vendor/documents'),
  deleteDocument: uuid => client.delete(`/vendor/documents/${uuid}`),
}

// ═══════════════════════════════════════════
// PAYOUT BANK ACCOUNTS & SHOP ADDRESSES
// ═══════════════════════════════════════════
export const bankAccountApi = {
  list:       ()       => client.get('/vendor/bank-accounts'),
  store:      d        => client.post('/vendor/bank-accounts', d),
  update:     (id, d)  => client.put(`/vendor/bank-accounts/${id}`, d),
  setDefault: id       => client.post(`/vendor/bank-accounts/${id}/default`),
  destroy:    id       => client.delete(`/vendor/bank-accounts/${id}`),
}

export const addressApi = {
  list:       ()       => client.get('/vendor/addresses'),
  store:      d        => client.post('/vendor/addresses', d),
  update:     (id, d)  => client.put(`/vendor/addresses/${id}`, d),
  setDefault: id       => client.post(`/vendor/addresses/${id}/default`),
  destroy:    id       => client.delete(`/vendor/addresses/${id}`),
}

// ═══════════════════════════════════════════
// CATALOG (vendor-scoped categories & brands)
// ═══════════════════════════════════════════
export const categoryApi = {
  list:  p => client.get('/vendor/categories', { params: p }),
  store: d => client.post('/vendor/categories/store', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

export const brandApi = {
  list:  p => client.get('/vendor/brands', { params: p }),
  store: d => client.post('/vendor/brands/store', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
}

// ═══════════════════════════════════════════
// PRODUCTS (vendor-scoped)
// ═══════════════════════════════════════════
export const productApi = {
  list:        p        => client.get('/vendor/products', { params: p }),
  show:        uuid     => client.get(`/vendor/products/${uuid}`),
  store:       d        => client.post('/vendor/products', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:      (uuid,d) => client.post(`/vendor/products/${uuid}?_method=PUT`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadImage: d        => client.post('/vendor/products/upload-image', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadVideo: d        => client.post('/vendor/products/upload-video', d, { headers: { 'Content-Type': 'multipart/form-data' }, timeout: 120000 }),
  destroy:     uuid     => client.delete(`/vendor/products/${uuid}`),
}

// ═══════════════════════════════════════════
// ORDERS (vendor-scoped)
// ═══════════════════════════════════════════
export const orderApi = {
  list:         p        => client.get('/vendor/orders', { params: p }),
  show:         id       => client.get(`/vendor/orders/${id}`),
  updateStatus: (id,d)   => client.patch(`/vendor/orders/${id}/status`, d),
}

// ═══════════════════════════════════════════
// INVENTORY & WAREHOUSES
// ═══════════════════════════════════════════
export const inventoryApi = {
  list:         p  => client.get('/vendor/inventory', { params: p }),
  summary:      () => client.get('/vendor/inventory/summary'),
  lowStock:     () => client.get('/vendor/inventory/low-stock'),
  outOfStock:   () => client.get('/vendor/inventory/out-of-stock'),
  adjust:       d  => client.post('/vendor/inventory/adjust', d),
  logs:         p  => client.get('/vendor/inventory/logs', { params: p }),
}

export const warehouseApi = {
  list:    ()      => client.get('/vendor/warehouses'),
  store:   d       => client.post('/vendor/warehouses', d),
  show:    id      => client.get(`/vendor/warehouses/${id}`),
  update:  (id,d)  => client.put(`/vendor/warehouses/${id}`, d),
  destroy: id      => client.delete(`/vendor/warehouses/${id}`),
}

// ═══════════════════════════════════════════
// WALLET & FINANCE
// ═══════════════════════════════════════════
export const financeApi = {
  wallet:       ()  => client.get('/vendor/finance/wallet'),
  transactions: p   => client.get('/vendor/finance/transactions', { params: p }),
  commissions:  p   => client.get('/vendor/finance/commissions', { params: p }),
  payouts:      p   => client.get('/vendor/finance/payouts', { params: p }),
  requestPayout: d  => client.post('/vendor/finance/payouts', d),
  settlements:  p   => client.get('/vendor/finance/settlements', { params: p }),
}

// ═══════════════════════════════════════════
// COUPONS (vendor-scoped)
// ═══════════════════════════════════════════
export const couponApi = {
  list:    p      => client.get('/vendor/coupons', { params: p }),
  store:   d      => client.post('/vendor/coupons', d),
  update:  (id,d) => client.put(`/vendor/coupons/${id}`, d),
  destroy: id     => client.delete(`/vendor/coupons/${id}`),
}

// ═══════════════════════════════════════════
// REVIEWS (vendor-scoped)
// ═══════════════════════════════════════════
export const reviewApi = {
  list:    p  => client.get('/vendor/reviews', { params: p }),
  reply:   (id,d) => client.post(`/vendor/reviews/${id}/reply`, d),
}

// ═══════════════════════════════════════════
// SHIPPING
// ═══════════════════════════════════════════
export const shippingApi = {
  shipments:      p    => client.get('/vendor/shipping/shipments', { params: p }),
  shipmentShow:   id   => client.get(`/vendor/shipping/shipments/${id}`),
  updateShipment: (id,d) => client.post(`/vendor/shipping/shipments/${id}/status`, d),
  tracking:       id   => client.get(`/vendor/shipping/shipments/${id}/tracking`),
  pickups:        ()   => client.get('/vendor/shipping/pickups'),
  createPickup:   d    => client.post('/vendor/shipping/pickups', d),
  cancelPickup:   id   => client.post(`/vendor/shipping/pickups/${id}/cancel`),
}

// ═══════════════════════════════════════════
// SUPPORT TICKETS
// ═══════════════════════════════════════════
export const supportApi = {
  tickets:         p       => client.get('/support/tickets', { params: p }),
  ticketShow:      id      => client.get(`/support/tickets/${id}`),
  createTicket:    d       => client.post('/support/tickets', d),
  ticketMessage:   (id,d)  => client.post(`/support/tickets/${id}/messages`, d),
  faqs:            ()      => client.get('/support/faqs'),
}

// ═══════════════════════════════════════════
// DASHBOARD / STATS
// ═══════════════════════════════════════════
export const dashboardApi = {
  stats: () => client.get('/vendor/dashboard'),
}

// ═══════════════════════════════════════════
// STAFF (vendor-specific)
// ═══════════════════════════════════════════
export const staffApi = {
  list:     ()      => client.get('/vendor/staff'),
  store:    d       => client.post('/vendor/staff', d),
  toggle:   id      => client.post(`/vendor/staff/${id}/toggle-status`),
  update:   (id,d)  => client.put(`/vendor/staff/${id}`, d),
  destroy:  id      => client.delete(`/vendor/staff/${id}`),
}

// ═══════════════════════════════════════════
// SETTINGS (vendor-specific)
// ═══════════════════════════════════════════
export const settingsApi = {
  list:   ()    => client.get('/vendor/settings'),
  update: d     => client.post('/vendor/settings', d),
}

// ═══════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════
export const notificationApi = {
  list:        p  => client.get('/notifications', { params: p }),
  markAsRead:  id => client.post(`/notifications/${id}/read`),
  markAllRead: () => client.post('/notifications/read-all'),
  destroy:     id => client.delete(`/notifications/${id}`),
}
