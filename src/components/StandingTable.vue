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
          <span v-if="row.wwcd" class="wwcd"><svg class="wwcd-icon" viewBox="0 0 24 24" aria-hidden="true"><defs><linearGradient id="zsRoast" x1="0.15" y1="0" x2="0.85" y2="1"><stop offset="0" stop-color="#fcd34d" /><stop offset="0.5" stop-color="#d97706" /><stop offset="1" stop-color="#9a3412" /></linearGradient></defs><ellipse cx="12" cy="20.4" rx="10.3" ry="2.9" fill="#e2e8f0" /><ellipse cx="12" cy="19.7" rx="7.9" ry="1.9" fill="#f8fafc" /><path d="M8.7 11.6 6.3 7.4" stroke="#b45309" stroke-width="2.7" stroke-linecap="round" /><circle cx="5.9" cy="6.5" r="1.7" fill="#f8fafc" /><path d="M15.3 11.6 17.7 7.4" stroke="#b45309" stroke-width="2.7" stroke-linecap="round" /><circle cx="18.1" cy="6.5" r="1.7" fill="#f8fafc" /><ellipse cx="12" cy="14.2" rx="7.2" ry="5.3" fill="url(#zsRoast)" /><ellipse cx="9.4" cy="11.9" rx="2.8" ry="1.7" fill="#fde68a" opacity="0.6" transform="rotate(-20 9.4 11.9)" /><path d="M8.2 16.6c1.9 1.2 4.2 1.3 6.1 0.3" stroke="#7c2d12" stroke-width="1" fill="none" stroke-linecap="round" opacity="0.45" /><path d="M13.6 11.2c1.3 0.4 2.2 1.1 2.6 2" stroke="#fbbf24" stroke-width="0.9" fill="none" stroke-linecap="round" opacity="0.7" /></svg><span class="wwcd-num">{{ row.wwcd }}</span></span>
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
