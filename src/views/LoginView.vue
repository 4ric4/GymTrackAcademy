<template>
  <div class="min-h-screen flex flex-col relative overflow-hidden" style="background: var(--bg)">
    <div class="absolute inset-0 pointer-events-none"
      style="background-image: linear-gradient(rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.04) 1px, transparent 1px); background-size: 40px 40px; opacity: 0.5"></div>

    <!-- Back -->
    <div class="relative z-10 px-6 pt-14">
      <button @click="router.back()"
        class="flex items-center gap-2 text-sm font-semibold"
        style="color: var(--text2); font-family: 'DM Sans', sans-serif">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        Voltar
      </button>
    </div>

    <!-- Content -->
    <div class="flex-1 flex flex-col justify-center px-6 gap-8 relative z-10">
      <!-- Logo mini -->
      <div class="flex items-center gap-3">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
          style="background: var(--accent); box-shadow: 0 0 24px rgba(255,77,28,0.4)">
          <svg width="28" height="28" viewBox="0 0 44 44" fill="none">
            <path d="M6 22H10M34 22H38M10 22C10 15.373 15.373 10 22 10C28.627 10 34 15.373 34 22C34 28.627 28.627 34 22 34C15.373 34 10 28.627 10 22Z"
              stroke="white" stroke-width="2.5" stroke-linecap="round"/>
            <path d="M16 22H28M22 16V28" stroke="white" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
        </div>
        <div>
          <h1 class="font-title font-bold text-2xl leading-none" style="color: var(--text)">Bem-vindo de volta</h1>
          <p class="text-sm mt-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Entre na sua conta GymTrack</p>
        </div>
      </div>

      <!-- Form -->
      <div class="flex flex-col gap-4">
        <!-- Name -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
            Nome de usuário
          </label>
          <input v-model="form.name" type="text" placeholder="Seu nome"
            class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
            style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
            @focus="$event.target.style.borderColor = 'var(--accent)'"
            @blur="$event.target.style.borderColor = 'var(--border)'" />
        </div>

        <!-- Password -->
        <div class="flex flex-col gap-1.5">
          <label class="text-xs font-bold uppercase tracking-widest"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
            Senha
          </label>
          <div class="relative">
            <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="••••••••"
              class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all pr-12"
              style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
              @focus="$event.target.style.borderColor = 'var(--accent)'"
              @blur="$event.target.style.borderColor = 'var(--border)'" />
            <button @click="showPassword = !showPassword"
              class="absolute right-4 top-1/2 -translate-y-1/2"
              style="color: var(--text3)">
              <svg v-if="!showPassword" width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" stroke="currentColor" stroke-width="2"/>
                <circle cx="12" cy="12" r="3" stroke="currentColor" stroke-width="2"/>
              </svg>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24M1 1l22 22" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        <!-- Error -->
        <Transition name="fade">
          <p v-if="error" class="text-xs font-semibold px-1" style="color: #ef4444; font-family: 'DM Sans', sans-serif">
            {{ error }}
          </p>
        </Transition>

        <button @click="login" class="btn-accent py-4 text-base mt-2">
          Entrar
        </button>
      </div>
    </div>

    <!-- Footer -->
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

const router = useRouter()
const showPassword = ref(false)
const error = ref('')

const form = ref({ name: '', password: '' })

function login() {
  error.value = ''
  if (!form.value.name.trim()) { error.value = 'Informe seu nome de usuário.'; return }
  if (!form.value.password) { error.value = 'Informe sua senha.'; return }

  const saved = JSON.parse(localStorage.getItem('gymtrack_user') || 'null')
  if (!saved) { error.value = 'Conta não encontrada. Crie uma conta primeiro.'; return }
  if (saved.name.toLowerCase() !== form.value.name.trim().toLowerCase()) {
    error.value = 'Usuário ou senha incorretos.'; return
  }
  if (saved.password !== form.value.password) {
    error.value = 'Usuário ou senha incorretos.'; return
  }

  localStorage.setItem('gymtrack_seen', '1')
  router.push('/')
}
</script>
