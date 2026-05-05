<template>
  <div class="screen-scroll">
    <div class="max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col gap-5">

      <!-- Header -->
      <div class="flex items-center gap-3">
        <button @click="router.back()"
          class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
          style="background: var(--surface); border: 1px solid var(--border); color: var(--text2)">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <h1 class="gym-title text-3xl">Treinos</h1>
      </div>

      <!-- Search -->
      <div class="flex items-center gap-3 rounded-2xl px-4 py-3"
        style="background: var(--surface); border: 1px solid var(--border)">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: var(--text3)">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Buscar treino..."
          class="flex-1 bg-transparent text-sm outline-none"
          style="color: var(--text); font-family: 'DM Sans', sans-serif"
          @input="activeFilter = null" />
        <button v-if="search" @click="search = ''" style="color: var(--text3)">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
            <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>

      <!-- Program list -->
      <div v-if="!store.customPrograms.length" class="flex flex-col items-center py-12 gap-4">
        <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl"
          style="background: var(--surface2); border: 1px solid var(--border)">🤖</div>
        <div class="text-center">
          <h3 class="font-title font-bold text-lg mb-1" style="color: var(--text)">Nenhum treino ainda</h3>
          <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
            Use a IA para montar seu treino personalizado
          </p>
        </div>
        <RouterLink to="/ia" class="btn-accent" style="display: inline-flex; width: auto; padding: 12px 28px">
          Montar com IA
        </RouterLink>
      </div>

      <template v-else>
        <RouterLink v-for="p in filteredCustom" :key="p.id" :to="`/treino/${p.id}`"
          class="block rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
          style="background: var(--surface); border: 1px solid var(--border)">
          <div class="p-4">
            <div class="flex items-start gap-4">
              <div class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0"
                :style="`background: ${p.color}20; border: 1.5px solid ${p.color}40`">
                {{ p.icon }}
              </div>
              <div class="flex-1 min-w-0">
                <div class="flex items-center gap-2 mb-1">
                  <span class="font-title font-bold text-base truncate" style="color: var(--text)">{{ p.name }}</span>
                  <span class="text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0"
                    :style="`background: ${p.color}25; color: ${p.color}`">
                    {{ p.exercises.length }} exerc.
                  </span>
                </div>
                <p class="font-semibold text-sm" :style="`color: ${p.color}`">{{ p.focus }}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: var(--text3); margin-top: 4px; flex-shrink: 0">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3 pt-3" style="border-top: 1px solid var(--border)">
              <span v-for="exId in p.exercises.slice(0,4)" :key="exId"
                class="text-[10px] px-2 py-1 rounded-full"
                style="background: var(--surface2); color: var(--text2); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif">
                {{ exercises[exId]?.name || exId }}
              </span>
              <span v-if="p.exercises.length > 4" class="text-[10px] py-1 px-1" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                +{{ p.exercises.length - 4 }} mais
              </span>
            </div>
          </div>
        </RouterLink>

        <RouterLink to="/ia"
          class="flex items-center justify-center gap-2 rounded-2xl py-5 transition-all"
          style="border: 1.5px dashed var(--surface3); color: var(--text3); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600">
          <span>🤖</span>
          Gerar novo treino com IA
        </RouterLink>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { exercises } from '@/data/exercises'
import { useWorkoutStore } from '@/stores/workoutStore'

const router = useRouter()
const store = useWorkoutStore()
const search = ref('')

const filteredCustom = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return store.customPrograms
  return store.customPrograms.filter(p => p.name.toLowerCase().includes(q))
})
</script>
