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
          <div v-for="i in 3" :key="i" class="flex-1 rounded-full transition-all"
            style="height: 3px"
            :style="i <= step ? 'background: var(--accent)' : 'background: var(--surface3)'"></div>
        </div>
        <span class="text-xs font-semibold shrink-0" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          {{ step }}/3
        </span>
      </div>

      <!-- ── Step 1: Objetivo ── -->
      <Transition name="fade" mode="out-in">
        <div v-if="step === 1" key="step1" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 1 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Qual é seu<br/>
              <span style="color: var(--accent)">objetivo?</span>
            </h2>
            <p class="text-sm mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Vamos personalizar seus treinos.
            </p>
          </div>

          <div class="flex flex-col gap-3 flex-1">
            <div v-for="g in goals" :key="g.label"
              @click="form.goal = g.label"
              class="flex items-center gap-4 rounded-2xl px-4 py-4 cursor-pointer transition-all active:scale-[0.98]"
              :style="form.goal === g.label
                ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)'
                : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style="background: var(--surface2); border: 1px solid var(--border)">
                {{ g.icon }}
              </div>
              <div class="flex-1">
                <div class="font-title font-bold text-base"
                  :style="form.goal === g.label ? 'color: var(--accent)' : 'color: var(--text)'">
                  {{ g.label }}
                </div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                  {{ g.sub }}
                </div>
              </div>
              <div v-if="form.goal === g.label"
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style="background: var(--accent)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <button @click="next" class="btn-accent py-4" :disabled="!form.goal"
            :style="!form.goal ? 'opacity: 0.4; cursor: not-allowed' : ''">
            Próximo →
          </button>
        </div>

        <!-- ── Step 2: Dados pessoais ── -->
        <div v-else-if="step === 2" key="step2" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 2 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Como te<br/>
              <span style="color: var(--accent)">chamamos?</span>
            </h2>
            <p class="text-sm mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Seu nome aparece no dashboard e no perfil.
            </p>
          </div>

          <div class="flex flex-col gap-4">
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
                Nome
              </label>
              <input v-model="form.name" type="text" placeholder="Ex: Lucas, Ana..."
                class="w-full rounded-2xl px-4 py-4 text-sm outline-none transition-all"
                style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
                @focus="$event.target.style.borderColor = 'var(--accent)'"
                @blur="$event.target.style.borderColor = 'var(--border)'" />
            </div>
            <div class="flex flex-col gap-1.5">
              <label class="text-xs font-bold uppercase tracking-widest"
                style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
                Senha
              </label>
              <div class="relative">
                <input v-model="form.password" :type="showPassword ? 'text' : 'password'" placeholder="Crie uma senha"
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
          </div>

          <Transition name="fade">
            <p v-if="error" class="text-xs font-semibold" style="color: #ef4444; font-family: 'DM Sans', sans-serif">
              {{ error }}
            </p>
          </Transition>

          <button @click="next" class="btn-accent py-4 mt-auto">
            Próximo →
          </button>
        </div>

        <!-- ── Step 3: Nível ── -->
        <div v-else key="step3" class="flex flex-col gap-6 flex-1">
          <div>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Passo 3 de 3</p>
            <h2 class="font-title font-bold leading-tight" style="font-size: 30px; letter-spacing: -1px; color: var(--text)">
              Qual seu<br/>
              <span style="color: var(--accent)">nível?</span>
            </h2>
            <p class="text-sm mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Isso ajuda a montar o treino ideal.
            </p>
          </div>

          <div class="flex flex-col gap-3 flex-1">
            <div v-for="l in levels" :key="l.label"
              @click="form.level = l.label"
              class="flex items-center gap-4 rounded-2xl px-4 py-4 cursor-pointer transition-all active:scale-[0.98]"
              :style="form.level === l.label
                ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)'
                : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
                style="background: var(--surface2); border: 1px solid var(--border)">
                {{ l.icon }}
              </div>
              <div class="flex-1">
                <div class="font-title font-bold text-base"
                  :style="form.level === l.label ? 'color: var(--accent)' : 'color: var(--text)'">
                  {{ l.label }}
                </div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                  {{ l.sub }}
                </div>
              </div>
              <div v-if="form.level === l.label"
                class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
                style="background: var(--accent)">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
            </div>
          </div>

          <button @click="finish" class="btn-accent py-4" :disabled="!form.level"
            :style="!form.level ? 'opacity: 0.4; cursor: not-allowed' : ''">
            Criar minha conta 🚀
          </button>
        </div>
      </Transition>

    </div>

    <!-- Login link -->
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

const router = useRouter()
const step = ref(1)
const showPassword = ref(false)
const error = ref('')

const form = ref({ goal: '', name: '', password: '', level: '' })

const goals = [
  { icon: '🏋️', label: 'Ganhar massa',    sub: 'Hipertrofia e força' },
  { icon: '🔥', label: 'Perder gordura',  sub: 'Queima e definição' },
  { icon: '⚡', label: 'Condicionamento', sub: 'Resistência e cardio' },
  { icon: '🧘', label: 'Saúde geral',     sub: 'Bem-estar e mobilidade' },
]

const levels = [
  { icon: '🌱', label: 'Iniciante',   sub: 'Menos de 1 ano treinando' },
  { icon: '💪', label: 'Intermediário', sub: '1 a 3 anos de treino' },
  { icon: '🔥', label: 'Avançado',    sub: 'Mais de 3 anos treinando' },
]

function next() {
  error.value = ''
  if (step.value === 2) {
    if (!form.value.name.trim()) { error.value = 'Informe seu nome.'; return }
    if (form.value.password.length < 4) { error.value = 'Senha deve ter ao menos 4 caracteres.'; return }
  }
  step.value++
}

function finish() {
  localStorage.setItem('gymtrack_user', JSON.stringify({
    name: form.value.name.trim(),
    password: form.value.password,
    goal: form.value.goal,
    level: form.value.level,
  }))
  localStorage.setItem('gymtrack_seen', '1')
  router.push('/')
}
</script>
