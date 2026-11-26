<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <DataTable
      :items="brands"
      :columns="columns"
      :loading="loading"
      searchable
      :pagination="pagination"
      search-placeholder="Search brands..."
      empty-icon="🏭"
      empty-text="No brands found"
      @search="q => { search = q; load(1) }"
      @page="load"
    >
      <template #filters>
        <SelectBox
          v-model="statusFilter"
          :options="statusOptions"
          placeholder="All Approval"
          size="md"
          @change="load(1)"
        />
      </template>

      <template #actions>
        <button
          @click="load(pagination?.current_page || 1)"
          class="px-3 py-2 rounded-lg border text-xs font-medium hover:bg-opacity-80 transition-colors inline-flex items-center gap-1.5"
          :style="{ borderColor: 'var(--border)', color: 'var(--text-muted)' }"
          title="Refresh"
        >
          <ArrowPathIcon class="w-4 h-4" />
        </button>
        <button @click="openForm" class="btn-primary">
          Propose Brand
        </button>
      </template>

      <template #default="{ item }">
        <td class="table-cell">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-lg overflow-hidden shrink-0 flex items-center justify-center" :style="{ background: 'var(--border-light)' }">
              <img v-if="item.logo_url" :src="item.logo_url" class="w-full h-full object-contain p-1" />
              <BuildingStorefrontIcon v-else class="w-4 h-4" :style="{ color: 'var(--text-muted)' }" />
            </div>
            <div>
              <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">{{ item.name }}</p>
              <a v-if="item.website" :href="item.website" target="_blank" rel="noopener noreferrer"
                class="text-xs text-blue-600 hover:underline">{{ item.website }}</a>
              <p v-else class="text-xs" :style="{ color: 'var(--text-muted)' }">/{{ item.slug }}</p>
            </div>
          </div>
        </td>
        <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">{{ item.products_count || 0 }} products</td>
        <td class="table-cell">
          <StatusBadge :value="item.status" />
        </td>
        <td class="table-cell">
          <StatusBadge :value="item.is_active ? 'active' : 'inactive'" />
        </td>
      </template>
    </DataTable>

    <!-- Propose Brand Modal -->
    <Teleport to="body">
      <div v-if="showForm" class="fixed inset-0 z-50 overflow-y-auto">
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm" @click="showForm = false" />
        <div class="relative z-10 flex min-h-full items-center justify-center p-4 sm:p-6">
          <div
            class="relative w-full max-w-2xl rounded-2xl border animate-in"
            :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)', boxShadow: 'var(--shadow-modal)' }"
            @click.stop
          >
            <div class="flex items-start justify-between gap-4 px-6 py-4 border-b" :style="{ borderColor: 'var(--border)' }">
              <div>
                <h2 class="font-bold text-lg" :style="{ color: 'var(--text-primary)' }">Propose New Brand</h2>
                <p class="text-xs mt-0.5" :style="{ color: 'var(--text-secondary)' }">
                  Submitted brands enter pending review until approved by an administrator.
                </p>
              </div>
              <button
                type="button"
                @click="showForm = false"
                class="p-1.5 rounded-lg border transition-colors hover:opacity-80"
                :style="{ borderColor: 'var(--border)', color: 'var(--text-muted)' }"
                aria-label="Close modal"
              >
                <XMarkIcon class="w-4 h-4" />
              </button>
            </div>

            <form @submit.prevent="save">
              <div class="p-6 space-y-4">
                <div v-if="formError" class="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {{ formError }}
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label class="label">Brand Name *</label>
                    <input v-model="form.name" required class="input" placeholder="e.g. Acme Gear" />
                    <p v-if="errors.name" class="text-xs text-red-500 mt-1">{{ errors.name[0] }}</p>
                  </div>
                  <div>
                    <label class="label">Website</label>
                    <input v-model="form.website" type="url" class="input" placeholder="https://" />
                    <p v-if="errors.website" class="text-xs text-red-500 mt-1">{{ errors.website[0] }}</p>
                  </div>
                </div>

                <div>
                  <label class="label">Description</label>
                  <textarea v-model="form.description" rows="2" class="input" placeholder="Brief brand description..." />
                  <p v-if="errors.description" class="text-xs text-red-500 mt-1">{{ errors.description[0] }}</p>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <ImagePicker v-model="logoFile" label="Logo" :max-size-m-b="2" />
                    <p v-if="errors.logo" class="text-xs text-red-500 mt-1">{{ errors.logo[0] }}</p>
                  </div>
                  <div>
                    <ImagePicker v-model="bannerFile" label="Banner" :max-size-m-b="2" />
                    <p v-if="errors.banner" class="text-xs text-red-500 mt-1">{{ errors.banner[0] }}</p>
                  </div>
                </div>

                <div>
                  <label class="label">Meta Title</label>
                  <input v-model="form.meta_title" class="input" placeholder="Optional SEO title" />
                  <p v-if="errors.meta_title" class="text-xs text-red-500 mt-1">{{ errors.meta_title[0] }}</p>
                </div>

                <div>
                  <label class="label">Meta Description</label>
                  <textarea v-model="form.meta_description" rows="2" class="input" placeholder="Optional SEO description..." />
                  <p v-if="errors.meta_description" class="text-xs text-red-500 mt-1">{{ errors.meta_description[0] }}</p>
                </div>

                <div class="pt-1">
                  <ToggleSwitch v-model="form.is_active" label="Active once approved" />
                  <p v-if="errors.is_active" class="text-xs text-red-500 mt-1">{{ errors.is_active[0] }}</p>
                </div>
              </div>

              <div class="flex items-center justify-end gap-3 px-6 py-4 border-t" :style="{ borderColor: 'var(--border)' }">
                <button type="button" @click="showForm = false"
                  class="px-5 py-2.5 rounded-xl border text-sm font-medium transition-colors hover:opacity-80"
                  :style="{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }">
                  Cancel
                </button>
                <button type="submit" :disabled="saving" class="btn-primary px-6 justify-center">
                  {{ saving ? 'Submitting...' : 'Submit Proposal' }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ImagePicker from '@ecom/ui/components/ImagePicker.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import { brandApi } from '@/api'
import { BuildingStorefrontIcon, ArrowPathIcon, XMarkIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const brands = ref([])
const pagination = ref(null)
const loading = ref(true)
const saving = ref(false)
const showForm = ref(false)
const search = ref('')
const statusFilter = ref('')
const errors = ref({})
const formError = ref('')
const logoFile = ref(null)
const bannerFile = ref(null)

const form = reactive({
  name: '',
  website: '',
  description: '',
  meta_title: '',
  meta_description: '',
  is_active: true,
})

const breadcrumbItems = computed(() => [
  { label: 'Products', to: '/products' },
  { label: 'Brands', icon: BuildingStorefrontIcon },
])

const statusOptions = [
  { value: '', label: 'All Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
]

const columns = [
  { key: 'name', label: 'Brand' },
  { key: 'products_count', label: 'Products', class: 'w-32' },
  { key: 'status', label: 'Approval', class: 'w-28' },
  { key: 'is_active', label: 'Status', class: 'w-24' },
]

async function load(page = 1) {
  loading.value = true
  try {
    const res = await brandApi.list({
      page,
      search: search.value || undefined,
      status: statusFilter.value || undefined,
      per_page: 20,
    })
    brands.value = res.data.data || []
    pagination.value = res.data.pagination || null
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load brands.')
  } finally {
    loading.value = false
  }
}

function openForm() {
  errors.value = {}
  formError.value = ''
  logoFile.value = null
  bannerFile.value = null
  Object.assign(form, {
    name: '',
    website: '',
    description: '',
    meta_title: '',
    meta_description: '',
    is_active: true,
  })
  showForm.value = true
}

async function save() {
  saving.value = true
  errors.value = {}
  formError.value = ''
  try {
    const fd = new FormData()
    fd.append('name', form.name)
    if (form.website) fd.append('website', form.website)
    if (form.description) fd.append('description', form.description)
    if (form.meta_title) fd.append('meta_title', form.meta_title)
    if (form.meta_description) fd.append('meta_description', form.meta_description)
    fd.append('is_active', form.is_active ? '1' : '0')
    if (logoFile.value) fd.append('logo', logoFile.value)
    if (bannerFile.value) fd.append('banner', bannerFile.value)

    await brandApi.store(fd)
    toast.success('Brand proposal submitted for approval.')
    showForm.value = false
    load(1)
  } catch (e) {
    const status = e.response?.status
    errors.value = e.response?.data?.errors || {}
    const firstError = Object.values(errors.value)[0]?.[0]
    const message = firstError || e.response?.data?.message || 'Failed to submit brand proposal.'
    if (!firstError) formError.value = message
    if (status !== 403 && status !== 500) {
      toast.error(message)
    }
  } finally {
    saving.value = false
  }
}

onMounted(() => load())
</script>
