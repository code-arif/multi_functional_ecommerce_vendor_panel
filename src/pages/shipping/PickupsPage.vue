<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Pickup Requests List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Pickup Requests</h3>
            <button @click="showForm = true" class="btn-primary text-xs py-1.5 px-3">
              <PlusIcon class="w-4 h-4" />
              New Pickup
            </button>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">Loading...</div>
          <div v-else-if="pickups.length === 0" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <TruckIcon class="w-8 h-8 mx-auto mb-2" />
            No pickup requests yet
          </div>
          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="pickup in pickups" :key="pickup.id" class="flex items-center gap-4 px-5 py-3.5">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
                  Pickup #{{ pickup.id }}
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  {{ pickup.address || pickup.location || '—' }}
                </p>
              </div>
              <StatusBadge :value="pickup.status" />
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ formatDate(pickup.created_at) }}</span>
              <button v-if="pickup.status === 'pending'" @click="cancelPickup(pickup.id)"
                class="text-xs font-semibold px-2 py-1 rounded transition"
                :style="{ color: 'var(--danger)' }"
                @mouseenter="e => e.target.style.backgroundColor = 'color-mix(in srgb, var(--danger) 10%, transparent)'"
                @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- New Pickup Form -->
      <div v-if="showForm" class="card p-5">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">New Pickup Request</h3>
        <form @submit.prevent="submitPickup" class="space-y-4">
          <div>
            <label class="label">Pickup Address</label>
            <textarea v-model="form.address" rows="3" class="input" placeholder="Enter pickup address..."></textarea>
          </div>
          <div>
            <label class="label">Contact Phone</label>
            <input v-model="form.phone" type="text" class="input" placeholder="Phone number" />
          </div>
          <div>
            <label class="label">Preferred Date</label>
            <input v-model="form.preferred_date" type="date" class="input" />
          </div>
          <div>
            <label class="label">Notes</label>
            <textarea v-model="form.notes" rows="2" class="input" placeholder="Special instructions..."></textarea>
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="submitting" class="btn-primary flex-1">
              {{ submitting ? 'Submitting...' : 'Submit Request' }}
            </button>
            <button @click="showForm = false" type="button"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :style="{ color: 'var(--text-secondary)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { shippingApi } from '@/api'

import { TruckIcon, PlusIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const pickups = ref([])
const loading = ref(true)
const showForm = ref(false)
const submitting = ref(false)
const form = ref({ address: '', phone: '', preferred_date: '', notes: '' })

const breadcrumbItems = computed(() => [
  { label: 'Shipping', icon: TruckIcon, to: '/shipping' },
  { label: 'Pickups', icon: null },
])

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function load() {
  loading.value = true
  try {
    const res = await shippingApi.pickups()
    pickups.value = res.data.data || []
  } finally {
    loading.value = false
  }
}

async function submitPickup() {
  if (!form.value.address) return
  submitting.value = true
  try {
    await shippingApi.createPickup(form.value)
    toast.success('Pickup request submitted.')
    showForm.value = false
    form.value = { address: '', phone: '', preferred_date: '', notes: '' }
    load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to submit pickup request.')
  } finally {
    submitting.value = false
  }
}

async function cancelPickup(id) {
  try {
    await shippingApi.cancelPickup(id)
    toast.success('Pickup request cancelled.')
    load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to cancel pickup.')
  }
}

onMounted(() => load())
</script>
