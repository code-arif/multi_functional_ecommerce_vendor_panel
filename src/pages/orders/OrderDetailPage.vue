<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <!-- Loading -->
    <div v-if="loading" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      <div class="animate-spin w-6 h-6 border-2 border-t-transparent rounded-full mx-auto mb-3"
        :style="{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }"></div>
      Loading order details...
    </div>

    <!-- Error -->
    <div v-else-if="error" class="card p-12 text-center">
      <ExclamationTriangleIcon class="w-10 h-10 mx-auto mb-3" :style="{ color: 'var(--danger)' }" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Order Not Found</h3>
      <p class="text-sm mb-4" :style="{ color: 'var(--text-muted)' }">{{ error }}</p>
      <router-link to="/orders" class="btn-primary">Back to Orders</router-link>
    </div>

    <!-- Order Detail -->
    <template v-if="!loading && !error && order">
      <!-- Header -->
      <div class="card p-5 mb-6">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h2 class="text-xl font-black" :style="{ color: 'var(--text-primary)' }">
              Order #{{ order.order_number }}
            </h2>
            <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">
              Placed on {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="flex items-center gap-3">
            <StatusBadge :value="order.status" size="lg" />
          </div>
        </div>
      </div>

      <!-- Order Summary Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <!-- Customer Info -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Customer</h3>
          <div class="space-y-2 text-sm">
            <p :style="{ color: 'var(--text-secondary)' }">
              <span class="font-semibold">Name:</span> {{ order.user?.name || 'N/A' }}
            </p>
            <p :style="{ color: 'var(--text-secondary)' }">
              <span class="font-semibold">Email:</span> {{ order.user?.email || 'N/A' }}
            </p>
            <p :style="{ color: 'var(--text-secondary)' }">
              <span class="font-semibold">Phone:</span> {{ order.shipping_address?.phone || order.user?.phone || 'N/A' }}
            </p>
          </div>
        </div>

        <!-- Shipping Address -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Shipping Address</h3>
          <div class="space-y-1 text-sm" :style="{ color: 'var(--text-secondary)' }">
            <p class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ order.shipping_address?.name || 'N/A' }}</p>
            <p>{{ order.shipping_address?.address }}, {{ order.shipping_address?.city }}</p>
            <p>{{ order.shipping_address?.state }} {{ order.shipping_address?.zip }}</p>
            <p>{{ order.shipping_address?.country }}</p>
            <p>Phone: {{ order.shipping_address?.phone }}</p>
          </div>
        </div>

        <!-- Payment & Shipping Info -->
        <div class="card p-5">
          <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Payment & Shipping</h3>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span :style="{ color: 'var(--text-secondary)' }">Payment Method</span>
              <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ order.payment_method || 'N/A' }}</span>
            </div>
            <div class="flex justify-between">
              <span :style="{ color: 'var(--text-secondary)' }">Payment Status</span>
              <StatusBadge :value="order.payment_status" />
            </div>
            <div class="flex justify-between">
              <span :style="{ color: 'var(--text-secondary)' }">Shipping Method</span>
              <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">{{ order.shipping_method || 'N/A' }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Order Items -->
      <div class="card overflow-hidden mb-6">
        <div class="px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Order Items</h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full">
            <thead>
              <tr>
                <th class="table-header">Product</th>
                <th class="table-header">Price</th>
                <th class="table-header">Qty</th>
                <th class="table-header text-right">Total</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in (order.items || [])" :key="item.id" class="table-row">
                <td class="table-cell">
                  <div class="flex items-center gap-3">
                    <div class="w-10 h-10 rounded-lg overflow-hidden shrink-0" :style="{ background: 'var(--border-light)' }">
                      <img v-if="item.product?.thumbnail_url || item.image" :src="item.product?.thumbnail_url || item.image"
                        class="w-full h-full object-cover" />
                      <div v-else class="w-full h-full flex items-center justify-center">
                        <ShoppingBagIcon class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
                      </div>
                    </div>
                    <div>
                      <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
                        {{ item.product?.name || item.name || 'Product' }}
                      </p>
                      <p v-if="item.variant" class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ item.variant }}</p>
                    </div>
                  </div>
                </td>
                <td class="table-cell font-semibold" :style="{ color: 'var(--text-primary)' }">
                  ৳{{ Number(item.price || item.unit_price).toLocaleString() }}
                </td>
                <td class="table-cell">× {{ item.quantity }}</td>
                <td class="table-cell text-right font-bold" :style="{ color: 'var(--text-primary)' }">
                  ৳{{ Number(item.total || item.subtotal).toLocaleString() }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Order Totals -->
      <div class="card p-5 mb-6">
        <div class="max-w-xs ml-auto space-y-2">
          <div class="flex justify-between text-sm" :style="{ color: 'var(--text-secondary)' }">
            <span>Subtotal</span>
            <span>৳{{ Number(order.subtotal || 0).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between text-sm" :style="{ color: 'var(--text-secondary)' }">
            <span>Shipping</span>
            <span>৳{{ Number(order.shipping_cost || 0).toLocaleString() }}</span>
          </div>
          <div v-if="order.discount_amount > 0" class="flex justify-between text-sm" :style="{ color: 'var(--success)' }">
            <span>Discount</span>
            <span>-৳{{ Number(order.discount_amount).toLocaleString() }}</span>
          </div>
          <div v-if="order.tax_amount > 0" class="flex justify-between text-sm" :style="{ color: 'var(--text-secondary)' }">
            <span>Tax</span>
            <span>৳{{ Number(order.tax_amount).toLocaleString() }}</span>
          </div>
          <div class="flex justify-between font-bold text-base pt-2 border-t"
            :style="{ color: 'var(--text-primary)', borderTopColor: 'var(--border)' }">
            <span>Total</span>
            <span>৳{{ Number(order.total || order.total_amount).toLocaleString() }}</span>
          </div>
        </div>
      </div>

      <!-- Update Status -->
      <div class="card p-5 mb-6">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Update Order Status</h3>
        <div class="flex items-center gap-4">
          <SelectBox
            v-model="newStatus"
            :options="statusTransitionOptions"
            placeholder="Select new status..."
          />
          <button @click="updateStatus" :disabled="!newStatus || updating"
            class="btn-primary">
            {{ updating ? 'Updating...' : 'Update Status' }}
          </button>
        </div>
        <div v-if="order.notes" class="mt-3 p-3 rounded-lg text-sm"
          :style="{ backgroundColor: 'var(--border-light)' }">
          <span class="font-semibold" :style="{ color: 'var(--text-primary)' }">Note:</span>
          <span :style="{ color: 'var(--text-secondary)' }"> {{ order.notes }}</span>
        </div>
      </div>

      <!-- Status History -->
      <div class="card overflow-hidden">
        <div class="px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Status History</h3>
        </div>
        <div class="p-5">
          <div v-if="!(order.status_histories && order.status_histories.length)" class="text-center py-4 text-sm" :style="{ color: 'var(--text-muted)' }">
            No status history available.
          </div>
          <div v-else class="relative">
            <div v-for="(history, index) in order.status_histories" :key="index" class="flex gap-4 pb-6 relative">
              <div class="flex flex-col items-center">
                <div class="w-3 h-3 rounded-full shrink-0"
                  :style="{ backgroundColor: index === 0 ? 'var(--color-primary)' : 'var(--text-muted)' }"></div>
                <div v-if="index < order.status_histories.length - 1" class="w-0.5 flex-1 mt-1"
                  :style="{ backgroundColor: 'var(--border)' }"></div>
              </div>
              <div>
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
                  {{ history.status || history.to_status }}
                </p>
                <p v-if="history.note" class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">
                  {{ history.note }}
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  {{ formatDate(history.created_at) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { orderApi } from '@/api'

import {
  ClipboardDocumentListIcon,
  ShoppingBagIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const order = ref(null)
const loading = ref(true)
const error = ref(null)
const newStatus = ref('')
const updating = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Orders', icon: ClipboardDocumentListIcon, to: '/orders' },
  { label: order.value ? `#${order.value.order_number}` : 'Loading...', icon: null },
])

const statusTransitionOptions = [
  { value: '', label: 'Select new status...' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'shipped', label: 'Shipped' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

async function load() {
  loading.value = true
  error.value = null
  try {
    const res = await orderApi.show(route.params.id)
    order.value = res.data.data || res.data
  } catch (e) {
    error.value = e.response?.data?.message || 'Failed to load order details.'
  } finally {
    loading.value = false
  }
}

async function updateStatus() {
  if (!newStatus.value || !order.value) return
  updating.value = true
  try {
    const res = await orderApi.updateStatus(order.value.id, { status: newStatus.value })
    order.value = res.data.data || res.data
    newStatus.value = ''
    toast.success('Order status updated successfully.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update status.')
  } finally {
    updating.value = false
  }
}

onMounted(() => load())
</script>
