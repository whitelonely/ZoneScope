<template>
  <div class="app">
    <header class="app-header">
      <div class="brand" @click="goList">
        <div class="brand-logo">ZS</div>
        <div class="brand-text">
          <h1>ZoneScope</h1>
          <p>PUBG 赛事数据工具</p>
        </div>
      </div>
    </header>

    <main class="app-main">
      <TournamentList v-if="view === 'list'" @open="openTournament" />
      <TournamentDetail
        v-else
        :tournament-id="currentId"
        @back="goList"
      />
    </main>

    <footer class="app-footer">Copyright © 2026 ZoneScope · PUBG 赛事数据工具 | @KAI</footer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import TournamentList from './views/TournamentList.vue'
import TournamentDetail from './views/TournamentDetail.vue'

const view = ref('list')
const currentId = ref('')

function openTournament(id) {
  currentId.value = id
  view.value = 'detail'
  history.pushState({ zone: 'detail', id }, '', `#/tournament/${id}`)
  window.scrollTo({ top: 0 })
}

function goList(push = true) {
  view.value = 'list'
  currentId.value = ''
  if (push) history.pushState({ zone: 'list' }, '', '#/')
  window.scrollTo({ top: 0 })
}

function onPopState(event) {
  const state = event.state
  if (state && state.zone === 'detail') {
    currentId.value = state.id
    view.value = 'detail'
  } else {
    goList(false)
  }
}

onMounted(() => {
  window.addEventListener('popstate', onPopState)
  const match = /#\/tournament\/(\w+)/.exec(window.location.hash)
  if (match) {
    currentId.value = match[1]
    view.value = 'detail'
  } else {
    history.replaceState({ zone: 'list' }, '', '#/')
  }
})

onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))
</script>
