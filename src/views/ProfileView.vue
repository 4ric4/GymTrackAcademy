<template>
  <div class="screen-scroll">
    <div class="max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col gap-5">

      <!-- Back -->
      <div class="flex items-center gap-3">
        <button @click="router.push('/')"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text2)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="gym-title text-2xl">Perfil</h1>
      </div>

      <!-- Hero -->
      <div class="flex flex-col items-center gap-3">
        <div class="relative">
          <div class="w-20 h-20 rounded-3xl flex items-center justify-center font-title font-bold text-3xl text-white"
            style="background: linear-gradient(135deg, var(--accent), #C73000); box-shadow: 0 8px 32px rgba(255,77,28,0.4)">
            {{ (authStore.userProfile?.nickname?.[0] || authStore.firebaseUser?.email?.[0] || 'G').toUpperCase() }}
          </div>
          <div class="absolute bottom-0 right-0 w-6 h-6 rounded-full flex items-center justify-center"
            style="background: var(--accent); border: 2px solid var(--bg)">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"
                stroke="#fff" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </div>
        </div>
        <div class="text-center">
          <h1 class="font-title font-bold text-2xl" style="color: var(--text)">@{{ authStore.userProfile?.nickname || 'você' }}</h1>
          <p class="text-sm mt-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
            Membro desde {{ memberSince }}
          </p>
        </div>
        <div class="flex gap-2">
          <span class="gym-tag active">🏅 Ativo</span>
          <span class="gym-tag" :class="{ active: store.streak >= 7 }"
            style="border-color: var(--warn); color: var(--warn)">
            🔥 {{ store.streak }}d streak
          </span>
        </div>
        <button @click="logout"
          class="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95"
          style="background: rgba(239,68,68,0.08); border: 1px solid rgba(239,68,68,0.25); color: #ef4444; font-family: 'DM Sans', sans-serif">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
          Sair da conta
        </button>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-3 gap-3">
        <div v-for="stat in statsGrid" :key="stat.label"
          class="rounded-2xl py-3 px-2 text-center"
          :style="stat.accent
            ? 'background: var(--accent-dim); border: 1px solid var(--accent-glow)'
            : 'background: var(--surface); border: 1px solid var(--border)'">
          <div class="font-title font-bold text-xl"
            :style="stat.accent ? 'color: var(--accent)' : 'color: var(--text)'">
            {{ stat.value }}
          </div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
            {{ stat.label }}
          </div>
        </div>
      </div>

      <div style="height: 1px; background: var(--border)"></div>

      <!-- Meu treino atual -->
      <div>
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Meu treino atual</p>
          <button @click="showProgramPicker = !showProgramPicker"
            class="text-xs font-bold px-3 py-1.5 rounded-full transition-all"
            :style="showProgramPicker
              ? 'background: var(--accent); color: #fff'
              : 'background: var(--surface2); color: var(--accent); border: 1px solid var(--accent-glow)'">
            {{ showProgramPicker ? 'Fechar' : 'Mudar' }}
          </button>
        </div>

        <!-- Treino selecionado atualmente -->
        <div v-if="currentProgram"
          class="flex items-center gap-4 rounded-2xl px-4 py-4"
          style="background: var(--accent-dim); border: 1.5px solid var(--accent-glow)">
          <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
            :style="`background: ${currentProgram.color}20; border: 1.5px solid ${currentProgram.color}40`">
            {{ currentProgram.icon }}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-title font-bold text-base truncate" style="color: var(--text)">
              {{ currentProgram.name }}
            </div>
            <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ currentProgram.focus }} · {{ currentProgram.exercises.length }} exercícios
            </div>
          </div>
          <div class="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style="background: var(--accent)">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
        </div>

        <!-- Lista de programas para escolher -->
        <Transition name="slide-up">
          <div v-if="showProgramPicker" class="mt-3 flex flex-col gap-2">
            <div v-if="!store.customPrograms.length" class="text-center py-6">
              <p class="text-sm mb-3" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                Nenhum treino criado ainda
              </p>
              <RouterLink to="/ia" class="btn-accent" style="display: inline-flex; width: auto; padding: 10px 24px; font-size: 13px">
                🤖 Montar com IA
              </RouterLink>
            </div>

            <div v-for="p in store.customPrograms" :key="p.id"
              class="rounded-2xl overflow-hidden transition-all"
              :style="store.preferredProgramId === p.id
                ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)'
                : 'background: var(--surface); border: 1.5px solid var(--border)'">
              <div @click="selectProgram(p.id)"
                class="flex items-center gap-4 px-4 py-3 cursor-pointer">
                <div class="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                  :style="`background: ${p.color}20; border: 1.5px solid ${p.color}40`">
                  {{ p.icon }}
                </div>
                <div class="flex-1 min-w-0">
                  <div class="font-title font-bold text-sm truncate"
                    :style="store.preferredProgramId === p.id ? 'color: var(--accent)' : 'color: var(--text)'">
                    {{ p.name }}
                  </div>
                  <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                    {{ p.focus }} · {{ p.exercises.length }} exercícios
                  </div>
                </div>
                <div v-if="store.preferredProgramId === p.id"
                  class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                  style="background: var(--accent)">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </div>
              </div>
              <button @click="shareProgram(p)"
                class="w-full flex items-center justify-center gap-2 py-2 text-xs font-semibold transition-all"
                style="border-top: 1px solid var(--border); color: var(--accent); font-family: 'DM Sans', sans-serif">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8M16 6l-4-4-4 4M12 2v13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
                Compartilhar treino
              </button>
            </div>

            <RouterLink to="/ia"
              class="flex items-center justify-center gap-2 rounded-2xl py-4 mt-1 transition-all"
              style="border: 1.5px dashed var(--surface3); color: var(--text3); font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600">
              🤖 Gerar novo treino com IA
            </RouterLink>
          </div>
        </Transition>
      </div>

      <div style="height: 1px; background: var(--border)"></div>

      <!-- Objetivo -->
      <div>
        <p class="font-title font-bold text-sm mb-3" style="color: var(--text)">Objetivo atual</p>
        <div class="flex flex-col gap-2">
          <div v-for="goal in goals" :key="goal.label"
            @click="selectedGoal = goal.label"
            class="flex items-center gap-4 rounded-2xl px-4 py-3 cursor-pointer transition-all"
            :style="selectedGoal === goal.label
              ? 'background: var(--accent-dim); border: 1.5px solid var(--accent)'
              : 'background: var(--surface); border: 1.5px solid var(--border)'">
            <div class="w-10 h-10 rounded-xl flex items-center justify-center text-xl shrink-0"
              style="background: var(--surface2); border: 1px solid var(--border)">
              {{ goal.icon }}
            </div>
            <div class="flex-1">
              <div class="font-title font-bold text-sm"
                :style="selectedGoal === goal.label ? 'color: var(--accent)' : 'color: var(--text)'">
                {{ goal.label }}
              </div>
              <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ goal.sub }}
              </div>
            </div>
            <div v-if="selectedGoal === goal.label"
              class="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
              style="background: var(--accent)">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div style="height: 1px; background: var(--border)"></div>

      <!-- Menu -->
      <div>
        <p class="font-title font-bold text-sm mb-3" style="color: var(--text)">Configurações</p>
        <div class="rounded-2xl overflow-hidden" style="background: var(--surface); border: 1px solid var(--border)">
          <!-- Inbox item -->
          <RouterLink to="/inbox"
            class="flex justify-between items-center px-4 py-4 transition-all"
            style="border-bottom: 1px solid var(--border)">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style="background: var(--surface2)">📬</div>
              <span class="text-sm font-semibold" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                Caixa de entrada
              </span>
            </div>
            <div class="flex items-center gap-2">
              <div v-if="store.unreadInboxCount > 0"
                class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                style="background: #ef4444">{{ store.unreadInboxCount }}</div>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color: var(--text3)">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </RouterLink>
          <RouterLink v-for="(item, i) in menuItems" :key="item.label"
            :to="item.to"
            class="flex justify-between items-center px-4 py-4 transition-all"
            :style="i < menuItems.length - 1 ? 'border-bottom: 1px solid var(--border)' : ''">
            <div class="flex items-center gap-3">
              <div class="w-8 h-8 rounded-xl flex items-center justify-center text-base"
                style="background: var(--surface2)">{{ item.icon }}</div>
              <span class="text-sm font-semibold" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                {{ item.label }}
              </span>
            </div>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color: var(--text3)">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </RouterLink>
        </div>
      </div>

      <!-- Logout -->
      <button @click="logout"
        class="w-full py-4 rounded-2xl text-sm font-bold transition-all active:scale-[0.98]"
        style="background: rgba(239,68,68,0.08); border: 1.5px solid rgba(239,68,68,0.2); color: #ef4444; font-family: 'DM Sans', sans-serif">
        Sair da conta
      </button>

      <p class="text-center text-xs" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
        GymTrack v1.0.0
      </p>

    </div>
  </div>

  <!-- Share modal -->
  <Transition name="fade">
    <div v-if="shareModal.show"
      class="fixed inset-0 z-50 flex items-end justify-center px-4 pb-8"
      style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)"
      @click.self="shareModal.show = false">
      <div class="w-full max-w-sm rounded-3xl p-6" style="background: var(--surface)">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 rounded-2xl flex items-center justify-center text-xl shrink-0"
            :style="`background: ${shareModal.program?.color}20`">
            {{ shareModal.program?.icon }}
          </div>
          <div>
            <h3 class="font-title font-bold text-base" style="color: var(--text)">{{ shareModal.program?.name }}</h3>
            <p class="text-xs" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Compartilhar com outro usuário</p>
          </div>
        </div>
        <input v-model="shareModal.nick" type="text" placeholder="@nickname de quem vai receber"
          maxlength="20"
          class="w-full rounded-2xl px-4 py-3 text-sm outline-none mb-3"
          style="background: var(--surface2); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif"
          @focus="$event.target.style.borderColor = 'var(--accent)'"
          @blur="$event.target.style.borderColor = 'var(--border)'" />
        <p v-if="shareModal.error" class="text-xs mb-3" style="color: #ef4444; font-family: 'DM Sans', sans-serif">{{ shareModal.error }}</p>
        <p v-if="shareModal.success" class="text-xs mb-3" style="color: #22c55e; font-family: 'DM Sans', sans-serif">✓ Treino enviado com sucesso!</p>
        <div class="flex gap-3">
          <button @click="shareModal.show = false" class="btn-ghost flex-1 py-3 text-sm">Cancelar</button>
          <button @click="sendShare" class="btn-accent flex-1 py-3 text-sm"
            :class="{ 'opacity-50': shareModal.sending }">
            {{ shareModal.sending ? 'Enviando...' : 'Enviar' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter, useRoute } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()
const route = useRoute()
const store = useWorkoutStore()
const authStore = useAuthStore()

const showProgramPicker = ref(route.query.mudar === '1')
const selectedGoal = ref(authStore.userProfile?.goal || 'Ganhar massa')

const currentProgram = computed(() => {
  const id = store.preferredProgramId
  return store.customPrograms.find(p => p.id === id) || store.customPrograms[0]
})

function selectProgram(id) {
  const uid = authStore.firebaseUser?.uid
  if (uid) {
    store.setPreferredProgramId(uid, id)
  } else {
    store.setPreferredProgram(id)
  }
  showProgramPicker.value = false
}

async function logout() {
  localStorage.removeItem('gymtrack_seen')
  await authStore.logout()
  router.replace('/login')
}

const shareModal = ref({ show: false, program: null, nick: '', error: '', success: false, sending: false })

function shareProgram(p) {
  shareModal.value = { show: true, program: p, nick: '', error: '', success: false, sending: false }
}

async function sendShare() {
  shareModal.value.error = ''
  shareModal.value.success = false
  const nick = shareModal.value.nick.trim().toLowerCase()
  if (!nick) { shareModal.value.error = 'Digite um nickname.'; return }
  const senderNick = authStore.userProfile?.nickname
  if (nick === senderNick?.toLowerCase()) { shareModal.value.error = 'Você não pode compartilhar com si mesmo.'; return }
  shareModal.value.sending = true
  try {
    await store.shareWorkout(senderNick, nick, shareModal.value.program)
    shareModal.value.success = true
    shareModal.value.nick = ''
    setTimeout(() => { shareModal.value.show = false }, 1500)
  } catch (e) {
    shareModal.value.error = e.message === 'user-not-found' ? 'Nickname não encontrado.' : 'Erro ao enviar. Tente novamente.'
  } finally {
    shareModal.value.sending = false
  }
}

const goals = [
  { icon: '🏋️', label: 'Ganhar massa',    sub: 'Hipertrofia e força' },
  { icon: '🔥', label: 'Perder gordura',  sub: 'Queima e definição' },
  { icon: '⚡', label: 'Condicionamento', sub: 'Resistência e cardio' },
  { icon: '🧘', label: 'Saúde geral',     sub: 'Bem-estar e mobilidade' },
]

const memberSince = computed(() => {
  const ct = authStore.firebaseUser?.metadata?.creationTime
  if (ct) return new Date(ct).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
  const oldest = store.sessions.at(-1)
  if (!oldest) return 'Hoje'
  return new Date(oldest.startTime).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
})

const formatTime = (minutes) => {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`
}

const statsGrid = computed(() => [
  { label: 'Treinos',      value: store.totalSessions },
  { label: 'Horas',        value: formatTime(store.totalMinutes) },
  { label: 'Esta sem.',    value: `${store.currentWeekSessions.length}x`, accent: true },
  { label: 'Sequência',    value: `${store.streak}🔥`, accent: store.streak >= 7 },
  { label: 'Criados',      value: store.customPrograms.length },
  { label: 'Rank',         value: store.totalSessions >= 50 ? '🥇' : store.totalSessions >= 20 ? '🥈' : '🥉' },
])

const menuItems = [
  { icon: '📋', label: 'Todos os treinos',    to: '/treinos' },
  { icon: '📅', label: 'Histórico completo',  to: '/historico' },
  { icon: '🧠', label: 'Mapa de exercícios',  to: '/mapa' },
  { icon: '➕', label: 'Criar treino',         to: '/criar-treino' },
]
</script>
