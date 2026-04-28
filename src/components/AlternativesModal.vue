<template>
  <Teleport to="body">
    <Transition name="fade">
      <div v-if="show" class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-sm px-4"
        @click.self="$emit('close')">
        <Transition name="slide-up">
          <div v-if="show" class="w-full max-w-lg bg-slate-900 rounded-3xl overflow-hidden shadow-2xl">
            <!-- Header -->
            <div class="flex items-center justify-between px-5 py-4 border-b border-slate-800">
              <div>
                <h3 class="font-bold text-white">Trocar Exercício</h3>
                <p class="text-xs text-slate-400">{{ exercise?.name }}</p>
              </div>
              <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <!-- Current -->
            <div class="px-5 pt-4">
              <p class="text-xs text-slate-500 uppercase tracking-wide font-bold mb-2">Atual</p>
              <div class="bg-slate-800 rounded-xl px-4 py-3 border-2 border-violet-600/50 flex items-center gap-3">
                <img v-if="exercise?.videoId" :src="`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`"
                  class="w-14 h-10 rounded-lg object-cover shrink-0" />
                <div v-else class="w-14 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl shrink-0">💪</div>
                <div class="min-w-0">
                  <div class="font-semibold text-sm text-white truncate">{{ exercise?.name }}</div>
                  <div class="text-xs text-slate-400">{{ exercise?.sets }}x{{ exercise?.reps }}</div>
                </div>
                <span class="ml-auto text-violet-400 text-xs font-bold shrink-0">Atual</span>
              </div>
            </div>

            <!-- Alternatives -->
            <div class="px-5 py-4">
              <p class="text-xs text-slate-500 uppercase tracking-wide font-bold mb-2">Alternativas com resultado similar</p>
              <div v-if="!alternatives.length" class="text-center py-6 text-slate-500 text-sm">
                Nenhuma alternativa cadastrada para este exercício.
              </div>
              <div v-else class="space-y-2 max-h-72 overflow-y-auto no-scrollbar">
                <button v-for="alt in alternatives" :key="alt.id"
                  @click="select(alt)"
                  class="w-full flex items-center gap-3 bg-slate-800 hover:bg-slate-700 active:scale-[0.98] rounded-xl px-4 py-3 transition-all duration-150 text-left">
                  <img v-if="alt.videoId" :src="`https://img.youtube.com/vi/${alt.videoId}/mqdefault.jpg`"
                    class="w-14 h-10 rounded-lg object-cover shrink-0" />
                  <div v-else class="w-14 h-10 rounded-lg bg-slate-700 flex items-center justify-center text-xl shrink-0">🔄</div>
                  <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm text-white truncate">{{ alt.name }}</div>
                    <div class="text-xs text-slate-400">{{ alt.sets }}x{{ alt.reps }}</div>
                    <div class="flex flex-wrap gap-1 mt-1">
                      <span v-for="m in alt.muscles.slice(0,2)" :key="m"
                        class="text-[9px] bg-slate-700 text-slate-400 px-1.5 py-0.5 rounded-full">{{ m }}</span>
                    </div>
                  </div>
                  <span class="text-slate-500 shrink-0">›</span>
                </button>
              </div>
            </div>

            <!-- Reset -->
            <div v-if="isSwapped" class="px-5 pb-5">
              <button @click="reset" class="w-full bg-slate-800 hover:bg-red-900/30 text-red-400 border border-red-900/50 font-medium py-3 rounded-xl transition-colors text-sm">
                Restaurar exercício original
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { computed } from 'vue'
import { useWorkoutStore } from '@/stores/workoutStore'

const props = defineProps({
  show: Boolean,
  exercise: Object,
  programId: String,
  originalExerciseId: String,
})
const emit = defineEmits(['close', 'swapped'])

const store = useWorkoutStore()

const alternatives = computed(() => {
  if (!props.exercise) return []
  return store.getAlternatives(props.exercise.id)
})

const isSwapped = computed(() => {
  return props.programId && props.originalExerciseId &&
    store.exerciseSwaps[props.programId]?.[props.originalExerciseId]
})

function select(alt) {
  if (props.programId && props.originalExerciseId) {
    store.swapExercise(props.programId, props.originalExerciseId, alt.id)
    emit('swapped', alt)
  }
  emit('close')
}

function reset() {
  store.resetSwap(props.programId, props.originalExerciseId)
  emit('swapped', null)
  emit('close')
}
</script>
