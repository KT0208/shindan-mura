// サイト名・URLは .env で決める(名前を変えるときは .env だけ直せばよい)
export const SITE = {
  name: import.meta.env.VITE_SITE_NAME,
  nameLatin: import.meta.env.VITE_SITE_NAME_LATIN,
  // Cloudflare Turnstile(ロボットよけ)のサイトキー。空なら確認を出さない
  turnstileKey: import.meta.env.VITE_TURNSTILE_SITE_KEY || '',
  // 予約送信で指定できる最長の日数(サーバー側 config.php の schedule_max_days と合わせること)
  scheduleMaxDays: 365,
  // プラン。chapters = 章の数、extra = スライドショーだけに出る写真の枚数
  // (価格と枚数はサーバー側 server/api/lib.php・config.php と合わせること)
  plans: {
    standard: { label: 'スタンダード', price: 500, chapters: 3, extra: 0 },
    premium: { label: 'プレミアム', price: 1000, chapters: 4, extra: 6 },
  },
}
