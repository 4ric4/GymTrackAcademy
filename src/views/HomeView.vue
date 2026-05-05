<template>
  <div class="screen-scroll">
    <div class="max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col gap-5">

      <!-- Header -->
      <div class="flex justify-between items-center">
        <div>
          <p class="gym-label text-sm">{{ greeting }},</p>
          <h1 class="gym-title text-3xl leading-tight">{{ authStore.userProfile?.nickname || 'GymTrack' }} 👊</h1>
        </div>
        <RouterLink to="/perfil"
          class="w-11 h-11 rounded-2xl flex items-center justify-center font-title font-bold text-base text-white transition-all active:scale-95"
          style="background: var(--accent); box-shadow: 0 0 16px rgba(255,77,28,0.35)">
          {{ (authStore.userProfile?.nickname?.[0] || 'G').toUpperCase() }}
        </RouterLink>
      </div>

      <!-- Streak Card -->
      <div class="rounded-2xl p-5 relative overflow-hidden"
        style="background: linear-gradient(135deg, var(--accent) 0%, #C73000 100%); box-shadow: 0 8px 32px rgba(255,77,28,0.4)">
        <div class="absolute right-[-20px] top-[-20px] w-32 h-32 rounded-full" style="background: rgba(255,255,255,0.07)"></div>
        <div class="absolute right-5 bottom-[-30px] w-20 h-20 rounded-full" style="background: rgba(255,255,255,0.05)"></div>
        <div class="flex items-flex-end justify-between relative z-10">
          <div>
            <p class="text-xs mb-1" style="color: rgba(255,255,255,0.7); font-family: 'DM Sans', sans-serif">🔥 Streak atual</p>
            <div class="font-title font-bold text-white leading-none" style="font-size: 52px; letter-spacing: -2px">{{ store.streak }}</div>
            <p class="text-sm mt-1" style="color: rgba(255,255,255,0.8); font-family: 'DM Sans', sans-serif">dias consecutivos</p>
          </div>
          <div class="text-right">
            <p class="text-xs" style="color: rgba(255,255,255,0.6); font-family: 'DM Sans', sans-serif">Total: {{ store.totalSessions }}</p>
            <p class="text-sm mt-1 font-semibold" style="color: rgba(255,255,255,0.9); font-family: 'Space Grotesk', sans-serif">
              {{ store.streak > 0 ? 'Não pare agora!' : 'Vamos começar!' }}
            </p>
          </div>
        </div>
      </div>

      <!-- Week circles -->
      <div>
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Esta semana</p>
          <RouterLink to="/historico" class="text-xs font-semibold" style="color: var(--accent); font-family: 'DM Sans', sans-serif">Ver tudo</RouterLink>
        </div>
        <div class="flex gap-2 justify-between">
          <div v-for="(d, i) in weekDays" :key="i" class="flex flex-col items-center gap-1.5">
            <div class="w-9 h-9 rounded-full flex items-center justify-center transition-all"
              :style="d.done
                ? 'background: var(--accent); box-shadow: 0 0 14px rgba(255,77,28,0.45); border: 1.5px solid var(--accent)'
                : 'background: var(--surface2); border: 1.5px solid var(--border)'">
              <svg v-if="d.done" width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
            <span class="text-[11px]" :style="d.done ? 'color: var(--text)' : 'color: var(--text3)'"
              style="font-family: 'DM Sans', sans-serif">{{ d.label }}</span>
          </div>
        </div>
      </div>

      <!-- Stats row -->
      <div class="flex gap-3">
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="font-title font-bold text-lg" style="color: var(--text)">{{ store.totalSessions }}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Treinos</div>
        </div>
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--accent-dim); border: 1px solid var(--accent-glow)">
          <div class="font-title font-bold text-lg" style="color: var(--accent)">{{ formatVol }}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Esta semana</div>
        </div>
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="font-title font-bold text-lg" style="color: var(--text)">{{ formatTime(store.totalMinutes) }}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Horas</div>
        </div>
      </div>

      <!-- Treino de hoje -->
      <div v-if="todayProgram">
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Treino de hoje</p>
          <RouterLink to="/perfil?mudar=1"
            class="text-xs font-bold px-3 py-1 rounded-full"
            style="background: var(--surface2); color: var(--accent); border: 1px solid var(--accent-glow); font-family: 'DM Sans', sans-serif">
            Trocar
          </RouterLink>
        </div>
        <div class="rounded-2xl overflow-hidden" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="h-28 flex items-center justify-center relative overflow-hidden"
            :style="`background: linear-gradient(135deg, ${todayProgram.color}18, var(--surface2))`">
            <span class="text-7xl" style="filter: drop-shadow(0 4px 16px rgba(0,0,0,0.4))">{{ todayProgram.icon }}</span>
          </div>
          <div class="p-4">
            <div class="flex justify-between items-start mb-1">
              <div>
                <div class="font-title font-bold text-lg leading-tight" style="color: var(--text)">{{ todayProgram.name }}</div>
                <div class="text-sm mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                  {{ todayProgram.exercises.length }} exercícios · {{ todayProgram.focus }}
                </div>
              </div>
            </div>
            <div class="mt-4">
              <button @click="quickStart(todayProgram.id)" class="btn-accent">
                ▶  Iniciar treino
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- IA Card -->
      <RouterLink to="/ia"
        class="flex items-center gap-4 rounded-2xl px-4 py-4 transition-all active:scale-95"
        style="background: linear-gradient(135deg, #1a0a2e, #0d1a2e); border: 1px solid rgba(139,92,246,0.3)">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0"
          style="background: linear-gradient(135deg, var(--accent), #C73000); box-shadow: 0 0 20px rgba(255,77,28,0.35)">🤖</div>
        <div class="flex-1 min-w-0">
          <div class="font-title font-bold text-base leading-tight" style="color: #fff">Monte seu treino com IA</div>
          <div class="text-xs mt-0.5" style="color: rgba(255,255,255,0.55); font-family: 'DM Sans', sans-serif">Descreva seu objetivo e a IA cria na hora</div>
        </div>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" style="color: rgba(255,255,255,0.4); shrink-0">
          <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </RouterLink>

      <!-- Outros treinos -->
      <div v-if="otherPrograms.length">
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Outros treinos</p>
          <RouterLink to="/treinos" class="text-xs font-semibold" style="color: var(--accent); font-family: 'DM Sans', sans-serif">
            Ver todos
          </RouterLink>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <button v-for="p in otherPrograms" :key="p.id"
            @click="quickStart(p.id)"
            class="flex items-center gap-3 rounded-2xl px-3 py-3.5 text-left transition-all active:scale-95"
            style="background: var(--surface); border: 1px solid var(--border)">
            <div class="w-11 h-11 rounded-xl flex items-center justify-center text-2xl shrink-0"
              :style="`background: ${p.color}20; border: 1.5px solid ${p.color}40`">
              {{ p.icon }}
            </div>
            <div class="min-w-0">
              <div class="font-title font-bold text-sm truncate" style="color: var(--text)">{{ p.name }}</div>
              <div class="text-xs mt-0.5 truncate" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ p.focus }}</div>
            </div>
          </button>
        </div>
      </div>

      <!-- Recent sessions -->
      <div v-if="recentSessions.length">
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Últimas sessões</p>
          <RouterLink to="/historico" class="text-xs font-semibold" style="color: var(--accent); font-family: 'DM Sans', sans-serif">Ver todas</RouterLink>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="s in recentSessions" :key="s.id"
            class="flex items-center gap-3 rounded-2xl px-4 py-3"
            style="background: var(--surface); border: 1px solid var(--border)">
            <span class="text-2xl">{{ programIcon(s.programId) }}</span>
            <div class="flex-1 min-w-0">
              <div class="font-title font-semibold text-sm truncate" style="color: var(--text)">
                {{ programName(s.programId) }}
              </div>
              <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ formatDate(s.startTime) }}
              </div>
            </div>
            <div class="text-right">
              <div class="font-title font-bold text-sm" style="color: var(--accent)">{{ s.duration }}min</div>
              <div class="text-[11px]" style="color: var(--text3); font-family: 'DM Sans', sans-serif">{{ s.completedExercises.length }} exerc.</div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center py-8 gap-3">
        <div class="w-16 h-16 rounded-3xl flex items-center justify-center text-3xl"
          style="background: var(--surface2); border: 1px solid var(--border)">🏋️</div>
        <p class="text-sm text-center" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          Nenhuma sessão ainda.<br>Crie um treino com a IA para começar!
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'

const store = useWorkoutStore()
const authStore = useAuthStore()
const router = useRouter()

const greeting = computed(() => {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
})

const weekDays = computed(() => {
  const labels = ['D','S','T','Q','Q','S','S']
  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - today.getDay())
  weekStart.setHours(0,0,0,0)

  return labels.map((label, i) => {
    const day = new Date(weekStart)
    day.setDate(weekStart.getDate() + i)
    const dayStr = day.toDateString()
    const done = store.sessions.some(s => new Date(s.startTime).toDateString() === dayStr)
    return { label, done }
  })
})

const recentSessions = computed(() => store.sessions.slice(0, 4))

const formatVol = computed(() => {
  const count = store.currentWeekSessions.length
  return count > 0 ? `${count}x` : '0x'
})

const allPrograms = computed(() => store.customPrograms)

const todayProgram = computed(() =>
  allPrograms.value.find(p => p.id === store.preferredProgramId) || allPrograms.value[0]
)

const otherPrograms = computed(() =>
  allPrograms.value.filter(p => p.id !== todayProgram.value?.id).slice(0, 4)
)

function programIcon(id) {
  return allPrograms.value.find(p => p.id === id)?.icon || '💪'
}
function programName(id) {
  return allPrograms.value.find(p => p.id === id)?.name || `Treino ${id}`
}

function formatTime(minutes) {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}h${m}m` : `${h}h`
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}

function quickStart(programId) {
  if (store.activeSession) { router.push('/sessao'); return }
  store.startSession(programId)
  router.push('/sessao')
}
</script>
