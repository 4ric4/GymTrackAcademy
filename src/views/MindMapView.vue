<template>
  <div class="px-4 pt-6 pb-4 max-w-md mx-auto">
    <div class="flex items-center gap-3 mb-4">
      <button @click="router.back()"
        class="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all active:scale-95"
        style="background: var(--surface); border: 1px solid var(--border); color: var(--text2)">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
          <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
        </svg>
      </button>
      <div>
        <h1 class="gym-title text-2xl">Mapa Mental</h1>
        <p class="text-xs mt-0.5" style="color: var(--text2); font-family: 'DM Sans', sans-serif">Estrutura visual dos seus treinos</p>
      </div>
    </div>

    <!-- Program selector -->
    <div class="flex gap-2 mb-5 overflow-x-auto no-scrollbar pb-1">
      <button @click="selected = null"
        class="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150"
        :class="!selected ? 'bg-violet-600 border-violet-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'">
        Todos
      </button>
      <button v-for="p in programs" :key="p.id"
        @click="selected = selected === p.id ? null : p.id"
        class="shrink-0 px-4 py-2 rounded-xl text-sm font-semibold border transition-all duration-150"
        :class="selected === p.id ? 'text-white' : 'bg-slate-800 border-slate-700 text-slate-400'"
        :style="selected === p.id ? `background: ${p.color}; border-color: ${p.color}` : ''">
        {{ p.icon }} {{ p.name }}
      </button>
    </div>

    <!-- Mind map SVG -->
    <div class="card overflow-hidden mb-5 p-0">
      <svg :viewBox="`0 0 ${svgW} ${svgH}`" class="w-full" :style="`height: ${svgH * (350 / svgW)}px`">
        <!-- Background -->
        <rect width="100%" height="100%" fill="#0F172A" rx="16" />

        <!-- Center node -->
        <g>
          <circle :cx="cx" :cy="cy" r="40" fill="#7C3AED" />
          <text :x="cx" :y="cy - 6" text-anchor="middle" fill="white" font-size="16" font-weight="900">💪</text>
          <text :x="cx" :y="cy + 10" text-anchor="middle" fill="white" font-size="7" font-weight="700">MEUS</text>
          <text :x="cx" :y="cy + 20" text-anchor="middle" fill="white" font-size="7" font-weight="700">TREINOS</text>
        </g>

        <!-- Program branches -->
        <g v-for="(p, pi) in visiblePrograms" :key="p.id">
          <!-- Connector line to program -->
          <path :d="branchPath(pi)" :stroke="p.color" stroke-width="2.5" fill="none" opacity="0.6" />

          <!-- Program node -->
          <g @click="selected = selected === p.id ? null : p.id" class="cursor-pointer">
            <circle :cx="programPos(pi).x" :cy="programPos(pi).y" r="28"
              :fill="p.color + '33'" :stroke="p.color" stroke-width="2" />
            <text :x="programPos(pi).x" :y="programPos(pi).y - 4"
              text-anchor="middle" fill="white" font-size="14">{{ p.icon }}</text>
            <text :x="programPos(pi).x" :y="programPos(pi).y + 10"
              text-anchor="middle" :fill="p.color" font-size="8" font-weight="700">{{ p.name }}</text>
          </g>

          <!-- Exercise sub-branches -->
          <g v-if="selected === null || selected === p.id"
            v-for="(exId, ei) in p.exercises" :key="exId">
            <path :d="exercisePath(pi, ei, p.exercises.length)"
              :stroke="p.color" stroke-width="1.5" fill="none" opacity="0.35" />
            <g @click="openExModal(exId)" class="cursor-pointer">
              <rect
                :x="exPos(pi, ei, p.exercises.length).x - exLabelW/2"
                :y="exPos(pi, ei, p.exercises.length).y - 9"
                :width="exLabelW"
                height="18"
                rx="9"
                :fill="p.color + '22'"
                :stroke="p.color + '55'"
                stroke-width="1" />
              <text
                :x="exPos(pi, ei, p.exercises.length).x"
                :y="exPos(pi, ei, p.exercises.length).y + 4"
                text-anchor="middle"
                fill="white"
                font-size="6.5"
                font-weight="600">
                {{ shortName(exId) }}
              </text>
            </g>
          </g>
        </g>
      </svg>
    </div>

    <!-- Legend / detail panel -->
    <div class="space-y-3">
      <div v-for="p in visiblePrograms" :key="p.id" class="card">
        <div class="flex items-center gap-3 mb-3">
          <div class="w-10 h-10 rounded-xl flex items-center justify-center text-2xl shrink-0"
            :style="`background: ${p.color}22; border: 1.5px solid ${p.color}44`">{{ p.icon }}</div>
          <div>
            <div class="font-bold text-white">{{ p.name }}</div>
            <div class="text-xs font-semibold" :style="`color: ${p.color}`">{{ p.focus }}</div>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-1.5">
          <div v-for="exId in p.exercises" :key="exId"
            @click="openExModal(exId)"
            class="flex items-center gap-2 bg-slate-900 rounded-xl px-3 py-2 cursor-pointer hover:bg-slate-800 transition-colors">
            <div class="w-1.5 h-1.5 rounded-full shrink-0" :style="`background: ${p.color}`"></div>
            <span class="text-xs text-slate-300 truncate">{{ getExName(exId) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Exercise detail modal -->
    <Transition name="fade">
      <div v-if="modalEx" class="fixed inset-0 z-50 flex items-end justify-center bg-black/70 backdrop-blur-sm px-4"
        @click.self="modalEx = null">
        <Transition name="slide-up">
          <div v-if="modalEx" class="w-full max-w-md bg-slate-900 rounded-3xl p-5 mb-4 shadow-2xl">
            <div class="flex items-start justify-between mb-3">
              <div>
                <h3 class="font-bold text-white">{{ modalEx.name }}</h3>
                <div class="flex gap-1 mt-1">
                  <span v-for="m in modalEx.muscles.slice(0,2)" :key="m"
                    class="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">{{ m }}</span>
                </div>
              </div>
              <button @click="modalEx = null" class="text-slate-400 hover:text-white">✕</button>
            </div>
            <div class="flex gap-2 text-sm font-semibold mb-3">
              <span class="text-violet-400">{{ modalEx.sets }} séries</span>
              <span class="text-slate-500">×</span>
              <span class="text-emerald-400">{{ modalEx.reps }} reps</span>
            </div>
            <p class="text-sm text-slate-400 mb-3">{{ modalEx.description }}</p>
            <a v-if="modalEx.videoId"
              :href="`https://www.youtube.com/watch?v=${modalEx.videoId}`"
              target="_blank"
              class="block w-full text-center bg-red-600 hover:bg-red-500 text-white font-semibold py-2.5 rounded-xl transition-colors text-sm">
              🎬 Assistir Tutorial
            </a>
          </div>
        </Transition>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { programs } from '@/data/programs'
import { exercises } from '@/data/exercises'
import { useWorkoutStore } from '@/stores/workoutStore'

const router = useRouter()

const store = useWorkoutStore()
const selected = ref(null)
const modalEx = ref(null)

const svgW = 400
const svgH = 360
const cx = svgW / 2
const cy = svgH / 2
const exLabelW = 78

const visiblePrograms = computed(() =>
  selected.value ? programs.filter(p => p.id === selected.value) : programs
)

const programAngles = [225, 315, 45, 135] // corners
const branchLen = 90
const exLen = 60

function deg2rad(d) { return d * Math.PI / 180 }

function programPos(pi) {
  const angle = deg2rad(programAngles[pi])
  return { x: cx + Math.cos(angle) * branchLen, y: cy + Math.sin(angle) * branchLen }
}

function branchPath(pi) {
  const p = programPos(pi)
  return `M ${cx} ${cy} Q ${(cx + p.x) / 2} ${(cy + p.y) / 2} ${p.x} ${p.y}`
}

function exPos(pi, ei, total) {
  const base = programPos(pi)
  const baseAngle = programAngles[pi]
  const spread = 55
  const offset = total > 1 ? ((ei - (total - 1) / 2) * spread) : 0
  const angle = deg2rad(baseAngle + offset)
  return {
    x: base.x + Math.cos(angle) * exLen,
    y: base.y + Math.sin(angle) * exLen,
  }
}

function exercisePath(pi, ei, total) {
  const base = programPos(pi)
  const ex = exPos(pi, ei, total)
  return `M ${base.x} ${base.y} L ${ex.x} ${ex.y}`
}

function shortName(exId) {
  const swapped = store.exerciseSwaps[selected.value || '']?.[exId] || exId
  const ex = exercises[swapped] || exercises[exId]
  if (!ex) return exId
  const n = ex.name
  if (n.length <= 14) return n
  return n.substring(0, 12) + '…'
}

function getExName(exId) {
  return exercises[exId]?.name || exId
}

function openExModal(exId) {
  modalEx.value = exercises[exId] || null
}
</script>
