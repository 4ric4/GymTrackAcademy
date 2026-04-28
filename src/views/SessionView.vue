<template>
  <div class="max-w-md mx-auto" style="min-height: 100vh">

    <!-- ── No active session ─────────────────────────────── -->
    <div v-if="!store.activeSession" class="px-5 pt-6 pb-4 flex flex-col gap-5">
      <h1 class="gym-title text-3xl">Sessão</h1>
      <p class="text-sm -mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Escolha um treino para iniciar</p>

      <div class="grid grid-cols-2 gap-3">
        <button v-for="p in programs" :key="p.id" @click="start(p.id)"
          class="flex flex-col items-center gap-2.5 rounded-2xl py-5 px-3 transition-all active:scale-95"
          style="background: var(--surface); border: 1px solid var(--border)">
          <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl"
            :style="`background: ${p.color}20; border: 1.5px solid ${p.color}40`">
            {{ p.icon }}
          </div>
          <div class="font-title font-bold text-sm text-center" style="color: var(--text)">{{ p.name }}</div>
          <div class="text-xs text-center" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ p.focus }}</div>
        </button>
      </div>
    </div>

    <!-- ── Rest Timer mode ───────────────────────────────── -->
    <div v-else-if="restMode"
      class="flex flex-col items-center px-6 pt-4 pb-8"
      style="min-height: 100vh">
      <!-- Top bar -->
      <div class="flex justify-between w-full items-center mb-5">
        <div class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ programName }}</div>
        <div class="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style="background: var(--surface); border: 1px solid var(--border)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="color: var(--accent)">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="font-title font-bold text-sm" style="color: var(--accent)">{{ elapsed }}</span>
        </div>
      </div>

      <p class="text-xs tracking-widest uppercase mb-8" style="color: var(--text2); font-family: 'DM Sans', sans-serif; letter-spacing: 3px">Descanso</p>

      <!-- Circular timer -->
      <div class="relative mb-8" style="width: 220px; height: 220px">
        <svg width="220" height="220" style="position: absolute; top: 0; left: 0">
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--surface2)" stroke-width="8"/>
          <circle cx="110" cy="110" r="100" fill="none" stroke="var(--accent)" stroke-width="8"
            :stroke-dasharray="628"
            :stroke-dashoffset="628 - (restRemaining / restTotal) * 628"
            stroke-linecap="round"
            transform="rotate(-90 110 110)"
            :style="`filter: drop-shadow(0 0 8px var(--accent)); transition: stroke-dashoffset 1s linear`"/>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <div class="font-title font-bold leading-none" style="font-size: 56px; letter-spacing: -3px; color: var(--text)">
            {{ formatRestTime }}
          </div>
          <div class="text-sm mt-2" style="color: var(--text2); font-family: 'DM Sans', sans-serif">restando</div>
        </div>
      </div>

      <!-- Next exercise -->
      <div class="w-full rounded-2xl p-4 mb-auto" style="background: var(--surface); border: 1px solid var(--border)">
        <p class="text-[11px] tracking-widest uppercase mb-3" style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1px">
          Próximo exercício
        </p>
        <div v-if="nextExercise" class="flex items-center gap-3">
          <div class="w-14 h-12 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
            style="background: var(--surface2); border: 1px solid var(--border)">
            <img v-if="nextExercise.videoId"
              :src="`https://img.youtube.com/vi/${nextExercise.videoId}/mqdefault.jpg`"
              class="w-full h-full object-cover" />
            <span v-else class="text-2xl">💪</span>
          </div>
          <div>
            <div class="font-title font-bold text-base" style="color: var(--text)">{{ nextExercise.name }}</div>
            <div class="text-xs mt-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ nextExercise.sets }} séries · {{ nextExercise.reps }} reps
            </div>
          </div>
        </div>
        <div v-else class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          Último exercício! 🏆
        </div>
      </div>

      <div style="height: 24px"></div>

      <div class="flex gap-3 w-full">
        <button @click="addRestTime(30)" class="btn-ghost flex-1">+30s</button>
        <button @click="skipRest" class="btn-accent flex-1">Pular descanso →</button>
      </div>
    </div>

    <!-- ── Active session ────────────────────────────────── -->
    <div v-else class="flex flex-col pb-6" style="min-height: 100vh">
      <!-- Top bar -->
      <div class="flex justify-between items-center px-5 pt-4 pb-3">
        <div class="text-sm font-semibold" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ programName }}</div>
        <div class="flex items-center gap-1.5 rounded-full px-3 py-1.5"
          style="background: var(--surface); border: 1px solid var(--border)">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="color: var(--accent)">
            <circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/>
            <path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          <span class="font-title font-bold text-sm" style="color: var(--accent)">{{ elapsed }}</span>
        </div>
      </div>

      <!-- Progress bar (exercises) -->
      <div class="px-5 mb-1">
        <div class="flex gap-1.5">
          <div v-for="(ex, i) in sessionExercises" :key="ex.id"
            class="flex-1 rounded-full transition-all"
            style="height: 3px"
            :style="isCompleted(ex.id)
              ? 'background: var(--accent)'
              : 'background: var(--surface3)'">
          </div>
        </div>
        <div class="text-xs mt-1.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          {{ completedCount }}/{{ totalCount }} exercícios
        </div>
      </div>

      <!-- Exercise checklist -->
      <div class="px-5 flex flex-col gap-3 flex-1">
        <div v-for="(ex, i) in sessionExercises" :key="ex.id"
          class="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
          :style="isCompleted(ex.id)
            ? 'background: var(--accent-dim); border: 1.5px solid var(--accent-glow)'
            : 'background: var(--surface); border: 1px solid var(--border)'">
          <!-- Number or check -->
          <button @click="toggleExercise(ex)"
            class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all font-title font-bold text-sm"
            :style="isCompleted(ex.id)
              ? 'background: var(--accent); color: #fff; box-shadow: 0 0 12px rgba(255,77,28,0.4)'
              : 'background: var(--surface3); border: 1.5px solid var(--border); color: var(--text2)'">
            <svg v-if="isCompleted(ex.id)" width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            <span v-else>{{ i + 1 }}</span>
          </button>
          <!-- Info -->
          <div class="flex-1 min-w-0">
            <div class="font-semibold text-sm" :style="isCompleted(ex.id) ? 'color: var(--accent); font-family: DM Sans, sans-serif' : 'color: var(--text); font-family: DM Sans, sans-serif'">
              {{ ex.name }}
            </div>
            <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ ex.sets }} séries · {{ ex.reps }} reps
            </div>
          </div>
          <!-- Video thumb + swap -->
          <div class="flex items-center gap-2">
            <button v-if="ex.videoId" @click="openVideo(ex)"
              class="w-9 h-9 rounded-xl overflow-hidden shrink-0" style="border: 1px solid var(--border)">
              <img :src="`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`"
                class="w-full h-full object-cover" loading="lazy" />
            </button>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="px-5 mt-5 flex gap-3">
        <button @click="finish"
          class="btn-accent flex-1 py-4 text-base">
          ✓ Finalizar Treino
        </button>
        <button @click="cancel"
          class="w-14 rounded-2xl flex items-center justify-center text-xl transition-all"
          style="background: var(--surface); border: 1px solid rgba(239,68,68,0.3); color: #ef4444">
          ✕
        </button>
      </div>

      <!-- Finish confirm modal -->
      <Transition name="fade">
        <div v-if="showFinishConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center px-6"
          style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)">
          <div class="w-full max-w-sm rounded-3xl p-7 text-center"
            style="background: var(--surface)">
            <div class="text-5xl mb-3">🏆</div>
            <h3 class="font-title font-bold text-2xl mb-1" style="color: var(--text)">Treino finalizado!</h3>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Duração: <span class="font-bold" style="color: var(--text)">{{ elapsed }}</span>
            </p>
            <p class="text-sm mb-6" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ completedCount }} exercícios realizados
            </p>
            <button @click="confirmFinish" class="btn-accent py-4 text-base mb-3">
              Salvar sessão 💾
            </button>
            <button @click="showFinishConfirm = false"
              class="w-full py-2 text-sm"
              style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Continuar treinando
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <VideoModal :show="!!selectedVideo" :exercise="selectedVideo" @close="selectedVideo = null" />
    <AlternativesModal
      :show="!!selectedForSwap"
      :exercise="selectedForSwap"
      :program-id="store.activeSession?.programId"
      :original-exercise-id="swapOriginalId"
      @close="selectedForSwap = null" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { programs } from '@/data/programs'
import VideoModal from '@/components/VideoModal.vue'
import AlternativesModal from '@/components/AlternativesModal.vue'

const store = useWorkoutStore()
const router = useRouter()

const now = ref(Date.now())
const showFinishConfirm = ref(false)
const selectedVideo = ref(null)
const selectedForSwap = ref(null)
const swapOriginalId = ref(null)

// Rest timer
const restMode = ref(false)
const restTotal = ref(90)
const restRemaining = ref(90)
let restInterval = null

let globalTimer
onMounted(() => { globalTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => {
  clearInterval(globalTimer)
  if (restInterval) clearInterval(restInterval)
})

const program = computed(() =>
  [...programs, ...store.customPrograms].find(p => p.id === store.activeSession?.programId)
)
const programName = computed(() => program.value?.name || '')
const sessionExercises = computed(() => store.getProgramExercises(store.activeSession?.programId))
const totalCount = computed(() => sessionExercises.value.length)
const completedCount = computed(() => store.activeSession?.completedExercises.length || 0)

const elapsed = computed(() => {
  if (!store.activeSession) return '00:00'
  const s = Math.floor((now.value - new Date(store.activeSession.startTime)) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
})

const formatRestTime = computed(() => {
  const m = Math.floor(restRemaining.value / 60)
  const s = restRemaining.value % 60
  return `${m}:${String(s).padStart(2,'0')}`
})

const nextExercise = computed(() => {
  const exs = sessionExercises.value
  const idx = exs.findIndex(ex => !isCompleted(ex.id))
  return idx >= 0 ? exs[idx] : null
})

function isCompleted(id) {
  return store.activeSession?.completedExercises.includes(id)
}

function toggleExercise(ex) {
  const wasCompleted = isCompleted(ex.id)
  store.toggleExercise(ex.id)
  if (!wasCompleted) startRest()
}

function startRest() {
  restTotal.value = 90
  restRemaining.value = 90
  restMode.value = true
  if (restInterval) clearInterval(restInterval)
  restInterval = setInterval(() => {
    restRemaining.value--
    if (restRemaining.value <= 0) skipRest()
  }, 1000)
}

function skipRest() {
  restMode.value = false
  if (restInterval) { clearInterval(restInterval); restInterval = null }
}

function addRestTime(seconds) {
  restRemaining.value += seconds
  restTotal.value += seconds
}

function start(programId) { store.startSession(programId) }
function finish() { showFinishConfirm.value = true }

function confirmFinish() {
  store.endSession()
  showFinishConfirm.value = false
  router.push('/')
}

function cancel() {
  if (confirm('Cancelar a sessão atual?')) {
    store.cancelSession()
    skipRest()
    router.push('/')
  }
}

function openVideo(ex) { selectedVideo.value = ex }
function openAlternatives(ex, originalId) {
  selectedForSwap.value = ex
  swapOriginalId.value = originalId
}
</script>
