<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="w-full overflow-x-auto">
      <DataTable
        :items="reviews"
        :columns="columns"
        :loading="loading"
        searchable
        :pagination="pagination"
        search-placeholder="Search reviews..."
        empty-text="No reviews found"
        @search="q => { search = q; load(1) }"
        @page="load"
      >
        <template #actions>
          <button @click="load()"
            class="px-3 py-2 rounded-lg text-xs font-medium inline-flex items-center gap-1.5 transition-colors"
            :style="{ border: '1px solid var(--border)', color: 'var(--text-secondary)' }"
            @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
            @mouseleave="e => e.target.style.backgroundColor = 'transparent'"
            title="Refresh">
            <ArrowPathIcon class="w-4 h-4" />
          </button>
        </template>

        <template #default="{ item }">
          <td class="table-cell">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 rounded-full overflow-hidden shrink-0" :style="{ background: 'var(--border-light)' }">
                <img v-if="item.user?.avatar" :src="item.user.avatar" class="w-full h-full object-cover" />
                <div v-else class="w-full h-full flex items-center justify-center text-sm font-bold"
                  :style="{ color: 'var(--text-muted)' }">
                  {{ (item.user?.name || 'A').charAt(0).toUpperCase() }}
                </div>
              </div>
              <div>
                <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">{{ item.user?.name || 'Anonymous' }}</p>
                <div class="flex items-center gap-0.5">
                  <template v-for="i in 5" :key="i">
                    <StarIcon class="w-3.5 h-3.5" :class="i <= (item.rating || 0) ? 'text-yellow-400' : ''"
                      :style="{ color: i <= (item.rating || 0) ? '#F59E0B' : 'var(--text-muted)' }" />
                  </template>
                </div>
              </div>
            </div>
          </td>

          <td class="table-cell">
            <p class="font-semibold text-sm" :style="{ color: 'var(--text-primary)' }">
              {{ item.product?.name || item.product_name || 'Product' }}
            </p>
          </td>

          <td class="table-cell max-w-[250px]">
            <p class="text-sm truncate" :style="{ color: 'var(--text-secondary)' }">{{ item.comment || item.review || '—' }}</p>
          </td>

          <td class="table-cell">
            <StatusBadge :value="item.status" />
          </td>

          <td class="table-cell text-sm" :style="{ color: 'var(--text-muted)' }">
            {{ formatDate(item.created_at) }}
          </td>

          <td class="table-cell text-right">
            <div class="flex items-center justify-end gap-1">
              <Tooltip text="Reply">
                <button @click="openReply(item)"
                  class="p-1.5 rounded-lg transition-all inline-flex items-center"
                  :style="{ border: '1px solid var(--border)', color: 'var(--text-muted)' }"
                  @mouseenter="e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.color = 'var(--color-primary)' }"
                  @mouseleave="e => { e.target.style.borderColor = 'var(--border)'; e.target.style.color = 'var(--text-muted)' }">
                  <ArrowUturnLeftIcon class="w-4 h-4" />
                </button>
              </Tooltip>
            </div>
          </td>
        </template>
      </DataTable>
    </div>

    <!-- Reply Modal -->
    <transition name="fade">
      <div v-if="showReplyModal" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        :style="{ backgroundColor: 'rgba(0,0,0,0.5)' }" @click.self="showReplyModal = false">
        <div class="w-full max-w-lg rounded-xl shadow-lg border p-6"
          :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }">
          <h3 class="font-bold text-lg mb-1" :style="{ color: 'var(--text-primary)' }">Reply to Review</h3>
          <div class="mb-4 p-3 rounded-lg text-sm" :style="{ backgroundColor: 'var(--border-light)' }">
            <p class="font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">{{ replyTarget?.user?.name }} ({{ replyTarget?.rating }}/5)</p>
            <p :style="{ color: 'var(--text-secondary)' }">{{ replyTarget?.comment || replyTarget?.review }}</p>
          </div>
          <div>
            <label class="label">Your Reply</label>
            <textarea v-model="replyText" rows="4" class="input" placeholder="Write your response..."></textarea>
          </div>
          <div class="flex justify-end gap-3 mt-6">
            <button @click="showReplyModal = false"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :style="{ color: 'var(--text-secondary)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Cancel
            </button>
            <button @click="submitReply" :disabled="!replyText.trim()" class="btn-primary">
              Send Reply
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import DataTable from '@ecom/ui/components/DataTable.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import Tooltip from '@ecom/ui/components/Tooltip.vue'
import { reviewApi } from '@/api'

import { ArrowPathIcon, ArrowUturnLeftIcon, StarIcon } from '@heroicons/vue/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/vue/24/solid'

const toast = useToast()

const reviews = ref([])
const pagination = ref(null)
const loading = ref(true)
const search = ref('')

const showReplyModal = ref(false)
const replyTarget = ref(null)
const replyText = ref('')

const breadcrumbItems = computed(() => [
  { label: 'Reviews', icon: StarIcon }
])

const columns = [
  { key: 'customer', label: 'Customer', class: 'min-w-[200px]' },
  { key: 'product', label: 'Product', class: 'min-w-[150px]' },
  { key: 'review', label: 'Review', class: 'min-w-[250px]' },
  { key: 'status', label: 'Status', class: 'min-w-[100px]' },
  { key: 'date', label: 'Date', class: 'min-w-[120px]' },
  { key: 'actions', label: 'Action', class: 'w-20 text-right' },
]

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

function openReply(item) {
  replyTarget.value = item
  replyText.value = item.seller_reply || ''
  showReplyModal.value = true
}

async function submitReply() {
  if (!replyTarget.value || !replyText.value.trim()) return
  try {
    await reviewApi.reply(replyTarget.value.id, { reply: replyText.value })
    toast.success('Reply submitted successfully.')
    showReplyModal.value = false
    load(pagination.value?.current_page || 1)
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to submit reply.')
  }
}

async function load(page = 1) {
  loading.value = true
  try {
    const res = await reviewApi.list({
      page,
      search: search.value || undefined,
      per_page: 20
    })
    reviews.value = res.data.data || []
    pagination.value = res.data.meta || res.data.pagination
  } finally {
    loading.value = false
  }
}

onMounted(() => load())
</script>
