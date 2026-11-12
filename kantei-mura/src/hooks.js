import { useEffect, useState } from 'react'
import { containsHan, loadStrokeTable } from './fortune'

// 生年月日などはブラウザ内(localStorage)にだけ保存し、次回の入力を省略する。
export function useStoredState(key, initial) {
  const [value, setValue] = useState(() => {
    try {
      return window.localStorage.getItem(key) ?? initial
    } catch {
      return initial
    }
  })
  const update = (next) => {
    setValue(next)
    try {
      window.localStorage.setItem(key, next)
    } catch {
      // 保存できない環境(プライベートモード等)では無視
    }
  }
  return [value, update]
}

// 漢字の名前が入っていたら画数表を読み込む。読み込み中は false。
export function useStrokesReady(...names) {
  const needed = names.some((n) => containsHan(n))
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    if (!needed || loaded) return
    let alive = true
    loadStrokeTable().then(() => alive && setLoaded(true))
    return () => {
      alive = false
    }
  }, [needed, loaded])
  return !needed || loaded
}

export function formatLongDate(locale, year, month, day) {
  return new Intl.DateTimeFormat(locale, { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(new Date(Date.UTC(year, month - 1, day)))
}