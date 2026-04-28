<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden" style="background: var(--bg)">
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5"></div>

    <div class="flex-1 flex flex-col px-6 pt-14 pb-8 relative z-10">

      <!-- Back + progress -->
      <div class="flex items-center gap-4 mb-8">
        <button @click="step > 1 ? step-- : router.back()"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text2)">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="flex gap-1.5 flex-1">
          <div v-for="i in 3" :key="i" class="flex-1 rounded-full transition-all" style="height: 3px"
            :style="i <= step ? 'background: var(--accent)' : 'background: var(--surface3)'"></div>
        </div>
        <span class="text-xs font-semibold shrink-0" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          {{ step }}/3
        </span>
      </div>

      <Transition name="fade" mode="out-in">

        <!-- ── Step 1: Conta ── -->
        <div v-if="step === 1" key="s1" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 1 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Criar sua<br/><span style="color: var(--accent)">conta</span>
            </h2>
          </div>

          <div class="flex flex-col gap-4">

            <!-- Nickname -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
                Nickname <span style="color: var(--accent)">*</span>
              </label>
              <div class="relative">
                <input v-model="form.nickname" type="text" placeholder="ex: lucas99"
                  maxlength="20"
                  class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
                  style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
                  @focus="$event.target.style.borderColor = 'var(--accent)'"
                  @blur="$event.target.style.borderColor = nickStatus === 'taken' ? '#ef4444' : nickStatus === 'ok' ? '#22c55e' : 'var(--border)'"
                  @input="checkNickname" />
                <!-- Status icon -->
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
              <p v-if="nickStatus === 'taken'" class="text-xs px-1" style="color: #ef4444; font-family: 'DM Sans', sans-serif">
                Nickname já está em uso.
              </p>
              <p v-else-if="nickStatus === 'ok'" class="text-xs px-1" style="color: #22c55e; font-family: 'DM Sans', sans-serif">
                Nickname disponível!
              </p>
              <p v-else class="text-xs px-1" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                Apenas letras, números e _. Mínimo 3 caracteres.
              </p>
            </div>

            <!-- Email -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
                E-mail <span style="color: var(--accent)">*</span>
              </label>
              <input v-model="form.email" type="email" placeholder="seu@email.com"
                class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
                style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
                @focus="$event.target.style.borderColor = 'var(--accent)'"
                @blur="$event.target.style.borderColor = 'var(--border)'" />
            </div>

            <!-- Password -->
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
                Senha <span style="color: var(--accent)">*</span>
              </label>
              <div class="relative">
                <input v-model="form.password" :type="showPw ? 'text' : 'password'" placeholder="Mínimo 6 caracteres"
                  class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all pr-12"
                  style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
                  @focus="$event.target.style.borderColor = 'var(--accent)'"
                  @blur="$event.target.style.borderColor = 'var(--border)'" />
                <button @click="showPw = !showPw" class="absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text3)">
                  <svg v-if="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
                  <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
                </button>
              </div>
            </div>

            <Transition name="fade">
              <p v-if="error" class="text-xs font-semibold" style="color: #ef4444; font-family: 'DM Sans', sans-serif">{{ error }}</p>
            </Transition>
          </div>

          <div class="flex flex-col gap-3 mt-auto">
            <button @click="nextStep1" class="btn-accent py-4" :class="{ 'opacity-50 cursor-not-allowed': loading }">
              {{ loading ? 'Verificando...' : 'Próximo →' }}
            </button>

            <div class="flex items-center gap-3">
              <div class="flex-1 h-px" style="background: var(--border)"></div>
              <span class="text-xs" style="color: var(--text3); font-family: 'DM Sans', sans-serif">ou</span>
              <div class="flex-1 h-px" style="background: var(--border)"></div>
            </div>

            <button @click="loginGoogle"
              class="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]"
              style="background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: 'DM Sans', sans-serif">
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              Cadastrar com Google
            </button>
          </div>
        </div>

        <!-- ── Step 2: Objetivo ── -->
        <div v-else-if="step === 2" key="s2" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 2 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Qual é seu<br/><span style="color: var(--accent)">objetivo?</span>
            </h2>
          </div>
          <div class="flex flex-col gap-3 flex-1">
            <div v-for="g in goals" :key="g.label" @click="form.goal = g.label"
              class="flex items-center gap-4 rounded-2xl px-4 py-4 cursor-pointer transition-all active:scale-[0.98]"
              :style="form.goal === g.label ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)' : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background: var(--surface2)">{{ g.icon }}</div>
              <div class="flex-1">
                <div class="font-title font-bold text-base" :style="form.goal === g.label ? 'color: var(--accent)' : 'color: var(--text)'">{{ g.label }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ g.sub }}</div>
              </div>
              <div v-if="form.goal === g.label" class="w-6 h-6 rounded-full flex items-center justify-center" style="background: var(--accent)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
          </div>
          <button @click="step++" class="btn-accent py-4" :style="!form.goal ? 'opacity: 0.4; cursor: not-allowed' : ''" :disabled="!form.goal">
            Próximo →
          </button>
        </div>

        <!-- ── Step 3: Nível ── -->
        <div v-else key="s3" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 3 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Qual seu<br/><span style="color: var(--accent)">nível?</span>
            </h2>
          </div>
          <div class="flex flex-col gap-3 flex-1">
            <div v-for="l in levels" :key="l.label" @click="form.level = l.label"
              class="flex items-center gap-4 rounded-2xl px-4 py-4 cursor-pointer transition-all active:scale-[0.98]"
              :style="form.level === l.label ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)' : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style="background: var(--surface2)">{{ l.icon }}</div>
              <div class="flex-1">
                <div class="font-title font-bold text-base" :style="form.level === l.label ? 'color: var(--accent)' : 'color: var(--text)'">{{ l.label }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ l.sub }}</div>
              </div>
              <div v-if="form.level === l.label" class="w-6 h-6 rounded-full flex items-center justify-center" style="background: var(--accent)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/></svg>
              </div>
            </div>
          </div>
          <Transition name="fade">
            <p v-if="error" class="text-xs font-semibold" style="color: #ef4444; font-family: 'DM Sans', sans-serif">{{ error }}</p>
          </Transition>
          <button @click="finish" class="btn-accent py-4" :class="{ 'opacity-50 cursor-not-allowed': loading }"
            :style="!form.level ? 'opacity: 0.4; cursor: not-allowed' : ''" :disabled="!form.level || loading">
            {{ loading ? 'Criando conta...' : 'Criar minha conta 🚀' }}
          </button>
        </div>

      </Transition>
    </div>

    <div class="relative z-10 px-6 pb-10 text-center">
      <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
        Já tem conta?
        <RouterLink to="/entrar" class="font-bold" style="color: var(--accent)">Entrar</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()
const authStore = useAuthStore()

const step = ref(1)
const showPw = ref(false)
const loading = ref(false)
const error = ref('')
const nickStatus = ref('') // '' | 'checking' | 'ok' | 'taken'
let nickTimeout = null

const form = ref({ nickname: '', email: '', password: '', goal: '', level: '' })

const goals = [
  { icon: '🏋️', label: 'Ganhar massa',    sub: 'Hipertrofia e força' },
  { icon: '🔥', label: 'Perder gordura',  sub: 'Queima e definição' },
  { icon: '⚡', label: 'Condicionamento', sub: 'Resistência e cardio' },
  { icon: '🧘', label: 'Saúde geral',     sub: 'Bem-estar e mobilidade' },
]

const levels = [
  { icon: '🌱', label: 'Iniciante',      sub: 'Menos de 1 ano treinando' },
  { icon: '💪', label: 'Intermediário',  sub: '1 a 3 anos de treino' },
  { icon: '🔥', label: 'Avançado',       sub: 'Mais de 3 anos treinando' },
]

function checkNickname() {
  const nick = form.value.nickname.trim().toLowerCase()
  clearTimeout(nickTimeout)
  if (nick.length < 3) { nickStatus.value = ''; return }
  nickStatus.value = 'checking'
  nickTimeout = setTimeout(async () => {
    const snap = await getDoc(doc(db, 'nicknames', nick))
    nickStatus.value = snap.exists() ? 'taken' : 'ok'
  }, 600)
}

async function nextStep1() {
  error.value = ''
  const nick = form.value.nickname.trim()
  if (nick.length < 3) { error.value = 'Nickname deve ter ao menos 3 caracteres.'; return }
  if (!/^[a-zA-Z0-9_]+$/.test(nick)) { error.value = 'Nickname: apenas letras, números e _.'; return }
  if (!form.value.email.includes('@')) { error.value = 'Informe um e-mail válido.'; return }
  if (form.value.password.length < 6) { error.value = 'Senha deve ter ao menos 6 caracteres.'; return }
  if (nickStatus.value === 'taken') { error.value = 'Nickname já está em uso.'; return }

  loading.value = true
  try {
    const snap = await getDoc(doc(db, 'nicknames', nick.toLowerCase()))
    if (snap.exists()) { error.value = 'Nickname já está em uso.'; return }
    nickStatus.value = 'ok'
    step.value++
  } finally {
    loading.value = false
  }
}

async function loginGoogle() {
  error.value = ''
  loading.value = true
  try {
    await authStore.loginWithGoogle()
    localStorage.setItem('gymtrack_seen', '1')
    if (authStore.needsNickname) {
      router.push('/setup-nickname')
    } else {
      router.push('/')
    }
  } catch (e) {
    if (e.code !== 'auth/popup-closed-by-user') error.value = 'Erro ao entrar com Google.'
  } finally {
    loading.value = false
  }
}

async function finish() {
  error.value = ''
  loading.value = true
  try {
    await authStore.register({
      email: form.value.email,
      password: form.value.password,
      nickname: form.value.nickname.trim(),
      goal: form.value.goal,
      level: form.value.level,
    })
    localStorage.setItem('gymtrack_seen', '1')
    router.push('/')
  } catch (e) {
    if (e.message === 'nickname-taken') error.value = 'Nickname já está em uso.'
    else if (e.code === 'auth/email-already-in-use') error.value = 'Este e-mail já está cadastrado.'
    else error.value = 'Erro ao criar conta. Tente novamente.'
  } finally {
    loading.value = false
  }
}
</script>
