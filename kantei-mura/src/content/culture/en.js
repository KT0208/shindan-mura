// English: Japanese culture articles (shrines, temples, omikuji). Same keys and files as the Japanese version.
import { makeIllustrations } from '../illustrations.js'
import labels from '../illustrationLabels.js'

const F = makeIllustrations(labels.en)
const TODAY = { text: 'After your visit, try today’s omikuji fortune', href: '/#/today', label: 'Draw today’s omikuji' }

export default {
  ui: {
    siteName: 'Kantei Mura',
    nav: { birthday: 'Birthday', name: 'Name', today: 'Omikuji', compat: 'Compatibility' },
    navAria: 'Readings menu',
    breadcrumbAria: 'Breadcrumb',
    readings: 'Articles',
    related: 'Read next',
    footerAria: 'Site information',
    legal: { privacy: 'Privacy policy', contact: 'Contact', operator: 'About us' },
    sister: 'Sister site: 🧩 Personality quizzes with cute characters — Shindan Mura',
    disclaimer: '* Readings are for entertainment only.',
    quotes: ['“', '”'],
    languages: 'Read this article in another language',
    guide: {
      title: 'Articles|Japanese shrines, temples and omikuji',
      description: 'A friendly guide to Japanese shrine and temple etiquette: purifying your hands, two bows and two claps, offerings, amulets, the first visit of the year, goshuin stamps and omikuji fortunes.',
      lead: 'Visiting a shrine or temple is one of the best ways to experience Japan. These illustrated guides explain the customs step by step, so you can visit with confidence and respect.',
      cultureHeading: 'Shrines, temples and omikuji',
      cta: { text: 'Ready to try a Japanese fortune?', label: 'Go to Kantei Mura' },
    },
  },
  articles: {
    sanpai: {
      file: 'sanpai.html',
      emoji: '⛩️',
      title: 'How to Pray at a Shrine|From the Torii Gate to Two Bows, Two Claps, One Bow',
      shortTitle: 'How to Pray at a Shrine',
      description: 'A step-by-step, illustrated guide to praying at a Japanese Shinto shrine: bowing at the torii, walking the approach, offerings and the bell, and the “two bows, two claps, one bow” prayer.',
      lead: 'Praying at a Shinto shrine is famous for “two bows, two claps, one bow”, but the etiquette actually begins as soon as you reach the entrance gate. Here is the whole flow, from arriving to leaving.',
      sections: [
        {
          heading: 'Bow once before the torii gate',
          paragraphs: ['The torii gate marks the border between our everyday world and the sacred space of the deity (kami). Stop in front of the torii, bow lightly, then enter the grounds. Taking off your hat is a respectful touch.'],
        },
        {
          heading: 'Walk at the side of the approach',
          figure: F.sando,
          paragraphs: [
            'The path from the torii to the main hall is called the sando. Its center (seichu) is thought of as the path of the deity, so visitors walk slightly to one side.',
            'If there is a purification fountain (temizuya) along the way, purify your hands and mouth there. See “Temizu Purification” for how to do it.',
          ],
        },
        {
          heading: 'Offering and bell',
          paragraphs: [
            'At the hall, bow lightly and place your offering (saisen) in the offering box. Please put it in gently rather than throwing it. Any amount is fine — many Japanese people offer a 5-yen coin, because “five yen” (go-en) sounds like the word for a good connection.',
            'If there is a bell, ring it. The sound is said to purify the space and let the deity know you have come. The order of offering and bell can differ from shrine to shrine.',
          ],
        },
        {
          heading: 'How to do two bows, two claps, one bow',
          paragraphs: ['This is the basic way to pray at a shrine. In Japanese it is called nirei-nihakushu-ichirei.'],
          steps: [
            'Two bows: stand up straight and bow deeply, about 90 degrees, two times.',
            'Two claps: bring your hands together at chest height, slide your right hand slightly down, and clap twice.',
            'Pray: line your fingertips up again and pray quietly with your hands together.',
            'One bow: lower your hands and finish with one more deep bow.',
          ],
          stepFigures: F.sanpaiSteps,
          after: ['Sliding the right hand down is said to show humility before the deity. Many people first say their name and address silently, then give thanks, before making a wish.'],
        },
        {
          heading: 'Some shrines do it differently',
          paragraphs: ['Most shrines use two bows, two claps, one bow, but some — such as Izumo Taisha (Shimane), Usa Jingu (Oita) and Yahiko Shrine (Niigata) — use four claps. If a shrine shows its own instructions, follow them.'],
        },
        {
          heading: 'Bow again when you leave',
          paragraphs: [
            'When you are done, walk back along the side of the approach. After passing through the torii, turn toward the hall and bow once more.',
            'Many people draw an omikuji fortune after praying. See “What Is Omikuji?” to learn what the slips mean.',
          ],
        },
      ],
      related: ['temizu', 'jinjaTera', 'omikuji'],
      cta: TODAY,
    },

    temizu: {
      file: 'temizu.html',
      emoji: '💧',
      title: 'Temizu Purification|How to Purify Your Hands and Mouth at a Shrine',
      shortTitle: 'Temizu Purification',
      description: 'An illustrated, step-by-step guide to temizu — the purification ritual at Japanese shrines. Learn how to hold the ladle, the order for your hands and mouth, and what to do when there is no ladle.',
      lead: 'Near the entrance of a shrine you will find a water basin called the temizuya. Before praying, visitors purify their hands and mouth here. This is called temizu. It looks complicated, but once you know the order, anyone can do it.',
      sections: [
        {
          heading: 'What temizu means',
          paragraphs: [
            'Temizu is a way to cleanse your body and mind before standing before the deity. In ancient times people purified their whole bodies in rivers or the sea (misogi); temizu is said to be a simple version of that, using only the hands and mouth.',
            'As you purify yourself, let go of everyday thoughts and approach the hall with a calm heart.',
          ],
        },
        {
          heading: 'Step by step',
          paragraphs: ['The key is to do every step with the single ladle of water you scoop at the start, so use the water a little at a time.'],
          steps: [
            'Hold the ladle (hishaku) in your right hand, scoop water, and pour a little over your left hand.',
            'Switch the ladle to your left hand and rinse your right hand.',
            'Switch back to your right hand. Pour water into your cupped left palm and rinse your mouth with it.',
            'Rinse your left hand once more.',
            'Tilt the ladle upright so the remaining water runs down and rinses the handle. Put the ladle back quietly, face down.',
          ],
          stepFigures: F.temizuSteps,
          after: ['Spit the water quietly into the drain at your feet — never back into the basin.'],
        },
        {
          heading: 'Things to avoid',
          list: [
            'Putting your lips on the ladle: always pour the water into your left palm first.',
            'Putting your hands into the basin: scoop with the ladle and rinse your hands outside the basin.',
            'Scooping again and again: one scoop for all the steps is the basic rule.',
          ],
        },
        {
          heading: 'When there is no ladle',
          paragraphs: [
            'For hygiene reasons, many shrines now have running water from a bamboo spout instead of ladles. In that case, use the running water in the same order (left hand → right hand → mouth → left hand). If you would rather not rinse your mouth, rinsing your hands is fine.',
            'Some shrines decorate the basin with floating flowers (hanachozu). They are beautiful to photograph — just be careful not to block other visitors.',
          ],
        },
        {
          heading: 'Bring a handkerchief',
          paragraphs: ['Your hands will be wet afterwards, so a small towel or handkerchief is handy. Then head to the main hall — see “How to Pray at a Shrine” for the next steps.'],
        },
      ],
      related: ['sanpai', 'jinjaTera'],
      cta: TODAY,
    },

    jinjaTera: {
      file: 'jinja-tera.html',
      emoji: '🏯',
      title: 'Shrines vs. Temples|Do You Clap or Not?',
      shortTitle: 'Shrines vs. Temples',
      description: 'Japanese shrines and temples have different etiquette. Learn the differences — torii vs. sanmon gates, clapping vs. silent prayer, bells, incense and more — with an illustrated comparison.',
      lead: 'In Japan you will often visit both Shinto shrines and Buddhist temples. In both you put your hands together and pray, but what is enshrined and how you pray are different. The biggest difference is whether you clap.',
      sections: [
        {
          heading: 'What is the difference?',
          paragraphs: [
            'A shrine (jinja) is a place of Shinto, Japan’s native faith, where the kami — the many deities of nature and ancestors — are enshrined. A temple (tera) is a Buddhist place where Buddhas are enshrined and monks practice and teach.',
            'The entrance is the easiest clue: shrines have a torii gate, while temples usually have a sanmon gate. Shrines are often guarded by a pair of lion-dog statues (komainu), temples by fierce guardian kings (nio).',
          ],
        },
        {
          heading: 'The differences at a glance',
          figure: F.jinjaTeraCompare,
          table: {
            head: ['', 'Shrine', 'Temple'],
            rows: [
              ['Enshrined', 'Kami (Shinto)', 'Buddhas (Buddhism)'],
              ['Entrance', 'Torii gate', 'Sanmon gate'],
              ['Guardians', 'Komainu', 'Nio statues'],
              ['How to pray', 'Two bows, two claps, one bow', 'Bow, pray with palms together, bow'],
              ['Clapping', 'Yes', 'No'],
              ['What you ring', 'Bell', 'Waniguchi gong'],
              ['Purification', 'Temizu', 'Temizu and incense'],
            ],
          },
        },
        {
          heading: 'How the etiquette differs',
          list: [
            'Clapping: at shrines you clap during the prayer; at temples you do not clap — you pray quietly with your palms together (gassho).',
            'Bowing at the entrance: bow at the torii of a shrine or the sanmon of a temple in the same way.',
            'Purification: both shrines and temples often have a water basin, and the purification is the same.',
            'Incense: temples may have a large incense burner (jokoro). People waft the smoke over themselves, which is said to heal the parts of the body it touches.',
            'Bells and gongs: shrines have a bell; temples may have a flat gong called a waniguchi.',
          ],
        },
        {
          heading: 'How to pray at a temple',
          steps: [
            'Bow once at the sanmon gate before entering.',
            'If there is a water basin, purify your hands and mouth just as at a shrine.',
            'If there is an incense burner, offer incense and let the smoke purify you.',
            'Bow at the main hall and gently place your offering.',
            'Put your palms together at your chest and pray — without clapping.',
            'Bow once more. When leaving, bow toward the main hall after passing the gate.',
          ],
        },
        {
          heading: 'If you are not sure',
          paragraphs: ['Some places have a shrine and a temple side by side, and it can be hard to tell which is which. Watch what other visitors do or check the signs. Above all, what matters is praying quietly and with gratitude.'],
        },
      ],
      related: ['temizu', 'sanpai'],
      cta: TODAY,
    },

    omamori: {
      file: 'omamori.html',
      emoji: '🧧',
      title: 'Omamori and Ofuda|How to Keep Japanese Amulets and When to Return Them',
      shortTitle: 'Omamori and Ofuda',
      description: 'How to carry an omamori amulet and keep an ofuda talisman, and what to do after a year. Can you have more than one? Can you open it? What about amulets from your trip to Japan?',
      lead: 'Omamori (amulets) and ofuda (talismans) from shrines and temples carry the protection of the deities and Buddhas. Many people wonder how long to keep them and how to return them, so here are the basics.',
      sections: [
        {
          heading: 'Omamori vs. ofuda',
          paragraphs: [
            'An omamori is a small pouch containing a blessed charm. You carry it with you so that its protection is always close.',
            'An ofuda is a paper or wooden talisman you keep at home, usually on a household altar (kamidana), to protect the family and home. At shrines, people say they “receive” these items rather than “buy” them.',
          ],
        },
        {
          heading: 'How to carry an omamori',
          list: [
            'Keep it in your bag or wallet, or wear it. What matters is keeping it close to you.',
            'Please do not open the pouch. It is said that looking inside makes the blessing fade.',
            'Having several is fine. There is no belief that the deities will quarrel — just treat each one with care.',
          ],
        },
        {
          heading: 'How to keep an ofuda',
          paragraphs: ['An ofuda is traditionally placed on a kamidana. If you do not have one, put it in a bright, clean place above eye level, such as on top of a shelf. Facing it south or east is considered best.'],
        },
        {
          heading: 'Return it after about a year',
          figure: F.omamori,
          paragraphs: [
            'It is customary to replace amulets and talismans after about a year. Many people receive new ones during their first shrine visit of the New Year and return the old ones at the same time.',
            'Returned items go into a box or booth called the kosatsu-osamesho. They are later burned respectfully in a ritual called otakiage. In some regions this is done at bonfire festivals in January (dondo-yaki).',
          ],
        },
        {
          heading: 'Tips for returning',
          list: [
            'Ideally, return it to the shrine or temple where you received it. If that is too far, many shrines and temples near you will also accept it.',
            'Return shrine amulets to a shrine and temple amulets to a temple.',
            'Some shrines and temples accept returns by mail. Check their official information first.',
            'If your wish came true, visit to say thank you and return the amulet with gratitude.',
          ],
        },
        {
          heading: 'Amulets from your trip to Japan',
          paragraphs: ['An omamori from your trip is treated the same way. Carry it for about a year; if you cannot return it to Japan, keep it with care in a clean place, or return it if you visit again. An omamori is a travel memory and also a sign of your connection with the deities and Buddhas of that place.'],
        },
      ],
      related: ['saisen', 'hatsumode', 'sanpai'],
      cta: TODAY,
    },

    saisen: {
      file: 'saisen.html',
      emoji: '🪙',
      title: 'Saisen Offerings|What They Mean, How Much to Give and Why 5 Yen',
      shortTitle: 'Saisen Offerings',
      description: 'What saisen offerings mean at Japanese shrines and temples, whether there is a set amount, why 5 yen is considered lucky, and how to make your offering politely.',
      lead: 'When you pray at a shrine or temple, you make a small offering called saisen. Many people offer a 5-yen coin — but why? Here is what the offering means, how much to give and how to offer it.',
      sections: [
        {
          heading: 'What saisen means',
          paragraphs: [
            'Saisen is an offering to express gratitude to the deities and Buddhas. Long ago, people offered rice and other harvests; as money spread, coins took their place.',
            'Saisen is not a fee for granting wishes. It is offered with thanks for watching over you and a hope for continued protection.',
          ],
        },
        {
          heading: 'Is there a set amount?',
          paragraphs: [
            'There is no set amount. Gratitude matters more than the sum, so give what feels comfortable.',
            'Some people enjoy lucky wordplay with the numbers. These are just puns, but they are well known in Japan:',
          ],
          list: [
            '5 yen (go-en): for a good connection (“goen”)',
            '11 yen: for a good relationship (“ii en”)',
            '15 yen: for plenty of good connections (“jubun-na goen”)',
            '25 yen: for double the good connections',
            '45 yen: for good connections from start to finish (“shiju goen”)',
            '10 yen: some avoid it because “to-en” sounds like “distant connection”',
          ],
        },
        {
          heading: 'How to make your offering',
          figure: F.saisen,
          steps: [
            'Stand in front of the offering box and bow lightly.',
            'Place your offering gently into the box. Please do not throw it from a distance.',
            'Ring the bell if there is one, then pray with two bows, two claps and one bow (at temples, pray with palms together without clapping).',
          ],
          after: ['If it is crowded and you cannot reach the box, do not throw your coins over people — wait for the line to move and offer when you get closer.'],
        },
        {
          heading: 'Can I offer bills or pay cashless?',
          paragraphs: [
            'Bills are fine too. Putting them in a white envelope or folding them neatly is a polite touch.',
            'Some shrines and temples now accept cashless offerings, such as QR-code payments. Check the signs at each place.',
          ],
        },
      ],
      related: ['sanpai', 'omamori', 'hatsumode'],
      cta: TODAY,
    },

    hatsumode: {
      file: 'hatsumode.html',
      emoji: '🎍',
      title: 'Hatsumode Etiquette|When to Make Your First Shrine Visit of the Year',
      shortTitle: 'Hatsumode Etiquette',
      description: 'Hatsumode is the first shrine or temple visit of the New Year in Japan. Learn when to go, what to do if your family is in mourning, crowd manners and what people do on their visit.',
      lead: 'Hatsumode is the first visit to a shrine or temple in the New Year. People give thanks for the past year and pray for a safe and happy new one. It is one of the most important New Year traditions in Japan.',
      sections: [
        {
          heading: 'When should you go?',
          figure: F.hatsumode,
          paragraphs: [
            'Most people go during the first three days of January (sanganichi), when famous shrines and temples are extremely crowded.',
            'If you cannot go then, a visit during matsu-no-uchi — the period when New Year decorations stay up, until about January 7 in most areas and about January 15 in Kansai and some other regions — is generally still considered hatsumode. Many people think any time in January is fine, and there is no strict deadline. Choosing a quieter day to pray calmly is a good idea too.',
          ],
        },
        {
          heading: 'What if your family is in mourning?',
          paragraphs: ['You are not forbidden from making hatsumode while in mourning, but shrines and temples see it a little differently:'],
          list: [
            'Shrines: in Shinto, the first 50 days after a death (kichu) are a period when people usually refrain from visiting shrines. After that period, visiting is considered fine.',
            'Temples: Buddhism does not regard death as impure, so you may visit a temple even during mourning.',
          ],
          after: ['If you are unsure, you can ask the shrine or temple you would like to visit.'],
        },
        {
          heading: 'Manners in the crowd',
          list: [
            'Follow the staff’s directions and wait your turn in line.',
            'Do not push, and do not throw coins over the heads of people in front of you — it can hurt someone.',
            'The center of the approach is the deity’s path; walk to the side when you can.',
            'After praying, step aside quickly so the next person can pray.',
            'Eat food from the stalls in the designated areas, and take your rubbish home or use the bins provided.',
          ],
        },
        {
          heading: 'What people do at hatsumode',
          list: [
            'Return last year’s amulets and talismans',
            'Receive new amulets and talismans',
            'Draw an omikuji to see their fortune for the year',
            'Receive lucky charms such as hamaya arrows or kumade rakes',
          ],
          after: ['For the basic etiquette, see “How to Pray at a Shrine”; for returning amulets, see “Omamori and Ofuda”.'],
        },
      ],
      related: ['sanpai', 'omamori', 'omikuji'],
      cta: { text: 'Start the year with a fortune — draw today’s omikuji', href: '/#/today', label: 'Draw today’s omikuji' },
    },

    goshuin: {
      file: 'goshuin.html',
      emoji: '📕',
      title: 'How to Receive a Goshuin|A Beginner’s Guide to Shrine and Temple Seals',
      shortTitle: 'How to Receive a Goshuin',
      description: 'What a goshuin is, how to choose a goshuin book, and the steps and manners for receiving one at a Japanese shrine or temple — pray first, go to the counter, pay the offering fee.',
      lead: 'A goshuin is a handwritten seal you receive as proof of your visit to a shrine or temple: brush calligraphy in black ink with red stamps. Each place has its own design, and more and more travelers collect them as memories of their journey.',
      sections: [
        {
          heading: 'What is a goshuin?',
          paragraphs: [
            'A goshuin shows the name of the shrine or temple and the date of your visit in ink, with red seals. Originally it was given at temples as proof that a worshipper had copied and offered a Buddhist sutra. Today it is given at both shrines and temples as proof that you came to pray.',
            'A goshuin is not a souvenir stamp — it is a sign of your connection with the deities and Buddhas. Please treat it with care.',
          ],
        },
        {
          heading: 'Get a goshuin book',
          paragraphs: [
            'Goshuin are written in a special book called a goshuin-cho. You can get one at many shrines and temples, and also at stationery shops. Some places offer their own original books.',
            'Most places are fine with shrine and temple seals in the same book, but if you prefer, keep separate books for shrines and temples.',
          ],
        },
        {
          heading: 'The steps',
          steps: [
            'First, pray at the shrine or temple. A goshuin is proof of your visit, so pray before asking for one.',
            'Go to the counter (juyosho, or the goshuin/nokyo office).',
            'Open your book to the page you want written on and hand it over. Removing any cover is a kind touch.',
            'Pay the offering fee (hatsuhoryo at shrines, nokyoryo at temples) and receive your book. It is often around 300–500 yen — follow the posted price.',
          ],
          stepFigures: F.goshuinSteps,
        },
        {
          heading: 'Manners to keep in mind',
          list: [
            'Have small change ready so no change is needed.',
            'Wait quietly while it is being written, and please do not take photos or videos.',
            'When it is busy, you may receive a pre-written sheet (kakioki). Paste it neatly into your book later.',
            'Each place has set hours for goshuin, and some close in the late afternoon, so go early.',
            'Some shrines and temples do not offer goshuin. If so, please do not insist.',
          ],
        },
      ],
      related: ['sanpai', 'jinjaTera', 'omamori'],
      cta: TODAY,
    },

    omikuji: {
      file: 'omikuji-guide.html',
      emoji: '🎋',
      title: 'What Is Omikuji?|Fortune Ranks, What the Slip Says and Tying It to a Tree',
      shortTitle: 'What Is Omikuji?',
      description: 'The origin of omikuji fortunes at Japanese shrines and temples, the order of fortunes from great blessing to bad luck, what each section of the slip means, and whether to tie it or take it home.',
      lead: 'Omikuji are traditional Japanese fortunes you can draw at shrines and temples. On Kantei Mura’s Daily Omikuji, you can experience the whole ritual on screen: shake the box, draw a numbered stick and receive your slip from the matching drawer.',
      sections: [
        {
          heading: 'Where omikuji come from',
          paragraphs: [
            'Drawing lots (kuji) has long been a way to ask for the will of the gods when making important decisions.',
            'The style we know today — drawing a numbered stick and receiving a paper slip — is often traced back to Ryogen (also known as Ganzan Daishi), a Buddhist monk of the Heian period. It became popular from around the Edo period, and today people enjoy it at New Year and on their travels.',
          ],
        },
        {
          heading: 'The order of fortunes',
          paragraphs: ['Results include daikichi (great blessing), chukichi, shokichi, kichi, suekichi and kyo (bad luck). The exact order varies by shrine and temple; two common orders are:'],
          list: [
            'Daikichi → Chukichi → Shokichi → Kichi → Suekichi → Kyo',
            'Daikichi → Kichi → Chukichi → Shokichi → Suekichi → Kyo',
          ],
          after: ['Kantei Mura uses the first order. Suekichi means “luck that comes later” — it is not a bad result at all.'],
        },
        {
          heading: 'What the slip says',
          paragraphs: ['Besides the fortune rank, the slip gives advice on many parts of life. The main sections are:'],
          list: [
            'Wishes (negaigoto): whether your wishes will come true, and the right attitude',
            'Awaited person (machibito): whether someone you hope to meet will come',
            'Lost items (usemono): whether lost things will be found',
            'Love: how your love life will go',
            'Work or business: how your work will go',
            'Studies: studies and exams',
            'Health: advice for your well-being',
          ],
          after: ['The real hints for daily life are in these words, not only in the rank.'],
        },
        {
          heading: 'Tie it or take it home?',
          paragraphs: ['Some people tie their slip to a tree or rack at the shrine; others keep it like an amulet. There is no strict rule, but generally:'],
          list: [
            'Good fortune: take it home and reread it for encouragement',
            'Bad fortune: tie it at the shrine and leave the bad luck behind',
          ],
          after: ['On Kantei Mura, when you draw kyo you can tap a button to tie your slip to the tree on screen.'],
        },
        {
          heading: 'Bad luck is okay',
          paragraphs: ['Drawing kyo can be disappointing, but it is also a kind warning about what to be careful of. Some people say, “If this is the bottom, the only way is up.” Keep the advice in mind and spend the day a little more carefully.'],
        },
        {
          heading: 'About Kantei Mura’s omikuji',
          paragraphs: ['Kantei Mura’s omikuji is based on your date of birth and today’s date. You get the same result all day, and a new fortune awaits tomorrow. Enjoy it as a daily luck check.'],
        },
      ],
      related: ['sanpai', 'temizu'],
      cta: { text: 'Shake the box and draw today’s omikuji', href: '/#/today', label: 'Draw today’s omikuji' },
    },
  },
}
