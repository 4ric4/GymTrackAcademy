<template>
  <div class="max-w-md mx-auto pb-8">
    <div v-if="program">
      <!-- Hero thumbnail -->
      <div class="relative" style="height: 200px; background: var(--surface2)">
        <div class="absolute inset-0 flex items-center justify-center">
          <div class="flex flex-col items-center gap-3">
            <div class="text-7xl">{{ program.icon }}</div>
            <div class="font-title font-bold text-lg" style="color: var(--text2)">{{ program.focus }}</div>
          </div>
        </div>
        <!-- Gradient overlay bottom -->
        <div class="absolute bottom-0 inset-x-0 h-24"
          style="background: linear-gradient(to top, var(--bg), transparent)"></div>
        <!-- Back button -->
        <button @click="router.back()"
          class="absolute top-4 left-4 flex items-center gap-1.5 rounded-2xl px-3 py-2 text-sm font-semibold"
          style="background: rgba(13,13,32,0.7); backdrop-filter: blur(8px); color: var(--text2); font-family: 'DM Sans', sans-serif; border: 1px solid var(--border)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Voltar
        </button>
        <!-- Edit/Delete for custom -->
        <div v-if="isCustom" class="absolute top-4 right-4 flex gap-2">
          <RouterLink :to="`/editar-treino/${program.id}`"
            class="flex items-center gap-1 rounded-2xl px-3 py-2 text-xs font-semibold"
            style="background: rgba(13,13,32,0.7); backdrop-filter: blur(8px); color: var(--text2); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif">
            ✏️ Editar
          </RouterLink>
          <button @click="confirmDelete"
            class="rounded-2xl px-3 py-2 text-xs font-semibold"
            style="background: rgba(13,13,32,0.7); backdrop-filter: blur(8px); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
            🗑️
          </button>
        </div>
      </div>

      <!-- Content -->
      <div class="px-5 pt-2 flex flex-col gap-5">
        <!-- Title + stats -->
        <div class="flex justify-between items-start">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h1 class="font-title font-bold text-2xl leading-tight" style="color: var(--text)">{{ program.name }}</h1>
              <span v-if="isCustom"
                class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                style="background: rgba(245,158,11,0.12); color: var(--warn); border: 1px solid rgba(245,158,11,0.2); font-family: 'DM Sans', sans-serif">
                Meu Treino
              </span>
            </div>
            <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
              {{ exercises.length }} exercícios · {{ program.focus }}
            </p>
          </div>
        </div>

        <!-- Stat chips -->
        <div class="flex gap-3">
          <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
            <div class="font-title font-bold text-base" style="color: var(--text)">{{ exercises.length }}</div>
            <div class="text-[11px]" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Exercícios</div>
          </div>
          <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--accent-dim); border: 1px solid var(--accent-glow)">
            <div class="font-title font-bold text-base" style="color: var(--accent)">~{{ Math.round(exercises.length * 6) }}m</div>
            <div class="text-[11px]" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Duração</div>
          </div>
          <div class="flex-1 rounded-2xl p-3 text-center" style="background: var(--surface); border: 1px solid var(--border)">
            <div class="font-title font-bold text-base" style="color: var(--text)">{{ isCustom ? 'Custom' : 'Avançado' }}</div>
            <div class="text-[11px]" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Nível</div>
          </div>
        </div>

        <div style="height: 1px; background: var(--border)"></div>

        <!-- Description -->
        <p v-if="program.description" class="text-sm leading-relaxed"
          style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          {{ program.description }}
        </p>

        <div style="height: 1px; background: var(--border)"></div>

        <!-- Exercise list -->
        <div>
          <div class="flex justify-between items-center mb-4">
            <p class="font-title font-bold text-sm" style="color: var(--text)">Exercícios</p>
          </div>
          <div class="flex flex-col gap-3">
            <div v-for="(ex, i) in exercises" :key="ex.id"
              class="flex items-center gap-3 rounded-2xl px-4 py-3 transition-all"
              style="background: var(--surface); border: 1px solid var(--border)">
              <!-- Number -->
              <div class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 font-title font-bold text-sm"
                style="background: var(--surface3); border: 1px solid var(--border); color: var(--text2)">
                {{ i + 1 }}
              </div>
              <!-- Info -->
              <div class="flex-1 min-w-0">
                <div class="font-semibold text-sm" style="color: var(--text); font-family: 'DM Sans', sans-serif">{{ ex.name }}</div>
                <div class="text-xs mt-0.5" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                  {{ ex.sets }} séries · {{ ex.reps }} reps
                </div>
              </div>
              <!-- Thumb / actions -->
              <div class="flex items-center gap-2">
                <button v-if="ex.videoId" @click="openVideo(ex)"
                  class="w-9 h-9 rounded-xl overflow-hidden shrink-0" style="border: 1px solid var(--border)">
                  <img :src="`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`"
                    class="w-full h-full object-cover" loading="lazy" />
                </button>
                <button v-if="!isCustom" @click="openAlternatives(ex, builtinProgram?.exercises[i])"
                  class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
                  style="background: var(--surface2); border: 1px solid var(--border)">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style="color: var(--text2)">
                    <path d="M7 16V4m0 0L3 8m4-4l4 4M17 8v12m0 0l4-4m-4 4l-4-4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>

        <!-- Start button -->
        <button @click="startSession" class="btn-accent">
          {{ store.activeSession?.programId === program.id ? '⏱ Sessão Ativa — Ver' : '▶  Começar Treino' }}
        </button>

      </div>
    </div>

    <!-- Modals -->
    <VideoModal :show="!!selectedVideo" :exercise="selectedVideo" @close="selectedVideo = null" />
    <AlternativesModal
      v-if="!isCustom"
      :show="!!selectedForSwap"
      :exercise="selectedForSwap"
      :program-id="program?.id"
      :original-exercise-id="swapOriginalId"
      @close="selectedForSwap = null"
      @swapped="selectedForSwap = null" />
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { programs } from '@/data/programs'
import VideoModal from '@/components/VideoModal.vue'
import AlternativesModal from '@/components/AlternativesModal.vue'

const route = useRoute()
const router = useRouter()
const store = useWorkoutStore()

const isCustom = computed(() => store.isCustomProgram(route.params.id))
const builtinProgram = computed(() => programs.find(p => p.id === route.params.id))
const program = computed(() => {
  if (isCustom.value) return store.customPrograms.find(p => p.id === route.params.id)
  return builtinProgram.value
})
const exercises = computed(() => store.getProgramExercises(route.params.id))

const selectedVideo = ref(null)
const selectedForSwap = ref(null)
const swapOriginalId = ref(null)

function openVideo(ex) { selectedVideo.value = ex }
function openAlternatives(ex, originalId) {
  selectedForSwap.value = ex
  swapOriginalId.value = originalId
}

function startSession() {
  if (store.activeSession?.programId === program.value.id) {
    router.push('/sessao'); return
  }
  if (store.activeSession) store.cancelSession()
  store.startSession(program.value.id)
  router.push('/sessao')
}

function confirmDelete() {
  if (confirm(`Excluir o treino "${program.value.name}"?`)) {
    store.deleteCustomProgram(route.params.id)
    router.replace('/treinos')
  }
}
</script>
