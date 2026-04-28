<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden" style="background: var(--bg)">
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5"></div>

    <div class="relative z-10 px-6 pt-14">
      <button @click="router.back()" class="flex items-center gap-2 text-sm font-semibold"
        style="color: var(--text2); font-family: 'DM Sans', sans-serif">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Voltar
      </button>
    </div>

    <div class="flex-1 flex flex-col justify-center px-6 gap-8 relative z-10">
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style="background: var(--accent); box-shadow: 0 0 24px rgba(255,77,28,0.4)">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
            <path d="M6 22H10M34 22H38M10 22C10 15.373 15.373 10 22 10C28.627 10 34 15.373 34 22C34 28.627 28.627 34 22 34C15.373 34 10 28.627 10 22Z" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M16 22H28M22 16V28" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h1 class="font-title font-bold text-2xl leading-none" style="color: var(--text)">Bem-vindo de volta</h1>
          <p class="text-sm mt-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Entre na sua conta GymTrack</p>
        </div>
      </div>

      <div class="flex flex-col gap-4">
        <!-- Email -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">E-mail</label>
          <input v-model="form.email" type="email" placeholder="seu@email.com"
            class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
            style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
            @focus="$event.target.style.borderColor = 'var(--accent)'"
            @blur="$event.target.style.borderColor = 'var(--border)'" />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">Senha</label>
          <div class="relative">
            <input v-model="form.password" :type="showPw ? 'text' : 'password'" placeholder="••••••••"
              class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all pr-12"
              style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
              @focus="$event.target.style.borderColor = 'var(--accent)'"
              @blur="$event.target.style.borderColor = 'var(--border)'"
              @keyup.enter="login" />
            <button @click="showPw = !showPw" class="absolute right-4 top-1/2 -translate-y-1/2" style="color: var(--text3)">
              <svg v-if="!showPw" width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/></svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>
            </button>
          </div>
        </div>

        <Transition name="fade">
          <p v-if="error" class="text-xs font-semibold" style="color: #ef4444; font-family: 'DM Sans', sans-serif">{{ error }}</p>
        </Transition>

        <button @click="login" class="btn-accent py-4 text-base mt-1"
          :class="{ 'opacity-50 cursor-not-allowed': loading }">
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>

        <!-- Divider -->
        <div class="flex items-center gap-3">
          <div class="flex-1 h-px" style="background: var(--border)"></div>
          <span class="text-xs" style="color: var(--text3); font-family: 'DM Sans', sans-serif">ou</span>
          <div class="flex-1 h-px" style="background: var(--border)"></div>
        </div>

        <!-- Google -->
        <button @click="loginGoogle"
          class="w-full flex items-center justify-center gap-3 rounded-2xl py-4 text-sm font-bold transition-all active:scale-[0.98]"
          style="background: var(--surface); border: 1.5px solid var(--border); color: var(--text); font-family: 'DM Sans', sans-serif">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continuar com Google
        </button>
      </div>
    </div>

    <div class="relative z-10 px-6 pb-12 text-center">
      <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
        Não tem conta?
        <RouterLink to="/cadastro" class="font-bold" style="color: var(--accent)">Criar conta</RouterLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const authStore = useAuthStore()

const showPw = ref(false)
const loading = ref(false)
const error = ref('')
const form = ref({ email: '', password: '' })

async function login() {
  error.value = ''
  if (!form.value.email || !form.value.password) { error.value = 'Preencha e-mail e senha.'; return }
  loading.value = true
  try {
    await authStore.login({ email: form.value.email, password: form.value.password })
    localStorage.setItem('gymtrack_seen', '1')
    router.push('/')
  } catch (e) {
    if (e.code === 'auth/user-not-found' || e.code === 'auth/wrong-password' || e.code === 'auth/invalid-credential')
      error.value = 'E-mail ou senha incorretos.'
    else error.value = 'Erro ao entrar. Tente novamente.'
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
</script>
