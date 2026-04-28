import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth'
import {
  doc, getDoc, setDoc, getDocs,
  collection, serverTimestamp,
} from 'firebase/firestore'
import { auth, db, googleProvider } from '@/firebase'

export const useAuthStore = defineStore('auth', () => {
  const firebaseUser = ref(null)
  const userProfile  = ref(null)
  const loading      = ref(true)
  const needsNickname = ref(false)

  const isLoggedIn  = computed(() => !!firebaseUser.value)
  const displayName = computed(() => userProfile.value?.nickname || firebaseUser.value?.displayName || 'Usuário')

  // ── Bootstrap ──────────────────────────────────────────────────────────────
  function init() {
    return new Promise((resolve) => {
      onAuthStateChanged(auth, async (user) => {
        firebaseUser.value = user
        if (user) {
          await loadProfile(user.uid)
        } else {
          userProfile.value = null
        }
        loading.value = false
        resolve()
      })
    })
  }

  async function loadProfile(uid) {
    const snap = await getDoc(doc(db, 'users', uid))
    if (snap.exists()) {
      userProfile.value = snap.data()
      needsNickname.value = false
    } else {
      needsNickname.value = true
    }
  }

  // ── Register ───────────────────────────────────────────────────────────────
  async function register({ email, password, nickname, goal, level }) {
    const nick = nickname.trim().toLowerCase()

    // Check uniqueness
    const nickDoc = await getDoc(doc(db, 'nicknames', nick))
    if (nickDoc.exists()) throw new Error('nickname-taken')

    const cred = await createUserWithEmailAndPassword(auth, email, password)
    await updateProfile(cred.user, { displayName: nickname.trim() })

    const profile = {
      nickname: nickname.trim(),
      nicknameLower: nick,
      email,
      goal,
      level,
      preferredProgramId: null,
      createdAt: serverTimestamp(),
    }

    await Promise.all([
      setDoc(doc(db, 'users', cred.user.uid), profile),
      setDoc(doc(db, 'nicknames', nick), { uid: cred.user.uid }),
    ])

    userProfile.value = profile
    needsNickname.value = false
    return cred.user
  }

  // ── Login ──────────────────────────────────────────────────────────────────
  async function login({ email, password }) {
    const cred = await signInWithEmailAndPassword(auth, email, password)
    await loadProfile(cred.user.uid)
    return cred.user
  }

  // ── Google Sign-In ─────────────────────────────────────────────────────────
  async function loginWithGoogle() {
    const cred = await signInWithPopup(auth, googleProvider)
    await loadProfile(cred.user.uid)
    return cred.user
  }

  // ── Setup nickname (for Google users without profile) ──────────────────────
  async function setupNickname({ nickname, goal, level }) {
    const user = firebaseUser.value
    if (!user) throw new Error('not-authenticated')

    const nick = nickname.trim().toLowerCase()
    const nickDoc = await getDoc(doc(db, 'nicknames', nick))
    if (nickDoc.exists()) throw new Error('nickname-taken')

    const profile = {
      nickname: nickname.trim(),
      nicknameLower: nick,
      email: user.email,
      goal,
      level,
      preferredProgramId: null,
      createdAt: serverTimestamp(),
    }

    await Promise.all([
      setDoc(doc(db, 'users', user.uid), profile),
      setDoc(doc(db, 'nicknames', nick), { uid: user.uid }),
    ])

    userProfile.value = profile
    needsNickname.value = false
  }

  async function updatePreferredProgram(programId) {
    const user = firebaseUser.value
    if (!user) return
    const { updateDoc } = await import('firebase/firestore')
    await updateDoc(doc(db, 'users', user.uid), { preferredProgramId: programId })
    if (userProfile.value) userProfile.value.preferredProgramId = programId
  }

  async function logout() {
    await signOut(auth)
    firebaseUser.value = null
    userProfile.value  = null
  }

  return {
    firebaseUser, userProfile, loading, needsNickname,
    isLoggedIn, displayName,
    init, login, register, loginWithGoogle, setupNickname,
    updatePreferredProgram, logout, loadProfile,
  }
})
