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

client.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('vendor_token')
    window.location.href = '/login'
  }
  if (err.response?.status === 403) useToast().error('Access denied.')
  if (err.response?.status === 500) useToast().error('Server error. Please try again.')
  return Promise.reject(err)
})

// ═══════════════════════════════════════════
// AUTH
// ═══════════════════════════════════════════
export const authApi = {
  login:    d => client.post('/auth/login', d),
  logout:   () => client.post('/auth/logout'),
  me:       () => client.get('/auth/me'),
  register: d => client.post('/vendor/register', d),
}

// ═══════════════════════════════════════════
// VENDOR PROFILE & SHOP
// ═══════════════════════════════════════════
export const vendorApi = {
  profile:        () => client.get('/vendor/profile'),
  updateProfile:  d  => client.post('/vendor/profile', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  uploadDocument: d  => client.post('/vendor/documents', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  documents:      () => client.get('/vendor/documents'),
}

// ═══════════════════════════════════════════
// PRODUCTS (vendor-scoped)
// ═══════════════════════════════════════════
export const productApi = {
  list:    p      => client.get('/vendor/products', { params: p }),
  show:    id     => client.get(`/vendor/products/${id}`),
  store:   d      => client.post('/vendor/products', d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  update:  (id,d) => client.post(`/vendor/products/${id}?_method=PUT`, d, { headers: { 'Content-Type': 'multipart/form-data' } }),
  destroy: id     => client.delete(`/vendor/products/${id}`),
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
// SETTINGS (vendor-specific)
// ═══════════════════════════════════════════
export const settingsApi = {
  list:   ()    => client.get('/vendor/settings'),
  update: d     => client.post('/vendor/settings', d),
}
