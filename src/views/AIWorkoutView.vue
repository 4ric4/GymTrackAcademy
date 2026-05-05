<template>
  <div class="screen-scroll">
    <div class="max-w-md mx-auto flex flex-col h-screen">

      <!-- Header -->
      <div class="sticky top-0 z-10 px-5 pt-4 pb-3 flex items-center gap-3"
        style="background: rgba(12,12,20,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border)">
        <button @click="router.back()" style="color: var(--text2)">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <div class="flex items-center gap-2.5 flex-1">
          <div class="w-9 h-9 rounded-2xl flex items-center justify-center text-xl"
            style="background: linear-gradient(135deg, var(--accent), #C73000)">🤖</div>
          <div>
            <div class="font-title font-bold text-sm" style="color: var(--text)">GYMAI</div>
            <div class="text-[10px]" style="color: var(--text3); font-family: 'DM Sans', sans-serif">Personal trainer virtual</div>
          </div>
        </div>
        <button @click="clearChat"
          class="text-[11px] px-3 py-1.5 rounded-full font-semibold"
          style="background: var(--surface2); color: var(--text2); font-family: 'DM Sans', sans-serif">
          Limpar
        </button>
      </div>

      <!-- Messages area -->
      <div ref="messagesEl" class="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-4"
        style="padding-bottom: 140px">

        <!-- Welcome message -->
        <div v-if="messages.length === 0" class="flex flex-col gap-4">
          <div class="flex gap-3">
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-base shrink-0"
              style="background: linear-gradient(135deg, var(--accent), #C73000)">🤖</div>
            <div class="rounded-2xl rounded-tl-sm px-4 py-3 max-w-[85%]"
              style="background: var(--surface); border: 1px solid var(--border)">
              <p class="text-sm leading-relaxed" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                Oi! Sou o <strong>GYMAI</strong>, seu personal trainer virtual. 💪<br><br>
                Me conta o que você quer e eu monto o treino na hora. Por exemplo:
              </p>
            </div>
          </div>
          <div class="flex flex-col gap-2 ml-11">
            <button v-for="s in suggestions" :key="s" @click="sendSuggestion(s)"
              class="text-left px-4 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-95"
              style="background: var(--surface2); color: var(--accent); border: 1px solid var(--accent-glow); font-family: 'DM Sans', sans-serif">
              {{ s }}
            </button>
          </div>
        </div>

        <!-- Chat messages -->
        <div v-for="(msg, i) in messages" :key="i" class="flex flex-col gap-3">

          <!-- User message -->
          <div v-if="msg.role === 'user'" class="flex justify-end">
            <div class="rounded-2xl rounded-tr-sm px-4 py-3 max-w-[85%]"
              style="background: var(--accent); ">
              <p class="text-sm" style="color: #fff; font-family: 'DM Sans', sans-serif">{{ msg.content }}</p>
            </div>
          </div>

          <!-- AI message -->
          <div v-else class="flex gap-3">
            <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-base shrink-0"
              style="background: linear-gradient(135deg, var(--accent), #C73000)">🤖</div>
            <div class="flex-1 flex flex-col gap-3">
              <div class="rounded-2xl rounded-tl-sm px-4 py-3"
                style="background: var(--surface); border: 1px solid var(--border)">
                <p class="text-sm leading-relaxed whitespace-pre-wrap" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                  {{ msg.content }}
                </p>
              </div>

              <!-- Generated programs -->
              <div v-if="msg.programs && msg.programs.length" class="flex flex-col gap-2">
                <div v-for="(prog, pi) in msg.programs" :key="pi"
                  class="rounded-2xl p-4"
                  :style="`background: ${prog.color}15; border: 1px solid ${prog.color}40`">
                  <div class="flex items-center gap-3 mb-3">
                    <div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl"
                      :style="`background: ${prog.color}25`">{{ prog.icon }}</div>
                    <div>
                      <div class="font-title font-bold text-sm" style="color: var(--text)">{{ prog.name }}</div>
                      <div class="text-xs" :style="`color: ${prog.color}; font-family: 'DM Sans', sans-serif`">{{ prog.focus }}</div>
                    </div>
                    <div class="ml-auto text-xs font-semibold px-2 py-1 rounded-full"
                      :style="`background: ${prog.color}20; color: ${prog.color}; font-family: 'DM Sans', sans-serif`">
                      {{ prog.exercises.length }} exerc.
                    </div>
                  </div>
                  <div class="flex flex-wrap gap-1.5">
                    <span v-for="exId in prog.exercises" :key="exId"
                      class="text-[11px] px-2.5 py-1 rounded-full"
                      style="background: var(--surface2); color: var(--text2); font-family: 'DM Sans', sans-serif">
                      {{ exerciseName(exId) }}
                    </span>
                  </div>
                </div>

                <!-- Save button -->
                <button v-if="!msg.saved" @click="savePrograms(msg)"
                  class="btn-accent flex items-center justify-center gap-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Salvar treinos no app
                </button>
                <div v-else class="flex items-center justify-center gap-2 py-2 text-sm font-semibold"
                  style="color: #22c55e; font-family: 'DM Sans', sans-serif">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                  Treinos salvos com sucesso!
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Loading -->
        <div v-if="loading" class="flex gap-3">
          <div class="w-8 h-8 rounded-2xl flex items-center justify-center text-base shrink-0"
            style="background: linear-gradient(135deg, var(--accent), #C73000)">🤖</div>
          <div class="rounded-2xl rounded-tl-sm px-4 py-3"
            style="background: var(--surface); border: 1px solid var(--border)">
            <div class="flex gap-1 items-center h-5">
              <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--accent); animation-delay: 0ms"></span>
              <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--accent); animation-delay: 150ms"></span>
              <span class="w-2 h-2 rounded-full animate-bounce" style="background: var(--accent); animation-delay: 300ms"></span>
            </div>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" class="flex justify-center">
          <p class="text-xs px-4 py-2 rounded-full" style="background: #ef444420; color: #ef4444; font-family: 'DM Sans', sans-serif">
            {{ error }}
          </p>
        </div>
      </div>

      <!-- Input area -->
      <div class="fixed bottom-0 inset-x-0 max-w-md mx-auto px-4 py-3"
        style="background: rgba(12,12,20,0.95); backdrop-filter: blur(16px); border-top: 1px solid var(--border)">
        <div class="flex gap-2 items-end">
          <textarea
            ref="inputEl"
            v-model="input"
            @keydown.enter.exact.prevent="send"
            rows="1"
            placeholder="Ex: treino 4x semana pra hipertrofia..."
            class="flex-1 rounded-2xl px-4 py-3 text-sm resize-none outline-none transition-all"
            style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'DM Sans', sans-serif; max-height: 120px; overflow-y: auto"
            @input="autoResize"
            @focus="$event.target.style.borderColor = 'var(--accent)'"
            @blur="$event.target.style.borderColor = 'var(--border)'"
          ></textarea>
          <button @click="send" :disabled="loading || !input.trim()"
            class="w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 transition-all active:scale-95 disabled:opacity-40"
            style="background: var(--accent)">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M5 12h14M13 6l6 6-6 6" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { ref, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'
import { exercises } from '@/data/exercises'

const router = useRouter()
const store = useWorkoutStore()
const authStore = useAuthStore()

const messages = ref([])
const input = ref('')
const loading = ref(false)
const error = ref('')
const messagesEl = ref(null)
const inputEl = ref(null)

const suggestions = [
  '🔥 Treino 4x semana pra hipertrofia',
  '💪 Fullbody 3x semana iniciante',
  '🏋️ Treino de força 5x semana',
  '🍑 Foco em pernas e glúteos 3x semana',
]

function exerciseName(id) {
  return exercises[id]?.name || id
}

function autoResize(e) {
  e.target.style.height = 'auto'
  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
}

function scrollToBottom() {
  nextTick(() => {
    if (messagesEl.value) {
      messagesEl.value.scrollTop = messagesEl.value.scrollHeight
    }
  })
}

function clearChat() {
  messages.value = []
  input.value = ''
  error.value = ''
}

function sendSuggestion(text) {
  input.value = text
  send()
}

async function send() {
  const text = input.value.trim()
  if (!text || loading.value) return

  error.value = ''
  messages.value.push({ role: 'user', content: text })
  input.value = ''
  if (inputEl.value) {
    inputEl.value.style.height = 'auto'
  }
  loading.value = true
  scrollToBottom()

  const history = messages.value
    .filter(m => m.role === 'user' || m.role === 'assistant')
    .slice(-8)
    .map(m => ({ role: m.role, content: m.content }))

  try {
    const res = await fetch('/api/ai-treino', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: text, history: history.slice(0, -1) }),
    })

    const data = await res.json()

    if (!res.ok) throw new Error(data.error || 'Erro desconhecido')

    messages.value.push({
      role: 'assistant',
      content: data.message || 'Não entendi, tente de novo.',
      programs: data.programs || null,
      saved: false,
    })
  } catch (err) {
    error.value = 'Erro ao conectar com a IA. Tente novamente.'
    messages.value.pop()
  } finally {
    loading.value = false
    scrollToBottom()
  }
}

async function savePrograms(msg) {
  const uid = authStore.firebaseUser?.uid
  if (!uid) return

  // Apaga todos os treinos anteriores
  const existing = [...store.customPrograms]
  for (const old of existing) {
    await store.deleteCustomProgram(uid, old.id)
  }

  const COLORS = ['#8B5CF6','#3B82F6','#10B981','#F59E0B','#EF4444','#EC4899','#06B6D4']
  let firstId = null

  for (const prog of msg.programs) {
    const program = {
      name: prog.name,
      focus: prog.focus,
      icon: prog.icon,
      color: prog.color || COLORS[Math.floor(Math.random() * COLORS.length)],
      description: `Treino gerado pela IA - ${prog.focus}`,
      exercises: prog.exercises,
    }
    const id = await store.saveCustomProgram(uid, program)
    if (!firstId) firstId = id
  }

  // Define o primeiro treino gerado como preferido
  if (firstId) store.setPreferredProgramId(uid, firstId)

  msg.saved = true
}
</script>
