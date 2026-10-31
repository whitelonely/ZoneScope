<template>
  <div class="standing-table">
    <el-table
      :data="rows"
      size="default"
      stripe
      :header-cell-style="headerStyle"
      :cell-style="cellStyle"
      empty-text="暂无比赛数据"
    >
      <el-table-column label="#" width="64" align="center">
        <template #default="{ row }">
          <span :class="['rank', rankClass(row.rank)]">{{ row.rank }}</span>
        </template>
      </el-table-column>

      <el-table-column label="战队" min-width="220">
        <template #default="{ row }">
          <div class="team">
            <img
              v-if="row.team_image_url"
              class="team-logo"
              :src="row.team_image_url"
              :alt="row.team_name"
              loading="lazy"
            />
            <div v-else class="team-logo team-logo--empty">
              {{ (row.team_name || '?').slice(0, 1) }}
            </div>
            <span class="team-name">{{ row.team_name }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column label="吃鸡数" width="96" align="center">
        <template #default="{ row }">
          <span v-if="row.wwcd" class="wwcd"><svg class="wwcd-icon" viewBox="0 0 48 48" aria-hidden="true"><defs><mask id="SVGsu61zeEj"><g fill="none"><path stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M4 36h40l-5 8H9z"/><path fill="#fff" stroke="#fff" stroke-linecap="round" stroke-linejoin="round" stroke-width="4" d="M11 30v6h26v-5c0-6-3-8-3-8c2-2.5 3-6 0-8s-5.5 0-7 2c0 0-16-2-16 13"/><path stroke="#000" stroke-linecap="round" stroke-width="4" d="M21 24s-1 .5-2 2s-1 3-1 3"/><path stroke="#fff" stroke-width="4" d="m39 9l-5 6"/><circle cx="38.356" cy="7.483" r="2.5" fill="#fff" transform="rotate(35.072 38.356 7.483)"/><circle cx="40.811" cy="9.206" r="2.5" fill="#fff" transform="rotate(35.072 40.81 9.206)"/></g></mask></defs><path fill="currentColor" d="M0 0h48v48H0z" mask="url(#SVGsu61zeEj)"/></svg><span class="wwcd-num">{{ row.wwcd }}</span></span>
          <span v-else class="muted">—</span>
        </template>
      </el-table-column>

      <el-table-column label="排名分" prop="place_score" width="88" align="center" />

      <el-table-column label="淘汰分" prop="kills" width="88" align="center" />

      <el-table-column label="总积分" width="96" align="center">
        <template #default="{ row }">
          <span class="score-total">{{ row.total_score }}</span>
        </template>
      </el-table-column>
    </el-table>
  </div>
</template>

<script setup>
defineProps({
  rows: { type: Array, default: () => [] },
})

const headerStyle = {
  background: '#f8fafc',
  color: '#475569',
  fontWeight: '600',
  fontSize: '12.5px',
  borderBottom: '1px solid #e5e7eb',
}

const cellStyle = {
  padding: '10px 0',
}

function rankClass(rank) {
  if (rank === 1) return 'rank--gold'
  if (rank === 2) return 'rank--silver'
  if (rank === 3) return 'rank--bronze'
  return ''
}
</script>

<style scoped>
.standing-table {
  width: 100%;
}

.rank {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  height: 26px;
  padding: 0 6px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 13px;
  color: #475569;
  background: #f1f5f9;
}

.rank--gold {
  background: #fef3c7;
  color: #b45309;
}

.rank--silver {
  background: #e2e8f0;
  color: #475569;
}

.rank--bronze {
  background: #fde8d7;
  color: #b45309;
}

.team {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
}

.team-logo {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  object-fit: contain;
  background: #f8fafc;
  border: 1px solid var(--zs-border);
  padding: 3px;
  flex-shrink: 0;
}

.team-logo--empty {
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  color: var(--zs-sub);
}

.team-name {
  font-weight: 500;
  color: var(--zs-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.score-total {
  font-size: 16px;
  font-weight: 700;
  color: #b45309;
}

.wwcd {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 13px;
  font-weight: 600;
  color: #b45309;
}

.wwcd-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: #d97706;
}

.muted {
  color: #cbd5e1;
}
</style>
