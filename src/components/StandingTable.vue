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
          <span v-if="row.wwcd" class="wwcd"><svg class="wwcd-icon" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="18.2" width="20" height="2.9" rx="1.3" fill="#d9c3a0" /><path d="M5.2 18.3 C4.3 17.6 4.5 16.3 5.6 15.3 L15.4 9.5 C16.3 9.0 17.3 9.2 17.8 10.0 L18.5 17.0 C18.7 17.9 18.0 18.6 17.0 18.6 Z" fill="#d97706" /><ellipse cx="15.3" cy="9.9" rx="3.7" ry="2.7" fill="#b45309" transform="rotate(-38 15.3 9.9)" /><line x1="17.9" y1="7.7" x2="19.6" y2="6.0" stroke="#cbd5e1" stroke-width="1.4" stroke-linecap="round" /><circle cx="20.6" cy="6.9" r="1.3" fill="#cbd5e1" /><circle cx="18.6" cy="5.1" r="1.3" fill="#cbd5e1" /></svg><span class="wwcd-num">{{ row.wwcd }}</span></span>
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
  width: 17px;
  height: 17px;
  flex-shrink: 0;
}

.muted {
  color: #cbd5e1;
}
</style>
