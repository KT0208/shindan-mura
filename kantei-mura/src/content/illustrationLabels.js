// イラストの中の文字(言語別)。どの言語も同じ形にする。
// お守りの「御守」、賽銭箱の「奉納」、箱の「古札納所」などは、実物に書かれている日本語のまま描く。

export default {
  ja: {
    temizu: {
      steps: ['左手を清める', '右手を清める', '左の手のひらで受けて口をすすぐ', 'もう一度、左手', '柄杓を立てて柄を清める'],
      right: '右手', left: '左手',
      aria: ['右手で柄杓を持ち、左手に水をかける', '柄杓を左手に持ちかえ、右手に水をかける', '左の手のひらに水を受けて、口をすすぐ', 'もう一度、左手を清める', '柄杓を縦にして、残った水で柄を清める'],
    },
    sanpai: {
      steps: ['深いお辞儀を2回', '右手を少し下げて2回打つ', '手を合わせてお祈り', '最後にお辞儀を1回'],
      clap: 'パン!',
      aria: ['二礼:深いお辞儀を2回', '二拍手:右手を少し下にずらして2回手を打つ', '指先をそろえて手を合わせ、お祈りする', '一礼:最後に深いお辞儀を1回'],
    },
    sando: { hall: '拝殿', center: '正中', centerNote: '(神様の通り道)', side: '端を歩く', aria: '参道は真ん中(正中)を避けて端を歩く' },
    compare: { shrine: '神社', temple: 'お寺', torii: '入り口:鳥居', sanmon: '入り口:山門', clap: '拍手する', noClap: '拍手しない(合掌)', clapSound: 'パン', aria: '神社は鳥居があり拍手をする。お寺は山門があり拍手をせず合掌する' },
    omamori: { carry: '身につける', year: '約1年', thanks: '感謝を込めて', give: '古札納所へ返す', note: '授かった神社・お寺に返すのが基本', aria: 'お守りは約1年身につけたら、感謝を込めて古札納所へ返す' },
    saisen: { coin: '5円 = ご縁', coinNote: '金額に決まりはない', gently: 'そっと', noThrow: '投げずに、そっと入れる', aria: 'お賽銭は投げずにそっと入れる。5円は「ご縁」の語呂合わせ' },
    hatsumode: { month: '1月', sanganichi: '三が日(1〜3日):いちばんにぎわう', matsunouchi: '松の内(〜7日):初詣の目安', kansai: '地域によっては15日まで', aria: '初詣は三が日、または松の内(1月7日ごろ)までが目安' },
    goshuin: {
      steps: ['まずお参りをする', '授与所(御朱印所)へ', '御朱印帳を開いて渡す', '初穂料を納めて受け取る'],
      sign: '御朱印',
      aria: ['先に神社やお寺にお参りする', '授与所または御朱印所へ行く', '書いてほしいページを開いて御朱印帳を渡す', '初穂料を納めて御朱印帳を受け取る'],
    },
  },
  en: {
    temizu: {
      steps: ['Rinse your left hand', 'Rinse your right hand', 'Rinse your mouth from your palm', 'Your left hand again', 'Rinse the handle'],
      right: 'Right', left: 'Left',
      aria: ['Hold the ladle in your right hand and pour water over your left hand', 'Switch hands and pour water over your right hand', 'Pour water into your left palm and rinse your mouth', 'Rinse your left hand once more', 'Tilt the ladle upright so the remaining water rinses the handle'],
    },
    sanpai: {
      steps: ['Bow deeply twice', 'Clap twice', 'Pray with hands together', 'Bow once more'],
      clap: 'Clap!',
      aria: ['Two deep bows', 'Two claps, with the right hand slightly lower', 'Put your hands together and pray', 'One final deep bow'],
    },
    sando: { hall: 'Hall', center: 'Center', centerNote: '(the deity’s path)', side: 'Walk at the side', aria: 'On the approach, avoid the center (the deity’s path) and walk to the side' },
    compare: { shrine: 'Shrine', temple: 'Temple', torii: 'Gate: torii', sanmon: 'Gate: sanmon', clap: 'Clap', noClap: 'No clapping', clapSound: 'clap', aria: 'Shrines have a torii gate and you clap. Temples have a sanmon gate and you pray silently without clapping' },
    omamori: { carry: 'Carry it', year: 'About 1 year', thanks: 'with gratitude', give: 'Return it', note: 'Return it to the shrine or temple where you got it', aria: 'Carry your amulet for about a year, then return it with gratitude' },
    saisen: { coin: '5 yen = goen', coinNote: 'Any amount is fine', gently: 'Gently', noThrow: 'Place it gently — don’t throw', aria: 'Place your offering gently without throwing it. Five yen sounds like “goen”, a good connection' },
    hatsumode: { month: 'January', sanganichi: 'Jan 1–3: the busiest days', matsunouchi: 'Until Jan 7: the usual time', kansai: 'Until Jan 15 in some regions', aria: 'The first shrine visit is usually made between January 1 and 7' },
    goshuin: {
      steps: ['Pray first', 'Go to the counter', 'Hand over your book', 'Pay and receive it'],
      sign: '御朱印',
      aria: ['Visit and pray at the shrine or temple first', 'Go to the goshuin counter', 'Open your goshuin book to the page and hand it over', 'Pay the offering fee and receive your book'],
    },
  },
  'zh-Hans': {
    temizu: {
      steps: ['清洗左手', '清洗右手', '用左手掌接水漱口', '再洗一次左手', '竖起水勺清洗勺柄'],
      right: '右手', left: '左手',
      aria: ['右手拿水勺，往左手上浇水', '换左手拿水勺，往右手上浇水', '用左手掌接水漱口', '再清洗一次左手', '把水勺竖起，用剩下的水清洗勺柄'],
    },
    sanpai: {
      steps: ['深鞠躬两次', '拍手两次', '双手合十祈祷', '最后鞠躬一次'],
      clap: '啪!',
      aria: ['二礼：深鞠躬两次', '二拍手：右手稍微错开，拍手两次', '双手合十祈祷', '一礼：最后深鞠躬一次'],
    },
    sando: { hall: '拜殿', center: '正中', centerNote: '（神明之路）', side: '靠边走', aria: '参道中间是神明之路，要靠边走' },
    compare: { shrine: '神社', temple: '寺庙', torii: '入口：鸟居', sanmon: '入口：山门', clap: '要拍手', noClap: '不拍手（合十）', clapSound: '啪', aria: '神社有鸟居，参拜时拍手。寺庙有山门，不拍手而是合十' },
    omamori: { carry: '随身携带', year: '约1年', thanks: '怀着感谢', give: '送回神社', note: '原则上送回求得护身符的神社或寺庙', aria: '护身符随身携带约一年后，怀着感谢送回' },
    saisen: { coin: '5日元 = 结缘', coinNote: '金额没有规定', gently: '轻轻地', noThrow: '不要扔，轻轻放入', aria: '香油钱不要扔，要轻轻放入。5日元与“结缘”谐音' },
    hatsumode: { month: '1月', sanganichi: '1〜3日：最热闹的时候', matsunouchi: '到7日左右：初诣的标准', kansai: '有些地区到15日', aria: '初诣一般在1月1日到7日左右' },
    goshuin: {
      steps: ['先参拜', '前往授与所', '翻开朱印帐交给对方', '缴纳费用后领取'],
      sign: '御朱印',
      aria: ['先在神社或寺庙参拜', '前往授与所（御朱印所）', '翻开想写的那一页，交出朱印帐', '缴纳初穗料后领取朱印帐'],
    },
  },
  'zh-Hant': {
    temizu: {
      steps: ['清洗左手', '清洗右手', '用左手掌接水漱口', '再洗一次左手', '豎起水勺清洗勺柄'],
      right: '右手', left: '左手',
      aria: ['右手拿水勺，往左手上澆水', '換左手拿水勺，往右手上澆水', '用左手掌接水漱口', '再清洗一次左手', '把水勺豎起，用剩下的水清洗勺柄'],
    },
    sanpai: {
      steps: ['深鞠躬兩次', '拍手兩次', '雙手合十祈禱', '最後鞠躬一次'],
      clap: '啪!',
      aria: ['二禮：深鞠躬兩次', '二拍手：右手稍微錯開，拍手兩次', '雙手合十祈禱', '一禮：最後深鞠躬一次'],
    },
    sando: { hall: '拜殿', center: '正中', centerNote: '（神明之路）', side: '靠邊走', aria: '參道中間是神明之路，要靠邊走' },
    compare: { shrine: '神社', temple: '寺廟', torii: '入口：鳥居', sanmon: '入口：山門', clap: '要拍手', noClap: '不拍手（合十）', clapSound: '啪', aria: '神社有鳥居，參拜時拍手。寺廟有山門，不拍手而是合十' },
    omamori: { carry: '隨身攜帶', year: '約1年', thanks: '懷著感謝', give: '送回神社', note: '原則上送回求得御守的神社或寺廟', aria: '御守隨身攜帶約一年後，懷著感謝送回' },
    saisen: { coin: '5日圓 = 結緣', coinNote: '金額沒有規定', gently: '輕輕地', noThrow: '不要丟，輕輕放入', aria: '香油錢不要丟，要輕輕放入。5日圓與「結緣」諧音' },
    hatsumode: { month: '1月', sanganichi: '1〜3日：最熱鬧的時候', matsunouchi: '到7日左右：初詣的標準', kansai: '有些地區到15日', aria: '初詣一般在1月1日到7日左右' },
    goshuin: {
      steps: ['先參拜', '前往授與所', '翻開朱印帳交給對方', '繳納費用後領取'],
      sign: '御朱印',
      aria: ['先在神社或寺廟參拜', '前往授與所（御朱印所）', '翻開想寫的那一頁，交出朱印帳', '繳納初穗料後領取朱印帳'],
    },
  },
  ko: {
    temizu: {
      steps: ['왼손을 씻는다', '오른손을 씻는다', '왼손바닥에 받아 입을 헹군다', '다시 한 번 왼손', '국자를 세워 손잡이를 씻는다'],
      right: '오른손', left: '왼손',
      aria: ['오른손으로 국자를 들고 왼손에 물을 붓는다', '국자를 왼손으로 바꿔 들고 오른손에 물을 붓는다', '왼손바닥에 물을 받아 입을 헹군다', '다시 한 번 왼손을 씻는다', '국자를 세워 남은 물로 손잡이를 씻는다'],
    },
    sanpai: {
      steps: ['깊이 두 번 절하기', '박수 두 번', '손을 모아 기도하기', '마지막으로 한 번 절하기'],
      clap: '짝!',
      aria: ['두 번 절: 깊이 두 번 절한다', '두 번 박수: 오른손을 조금 내려 두 번 친다', '손끝을 모아 기도한다', '한 번 절: 마지막으로 깊이 한 번 절한다'],
    },
    sando: { hall: '배전', center: '정중앙', centerNote: '(신이 다니는 길)', side: '가장자리로', aria: '참배길의 한가운데는 신이 다니는 길이므로 가장자리로 걷는다' },
    compare: { shrine: '신사', temple: '절', torii: '입구: 도리이', sanmon: '입구: 산문', clap: '박수를 친다', noClap: '박수 없음(합장)', clapSound: '짝', aria: '신사에는 도리이가 있고 박수를 친다. 절에는 산문이 있고 박수 없이 합장한다' },
    omamori: { carry: '몸에 지니기', year: '약 1년', thanks: '감사하는 마음으로', give: '반납하기', note: '받은 신사나 절에 돌려드리는 것이 기본', aria: '부적은 약 1년 지닌 뒤 감사하는 마음으로 반납한다' },
    saisen: { coin: '5엔 = 고엔(인연)', coinNote: '금액은 정해져 있지 않음', gently: '살며시', noThrow: '던지지 말고 살며시 넣기', aria: '새전은 던지지 말고 살며시 넣는다. 5엔은 “인연(고엔)”과 발음이 같다' },
    hatsumode: { month: '1월', sanganichi: '1~3일: 가장 붐비는 날', matsunouchi: '7일 무렵까지: 일반적인 시기', kansai: '지역에 따라 15일까지', aria: '하쓰모데는 보통 1월 1일부터 7일 무렵까지' },
    goshuin: {
      steps: ['먼저 참배하기', '수여소로 가기', '고슈인초를 펼쳐 건네기', '비용을 내고 받기'],
      sign: '御朱印',
      aria: ['먼저 신사나 절에서 참배한다', '수여소(고슈인 접수처)로 간다', '써 줬으면 하는 페이지를 펼쳐 고슈인초를 건넨다', '하쓰호료를 내고 고슈인초를 돌려받는다'],
    },
  },
  es: {
    temizu: {
      steps: ['Lava la mano izquierda', 'Lava la mano derecha', 'Enjuágate la boca', 'Otra vez la izquierda', 'Limpia el mango'],
      right: 'Derecha', left: 'Izquierda',
      aria: ['Toma el cazo con la mano derecha y echa agua sobre la izquierda', 'Cambia de mano y echa agua sobre la derecha', 'Recoge agua en la palma izquierda y enjuágate la boca', 'Lava otra vez la mano izquierda', 'Pon el cazo vertical para que el agua limpie el mango'],
    },
    sanpai: {
      steps: ['Dos reverencias', 'Dos palmadas', 'Reza con las manos juntas', 'Una reverencia final'],
      clap: '¡Plas!',
      aria: ['Dos reverencias profundas', 'Dos palmadas, con la mano derecha un poco más abajo', 'Junta las manos y reza', 'Una última reverencia profunda'],
    },
    sando: { hall: 'Santuario', center: 'Centro', centerNote: '(camino de los dioses)', side: 'Ve por el lado', aria: 'En el camino de entrada, evita el centro (el camino de los dioses) y camina por un lado' },
    compare: { shrine: 'Santuario', temple: 'Templo', torii: 'Puerta: torii', sanmon: 'Puerta: sanmon', clap: 'Se aplaude', noClap: 'Sin aplausos', clapSound: 'plas', aria: 'Los santuarios tienen puerta torii y se aplaude. Los templos tienen puerta sanmon y se reza sin aplaudir' },
    omamori: { carry: 'Llévalo contigo', year: 'Aprox. 1 año', thanks: 'con gratitud', give: 'Devuélvelo', note: 'Se devuelve al santuario o templo donde lo recibiste', aria: 'Lleva tu amuleto durante un año aproximadamente y luego devuélvelo con gratitud' },
    saisen: { coin: '5 yenes = goen', coinNote: 'No hay cantidad fija', gently: 'Con suavidad', noThrow: 'Déjala con suavidad, sin lanzar', aria: 'Deja la ofrenda con suavidad, sin lanzarla. Cinco yenes suena como “goen”, buena conexión' },
    hatsumode: { month: 'Enero', sanganichi: '1–3 de enero: los días con más gente', matsunouchi: 'Hasta el 7: lo habitual', kansai: 'En algunas regiones, hasta el 15', aria: 'La primera visita del año suele hacerse entre el 1 y el 7 de enero' },
    goshuin: {
      steps: ['Primero, reza', 'Ve al mostrador', 'Entrega tu libro', 'Paga y recógelo'],
      sign: '御朱印',
      aria: ['Primero visita y reza en el santuario o templo', 'Ve al mostrador de goshuin', 'Abre tu libro por la página y entrégalo', 'Paga la ofrenda y recoge tu libro'],
    },
  },
}
