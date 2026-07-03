// A8.net(ちょびリッチ)の広告バナー。PC用728×90 / スマホ用300×250をCSSの
// メディアクエリで出し分ける。診断中の質問・回答画面には表示しないこと。
export default function AdBanner() {
  return (
    <div className="ad-banner" aria-label="広告">
      <div className="ad-banner-pc">
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B7SGX+FHV6LU+389A+6IHCX"
          rel="nofollow sponsored noopener noreferrer"
          target="_blank"
        >
          <img
            width="728"
            height="90"
            alt="広告"
            src="https://www25.a8.net/svt/bgt?aid=260703969937&wid=001&eno=01&mid=s00000015067001094000&mc=1"
          />
        </a>
        <img
          width="1"
          height="1"
          src="https://www11.a8.net/0.gif?a8mat=4B7SGX+FHV6LU+389A+6IHCX"
          alt=""
        />
      </div>

      <div className="ad-banner-sp">
        <a
          href="https://px.a8.net/svt/ejp?a8mat=4B7SGX+FHV6LU+389A+67RK1"
          rel="nofollow sponsored noopener noreferrer"
          target="_blank"
        >
          <img
            width="300"
            height="250"
            alt="広告"
            src="https://www22.a8.net/svt/bgt?aid=260703969937&wid=001&eno=01&mid=s00000015067001044000&mc=1"
          />
        </a>
        <img
          width="1"
          height="1"
          src="https://www11.a8.net/0.gif?a8mat=4B7SGX+FHV6LU+389A+67RK1"
          alt=""
        />
      </div>
    </div>
  )
}
