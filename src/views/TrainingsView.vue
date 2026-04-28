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

      <!-- Tab: Prontos / Meus -->
      <div class="flex rounded-2xl p-1 gap-1" style="background: var(--surface2)">
        <button @click="tab = 'ready'; search = ''"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all"
          :style="tab === 'ready'
            ? 'background: var(--accent); color: #fff; box-shadow: 0 2px 12px rgba(255,77,28,0.35)'
            : 'color: var(--text2); font-family: DM Sans, sans-serif'">
          Prontos
        </button>
        <button @click="tab = 'mine'; search = ''"
          class="flex-1 py-2 rounded-xl text-sm font-bold transition-all relative"
          :style="tab === 'mine'
            ? 'background: var(--accent); color: #fff; box-shadow: 0 2px 12px rgba(255,77,28,0.35)'
            : 'color: var(--text2); font-family: DM Sans, sans-serif'">
          Meus Treinos
          <span v-if="store.customPrograms.length"
            class="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[9px] font-black text-white flex items-center justify-center"
            style="background: var(--warn)">
            {{ store.customPrograms.length }}
          </span>
        </button>
      </div>

      <!-- Filters (only for Prontos) -->
      <div v-if="tab === 'ready'" class="flex gap-2 overflow-x-auto no-scrollbar pb-1">
        <button @click="activeFilter = null" class="gym-tag" :class="{ active: !activeFilter }">Todos</button>
        <button v-for="f in filters" :key="f" @click="activeFilter = activeFilter === f ? null : f"
          class="gym-tag" :class="{ active: activeFilter === f }">
          {{ f }}
        </button>
      </div>

      <!-- Program list: Prontos -->
      <template v-if="tab === 'ready'">
        <div v-if="!filteredPrograms.length" class="text-center py-10">
          <div class="text-4xl mb-3">🔍</div>
          <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Nenhum treino encontrado</p>
        </div>

        <RouterLink v-for="p in filteredPrograms" :key="p.id" :to="`/treino/${p.id}`"
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
                  <span class="font-title font-bold text-base" style="color: var(--text)">{{ p.name }}</span>
                  <span class="text-[11px] font-bold px-2 py-0.5 rounded-full"
                    :style="`background: ${p.color}25; color: ${p.color}`">
                    {{ p.exercises.length }} exerc.
                  </span>
                </div>
                <p class="font-semibold text-sm mb-1" :style="`color: ${p.color}`">{{ p.focus }}</p>
                <p class="text-xs leading-relaxed" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ p.description }}</p>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: var(--text3); margin-top: 4px; flex-shrink: 0">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
            <div class="flex flex-wrap gap-1.5 mt-3 pt-3" style="border-top: 1px solid var(--border)">
              <span v-for="exId in p.exercises.slice(0,4)" :key="exId"
                class="text-[10px] px-2 py-1 rounded-full"
                style="background: var(--surface2); color: var(--text2); border: 1px solid var(--border); font-family: 'DM Sans', sans-serif">
                {{ exercises[swappedId(p.id, exId)]?.name || exercises[exId]?.name || exId }}
              </span>
              <span v-if="p.exercises.length > 4" class="text-[10px] py-1 px-1" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                +{{ p.exercises.length - 4 }} mais
              </span>
            </div>
          </div>
        </RouterLink>
      </template>

      <!-- Program list: Meus -->
      <template v-else>
        <div v-if="!store.customPrograms.length" class="text-center py-12">
          <div class="w-20 h-20 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-4"
            style="background: var(--surface2); border: 1px solid var(--border)">✍️</div>
          <h3 class="font-title font-bold text-lg mb-2" style="color: var(--text)">Nenhum treino criado</h3>
          <p class="text-sm mb-6" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
            Monte seu treino com os exercícios que você preferir
          </p>
          <RouterLink to="/criar-treino" class="btn-accent" style="display: inline-flex; width: auto; padding: 12px 28px">
            + Criar Meu Treino
          </RouterLink>
        </div>

        <template v-else>
          <RouterLink v-for="p in filteredCustom" :key="p.id" :to="`/treino/${p.id}`"
            class="block rounded-2xl overflow-hidden transition-all active:scale-[0.98]"
            style="background: var(--surface); border: 1px solid var(--border)">
            <div class="p-4 flex items-start gap-4">
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
                <span class="text-[10px] px-2 py-0.5 rounded-full" style="background: rgba(245,158,11,0.1); color: var(--warn); border: 1px solid rgba(245,158,11,0.2); font-family: 'DM Sans', sans-serif">
                  Personalizado
                </span>
              </div>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" style="color: var(--text3); margin-top: 4px; flex-shrink: 0">
                <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </div>
          </RouterLink>

          <RouterLink to="/criar-treino"
            class="flex items-center justify-center gap-2 rounded-2xl py-5 transition-all"
            style="border: 1.5px dashed var(--surface3); color: var(--text3); font-family: 'DM Sans', sans-serif; font-size: 14px; font-weight: 600">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M12 5v14M5 12h14" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
            </svg>
            Criar outro treino
          </RouterLink>
        </template>
      </template>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { RouterLink, useRouter } from 'vue-router'

const router = useRouter()
import { programs } from '@/data/programs'
import { exercises } from '@/data/exercises'
import { useWorkoutStore } from '@/stores/workoutStore'

const store = useWorkoutStore()
const tab = ref('ready')
const search = ref('')
const activeFilter = ref(null)

const filters = ['Peito', 'Costas', 'Pernas', 'Ombros', 'Braços']

const focusMap = {
  Peito: ['peito', 'peitoral', 'chest'],
  Costas: ['costas', 'back', 'dorsal'],
  Pernas: ['perna', 'leg', 'quadr', 'glúteo'],
  Ombros: ['ombro', 'shoulder', 'deltoi'],
  Braços: ['bíceps', 'tríceps', 'antebraço', 'arm'],
}

const filteredPrograms = computed(() => {
  let list = programs
  const q = search.value.toLowerCase().trim()
  if (q) return list.filter(p => p.name.toLowerCase().includes(q) || p.focus.toLowerCase().includes(q))
  if (activeFilter.value) {
    const keywords = focusMap[activeFilter.value] || []
    return list.filter(p => keywords.some(k => p.focus.toLowerCase().includes(k) || p.name.toLowerCase().includes(k)))
  }
  return list
})

const filteredCustom = computed(() => {
  const q = search.value.toLowerCase().trim()
  if (!q) return store.customPrograms
  return store.customPrograms.filter(p => p.name.toLowerCase().includes(q))
})

function swappedId(programId, exId) {
  return store.exerciseSwaps[programId]?.[exId] || exId
}
</script>
