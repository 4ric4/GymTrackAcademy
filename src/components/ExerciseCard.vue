<template>
  <div class="card border border-slate-700/50 overflow-hidden"
    :class="isCompleted ? 'opacity-60' : ''">
    <!-- Thumbnail row -->
    <div class="flex gap-3 mb-3">
      <div class="relative w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-900 cursor-pointer"
        @click="$emit('video', exercise)">
        <img v-if="exercise.videoId"
          :src="`https://img.youtube.com/vi/${exercise.videoId}/mqdefault.jpg`"
          class="w-full h-full object-cover"
          loading="lazy" />
        <div v-else class="w-full h-full flex items-center justify-center text-2xl">💪</div>
        <div v-if="exercise.videoId" class="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/10 transition-colors">
          <div class="w-6 h-6 rounded-full bg-red-600 flex items-center justify-center">
            <span class="text-white text-[10px] ml-0.5">▶</span>
          </div>
        </div>
      </div>

      <div class="flex-1 min-w-0">
        <div class="flex items-start justify-between gap-2">
          <h3 class="font-bold text-sm text-white leading-tight">{{ exercise.name }}</h3>
          <span v-if="isSwapped" class="text-[9px] bg-amber-500/20 text-amber-400 border border-amber-500/30 px-1.5 py-0.5 rounded-full shrink-0">Trocado</span>
        </div>
        <div class="flex flex-wrap gap-1 mt-1">
          <span v-for="m in exercise.muscles.slice(0,2)" :key="m"
            class="text-[9px] bg-slate-900 text-slate-400 px-1.5 py-0.5 rounded-full border border-slate-700">{{ m }}</span>
        </div>
        <div class="flex gap-3 mt-2 text-xs font-semibold">
          <span class="text-violet-400">{{ exercise.sets }} séries</span>
          <span class="text-slate-400">×</span>
          <span class="text-emerald-400">{{ exercise.reps }} reps</span>
        </div>
      </div>
    </div>

    <!-- Actions -->
    <div class="flex gap-2">
      <button @click="$emit('video', exercise)"
        class="flex-1 flex items-center justify-center gap-1.5 bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-600/30 text-xs font-semibold py-2 rounded-xl transition-colors">
        🎬 Ver vídeo
      </button>
      <button @click="$emit('alternatives', exercise)"
        class="flex-1 flex items-center justify-center gap-1.5 bg-amber-500/20 hover:bg-amber-500/30 text-amber-400 border border-amber-500/30 text-xs font-semibold py-2 rounded-xl transition-colors">
        🔄 Alternativas
      </button>
      <button v-if="showCheck" @click="$emit('toggle')"
        class="w-10 flex items-center justify-center rounded-xl transition-colors text-sm border"
        :class="isCompleted ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-900 border-slate-700 text-slate-500'">
        {{ isCompleted ? '✓' : '○' }}
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  exercise: { type: Object, required: true },
  isCompleted: { type: Boolean, default: false },
  isSwapped: { type: Boolean, default: false },
  showCheck: { type: Boolean, default: false },
})
defineEmits(['video', 'alternatives', 'toggle'])
</script>
