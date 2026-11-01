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
      <TournamentList
        v-if="view === 'list'"
        :restore-scroll="listScroll"
        @open="openTournament"
      />
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
import { api } from './api'
import TournamentList from './views/TournamentList.vue'
import TournamentDetail from './views/TournamentDetail.vue'

const view = ref('list')
const currentId = ref('')
// 进详情前记下列表滚到哪了，返回时原样恢复，免得重新往下翻
const listScroll = ref(0)

// 地址栏用赛事名（2026-pgs-11）而不是 op.gg 的数字 id。
// 老链接里还是数字 id，这里做一下兼容。
async function resolveId(token) {
  if (/^\d+$/.test(token)) return token
  try {
    const data = await api.tournaments({})
    const hit = (data.results || []).find((item) => item.slug === token)
    if (hit) return hit.id
  } catch (err) {
    /* 解析失败就按原样交给详情页，由它提示错误 */
  }
  return token
}

function openTournament(item) {
  const id = typeof item === 'string' ? item : item.id
  const slug = typeof item === 'string' ? item : item.slug || item.id
  listScroll.value = window.scrollY
  currentId.value = id
  view.value = 'detail'
  history.pushState({ zone: 'detail', id, slug }, '', `#/tournament/${slug}`)
  window.scrollTo({ top: 0 })
}

function goList(push = true) {
  view.value = 'list'
  currentId.value = ''
  if (push) history.pushState({ zone: 'list' }, '', '#/')
  // 滚动位置交给 TournamentList，在列表数据渲染完之后恢复
}

function onPopState(event) {
  const state = event.state
  if (state && state.zone === 'detail') {
    currentId.value = state.id
    view.value = 'detail'
  } else {
    // 浏览器后退回到列表：同样恢复离开时的滚动位置
    goList(false)
  }
}

onMounted(async () => {
  window.addEventListener('popstate', onPopState)
  const match = /#\/tournament\/([^/?#]+)/.exec(window.location.hash)
  if (match) {
    currentId.value = await resolveId(decodeURIComponent(match[1]))
    view.value = 'detail'
  } else {
    history.replaceState({ zone: 'list' }, '', '#/')
  }
})

onBeforeUnmount(() => window.removeEventListener('popstate', onPopState))
</script>
