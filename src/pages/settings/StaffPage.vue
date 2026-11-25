<template>
  <div>
    <Breadcrumb :items="breadcrumbItems" />

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Staff List -->
      <div class="lg:col-span-2">
        <div class="card overflow-hidden">
          <div class="flex items-center justify-between px-5 py-4 border-b" :style="{ borderColor: 'var(--border-light)' }">
            <div>
              <h3 class="font-bold text-sm" :style="{ color: 'var(--text-primary)' }">Shop Staff Members</h3>
              <p class="text-xs" :style="{ color: 'var(--text-muted)' }">Assign team roles for catalog, inventory, and order fulfillment</p>
            </div>
            <button @click="openInvite" class="btn-primary text-xs py-1.5 px-3">
              <PlusIcon class="w-4 h-4" />
              Invite Staff
            </button>
          </div>

          <div v-if="loading" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">Loading...</div>
          <div v-else-if="staff.length === 0" class="p-8 text-center text-sm" :style="{ color: 'var(--text-muted)' }">
            <UserGroupIcon class="w-8 h-8 mx-auto mb-2" />
            No staff members yet. Invite your team!
          </div>
          <div v-else class="divide-y" :style="{ borderColor: 'var(--border-light)' }">
            <div v-for="member in staff" :key="memberKey(member)"
              class="flex flex-col sm:flex-row sm:items-center gap-3 px-5 py-3.5">
              <div class="flex items-center gap-3 flex-1 min-w-0">
                <div class="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shrink-0"
                  :style="{ backgroundColor: 'var(--color-primary)' }">
                  {{ (member.user?.name || 'S').charAt(0).toUpperCase() }}
                </div>
                <div class="min-w-0">
                  <p class="text-sm font-semibold truncate" :style="{ color: 'var(--text-primary)' }">
                    {{ member.user?.name || 'Staff' }}
                  </p>
                  <p class="text-xs truncate" :style="{ color: 'var(--text-muted)' }">
                    {{ member.user?.email || '' }}
                  </p>
                </div>
              </div>

              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs px-2 py-1 rounded font-medium"
                  :style="{
                    backgroundColor: member.is_active ? 'color-mix(in srgb, var(--success) 15%, transparent)' : 'color-mix(in srgb, var(--text-muted) 15%, transparent)',
                    color: member.is_active ? 'var(--success)' : 'var(--text-muted)'
                  }">
                  {{ member.is_active ? 'Active' : 'Inactive' }}
                </span>

                <select :value="member.role" @change="e => updateRole(member, e.target.value)"
                  :disabled="busyKey === memberKey(member)"
                  class="text-xs px-2 py-1 rounded border bg-transparent"
                  :style="{ borderColor: 'var(--border)', color: 'var(--text-secondary)' }">
                  <option v-for="opt in roleOptions" :key="opt.value" :value="opt.value">
                    {{ opt.label }}
                  </option>
                </select>

                <button @click="toggleStaffStatus(member)"
                  :disabled="busyKey === memberKey(member)"
                  class="text-xs font-semibold px-2 py-1 rounded transition"
                  :style="{ color: member.is_active ? 'var(--warning)' : 'var(--success)' }">
                  {{ busyKey === memberKey(member) ? '...' : (member.is_active ? 'Deactivate' : 'Activate') }}
                </button>

                <button @click="confirmRemove(member)"
                  :disabled="busyKey === memberKey(member)"
                  class="p-1 rounded transition"
                  :style="{ color: 'var(--danger)' }"
                  title="Remove staff">
                  <TrashIcon class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Invite Form -->
      <div v-if="showInviteForm" class="card p-5 h-fit">
        <h3 class="font-bold text-sm mb-4" :style="{ color: 'var(--text-primary)' }">Invite Staff Member</h3>
        <form @submit.prevent="inviteStaff" class="space-y-4">
          <div>
            <label class="label">Name</label>
            <input v-model="inviteForm.name" type="text" required class="input" placeholder="Full name" />
          </div>
          <div>
            <label class="label">Email</label>
            <input v-model="inviteForm.email" type="email" required class="input" placeholder="email@example.com" />
          </div>
          <div>
            <label class="label">Role</label>
            <SelectBox v-model="inviteForm.role" :options="roleOptions" placeholder="Select role..." />
          </div>
          <div>
            <label class="label">Password (Optional for new accounts)</label>
            <input v-model="inviteForm.password" type="password" class="input" placeholder="Temporary password (min 8 chars)" />
          </div>
          <div class="flex gap-3">
            <button type="submit" :disabled="inviting" class="btn-primary flex-1 justify-center">
              {{ inviting ? 'Adding...' : 'Add Staff' }}
            </button>
            <button @click="showInviteForm = false" type="button" class="btn-ghost">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>

    <ConfirmModal
      :show="removeModal.show"
      :loading="removeModal.loading"
      title="Remove Staff Member"
      :message="`Remove ${removeModal.member?.user?.name || 'this user'} from your shop team?`"
      confirmText="Remove"
      @confirm="executeRemove"
      @cancel="removeModal.show = false"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useToast } from 'vue-toastification'
import Breadcrumb from '@ecom/ui/components/Breadcrumb.vue'
import SelectBox from '@ecom/ui/components/SelectBox.vue'
import ConfirmModal from '@ecom/ui/components/ConfirmModal.vue'
import { staffApi } from '@/api'

import { PlusIcon, UserGroupIcon, Cog6ToothIcon, TrashIcon } from '@heroicons/vue/24/outline'

const toast = useToast()

const loading = ref(true)
const staff = ref([])
const busyKey = ref(null)
const showInviteForm = ref(false)
const inviting = ref(false)
const inviteForm = ref({ name: '', email: '', role: 'staff', password: '' })
const removeModal = reactive({ show: false, loading: false, member: null })

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

function memberKey(member) {
  return member?.uuid || member?.id
}

function openInvite() {
  inviteForm.value = { name: '', email: '', role: 'staff', password: '' }
  showInviteForm.value = true
}

async function loadStaff() {
  loading.value = true
  try {
    const res = await staffApi.list()
    staff.value = res.data.data || []
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to load staff members.')
  } finally {
    loading.value = false
  }
}

async function inviteStaff() {
  if (!inviteForm.value.name || !inviteForm.value.email) return
  inviting.value = true
  try {
    await staffApi.store({
      name: inviteForm.value.name,
      email: inviteForm.value.email,
      role: inviteForm.value.role,
      ...(inviteForm.value.password ? { password: inviteForm.value.password } : {}),
    })
    toast.success(`Added ${inviteForm.value.email} to staff.`)
    showInviteForm.value = false
    await loadStaff()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to add staff member.')
  } finally {
    inviting.value = false
  }
}

async function updateRole(member, role) {
  const key = memberKey(member)
  busyKey.value = key
  try {
    const res = await staffApi.update(key, { role })
    const updated = res.data.data || res.data
    const idx = staff.value.findIndex(m => memberKey(m) === key)
    if (idx !== -1) staff.value[idx] = updated
    toast.success('Staff role updated.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update role.')
    await loadStaff()
  } finally {
    busyKey.value = null
  }
}

async function toggleStaffStatus(member) {
  const key = memberKey(member)
  busyKey.value = key
  try {
    const res = await staffApi.toggle(key)
    const updated = res.data.data || res.data
    const idx = staff.value.findIndex(m => memberKey(m) === key)
    if (idx !== -1) staff.value[idx] = updated
    toast.success(updated.is_active ? 'Staff member activated.' : 'Staff member deactivated.')
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to update staff status.')
  } finally {
    busyKey.value = null
  }
}

function confirmRemove(member) {
  removeModal.member = member
  removeModal.show = true
}

async function executeRemove() {
  if (!removeModal.member) return
  removeModal.loading = true
  try {
    await staffApi.destroy(memberKey(removeModal.member))
    toast.success('Staff member removed.')
    removeModal.show = false
    removeModal.member = null
    await loadStaff()
  } catch (e) {
    toast.error(e.response?.data?.message || 'Failed to remove staff member.')
  } finally {
    removeModal.loading = false
  }
}

onMounted(loadStaff)
</script>
