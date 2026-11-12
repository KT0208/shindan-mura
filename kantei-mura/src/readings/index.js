// 追加の鑑定ページの一覧(URLの #/〇〇 → ページ)
import {
  AngelPage, CelticPage, ChartPage, EnmusubiPage, EtoPage, KinunPage, KyuseiPage, MamoriPage, MonthPage, MoonPage,
  PastLifePage, PendulumPage, RunePage, TarotPage, ZodiacPage,
} from './ReadingPages'

export const READING_PAGES = {
  enmusubi: EnmusubiPage,
  kinun: KinunPage,
  chart: ChartPage,
  month: MonthPage,
  angel: AngelPage,
  mamori: MamoriPage,
  kyusei: KyuseiPage,
  eto: EtoPage,
  zodiac: ZodiacPage,
  moon: MoonPage,
  celtic: CelticPage,
  tarot: TarotPage,
  rune: RunePage,
  pendulum: PendulumPage,
  pastlife: PastLifePage,
}
