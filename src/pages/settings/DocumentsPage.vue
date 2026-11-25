<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <!-- KYC Status Summary -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <div class="card p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Total Uploaded</p>
        <p class="text-xl font-black mt-1" :style="{ color: 'var(--text-primary)' }">{{ documents.length }}</p>
      </div>
      <div class="card p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Verified</p>
        <p class="text-xl font-black mt-1" :style="{ color: 'var(--success)' }">{{ statusCount('verified') }}</p>
      </div>
      <div class="card p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Pending Review</p>
        <p class="text-xl font-black mt-1" :style="{ color: 'var(--warning)' }">{{ statusCount('pending') }}</p>
      </div>
      <div class="card p-4">
        <p class="text-[11px] font-semibold uppercase tracking-wide" :style="{ color: 'var(--text-muted)' }">Rejected</p>
        <p class="text-xl font-black mt-1" :style="{ color: 'var(--danger)' }">{{ statusCount('rejected') }}</p>
      </div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Uploaded Documents -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-6 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-center gap-3">
              <DocumentCheckIcon class="w-5 h-5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Verification Documents (KYC)</h2>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  Submit Trade License, NID, BIN, TIN, or Passport for shop verification
                </p>
              </div>
            </div>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            Loading documents...
          </div>

          <div v-else-if="documents.length === 0" class="p-10 text-center">
            <DocumentCheckIcon class="w-10 h-10 mx-auto mb-3 opacity-50" :style="{ color: 'var(--text-muted)' }" />
            <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">No KYC documents uploaded yet</p>
            <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
              Upload your Trade License or National ID using the form to verify your business.
            </p>
          </div>

          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="doc in documents" :key="doc.uuid || doc.id" class="p-5 space-y-3">
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div class="space-y-1">
                  <div class="flex items-center gap-2 flex-wrap">
                    <span class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">
                      {{ typeLabel(doc.type) }}
                    </span>
                    <StatusBadge :value="doc.status === 'verified' ? 'approved' : doc.status" :label="doc.status" />
                  </div>
                  <div class="flex items-center gap-3 flex-wrap text-xs" :style="{ color: 'var(--text-muted)' }">
                    <span v-if="doc.document_number">No: <strong :style="{ color: 'var(--text-secondary)' }">{{ doc.document_number }}</strong></span>
                    <span v-if="doc.expiry_date">Expires: {{ formatDate(doc.expiry_date) }}</span>
                    <span v-if="doc.verified_at">Verified: {{ formatDate(doc.verified_at) }}</span>
                  </div>
                </div>

                <div class="flex items-center gap-2 shrink-0">
                  <a v-if="doc.document_url" :href="doc.document_url" target="_blank" rel="noopener noreferrer"
                    class="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition"
                    :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-primary)' }">
                    <ArrowTopRightOnSquareIcon class="w-3.5 h-3.5" />
                    View File
                  </a>
                  <button v-if="doc.status !== 'verified'" @click="confirmDelete(doc)"
                    class="p-1.5 rounded-lg transition"
                    :style="{ color: 'var(--danger)' }"
                    title="Delete document">
                    <TrashIcon class="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div v-if="doc.status === 'rejected' && doc.rejection_reason"
                class="rounded-lg px-3.5 py-2.5 text-xs flex items-start gap-2"
                :style="{
                  backgroundColor: 'color-mix(in srgb, var(--danger) 10%, transparent)',
                  color: 'var(--danger)',
                  border: '1px solid color-mix(in srgb, var(--danger) 25%, transparent)'
                }">
                <ExclamationTriangleIcon class="w-4 h-4 shrink-0 mt-0.5" />
                <div>
                  <span class="font-semibold">Rejection reason:</span>
                  <span class="ml-1">{{ doc.rejection_reason }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Upload Form -->
      <div class="card p-5 h-fit">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Upload New Document</h3>

        <form @submit.prevent="uploadDocument" class="space-y-4">
          <div>
            <label class="label">Document Type <span class="text-red-500">*</span></label>
            <select v-model="form.type" required class="input">
              <option value="trade_license">Trade License</option>
              <option value="nid">National ID (NID)</option>
              <option value="bin">BIN Certificate</option>
              <option value="tin">TIN Certificate</option>
              <option value="passport">Passport</option>
            </select>
          </div>

          <div>
            <label class="label">Document Number</label>
            <input v-model="form.document_number" type="text" class="input" placeholder="License / ID number" />
          </div>

          <div>
            <label class="label">Expiry Date (if applicable)</label>
            <input v-model="form.expiry_date" type="date" class="input" />
          </div>

          <div>
            <label class="label">Document File <span class="text-red-500">*</span></label>
            <label class="mt-1 flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-5 cursor-pointer transition"
              :style="{ borderColor: 'var(--border)', backgroundColor: 'var(--bg)' }">
              <CloudArrowUpIcon class="w-7 h-7 mb-1.5" :style="{ color: 'var(--color-primary)' }" />
              <span class="text-xs font-semibold text-center" :style="{ color: 'var(--text-primary)' }">
                {{ fileName || 'Click to choose PDF, JPG, or PNG' }}
              </span>
              <span class="text-[11px] mt-0.5" :style="{ color: 'var(--text-muted)' }">Max size: 10 MB</span>
              <input ref="fileInputRef" type="file" accept=".jpg,.jpeg,.png,.pdf" class="hidden" @change="onFileChange" />
            </label>
          </div>

          <button type="submit" :disabled="uploading || !selectedFile" class="btn-primary w-full justify-center">
            {{ uploading ? 'Uploading...' : 'Submit for Verification' }}
          </button>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="deleteModal.show"
      :loading="deleteModal.loading"
      title="Delete Document"
      :message="`Delete ${typeLabel(deleteModal.item?.type)} document? You can upload a replacement anytime.`"
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
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { vendorApi } from '@/api'
import {
  Cog6ToothIcon,
  DocumentCheckIcon,
  CloudArrowUpIcon,
  ArrowTopRightOnSquareIcon,
  TrashIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const loading = ref(true)
const uploading = ref(false)
const documents = ref([])
const selectedFile = ref(null)
const fileName = ref('')
const fileInputRef = ref(null)

const form = reactive({
  type: 'trade_license',
  document_number: '',
  expiry_date: '',
})

const deleteModal = reactive({
  show: false,
  loading: false,
  item: null,
})

const typeLabels = {
  trade_license: 'Trade License',
  nid: 'National ID (NID)',
  bin: 'BIN Certificate',
  tin: 'TIN Certificate',
  passport: 'Passport',
}

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
  { label: 'KYC Documents', icon: null },
])

function typeLabel(type) {
  return typeLabels[type] || type || 'Document'
}

function statusCount(status) {
  return documents.value.filter(d => d.status === status).length
}

function formatDate(val) {
  if (!val) return ''
  return new Date(val).toLocaleDateString()
}

function onFileChange(e) {
  const file = e.target.files?.[0]
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    toast.error('File must not exceed 10 MB.')
    return
  }
  selectedFile.value = file
  fileName.value = file.name
}

async function loadDocuments() {
  loading.value = true
  try {
    const res = await vendorApi.documents()
    documents.value = res.data?.data || []
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load documents.')
  } finally {
    loading.value = false
  }
}

async function uploadDocument() {
  if (!selectedFile.value) {
    toast.error('Please choose a document file.')
    return
  }
  uploading.value = true
  try {
    const fd = new FormData()
    fd.append('type', form.type)
    fd.append('document', selectedFile.value)
    if (form.document_number) fd.append('document_number', form.document_number)
    if (form.expiry_date) fd.append('expiry_date', form.expiry_date)

    await vendorApi.uploadDocument(fd)
    toast.success('Document uploaded for verification.')
    form.document_number = ''
    form.expiry_date = ''
    selectedFile.value = null
    fileName.value = ''
    if (fileInputRef.value) fileInputRef.value.value = ''
    await loadDocuments()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to upload document.')
  } finally {
    uploading.value = false
  }
}

function confirmDelete(doc) {
  deleteModal.item = doc
  deleteModal.show = true
}

async function executeDelete() {
  if (!deleteModal.item) return
  deleteModal.loading = true
  try {
    await vendorApi.deleteDocument(deleteModal.item.uuid || deleteModal.item.id)
    toast.success('Document deleted.')
    deleteModal.show = false
    deleteModal.item = null
    await loadDocuments()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to delete document.')
  } finally {
    deleteModal.loading = false
  }
}

onMounted(loadDocuments)
</script>
