<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <form @submit.prevent="saveBank" class="space-y-6">
      <div class="card overflow-hidden">
        <div class="px-6 py-5 border-b" :style="{ borderColor: 'var(--border-light)' }">
          <div class="flex items-start gap-3">
            <BanknotesIcon class="w-5 h-5 mt-0.5 shrink-0" :style="{ color: 'var(--color-primary)' }" />
            <div>
              <h2 class="font-bold text-base" :style="{ color: 'var(--text-primary)' }">Bank Account Details</h2>
              <p class="text-sm" :style="{ color: 'var(--text-secondary)' }">Your payout bank account information</p>
            </div>
          </div>
        </div>

        <div class="p-6 space-y-5">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">Bank Name</label>
              <input v-model="form.bank_name" type="text" class="input" placeholder="e.g. Sonali Bank" />
            </div>
            <div>
              <label class="label">Account Holder Name</label>
              <input v-model="form.account_name" type="text" class="input" placeholder="Full name as on bank account" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">Account Number</label>
              <input v-model="form.account_number" type="text" class="input" placeholder="Your account number" />
            </div>
            <div>
              <label class="label">Routing / Sort Code</label>
              <input v-model="form.routing_number" type="text" class="input" placeholder="Bank routing number" />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label class="label">Branch Name</label>
              <input v-model="form.branch" type="text" class="input" placeholder="Branch name" />
            </div>
            <div>
              <label class="label">SWIFT / BIC Code</label>
              <input v-model="form.swift_code" type="text" class="input" placeholder="SWIFT code (if applicable)" />
            </div>
          </div>

          <div>
            <label class="label">Mobile Banking (bKash/Nagad/Rocket)</label>
            <input v-model="form.mobile_banking" type="text" class="input"
              placeholder="e.g. 01XXXXXXXXX (bKash)" />
            <p class="text-xs mt-1" :style="{ color: 'var(--text-muted)' }">
              If using mobile banking instead of a bank account
            </p>
          </div>
        </div>
      </div>

      <div class="flex justify-end gap-3">
        <router-link to="/settings" class="btn-ghost">Cancel</router-link>
        <button type="submit" :disabled="saving" class="btn-primary">
          {{ saving ? 'Saving...' : 'Save Account Details' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import { settingsApi } from '@/api'

import { BanknotesIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const toast = useToast()
const saving = ref(false)
const form = reactive({
  bank_name: '',
  account_name: '',
  account_number: '',
  routing_number: '',
  branch: '',
  swift_code: '',
  mobile_banking: '',
})

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
  { label: 'Bank Account', icon: null },
])

function loadSettings() {
  // Load saved bank details from settings API
}

async function saveBank() {
  saving.value = true
  try {
    await settingsApi.update({ bank_account: form })
    toast.success('Bank account details saved.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to save bank details.')
  } finally {
    saving.value = false
  }
}

onMounted(() => loadSettings())
</script>
