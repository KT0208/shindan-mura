// サイト名・URLは .env で決める(名前を変えるときは .env だけ直せばよい)
export const SITE = {
  name: import.meta.env.VITE_SITE_NAME,
  nameLatin: import.meta.env.VITE_SITE_NAME_LATIN,
  price: 500,
}
