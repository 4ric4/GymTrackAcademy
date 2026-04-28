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
        <div class="flex items-center gap-2">
          <h1 class="gym-title text-2xl">Caixa de entrada</h1>
          <div v-if="unreadCount" class="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
            style="background: var(--accent)">{{ unreadCount }}</div>
        </div>
      </div>

      <!-- Empty -->
      <div v-if="!messages.length" class="flex flex-col items-center py-16 gap-4">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style="background: var(--surface2); border: 1px solid var(--border)">📭</div>
        <p class="text-sm text-center" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          Nenhum treino recebido ainda.<br>Quando alguém compartilhar um treino com você, aparece aqui.
        </p>
      </div>

      <!-- Messages -->
      <div v-else class="flex flex-col gap-4">
        <div v-for="msg in messages" :key="msg.id"
          class="rounded-2xl overflow-hidden transition-all"
          :style="msg.read ? 'background: var(--surface); border: 1px solid var(--border)' : 'background: var(--surface); border: 1.5px solid var(--accent-glow)'">

          <!-- Header -->
          <div class="px-4 pt-4 pb-3 flex items-start gap-3">
            <!-- Sender avatar -->
            <div class="w-10 h-10 rounded-xl flex items-center justify-center font-title font-bold text-base text-white shrink-0"
              style="background: linear-gradient(135deg, var(--accent), #C73000)">
              {{ msg.fromNickname?.[0]?.toUpperCase() || '?' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <span class="font-title font-bold text-sm" style="color: var(--text)">@{{ msg.fromNickname }}</span>
                <span v-if="!msg.read"
                  class="text-[10px] font-bold px-2 py-0.5 rounded-full"
                  style="background: var(--accent-dim); color: var(--accent); border: 1px solid var(--accent-glow); font-family: 'DM Sans', sans-serif">
                  Novo
                </span>
              </div>
              <p class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                compartilhou um treino com você
              </p>
              <p class="text-[10px] mt-0.5" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                {{ formatDate(msg.sentAt) }}
              </p>
            </div>
          </div>

          <!-- Workout card -->
          <div class="mx-4 mb-4 rounded-2xl px-4 py-3 flex items-center gap-3"
            style="background: var(--surface2); border: 1px solid var(--border)">
            <div class="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0"
              :style="`background: ${msg.program?.color || 'var(--accent)'}20; border: 1.5px solid ${msg.program?.color || 'var(--accent)'}40`">
              {{ msg.program?.icon || '💪' }}
            </div>
            <div class="flex-1 min-w-0">
              <div class="font-title font-bold text-sm truncate" style="color: var(--text)">{{ msg.program?.name }}</div>
              <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ msg.program?.focus }} · {{ msg.program?.exercises?.length || 0 }} exercícios
              </div>
            </div>
          </div>

          <!-- Actions (only if not read) -->
          <div v-if="!msg.read" class="px-4 pb-4 flex gap-3">
            <button @click="decline(msg)"
              class="btn-ghost flex-1 py-3 text-sm">
              Recusar
            </button>
            <button @click="accept(msg)"
              class="btn-accent flex-1 py-3 text-sm">
              ✓ Aceitar treino
            </button>
          </div>
          <div v-else class="px-4 pb-4">
            <p class="text-xs text-center" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
              {{ msg.accepted ? '✓ Treino adicionado à sua lista' : 'Recusado' }}
            </p>
          </div>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useWorkoutStore } from '@/stores/workoutStore'
import { updateDoc, doc } from 'firebase/firestore'
import { db } from '@/firebase'

const router = useRouter()
const authStore = useAuthStore()
const workoutStore = useWorkoutStore()

const messages = computed(() => workoutStore.inboxMessages)
const unreadCount = computed(() => workoutStore.unreadInboxCount)

async function accept(msg) {
  const uid = authStore.firebaseUser?.uid
  if (!uid) return
  await workoutStore.acceptWorkout(uid, msg)
  await updateDoc(doc(db, 'users', uid, 'inbox', msg.id), { read: true, accepted: true })
}

async function decline(msg) {
  const uid = authStore.firebaseUser?.uid
  if (!uid) return
  await updateDoc(doc(db, 'users', uid, 'inbox', msg.id), { read: true, accepted: false })
}

function formatDate(ts) {
  if (!ts) return ''
  const d = ts.toDate ? ts.toDate() : new Date(ts)
  return d.toLocaleDateString('pt-BR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>
