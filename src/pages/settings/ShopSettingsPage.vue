<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div v-if="loading" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      Loading shop profile...
    </div>

    <template v-if="!loading">
      <!-- Shop Summary Bar -->
      <div class="card p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div class="flex items-center gap-4 min-w-0">
          <img v-if="logoPreview" :src="logoPreview" class="w-12 h-12 rounded-xl object-cover border shrink-0" :style="{ borderColor: 'var(--border)' }" />
          <div v-else class="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-white shrink-0"
            :style="{ backgroundColor: 'var(--color-primary)' }">
            {{ (form.shop_name || 'S').charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2 flex-wrap">
              <h2 class="font-bold text-base truncate" :style="{ color: 'var(--text-primary)' }">
                {{ form.shop_name || 'Your Shop' }}
              </h2>
              <span class="text-[11px] font-semibold px-2 py-0.5 rounded-full capitalize"
                :style="{
                  backgroundColor: shopMeta.status === 'active' ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--warning) 15%, transparent)',
                  color: shopMeta.status === 'active' ? 'var(--success)' : 'var(--warning)'
                }">
                {{ shopMeta.status || 'active' }}
              </span>
            </div>
            <div class="flex items-center gap-3 flex-wrap mt-1 text-xs" :style="{ color: 'var(--text-muted)' }">
              <span v-if="shopMeta.slug">Slug: <strong :style="{ color: 'var(--text-secondary)' }">{{ shopMeta.slug }}</strong></span>
              <span>Commission: <strong :style="{ color: 'var(--text-secondary)' }">{{ shopMeta.commission_type === 'fixed' ? `৳${shopMeta.commission_rate}` : `${shopMeta.commission_rate}%` }}</strong></span>
            </div>
          </div>
        </div>
        <div class="flex flex-wrap items-center gap-2">
          <router-link to="/settings/documents" class="btn-ghost text-xs py-1.5 px-3">KYC Documents</router-link>
          <router-link to="/settings/addresses" class="btn-ghost text-xs py-1.5 px-3">Addresses</router-link>
          <router-link to="/settings/bank" class="btn-ghost text-xs py-1.5 px-3">Payout Accounts</router-link>
        </div>
      </div>

      <form @submit.prevent="saveProfile" class="space-y-6">
        <!-- Shop Identity -->
        <div class="card overflow-hidden">
          <div class="px-6 py-5 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-start gap-3">
              <BuildingStorefrontIcon class="w-5 h-5 mt-0.5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Shop Identity</h2>
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">Your shop name, logo, and banner that customers see</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <!-- Logo & Banner Uploads -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="label">Shop Logo</label>
                <div class="relative group">
                  <div class="w-32 h-32 rounded-xl overflow-hidden border-2" :style="{ borderColor: 'var(--border)' }">
                    <img v-if="logoPreview" :src="logoPreview" class="w-full h-full object-cover" />
                    <div v-else class="w-full h-full flex items-center justify-center"
                      :style="{ backgroundColor: 'var(--border-light)' }">
                      <PhotoIcon class="w-8 h-8" :style="{ color: 'var(--text-muted)' }" />
                    </div>
                  </div>
                  <label class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-xl cursor-pointer transition-all">
                    <span class="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      :style="{ backgroundColor: 'var(--color-primary)' }">Change Logo</span>
                    <input type="file" accept="image/*" class="hidden" @change="e => handleFile(e, 'logo')" />
                  </label>
                </div>
                <p class="text-xs mt-1.5" :style="{ color: 'var(--text-muted)' }">Recommended: 400x400px, PNG or JPG</p>
              </div>

              <div>
                <label class="label">Shop Banner</label>
                <div class="relative group h-32 rounded-xl overflow-hidden border-2" :style="{ borderColor: 'var(--border)' }">
                  <img v-if="bannerPreview" :src="bannerPreview" class="w-full h-full object-cover" />
                  <div v-else class="w-full h-full flex items-center justify-center"
                    :style="{ backgroundColor: 'var(--border-light)' }">
                    <PhotoIcon class="w-8 h-8" :style="{ color: 'var(--text-muted)' }" />
                  </div>
                  <label class="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 rounded-xl cursor-pointer transition-all">
                    <span class="opacity-0 group-hover:opacity-100 text-white text-xs font-semibold px-3 py-1.5 rounded-lg"
                      :style="{ backgroundColor: 'var(--color-primary)' }">Change Banner</span>
                    <input type="file" accept="image/*" class="hidden" @change="e => handleFile(e, 'banner')" />
                  </label>
                </div>
                <p class="text-xs mt-1.5" :style="{ color: 'var(--text-muted)' }">Recommended: 1200x400px</p>
              </div>
            </div>

            <div>
              <label class="label">Shop Name <span class="text-red-500">*</span></label>
              <input v-model="form.shop_name" type="text" required class="input max-w-lg" placeholder="Your shop name" />
            </div>

            <div>
              <label class="label">Shop Description</label>
              <textarea v-model="form.description" rows="4" class="input max-w-lg resize-y"
                placeholder="Tell customers about your shop..."></textarea>
            </div>
          </div>
        </div>

        <!-- Contact Information -->
        <div class="card overflow-hidden">
          <div class="px-6 py-5 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-start gap-3">
              <EnvelopeIcon class="w-5 h-5 mt-0.5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Contact Information</h2>
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">How customers can reach you</p>
              </div>
            </div>
          </div>
          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="label">Email <span class="text-red-500">*</span></label>
                <input v-model="form.email" type="email" required class="input" placeholder="shop@example.com" />
              </div>
              <div>
                <label class="label">Phone</label>
                <input v-model="form.phone" type="tel" class="input" placeholder="+8801XXXXXXXXX" />
              </div>
            </div>
          </div>
        </div>

        <!-- Business Details -->
        <div class="card overflow-hidden">
          <div class="px-6 py-5 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div class="flex items-start gap-3">
              <BriefcaseIcon class="w-5 h-5 mt-0.5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
              <div>
                <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Business Details</h2>
                <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">Additional business information</p>
              </div>
            </div>
          </div>

          <div class="p-6 space-y-6">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="label">Business Type</label>
                <select v-model="form.business_type" class="input">
                  <option value="">Select type...</option>
                  <option value="individual">Individual / Sole Proprietor</option>
                  <option value="proprietorship">Proprietorship</option>
                  <option value="partnership">Partnership</option>
                  <option value="private_limited">Private Limited Company</option>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="manufacturer">Manufacturer</option>
                  <option value="dropshipping">Dropshipping</option>
                  <option value="handmade">Handmade / Artisan</option>
                  <option value="digital">Digital Products</option>
                  <option value="other">Other</option>
                </select>
              </div>
              <div>
                <label class="label">Website</label>
                <input v-model="form.website" type="url" class="input" placeholder="https://myshop.com" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label class="label">Business Registration / Trade License No.</label>
                <input v-model="form.business_registration_number" type="text" class="input"
                  placeholder="e.g. TRAD/DSCC/123456" />
              </div>
              <div>
                <label class="label">Tax ID / TIN / BIN</label>
                <input v-model="form.tax_id" type="text" class="input" placeholder="e.g. 123456789012" />
              </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label class="label">Facebook Page URL</label>
                <input v-model="form.social_facebook" type="url" class="input" placeholder="https://facebook.com/myshop" />
              </div>
              <div>
                <label class="label">Instagram URL</label>
                <input v-model="form.social_instagram" type="url" class="input" placeholder="https://instagram.com/myshop" />
              </div>
              <div>
                <label class="label">YouTube Channel URL</label>
                <input v-model="form.social_youtube" type="url" class="input" placeholder="https://youtube.com/@myshop" />
              </div>
            </div>

            <div>
              <label class="label">Return Policy</label>
              <textarea v-model="form.return_policy" rows="3" class="input resize-y"
                placeholder="Describe your return and exchange policy..."></textarea>
            </div>

            <div>
              <label class="label">Shipping Policy</label>
              <textarea v-model="form.shipping_policy" rows="3" class="input resize-y"
                placeholder="Describe your shipping policy..."></textarea>
            </div>
          </div>
        </div>

        <!-- Save Button -->
        <div class="flex items-center justify-end gap-3">
          <button type="button" @click="resetForm" class="btn-ghost">Reset</button>
          <button type="submit" :disabled="saving" class="btn-primary min-w-[140px] justify-center">
            <svg v-if="saving" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ saving ? 'Saving...' : 'Save Changes' }}
          </button>
        </div>
      </form>
    </template>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toastification'
import { vendorApi } from '@/api'
import { useAuthStore } from '@/stores/auth'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import {
  BuildingStorefrontIcon,
  EnvelopeIcon,
  PhotoIcon,
  BriefcaseIcon,
} from '@heroicons/vue/24/outline'

const toast = useToast()
const auth = useAuthStore()

const loading = ref(true)
const saving = ref(false)
const originalData = ref(null)
const shopMeta = reactive({
  slug: '',
  status: '',
  commission_rate: 0,
  commission_type: 'percentage',
})

const form = reactive({
  shop_name: '',
  email: '',
  phone: '',
  description: '',
  business_type: '',
  business_registration_number: '',
  tax_id: '',
  website: '',
  social_facebook: '',
  social_instagram: '',
  social_youtube: '',
  return_policy: '',
  shipping_policy: '',
})

const logoFile = ref(null)
const bannerFile = ref(null)
const logoPreview = ref('')
const bannerPreview = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: BuildingStorefrontIcon },
])

onMounted(async () => {
  try {
    const res = await vendorApi.profile()
    const data = res.data.data || res.data
    saveOriginalState(data)
    applyFormData(data)
    auth.setShop(data)
  } catch {
    toast.error('Failed to load shop profile')
  } finally {
    loading.value = false
  }
})

function saveOriginalState(data) {
  originalData.value = {
    ...data,
    profile: data.profile ? { ...data.profile } : null,
  }
}

function applyFormData(data) {
  shopMeta.slug = data.slug || ''
  shopMeta.status = data.status || 'active'
  shopMeta.commission_rate = data.commission_rate ?? 0
  shopMeta.commission_type = data.commission_type || 'percentage'

  form.shop_name = data.shop_name || ''
  form.email = data.email || ''
  form.phone = data.phone || ''
  form.description = data.description || ''
  form.business_type = data.profile?.business_type || ''
  form.business_registration_number = data.profile?.business_registration_number || ''
  form.tax_id = data.profile?.tax_id || ''
  form.website = data.profile?.website || ''
  form.social_facebook = data.profile?.social_facebook || ''
  form.social_instagram = data.profile?.social_instagram || ''
  form.social_youtube = data.profile?.social_youtube || ''
  form.return_policy = data.profile?.return_policy || ''
  form.shipping_policy = data.profile?.shipping_policy || ''
  if (data.logo_url) logoPreview.value = data.logo_url
  if (data.banner_url) bannerPreview.value = data.banner_url
}

function handleFile(e, type) {
  const file = e.target.files[0]
  if (!file) return

  // Revoke old URL to prevent memory leak
  if (type === 'logo') {
    if (logoPreview.value && logoPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(logoPreview.value)
    }
    logoFile.value = file
    logoPreview.value = URL.createObjectURL(file)
  } else {
    if (bannerPreview.value && bannerPreview.value.startsWith('blob:')) {
      URL.revokeObjectURL(bannerPreview.value)
    }
    bannerFile.value = file
    bannerPreview.value = URL.createObjectURL(file)
  }
}

async function saveProfile() {
  saving.value = true
  try {
    const fd = new FormData()
    fd.append('shop_name', form.shop_name)
    fd.append('email', form.email)
    fd.append('phone', form.phone || '')
    fd.append('description', form.description || '')
    fd.append('business_type', form.business_type || '')
    fd.append('business_registration_number', form.business_registration_number || '')
    fd.append('tax_id', form.tax_id || '')
    fd.append('website', form.website || '')
    fd.append('social_facebook', form.social_facebook || '')
    fd.append('social_instagram', form.social_instagram || '')
    fd.append('social_youtube', form.social_youtube || '')
    fd.append('return_policy', form.return_policy || '')
    fd.append('shipping_policy', form.shipping_policy || '')

    if (logoFile.value) fd.append('logo', logoFile.value)
    if (bannerFile.value) fd.append('banner', bannerFile.value)

    // Update original data to reflect latest save from server response
    const res = await vendorApi.updateProfile(fd)
    const saved = res.data.data || res.data
    saveOriginalState(saved)
    applyFormData(saved)
    auth.setShop(saved)
    logoFile.value = null
    bannerFile.value = null

    toast.success('Shop profile updated!')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update profile')
  } finally {
    saving.value = false
  }
}

function resetForm() {
  if (originalData.value) {
    applyFormData(originalData.value)
    logoFile.value = null
    bannerFile.value = null
    toast.success('Form reset to saved values')
  }
}

// Clean up blob URLs on unmount
onUnmounted(() => {
  if (logoPreview.value?.startsWith('blob:')) URL.revokeObjectURL(logoPreview.value)
  if (bannerPreview.value?.startsWith('blob:')) URL.revokeObjectURL(bannerPreview.value)
})
</script>
