<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div v-if="loading" class="card p-12 text-center" :style="{ color: 'var(--text-muted)' }">
      Loading ticket details...
    </div>

    <div v-else-if="error" class="card p-12 text-center">
      <ExclamationTriangleIcon class="w-10 h-10 mx-auto mb-3" :style="{ color: 'var(--danger)' }" />
      <h3 class="text-lg font-semibold mb-1" :style="{ color: 'var(--text-primary)' }">Ticket Not Found</h3>
      <router-link to="/support" class="btn-primary">Back to Support</router-link>
    </div>

    <template v-if="!loading && !error && ticket">
      <!-- Ticket Header -->
      <div class="card p-5 mb-6">
        <div class="flex items-start justify-between gap-4">
          <div class="flex-1">
            <h2 class="text-xl font-black" :style="{ color: 'var(--text-primary)' }">{{ ticket.subject || ticket.title }}</h2>
            <p class="text-sm mt-1" :style="{ color: 'var(--text-muted)' }">
              Created {{ formatDate(ticket.created_at) }} · {{ ticket.category || 'General' }}
            </p>
          </div>
          <StatusBadge :value="ticket.status" />
        </div>
        <div v-if="ticket.description" class="mt-4 p-4 rounded-lg text-sm" :style="{ backgroundColor: 'var(--border-light)' }">
          <p :style="{ color: 'var(--text-secondary)' }">{{ ticket.description }}</p>
        </div>
      </div>

      <!-- Messages -->
      <div class="card overflow-hidden mb-6">
        <div class="px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
          <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Messages</h3>
        </div>

        <div v-if="!messages.length" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
          <ChatBubbleLeftRightIcon class="w-8 h-8 mx-auto mb-2" />
          No messages yet
        </div>

        <div v-else class="p-5 space-y-4">
          <div v-for="msg in messages" :key="msg.id" class="flex gap-3" :class="msg.is_admin || msg.from_admin ? 'flex-row-reverse' : ''">
            <div class="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0 text-white"
              :style="{ backgroundColor: msg.is_admin || msg.from_admin ? 'var(--color-primary)' : 'var(--text-muted)' }">
              {{ msg.user?.name?.charAt(0)?.toUpperCase() || (msg.is_admin || msg.from_admin ? 'A' : 'V') }}
            </div>
            <div class="max-w-[75%]">
              <div class="p-3 rounded-lg text-sm" :style="{
                backgroundColor: msg.is_admin || msg.from_admin ? 'var(--color-primary-pale)' : 'var(--border-light)',
                borderTopRightRadius: msg.is_admin || msg.from_admin ? '4px' : '12px',
                borderTopLeftRadius: msg.is_admin || msg.from_admin ? '12px' : '4px',
              }">
                <p :style="{ color: 'var(--text-primary)' }">{{ msg.message || msg.body }}</p>
              </div>
              <p class="text-xs mt-1" :class="msg.is_admin || msg.from_admin ? 'text-right' : ''"
                :style="{ color: 'var(--text-muted)' }">
                {{ msg.user?.name || (msg.is_admin || msg.from_admin ? 'Admin' : 'You') }} · {{ formatDate(msg.created_at) }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Reply Box -->
      <div class="card p-5">
        <h3 class="font-bold text-sm mb-3" :style="{ color: 'var(--text-primary)' }">Add Reply</h3>
        <div class="flex gap-3">
          <textarea v-model="replyMessage" rows="3" class="input flex-1" placeholder="Type your reply..."></textarea>
        </div>
        <div class="flex justify-end mt-3">
          <button @click="sendReply" :disabled="!replyMessage.trim() || sending"
            class="btn-primary">
            {{ sending ? 'Sending...' : 'Send Reply' }}
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import StatusBadge from '@ecom/ui/components/StatusBadge.vue'
import { supportApi } from '@/api'

import {
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  ExclamationTriangleIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const toast = useToast()

const ticket = ref(null)
const messages = ref([])
const loading = ref(true)
const error = ref(null)
const replyMessage = ref('')
const sending = ref(false)

const breadcrumbItems = computed(() => [
  { label: 'Support', icon: QuestionMarkCircleIcon, to: '/support' },
  { label: ticket.value ? (ticket.value.subject || ticket.value.title || 'Ticket') : 'Loading...', icon: null },
])

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
    const res = await supportApi.ticketShow(route.params.id)
    ticket.value = res.data.data || res.data
    messages.value = ticket.value.messages || ticket.value.replies || []
  } catch (e) {
    error.value = 'Failed to load ticket details.'
  } finally {
    loading.value = false
  }
}

async function sendReply() {
  if (!replyMessage.value.trim() || !ticket.value) return
  sending.value = true
  try {
    await supportApi.ticketMessage(ticket.value.id, { message: replyMessage.value })
    toast.success('Reply sent.')
    replyMessage.value = ''
    await load()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to send reply.')
  } finally {
    sending.value = false
  }
}

onMounted(() => load())
</script>
