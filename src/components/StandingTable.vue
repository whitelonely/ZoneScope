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
          <span v-if="row.wwcd" class="wwcd"><svg class="wwcd-icon" viewBox="0 0 1000 1000" aria-hidden="true"><path d="M110 770 L860 770 L730 850 L710 870 L270 870 L250 850 Z" fill="#d9c3a0" /><path d="M500 370 C392 372 300 430 210 540 C168 592 162 660 200 740 L750 740 C742 700 700 690 660 660 C600 612 566 520 552 440 C544 396 524 372 500 370 Z" fill="#d97706" /><path d="M662 740 C640 660 626 540 640 440 C650 380 700 356 736 402 C770 460 800 600 812 700 C800 736 730 752 662 740 Z" fill="#b45309" /><path d="M620 372 L664 244" stroke="#cbd5e1" stroke-width="30" stroke-linecap="round" /><circle cx="690" cy="206" r="34" fill="#cbd5e1" /><circle cx="650" cy="222" r="28" fill="#cbd5e1" /><path d="M700 336 L784 258" stroke="#cbd5e1" stroke-width="30" stroke-linecap="round" /><circle cx="818" cy="240" r="34" fill="#cbd5e1" /><circle cx="778" cy="222" r="28" fill="#cbd5e1" /></svg><span class="wwcd-num">{{ row.wwcd }}</span></span>
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
