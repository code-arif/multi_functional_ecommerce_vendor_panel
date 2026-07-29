<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Tickets List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Support Tickets</h3>
            <button @click="showCreateForm = true" class="btn-primary text-xs py-1.5 px-3">
              <PlusIcon class="w-4 h-4" />
              New Ticket
            </button>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">Loading...</div>
          <div v-else-if="tickets.length === 0" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <QuestionMarkCircleIcon class="w-8 h-8 mx-auto mb-2" />
            No support tickets yet
          </div>
          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <router-link v-for="ticket in tickets" :key="ticket.id" :to="`/support/${ticket.id}`"
              class="flex items-center gap-4 px-5 py-3.5 transition"
              @mouseenter="e => e.currentTarget.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.currentTarget.style.backgroundColor = 'transparent'">
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
                  {{ ticket.subject || ticket.title }}
                </p>
                <p class="text-xs mt-0.5 truncate" :style="{ color: 'var(--text-muted)' }">
                  {{ ticket.description || ticket.message || 'No description' }}
                </p>
              </div>
              <StatusBadge :value="ticket.status" />
              <span class="text-xs shrink-0" :style="{ color: 'var(--text-muted)' }">
                {{ ticket.created_at ? formatDate(ticket.created_at) : '' }}
              </span>
              <ChevronRightIcon class="w-4 h-4 shrink-0" :style="{ color: 'var(--text-muted)' }" />
            </router-link>
          </div>
        </div>
      </div>

      <!-- Quick FAQ -->
      <div class="card p-5">
        <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Quick Help</h3>
        <div v-if="faqs.length === 0" class="text-sm" :style="{ color: 'var(--text-muted)' }">
          <p>Loading FAQs...</p>
        </div>
        <div v-else class="space-y-3">
          <div v-for="faq in faqs.slice(0, 5)" :key="faq.id">
            <details class="group">
              <summary class="text-sm font-semibold cursor-pointer py-1.5 flex items-center justify-between"
                :style="{ color: 'var(--text-primary)' }">
                {{ faq.question }}
                <ChevronDownIcon class="w-3.5 h-3.5 transition-transform group-open:rotate-180" :style="{ color: 'var(--text-muted)' }" />
              </summary>
              <p class="text-xs mt-1 pl-2" :style="{ color: 'var(--text-secondary)' }">{{ faq.answer }}</p>
            </details>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Ticket Modal -->
    <transition name="fade">
      <div v-if="showCreateForm" class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        :style="{ backgroundColor: 'rgba(0,0,0,0.5)' }" @click.self="showCreateForm = false">
        <div class="w-full max-w-lg rounded-xl shadow-lg border p-6"
          :style="{ backgroundColor: 'var(--surface)', borderColor: 'var(--border)' }">
          <h3 class="font-bold text-lg mb-4" :style="{ color: 'var(--text-primary)' }">Create Support Ticket</h3>
          <form @submit.prevent="submitTicket" class="space-y-4">
            <div>
              <label class="label">Subject</label>
              <input v-model="ticketForm.subject" type="text" required class="input" placeholder="Brief subject..." />
            </div>
            <div>
              <label class="label">Category</label>
              <SelectBox v-model="ticketForm.category" :options="categoryOptions" placeholder="Select category..." />
            </div>
            <div>
              <label class="label">Description</label>
              <textarea v-model="ticketForm.description" rows="4" required class="input" placeholder="Describe your issue..."></textarea>
            </div>
            <div class="flex justify-end gap-3">
              <button @click="showCreateForm = false" type="button"
                class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
                :style="{ color: 'var(--text-secondary)' }"
                @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                Cancel
              </button>
              <button type="submit" :disabled="ticketSubmitting" class="btn-primary">
                {{ ticketSubmitting ? 'Submitting...' : 'Submit Ticket' }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { supportApi } from '@/api'

import { QuestionMarkCircleIcon, PlusIcon, ChevronRightIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const tickets = ref([])
const faqs = ref([])
const loading = ref(true)
const showCreateForm = ref(false)
const ticketSubmitting = ref(false)
const ticketForm = ref({ subject: '', category: '', description: '' })

const categoryOptions = [
  { value: '', label: 'Select category...' },
  { value: 'general', label: 'General Inquiry' },
  { value: 'technical', label: 'Technical Issue' },
  { value: 'billing', label: 'Billing / Payout' },
  { value: 'product', label: 'Product Issue' },
  { value: 'account', label: 'Account Issue' },
  { value: 'other', label: 'Other' },
]

const breadcrumbItems = computed(() => [
  { label: 'Support', icon: QuestionMarkCircleIcon },
])

function formatDate(d) {
  if (!d) return ''
  return new Date(d).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  })
}

async function loadTickets() {
  try {
    const res = await supportApi.tickets({ per_page: 50 })
    tickets.value = res.data.data || []
  } catch {}
}

async function loadFaqs() {
  try {
    const res = await supportApi.faqs()
    faqs.value = res.data.data || []
  } catch {}
}

async function submitTicket() {
  if (!ticketForm.value.subject || !ticketForm.value.description) return
  ticketSubmitting.value = true
  try {
    await supportApi.createTicket(ticketForm.value)
    toast.success('Ticket created successfully.')
    showCreateForm.value = false
    ticketForm.value = { subject: '', category: '', description: '' }
    loadTickets()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to create ticket.')
  } finally {
    ticketSubmitting.value = false
  }
}

onMounted(() => {
  loading.value = true
  Promise.all([loadTickets(), loadFaqs()]).finally(() => { loading.value = false })
})
</script>
