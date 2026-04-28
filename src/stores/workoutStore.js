import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { exercises as allExercises } from '@/data/exercises'
import { programs as allPrograms } from '@/data/programs'

const STORAGE_KEY = 'academia_tracker_v1'

function loadState() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')
  } catch { return {} }
}

function saveState(sessions, swaps, customPrograms, preferredProgramId) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ sessions, swaps, customPrograms, preferredProgramId }))
}

export const useWorkoutStore = defineStore('workout', () => {
  const stored = loadState()

  const sessions = ref(stored.sessions || [])
  const exerciseSwaps = ref(stored.swaps || {})
  const customPrograms = ref(stored.customPrograms || [])
  const activeSession = ref(null)
  const preferredProgramId = ref(stored.preferredProgramId || allPrograms[0]?.id || null)

  function persist() {
    saveState(sessions.value, exerciseSwaps.value, customPrograms.value, preferredProgramId.value)
  }

  function setPreferredProgram(id) {
    preferredProgramId.value = id
    persist()
  }

  // ── Computed ──────────────────────────────────────────────────────────────

  const totalSessions = computed(() => sessions.value.length)

  const currentWeekSessions = computed(() => {
    const now = new Date()
    const weekStart = new Date(now)
    weekStart.setDate(now.getDate() - now.getDay())
    weekStart.setHours(0, 0, 0, 0)
    return sessions.value.filter(s => new Date(s.startTime) >= weekStart)
  })

  const totalMinutes = computed(() =>
    sessions.value.reduce((acc, s) => acc + (s.duration || 0), 0)
  )

  const streak = computed(() => {
    if (!sessions.value.length) return 0
    const sortedDays = [...new Set(
      sessions.value.map(s => new Date(s.startTime).toDateString())
    )].sort((a, b) => new Date(b) - new Date(a))

    let count = 0
    let checkDate = new Date()
    checkDate.setHours(0, 0, 0, 0)

    for (const day of sortedDays) {
      const d = new Date(day)
      d.setHours(0, 0, 0, 0)
      const diff = (checkDate - d) / 86400000
      if (diff <= 1) { count++; checkDate = d }
      else break
    }
    return count
  })

  const sessionsByDate = computed(() => {
    const map = {}
    sessions.value.forEach(s => {
      const date = new Date(s.startTime).toDateString()
      if (!map[date]) map[date] = []
      map[date].push(s)
    })
    return map
  })

  // ── Getters for exercises in a program (respects swaps) ───────────────────

  function getProgramExercises(programId) {
    const custom = customPrograms.value.find(p => p.id === programId)
    if (custom) return custom.exercises.map(id => allExercises[id]).filter(Boolean)

    const program = allPrograms.find(p => p.id === programId)
    if (!program) return []
    const swaps = exerciseSwaps.value[programId] || {}
    return program.exercises.map(id => {
      const swappedId = swaps[id] || id
      return allExercises[swappedId] || allExercises[id]
    })
  }

  function getAlternatives(exerciseId) {
    const ex = allExercises[exerciseId]
    if (!ex) return []
    return (ex.alternatives || []).map(id => allExercises[id]).filter(Boolean)
  }

  // ── Actions ───────────────────────────────────────────────────────────────

  function startSession(programId) {
    activeSession.value = {
      id: Date.now().toString(),
      programId,
      startTime: new Date().toISOString(),
      completedExercises: [],
    }
  }

  function endSession() {
    if (!activeSession.value) return
    const end = new Date()
    const start = new Date(activeSession.value.startTime)
    const duration = Math.round((end - start) / 60000)
    const session = {
      ...activeSession.value,
      endTime: end.toISOString(),
      duration,
    }
    sessions.value.unshift(session)
    persist()
    activeSession.value = null
    return session
  }

  function cancelSession() {
    activeSession.value = null
  }

  function toggleExercise(exerciseId) {
    if (!activeSession.value) return
    const idx = activeSession.value.completedExercises.indexOf(exerciseId)
    if (idx === -1) activeSession.value.completedExercises.push(exerciseId)
    else activeSession.value.completedExercises.splice(idx, 1)
  }

  function swapExercise(programId, originalId, newId) {
    if (!exerciseSwaps.value[programId]) exerciseSwaps.value[programId] = {}
    exerciseSwaps.value[programId][originalId] = newId
    persist()
  }

  function resetSwap(programId, originalId) {
    if (exerciseSwaps.value[programId]) {
      delete exerciseSwaps.value[programId][originalId]
      persist()
    }
  }

  function deleteSession(id) {
    sessions.value = sessions.value.filter(s => s.id !== id)
    persist()
  }

  // ── Custom programs ───────────────────────────────────────────────────────

  function saveCustomProgram(program) {
    const idx = customPrograms.value.findIndex(p => p.id === program.id)
    if (idx >= 0) customPrograms.value[idx] = program
    else customPrograms.value.push(program)
    persist()
  }

  function deleteCustomProgram(id) {
    customPrograms.value = customPrograms.value.filter(p => p.id !== id)
    persist()
  }

  function isCustomProgram(id) {
    return customPrograms.value.some(p => p.id === id)
  }

  return {
    // state
    sessions, activeSession, exerciseSwaps, customPrograms, preferredProgramId,
    // computed
    totalSessions, currentWeekSessions, totalMinutes, streak, sessionsByDate,
    // getters
    getProgramExercises, getAlternatives,
    // actions
    startSession, endSession, cancelSession, toggleExercise,
    swapExercise, resetSwap, deleteSession,
    saveCustomProgram, deleteCustomProgram, isCustomProgram,
    setPreferredProgram,
  }
})
