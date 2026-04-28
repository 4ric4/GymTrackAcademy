<template>
  <div class="max-w-md mx-auto pb-32">
    <!-- Sticky header -->
    <div class="sticky top-0 z-10 px-5 pt-4 pb-4"
      style="background: rgba(12,12,20,0.92); backdrop-filter: blur(16px); border-bottom: 1px solid var(--border)">
      <div class="flex items-center gap-3 mb-4">
        <button @click="router.back()"
          class="flex items-center gap-1 text-sm font-semibold"
          style="color: var(--text2); font-family: 'DM Sans', sans-serif">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
            <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          </svg>
          Voltar
        </button>
        <h1 class="font-title font-bold text-lg" style="color: var(--text)">
          {{ isEditing ? 'Editar Treino' : 'Criar Treino' }}
        </h1>
      </div>

      <!-- Icon + name row -->
      <div class="flex gap-3">
        <button @click="showEmojiPicker = !showEmojiPicker"
          class="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0 border-2 border-dashed transition-all"
          :style="`background: ${form.color}20; border-color: ${form.color}60`">
          {{ form.icon }}
        </button>
        <div class="flex-1">
          <input v-model="form.name" type="text" maxlength="30" placeholder="Nome do treino..."
            class="w-full rounded-2xl px-4 py-3 text-sm font-semibold outline-none transition-all"
            style="background: var(--surface); color: var(--text); border: 1.5px solid var(--border); font-family: 'Space Grotesk', sans-serif"
            @focus="$event.target.style.borderColor = 'var(--accent)'"
            @blur="$event.target.style.borderColor = 'var(--border)'" />
          <p class="text-[10px] mt-1 px-1" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
            {{ selectedIds.length }} exercício{{ selectedIds.length !== 1 ? 's' : '' }} selecionado{{ selectedIds.length !== 1 ? 's' : '' }}
          </p>
        </div>
      </div>

      <!-- Emoji / color picker -->
      <Transition name="scale">
        <div v-if="showEmojiPicker" class="mt-3 rounded-2xl p-4" style="background: var(--surface2); border: 1px solid var(--border)">
          <p class="text-[10px] uppercase font-bold tracking-widest mb-2" style="color: var(--text3); font-family: 'DM Sans', sans-serif">Ícone</p>
          <div class="flex flex-wrap gap-2 mb-4">
            <button v-for="e in EMOJIS" :key="e" @click="form.icon = e; showEmojiPicker = false"
              class="w-9 h-9 rounded-xl flex items-center justify-center text-xl transition-all"
              :style="form.icon === e ? 'background: var(--accent); transform: scale(1.1)' : 'background: var(--surface3)'">
              {{ e }}
            </button>
          </div>
          <p class="text-[10px] uppercase font-bold tracking-widest mb-2" style="color: var(--text3); font-family: 'DM Sans', sans-serif">Cor</p>
          <div class="flex gap-2 flex-wrap">
            <button v-for="c in COLORS" :key="c" @click="form.color = c"
              class="w-7 h-7 rounded-full border-2 transition-all"
              :style="`background: ${c}; border-color: ${form.color === c ? '#fff' : 'transparent'}; transform: ${form.color === c ? 'scale(1.15)' : 'scale(1)'}`">
            </button>
          </div>
        </div>
      </Transition>
    </div>

    <!-- Categories -->
    <div class="px-5 pt-4 flex gap-2">
      <button v-for="cat in CATEGORIES" :key="cat.label"
        @click="activeCategory = activeCategory === cat.label ? null : cat.label"
        class="flex-1 rounded-2xl py-2.5 text-xs font-bold transition-all"
        :style="activeCategory === cat.label
          ? 'background: var(--accent-dim); border: 1.5px solid var(--accent); color: var(--accent)'
          : 'background: var(--surface); border: 1.5px solid var(--border); color: var(--text2); font-family: DM Sans, sans-serif'">
        {{ cat.icon }} {{ cat.label }}
      </button>
    </div>

    <div class="px-5 pt-4">
      <!-- My workout preview -->
      <div v-if="selectedIds.length" class="mb-5">
        <div class="flex justify-between items-center mb-3">
          <p class="font-title font-bold text-sm" style="color: var(--text)">Meu treino</p>
          <span class="text-xs" style="color: var(--text2); font-family: 'DM Sans', sans-serif">{{ selectedIds.length }} exerc.</span>
        </div>
        <div class="flex flex-col gap-2">
          <div v-for="id in selectedIds" :key="id"
            class="flex items-center gap-3 rounded-2xl px-4 py-3"
            style="background: var(--surface); border: 1px solid var(--border)">
            <div class="w-1 h-9 rounded-full shrink-0" style="background: var(--accent)"></div>
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-sm truncate" style="color: var(--text); font-family: 'DM Sans', sans-serif">
                {{ allExercises[id]?.name || id }}
              </div>
              <div class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">
                {{ allExercises[id]?.sets }}×{{ allExercises[id]?.reps }}
              </div>
            </div>
            <button @click="toggleExercise(id)"
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
              style="background: var(--surface2); border: 1px solid var(--border)">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" style="color: #ef4444">
                <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="mt-3 h-px" style="background: var(--border)"></div>
      </div>

      <!-- Search -->
      <div class="relative mb-4">
        <svg class="absolute" style="left: 14px; top: 50%; transform: translateY(-50%); color: var(--text3)"
          width="15" height="15" viewBox="0 0 24 24" fill="none">
          <circle cx="11" cy="11" r="8" stroke="currentColor" stroke-width="2"/>
          <path d="m21 21-4.35-4.35" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
        <input v-model="search" type="text" placeholder="Buscar exercício..."
          class="w-full rounded-2xl py-2.5 text-sm outline-none"
          style="background: var(--surface); color: var(--text); border: 1px solid var(--border); padding-left: 40px; padding-right: 16px; font-family: 'DM Sans', sans-serif" />
      </div>

      <!-- Group filter pills -->
      <div class="flex gap-2 overflow-x-auto no-scrollbar pb-1 mb-4">
        <button @click="filterGroup = null" class="gym-tag" :class="{ active: !filterGroup }">Todos</button>
        <button v-for="g in GROUPS" :key="g.label" @click="filterGroup = filterGroup === g.label ? null : g.label"
          class="gym-tag" :class="{ active: filterGroup === g.label }">
          {{ g.icon }} {{ g.label }}
        </button>
      </div>

      <!-- Exercise list -->
      <div v-for="g in visibleGroups" :key="g.label" class="mb-5">
        <p class="text-[10px] font-bold uppercase tracking-widest mb-2 flex items-center gap-1"
          style="color: var(--text3); font-family: 'DM Sans', sans-serif">
          {{ g.icon }} {{ g.label }}
        </p>
        <div class="flex flex-col gap-2">
          <button v-for="ex in g.items" :key="ex.id"
            @click="toggleExercise(ex.id)"
            class="w-full flex items-center gap-3 rounded-2xl px-4 py-3 border transition-all text-left"
            :style="isSelected(ex.id)
              ? 'background: var(--accent-dim); border-color: var(--accent-glow)'
              : 'background: var(--surface); border-color: var(--border)'">
            <!-- Thumb -->
            <div class="relative w-12 h-9 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style="background: var(--surface2)">
              <img v-if="ex.videoId" :src="`https://img.youtube.com/vi/${ex.videoId}/mqdefault.jpg`"
                class="w-full h-full object-cover" loading="lazy" />
              <span v-else class="text-base">💪</span>
            </div>
            <!-- Info -->
            <div class="flex-1 min-w-0">
              <div class="font-semibold text-xs truncate"
                :style="isSelected(ex.id) ? 'color: var(--accent)' : 'color: var(--text)'"
                style="font-family: 'DM Sans', sans-serif">
                {{ ex.name }}
              </div>
              <div class="text-[10px] mt-0.5" style="color: var(--text3); font-family: 'DM Sans', sans-serif">
                {{ ex.sets }}×{{ ex.reps }}
              </div>
            </div>
            <!-- Toggle circle -->
            <div class="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all"
              :style="isSelected(ex.id)
                ? 'background: var(--accent); border-color: var(--accent)'
                : 'border-color: var(--surface3)'">
              <svg v-if="isSelected(ex.id)" width="10" height="10" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#fff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </button>
        </div>
      </div>

      <div v-if="!visibleGroups.length" class="text-center py-10">
        <div class="text-3xl mb-2">🔍</div>
        <p class="text-sm" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Nenhum exercício encontrado</p>
      </div>
    </div>

    <!-- Save FAB -->
    <div class="fixed bottom-24 inset-x-5 max-w-md mx-auto">
      <Transition name="slide-up">
        <button v-if="canSave" @click="save" class="btn-accent">
          {{ isEditing ? '💾 Salvar Alterações' : '✓ Criar Treino' }}
          <span class="rounded-full px-2 py-0.5 text-xs font-bold"
            style="background: rgba(255,255,255,0.2); font-family: 'DM Sans', sans-serif">
            {{ selectedIds.length }} exerc.
          </span>
        </button>
      </Transition>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'
import { exercises as allExercises } from '@/data/exercises'

const route = useRoute()
const router = useRouter()
const store = useWorkoutStore()
const authStore = useAuthStore()

const isEditing = computed(() => !!route.params.id)

const EMOJIS = ['⭐', '🏋️', '💥', '🔥', '⚡', '🎯', '🥊', '🏆', '💎', '🦾', '🚀', '🌟', '💪', '🎽', '🏃', '🧠']
const COLORS = ['#FF4D1C', '#8B5CF6', '#3B82F6', '#10B981', '#F59E0B', '#EC4899', '#06B6D4', '#EF4444', '#84CC16', '#A855F7']
const CATEGORIES = [
  { icon: '💪', label: 'Força' },
  { icon: '⚡', label: 'Hipertrofia' },
  { icon: '🏃', label: 'Cardio' },
]

const GROUPS = [
  { label: 'Peito',   icon: '🫁', ids: ['supino-reto','supino-inclinado','crucifixo','supino-halteres','crossover','peck-deck','supino-fechado'] },
  { label: 'Tríceps', icon: '💪', ids: ['triceps-pulley','triceps-testa','dips','triceps-frances'] },
  { label: 'Costas',  icon: '🔙', ids: ['puxada-frontal','remada-curvada','remada-unilateral','pullover','barra-fixa'] },
  { label: 'Bíceps',  icon: '💪', ids: ['rosca-direta','rosca-alternada','rosca-martelo','rosca-scott','rosca-concentrada','rosca-21'] },
  { label: 'Pernas',  icon: '🦵', ids: ['agachamento','leg-press','cadeira-extensora','cadeira-flexora','stiff','panturrilha','afundo','agachamento-bulgaro','hack-squat','panturrilha-sentada'] },
  { label: 'Ombros',  icon: '🏋️', ids: ['desenvolvimento-halteres','elevacao-lateral','elevacao-frontal','remada-alta','encolhimento','passaro','desenvolvimento-barra','desenvolvimento-arnold'] },
]

const existingCustom = isEditing.value ? store.customPrograms.find(p => p.id === route.params.id) : null

const form = ref({
  name: existingCustom?.name || '',
  icon: existingCustom?.icon || '⭐',
  color: existingCustom?.color || '#FF4D1C',
})
const selectedIds = ref([...(existingCustom?.exercises || [])])
const showEmojiPicker = ref(false)
const search = ref('')
const filterGroup = ref(null)
const activeCategory = ref(null)

function isSelected(id) { return selectedIds.value.includes(id) }
function toggleExercise(id) {
  const idx = selectedIds.value.indexOf(id)
  if (idx >= 0) selectedIds.value.splice(idx, 1)
  else selectedIds.value.push(id)
}

const visibleGroups = computed(() => {
  const q = search.value.toLowerCase().trim()
  return GROUPS
    .filter(g => !filterGroup.value || g.label === filterGroup.value)
    .map(g => ({
      ...g,
      items: g.ids
        .map(id => allExercises[id])
        .filter(ex => ex && (!q || ex.name.toLowerCase().includes(q))),
    }))
    .filter(g => g.items.length > 0)
})

const canSave = computed(() => form.value.name.trim().length > 0 && selectedIds.value.length > 0)

async function save() {
  const id = existingCustom?.id || `custom_${Date.now()}`
  await store.saveCustomProgram(authStore.firebaseUser?.uid, {
    id,
    name: form.value.name.trim(),
    focus: activeCategory.value || 'Personalizado',
    description: `${selectedIds.value.length} exercícios selecionados`,
    color: form.value.color,
    gradient: '',
    icon: form.value.icon,
    exercises: [...selectedIds.value],
    isCustom: true,
  })
  router.replace(`/treino/${id}`)
}
</script>
