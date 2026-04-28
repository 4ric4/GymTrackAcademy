<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden" style="background: var(--bg)">
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5"></div>

    <div class="flex-1 flex flex-col justify-center px-6 gap-8 relative z-10">
      <div>
        <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
          Escolha seu<br/><span style="color: var(--accent)">nickname</span>
        </h2>
        <p class="text-sm mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          É assim que outros usuários vão te encontrar.
        </p>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Nickname -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">Nickname</label>
          <div class="relative">
            <input v-model="nickname" type="text" placeholder="ex: lucas99" maxlength="20"
              class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
              style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
              @focus="$event.target.style.borderColor = 'var(--accent)'"
              @blur="$event.target.style.borderColor = nickStatus === 'taken' ? '#ef4444' : nickStatus === 'ok' ? '#22c55e' : 'var(--border)'"
              @input="checkNickname" />
            <div class="absolute right-4 top-1/2 -translate-y-1/2">
              <svg v-if="nickStatus === 'checking'" class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: var(--text3)">
                <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-dasharray="32" stroke-dashoffset="12"/>
              </svg>
              <svg v-else-if="nickStatus === 'ok'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#22c55e" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
              <svg v-else-if="nickStatus === 'taken'" width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path d="M18 6L6 18M6 6l12 12" stroke="#ef4444" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </div>
          <p class="text-xs px-1" :style="nickStatus === 'taken' ? 'color: #ef4444' : nickStatus === 'ok' ? 'color: #22c55e' : 'color: var(--text3)'"
            style="font-family: 'DM Sans', sans-serif">
            {{ nickStatus === 'taken' ? 'Nickname já em uso.' : nickStatus === 'ok' ? 'Disponível!' : 'Apenas letras, números e _. Mínimo 3 caracteres.' }}
          </p>
        </div>

        <!-- Goal -->
        <div class="flex flex-col gap-2">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">Objetivo</label>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="g in goals" :key="g.label" @click="goal = g.label"
              class="flex items-center gap-2 rounded-2xl px-3 py-3 cursor-pointer transition-all"
              :style="goal === g.label ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)' : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <span class="text-lg">{{ g.icon }}</span>
              <span class="text-xs font-bold" :style="goal === g.label ? 'color: var(--accent)' : 'color: var(--text)'"
                style="font-family: 'DM Sans', sans-serif">{{ g.label }}</span>
            </div>
          </div>
        </div>

        <Transition name="fade">
          <p v-if="error" class="text-xs font-semibold" style="color: #ef4444; font-family: 'DM Sans', sans-serif">{{ error }}</p>
        </Transition>

        <button @click="finish" class="btn-accent py-4 mt-2"
          :class="{ 'opacity-50 cursor-not-allowed': loading || nickStatus !== 'ok' || !goal }">
          {{ loading ? 'Salvando...' : 'Entrar no GymTrack 🚀' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()
const authStore = useAuthStore()

const nickname = ref('')
const goal = ref('')
const nickStatus = ref('')
const loading = ref(false)
const error = ref('')
let nickTimeout = null

const goals = [
  { icon: '🏋️', label: 'Ganhar massa' },
  { icon: '🔥', label: 'Perder gordura' },
  { icon: '⚡', label: 'Condicionamento' },
  { icon: '🧘', label: 'Saúde geral' },
]

function checkNickname() {
  const nick = nickname.value.trim().toLowerCase()
  clearTimeout(nickTimeout)
  if (nick.length < 3) { nickStatus.value = ''; return }
  nickStatus.value = 'checking'
  nickTimeout = setTimeout(async () => {
    const snap = await getDoc(doc(db, 'nicknames', nick))
    nickStatus.value = snap.exists() ? 'taken' : 'ok'
  }, 600)
}

async function finish() {
  if (nickStatus.value !== 'ok' || !goal.value) return
  loading.value = true
  try {
    await authStore.setupNickname({ nickname: nickname.value.trim(), goal: goal.value, level: 'Iniciante' })
    localStorage.setItem('gymtrack_seen', '1')
    router.push('/')
  } catch (e) {
    error.value = e.message === 'nickname-taken' ? 'Nickname já em uso.' : 'Erro ao salvar. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
