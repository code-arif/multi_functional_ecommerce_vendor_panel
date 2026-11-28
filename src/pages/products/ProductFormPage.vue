<template>
  <div class="w-full">
    <Breadcrumb :items="breadcrumbItems" />

    <form @submit.prevent="save" class="space-y-6">
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 w-full">
        <!-- Main column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Basic Info -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Basic Information</h3>
            <div
              v-if="isEdit && !isOwner"
              class="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800"
            >
              This is a shared platform product. Master details are managed by Admin — you can update your shop's pricing, stock, and status below.
            </div>
            <div
              v-else-if="isEdit && isOwner && form.status === 'active'"
              class="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800"
            >
              Changes to pricing or stock go live immediately. Editing the title, descriptions, thumbnail, videos, organization, or variants will reset this listing to inactive for admin re-approval.
            </div>
            <div class="space-y-4">
              <div>
                <label class="label">Product Name *</label>
                <input v-model="form.name" :disabled="!canEditMasterFields" class="input disabled:opacity-60" placeholder="Enter product name" />
                <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name[0] }}</p>
              </div>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div v-if="!isEdit">
                  <label class="label">Link to Existing Product</label>
                  <SelectBox
                    v-model="form.product_uuid"
                    :options="existingProductOptions"
                    placeholder="Or create a new product..."
                    full-width
                    @change="onProductSelect"
                  />
                  <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
                    Select a platform product to sell at your price
                  </p>
                </div>
                <div>
                  <label class="label">Product Type *</label>
                  <SelectBox
                    v-model="form.type"
                    :options="typeOptions"
                    :disabled="isEdit || !!form.product_uuid"
                    full-width
                  />
                  <p v-if="errors.type" class="text-red-500 text-xs mt-1">{{ errors.type[0] }}</p>
                </div>
                <div :class="!isEdit ? 'md:col-span-2' : ''">
                  <label class="label">SKU</label>
                  <input v-model="form.sku" :disabled="!canEditMasterFields" class="input disabled:opacity-60" placeholder="e.g. PROD-001" />
                  <p v-if="errors.sku" class="text-red-500 text-xs mt-1">{{ errors.sku[0] }}</p>
                </div>
              </div>
              <div>
                <label class="label">Short Description</label>
                <textarea v-model="form.short_description" :disabled="!canEditMasterFields" rows="2" class="input disabled:opacity-60"
                  placeholder="Brief product summary..." />
              </div>
              <div>
                <label class="label">Full Description</label>
                <div class="quill-wrapper" :class="{ 'quill-disabled': !canEditMasterFields, 'quill-error': errors.description }">
                  <QuillEditor
                    v-model:content="form.description"
                    content-type="html"
                    :options="quillOptions"
                    :read-only="!canEditMasterFields"
                    theme="snow"
                    placeholder="Detailed product description..."
                  />
                </div>
                <p v-if="errors.description" class="text-red-500 text-xs mt-1">{{ errors.description[0] }}</p>
              </div>
            </div>
          </div>

          <!-- Pricing (Simple product or linked platform product) -->
          <div v-if="form.type !== 'variable' || !!form.product_uuid" class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Your Pricing</h3>
            <p class="text-xs mb-4" :style="{ color: 'var(--text-muted)' }">
              Set the price and stock for your shop. These override the default product pricing.
            </p>
            <div class="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <label class="label">Your Price *</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    :style="{ color: 'var(--text-muted)' }">৳</span>
                  <input v-model.number="form.price" type="number" min="0" step="0.01" class="input pl-7"
                    placeholder="0.00" />
                </div>
                <p v-if="errors.price" class="text-red-500 text-xs mt-1">{{ errors.price[0] }}</p>
              </div>
              <div>
                <label class="label">Sale Price</label>
                <div class="relative">
                  <span class="absolute left-3 top-1/2 -translate-y-1/2 text-sm"
                    :style="{ color: 'var(--text-muted)' }">৳</span>
                  <input v-model.number="form.sale_price" type="number" min="0" step="0.01" class="input pl-7"
                    placeholder="0.00" />
                </div>
                <p v-if="errors.sale_price" class="text-red-500 text-xs mt-1">{{ errors.sale_price[0] }}</p>
              </div>
              <div>
                <label class="label">Stock Quantity</label>
                <input v-model.number="form.stock_quantity" type="number" min="0" class="input" />
                <p v-if="errors.stock_quantity" class="text-red-500 text-xs mt-1">{{ errors.stock_quantity[0] }}</p>
              </div>
            </div>
            <div class="mt-4 flex items-center gap-2">
              <ToggleSwitch v-model="form.manage_stock" label="Track stock quantity" />
            </div>
            <div v-if="form.manage_stock" class="mt-3">
              <label class="label">Low Stock Alert At</label>
              <input v-model.number="form.low_stock_threshold" type="number" min="0" class="input w-32" />
            </div>
          </div>

          <!-- Variable Product: Attributes & Variants -->
          <div v-if="form.type === 'variable' && !form.product_uuid" class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <div>
                <h3 class="font-bold" :style="{ color: 'var(--text-primary)' }">Attributes &amp; Variants</h3>
                <p class="text-xs mt-0.5" :style="{ color: 'var(--text-muted)' }">
                  Add options like Color or Size, then generate variant combinations with price &amp; stock.
                </p>
              </div>
              <button
                v-if="canEditMasterFields"
                type="button"
                @click="addAttribute"
                class="btn-secondary text-xs py-1.5 px-3"
              >
                + Add Attribute
              </button>
            </div>
            <p v-if="errors.attributes" class="text-red-500 text-xs mb-3">{{ errors.attributes[0] }}</p>

            <div
              v-for="(attr, ai) in form.attributes"
              :key="ai"
              class="rounded-xl p-4 mb-3 border"
              :style="{ borderColor: 'var(--border-color)' }"
            >
              <div class="flex items-center gap-3 mb-3">
                <input
                  v-model="attr.name"
                  :disabled="!canEditMasterFields"
                  class="input flex-1 disabled:opacity-60"
                  placeholder="Attribute name (e.g. Size, Color)"
                />
                <button
                  v-if="canEditMasterFields"
                  type="button"
                  @click="removeAttribute(ai)"
                  class="text-red-400 hover:text-red-600 p-1"
                  title="Remove attribute"
                >
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>

              <div class="flex flex-wrap gap-2 mb-2.5">
                <span
                  v-for="(val, vi) in attr.values"
                  :key="vi"
                  class="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700"
                >
                  {{ val.value }}
                  <button
                    v-if="canEditMasterFields"
                    type="button"
                    @click="attr.values.splice(vi, 1)"
                    class="hover:text-red-500 ml-0.5"
                  >
                    &times;
                  </button>
                </span>
              </div>

              <div v-if="canEditMasterFields" class="flex gap-2">
                <input
                  v-model="newAttrValues[ai]"
                  @keydown.enter.prevent="addAttrValue(ai)"
                  class="input text-xs flex-1"
                  placeholder="Add value (e.g. Red, XL) and press Enter"
                />
                <button type="button" @click="addAttrValue(ai)" class="btn-primary text-xs py-1.5 px-3">Add</button>
              </div>
            </div>

            <!-- Generated Variants Table -->
            <div v-if="form.variants.length" class="mt-4">
              <div class="flex items-center justify-between mb-3">
                <h4 class="text-sm font-bold" :style="{ color: 'var(--text-primary)' }">
                  Variants ({{ form.variants.length }})
                </h4>
                <button
                  v-if="canEditMasterFields"
                  type="button"
                  @click="generateVariants"
                  class="btn-secondary text-xs py-1.5 px-3"
                >
                  &#8634; Regenerate Variants
                </button>
              </div>
              <p v-if="errors.variants" class="text-red-500 text-xs mb-2">{{ errors.variants[0] }}</p>
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead>
                    <tr class="border-b" :style="{ borderColor: 'var(--border-color)' }">
                      <th class="table-header">Combination</th>
                      <th class="table-header">Price *</th>
                      <th class="table-header">Sale Price</th>
                      <th class="table-header">Stock</th>
                      <th class="table-header">SKU</th>
                      <th v-if="canEditMasterFields" class="table-header w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr
                      v-for="(variant, vi) in form.variants"
                      :key="variant.id || vi"
                      class="border-b"
                      :style="{ borderColor: 'var(--border-color)' }"
                    >
                      <td class="table-cell text-xs font-medium" :style="{ color: 'var(--text-primary)' }">
                        {{ Object.entries(variant.attributes || {}).map(([k, v]) => `${k}: ${v}`).join(', ') }}
                      </td>
                      <td class="table-cell">
                        <input
                          v-model.number="variant.price"
                          type="number"
                          min="0"
                          step="0.01"
                          :disabled="!canEditMasterFields"
                          class="input text-xs w-24 disabled:opacity-60"
                          placeholder="0.00"
                        />
                      </td>
                      <td class="table-cell">
                        <input
                          v-model.number="variant.sale_price"
                          type="number"
                          min="0"
                          step="0.01"
                          :disabled="!canEditMasterFields"
                          class="input text-xs w-24 disabled:opacity-60"
                          placeholder="0.00"
                        />
                      </td>
                      <td class="table-cell">
                        <input
                          v-model.number="variant.stock_quantity"
                          type="number"
                          min="0"
                          :disabled="!canEditMasterFields"
                          class="input text-xs w-20 disabled:opacity-60"
                        />
                      </td>
                      <td class="table-cell">
                        <input
                          v-model="variant.sku"
                          :disabled="!canEditMasterFields"
                          class="input text-xs w-28 disabled:opacity-60"
                          placeholder="SKU"
                        />
                      </td>
                      <td v-if="canEditMasterFields" class="table-cell text-right">
                        <button
                          type="button"
                          @click="form.variants.splice(vi, 1)"
                          class="text-red-400 hover:text-red-600 p-1"
                          title="Remove variant"
                        >
                          <TrashIcon class="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <button
              v-else-if="canEditMasterFields"
              type="button"
              @click="generateVariants"
              class="mt-2 btn-primary text-sm"
            >
              Generate Variants
            </button>
          </div>

          <!-- SEO -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">SEO</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Meta Title</label>
                <input v-model="form.meta_title" :disabled="!canEditMasterFields" class="input disabled:opacity-60" />
              </div>
              <div>
                <label class="label">Meta Description</label>
                <textarea v-model="form.meta_description" :disabled="!canEditMasterFields" rows="2" class="input disabled:opacity-60" />
              </div>
            </div>
          </div>
        </div>

        <!-- Sidebar -->
        <div class="space-y-5">
          <!-- Status -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Status</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Active in Shop</label>
                <ToggleSwitch v-model="form.is_active" label="Visible to customers" />
              </div>
            </div>
          </div>

          <!-- Organization -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Organization</h3>
            <div class="space-y-3">
              <div>
                <label class="label">Category</label>
                <SelectBox v-model="form.category_uuid" :options="categoryOptions" placeholder="No Category" full-width :disabled="!canEditMasterFields" />
              </div>
              <div>
                <label class="label">Brand</label>
                <SelectBox v-model="form.brand_uuid" :options="brandOptions" placeholder="No Brand" full-width :disabled="!canEditMasterFields" />
              </div>
            </div>
          </div>

          <!-- Thumbnail -->
          <div class="card p-5">
            <h3 class="font-bold mb-4" :style="{ color: 'var(--text-primary)' }">Thumbnail</h3>
            <div v-if="thumbnailPreview || form.thumbnail_url" class="mb-3">
              <img :src="thumbnailPreview || form.thumbnail_url"
                class="w-full aspect-square object-cover rounded-xl"
                :style="{ border: '1px solid var(--border-color)' }" />
            </div>
            <template v-if="canEditMasterFields">
              <div
                class="border-2 border-dashed rounded-xl p-4 text-center hover:opacity-70 transition cursor-pointer"
                :style="{ borderColor: 'var(--border-color)' }"
                @click="$refs.thumbInput.click()">
                <PhotoIcon class="w-8 h-8 mx-auto mb-2" :style="{ color: 'var(--text-muted)' }" />
                <p class="text-xs font-medium" :style="{ color: 'var(--text-muted)' }">Click to upload thumbnail</p>
                <p class="text-[11px] mt-0.5" :style="{ color: 'var(--text-muted)' }">JPG, PNG, WebP (max 2MB)</p>
              </div>
              <input ref="thumbInput" type="file" accept="image/*" class="hidden" @change="onThumbChange" />
              <p v-if="errors.thumbnail" class="text-red-500 text-xs mt-1">{{ errors.thumbnail[0] }}</p>
            </template>
          </div>

          <!-- Product Gallery Images -->
          <div v-if="canEditMasterFields" class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" :style="{ color: 'var(--text-primary)' }">Product Gallery</h3>
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">
                {{ imagePreviews.length }} image(s)
              </span>
            </div>

            <div
              class="border-2 border-dashed rounded-xl p-4 text-center hover:opacity-75 transition cursor-pointer"
              :style="{ borderColor: 'var(--border-color)' }"
              @click="$refs.galleryInput.click()">
              <PhotoIcon class="w-7 h-7 mx-auto mb-1.5" :style="{ color: 'var(--text-muted)' }" />
              <p class="text-xs font-medium" :style="{ color: 'var(--text-primary)' }">Upload Product Images</p>
              <p class="text-[11px] mt-0.5" :style="{ color: 'var(--text-muted)' }">JPG, PNG, WebP (max 5MB each)</p>
            </div>
            <input ref="galleryInput" type="file" multiple accept="image/*" class="hidden" @change="onGalleryChange" />

            <div v-if="imagePreviews.length" class="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
              <div
                v-for="(img, index) in imagePreviews"
                :key="index"
                class="relative group rounded-xl overflow-hidden border shadow-sm"
                :style="{ borderColor: 'var(--border-color)', background: 'var(--surface)' }">
                <img :src="img" class="w-full h-24 object-cover" />

                <div
                  v-if="uploadedImages[index]?.is_primary"
                  class="absolute top-1.5 left-1.5 bg-[#2E7D32] text-white text-[10px] px-2 py-0.5 rounded-full font-semibold shadow">
                  Primary
                </div>

                <div
                  v-if="uploadedImages[index]?.uploading"
                  class="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-xs font-medium">
                  Uploading...
                </div>

                <div class="absolute top-1.5 right-1.5 flex gap-1 opacity-0 group-hover:opacity-100 transition">
                  <button
                    type="button"
                    @click="setPrimaryImage(index)"
                    class="w-7 h-7 rounded-full bg-white shadow text-gray-700 flex items-center justify-center hover:bg-amber-400 hover:text-white transition"
                    title="Set Primary">
                    <StarIcon class="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    @click="removeGalleryImage(index)"
                    class="w-7 h-7 rounded-full bg-red-500 shadow text-white flex items-center justify-center hover:bg-red-600 transition"
                    title="Remove">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Product Videos (vendor-owned product creation & editing) -->
          <div v-if="canEditMasterFields" class="card p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-bold" :style="{ color: 'var(--text-primary)' }">Product Videos</h3>
              <span class="text-xs" :style="{ color: 'var(--text-muted)' }">{{ uploadedVideos.length }} video(s)</span>
            </div>

            <div
              class="border-2 border-dashed rounded-xl p-4 text-center hover:opacity-75 transition cursor-pointer"
              :style="{ borderColor: 'var(--border)' }"
              @click="$refs.videoInput.click()">
              <FilmIcon class="w-7 h-7 mx-auto mb-1.5" :style="{ color: 'var(--text-muted)' }" />
              <p class="text-xs font-medium" :style="{ color: 'var(--text-primary)' }">Upload Product Video</p>
              <p class="text-[11px] mt-0.5" :style="{ color: 'var(--text-muted)' }">MP4, WebM, MOV (max 100MB)</p>
            </div>
            <input ref="videoInput" type="file" accept="video/mp4,video/webm,video/quicktime" class="hidden" @change="onVideoUpload" />

            <div class="mt-4 space-y-2">
              <label class="label text-xs">Or Add YouTube / Vimeo / Direct Video URL</label>
              <input v-model="videoUrlTitle" class="input text-xs" placeholder="Video title (optional)" />
              <div class="flex gap-2">
                <input v-model="videoUrlInput" type="url" class="input text-xs flex-1" placeholder="https://youtube.com/watch?v=..." />
                <button type="button" @click="addExternalVideo" class="btn-secondary text-xs px-3 py-1.5">Add</button>
              </div>
            </div>

            <div v-if="uploadedVideos.length" class="space-y-2.5 mt-4">
              <div v-for="(vid, vi) in uploadedVideos" :key="vi"
                class="flex items-center justify-between gap-2 p-2.5 rounded-xl border"
                :style="{ borderColor: 'var(--border)' }">
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5 flex-wrap">
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {{ vid.source_type || 'upload' }}
                    </span>
                    <span v-if="vid.is_primary"
                      class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#2E7D32] text-white">
                      Primary
                    </span>
                    <span v-if="vid.uploading" class="text-[11px] text-amber-600 font-medium">Uploading...</span>
                  </div>
                  <p class="text-xs font-medium truncate mt-1" :style="{ color: 'var(--text-primary)' }">
                    {{ vid.title || vid.external_url || vid.video_path }}
                  </p>
                </div>
                <div class="flex items-center gap-1 shrink-0">
                  <button type="button" @click="setPrimaryVideo(vi)"
                    class="p-1.5 rounded-lg border text-gray-500 hover:text-amber-500 transition"
                    :style="{ borderColor: 'var(--border)' }"
                    title="Set Primary Video">
                    <StarIcon class="w-3.5 h-3.5" />
                  </button>
                  <button type="button" @click="removeVideo(vi)"
                    class="p-1.5 rounded-lg border text-red-500 hover:bg-red-50 transition"
                    :style="{ borderColor: 'var(--border)' }"
                    title="Remove Video">
                    <TrashIcon class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Submit -->
      <div class="flex gap-3">
        <button type="submit" :disabled="saving" class="btn-primary px-8 py-2.5">
          {{ saving ? 'Saving...' : (isEdit ? (isOwner ? 'Update Product' : 'Update Pricing') : 'Add to Shop') }}
        </button>
        <button type="button" @click="$router.push('/products')"
          class="px-6 py-2.5 rounded-lg border transition"
          :style="{ borderColor: 'var(--border-color)', color: 'var(--text-muted)' }">
          Cancel
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'vue-toastification'
import { QuillEditor } from '@vueup/vue-quill'
import '@vueup/vue-quill/dist/vue-quill.snow.css'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ToggleSwitch from '@ecom/ui/components/ToggleSwitch.vue'
import { productApi, categoryApi, brandApi } from '@/api'
import { ShoppingBagIcon, PhotoIcon, FilmIcon, StarIcon, TrashIcon } from '@heroicons/vue/24/outline'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const isEdit = computed(() => !!route.params.uuid)
const isOwner = ref(false)
const canEditMasterFields = computed(() => !form.product_uuid && (!isEdit.value || isOwner.value))

const saving = ref(false)
const errors = ref({})
const thumbnailPreview = ref(null)
const thumbnailFile = ref(null)
const imagePreviews = ref([])
const uploadedImages = ref([])
const uploadedVideos = ref([])
const videoUrlInput = ref('')
const videoUrlTitle = ref('')
const videoInput = ref(null)
const categories = ref([])
const brands = ref([])
const existingProducts = ref([])
const newAttrValues = ref([])

const typeOptions = [
  { value: 'simple', label: 'Simple Product' },
  { value: 'variable', label: 'Variable Product' },
]

const quillOptions = {
  modules: {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike'],
      [{ color: [] }, { background: [] }],
      [{ list: 'ordered' }, { list: 'bullet' }],
      [{ indent: '-1' }, { indent: '+1' }],
      [{ align: [] }],
      ['link', 'image'],
      ['blockquote', 'code-block'],
      ['clean'],
    ],
  },
}

const breadcrumbItems = computed(() => [
  { label: 'Products', to: '/products', icon: ShoppingBagIcon },
  { label: isEdit.value ? (isOwner.value ? 'Edit Product' : 'Edit Product Pricing') : 'Add Product' }
])

const categoryOptions = computed(() => [
  { value: null, label: 'No Category' },
  ...categories.value.map(c => ({ value: c.uuid, label: c.name }))
])

const brandOptions = computed(() => [
  { value: null, label: 'No Brand' },
  ...brands.value.map(b => ({ value: b.uuid, label: b.name }))
])

const existingProductOptions = computed(() => [
  { value: null, label: 'Create a new product...' },
  ...existingProducts.value.map(p => ({ value: p.uuid, label: `${p.name} (${p.sku || 'no SKU'})` }))
])

const form = reactive({
  product_uuid: null,
  status: 'inactive',
  type: 'simple',
  name: '',
  sku: '',
  price: null,
  sale_price: null,
  stock_quantity: 0,
  low_stock_threshold: 5,
  manage_stock: true,
  is_active: true,
  short_description: '',
  description: '',
  category_uuid: null,
  brand_uuid: null,
  meta_title: '',
  meta_description: '',
  thumbnail_url: '',
  attributes: [],
  variants: [],
})

function addAttribute() {
  form.attributes.push({ name: '', values: [] })
  newAttrValues.value.push('')
}

function removeAttribute(index) {
  form.attributes.splice(index, 1)
  newAttrValues.value.splice(index, 1)
}

function addAttrValue(ai) {
  const val = newAttrValues.value[ai]?.trim()
  if (!val) return
  if (!form.attributes[ai].values.some(v => v.value.toLowerCase() === val.toLowerCase())) {
    form.attributes[ai].values.push({ value: val })
  }
  newAttrValues.value[ai] = ''
}

function generateVariants() {
  const attrs = form.attributes.filter(a => a.name.trim() && a.values.length)
  if (!attrs.length) {
    toast.error('Please add at least one attribute name and value first.')
    return
  }

  const combos = attrs.reduce(
    (acc, attr) => acc.flatMap(combo => attr.values.map(val => ({ ...combo, [attr.name.trim()]: val.value }))),
    [{}]
  )

  form.variants = combos.map(combo => {
    const existing = form.variants.find(v => JSON.stringify(v.attributes) === JSON.stringify(combo))
    return existing || {
      attributes: combo,
      price: form.price || 0,
      sale_price: null,
      stock_quantity: 0,
      sku: '',
    }
  })
}

function onThumbChange(e) {
  const f = e.target.files[0]
  if (!f) return
  thumbnailFile.value = f
  thumbnailPreview.value = URL.createObjectURL(f)
}

async function onGalleryChange(e) {
  const files = Array.from(e.target.files || [])
  if (!files.length) return
  e.target.value = ''

  for (const file of files) {
    if (file.size > 5 * 1024 * 1024) {
      toast.error(`${file.name} is too large. Max 5MB allowed.`)
      continue
    }

    const previewUrl = URL.createObjectURL(file)
    const previewIndex = imagePreviews.value.length
    imagePreviews.value.push(previewUrl)
    uploadedImages.value.push({ path: null, is_primary: false, alt_text: '', uploading: true })

    try {
      const fd = new FormData()
      fd.append('image', file)
      const res = await productApi.uploadImage(fd)

      uploadedImages.value[previewIndex] = {
        path: res.data.data.path,
        url: res.data.data.url,
        is_primary: previewIndex === 0 && !uploadedImages.value.some(i => i.is_primary && i.path),
        alt_text: '',
        uploading: false,
      }
      toast.success(`${file.name} uploaded.`)
    } catch {
      imagePreviews.value.splice(previewIndex, 1)
      uploadedImages.value.splice(previewIndex, 1)
      if (previewUrl.startsWith('blob:')) URL.revokeObjectURL(previewUrl)
      toast.error(`Failed to upload ${file.name}. Please try again.`)
    }
  }
}

function setPrimaryImage(index) {
  uploadedImages.value.forEach((img, i) => {
    img.is_primary = i === index
  })
}

function removeGalleryImage(index) {
  const removedPreview = imagePreviews.value[index]
  if (removedPreview?.startsWith('blob:')) {
    URL.revokeObjectURL(removedPreview)
  }
  imagePreviews.value.splice(index, 1)
  uploadedImages.value.splice(index, 1)

  if (!uploadedImages.value.some(i => i.is_primary) && uploadedImages.value.length) {
    uploadedImages.value[0].is_primary = true
  }
}

async function onVideoUpload(e) {
  const file = e.target.files?.[0]
  if (!file) return
  e.target.value = ''

  if (file.size > 100 * 1024 * 1024) {
    toast.error(`${file.name} exceeds 100MB limit.`)
    return
  }

  const idx = uploadedVideos.value.length
  uploadedVideos.value.push({
    source_type: 'upload',
    title: file.name.replace(/\.[^/.]+$/, ''),
    video_path: null,
    is_primary: idx === 0 && !uploadedVideos.value.some(v => v.is_primary),
    uploading: true,
  })

  try {
    const fd = new FormData()
    fd.append('video', file)
    const res = await productApi.uploadVideo(fd)
    const data = res.data.data
    uploadedVideos.value[idx] = {
      ...uploadedVideos.value[idx],
      video_path: data.path,
      mime_type: data.mime_type || file.type,
      file_size: data.file_size || file.size,
      uploading: false,
    }
    toast.success(`${file.name} uploaded.`)
  } catch (err) {
    uploadedVideos.value.splice(idx, 1)
    toast.error(err.response?.data?.message || `Failed to upload ${file.name}.`)
  }
}

function addExternalVideo() {
  const url = videoUrlInput.value.trim()
  if (!url) return

  let sourceType = 'external'
  if (/youtube\.com|youtu\.be/i.test(url)) sourceType = 'youtube'
  else if (/vimeo\.com/i.test(url)) sourceType = 'vimeo'

  uploadedVideos.value.push({
    source_type: sourceType,
    title: videoUrlTitle.value.trim() || url,
    external_url: url,
    is_primary: uploadedVideos.value.length === 0,
    uploading: false,
  })

  videoUrlInput.value = ''
  videoUrlTitle.value = ''
}

function setPrimaryVideo(index) {
  uploadedVideos.value.forEach((v, i) => {
    v.is_primary = i === index
  })
}

function removeVideo(index) {
  uploadedVideos.value.splice(index, 1)
  if (!uploadedVideos.value.some(v => v.is_primary) && uploadedVideos.value.length) {
    uploadedVideos.value[0].is_primary = true
  }
}

function onProductSelect(productUuid) {
  if (!productUuid) {
    form.type = 'simple'
    return
  }
  const product = existingProducts.value.find(p => p.uuid === productUuid)
  if (product) {
    form.type = product.type || 'simple'
    form.name = product.name
    form.sku = product.sku || ''
    form.short_description = product.short_description || ''
    form.description = product.description || ''
    form.thumbnail_url = product.thumbnail_url || ''
    form.category_uuid = product.category_uuid || null
    form.brand_uuid = product.brand_uuid || null
    form.price = form.price || product.price
  }
}

async function save() {
  saving.value = true
  errors.value = {}

  try {
    const fd = new FormData()

    // If linking to existing platform product, send product_uuid instead of master details
    if (form.product_uuid) {
      fd.append('product_uuid', form.product_uuid)
    } else if (canEditMasterFields.value) {
      if (form.type === 'variable' && (!form.attributes.length || !form.variants.length)) {
        toast.error('Please add attributes and generate at least one variant.')
        saving.value = false
        return
      }

      fd.append('type', form.type || 'simple')
      fd.append('name', form.name)
      fd.append('sku', form.sku || '')
      fd.append('short_description', form.short_description || '')
      fd.append('description', form.description || '')
      if (form.category_uuid) fd.append('category_uuid', form.category_uuid)
      if (form.brand_uuid) fd.append('brand_uuid', form.brand_uuid)
      fd.append('meta_title', form.meta_title || '')
      fd.append('meta_description', form.meta_description || '')

      if (form.type === 'variable') {
        fd.append('attributes', JSON.stringify(form.attributes || []))
        fd.append('variants', JSON.stringify(form.variants || []))
      }

      const validImages = uploadedImages.value
        .filter(img => img.id || img.path)
        .map((img, index) => ({
          ...(img.id ? { id: img.id } : {}),
          path: img.path || null,
          is_primary: !!img.is_primary,
          alt_text: img.alt_text || null,
          sort_order: index,
        }))

      if (validImages.length || (isEdit.value && isOwner.value)) {
        fd.append('images', JSON.stringify(validImages))
      }

      const validVideos = uploadedVideos.value
        .filter(v => v.video_path || v.external_url)
        .map((v, index) => ({
          ...(v.id ? { id: v.id } : {}),
          source_type: v.source_type || 'upload',
          title: v.title || null,
          video_path: v.video_path || null,
          external_url: v.external_url || null,
          poster_path: v.poster_path || null,
          mime_type: v.mime_type || null,
          file_size: v.file_size || null,
          is_primary: !!v.is_primary,
          sort_order: index,
        }))

      if (validVideos.length || (isEdit.value && isOwner.value)) {
        fd.append('videos', JSON.stringify(validVideos))
      }

      if (thumbnailFile.value) {
        fd.append('thumbnail', thumbnailFile.value)
      }
    }

    // Always send pricing / inventory fields
    if (form.type !== 'variable' || !!form.product_uuid) {
      fd.append('price', form.price ?? '')
      fd.append('sale_price', form.sale_price || '')
      fd.append('stock_quantity', form.stock_quantity ?? 0)
    }
    fd.append('low_stock_threshold', form.low_stock_threshold ?? 5)
    fd.append('manage_stock', form.manage_stock ? '1' : '0')
    fd.append('is_active', form.is_active ? '1' : '0')

    if (isEdit.value) {
      const res = await productApi.update(route.params.uuid, fd)
      if (res.data?.data?.reapproval_required) {
        toast.info('Product updated and sent for admin re-approval.')
      } else {
        toast.success(isOwner.value ? 'Product updated successfully.' : 'Product pricing updated.')
      }
    } else {
      await productApi.store(fd)
      toast.success(form.product_uuid ? 'Product linked to your shop.' : 'Product created and submitted for admin review.')
    }

    router.push('/products')

  } catch (e) {
    if (e.response?.status === 422) {
      errors.value = e.response.data.errors || {}
      const firstError = Object.values(errors.value)[0]?.[0]
      toast.error(firstError || 'Validation failed.')
    } else if (e.response?.status === 403) {
      toast.error('Permission denied.')
    } else if (!e.response) {
      toast.error('Network error. Check your connection.')
    } else {
      toast.error(e.response.data?.message || 'Something went wrong.')
    }
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  // Load catalog categories, brands, and available products for linking
  const [catResult, brandResult, prodResult] = await Promise.allSettled([
    categoryApi.list({ per_page: 200, is_active: true }),
    brandApi.list({ per_page: 200, is_active: true }),
    productApi.list({ per_page: 200 }),
  ])

  if (catResult.status === 'fulfilled') {
    categories.value = catResult.value.data.data || []
  }

  if (brandResult.status === 'fulfilled') {
    brands.value = brandResult.value.data.data || []
  }

  if (prodResult.status === 'fulfilled') {
    // Store existing platform products for the "link to existing" dropdown
    existingProducts.value = (prodResult.value.data.data || [])
      .filter(p => !p.owner_type || p.owner_type === 'platform')
      .map(p => ({
        uuid: p.uuid,
        type: p.type || 'simple',
        name: p.name,
        sku: p.sku,
        price: p.vendor_price?.price || p.price,
        thumbnail_url: p.thumbnail_url,
        short_description: p.short_description,
        description: p.description,
        category_uuid: p.category?.uuid || null,
        brand_uuid: p.brand?.uuid || null,
      }))
  }

  // Load existing product data for edit mode
  if (isEdit.value) {
    try {
      const res = await productApi.show(route.params.uuid)
      const p = res.data.data

      isOwner.value = !!p.is_owner
      form.status = p.status || 'inactive'
      form.type = p.type || 'simple'
      form.price = p.vendor_pricing?.price ?? p.price ?? null
      form.sale_price = p.vendor_pricing?.sale_price ?? p.sale_price ?? null
      form.stock_quantity = p.vendor_pricing?.stock_quantity ?? p.stock_quantity ?? 0
      form.low_stock_threshold = p.vendor_pricing?.low_stock_threshold ?? p.low_stock_threshold ?? 5
      form.manage_stock = p.vendor_pricing?.manage_stock ?? p.manage_stock ?? true
      form.is_active = p.vendor_pricing?.is_active ?? true
      form.thumbnail_url = p.thumbnail_url || ''
      form.name = p.name || ''
      form.sku = p.sku || ''
      form.short_description = p.short_description || ''
      form.description = p.description || ''
      form.category_uuid = p.category?.uuid || null
      form.brand_uuid = p.brand?.uuid || null
      form.meta_title = p.meta_title || ''
      form.meta_description = p.meta_description || ''
      form.attributes = (p.attributes || []).map(a => ({
        name: a.name,
        values: (a.values || []).map(v => ({ id: v.id, value: v.value, color_code: v.color_code || null })),
      }))
      form.variants = (p.variants || []).map(v => ({
        id: v.id,
        attributes: v.attributes || {},
        price: v.price ?? 0,
        sale_price: v.sale_price ?? null,
        stock_quantity: v.stock_quantity ?? 0,
        sku: v.sku || '',
      }))
      newAttrValues.value = form.attributes.map(() => '')
      if (p.images?.length) {
        uploadedImages.value = p.images.map(img => ({
          id: img.id,
          path: img.image_path || null,
          url: img.url || (img.image_path ? `/storage/${img.image_path}` : ''),
          is_primary: !!img.is_primary,
          alt_text: img.alt_text || '',
          uploading: false,
        }))
        imagePreviews.value = uploadedImages.value.map(img => img.url)
      }
      uploadedVideos.value = (p.videos || []).map(v => ({
        id: v.id,
        source_type: v.source_type || 'upload',
        title: v.title || '',
        video_path: v.video_path || null,
        external_url: v.external_url || null,
        poster_path: v.poster_path || null,
        mime_type: v.mime_type || null,
        file_size: v.file_size || null,
        is_primary: !!v.is_primary,
        uploading: false,
      }))

    } catch {
      toast.error('Failed to load product data.')
    }
  }
})

onUnmounted(() => {
  if (thumbnailPreview.value?.startsWith('blob:')) {
    URL.revokeObjectURL(thumbnailPreview.value)
  }
  for (const url of imagePreviews.value) {
    if (url?.startsWith('blob:')) URL.revokeObjectURL(url)
  }
})
</script>

<style>
.quill-wrapper .ql-toolbar {
  border-radius: 0.5rem 0.5rem 0 0;
  border-color: var(--border-color, #e5e7eb);
  background: var(--border-light, #f9fafb);
  padding: 8px 10px;
  flex-wrap: wrap;
  gap: 2px;
}

.quill-wrapper .ql-container {
  border-radius: 0 0 0.5rem 0.5rem;
  border-color: var(--border-color, #e5e7eb);
  background: var(--surface, #ffffff);
  color: var(--text-primary, #111827);
  font-size: 0.9rem;
  font-family: inherit;
  min-height: 200px;
}

.quill-wrapper .ql-editor {
  min-height: 200px;
  padding: 12px 14px;
  line-height: 1.7;
  color: var(--text-primary, #111827);
}

.quill-wrapper .ql-editor.ql-blank::before {
  color: var(--text-muted, #9ca3af);
  font-style: normal;
}

.quill-wrapper.quill-disabled {
  opacity: 0.65;
  pointer-events: none;
}

.quill-wrapper.quill-error .ql-toolbar,
.quill-wrapper.quill-error .ql-container {
  border-color: #ef4444;
}
</style>
