<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Address List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-center gap-3">
              <MapPinIcon class="w-5 h-5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Shop & Pickup Addresses</h2>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Business, courier pickup, and customer return addresses
                </p>
              </div>
            </div>
            <button @click="openCreateForm" class="btn-primary text-xs py-2 px-3">
              <PlusIcon class="w-4 h-4" />
              Add Address
            </button>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            Loading addresses...
          </div>

          <div v-else-if="addresses.length === 0" class="p-10 text-center">
            <MapPinIcon class="w-10 h-10 mx-auto mb-3 opacity-50" :style="{ color: 'var(--text-muted)' }" />
            <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">No shop addresses added yet</p>
            <p class="text-xs mt-1 mb-4" :style="{ color: 'var(--text-muted)' }">
              Add your main business or pickup hub address for courier dispatch and returns.
            </p>
            <button @click="openCreateForm" class="btn-primary text-xs">
              <PlusIcon class="w-4 h-4" />
              Add First Address
            </button>
          </div>

          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="addr in addresses" :key="addr.uuid" class="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div class="space-y-1 min-w-0">
                <div class="flex items-center gap-2 flex-wrap">
                  <span class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                    {{ addr.label || 'Shop Address' }}
                  </span>
                  <span v-if="addr.is_default"
                    class="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full"
                    :style="{ backgroundColor: 'color-mix(in srgb, var(--success) 15%, transparent)', color: 'var(--success)' }">
                    <CheckCircleIcon class="w-3.5 h-3.5" />
                    Default
                  </span>
                </div>
                <p class="text-xs" :style="{ color: 'var(--text-secondary)' }">
                  {{ addr.address_line_1 }}
                  <span v-if="addr.address_line_2">, {{ addr.address_line_2 }}</span>
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  {{ [addr.city, addr.state, addr.postal_code, addr.country].filter(Boolean).join(', ') }}
                </p>
              </div>

              <div class="flex items-center gap-2 shrink-0">
                <button v-if="!addr.is_default" @click="setDefault(addr)" :disabled="busyUuid === addr.uuid"
                  class="text-xs font-semibold px-2.5 py-1.5 rounded-lg transition"
                  :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }">
                  Set Default
                </button>
                <button @click="editAddress(addr)"
                  class="p-1.5 rounded-lg transition"
                  :style="{ color: 'var(--text-secondary)' }"
                  title="Edit">
                  <PencilSquareIcon class="w-4 h-4" />
                </button>
                <button @click="confirmDelete(addr)"
                  class="p-1.5 rounded-lg transition"
                  :style="{ color: 'var(--danger)' }"
                  title="Delete">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Create / Edit Form -->
      <div v-if="showForm" class="card p-5 h-fit">
        <div class="flex items-center justify-between mb-4">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
            {{ editingUuid ? 'Edit Address' : 'Add Shop Address' }}
          </h3>
          <button @click="closeForm" class="text-xs" :style="{ color: 'var(--text-muted)' }">Close</button>
        </div>

        <form @submit.prevent="saveAddress" class="space-y-3.5">
          <div>
            <label class="label">Label</label>
            <input v-model="form.label" type="text" class="input" placeholder="e.g. Main Business Address, Pickup Hub" />
            <div class="flex flex-wrap gap-1.5 mt-1.5">
              <button v-for="preset in labelPresets" :key="preset" type="button"
                @click="form.label = preset"
                class="text-[11px] px-2 py-0.5 rounded border transition"
                :style="{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }">
                {{ preset }}
              </button>
            </div>
          </div>

          <div>
            <label class="label">Street Address <span class="text-red-500">*</span></label>
            <input v-model="form.address_line_1" type="text" required class="input" placeholder="House, road, block / sector" />
          </div>

          <div>
            <label class="label">Apartment / Floor / Area</label>
            <input v-model="form.address_line_2" type="text" class="input" placeholder="Suite, landmark (optional)" />
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">City <span class="text-red-500">*</span></label>
              <input v-model="form.city" type="text" required class="input" placeholder="e.g. Dhaka" />
            </div>
            <div>
              <label class="label">Division / State</label>
              <input v-model="form.state" type="text" class="input" placeholder="e.g. Dhaka" />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-3">
            <div>
              <label class="label">Postal Code</label>
              <input v-model="form.postal_code" type="text" class="input" placeholder="e.g. 1212" />
            </div>
            <div>
              <label class="label">Country</label>
              <input v-model="form.country" type="text" class="input" placeholder="Bangladesh" />
            </div>
          </div>

          <label class="flex items-center gap-2 cursor-pointer text-xs pt-1" :style="{ color: 'var(--text-secondary)' }">
            <input v-model="form.is_default" type="checkbox" class="rounded" />
            Set as default shop address
          </label>

          <div class="flex gap-2 pt-2">
            <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
              {{ saving ? 'Saving...' : (editingUuid ? 'Update Address' : 'Save Address') }}
            </button>
            <button type="button" @click="closeForm" class="btn-ghost">Cancel</button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="deleteModal.show"
      :loading="deleteModal.loading"
      title="Delete Address"
      :message="`Remove '${deleteModal.item?.label || deleteModal.item?.address_line_1 || 'this address'}'?`"
      confirmText="Delete"
      @confirm="executeDelete"
      @cancel="deleteModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { addressApi } from '@/api'
import {
  Cog6ToothIcon,
  MapPinIcon,
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  CheckCircleIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const loading = ref(true)
const saving = ref(false)
const busyUuid = ref(null)
const addresses = ref([])
const showForm = ref(false)
const editingUuid = ref(null)

const labelPresets = ['Main Business Address', 'Pickup Warehouse', 'Return Center']

const deleteModal = reactive({
  show: false,
  loading: false,
  item: null,
})

const form = reactive({
  label: 'Main Business Address',
  address_line_1: '',
  address_line_2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'Bangladesh',
  is_default: false,
})

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
  { label: 'Shop Addresses', icon: null },
])

function resetForm() {
  form.label = 'Main Business Address'
  form.address_line_1 = ''
  form.address_line_2 = ''
  form.city = ''
  form.state = ''
  form.postal_code = ''
  form.country = 'Bangladesh'
  form.is_default = addresses.value.length === 0
}

function openCreateForm() {
  editingUuid.value = null
  resetForm()
  showForm.value = true
}

function editAddress(addr) {
  editingUuid.value = addr.uuid
  form.label = addr.label || 'Main Business Address'
  form.address_line_1 = addr.address_line_1 || ''
  form.address_line_2 = addr.address_line_2 || ''
  form.city = addr.city || ''
  form.state = addr.state || ''
  form.postal_code = addr.postal_code || ''
  form.country = addr.country || 'Bangladesh'
  form.is_default = !!addr.is_default
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingUuid.value = null
}

async function loadAddresses() {
  loading.value = true
  try {
    const res = await addressApi.list()
    addresses.value = res.data?.data || []
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load addresses.')
  } finally {
    loading.value = false
  }
}

async function saveAddress() {
  saving.value = true
  try {
    const payload = { ...form }
    if (editingUuid.value) {
      await addressApi.update(editingUuid.value, payload)
      toast.success('Address updated.')
    } else {
      await addressApi.store(payload)
      toast.success('Address added.')
    }
    closeForm()
    await loadAddresses()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to save address.')
  } finally {
    saving.value = false
  }
}

async function setDefault(addr) {
  busyUuid.value = addr.uuid
  try {
    await addressApi.setDefault(addr.uuid)
    toast.success('Default address updated.')
    await loadAddresses()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update default address.')
  } finally {
    busyUuid.value = null
  }
}

function confirmDelete(addr) {
  deleteModal.item = addr
  deleteModal.show = true
}

async function executeDelete() {
  if (!deleteModal.item) return
  deleteModal.loading = true
  try {
    await addressApi.destroy(deleteModal.item.uuid)
    toast.success('Address deleted.')
    deleteModal.show = false
    deleteModal.item = null
    await loadAddresses()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete address.')
  } finally {
    deleteModal.loading = false
  }
}

onMounted(loadAddresses)
</script>
