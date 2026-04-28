<template>
  <div :class="showNav ? 'pb-20' : ''" class="min-h-screen" style="background: var(--bg)">
    <!-- Active session banner -->
    <Transition name="fade">
      <div v-if="store.activeSession && showNav"
        class="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-5 py-2.5 text-sm font-semibold shadow-lg"
        style="background: var(--accent); color: #fff">
        <div class="flex items-center gap-2">
          <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
          <span style="font-family: 'DM Sans', sans-serif">Sessão ativa — {{ elapsed }}</span>
        </div>
        <RouterLink to="/sessao" style="font-family: 'Space Grotesk', sans-serif; font-weight: 700; text-decoration: underline">
          Ver →
        </RouterLink>
      </div>
    </Transition>

    <main :class="store.activeSession ? 'pt-10' : ''">
      <RouterView v-slot="{ Component }">
        <Transition name="fade" mode="out-in">
          <component :is="Component" />
        </Transition>
      </RouterView>
    </main>

    <!-- Bottom navigation -->
    <nav v-if="showNav" class="fixed bottom-0 inset-x-0 z-40 gym-glass">
      <div class="flex justify-around items-center py-2 max-w-md mx-auto px-2">
        <NavBtn to="/" :icon="iconHome" label="Início" />
        <NavBtn to="/treinos" :icon="iconGrid" label="Treinos" />
        <NavBtn to="/sessao" :icon="iconPlay" label="Sessão" :force-accent="!!store.activeSession" />
        <NavBtn to="/historico" :icon="iconClock" label="Histórico" />
        <NavBtn to="/perfil" :icon="iconUser" label="Perfil" :badge="store.unreadInboxCount || 0" />
      </div>
    </nav>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useWorkoutStore } from '@/stores/workoutStore'
import { useAuthStore } from '@/stores/authStore'

const store = useWorkoutStore()
const authStore = useAuthStore()
const route = useRoute()
const showNav = computed(() => !route.meta?.noNav)
const now = ref(Date.now())
let timer

onMounted(() => { timer = setInterval(() => { now.value = Date.now() }, 1000) })
onUnmounted(() => clearInterval(timer))

watch(() => authStore.firebaseUser, (user) => {
  if (user) {
    store.subscribeToUser(user.uid)
  } else {
    store.unsubAll()
    store.syncPreferredProgram(null)
  }
}, { immediate: true })

watch(() => authStore.userProfile, (profile) => {
  if (profile?.preferredProgramId && !store.preferredProgramId) {
    store.syncPreferredProgram(profile.preferredProgramId)
  }
}, { immediate: true })

const elapsed = computed(() => {
  if (!store.activeSession) return ''
  const s = Math.floor((now.value - new Date(store.activeSession.startTime).getTime()) / 1000)
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = s % 60
  if (h > 0) return `${h}h ${String(m).padStart(2,'0')}m`
  return `${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}`
})

const iconHome = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/><path d="M9 21V12h6v9" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>`
const iconGrid  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><rect x="3" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" rx="2" stroke="currentColor" stroke-width="2"/></svg>`
const iconPlay  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M10 8l6 4-6 4V8z" fill="currentColor"/></svg>`
const iconClock = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="currentColor" stroke-width="2"/><path d="M12 7v5l3 3" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
const iconUser  = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="currentColor" stroke-width="2"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>`
</script>

<script>
import { RouterLink, useRoute, useRouter } from 'vue-router'
import { computed } from 'vue'

const NavBtn = {
  props: ['to', 'icon', 'label', 'forceAccent', 'badge'],
  setup(props) {
    const route = useRoute()
    const isActive = computed(() => {
      if (props.to === '/') return route.path === '/'
      return route.path.startsWith(props.to)
    })
    return { isActive }
  },
  template: `
    <RouterLink :to="to"
      class="flex flex-col items-center gap-1 px-3 py-1.5 rounded-2xl transition-all duration-150 min-w-0"
      :style="(isActive || forceAccent)
        ? 'color: var(--accent)'
        : 'color: var(--text3)'">
      <span class="relative leading-none">
        <span v-html="icon"></span>
        <span v-if="badge > 0"
          class="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style="background: #ef4444">{{ badge > 9 ? '9+' : badge }}</span>
      </span>
      <span class="text-[10px] font-semibold leading-none" style="font-family: \'DM Sans\', sans-serif">{{ label }}</span>
    </RouterLink>
  `,
}
</script>
