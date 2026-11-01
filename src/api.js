// 数据源切换：
//   开发/自建服务器 -> 走 Django API（默认）
//   静态部署（Vercel）-> 构建时设置 VITE_DATA_SOURCE=static，改读 public/data 下的 JSON
const STATIC_MODE = import.meta.env.VITE_DATA_SOURCE === 'static'
const STATIC_BASE = (import.meta.env.BASE_URL || '/') + 'data'

const BASE = '/api'

async function request(path, params) {
  const url = new URL(BASE + path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        url.searchParams.set(key, value)
      }
    })
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error('接口请求失败：HTTP ' + res.status)
  return res.json()
}

let indexCache = null

async function loadIndex() {
  if (!indexCache) {
    const res = await fetch(`${STATIC_BASE}/index.json`)
    if (!res.ok) throw new Error('静态数据缺失：先执行 python manage.py export_static')
    indexCache = await res.json()
  }
  return indexCache
}

export const api = {
  staticMode: STATIC_MODE,

  filters: async () => {
    if (!STATIC_MODE) return request('/filters/')
    const idx = await loadIndex()
    return { regions: idx.regions || [], years: idx.years || [] }
  },

  tournaments: async (params = {}) => {
    if (!STATIC_MODE) return request('/tournaments/', params)
    const idx = await loadIndex()
    let rows = idx.results || []
    if (params.year) {
      rows = rows.filter((r) => r.started_at && String(new Date(r.started_at).getFullYear()) === String(params.year))
    }
    if (params.region) {
      rows = rows.filter((r) => String(r.region || '').toUpperCase() === String(params.region).toUpperCase())
    }
    if (params.status) {
      rows = rows.filter((r) => String(r.status || '').toUpperCase() === String(params.status).toUpperCase())
    }
    if (params.q) {
      const q = String(params.q).toLowerCase()
      rows = rows.filter(
        (r) =>
          String(r.name || '').toLowerCase().includes(q) ||
          shortName(r.name).toLowerCase().includes(q),
      )
    }
    return { count: rows.length, results: rows }
  },

  tournament: async (id) => {
    if (!STATIC_MODE) return request(`/tournaments/${id}/`)
    const res = await fetch(`${STATIC_BASE}/tournaments/${id}.json`)
    if (!res.ok) throw new Error('赛事数据缺失：' + id)
    return res.json()
  },

  stage: async (id) => {
    if (!STATIC_MODE) return request(`/stages/${id}/`)
    throw new Error('静态模式下阶段数据随赛事 JSON 一起加载')
  },
}

export function formatDate(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function formatDateTime(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const p = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}`
}

export const STATUS_TEXT = {
  UPCOMING: '未开始',
  ONGOING: '进行中',
  ENDED: '已结束',
}

export const STATUS_TYPE = {
  UPCOMING: 'info',
  ONGOING: 'warning',
  ENDED: 'success',
}

/* ---------- 中文化与简称 ---------- */

const SERIES_ABBR = [
  [/PUBG\s+Global\s+Series/gi, 'PGS'],
  [/PUBG\s+Global\s+Championship/gi, 'PGC'],
  [/PUBG\s+Champions\s+League/gi, 'PCL'],
  [/Esports\s+World\s+Cup/gi, 'EWC'],
  [/PUBG\s+Nations\s+Cup/gi, 'PNC'],
  [/\bSpring\b/gi, '春季赛'],
  [/\bSummer\b/gi, '夏季赛'],
  [/\bFall\b/gi, '秋季赛'],
  [/\bAutumn\b/gi, '秋季赛'],
  [/\bWinter\b/gi, '冬季赛'],
]

export function shortName(name) {
  let s = String(name || '')
  SERIES_ABBR.forEach(([re, abbr]) => {
    s = s.replace(re, abbr)
  })
  s = s.replace(/\s+/g, ' ').trim()
  // 年份提到最前面，跟其它赛事统一：PCL 2026 秋季赛 -> 2026 PCL 秋季赛
  s = s.replace(/^PCL\s+(20\d{2})\s*(.*)$/, '$1 PCL $2').trim()
  return s
}

const REGION_CN = {
  GLOBAL: '全球性赛事',
  CN: '中国区赛事',
  ASIA: '亚洲赛区',
  APAC: '亚太赛区',
  KR: '韩国赛区',
  JP: '日本赛区',
  SEA: '东南亚赛区',
  NA: '北美赛区',
  EU: '欧洲赛区',
  EMEA: '欧洲中东非洲赛区',
  AMERICAS: '美洲赛区',
}

export function cnRegion(region) {
  const key = String(region || '').toUpperCase()
  return REGION_CN[key] || region || '—'
}

const TYPE_CN = {
  INTERNATIONAL: '国际赛事',
  MAJOR: '大型赛事',
  REGIONAL: '区域赛事',
}

export function cnType(type) {
  const key = String(type || '').toUpperCase()
  return TYPE_CN[key] || type || '—'
}

const COUNTRY_CN = {
  CHINA: '中国',
  KOREA: '韩国',
  'SOUTH KOREA': '韩国',
  JAPAN: '日本',
  FRANCE: '法国',
  GERMANY: '德国',
  'TÜRKIYE': '土耳其',
  TURKEY: '土耳其',
  USA: '美国',
  'UNITED STATES': '美国',
  THAILAND: '泰国',
  VIETNAM: '越南',
  SWEDEN: '瑞典',
  MALAYSIA: '马来西亚',
  'SAUDI ARABIA': '沙特阿拉伯',
  'UNITED KINGDOM': '英国',
  SPAIN: '西班牙',
  ITALY: '意大利',
  POLAND: '波兰',
  BRAZIL: '巴西',
  CANADA: '加拿大',
  AUSTRALIA: '澳大利亚',
  INDONESIA: '印度尼西亚',
  PHILIPPINES: '菲律宾',
  SINGAPORE: '新加坡',
  ONLINE: '线上',
}

const CITY_CN = {
  SEOUL: '首尔',
  SHANGHAI: '上海',
  BEIJING: '北京',
  CHENGDU: '成都',
  PARIS: '巴黎',
  ISTANBUL: '伊斯坦布尔',
  BERLIN: '柏林',
  BANGKOK: '曼谷',
  RIYADH: '利雅得',
  DUBAI: '迪拜',
  TOKYO: '东京',
  OSAKA: '大阪',
  LONDON: '伦敦',
  MADRID: '马德里',
  MILAN: '米兰',
  WARSAW: '华沙',
  'SÃO PAULO': '圣保罗',
  TORONTO: '多伦多',
  SYDNEY: '悉尼',
  JAKARTA: '雅加达',
  MANILA: '马尼拉',
  SINGAPORE: '新加坡',
  'KUALA LUMPUR': '吉隆坡',
  HANOI: '河内',
  'HO CHI MINH CITY': '胡志明市',
  STOCKHOLM: '斯德哥尔摩',
}

export function cnLocation(location) {
  if (!location) return '—'
  const parts = String(location)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  if (parts.length === 1) {
    const only = parts[0].toUpperCase()
    return COUNTRY_CN[only] || CITY_CN[only] || parts[0]
  }
  const city = parts[0]
  const country = parts.slice(1).join(', ')
  const countryCn = COUNTRY_CN[country.toUpperCase()] || country
  const cityCn = CITY_CN[city.toUpperCase()] || city
  return `${countryCn} ▪ ${cityCn}`
}

const STAGE_RULES = [
  [/OVERALL|SUMMARY|TOTAL/i, '总览'],
  [/SEMI[\s-]*FINALS?/i, '半决赛'],
  [/QUARTER[\s-]*FINALS?/i, '四分之一决赛'],
  [/GRAND[\s-]*FINALS?/i, '总决赛'],
  [/FINAL/i, '总决赛'],
  [/PLAY[\s-]*IN/i, '入围赛'],
  [/QUALIFIER|QUALIFY/i, '预选赛'],
  [/LOWER[\s-]*BRACKET|LOSERS?/i, '败者组'],
  [/WINNERS?/i, '胜者组'],
  [/SURVIVAL/i, '突围组'],
  [/SWISS/i, '瑞士轮'],
  [/KNOCK[\s-]*OUT/i, '淘汰赛'],
  [/RELEGATION/i, '保级赛'],
  [/GROUP/i, '小组赛'],
  [/REGULAR/i, '常规赛'],
  [/A[\s-]*STAGE/i, 'A 组阶段'],
  [/B[\s-]*STAGE/i, 'B 组阶段'],
  [/S[\s-]*STAGE/i, 'S 组阶段'],
]

export function cnStage(name) {
  if (!name) return ''
  let s = String(name).toUpperCase().trim()

  let day = ''
  const dayMatch = /\s*DAY\s*(\d+)$/.exec(s)
  if (dayMatch) {
    day = `第${dayMatch[1]}天`
    s = s.slice(0, dayMatch.index).trim()
  }

  if (/^[A-Z](?:\/[A-Z])+$/.test(s)) {
    const label = s.replace(/\//g, '、') + ' 组'
    return day ? `${label} ${day}` : label
  }

  let base = s
  for (const [pattern, label] of STAGE_RULES) {
    if (pattern.test(s)) {
      base = label
      break
    }
  }

  const groups = s.match(/\b[A-Z]\/[A-Z]\b/g)
  if (groups && base !== s) {
    base += ' ' + groups.map((g) => g.replace('/', '、')).join('、') + ' 组'
  }

  if (!base) return day
  return day ? `${base} ${day}` : base
}

/* ---------- 奖金额中文化：$300,000 -> 30 万美元（附原始文本） ---------- */
export function cnPrize(raw) {
  if (!raw) return { main: '—', sub: '' }
  const text = String(raw).trim()
  const m = /([$¥€£])?\s*([\d,]+)/.exec(text)
  if (!m) return { main: text, sub: '' }
  const symbol = m[1] || ''
  const value = Number(m[2].replace(/,/g, ''))
  if (!Number.isFinite(value) || value <= 0) return { main: text, sub: '' }
  const unit =
    symbol === '¥' ? '元' : symbol === '€' ? '欧元' : symbol === '£' ? '英镑' : '美元'
  let main
  if (value >= 10000) {
    const wan = value / 10000
    const pretty = Number.isInteger(wan) ? String(wan) : wan.toFixed(1).replace(/\.0$/, '')
    main = `${pretty} 万${unit}`
  } else {
    main = `${value.toLocaleString('en-US')} ${unit}`
  }
  return { main, sub: text }
}

/* ---------- 场次与地图中文化 ---------- */
const CN_NUM = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十']

function cnNumber(n) {
  if (n <= 10) return CN_NUM[n]
  if (n < 20) return '十' + CN_NUM[n - 10]
  if (n < 100) {
    const tens = Math.floor(n / 10)
    const ones = n % 10
    return CN_NUM[tens] + '十' + (ones ? CN_NUM[ones] : '')
  }
  return String(n)
}

/** MATCH 1 -> 第一场（MATCH 1） */
export function cnMatch(name) {
  if (!name) return ''
  const text = String(name).trim()
  const m = /^MATCH\s*(\d+)$/i.exec(text)
  if (!m) return text
  return `第${cnNumber(Number(m[1]))}场（${text}）`
}

const MAP_CN = {
  ERANGEL: '艾伦格',
  MIRAMAR: '米拉玛',
  SANHOK: '萨诺',
  VIKENDI: '维寒迪',
  TAEGO: '泰戈',
  RONDO: '荣都',
  KARAKIN: '卡拉金',
  PARAMO: '帕拉莫',
  HAVEN: '避难所',
  DESTON: '德斯顿',
  SAVAGE: '萨诺',
}

/** ERANGEL -> 艾伦格（ERANGEL） */
export function cnMap(map) {
  if (!map) return '未知地图'
  const key = String(map).toUpperCase().trim()
  const cn = MAP_CN[key]
  return cn ? `${cn}（${key}）` : map
}
