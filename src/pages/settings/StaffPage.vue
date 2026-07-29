<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Staff List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Staff Members</h3>
            <button @click="showInviteForm = true" class="btn-primary text-xs py-1.5 px-3">
              <PlusIcon class="w-4 h-4" />
              Invite Staff
            </button>
          </div>

          <div v-if="staff.length === 0" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <UserGroupIcon class="w-8 h-8 mx-auto mb-2" />
            No staff members yet. Invite your team!
          </div>
          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="member in staff" :key="member.id" class="flex items-center gap-4 px-5 py-3.5">
              <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                :style="{ backgroundColor: 'var(--color-primary)' }">
                {{ (member.user?.name || member.name || 'S').charAt(0).toUpperCase() }}
              </div>
              <div class="flex-1 min-w-0">
                <p class="text-sm font-semibold" :style="{ color: 'var(--text-primary)' }">
                  {{ member.user?.name || member.name || 'Staff' }}
                </p>
                <p class="text-xs" :style="{ color: 'var(--text-muted)' }">
                  {{ member.user?.email || member.email || '' }}
                </p>
              </div>
              <div class="text-xs px-2 py-1 rounded font-medium"
                :style="{
                  backgroundColor: member.is_active ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
                  color: member.is_active ? 'var(--success)' : 'var(--text-muted)'
                }">
                {{ member.is_active ? 'Active' : 'Inactive' }}
              </div>
              <span class="text-xs px-2 py-1 rounded" :style="{ backgroundColor: 'var(--border-light)', color: 'var(--text-secondary)' }">
                {{ member.role || 'Staff' }}
              </span>
              <button @click="toggleStaffStatus(member)"
                class="text-xs font-semibold px-2 py-1 rounded transition"
                :style="{ color: member.is_active ? 'var(--danger)' : 'var(--success)' }"
                @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
                @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
                {{ member.is_active ? 'Deactivate' : 'Activate' }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite Form -->
      <div v-if="showInviteForm" class="card p-5">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Invite Staff Member</h3>
        <form @submit.prevent="inviteStaff" class="space-y-4">
          <div>
            <label class="label">Name</label>
            <input v-model="inviteForm.name" type="text" class="input" placeholder="Full name" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="inviteForm.email" type="email" class="input" placeholder="email@example.com" />
          </div>
          <div>
            <label class="label">Role</label>
            <SelectBox v-model="inviteForm.role" :options="roleOptions" placeholder="Select role..." />
          </div>
          <div>
            <label class="label">Password</label>
            <input v-model="inviteForm.password" type="password" class="input" placeholder="Temporary password" />
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="inviting" class="btn-primary flex-1">
              {{ inviting ? 'Sending...' : 'Send Invite' }}
            </button>
            <button @click="showInviteForm = false" type="button"
              class="px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
              :style="{ color: 'var(--text-secondary)' }"
              @mouseenter="e => e.target.style.backgroundColor = 'var(--border-light)'"
              @mouseleave="e => e.target.style.backgroundColor = 'transparent'">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import { vendorApi } from '@/api'

import { PlusIcon, UserGroupIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const staff = ref([])
const showInviteForm = ref(false)
const inviting = ref(false)
const inviteForm = ref({ name: '', email: '', role: 'staff', password: '' })

const roleOptions = [
  { value: 'staff', label: 'Staff' },
  { value: 'manager', label: 'Manager' },
  { value: 'order_processor', label: 'Order Processor' },
  { value: 'product_manager', label: 'Product Manager' },
]

const breadcrumbItems = computed(() => [
  { label: 'Settings', icon: Cog6ToothIcon, to: '/settings' },
  { label: 'Staff', icon: null },
])

async function loadStaff() {
  try {
    const res = await vendorApi.profile()
    const data = res.data.data || res.data
    staff.value = data.staff || []
  } catch {}
}

async function inviteStaff() {
  if (!inviteForm.value.name || !inviteForm.value.email) return
  inviting.value = true
  try {
    // Placeholder for staff invite API
    toast.success(`Invitation sent to ${inviteForm.value.email}`)
    showInviteForm.value = false
    inviteForm.value = { name: '', email: '', role: 'staff', password: '' }
    loadStaff()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to invite staff.')
  } finally {
    inviting.value = false
  }
}

function toggleStaffStatus(member) {
  // Placeholder for staff status toggle
  member.is_active = !member.is_active
  toast.success(`${member.user?.name || member.name} status updated.`)
}

onMounted(() => loadStaff())
</script>
