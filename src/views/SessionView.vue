<template>
  <div class="max-w-md mx-auto" style="min-height: 100vh">

    <!-- ── Sem sessão ─────────────────────────────────────────── -->
    <div v-if="!store.activeSession" class="px-5 pt-6 pb-4 flex flex-col gap-5">
      <h1 class="gym-title text-3xl">Sessão</h1>

      <div v-if="!store.customPrograms.length" class="flex flex-col items-center py-12 gap-4">
        <div class="text-5xl">🤖</div>
        <p class="text-sm text-center" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          Crie um treino com a IA primeiro
        </p>
        <RouterLink to="/ia" class="btn-accent" style="display: inline-flex; width: auto; padding: 12px 28px">
          Montar com IA
        </RouterLink>
      </div>

      <template v-else>
        <!-- Próximo recomendado -->
        <div v-if="nextProgram" class="rounded-2xl overflow-hidden"
          style="background: var(--accent-dim); border: 1.5px solid var(--accent-glow)">
          <div class="p-4">
            <p class="text-[11px] uppercase tracking-widest mb-3 font-bold"
              style="color: var(--accent); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
              ▶ Próximo na rotação
            </p>
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                :style="`background: ${nextProgram.color}25; border: 1.5px solid ${nextProgram.color}50`">
                {{ nextProgram.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="font-title font-bold text-lg" style="color: var(--text)">{{ nextProgram.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                  {{ nextProgram.focus }} · {{ nextProgram.exercises.length }} exercícios
                </div>
              </div>
            </div>
          </div>
          <button @click="start(nextProgram.id)"
            class="w-full py-3.5 font-title font-bold text-sm text-white transition-all active:opacity-80"
            style="background: var(--accent)">
            ▶ Iniciar agora
          </button>
        </div>

        <!-- Outros treinos -->
        <div v-if="otherPrograms.length">
          <p class="text-xs font-bold uppercase tracking-widest mb-3"
            style="color: var(--text3); font-family: 'DM Sans', sans-serif; letter-spacing: 1.5px">
            Outros treinos
          </p>
          <div class="grid grid-cols-2 gap-3">
            <button v-for="p in otherPrograms" :key="p.id" @click="start(p.id)"
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
      </template>
    </div>

    <!-- ── Descanso ────────────────────────────────────────────── -->
    <div v-else-if="restMode" class="flex flex-col items-center px-6 pt-4 pb-8" style="min-height: 100vh">
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

    <!-- ── Sessão ativa ────────────────────────────────────────── -->
    <div v-else class="flex flex-col pb-6" style="min-height: 100vh">
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

      <!-- Barra de progresso -->
      <div class="px-5 mb-1">
        <div class="flex gap-1.5">
          <div v-for="ex in sessionExercises" :key="ex.id"
            class="flex-1 rounded-full transition-all"
            style="height: 3px"
            :style="isCompleted(ex.id) ? 'background: var(--accent)' : 'background: var(--surface3)'">
          </div>
        </div>
        <div class="text-xs mt-1.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          {{ completedCount }}/{{ totalCount }} exercícios
        </div>
      </div>

      <!-- Lista de exercícios -->
      <div class="px-5 flex flex-col gap-3 flex-1">
        <div v-for="(ex, i) in sessionExercises" :key="ex.id"
          class="rounded-2xl overflow-hidden transition-all"
          :style="isCompleted(ex.id)
            ? 'background: var(--accent-dim); border: 1.5px solid var(--accent-glow)'
            : 'background: var(--surface); border: 1px solid var(--border)'">
          <div class="flex items-center gap-3 px-4 py-3">
            <!-- Checkbox -->
            <button @click="openLogSheet(ex)"
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
              <div class="font-semibold text-sm"
                :style="isCompleted(ex.id) ? 'color: var(--accent); font-family: DM Sans, sans-serif' : 'color: var(--text); font-family: DM Sans, sans-serif'">
                {{ ex.name }}
              </div>
              <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ ex.sets }} séries · {{ ex.reps }} reps
              </div>
              <!-- Última performance -->
              <div v-if="lastPerf(ex.id)" class="text-[11px] mt-1 font-semibold" style="color: var(--accent); font-family: 'DM Sans', sans-serif">
                Última: {{ lastPerf(ex.id) }}
              </div>
            </div>
            <!-- Video -->
            <button v-if="ex.videoId" @click="openVideo(ex)"
              class="w-9 h-9 rounded-xl overflow-hidden shrink-0" style="border: 1px solid var(--border)">
              <img :src="`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`"
                class="w-full h-full object-cover" loading="lazy" />
            </button>
          </div>
          <!-- Séries registradas nessa sessão -->
          <div v-if="currentSets(ex.id).length"
            class="flex gap-1.5 flex-wrap px-4 pb-3 pt-0">
            <span v-for="(s, si) in currentSets(ex.id)" :key="si"
              class="text-[11px] px-2.5 py-1 rounded-full font-semibold"
              style="background: var(--surface2); color: var(--accent); border: 1px solid var(--accent-glow); font-family: 'DM Sans', sans-serif">
              {{ s.weight ? s.weight + 'kg × ' : '' }}{{ s.reps }} reps
            </span>
          </div>
        </div>
      </div>

      <!-- Ações -->
      <div class="px-5 mt-5 flex gap-3">
        <button @click="finish" class="btn-accent flex-1 py-4 text-base">✓ Finalizar Treino</button>
        <button @click="cancel"
          class="w-14 rounded-2xl flex items-center justify-center text-xl transition-all"
          style="background: var(--surface); border: 1px solid rgba(239,68,68,0.3); color: #ef4444">
          ✕
        </button>
      </div>

      <!-- Modal confirmar fim -->
      <Transition name="fade">
        <div v-if="showFinishConfirm"
          class="fixed inset-0 z-50 flex items-center justify-center px-6"
          style="background: rgba(0,0,0,0.75); backdrop-filter: blur(8px)">
          <div class="w-full max-w-sm rounded-3xl p-7 text-center" style="background: var(--surface)">
            <div class="text-5xl mb-3">🏆</div>
            <h3 class="font-title font-bold text-2xl mb-1" style="color: var(--text)">Treino finalizado!</h3>
            <p class="text-sm mb-1" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Duração: <span class="font-bold" style="color: var(--text)">{{ elapsed }}</span>
            </p>
            <p class="text-sm mb-6" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ completedCount }} exercícios realizados
            </p>
            <button @click="confirmFinish" class="btn-accent py-4 text-base mb-3">Salvar sessão 💾</button>
            <button @click="showFinishConfirm = false"
              class="w-full py-2 text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              Continuar treinando
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- ── Log de séries (bottom sheet) ─────────────────────── -->
    <Transition name="slide-up">
      <div v-if="logSheet.show"
        class="fixed inset-0 z-50 flex items-end"
        style="background: rgba(0,0,0,0.7); backdrop-filter: blur(8px)"
        @click.self="skipLog">
        <div class="w-full max-w-md mx-auto rounded-t-3xl p-6" style="background: var(--surface); border-top: 1px solid var(--border)">

          <!-- Cabeçalho -->
          <div class="flex items-start gap-3 mb-4">
            <div class="flex-1">
              <h3 class="font-title font-bold text-lg" style="color: var(--text)">{{ logSheet.exercise?.name }}</h3>
              <p class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ logSheet.exercise?.sets }} séries recomendadas · {{ logSheet.exercise?.reps }} reps
              </p>
            </div>
          </div>

          <!-- Última performance -->
          <div v-if="logSheet.lastSets?.length" class="mb-4 p-3 rounded-2xl" style="background: var(--surface2); border: 1px solid var(--border)">
            <p class="text-[10px] uppercase font-bold tracking-widest mb-2" style="color: var(--text3); font-family: 'DM Sans', sans-serif">Última vez</p>
            <div class="flex gap-2 flex-wrap">
              <span v-for="(s, i) in logSheet.lastSets" :key="i"
                class="text-xs px-2.5 py-1 rounded-full"
                style="background: var(--surface3); color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ s.weight ? s.weight + 'kg × ' : '' }}{{ s.reps }} reps
              </span>
            </div>
          </div>

          <!-- Séries atuais -->
          <div class="flex flex-col gap-2 mb-3 max-h-44 overflow-y-auto">
            <div v-for="(s, i) in logSheet.sets" :key="i" class="flex items-center gap-2">
              <span class="text-xs font-bold w-7 text-center shrink-0" style="color: var(--text3); font-family: 'DM Sans', sans-serif">S{{ i + 1 }}</span>
              <input v-model.number="s.weight" type="number" inputmode="decimal" placeholder="Peso (kg)"
                class="flex-1 rounded-xl px-3 py-2.5 text-sm outline-none"
                style="background: var(--surface2); color: var(--text); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif"
                @focus="$event.target.style.borderColor = 'var(--accent)'"
                @blur="$event.target.style.borderColor = 'var(--border)'" />
              <input v-model.number="s.reps" type="number" inputmode="numeric" placeholder="Reps"
                class="w-20 rounded-xl px-3 py-2.5 text-sm outline-none text-center"
                style="background: var(--surface2); color: var(--text); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif"
                @focus="$event.target.style.borderColor = 'var(--accent)'"
                @blur="$event.target.style.borderColor = 'var(--border)'" />
              <button @click="logSheet.sets.splice(i, 1)" style="color: #ef4444; font-size: 16px; padding: 4px">✕</button>
            </div>
          </div>

          <button @click="addSet"
            class="w-full py-2.5 rounded-xl text-sm font-semibold mb-4"
            style="background: var(--surface2); color: var(--text2); border: 1.5px dashed var(--border); font-family: 'DM Sans', sans-serif">
            + Adicionar série
          </button>

          <div class="flex gap-3">
            <button @click="skipLog" class="btn-ghost flex-1">Pular</button>
            <button @click="confirmLog" class="btn-accent flex-1">Concluir ✓</button>
          </div>
        </div>
      </div>
    </Transition>

    <VideoModal :show="!!selectedVideo" :exercise="selectedVideo" @close="selectedVideo = null" />
  </div>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted, reactive } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'
import VideoModal from '@/components/VideoModal.vue'

const store = useWorkoutStore()
const authStore = useAuthStore()
const router = useRouter()

const now = ref(Date.now())
const showFinishConfirm = ref(false)
const selectedVideo = ref(null)

// Rest timer
const restMode = ref(false)
const restTotal = ref(90)
const restRemaining = ref(90)
let restInterval = null

// Log sheet
const logSheet = reactive({ show: false, exercise: null, sets: [], lastSets: [] })

let globalTimer
onMounted(() => { globalTimer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => {
  clearInterval(globalTimer)
  if (restInterval) clearInterval(restInterval)
})

const nextProgram = computed(() =>
  store.customPrograms.find(p => p.id === store.nextProgramId)
)
const otherPrograms = computed(() =>
  store.customPrograms.filter(p => p.id !== store.nextProgramId)
)

const program = computed(() =>
  store.customPrograms.find(p => p.id === store.activeSession?.programId)
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

function currentSets(exerciseId) {
  return store.activeSession?.setLogs?.[exerciseId] || []
}

function lastPerf(exerciseId) {
  const logs = store.getExerciseLogs(exerciseId)
  if (!logs.length) return null
  const sets = logs[0].sets
  if (!sets?.length) return null
  const sample = sets[0]
  const extra = sets.length > 1 ? ` (+${sets.length - 1})` : ''
  return sample.weight ? `${sample.weight}kg × ${sample.reps}${extra}` : `${sample.reps} reps${extra}`
}

// Log sheet
function openLogSheet(ex) {
  const logs = store.getExerciseLogs(ex.id)
  const lastSets = logs[0]?.sets || []
  const initialSets = lastSets.length
    ? lastSets.map(s => ({ weight: s.weight || null, reps: s.reps || null }))
    : Array.from({ length: ex.sets || 3 }, () => ({ weight: null, reps: null }))
  Object.assign(logSheet, { show: true, exercise: ex, sets: initialSets, lastSets })
}

function addSet() {
  logSheet.sets.push({ weight: null, reps: null })
}

function skipLog() {
  logSheet.show = false
  store.toggleExercise(logSheet.exercise.id)
  if (!isCompleted(logSheet.exercise.id)) return
  startRest()
}

function confirmLog() {
  logSheet.show = false
  const validSets = logSheet.sets.filter(s => s.reps)
  if (validSets.length) store.logSets(logSheet.exercise.id, validSets)
  if (!isCompleted(logSheet.exercise.id)) store.toggleExercise(logSheet.exercise.id)
  startRest()
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

async function confirmFinish() {
  await store.endSession(authStore.firebaseUser?.uid)
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
</script>
