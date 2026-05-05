import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  collection, doc, setDoc, deleteDoc,
  onSnapshot, serverTimestamp, query, orderBy,
  getDocs, getDoc, addDoc,
} from 'firebase/firestore'
import { db } from '@/firebase'
import { exercises as allExercises } from '@/data/exercises'
import { programs as allPrograms }   from '@/data/programs'

export const useWorkoutStore = defineStore('workout', () => {
  const sessions         = ref([])
  const exerciseSwaps    = ref({})
  const customPrograms   = ref([])
  const programsLoaded   = ref(false)
  const activeSession    = ref(null)
  const preferredProgramId = ref(null)
  const inboxMessages    = ref([])
  const unsubscribers    = ref([])

  // ── Computed ────────────────────────────────────────────────────────────────

  const totalSessions = computed(() => sessions.value.length)
  const unreadInboxCount = computed(() => inboxMessages.value.filter(m => !m.read).length)

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

  // Próximo programa na rotação baseado na última sessão
  const nextProgramId = computed(() => {
    if (!customPrograms.value.length) return null
    const lastSession = sessions.value[0]
    if (!lastSession) return customPrograms.value[0]?.id
    const lastIdx = customPrograms.value.findIndex(p => p.id === lastSession.programId)
    const nextIdx = (lastIdx + 1) % customPrograms.value.length
    return customPrograms.value[nextIdx]?.id
  })

  // ── Firebase sync ───────────────────────────────────────────────────────────

  function subscribeToUser(uid) {
    unsubAll()

    // Custom programs
    const programsRef = collection(db, 'users', uid, 'programs')
    const u1 = onSnapshot(programsRef, snap => {
      customPrograms.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
      programsLoaded.value = true
    })

    // Sessions
    const sessionsRef = query(
      collection(db, 'users', uid, 'sessions'),
      orderBy('startTime', 'desc')
    )
    const u2 = onSnapshot(sessionsRef, snap => {
      sessions.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })

    // Inbox
    const inboxRef = query(
      collection(db, 'users', uid, 'inbox'),
      orderBy('sentAt', 'desc')
    )
    const u3 = onSnapshot(inboxRef, snap => {
      inboxMessages.value = snap.docs.map(d => ({ id: d.id, ...d.data() }))
    })

    unsubscribers.value = [u1, u2, u3]
  }

  function unsubAll() {
    unsubscribers.value.forEach(u => u())
    unsubscribers.value = []
    programsLoaded.value = false
  }

  function setPreferredProgramId(uid, id) {
    preferredProgramId.value = id
    setDoc(doc(db, 'users', uid), { preferredProgramId: id }, { merge: true })
  }

  function syncPreferredProgram(id) {
    preferredProgramId.value = id
  }

  // ── Getters ──────────────────────────────────────────────────────────────────

  function getProgramExercises(programId) {
    const custom = customPrograms.value.find(p => p.id === programId)
    if (custom) return (custom.exercises || []).map(id => allExercises[id]).filter(Boolean)

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

  // ── Session actions ──────────────────────────────────────────────────────────

  function startSession(programId) {
    activeSession.value = {
      id: Date.now().toString(),
      programId,
      startTime: new Date().toISOString(),
      completedExercises: [],
      setLogs: {},
    }
  }

  function logSets(exerciseId, sets) {
    if (!activeSession.value) return
    activeSession.value.setLogs[exerciseId] = sets
  }

  function getExerciseLogs(exerciseId) {
    return sessions.value
      .filter(s => s.setLogs?.[exerciseId]?.length)
      .slice(0, 5)
      .map(s => ({ date: s.startTime, sets: s.setLogs[exerciseId] }))
  }

  async function endSession(uid) {
    if (!activeSession.value) return
    const end = new Date()
    const start = new Date(activeSession.value.startTime)
    const duration = Math.round((end - start) / 60000)
    const session = {
      ...activeSession.value,
      endTime: end.toISOString(),
      duration,
    }

    if (uid) {
      await setDoc(
        doc(db, 'users', uid, 'sessions', session.id),
        { ...session, startTime: start, endTime: end, setLogs: session.setLogs || {} }
      )
    } else {
      sessions.value.unshift(session)
    }

    activeSession.value = null
    return session
  }

  function cancelSession() { activeSession.value = null }

  function toggleExercise(exerciseId) {
    if (!activeSession.value) return
    const idx = activeSession.value.completedExercises.indexOf(exerciseId)
    if (idx === -1) activeSession.value.completedExercises.push(exerciseId)
    else activeSession.value.completedExercises.splice(idx, 1)
  }

  function swapExercise(programId, originalId, newId) {
    if (!exerciseSwaps.value[programId]) exerciseSwaps.value[programId] = {}
    exerciseSwaps.value[programId][originalId] = newId
  }

  function resetSwap(programId, originalId) {
    if (exerciseSwaps.value[programId]) {
      delete exerciseSwaps.value[programId][originalId]
    }
  }

  async function deleteSession(uid, id) {
    sessions.value = sessions.value.filter(s => s.id !== id)
    if (uid) await deleteDoc(doc(db, 'users', uid, 'sessions', id))
  }

  // ── Custom programs ──────────────────────────────────────────────────────────

  async function saveCustomProgram(uid, program) {
    const id = program.id || `custom_${Date.now()}`
    const data = { ...program, id }
    if (uid) {
      await setDoc(doc(db, 'users', uid, 'programs', id), data)
    } else {
      const idx = customPrograms.value.findIndex(p => p.id === id)
      if (idx >= 0) customPrograms.value[idx] = data
      else customPrograms.value.push(data)
    }
    return id
  }

  async function deleteCustomProgram(uid, id) {
    customPrograms.value = customPrograms.value.filter(p => p.id !== id)
    if (uid) await deleteDoc(doc(db, 'users', uid, 'programs', id))
  }

  function isCustomProgram(id) {
    return customPrograms.value.some(p => p.id === id)
  }

  // ── Sharing ──────────────────────────────────────────────────────────────────

  async function shareWorkout(senderNickname, recipientNickname, program) {
    // Look up recipient UID
    const nickDoc = await getDoc(doc(db, 'nicknames', recipientNickname.trim().toLowerCase()))
    if (!nickDoc.exists()) throw new Error('user-not-found')

    const recipientUid = nickDoc.data().uid
    await addDoc(collection(db, 'users', recipientUid, 'inbox'), {
      fromNickname: senderNickname,
      program: {
        name: program.name,
        icon: program.icon,
        color: program.color,
        focus: program.focus,
        exercises: program.exercises,
        description: program.description || '',
      },
      sentAt: serverTimestamp(),
      read: false,
    })
  }

  function subscribeToInbox(uid, callback) {
    const inboxRef = query(
      collection(db, 'users', uid, 'inbox'),
      orderBy('sentAt', 'desc')
    )
    return onSnapshot(inboxRef, snap => {
      callback(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
  }

  async function acceptWorkout(uid, message) {
    const id = `shared_${Date.now()}`
    const program = {
      ...message.program,
      id,
      isCustom: true,
      sharedFrom: message.fromNickname,
    }
    await setDoc(doc(db, 'users', uid, 'programs', id), program)
    await markInboxRead(uid, message.id)
    return id
  }

  async function declineWorkout(uid, messageId) {
    await markInboxRead(uid, messageId)
  }

  async function markInboxRead(uid, messageId) {
    const { updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'users', uid, 'inbox', messageId), { read: true })
  }

  function setPreferredProgram(id) {
    preferredProgramId.value = id
  }

  return {
    sessions, activeSession, exerciseSwaps, customPrograms, programsLoaded, preferredProgramId,
    inboxMessages, unreadInboxCount,
    totalSessions, currentWeekSessions, totalMinutes, streak, sessionsByDate, nextProgramId,
    getProgramExercises, getAlternatives, getExerciseLogs,
    startSession, endSession, cancelSession, toggleExercise, logSets,
    swapExercise, resetSwap, deleteSession,
    saveCustomProgram, deleteCustomProgram, isCustomProgram,
    subscribeToUser, unsubAll, setPreferredProgramId, setPreferredProgram, syncPreferredProgram,
    shareWorkout, subscribeToInbox, acceptWorkout, declineWorkout, markInboxRead,
  }
})
