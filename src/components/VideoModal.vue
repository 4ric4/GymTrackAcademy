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
                <h3 class="font-bold text-white">{{ exercise?.name }}</h3>
                <p class="text-xs text-slate-400">Tutorial em vídeo</p>
              </div>
              <button @click="$emit('close')" class="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white transition-colors">✕</button>
            </div>

            <!-- Video -->
            <div class="relative" style="padding-bottom: 56.25%">
              <iframe v-if="exercise?.videoId"
                class="absolute inset-0 w-full h-full"
                :src="`https://www.youtube.com/embed/${exercise.videoId}?autoplay=1&rel=0&modestbranding=1`"
                frameborder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
              </iframe>
              <div v-else class="absolute inset-0 flex flex-col items-center justify-center bg-slate-800 gap-4">
                <span class="text-5xl">🎬</span>
                <p class="text-slate-400 text-sm text-center px-4">Vídeo não cadastrado ainda</p>
                <a :href="`https://www.youtube.com/results?search_query=${encodeURIComponent(exercise?.name + ' como fazer execução')}`"
                  target="_blank"
                  class="btn-primary text-sm py-2 px-4">
                  Buscar no YouTube →
                </a>
              </div>
            </div>

            <!-- Info -->
            <div class="p-5 space-y-3">
              <div v-if="exercise?.description" class="text-sm text-slate-300">{{ exercise.description }}</div>
              <div v-if="exercise?.tips?.length">
                <p class="text-xs font-bold text-violet-400 uppercase tracking-wide mb-2">Dicas</p>
                <ul class="space-y-1">
                  <li v-for="tip in exercise.tips" :key="tip" class="flex items-start gap-2 text-xs text-slate-300">
                    <span class="text-emerald-400 mt-0.5">✓</span>{{ tip }}
                  </li>
                </ul>
              </div>
              <div class="flex gap-2 text-xs pt-2">
                <span v-for="m in exercise?.muscles" :key="m" class="bg-slate-800 text-slate-300 px-2 py-1 rounded-full border border-slate-700">{{ m }}</span>
              </div>
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
defineProps({ show: Boolean, exercise: Object })
defineEmits(['close'])
</script>
