<script setup>
import { ref, reactive, nextTick, onBeforeUnmount } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { Eye, EyeOff, ArrowLeft, Mail, RefreshCw, Lock } from 'lucide-vue-next'

const auth = useAuthStore()
const loginMethod = ref('password') // 'password' or 'magic'
const magicState = ref('email') // 'email' or 'otp'
const form = reactive({ email: '', password: '' })
const otpDigits = ref(['', '', '', '', '', ''])
const otpInputs = ref([])

const errors = ref({})
const errorMessage = ref('')
const loading = ref(false)
const showPass = ref(false)

// Resend OTP countdown
const resendCooldown = ref(0)
let timer = null

function startCooldown(seconds = 60) {
  resendCooldown.value = seconds
  clearInterval(timer)
  timer = setInterval(() => {
    if (resendCooldown.value > 0) {
      resendCooldown.value--
    } else {
      clearInterval(timer)
    }
  }, 1000)
}

onBeforeUnmount(() => {
  clearInterval(timer)
})

function switchMethod(method) {
  loginMethod.value = method
  errors.value = {}
  errorMessage.value = ''
  if (method === 'magic' && magicState.value === 'otp') {
    magicState.value = 'email'
  }
}

function backToEmail() {
  magicState.value = 'email'
  errorMessage.value = ''
  otpDigits.value = ['', '', '', '', '', '']
}

// ─── OTP Input Handling ─────────────────────────────────────
function handleOtpInput(index, event) {
  const value = event.target.value
  // Allow only single digit
  if (/^[0-9]$/.test(value)) {
    otpDigits.value[index] = value
    if (index < 5) {
      nextTick(() => {
        otpInputs.value[index + 1]?.focus()
      })
    }
  } else {
    otpDigits.value[index] = ''
  }

  // If all 6 digits entered, auto-verify
  const code = otpDigits.value.join('')
  if (code.length === 6) {
    handleVerifyOtp()
  }
}

function handleOtpKeydown(index, event) {
  if (event.key === 'Backspace') {
    if (!otpDigits.value[index] && index > 0) {
      otpDigits.value[index - 1] = ''
      nextTick(() => {
        otpInputs.value[index - 1]?.focus()
      })
    } else {
      otpDigits.value[index] = ''
    }
  }
}

function handleOtpPaste(event) {
  event.preventDefault()
  const pasted = (event.clipboardData || window.clipboardData).getData('text').trim()
  if (/^\d{6}$/.test(pasted)) {
    pasted.split('').forEach((char, i) => {
      otpDigits.value[i] = char
    })
    nextTick(() => {
      otpInputs.value[5]?.focus()
    })
    handleVerifyOtp()
  }
}

// ─── Form Submission ────────────────────────────────────────
async function handleSendOtp() {
  if (!form.email) {
    errorMessage.value = 'Please enter your vendor email address.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  errors.value = {}

  try {
    await auth.sendOtp(form.email)
    magicState.value = 'otp'
    startCooldown(60)
    nextTick(() => {
      otpInputs.value[0]?.focus()
    })
  } catch (e) {
    errorMessage.value = e.response?.data?.message || 'Failed to send OTP code. Please check your email.'
  } finally {
    loading.value = false
  }
}

async function handleVerifyOtp() {
  const code = otpDigits.value.join('')
  if (code.length !== 6) {
    errorMessage.value = 'Please enter the complete 6-digit OTP code.'
    return
  }

  loading.value = true
  errorMessage.value = ''
  errors.value = {}

  try {
    await auth.verifyOtp(form.email, code)
  } catch (e) {
    errorMessage.value = e.response?.data?.message || 'Invalid or expired OTP code. Please try again.'
  } finally {
    loading.value = false
  }
}

async function handlePasswordLogin() {
  loading.value = true
  errorMessage.value = ''
  errors.value = {}

  try {
    await auth.login(form)
  } catch (e) {
    errors.value = e.response?.data?.errors || {}
    errorMessage.value = e.response?.data?.message || 'Invalid credentials or inactive vendor account.'
  } finally {
    loading.value = false
  }
}

function handleSubmit() {
  if (loginMethod.value === 'password') {
    handlePasswordLogin()
  } else if (magicState.value === 'email') {
    handleSendOtp()
  } else {
    handleVerifyOtp()
  }
}
</script>

<template>
  <div class="min-h-screen bg-[var(--app-bg)] flex items-center justify-center p-4">
    <div class="w-full max-w-[420px]">
      <div class="bg-[var(--surface)] p-6 sm:p-8 rounded-xl shadow-[var(--shadow-card)] border border-[var(--border)]">
        
        <!-- Tab Buttons -->
        <div class="flex gap-1 mb-8 bg-[var(--border-light)] p-1 rounded-lg">
          <button
            type="button"
            @click="switchMethod('password')"
            :class="{ 'bg-[var(--surface)] shadow-sm font-semibold': loginMethod === 'password' }"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all text-[var(--text-primary)]">
            Password
          </button>
          <button
            type="button"
            @click="switchMethod('magic')"
            :class="{ 'bg-[var(--surface)] shadow-sm font-semibold': loginMethod === 'magic' }"
            class="flex-1 py-2 text-sm font-medium rounded-md transition-all text-[var(--text-primary)]">
            OTP Login
          </button>
        </div>

        <!-- Header -->
        <div class="mb-6 text-center flex flex-col items-center">
          <div
            class="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--color-primary)] text-white text-xl font-bold mb-3 shadow-md shadow-[var(--color-primary)]/20">
            S
          </div>
          <h1 class="text-2xl font-bold text-[var(--text-primary)]">
            {{ loginMethod === 'password' ? 'Vendor Sign In' : (magicState === 'email' ? 'Passwordless Login' : 'Verify Code') }}
          </h1>
          <p class="text-xs text-[var(--text-muted)] mt-1">
            {{ loginMethod === 'password' 
              ? 'Enter your credentials to manage your store' 
              : (magicState === 'email' ? 'We will send a 6-digit verification code to your email' : `Code sent to ${form.email}`) }}
          </p>
        </div>

        <!-- Error Message Banner -->
        <div v-if="errorMessage" class="mb-5 p-3 bg-red-500/10 border border-red-500/20 text-red-500 text-xs rounded-lg flex items-center gap-2">
          <span>{{ errorMessage }}</span>
        </div>

        <form @submit.prevent="handleSubmit" class="space-y-5">
          <transition name="fade-slide" mode="out-in">
            <div :key="loginMethod + '-' + magicState" class="w-full">
              
              <!-- ─── Password Login ───────────────────────────────────── -->
              <template v-if="loginMethod === 'password'">
                <div class="space-y-4 w-full">
                  <div>
                    <label class="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Email address</label>
                    <div class="relative flex items-center">
                      <Mail class="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        v-model="form.email"
                        type="email"
                        required
                        class="input-field has-icon-left"
                        placeholder="vendor@example.com" />
                    </div>
                    <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email[0] }}</p>
                  </div>
                  <div>
                    <div class="flex items-center justify-between mb-1">
                      <label class="block text-xs font-semibold text-[var(--text-secondary)]">Password</label>
                    </div>
                    <div class="relative flex items-center">
                      <Lock class="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        v-model="form.password"
                        :type="showPass ? 'text' : 'password'"
                        required
                        class="input-field has-icon-left has-icon-right"
                        placeholder="••••••••" />
                      <button
                        type="button"
                        class="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--color-primary)] p-1 flex items-center justify-center"
                        @click="showPass = !showPass">
                        <Eye v-if="!showPass" class="w-4 h-4" />
                        <EyeOff v-else class="w-4 h-4" />
                      </button>
                    </div>
                    <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password[0] }}</p>
                  </div>
                </div>
              </template>

              <!-- ─── OTP Stage 1: Email ──────────────────────────────── -->
              <template v-else-if="magicState === 'email'">
                <div class="space-y-4 w-full">
                  <div>
                    <label class="block text-xs font-semibold text-[var(--text-secondary)] mb-1">Vendor Email Address</label>
                    <div class="relative flex items-center">
                      <Mail class="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        v-model="form.email"
                        type="email"
                        required
                        class="input-field has-icon-left"
                        placeholder="vendor@example.com" />
                    </div>
                  </div>
                </div>
              </template>

              <!-- ─── OTP Stage 2: 6 Digits Verification ─────────────── -->
              <template v-else>
                <div class="space-y-4 w-full">
                  <div class="flex items-center justify-between text-xs text-[var(--text-muted)] mb-2">
                    <button type="button" @click="backToEmail" class="flex items-center gap-1 text-[var(--color-primary)] hover:underline font-medium">
                      <ArrowLeft class="w-3.5 h-3.5" /> Change email
                    </button>
                    <span>6-digit OTP</span>
                  </div>

                  <!-- 6 Box Inputs -->
                  <div class="flex gap-2 justify-center" @paste="handleOtpPaste">
                    <input
                      v-for="(digit, idx) in otpDigits"
                      :key="idx"
                      ref="otpInputs"
                      type="text"
                      inputmode="numeric"
                      maxlength="1"
                      :value="digit"
                      @input="handleOtpInput(idx, $event)"
                      @keydown="handleOtpKeydown(idx, $event)"
                      class="w-12 h-14 text-center text-xl font-bold bg-[var(--surface)] border border-[var(--border)] rounded-lg text-[var(--text-primary)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all" />
                  </div>

                  <!-- Resend OTP Button -->
                  <div class="text-center pt-2">
                    <button
                      v-if="resendCooldown === 0"
                      type="button"
                      @click="handleSendOtp"
                      :disabled="loading"
                      class="inline-flex items-center gap-1.5 text-xs text-[var(--color-primary)] hover:underline font-medium">
                      <RefreshCw class="w-3 h-3" /> Resend OTP Code
                    </button>
                    <p v-else class="text-xs text-[var(--text-muted)]">
                      Resend code in <span class="font-semibold text-[var(--text-primary)]">{{ resendCooldown }}s</span>
                    </p>
                  </div>
                </div>
              </template>

            </div>
          </transition>

          <!-- Submit Button -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full flex items-center justify-center px-4 py-2.5 bg-[var(--color-primary)] text-white rounded-lg font-semibold text-sm hover:opacity-90 active:scale-[0.99] transition-all disabled:opacity-70 mt-2 shadow-sm">
            <span v-if="loading" class="inline-flex items-center gap-2">
              <RefreshCw class="w-4 h-4 animate-spin" /> Processing...
            </span>
            <span v-else>
              {{ loginMethod === 'password' ? 'Sign In' : (magicState === 'email' ? 'Send OTP Code' : 'Verify & Log In') }}
            </span>
          </button>

          <!-- <p class="text-center text-xs text-[var(--text-muted)] mt-5">
            Want to sell on Z-Shop?
            <a href="#" class="text-[var(--color-primary)] font-semibold hover:underline">Apply for Vendor Account</a>
          </p> -->
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped>
.input-field {
  @apply w-full px-3 py-2.5 bg-[var(--surface)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-all duration-200;
  box-sizing: border-box;
}

.has-icon-left {
  padding-left: 2.6rem !important;
}

.has-icon-right {
  padding-right: 2.6rem !important;
}

.fade-slide-enter-active,
.fade-slide-leave-active { 
  transition: all 0.25s ease-out; 
}
.fade-slide-enter-from { 
  opacity: 0; 
  transform: translateX(10px); 
}
.fade-slide-leave-to { 
  opacity: 0; 
  transform: translateX(-10px); 
}
</style>
