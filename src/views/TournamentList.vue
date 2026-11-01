<template>
  <div>
    <div class="filter-bar zs-card">
      <el-select v-model="filters.year" placeholder="年份" clearable class="w-year">
        <el-option
          v-for="y in options.years"
          :key="y"
          :label="y + ' 年'"
          :value="String(y)"
        />
      </el-select>
      <el-select v-model="filters.region" placeholder="地区" clearable class="w-region">
        <el-option v-for="r in options.regions" :key="r" :label="r" :value="r" />
      </el-select>
      <el-select v-model="filters.status" placeholder="状态" clearable class="w-status">
        <el-option label="未开始" value="UPCOMING" />
        <el-option label="进行中" value="ONGOING" />
        <el-option label="已结束" value="ENDED" />
      </el-select>
      <el-input
        v-model="filters.q"
        placeholder="搜索赛事名称"
        clearable
        class="w-search"
        @keyup.enter="load"
      />
      <el-button type="primary" @click="load">查询</el-button>
      <span class="count">共 {{ count }} 项赛事</span>
    </div>

    <div v-loading="loading" class="grid">
      <div
        v-for="item in list"
        :key="item.id"
        class="event-card zs-card"
        @click="$emit('open', item.id)"
      >
        <div class="event-head">
          <img
            v-if="item.image_url"
            class="event-logo"
            :src="item.image_url"
            :alt="item.name"
            loading="lazy"
            @error="$event.target.style.display = 'none'"
          />
          <div v-else class="event-logo event-logo--empty">P</div>
          <div class="event-title">
            <h3 :title="item.name">{{ shortName(item.name) }}</h3>
            <p class="event-full" :title="item.name">{{ item.name }}</p>
            <div class="event-tags">
              <el-tag size="small" effect="plain">{{ cnRegion(item.region) }}</el-tag>
              <el-tag size="small" :type="STATUS_TYPE[item.status] || 'info'" effect="light">
                {{ STATUS_TEXT[item.status] || item.status }}
              </el-tag>
            </div>
          </div>
        </div>

        <div class="event-meta">
          <div class="meta-row">
            <span class="meta-label">奖金</span>
            <span class="prize">
              <span class="prize-main">{{ cnPrize(item.prize).main }}</span>
              <span v-if="cnPrize(item.prize).sub" class="prize-sub">{{ cnPrize(item.prize).sub }}</span>
            </span>
          </div>
          <div class="meta-row">
            <span class="meta-label">举办地</span>
            <span>{{ cnLocation(item.location) }}</span>
          </div>
          <div class="meta-row">
            <span class="meta-label">时间</span>
            <span>{{ formatDate(item.started_at) }} ~ {{ formatDate(item.ended_at) }}</span>
          </div>
        </div>
      </div>
    </div>

    <el-empty
      v-if="!loading && !list.length"
      description="没有符合条件的赛事，试试调整筛选条件"
    />
  </div>
</template>

<script setup>
import { reactive, ref, onMounted, nextTick } from 'vue'
import { ElMessage } from 'element-plus'
import {
  api,
  formatDate,
  shortName,
  cnRegion,
  cnLocation,
  cnPrize,
  STATUS_TEXT,
  STATUS_TYPE,
} from '../api'

defineEmits(['open'])

const props = defineProps({
  // 从详情页返回时要恢复的滚动位置
  restoreScroll: { type: Number, default: 0 },
})

const loading = ref(false)
const list = ref([])
const count = ref(0)
const options = reactive({ years: [], regions: [] })
const filters = reactive({ year: '', region: '', status: '', q: '' })

async function load() {
  loading.value = true
  try {
    const data = await api.tournaments(filters)
    list.value = data.results
    count.value = data.count
  } catch (err) {
    ElMessage.error(err.message)
  } finally {
    loading.value = false
  }
}

async function loadFilters() {
  try {
    const data = await api.filters()
    options.years = data.years
    options.regions = data.regions
  } catch (err) {
    /* 筛选器失败不阻断主流程 */
  }
}

onMounted(async () => {
  await loadFilters()
  await load()
  // 从详情页返回：等卡片渲染完再滚回原来的位置
  if (props.restoreScroll > 0) {
    await nextTick()
    requestAnimationFrame(() => {
      window.scrollTo({ top: props.restoreScroll, behavior: 'auto' })
    })
  }
})
</script>

<style scoped>
.filter-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 16px 18px;
  margin-bottom: 22px;
}

.w-year {
  width: 120px;
}
.w-region {
  width: 130px;
}
.w-status {
  width: 130px;
}
.w-search {
  width: 220px;
}

.count {
  margin-left: auto;
  font-size: 13px;
  color: var(--zs-sub);
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
  gap: 18px;
  min-height: 120px;
}

.event-card {
  padding: 20px;
  cursor: pointer;
  transition: transform 0.16s ease, box-shadow 0.16s ease;
}

.event-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 28px rgba(16, 24, 40, 0.12);
}

.event-head {
  display: flex;
  gap: 14px;
  align-items: center;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--zs-border);
}

.event-logo {
  width: 52px;
  height: 52px;
  border-radius: 12px;
  object-fit: contain;
  background: #1e293b;
  border: 1px solid rgba(255, 255, 255, 0.12);
  padding: 4px;
  flex-shrink: 0;
}

.event-logo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: #cbd5e1;
}

.event-title {
  min-width: 0;
  flex: 1;
}

.event-title h3 {
  margin: 0 0 8px;
  font-size: 15px;
  font-weight: 600;
  line-height: 1.35;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.event-full {
  margin: 0 0 8px;
  font-size: 11.5px;
  color: var(--zs-sub);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.event-tags {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.event-meta {
  padding-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  color: #374151;
}

.meta-row {
  display: flex;
  gap: 10px;
}

.prize {
  display: flex;
  flex-direction: column;
  line-height: 1.35;
}

.prize-sub {
  font-size: 11px;
  color: var(--zs-sub);
  margin-top: 1px;
  white-space: nowrap;
}

.meta-label {
  width: 52px;
  flex-shrink: 0;
  color: var(--zs-sub);
}

@media (max-width: 720px) {
  .grid {
    grid-template-columns: 1fr;
  }
  .w-search {
    width: 100%;
  }
  .count {
    margin-left: 0;
  }
}
</style>
