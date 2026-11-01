<template>
  <div v-loading="loading">
    <div class="back-row">
      <el-button link @click="$emit('back')">← 返回赛事列表</el-button>
    </div>

    <div v-if="tournament" class="hero zs-card">
      <img
        v-if="tournament.image_url"
        class="hero-img"
        :src="tournament.image_url"
        :alt="tournament.name"
        @error="$event.target.style.display = 'none'"
      />
      <div class="hero-body">
        <div class="hero-title">
          <h2>{{ shortName(tournament.name) }}</h2>
          <el-tag :type="STATUS_TYPE[tournament.status] || 'info'" effect="light">
            {{ STATUS_TEXT[tournament.status] || tournament.status }}
          </el-tag>
        </div>
        <p v-if="tournament.name !== shortName(tournament.name)" class="hero-full">
          {{ tournament.name }}
        </p>
        <div class="hero-meta">
          <span class="chip">
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2" /><ellipse cx="8" cy="8" rx="2.6" ry="6.2" /><line x1="1.8" y1="8" x2="14.2" y2="8" /></svg>{{ cnRegion(tournament.region) }}
          </span>
          <span class="chip">
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="6.2" /><path d="M9.9 5.9c-.4-.5-1.1-.8-1.9-.8-1.1 0-1.9.6-1.9 1.5s.8 1.3 1.9 1.5c1.1.2 1.9.6 1.9 1.5s-.8 1.5-1.9 1.5c-.8 0-1.5-.3-1.9-.8" /><line x1="8" y1="4" x2="8" y2="5" /><line x1="8" y1="11" x2="8" y2="12" /></svg>{{ cnPrize(tournament.prize).main }}<em
              v-if="cnPrize(tournament.prize).sub"
              class="chip-sub"
            >{{ cnPrize(tournament.prize).sub }}</em>
          </span>
          <span class="chip">
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><path d="M8 14s4.7-4.2 4.7-7.6a4.7 4.7 0 10-9.4 0C3.3 9.8 8 14 8 14z" /><circle cx="8" cy="6.4" r="1.7" /></svg>{{ cnLocation(tournament.location) }}
          </span>
          <span class="chip">
            <svg class="chip-icon" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round" stroke-linejoin="round"><rect x="2.3" y="3.5" width="11.4" height="10.2" rx="1.6" /><line x1="2.3" y1="6.7" x2="13.7" y2="6.7" /><line x1="5.5" y1="2" x2="5.5" y2="4.3" /><line x1="10.5" y1="2" x2="10.5" y2="4.3" /></svg>{{ formatDate(tournament.started_at) }} ~ {{ formatDate(tournament.ended_at) }}
          </span>
        </div>
      </div>
    </div>

    <div v-if="groups.length" class="stage-wrap">
      <el-tabs v-model="activeGroup" @tab-change="onGroupChange">
        <el-tab-pane
          v-for="group in groups"
          :key="group.id"
          :label="cnStage(group.name)"
          :name="String(group.id)"
        >
          <div class="stage-inner">
            <div v-if="group.stages.length > 1" class="stage-switch">
              <button
                type="button"
                class="stage-chip stage-chip--total"
                :class="{ active: activeStage === TOTAL_STAGE }"
                @click="selectTotal"
              >
                总积分
              </button>
              <button
                v-for="s in group.stages"
                :key="s.id"
                type="button"
                class="stage-chip"
                :class="{ active: String(s.id) === activeStage }"
                @click="selectStage(s.id)"
              >
                {{ cnStage(s.name) }}
              </button>
            </div>

            <div v-loading="stageLoading">
              <template v-if="stageData">
                <div class="zs-section">
                  <h3 class="zs-section-title">阶段总榜</h3>
                  <div class="zs-card table-wrap">
                    <StandingTable :rows="stageData.standings" />
                  </div>
                </div>

                <div class="zs-section">
                  <h3 class="zs-section-title">各局比赛</h3>
                  <el-collapse v-model="openMatches" class="match-collapse">
                    <el-collapse-item
                      v-for="match in stageData.matches"
                      :key="match.id"
                      :name="String(match.id)"
                    >
                      <template #title>
                        <div class="match-title">
                          <span class="match-name">{{ cnMatch(match.name) }}</span>
                          <el-tag size="small" effect="plain">{{ cnMap(match.map) }}</el-tag>
                          <span class="match-stat">
                            {{ match.standings.length }} 支队伍
                          </span>
                        </div>
                      </template>
                      <div v-if="openMatches.includes(String(match.id))" class="table-wrap">
                        <StandingTable :rows="match.standings" />
                      </div>
                    </el-collapse-item>
                  </el-collapse>
                </div>
              </template>

              <el-empty
                v-else-if="!stageLoading"
                description="该阶段暂无比赛数据"
              />
            </div>
          </div>
        </el-tab-pane>
      </el-tabs>
    </div>

    <el-empty v-else-if="!loading" description="该赛事暂无阶段数据" />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { ElMessage } from 'element-plus'
import {
  api,
  formatDate,
  shortName,
  cnRegion,
  cnLocation,
  cnPrize,
  cnStage,
  cnMatch,
  cnMap,
  STATUS_TEXT,
  STATUS_TYPE,
} from '../api'
import StandingTable from '../components/StandingTable.vue'

const props = defineProps({
  tournamentId: { type: String, required: true },
})
defineEmits(['back'])

const loading = ref(false)
const stageLoading = ref(false)
const tournament = ref(null)
const groups = ref([])
const activeGroup = ref('')
const activeStage = ref('')
const stageData = ref(null)
const openMatches = ref([])
const stageCache = ref(null)

// 阶段被拆成好几天（或小组赛 A/B/C 组）时，用一个虚拟阶段把它们的对局合起来算总积分
const TOTAL_STAGE = '__total__'

async function loadStage(stageId) {
  const key = String(stageId)
  const cached = stageCache.value && stageCache.value[key]
  if (cached) return cached
  const data = await api.stage(stageId)
  if (stageCache.value) stageCache.value[key] = data
  return data
}

function mergeStages(stageList) {
  const teams = new Map()
  const matches = []
  for (const data of stageList) {
    // 总计里的每局要能看出是哪一天 / 哪一组，所以带上阶段名前缀
    const prefix = data.stage && data.stage.name ? cnStage(data.stage.name) : ''
    for (const match of data.matches || []) {
      matches.push({
        ...match,
        id: `${data.stage.id}-${match.id}`,
        name: prefix ? `${prefix} · ${cnMatch(match.name)}` : cnMatch(match.name),
      })
      for (const row of match.standings || []) {
        const key = row.team_name
        let cur = teams.get(key)
        if (!cur) {
          cur = {
            rank: 0,
            team_name: key,
            team_image_url: row.team_image_url,
            total_score: 0,
            place_score: 0,
            kills: 0,
            wwcd: 0,
          }
          teams.set(key, cur)
        }
        cur.total_score += row.total_score || 0
        cur.place_score += row.place_score || 0
        cur.kills += row.kills || 0
        cur.wwcd += row.wwcd || 0
        if (!cur.team_image_url && row.team_image_url) cur.team_image_url = row.team_image_url
      }
    }
  }
  const standings = [...teams.values()].sort(
    (a, b) => b.total_score - a.total_score || b.wwcd - a.wwcd || b.kills - a.kills,
  )
  standings.forEach((row, index) => {
    row.rank = index + 1
  })
  return { standings, matches }
}

async function selectTotal() {
  const group = groups.value.find((g) => String(g.id) === activeGroup.value)
  if (!group || group.stages.length < 2) return
  activeStage.value = TOTAL_STAGE
  stageLoading.value = true
  openMatches.value = []
  try {
    const list = await Promise.all(group.stages.map((s) => loadStage(s.id)))
    stageData.value = mergeStages(list)
  } catch (err) {
    ElMessage.error(err.message)
    stageData.value = null
  } finally {
    stageLoading.value = false
  }
}

async function selectStage(stageId) {
  const group = groups.value.find((g) => String(g.id) === activeGroup.value)
  const stage = group && group.stages.find((s) => String(s.id) === String(stageId))
  if (!stage) {
    stageData.value = null
    return
  }
  activeStage.value = String(stage.id)

  const cached = stageCache.value && stageCache.value[String(stage.id)]
  if (cached) {
    stageData.value = cached
    // 各局比赛默认收起，想看再点开
    openMatches.value = []
    return
  }

  stageLoading.value = true
  try {
    const data = await loadStage(stage.id)
    stageData.value = data
    openMatches.value = []
  } catch (err) {
    ElMessage.error(err.message)
    stageData.value = null
  } finally {
    stageLoading.value = false
  }
}

function onGroupChange(name) {
  const group = groups.value.find((g) => String(g.id) === String(name))
  if (group && group.stages.length) {
    selectStage(group.stages[0].id)
  } else {
    stageData.value = null
  }
}

async function load() {
  loading.value = true
  try {
    const data = await api.tournament(props.tournamentId)
    tournament.value = data.tournament
    groups.value = data.groups
    stageCache.value = data.stages || null
    if (groups.value.length) {
      activeGroup.value = String(groups.value[0].id)
      await selectStage(groups.value[0].stages[0].id)
    }
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

onMounted(load)
watch(() => props.tournamentId, load)
</script>

<style scoped>
.back-row {
  margin-bottom: 14px;
}

.hero {
  display: flex;
  gap: 22px;
  padding: 22px;
  margin-bottom: 22px;
  align-items: center;
}

.hero-img {
  width: 104px;
  height: 104px;
  object-fit: contain;
  border-radius: 16px;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 8px;
  flex-shrink: 0;
}

.hero-body {
  min-width: 0;
  flex: 1;
}

.hero-title {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.hero-title h2 {
  margin: 0;
  font-size: 21px;
  font-weight: 700;
}

.hero-full {
  margin: -6px 0 12px;
  font-size: 12px;
  color: var(--zs-sub);
}

.hero-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.chip-icon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
  color: inherit;
}

.chip {
  font-size: 12.5px;
  color: #374151;
  background: #f1f5f9;
  border-radius: 999px;
  padding: 6px 12px;
}

.chip-sub {
  font-style: normal;
  font-size: 11px;
  color: var(--zs-sub);
  margin-left: 5px;
}

.stage-wrap {
  background: var(--zs-card);
  border-radius: var(--zs-radius);
  box-shadow: var(--zs-shadow);
  border: 1px solid var(--zs-border);
  padding: 8px 20px 22px;
}

.stage-inner {
  padding-top: 6px;
}

.stage-switch {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  overflow-y: hidden;
  padding: 2px 2px 8px;
  margin-bottom: 12px;
  scrollbar-width: thin;
  -webkit-overflow-scrolling: touch;
}

.stage-switch::-webkit-scrollbar {
  height: 6px;
}

.stage-switch::-webkit-scrollbar-thumb {
  background: #cbd5e1;
  border-radius: 3px;
}

.stage-switch::-webkit-scrollbar-track {
  background: transparent;
}

.stage-chip {
  flex: 0 0 auto;
  padding: 7px 12px;
  border-radius: 2px;
  border: 1px solid var(--zs-border);
  background: var(--zs-card);
  color: #374151;
  font-size: 13px;
  line-height: 1.2;
  white-space: nowrap;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s, background 0.15s;
}

.stage-chip:hover {
  border-color: var(--zs-primary);
  color: var(--zs-primary);
}

.stage-chip.active {
  background: var(--zs-primary);
  border-color: var(--zs-primary);
  color: #fff;
  font-weight: 600;
}

.stage-chip--total {
  margin-left: 4px;
  border-style: dashed;
  font-weight: 600;
}

.stage-chip--total.active {
  border-style: solid;
}

.table-wrap {
  padding: 4px 8px;
  overflow: hidden;
}

.match-collapse {
  border-top: none;
}

.match-title {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px 10px;
  padding: 4px 0;
  min-width: 0;
  width: 100%;
}

.match-name {
  font-weight: 600;
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.match-stat {
  margin-left: auto;
  margin-right: 6px;
  font-size: 12.5px;
  color: var(--zs-sub);
  white-space: nowrap;
  flex-shrink: 0;
}

@media (max-width: 640px) {
  .match-title {
    gap: 6px 8px;
    padding: 2px 0;
  }
  .match-name {
    flex: 1 1 100%;
    font-size: 13.5px;
  }
  .match-stat {
    margin-left: auto;
    margin-right: 4px;
  }
  :deep(.el-collapse-item__header) {
    padding: 0 2px;
    height: auto;
    min-height: 48px;
    align-items: center;
  }
}

:deep(.el-tabs__header) {
  margin-bottom: 18px;
}

:deep(.el-collapse-item__header) {
  padding: 0 4px;
}

:deep(.el-collapse-item__content) {
  padding-bottom: 14px;
}

@media (max-width: 720px) {
  .hero {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
  .hero-img {
    width: 80px;
    height: 80px;
  }
  .hero-title h2 {
    font-size: 18px;
  }
}
</style>
