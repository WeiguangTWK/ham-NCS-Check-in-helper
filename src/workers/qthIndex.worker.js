import { pinyin } from 'pinyin-pro'

const normalize = (value) => String(value || '').normalize('NFKC').toLowerCase().replace(/\s+/g, '')
const byCallsign = new Map()
const searchCache = new Map()

const publish = () => {
  const counts = new Map()
  for (const values of byCallsign.values()) {
    for (const value of values) counts.set(value, (counts.get(value) || 0) + 1)
  }
  const entries = [...counts].map(([value, count]) => {
    if (!searchCache.has(value)) searchCache.set(value, {
      value,
      text: normalize(value),
      initials: normalize(pinyin(value, { pattern: 'first', toneType: 'none', nonZh: 'removed', type: 'array' }).join('')),
      full: normalize(pinyin(value, { toneType: 'none', nonZh: 'removed', type: 'array' }).join(''))
    })
    return { ...searchCache.get(value), count }
  }).sort((a, b) => b.count - a.count)
  postMessage(entries)
}

let timer
onmessage = ({ data }) => {
  if (data.type === 'replace') {
    byCallsign.clear()
    for (const profile of data.profiles) byCallsign.set(profile.callsign, profile.values)
  } else if (data.type === 'put') {
    byCallsign.set(data.callsign, data.values)
  }
  clearTimeout(timer)
  timer = setTimeout(publish, data.type === 'replace' ? 0 : 100)
}
