<template>
  <div class="screen-scroll">
    <div class="max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col gap-5">

      <div class="flex items-center gap-3">
        <button @click="router.back()"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text2)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="gym-title text-3xl">Histórico</h1>
      </div>

      <!-- Stat chips -->
      <div class="flex gap-3">
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--accent-dim); border: 1px solid var(--accent-glow)">
          <div class="font-title font-bold text-lg" style="color: var(--accent)">{{ store.totalSessions }}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Total</div>
        </div>
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="font-title font-bold text-lg" style="color: var(--text)">{{ store.streak }}🔥</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Sequência</div>
        </div>
        <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
          <div class="font-title font-bold text-lg" style="color: var(--text)">{{ formatTotalTime }}</div>
          <div class="text-[11px] mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Horas</div>
        </div>
      </div>

      <!-- Calendar heatmap -->
      <div class="rounded-2xl p-4" style="background: var(--surface); border: 1px solid var(--border)">
        <div class="flex items-center justify-between mb-4">
          <button @click="prevMonth"
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style="color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 18px; background: var(--surface2)">
            ‹
          </button>
          <h2 class="font-title font-bold text-sm capitalize" style="color: var(--text)">{{ monthLabel }}</h2>
          <button @click="nextMonth"
            class="w-8 h-8 rounded-xl flex items-center justify-center transition-all"
            style="color: var(--text2); font-family: 'DM Sans', sans-serif; font-size: 18px; background: var(--surface2)">
            ›
          </button>
        </div>

        <!-- Day headers -->
        <div class="grid grid-cols-7 mb-2">
          <div v-for="d in ['D','S','T','Q','Q','S','S']" :key="d"
            class="text-center text-[11px] font-bold py-1"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif">{{ d }}</div>
        </div>

        <!-- Days grid -->
        <div class="grid grid-cols-7 gap-1">
          <div v-for="(day, i) in calendarDays" :key="i">
            <div v-if="!day" class="aspect-square"></div>
            <button v-else @click="selectDay(day)"
              class="w-full aspect-square rounded-xl flex items-center justify-center text-xs font-bold transition-all relative"
              :style="dayStyle(day)">
              {{ day.getDate() }}
              <span v-if="getDaySessions(day).length"
                class="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex gap-0.5">
                <span v-for="s in getDaySessions(day).slice(0,2)" :key="s.id"
                  class="w-1 h-1 rounded-full"
                  :style="`background: ${programColor(s.programId)}`"></span>
              </span>
            </button>
          </div>
        </div>
      </div>

      <!-- Selected day sessions -->
      <Transition name="fade">
        <div v-if="selectedDaySessions.length"
          class="rounded-2xl p-4"
          style="background: var(--surface); border: 1px solid var(--accent-glow)">
          <h3 class="font-title font-bold text-sm mb-3" style="color: var(--text)">
            {{ selectedDay?.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' }) }}
          </h3>
          <div class="flex flex-col gap-2">
            <div v-for="s in selectedDaySessions" :key="s.id"
              class="flex items-center gap-3 rounded-xl px-3 py-3"
              style="background: var(--surface2)">
              <span class="text-xl">{{ programIcon(s.programId) }}</span>
              <div class="flex-1">
                <div class="font-semibold text-sm" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                  {{ programName(s.programId) }}
                </div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                  {{ formatTime(s.startTime) }} → {{ formatTime(s.endTime) }}
                </div>
              </div>
              <div class="text-right">
                <div class="font-title font-bold text-sm" style="color: var(--accent)">{{ s.duration }}min</div>
                <button @click="deleteSession(s.id)"
                  class="text-[10px] mt-1 block"
                  style="color: #ef4444; font-family: 'DM Sans', sans-serif">
                  excluir
                </button>
              </div>
            </div>
          </div>
        </div>
      </Transition>

      <!-- Timeline -->
      <div v-if="store.sessions.length">
        <div class="flex justify-between items-center mb-4">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Sessões recentes</p>
        </div>

        <div class="relative" style="padding-left: 28px">
          <!-- Vertical line -->
          <div class="absolute left-[11px] top-3 bottom-3 w-0.5" style="background: var(--surface3)"></div>

          <div v-for="(s, i) in store.sessions" :key="s.id" class="relative mb-3">
            <!-- Dot -->
            <div class="absolute rounded-full transition-all"
              style="left: -17px; top: 14px; width: 12px; height: 12px"
              :style="i === 0
                ? 'background: var(--accent); border: 2px solid var(--accent); box-shadow: 0 0 10px rgba(255,77,28,0.5)'
                : 'background: var(--surface3); border: 2px solid var(--border)'">
            </div>

            <div class="rounded-2xl p-3 transition-all"
              :style="i === 0
                ? 'background: var(--surface); border: 1px solid var(--accent-glow)'
                : 'background: var(--surface); border: 1px solid var(--border)'">
              <div class="flex justify-between items-start">
                <div>
                  <div class="flex items-center gap-2">
                    <span class="font-title font-bold text-sm" style="color: var(--text)">
                      {{ programName(s.programId) }}
                    </span>
                  </div>
                  <div class="text-xs mt-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                    {{ formatDate(s.startTime) }}
                  </div>
                </div>
                <div class="flex items-center gap-2">
                  <div v-if="i === 0"
                    class="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                    style="background: linear-gradient(135deg, var(--accent), #FF8C5A); font-family: 'DM Sans', sans-serif">
                    Último
                  </div>
                </div>
              </div>
              <div class="flex gap-4 mt-2">
                <span class="text-xs" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                  ⏱ {{ s.duration }}min
                </span>
                <span class="text-xs" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                  ⚡ {{ s.completedExercises.length }} exerc.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="flex flex-col items-center py-12 gap-3">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style="background: var(--surface2); border: 1px solid var(--border)">📅</div>
        <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          Nenhuma sessão registrada ainda
        </p>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'

const router = useRouter()
import { programs } from '@/data/programs'

const store = useWorkoutStore()
const viewDate = ref(new Date())
const selectedDay = ref(null)

const monthLabel = computed(() =>
  viewDate.value.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
)

const calendarDays = computed(() => {
  const d = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth(), 1)
  const days = []
  for (let i = 0; i < d.getDay(); i++) days.push(null)
  while (d.getMonth() === viewDate.value.getMonth()) {
    days.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return days
})

const formatTotalTime = computed(() => {
  const h = Math.floor(store.totalMinutes / 60)
  const m = store.totalMinutes % 60
  return h > 0 ? `${h}h${m > 0 ? m + 'm' : ''}` : `${m}m`
})

function getDaySessions(day) {
  return store.sessionsByDate[day.toDateString()] || []
}

const selectedDaySessions = computed(() => {
  if (!selectedDay.value) return []
  return getDaySessions(selectedDay.value)
})

function selectDay(day) {
  if (getDaySessions(day).length) {
    selectedDay.value = selectedDay.value?.toDateString() === day.toDateString() ? null : day
  }
}

function isToday(day) {
  return day.toDateString() === new Date().toDateString()
}

function dayStyle(day) {
  const hasSessions = getDaySessions(day).length > 0
  const today = isToday(day)
  const selected = selectedDay.value?.toDateString() === day.toDateString()

  if (selected) return 'background: var(--accent); color: #fff; box-shadow: 0 0 12px rgba(255,77,28,0.4)'
  if (today) return 'border: 2px solid var(--accent); color: var(--accent)'
  if (hasSessions) return 'background: rgba(255,77,28,0.18); color: var(--accent)'
  return 'color: var(--text3)'
}

function prevMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() - 1, 1)
}
function nextMonth() {
  viewDate.value = new Date(viewDate.value.getFullYear(), viewDate.value.getMonth() + 1, 1)
}

function programIcon(id) {
  return [...programs, ...store.customPrograms].find(p => p.id === id)?.icon || '💪'
}
function programName(id) {
  return [...programs, ...store.customPrograms].find(p => p.id === id)?.name || `Treino ${id}`
}
function programColor(id) {
  return [...programs, ...store.customPrograms].find(p => p.id === id)?.color || 'var(--accent)'
}

function formatDate(iso) {
  return new Date(iso).toLocaleDateString('pt-BR', { weekday: 'short', day: 'numeric', month: 'short' })
}
function formatTime(iso) {
  if (!iso) return '--'
  return new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
}
function deleteSession(id) {
  if (confirm('Excluir esta sessão?')) {
    store.deleteSession(id)
    selectedDay.value = null
  }
}
</script>
