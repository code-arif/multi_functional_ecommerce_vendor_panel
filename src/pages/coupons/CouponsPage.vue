<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <DataTable
      :items="coupons"
      :columns="columns"
      :loading="loading"
      searchable
      :pagination="pagination"
      search-placeholder="Search coupon codes..."
      empty-icon="🎟️"
      empty-text="No coupons found"
      @search="q => { search = q; load(1) }"
      @page="load"
    >
      <template #actions>
        <button @click="load()"
          class="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-opacity-80 transition-colors inline-flex items-center gap-1.5"
          :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }"
          title="Refresh">
          <ArrowPathIcon class="w-4 h-4" />
        </button>
        <button @click="openForm()" class="btn-primary">
          Create Coupon
        </button>
      </template>

      <template #default="{ item }">
        <td class="table-cell">
          <p class="font-mono font-bold text-sm tracking-wider uppercase" :style="{ color: 'var(--text-primary)' }">
            {{ item.code }}
          </p>
          <p v-if="item.description" class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">
            {{ item.description }}
          </p>
        </td>

        <td class="table-cell">
          <span
            class="inline-flex items-center px-2.5 py-1 text-xs font-semibold rounded-full"
            :style="{
              background: item.type === 'percentage' ? 'var(--badge-blue-bg, #e3f2fd)' : 'var(--badge-green-bg, #e8f5e9)',
              color: item.type === 'percentage' ? '#1565c0' : '#2e7d32',
            }"
          >
            {{ item.type === 'percentage' ? `${item.value}%` : `৳${Number(item.value).toLocaleString()}` }}
          </span>
        </td>

        <td class="table-cell text-sm" :style="{ color: 'var(--text-secondary)' }">
          ৳{{ Number(item.minimum_order_amount).toLocaleString() }}
        </td>

        <td class="table-cell text-sm" :style="{ color: 'var(--text-primary)' }">
          {{ item.used_count }}{{ item.usage_limit ? ` / ${item.usage_limit}` : ' / ∞' }}
        </td>

        <td class="table-cell text-xs" :style="{ color: 'var(--text-muted)' }">
          {{ item.expires_at ? new Date(item.expires_at).toLocaleDateString() : 'Never' }}
        </td>

        <td class="table-cell">
          <StatusBadge :value="item.is_active ? 'active' : 'inactive'" />
        </td>

        <td class="table-cell text-right">
          <div class="flex items-center justify-end gap-1 whitespace-nowrap">
            <Tooltip text="Edit">
              <button @click="openForm(item)"
                class="p-1.5 rounded-lg border transition-all"
                :style="{ borderColor: 'var(--border-color)', color: 'var(--color-primary)' }">
                <PencilIcon class="w-4 h-4" />
              </button>
            </Tooltip>
            <Tooltip text="Delete">
              <button @click="confirmDelete(item)"
                class="p-1.5 rounded-lg border hover:border-red-400 transition-all"
                :style="{ borderColor: 'var(--border-color)', color: 'var(--color-danger, #ef4444)' }">
                <TrashIcon class="w-4 h-4" />
              </button>
            </Tooltip>
          </div>
        </td>
      </template>
    </DataTable>

    <!-- Create/Edit Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative z-10 h-full overflow-y-auto flex items-center justify-center p-4">
          <div
            class="relative rounded-2xl p-6 w-full max-w-lg animate-in"
            :style="{ background: 'var(--card-bg)', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }"
          >
            <h2 class="font-bold text-lg mb-5" :style="{ color: 'var(--text-primary)' }">
              {{ editing ? 'Edit' : 'Create' }} Coupon
            </h2>

            <form @submit.prevent="save" class="space-y-4">
              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Coupon Code *</label>
                  <input v-model="form.code" required class="input uppercase" placeholder="SAVE20" />
                  <p v-if="errors.code" class="text-red-500 text-xs mt-1">{{ errors.code[0] }}</p>
                </div>
                <div>
                  <label class="label">Type</label>
                  <SelectBox v-model="form.type" :options="typeOptions" full-width />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Value *</label>
                  <div class="relative">
                    <span
                      v-if="form.type === 'fixed'"
                      class="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                      :style="{ color: 'var(--text-muted)' }"
                    >৳</span>
                    <input
                      v-model.number="form.value"
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      class="input"
                      :class="{ 'pl-7': form.type === 'fixed' }"
                      :placeholder="form.type === 'percentage' ? 'e.g. 10 (for 10%)' : '0.00'"
                    />
                  </div>
                </div>
                <div>
                  <label class="label">Max Discount <span class="text-xs" :style="{ color: 'var(--text-muted)' }">(percentage only)</span></label>
                  <input v-model.number="form.maximum_discount" type="number" min="0" class="input" placeholder="No limit" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Min Order Amount</label>
                  <div class="relative">
                    <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm" :style="{ color: 'var(--text-muted)' }">৳</span>
                    <input v-model.number="form.minimum_order_amount" type="number" min="0" step="0.01" class="input pl-7" />
                  </div>
                </div>
                <div>
                  <label class="label">Usage Limit</label>
                  <input v-model.number="form.usage_limit" type="number" min="1" class="input" placeholder="Unlimited" />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Per User Limit</label>
                  <input v-model.number="form.usage_limit_per_user" type="number" min="1" class="input" />
                </div>
                <div>
                  <label class="label">Description</label>
                  <input v-model="form.description" class="input" placeholder="Coupon description..." />
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="label">Starts At</label>
                  <input v-model="form.starts_at" type="date" class="input" />
                </div>
                <div>
                  <label class="label">Expires At</label>
                  <input v-model="form.expires_at" type="date" class="input" />
                </div>
              </div>

              <ToggleSwitch v-model="form.is_active" label="Active" />

              <p v-if="errors._general" class="text-red-500 text-xs">{{ errors._general }}</p>

              <div class="flex gap-3 pt-2">
                <button type="submit" :disabled="saving" class="btn-primary flex-1 justify-center">
                  {{ saving ? 'Saving...' : 'Save Coupon' }}
                </button>
                <button type="button" @click="showForm = false"
                  class="px-5 py-2 rounded-lg border text-sm font-medium transition-colors"
                  :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }">
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Delete Confirmation -->
    <ConfirmModal
      :show="!!deleteTarget"
      title="Delete Coupon"
      :message="`Delete coupon '${deleteTarget?.code}'? This cannot be undone.`"
      :loading="deleting"
      @confirm="doDelete"
      @cancel="deleteTarget = null"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { couponApi } from '@/api'
import { PencilIcon, TrashIcon, TicketIcon, ArrowPathIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const coupons = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')
const showForm = ref(false)
const saving = ref(false)
const editing = ref(null)
const deleteTarget = ref(null)
const deleting = ref(false)
const errors = ref({})

const breadcrumbItems = computed(() => [
  { label: 'Coupons', icon: TicketIcon }
])

const form = reactive({
  code: '',
  type: 'percentage',
  value: 0,
  minimum_order_amount: 0,
  maximum_discount: null,
  usage_limit: null,
  usage_limit_per_user: 1,
  description: '',
  starts_at: '',
  expires_at: '',
  is_active: true,
})

const typeOptions = [
  { value: 'percentage', label: 'Percentage (%)' },
  { value: 'fixed', label: 'Fixed (৳)' },
]

const columns = [
  { key: 'code', label: 'Code' },
  { key: 'discount', label: 'Discount', class: 'w-28' },
  { key: 'min', label: 'Min Order', class: 'w-28' },
  { key: 'usage', label: 'Usage', class: 'w-24' },
  { key: 'expires', label: 'Expires', class: 'w-28' },
  { key: 'status', label: 'Status', class: 'w-20' },
  { key: 'actions', label: 'Action', class: 'w-20 text-right' },
]

async function load(page = 1) {
  loading.value = true
  try {
    const res = await couponApi.list({
      page,
      search: search.value,
      per_page: 15,
    })
    coupons.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch {
    toast.error('Failed to load coupons.')
  } finally {
    loading.value = false
  }
}

function openForm(item = null) {
  editing.value = item
  errors.value = {}

  if (item) {
    Object.assign(form, {
      code: item.code || '',
      type: item.type || 'percentage',
      value: item.value ?? 0,
      minimum_order_amount: item.minimum_order_amount ?? 0,
      maximum_discount: item.maximum_discount ?? null,
      usage_limit: item.usage_limit ?? null,
      usage_limit_per_user: item.usage_limit_per_user ?? 1,
      description: item.description || '',
      starts_at: item.starts_at?.slice(0, 10) || '',
      expires_at: item.expires_at?.slice(0, 10) || '',
      is_active: item.is_active ?? true,
    })
  } else {
    Object.assign(form, {
      code: '',
      type: 'percentage',
      value: 0,
      minimum_order_amount: 0,
      maximum_discount: null,
      usage_limit: null,
      usage_limit_per_user: 1,
      description: '',
      starts_at: '',
      expires_at: '',
      is_active: true,
    })
  }
  showForm.value = true
}

async function save() {
  saving.value = true
  errors.value = {}

  try {
    const payload = {
      code: form.code.toUpperCase().trim(),
      type: form.type,
      value: form.value,
      minimum_order_amount: form.minimum_order_amount || 0,
      maximum_discount: form.maximum_discount || null,
      usage_limit: form.usage_limit || null,
      usage_limit_per_user: form.usage_limit_per_user || 1,
      description: form.description || undefined,
      starts_at: form.starts_at || null,
      expires_at: form.expires_at || null,
      is_active: form.is_active,
    }

    if (editing.value) {
      await couponApi.update(editing.value.id, payload)
      toast.success('Coupon updated.')
    } else {
      await couponApi.store(payload)
      toast.success('Coupon created.')
    }

    showForm.value = false
    load()
  } catch (e) {
    if (e.response?.status === 422) {
      const serverErrors = e.response.data.errors || {}
      // Map server errors to form fields
      Object.keys(serverErrors).forEach(key => {
        errors.value[key] = serverErrors[key]
      })
      const firstError = Object.values(serverErrors)[0]?.[0]
      toast.error(firstError || 'Validation failed.')
    } else {
      toast.error(e.response?.data?.message || 'Failed to save coupon.')
    }
  } finally {
    saving.value = false
  }
}

function confirmDelete(item) {
  deleteTarget.value = item
}

async function doDelete() {
  deleting.value = true
  try {
    await couponApi.destroy(deleteTarget.value.id)
    toast.success('Coupon deleted.')
    deleteTarget.value = null
    load()
  } catch {
    toast.error('Failed to delete coupon.')
  } finally {
    deleting.value = false
  }
}

onMounted(() => load())
</script>
