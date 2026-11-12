// Español: artículos sobre la cultura japonesa (santuarios, templos, omikuji). Mismas claves y archivos que la versión japonesa.
import { makeIllustrations } from '../illustrations.js'
import labels from '../illustrationLabels.js'

const F = makeIllustrations(labels.es)
const TODAY = { text: 'Después de tu visita, prueba el omikuji de hoy', href: '/#/today', label: 'Sacar el omikuji de hoy' }

export default {
  ui: {
    siteName: 'Kantei Mura',
    nav: { birthday: 'Cumpleaños', name: 'Nombre', today: 'Omikuji', compat: 'Compatibilidad' },
    navAria: 'Menú de lecturas',
    breadcrumbAria: 'Ruta de navegación',
    readings: 'Artículos',
    related: 'Sigue leyendo',
    footerAria: 'Información del sitio',
    legal: { privacy: 'Política de privacidad', contact: 'Contacto', operator: 'Quiénes somos' },
    sister: 'Sitio hermano: 🧩 Tests de personalidad con personajes — Shindan Mura',
    disclaimer: '* Las lecturas son solo entretenimiento.',
    quotes: ['«', '»'],
    languages: 'Lee este artículo en otro idioma',
    guide: {
      title: 'Artículos|Santuarios, templos y omikuji de Japón',
      description: 'Guía ilustrada de la etiqueta en santuarios y templos japoneses: purificación de manos, dos reverencias y dos palmadas, ofrendas, amuletos, la primera visita del año, sellos goshuin y omikuji.',
      lead: 'Visitar un santuario o un templo es una de las mejores formas de conocer Japón. Estas guías ilustradas explican las costumbres paso a paso para que puedas visitarlos con confianza y respeto.',
      cultureHeading: 'Santuarios, templos y omikuji',
      cta: { text: '¿Quieres probar una fortuna japonesa?', label: 'Ir a Kantei Mura' },
    },
  },
  articles: {
    sanpai: {
      file: 'sanpai.html',
      emoji: '⛩️',
      title: 'Cómo rezar en un santuario|Del torii a las dos reverencias, dos palmadas y una reverencia',
      shortTitle: 'Cómo rezar en un santuario',
      description: 'Guía ilustrada paso a paso para rezar en un santuario sintoísta japonés: la reverencia ante el torii, cómo caminar por el sendero, la ofrenda y la campana, y el rezo de «dos reverencias, dos palmadas, una reverencia».',
      lead: 'Rezar en un santuario sintoísta es famoso por las «dos reverencias, dos palmadas y una reverencia», pero la etiqueta empieza en cuanto llegas a la puerta de entrada. Este es todo el recorrido, desde que llegas hasta que te vas.',
      sections: [
        {
          heading: 'Una reverencia antes del torii',
          paragraphs: ['El torii marca el límite entre nuestro mundo cotidiano y el espacio sagrado de la deidad (kami). Detente ante el torii, haz una ligera reverencia y entra. Quitarse el sombrero es un gesto respetuoso.'],
        },
        {
          heading: 'Camina por un lado del sendero',
          figure: F.sando,
          paragraphs: [
            'El camino del torii al pabellón principal se llama sando. Su centro (seichu) se considera el camino de la deidad, por eso los visitantes caminan un poco hacia un lado.',
            'Si hay una fuente de purificación (temizuya) por el camino, purifica allí tus manos y tu boca. Mira cómo hacerlo en «Purificación temizu».',
          ],
        },
        {
          heading: 'La ofrenda y la campana',
          paragraphs: [
            'Ante el pabellón, haz una ligera reverencia y deja tu ofrenda (saisen) en la caja. Déjala con suavidad, sin lanzarla. No hay una cantidad fija: muchos japoneses ofrecen una moneda de 5 yenes, porque «cinco yenes» (go-en) suena como la palabra para «buena conexión».',
            'Si hay una campana, tócala. Se dice que su sonido purifica el lugar y avisa a la deidad de tu llegada. El orden entre ofrenda y campana puede variar según el santuario.',
          ],
        },
        {
          heading: 'Cómo hacer dos reverencias, dos palmadas y una reverencia',
          paragraphs: ['Es la forma básica de rezar en un santuario. En japonés se llama nirei-nihakushu-ichirei.'],
          steps: [
            'Dos reverencias: ponte recto e inclínate profundamente, unos 90 grados, dos veces.',
            'Dos palmadas: junta las manos a la altura del pecho, baja un poco la mano derecha y da dos palmadas.',
            'Reza: vuelve a alinear los dedos y reza en silencio con las manos juntas.',
            'Una reverencia: baja las manos y termina con otra reverencia profunda.',
          ],
          stepFigures: F.sanpaiSteps,
          after: ['Se dice que bajar un poco la mano derecha muestra humildad ante la deidad. Mucha gente dice primero en silencio su nombre y dirección y da las gracias antes de pedir un deseo.'],
        },
        {
          heading: 'Algunos santuarios lo hacen distinto',
          paragraphs: ['La mayoría usa dos reverencias, dos palmadas y una reverencia, pero algunos —como Izumo Taisha (Shimane), Usa Jingu (Oita) o el santuario de Yahiko (Niigata)— usan cuatro palmadas. Si el santuario indica su propia forma, síguela.'],
        },
        {
          heading: 'Otra reverencia al salir',
          paragraphs: [
            'Al terminar, vuelve por un lado del sendero. Tras cruzar el torii, gírate hacia el pabellón y haz una reverencia más.',
            'Mucha gente saca un omikuji después de rezar. Descubre su significado en «¿Qué es el omikuji?».',
          ],
        },
      ],
      related: ['temizu', 'jinjaTera', 'omikuji'],
      cta: TODAY,
    },

    temizu: {
      file: 'temizu.html',
      emoji: '💧',
      title: 'Purificación temizu|Cómo purificar manos y boca en un santuario',
      shortTitle: 'Purificación temizu',
      description: 'Guía ilustrada paso a paso del temizu, el ritual de purificación de los santuarios japoneses: cómo sostener el cazo, el orden para manos y boca, y qué hacer cuando no hay cazo.',
      lead: 'Cerca de la entrada de un santuario hay una pila de agua llamada temizuya. Antes de rezar, los visitantes purifican aquí sus manos y su boca: eso es el temizu. Parece complicado, pero sabiendo el orden cualquiera puede hacerlo.',
      sections: [
        {
          heading: 'Qué significa el temizu',
          paragraphs: [
            'El temizu sirve para limpiar cuerpo y mente antes de presentarse ante la deidad. Antiguamente la gente se purificaba entera en ríos o en el mar (misogi); se dice que el temizu es una versión sencilla de eso, solo con las manos y la boca.',
            'Mientras te purificas, deja atrás los pensamientos cotidianos y acércate al santuario con calma.',
          ],
        },
        {
          heading: 'Paso a paso',
          paragraphs: ['La clave es hacer todos los pasos con el único cazo de agua que recoges al principio, así que usa el agua poco a poco.'],
          steps: [
            'Toma el cazo (hishaku) con la mano derecha, recoge agua y echa un poco sobre la mano izquierda.',
            'Pasa el cazo a la mano izquierda y lava la derecha.',
            'Vuelve a tomarlo con la derecha. Echa agua en la palma izquierda y enjuágate la boca con ella.',
            'Lava otra vez la mano izquierda.',
            'Pon el cazo en vertical para que el agua que queda limpie el mango. Déjalo en su sitio, boca abajo y en silencio.',
          ],
          stepFigures: F.temizuSteps,
          after: ['Escupe el agua con discreción en el desagüe a tus pies, nunca dentro de la pila.'],
        },
        {
          heading: 'Lo que hay que evitar',
          list: [
            'Poner los labios en el cazo: echa siempre el agua primero en la palma izquierda.',
            'Meter las manos en la pila: recoge el agua con el cazo y lávate fuera de la pila.',
            'Recoger agua una y otra vez: la regla básica es un solo cazo para todos los pasos.',
          ],
        },
        {
          heading: 'Cuando no hay cazo',
          paragraphs: [
            'Por higiene, muchos santuarios ya no ponen cazos y el agua sale de un caño de bambú. En ese caso, usa el agua que corre en el mismo orden (mano izquierda → mano derecha → boca → mano izquierda). Si prefieres no enjuagarte la boca, basta con lavarte las manos.',
            'Algunos santuarios decoran la pila con flores flotantes (hanachozu). Son preciosas para fotografiar; solo procura no estorbar a otros visitantes.',
          ],
        },
        {
          heading: 'Lleva un pañuelo',
          paragraphs: ['Después tendrás las manos mojadas, así que conviene llevar un pañuelo o una toallita. Luego, dirígete al pabellón principal: los siguientes pasos están en «Cómo rezar en un santuario».'],
        },
      ],
      related: ['sanpai', 'jinjaTera'],
      cta: TODAY,
    },

    jinjaTera: {
      file: 'jinja-tera.html',
      emoji: '🏯',
      title: 'Santuarios y templos|¿Se aplaude o no?',
      shortTitle: 'Santuarios y templos',
      description: 'Los santuarios y templos japoneses tienen etiquetas distintas. Conoce las diferencias —puerta torii o sanmon, aplaudir o rezar en silencio, campana, incienso y más— con una comparación ilustrada.',
      lead: 'En Japón visitarás a menudo santuarios sintoístas y templos budistas. En ambos se juntan las manos para rezar, pero lo que se venera y la forma de rezar son diferentes. La mayor diferencia es si se aplaude o no.',
      sections: [
        {
          heading: '¿Cuál es la diferencia?',
          paragraphs: [
            'Un santuario (jinja) es un lugar del sintoísmo, la fe autóctona de Japón, donde se venera a los kami: las numerosas deidades de la naturaleza y los antepasados. Un templo (tera) es un lugar budista donde se venera a los budas y donde los monjes practican y enseñan.',
            'La entrada es la pista más fácil: los santuarios tienen una puerta torii y los templos suelen tener una puerta sanmon. Los santuarios suelen estar guardados por dos estatuas de perros-león (komainu) y los templos por feroces reyes guardianes (nio).',
          ],
        },
        {
          heading: 'Las diferencias de un vistazo',
          figure: F.jinjaTeraCompare,
          table: {
            head: ['', 'Santuario', 'Templo'],
            rows: [
              ['Se venera a', 'Los kami (sintoísmo)', 'Los budas (budismo)'],
              ['Entrada', 'Puerta torii', 'Puerta sanmon'],
              ['Guardianes', 'Komainu', 'Estatuas nio'],
              ['Cómo rezar', 'Dos reverencias, dos palmadas, una reverencia', 'Reverencia, manos juntas, reverencia'],
              ['Aplausos', 'Sí', 'No'],
              ['Qué se toca', 'Campana', 'Gong waniguchi'],
              ['Purificación', 'Temizu', 'Temizu e incienso'],
            ],
          },
        },
        {
          heading: 'En qué se diferencia la etiqueta',
          list: [
            'Aplausos: en los santuarios se aplaude durante el rezo; en los templos no se aplaude, se reza en silencio con las palmas juntas (gassho).',
            'Reverencia en la entrada: se hace igual ante el torii de un santuario o el sanmon de un templo.',
            'Purificación: santuarios y templos suelen tener una pila de agua, y la purificación es la misma.',
            'Incienso: en los templos puede haber un gran incensario (jokoro). La gente se echa el humo encima; se dice que cura las partes del cuerpo que toca.',
            'Campanas y gongs: los santuarios tienen una campana; los templos pueden tener un gong plano llamado waniguchi.',
          ],
        },
        {
          heading: 'Cómo rezar en un templo',
          steps: [
            'Haz una reverencia ante la puerta sanmon antes de entrar.',
            'Si hay una pila de agua, purifica manos y boca igual que en un santuario.',
            'Si hay incensario, ofrece incienso y deja que el humo te purifique.',
            'Haz una reverencia ante el pabellón principal y deja tu ofrenda con suavidad.',
            'Junta las palmas ante el pecho y reza, sin aplaudir.',
            'Haz otra reverencia. Al salir, tras cruzar la puerta, inclínate hacia el pabellón.',
          ],
        },
        {
          heading: 'Si no estás seguro',
          paragraphs: ['En algunos lugares hay un santuario y un templo juntos y cuesta distinguirlos. Fíjate en lo que hacen otros visitantes o lee los carteles. Lo más importante es rezar en silencio y con gratitud.'],
        },
      ],
      related: ['temizu', 'sanpai'],
      cta: TODAY,
    },

    omamori: {
      file: 'omamori.html',
      emoji: '🧧',
      title: 'Omamori y ofuda|Cómo llevar los amuletos japoneses y cuándo devolverlos',
      shortTitle: 'Omamori y ofuda',
      description: 'Cómo llevar un amuleto omamori y guardar un talismán ofuda, y qué hacer después de un año. ¿Se pueden tener varios? ¿Se pueden abrir? ¿Y los amuletos de tu viaje a Japón?',
      lead: 'Los omamori (amuletos) y ofuda (talismanes) de santuarios y templos llevan la protección de las deidades y los budas. Mucha gente se pregunta cuánto tiempo guardarlos y cómo devolverlos, así que aquí tienes lo básico.',
      sections: [
        {
          heading: 'Omamori y ofuda',
          paragraphs: [
            'Un omamori es una bolsita con un amuleto bendecido. Se lleva encima para tener su protección siempre cerca.',
            'Un ofuda es un talismán de papel o madera que se guarda en casa, normalmente en un altar doméstico (kamidana), para proteger a la familia y el hogar. En los santuarios se dice que estos objetos se «reciben», no que se «compran».',
          ],
        },
        {
          heading: 'Cómo llevar un omamori',
          list: [
            'Guárdalo en el bolso o la cartera, o llévalo encima. Lo importante es tenerlo cerca.',
            'Por favor, no abras la bolsita. Se dice que mirar dentro hace que la bendición se pierda.',
            'Tener varios no es problema. No existe la creencia de que las deidades se peleen; solo trátalos con cuidado.',
          ],
        },
        {
          heading: 'Cómo guardar un ofuda',
          paragraphs: ['El ofuda se coloca tradicionalmente en un kamidana. Si no tienes uno, ponlo en un lugar luminoso y limpio por encima de la altura de los ojos, como encima de un estante. Se considera mejor que mire al sur o al este.'],
        },
        {
          heading: 'Devuélvelo al cabo de un año',
          figure: F.omamori,
          paragraphs: [
            'Es costumbre cambiar amuletos y talismanes cada año aproximadamente. Mucha gente recibe nuevos en la primera visita del Año Nuevo y devuelve los viejos al mismo tiempo.',
            'Se devuelven en una caja o caseta llamada kosatsu-osamesho. Después se queman con respeto en un ritual llamado otakiage. En algunas regiones se hace en las hogueras de enero (dondo-yaki).',
          ],
        },
        {
          heading: 'Consejos para devolverlo',
          list: [
            'Lo ideal es devolverlo al santuario o templo donde lo recibiste. Si está demasiado lejos, muchos santuarios y templos cercanos también lo aceptan.',
            'Los amuletos de santuario se devuelven a un santuario, y los de templo, a un templo.',
            'Algunos santuarios y templos aceptan devoluciones por correo. Consulta antes su información oficial.',
            'Si tu deseo se cumplió, vuelve a dar las gracias y devuelve el amuleto con gratitud.',
          ],
        },
        {
          heading: 'Amuletos de tu viaje a Japón',
          paragraphs: ['Un omamori de tu viaje se trata igual. Llévalo durante un año; si no puedes devolverlo en Japón, guárdalo con cuidado en un lugar limpio o devuélvelo en tu próxima visita. Un omamori es un recuerdo del viaje y también una señal de tu conexión con las deidades y los budas de ese lugar.'],
        },
      ],
      related: ['saisen', 'hatsumode', 'sanpai'],
      cta: TODAY,
    },

    saisen: {
      file: 'saisen.html',
      emoji: '🪙',
      title: 'La ofrenda saisen|Qué significa, cuánto dar y por qué 5 yenes',
      shortTitle: 'La ofrenda saisen',
      description: 'Qué significa la ofrenda saisen en los santuarios y templos japoneses, si hay una cantidad fija, por qué 5 yenes traen suerte y cómo hacer la ofrenda con educación.',
      lead: 'Cuando rezas en un santuario o templo, haces una pequeña ofrenda llamada saisen. Mucha gente ofrece una moneda de 5 yenes, pero ¿por qué? Aquí tienes qué significa, cuánto dar y cómo ofrecerla.',
      sections: [
        {
          heading: 'Qué significa el saisen',
          paragraphs: [
            'El saisen es una ofrenda para expresar gratitud a las deidades y los budas. Antiguamente se ofrecía arroz y otras cosechas; al extenderse el dinero, las monedas ocuparon su lugar.',
            'El saisen no es un pago para que se cumplan los deseos. Se ofrece en agradecimiento por la protección recibida y con la esperanza de seguir contando con ella.',
          ],
        },
        {
          heading: '¿Hay una cantidad fija?',
          paragraphs: [
            'No hay una cantidad fija. La gratitud importa más que la suma, así que da lo que te resulte cómodo.',
            'Algunas personas disfrutan de juegos de palabras con los números para atraer la suerte. Son solo juegos, pero muy conocidos en Japón:',
          ],
          list: [
            '5 yenes (go-en): por una buena conexión («goen»)',
            '11 yenes: por una buena relación («ii en»)',
            '15 yenes: por muchas buenas conexiones («jubun-na goen»)',
            '25 yenes: por el doble de buenas conexiones',
            '45 yenes: por buenas conexiones de principio a fin («shiju goen»)',
            '10 yenes: algunos lo evitan porque «to-en» suena a «conexión lejana»',
          ],
        },
        {
          heading: 'Cómo hacer la ofrenda',
          figure: F.saisen,
          steps: [
            'Ponte ante la caja de ofrendas y haz una ligera reverencia.',
            'Deja la ofrenda con suavidad en la caja. Por favor, no la lances desde lejos.',
            'Toca la campana si la hay y reza con dos reverencias, dos palmadas y una reverencia (en los templos, reza con las manos juntas sin aplaudir).',
          ],
          after: ['Si hay mucha gente y no llegas a la caja, no lances monedas por encima de los demás: espera a que avance la fila y haz la ofrenda al acercarte.'],
        },
        {
          heading: '¿Puedo ofrecer billetes o pagar sin efectivo?',
          paragraphs: [
            'Los billetes también valen. Meterlos en un sobre blanco o doblarlos bien es un detalle educado.',
            'Algunos santuarios y templos ya aceptan ofrendas sin efectivo, como pagos con código QR. Consulta los carteles de cada lugar.',
          ],
        },
      ],
      related: ['sanpai', 'omamori', 'hatsumode'],
      cta: TODAY,
    },

    hatsumode: {
      file: 'hatsumode.html',
      emoji: '🎍',
      title: 'Hatsumode|Cuándo hacer la primera visita del año a un santuario',
      shortTitle: 'Hatsumode',
      description: 'El hatsumode es la primera visita del Año Nuevo a un santuario o templo en Japón. Descubre cuándo ir, qué hacer si tu familia está de luto, las normas entre la multitud y qué se hace en la visita.',
      lead: 'El hatsumode es la primera visita del Año Nuevo a un santuario o templo. Se da gracias por el año que termina y se pide un año nuevo feliz y seguro. Es una de las tradiciones de Año Nuevo más importantes de Japón.',
      sections: [
        {
          heading: '¿Cuándo hay que ir?',
          figure: F.hatsumode,
          paragraphs: [
            'La mayoría va durante los tres primeros días de enero (sanganichi), cuando los santuarios y templos famosos están abarrotados.',
            'Si no puedes ir entonces, una visita durante el matsu-no-uchi —el periodo en que siguen puestos los adornos de Año Nuevo, hasta el 7 de enero aproximadamente en la mayoría de zonas y hasta el 15 en Kansai y otras regiones— suele considerarse hatsumode. Mucha gente piensa que vale todo enero y no hay un plazo estricto. Elegir un día más tranquilo para rezar con calma también es buena idea.',
          ],
        },
        {
          heading: '¿Y si tu familia está de luto?',
          paragraphs: ['Estar de luto no prohíbe hacer el hatsumode, pero santuarios y templos lo ven de forma un poco distinta:'],
          list: [
            'Santuarios: en el sintoísmo, los primeros 50 días tras un fallecimiento (kichu) son un periodo en que normalmente no se visitan santuarios. Pasado ese periodo, se considera que se puede ir.',
            'Templos: el budismo no considera impura la muerte, así que puedes visitar un templo incluso estando de luto.',
          ],
          after: ['Si tienes dudas, puedes preguntar al santuario o templo que quieras visitar.'],
        },
        {
          heading: 'Normas entre la multitud',
          list: [
            'Sigue las indicaciones del personal y espera tu turno en la fila.',
            'No empujes ni lances monedas por encima de la gente: podrías hacer daño a alguien.',
            'El centro del sendero es el camino de la deidad; camina por un lado cuando puedas.',
            'Después de rezar, apártate rápido para que pase el siguiente.',
            'Come lo que compres en los puestos en las zonas indicadas y llévate la basura o usa las papeleras.',
          ],
        },
        {
          heading: 'Qué se hace en el hatsumode',
          list: [
            'Devolver los amuletos y talismanes del año anterior',
            'Recibir amuletos y talismanes nuevos',
            'Sacar un omikuji para ver la fortuna del año',
            'Recibir objetos de buena suerte como las flechas hamaya o los rastrillos kumade',
          ],
          after: ['Para la etiqueta básica, mira «Cómo rezar en un santuario»; para devolver amuletos, «Omamori y ofuda».'],
        },
      ],
      related: ['sanpai', 'omamori', 'omikuji'],
      cta: { text: 'Empieza el año con tu fortuna: saca el omikuji de hoy', href: '/#/today', label: 'Sacar el omikuji de hoy' },
    },

    goshuin: {
      file: 'goshuin.html',
      emoji: '📕',
      title: 'Cómo recibir un goshuin|Guía para principiantes de los sellos de santuarios y templos',
      shortTitle: 'Cómo recibir un goshuin',
      description: 'Qué es un goshuin, cómo elegir un libro de goshuin y los pasos y normas para recibirlo en un santuario o templo japonés: reza primero, ve al mostrador y paga la ofrenda.',
      lead: 'Un goshuin es un sello manuscrito que recibes como prueba de tu visita a un santuario o templo: caligrafía con tinta negra y sellos rojos. Cada lugar tiene su propio diseño, y cada vez más viajeros los coleccionan como recuerdo.',
      sections: [
        {
          heading: '¿Qué es un goshuin?',
          paragraphs: [
            'Un goshuin muestra con tinta el nombre del santuario o templo y la fecha de tu visita, junto con sellos rojos. Al principio se daba en los templos como prueba de que el fiel había copiado y ofrecido un sutra budista. Hoy se da en santuarios y templos como prueba de que fuiste a rezar.',
            'Un goshuin no es un sello de recuerdo: es una señal de tu conexión con las deidades y los budas. Trátalo con cuidado.',
          ],
        },
        {
          heading: 'Consigue un libro de goshuin',
          paragraphs: [
            'Los goshuin se escriben en un libro especial llamado goshuin-cho. Puedes conseguirlo en muchos santuarios y templos, y también en papelerías. Algunos lugares tienen libros originales propios.',
            'En la mayoría no importa juntar sellos de santuarios y de templos en el mismo libro, pero si lo prefieres, usa libros separados.',
          ],
        },
        {
          heading: 'Los pasos',
          steps: [
            'Primero, reza en el santuario o templo. El goshuin es prueba de tu visita, así que reza antes de pedirlo.',
            'Ve al mostrador (juyosho, u oficina de goshuin/nokyo).',
            'Abre tu libro por la página donde quieres que escriban y entrégalo. Quitar la funda es un detalle amable.',
            'Paga la ofrenda (hatsuhoryo en los santuarios, nokyoryo en los templos) y recoge tu libro. Suele costar entre 300 y 500 yenes; sigue el precio indicado.',
          ],
          stepFigures: F.goshuinSteps,
        },
        {
          heading: 'Normas a tener en cuenta',
          list: [
            'Lleva monedas sueltas para que no haga falta dar cambio.',
            'Espera en silencio mientras lo escriben y no hagas fotos ni vídeos.',
            'Si hay mucha gente, quizá recibas una hoja ya escrita (kakioki). Pégala con cuidado en tu libro más tarde.',
            'Cada lugar tiene un horario para los goshuin y algunos cierran a media tarde, así que ve temprano.',
            'Algunos santuarios y templos no ofrecen goshuin. En ese caso, por favor, no insistas.',
          ],
        },
      ],
      related: ['sanpai', 'jinjaTera', 'omamori'],
      cta: TODAY,
    },

    omikuji: {
      file: 'omikuji-guide.html',
      emoji: '🎋',
      title: '¿Qué es el omikuji?|Orden de las fortunas, qué dice el papel y cómo atarlo',
      shortTitle: '¿Qué es el omikuji?',
      description: 'El origen del omikuji en los santuarios y templos japoneses, el orden de las fortunas de la gran fortuna a la mala suerte, qué significa cada parte del papel y si atarlo o llevártelo.',
      lead: 'El omikuji es la fortuna tradicional japonesa que puedes sacar en santuarios y templos. En el Omikuji del día de Kantei Mura puedes vivir todo el ritual en pantalla: agitar la caja, sacar una varilla numerada y recibir tu papel del cajón con ese número.',
      sections: [
        {
          heading: 'De dónde viene el omikuji',
          paragraphs: [
            'Echar suertes (kuji) ha sido desde hace mucho una forma de preguntar la voluntad de los dioses al tomar decisiones importantes.',
            'La forma actual —sacar una varilla numerada y recibir un papel— suele atribuirse a Ryogen (también llamado Ganzan Daishi), un monje budista del periodo Heian. Se popularizó hacia el periodo Edo y hoy la gente la disfruta en Año Nuevo y en sus viajes.',
          ],
        },
        {
          heading: 'El orden de las fortunas',
          paragraphs: ['Los resultados incluyen daikichi (gran fortuna), chukichi, shokichi, kichi, suekichi y kyo (mala suerte). El orden exacto varía según el santuario o templo; dos órdenes habituales son:'],
          list: [
            'Daikichi → Chukichi → Shokichi → Kichi → Suekichi → Kyo',
            'Daikichi → Kichi → Chukichi → Shokichi → Suekichi → Kyo',
          ],
          after: ['Kantei Mura usa el primer orden. Suekichi significa «suerte que llega más tarde»: no es un mal resultado en absoluto.'],
        },
        {
          heading: 'Qué dice el papel',
          paragraphs: ['Además del rango de fortuna, el papel da consejos sobre muchos aspectos de la vida. Las secciones principales son:'],
          list: [
            'Deseos (negaigoto): si se cumplirán y con qué actitud',
            'Persona esperada (machibito): si vendrá alguien a quien deseas ver',
            'Objetos perdidos (usemono): si aparecerán',
            'Amor: cómo irá tu vida amorosa',
            'Trabajo o negocio: cómo irá tu trabajo',
            'Estudios: estudios y exámenes',
            'Salud: consejos para tu bienestar',
          ],
          after: ['Las verdaderas pistas para el día a día están en estas palabras, no solo en el rango.'],
        },
        {
          heading: '¿Atarlo o llevártelo?',
          paragraphs: ['Unos atan su papel a un árbol o soporte del santuario; otros lo guardan como un amuleto. No hay una regla estricta, pero en general:'],
          list: [
            'Buena fortuna: llévatelo y reléelo para darte ánimo',
            'Mala fortuna: átalo en el santuario y deja allí la mala suerte',
          ],
          after: ['En Kantei Mura, cuando sale kyo puedes pulsar un botón para atar tu papel al árbol de la pantalla.'],
        },
        {
          heading: 'La mala suerte no es para tanto',
          paragraphs: ['Sacar kyo puede decepcionar, pero también es un aviso amable de lo que debes cuidar. Hay quien dice: «Si esto es lo más bajo, solo queda subir». Ten presentes los consejos y vive el día con un poco más de cuidado.'],
        },
        {
          heading: 'Sobre el omikuji de Kantei Mura',
          paragraphs: ['El omikuji de Kantei Mura se basa en tu fecha de nacimiento y la fecha de hoy. Obtendrás el mismo resultado todo el día, y mañana te espera una nueva fortuna. Disfrútalo como tu comprobación diaria de la suerte.'],
        },
      ],
      related: ['sanpai', 'temizu'],
      cta: { text: 'Agita la caja y saca el omikuji de hoy', href: '/#/today', label: 'Sacar el omikuji de hoy' },
    },
  },
}
