<template>
  <header class="top-bar">
    <div class="top-bar-left">
      <button class="mobile-toggle" @click="$emit('toggle-sidebar')">
        <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2">
          <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
        </svg>
      </button>
      <div class="breadcrumb">
        <span class="breadcrumb-item" v-for="(crumb, i) in breadcrumbs" :key="i">
          <span v-if="i > 0" class="separator">/</span>
          {{ crumb }}
        </span>
      </div>
    </div>
    <div class="top-bar-right">
      <button class="dark-toggle" @click="$emit('toggle-dark')" :title="darkMode ? 'Light Mode' : 'Dark Mode'">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2">
          <path v-if="!darkMode" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          <circle v-else cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
        </svg>
      </button>
      <div class="theme-selector" @click.stop="themeOpen = !themeOpen">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        <div v-if="themeOpen" class="theme-dropdown">
          <div v-for="t in theme.themeList" :key="t.id" class="theme-item" :class="{ active: t.id === theme.current }" @click.stop="theme.setTheme(t.id); themeOpen = false">
            {{ t.icon }} {{ t.label }}
          </div>
        </div>
      </div>
      <div class="user-menu" @click="menuOpen = !menuOpen">
        <span class="user-name">{{ auth.business?.business_name || 'Business' }}</span>
        <div class="avatar">{{ (auth.user || 'G').charAt(0).toUpperCase() }}</div>
        <div v-if="menuOpen" class="dropdown-menu">
          <div class="dropdown-item disabled">{{ auth.user }}</div>
          <div class="dropdown-item" @click.stop="toggleBizSwitcher">{{ auth.business?.business_name || 'Switch Business' }} <span v-if="auth.businesses?.length > 1" class="switch-hint">&#8597;</span></div>
          <div v-if="showBizList && auth.businesses?.length > 1" class="biz-list">
            <div v-for="b in auth.businesses" :key="b.name" class="biz-item" :class="{ active: b.name === auth.business?.name }" @click.stop="switchBiz(b.name)">
              {{ b.business_name }}
            </div>
          </div>
          <hr />
          <div class="dropdown-item" @click.stop="handleLogout">Sign Out</div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'

defineProps({ darkMode: Boolean })
defineEmits(['toggle-sidebar', 'toggle-dark'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const theme = useThemeStore()
const menuOpen = ref(false)
const showBizList = ref(false)
const themeOpen = ref(false)

function toggleBizSwitcher() { showBizList.value = !showBizList.value }

async function switchBiz(name) {
  showBizList.value = false
  menuOpen.value = false
  try {
    const api = (await import('@/api/frappe')).default
    await api.post('manager.api.set_active_business', { business: name })
    await auth.loadBusiness()
    window.location.reload()
  } catch {}
}

function handleLogout() {
  menuOpen.value = false
  auth.logout()
  router.push('/login')
}

function closeMenu(e) {
  if (!e.target.closest('.user-menu')) menuOpen.value = false
  if (!e.target.closest('.theme-selector')) themeOpen.value = false
}

onMounted(() => document.addEventListener('click', closeMenu))
onUnmounted(() => document.removeEventListener('click', closeMenu))

const breadcrumbs = computed(() => {
  const parts = route.path.split('/').filter(Boolean)
  return parts.map((p) => p.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()))
})
</script>

<style scoped>
.top-bar { display: flex; align-items: center; justify-content: space-between; height: 56px; background: #fff; border-bottom: 1px solid #e2e8f0; padding: 0 1.25rem; }
.top-bar-left { display: flex; align-items: center; gap: 0.75rem; }
.top-bar-right { display: flex; align-items: center; gap: 0.75rem; }
.mobile-toggle { display: none; background: none; border: none; color: #64748b; cursor: pointer; padding: 0.25rem; }
.user-menu { display: flex; align-items: center; gap: 0.5rem; position: relative; cursor: pointer; padding: 0.25rem 0.5rem; border-radius: 6px; }
.user-menu:hover { background: #f1f5f9; }
.user-name { font-size: 0.85rem; color: #475569; font-weight: 500; white-space: nowrap; }
.avatar { width: 32px; height: 32px; border-radius: 50%; background: #2563eb; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; font-weight: 600; flex-shrink: 0; }
.breadcrumb { display: flex; align-items: center; gap: 0.25rem; flex-wrap: wrap; }
.breadcrumb-item { font-size: 0.85rem; color: #64748b; text-transform: capitalize; }
.separator { color: #94a3b8; margin: 0 0.15rem; }
.dropdown-menu { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); min-width: 200px; z-index: 100; padding: 0.35rem 0; }
.dropdown-item { padding: 0.5rem 1rem; font-size: 0.85rem; color: #334155; cursor: pointer; }
.dropdown-item.disabled { color: #94a3b8; font-size: 0.8rem; cursor: default; }
.dropdown-item:not(.disabled):hover { background: #f1f5f9; }
.dropdown-menu hr { margin: 0.25rem 0; border: 0; border-top: 1px solid #e2e8f0; }
.dark-toggle { background: none; border: none; color: #94a3b8; cursor: pointer; padding: 0.35rem; border-radius: 6px; display: flex; align-items: center; }
.dark-toggle:hover { background: #f1f5f9; color: #475569; }
.theme-selector { position: relative; cursor: pointer; color: #94a3b8; padding: 0.35rem; border-radius: 6px; display: flex; align-items: center; }
.theme-selector:hover { background: #f1f5f9; color: #475569; }
.theme-dropdown { position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: #fff; border: 1px solid #e2e8f0; border-radius: 8px; box-shadow: 0 4px 16px rgba(0,0,0,0.1); min-width: 180px; z-index: 100; padding: 0.25rem 0; }
.theme-item { padding: 0.4rem 0.75rem; font-size: 0.82rem; cursor: pointer; color: #475569; }
.theme-item:hover { background: #f1f5f9; }
.theme-item.active { color: #2563eb; font-weight: 600; }
.switch-hint { font-size: 0.7rem; opacity: 0.6; }
.biz-list { border-top: 1px solid #e2e8f0; padding: 0.25rem 0; }
.biz-item { padding: 0.4rem 1rem; font-size: 0.8rem; cursor: pointer; color: #475569; }
.biz-item:hover { background: #f1f5f9; }
.biz-item.active { color: #2563eb; font-weight: 600; }
@media (max-width: 768px) { .mobile-toggle { display: block; } }
</style>
