import type { Prayer } from '@/types/prayer';

/**
 * Curated list of Jain prayers (stotras, sutras, mantras) from both
 * Shvetambar and Digambar traditions. Sourced from common Jinvani teachings
 * and standard pratikraman / devvandana texts.
 *
 * The `youtubeSearchUrl` is a SEARCH URL — it always works and shows real
 * results. This avoids the "dead link" problem of hardcoded video IDs.
 *
 * If you have an authoritative source (e.g. a Jhinwani PDF) we can correct
 * any text variations to match exactly.
 */

const yt = (q: string) =>
  `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}`;

export const PRAYERS: Prayer[] = [
  // ─── UNIVERSAL (BOTH SECTS) ────────────────────────────────
  {
    id: 'navkar-mantra',
    name: 'Navkar Mantra',
    nameDevanagari: 'णमोकार मन्त्र',
    category: 'mantra',
    sect: 'both',
    shortDescription:
      'The most sacred and universal Jain mantra — salutation to the five supreme beings.',
    textDevanagari: `णमो अरिहंताणं
णमो सिद्धाणं
णमो आयरियाणं
णमो उवज्झायाणं
णमो लोए सव्वसाहूणं
एसो पंच णमोक्कारो
सव्वपावप्पणासणो
मंगलाणं च सव्वेसिं
पढमं हवइ मंगलं`,
    transliteration: `Namo Arihantanam
Namo Siddhanam
Namo Ayariyanam
Namo Uvajjhayanam
Namo Loe Savva-Sahunam
Eso Pancha Namokkaro
Savva-Pavappanasano
Mangalanam Cha Savvesim
Padhamam Havai Mangalam`,
    meaning: `I bow to the Arihantas (perfected souls who have conquered inner enemies).
I bow to the Siddhas (liberated souls).
I bow to the Acharyas (spiritual teachers / heads of orders).
I bow to the Upadhyayas (ascetic teachers of scripture).
I bow to all the Sadhus (monks and nuns) in the universe.
This fivefold salutation
destroys all sins
and is the foremost
of all auspicious things.`,
    youtubeSearchUrl: yt('Navkar Mantra'),
  },
  {
    id: 'chattari-mangalam',
    name: 'Chattari Mangalam',
    nameDevanagari: 'चत्तारि मंगलं',
    category: 'sutra',
    sect: 'both',
    shortDescription: 'The four auspicious things, the four supreme beings, the four refuges.',
    textDevanagari: `चत्तारि मंगलं — अरिहंता मंगलं, सिद्धा मंगलं, साहू मंगलं, केवलि-पन्नत्तो धम्मो मंगलं।
चत्तारि लोगुत्तमा — अरिहंता लोगुत्तमा, सिद्धा लोगुत्तमा, साहू लोगुत्तमा, केवलि-पन्नत्तो धम्मो लोगुत्तमो।
चत्तारि सरणं पवज्जामि — अरिहंते सरणं पवज्जामि, सिद्धे सरणं पवज्जामि, साहू सरणं पवज्जामि, केवलि-पन्नत्तं धम्मं सरणं पवज्जामि।`,
    transliteration: `Chattari Mangalam — Arihanta Mangalam, Siddha Mangalam, Sahu Mangalam, Kevali-pannatto Dhammo Mangalam.
Chattari Loguttama — Arihanta Loguttama, Siddha Loguttama, Sahu Loguttama, Kevali-pannatto Dhammo Loguttamo.
Chattari Saranam Pavajjami — Arihante Saranam Pavajjami, Siddhe Saranam Pavajjami, Sahu Saranam Pavajjami, Kevali-pannattam Dhammam Saranam Pavajjami.`,
    meaning: `Four are auspicious: the Arihantas, the Siddhas, the Sadhus, and the Dharma proclaimed by the Omniscient.
Four are the most exalted in the universe: the Arihantas, the Siddhas, the Sadhus, and the Dharma proclaimed by the Omniscient.
I take refuge in the four: the Arihantas, the Siddhas, the Sadhus, and the Dharma proclaimed by the Omniscient.`,
    youtubeSearchUrl: yt('Chattari Mangalam Jain Sutra'),
  },
  {
    id: 'mangalacharan',
    name: 'Mangalacharan',
    nameDevanagari: 'मंगलाचरण',
    category: 'devotional',
    sect: 'both',
    shortDescription: 'Auspicious invocation recited at the beginning of any spiritual activity.',
    textDevanagari: `अर्हं इति वर्ण-गण-समूह सम्भूतम्।
सर्व-व्याप्तं स्वयं ज्योतिः, परम-तत्त्व-प्रकाशकम्॥
अनन्त-दर्शन-ज्ञानम्, अनन्त-वीर्य-सहितम्।
अनन्त-सुख-स्वरूपम्, सिद्धि-दायकं नमाम्यहम्॥`,
    transliteration: `Arham iti varna-gana-samuha sambhutam.
Sarva-vyaptam svayam jyotih, parama-tattva-prakashakam.
Ananta-darshana-jnanam, ananta-virya-sahitam.
Ananta-sukha-svarupam, siddhi-dayakam namamy-aham.`,
    meaning:
      'I bow to "Arham" — born of all letters, all-pervading, self-luminous, illuminator of the supreme reality, embodied with infinite perception, infinite knowledge, infinite energy, and infinite bliss — the bestower of liberation.',
    youtubeSearchUrl: yt('Jain Mangalacharan Arham'),
  },

  // ─── SHVETAMBAR PRAYERS ────────────────────────────────────
  {
    id: 'logassa-sutra',
    name: 'Logassa Sutra',
    nameDevanagari: 'लोगस्स सूत्र',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription:
      'The Chaturvimshati Stava — praise of the 24 Tirthankaras of the current cosmic age.',
    textDevanagari: `लोगस्स उज्जोयगरे, धम्म-तित्थयरे जिणे।
अरिहंते कित्तइस्सं, चउवीसं पि केवली॥
उसभमजियं च वंदे, संभवमभिनंदणं च सुमइं च।
पउमप्पहं सुपासं, जिणं च चंदप्पहं वंदे॥
सुविहिं च पुप्फदंतं, सीयल-सिज्जंस-वासुपुज्जं च।
विमलमणंतं च जिणं, धम्मं संतिं च वंदामि॥
कुंथुं अरं च मल्लिं, वंदे मुणिसुव्वयं नमिजिणं च।
वंदामि रिट्ठनेमिं, पासं तह वद्धमाणं च॥
एवं मए अभिथुआ, विहुय-रय-मला पहीण-जर-मरणा।
चउवीसं पि जिणवरा, तित्थयरा मे पसीयंतु॥
कित्तिय-वंदिय-महिया, जे ए लोगस्स उत्तमा सिद्धा।
आरुग्ग-बोहिलाभं, समाहिवरमुत्तमं दिंतु॥
चंदेसु निम्मलयरा, आइच्चेसु अहियं पयासयरा।
सागर-वर-गंभीरा, सिद्धा सिद्धिं मम दिसंतु॥`,
    transliteration: `Logassa ujjoyagare, dhamma-titthayare jine.
Arihante kittaissam, chauvisam pi kevali.
Usabhamajiyam cha vande, sambhavamabhinandanam cha sumaim cha.
Paumappaham supasam, jinam cha chandappaham vande.
Suvihim cha pupphadantam, siyala-sijjamsa-vasupujjam cha.
Vimalamanantam cha jinam, dhammam santim cha vandami.
Kunthum aram cha mallim, vande munisuvvayam nami-jinam cha.
Vandami ritthanemim, pasam taha vaddhamanam cha.
Evam mae abhithua, vihuya-raya-mala pahina-jara-marana.
Chauvisam pi jina-vara, titthayara me pasiyantu.
Kittiya-vandiya-mahiya, je e logassa uttama siddha.
Arugga-bohi-labham, samahivara-muttamam dintu.
Chandesu nimmalayara, aichhesu ahiyam payasayara.
Sagara-vara-gambhira, siddha siddhim mama disantu.`,
    meaning: `I shall extol the 24 Jinas — the illuminators of the universe, founders of the dharma-tirtha, omniscient ones.
I bow to: Rishabh, Ajit, Sambhav, Abhinandan, Sumati, Padmaprabh, Suparshva, Chandraprabh, Suvidhi (Pushpadant), Sheetal, Shreyans, Vasupujya, Vimal, Anant, Dharma, Shanti, Kunthu, Ar, Malli, Munisuvrat, Nami, Arishtanemi, Parshva, and Vardhaman (Mahavir).
May these 24 Jinas — free from karmic dust, beyond aging and death — be pleased with me.
May they grant me good health, enlightenment, and the highest meditation.
Purer than the moon, more radiant than the sun, deep as the ocean — may the Siddhas grant me liberation.`,
    youtubeSearchUrl: yt('Logassa Sutra'),
  },
  {
    id: 'uvasaggaharam-stotra',
    name: 'Uvasaggaharam Stotra',
    nameDevanagari: 'उवसग्गहरं स्तोत्र',
    category: 'stotra',
    sect: 'shvetambar',
    shortDescription:
      'Composed by Acharya Bhadrabahu in praise of Lord Parshvanath — removes obstacles and afflictions.',
    textDevanagari: `उवसग्गहरं पासं, पासं वंदामि कम्मघण-मुक्कं।
विसहर-विस-निन्नासं, मंगल-कल्लाण-आवासं॥
विसहर-फुलिंग-मंतं, कण्ठे धारेइ जो सया मणुओ।
तस्स गह-रोग-मारी, दुट्ठ-जरा जंति उवसामं॥
चिट्ठउ दूरे मंतो, तुज्झ पणामो वि बहु-फलो होइ।
नर-तिरिएसु वि जीवा, पावंति न दुक्ख-दोगच्चं॥
तुह सम्मत्ते लद्धे, चिंतामणि-कप्पपायव-ब्भहिए।
पावंति अविग्घेणं, जीवा अयरामरं ठाणं॥
इअ संथुओ महायस, भत्तिब्भर-निब्भरेण हियएण।
ता देव दिज्ज बोहिं, भवे भवे पास जिणचंद॥`,
    transliteration: `Uvasagga-haram pasam, pasam vandami kamma-ghana-mukkam.
Visahara-visa-ninnasam, mangala-kallana-avasam.
Visahara-phulinga-mantam, kanthe dharei jo saya manuo.
Tassa gaha-roga-mari, duttha-jara janti uvasamam.
Chitthau dure manto, tujjha panamo vi bahu-phalo hoi.
Nara-tiriesu vi jiva, pavanti na dukkha-dogachcham.
Tuha sammatte laddhe, chintamani-kappa-paayava-bbhahie.
Pavanti aviggenam, jiva ayaramaram thanam.
Ia santhuo mahayasa, bhattibbhara-nibbharena hiyaena.
Ta deva dijja bohim, bhave bhave pasa jina-chanda.`,
    meaning: `I bow to Parshva, who removes all afflictions, who is free from the cloud of karma, who destroys the poison of serpents, who is the abode of all auspiciousness and welfare.
One who always carries the "Visahara-phulinga" mantra in their heart is freed from planetary afflictions, diseases, epidemics, and chronic ailments.
Even setting aside the mantra, just bowing to you bears great fruit — beings born as humans or animals do not suffer misery and misfortune.
Once one attains right faith in you — like a wish-fulfilling jewel — souls effortlessly attain the immortal abode.
Thus, O glorious one, with a heart overflowing with devotion, I praise you. O Lord, O moon among Jinas, grant me enlightenment in every birth.`,
    youtubeSearchUrl: yt('Uvasaggaharam Stotra'),
  },
  {
    id: 'tijaypahutta',
    name: 'Tijaypahutta Stotra',
    nameDevanagari: 'तिजयपहुत्त स्तोत्र',
    category: 'stotra',
    sect: 'shvetambar',
    shortDescription:
      'Salutation to the 170 Jinas of the three worlds across all directions and times.',
    textDevanagari: `तिजय-पहुत्त-पयासय, अट्ठ-महा-पाडिहेर-जुत्ताणं।
समय-खित्त-ट्ठियाणं, सरेमि चक्किट्ठ-वसहाणं॥`,
    transliteration: `Tijaya-pahutta-payasaya, attha-maha-padihera-juttanam.
Samaya-khitta-tthiyanam, saremi chakkittha-vasahanam.`,
    meaning:
      'I remember the Lords of the three worlds — endowed with the eight great miracles, residing in time-space, supreme like Chakravartins — the 170 Jinas of the present cosmic moment.',
    youtubeSearchUrl: yt('Tijaypahutta Stotra'),
  },
  {
    id: 'santikaram-stotra',
    name: 'Santikaram Stotra',
    nameDevanagari: 'संतिकरं स्तोत्र',
    category: 'stotra',
    sect: 'shvetambar',
    shortDescription:
      'Composed by Munisundarsuri — invokes peace, removes calamities, brings prosperity.',
    textDevanagari: `संतिकरं संतिजिणं, जग-सरणं जय-सिरीइ-दायारं।
समर-समिर्चन-नमिरं, नमामि संतिं गुणारिहं॥`,
    transliteration: `Santikaram santi-jinam, jaga-saranam jaya-sirii-dayaram.
Samara-samirchana-namiram, namami santim gunariham.`,
    meaning:
      'I bow to Lord Shantinath — bringer of peace, refuge of the world, bestower of victorious prosperity, worshipped by gods and men, worthy of all virtues.',
    youtubeSearchUrl: yt('Santikaram Stotra'),
  },
  {
    id: 'jay-veeyaraya',
    name: 'Jay Veeyaraya Sutra',
    nameDevanagari: 'जय वीयराय',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription:
      'Recited at the close of devotion — praise of the dispassionate Lord, asking for spiritual gifts.',
    textDevanagari: `जय वीयराय जग-गुरु, होउ ममं तुह पभावओ भयवं।
भव-निव्वेओ मग्गाणुसारिआ, इट्ठ-फल-सिद्धी॥
लोग-विरुद्ध-च्चाओ, गुरुजण-पूआ परत्थ-करणं च।
सुह-गुरु-जोगो तव्वयण-सेवणा, आभवमखंडा॥`,
    transliteration: `Jaya viyaraya jaga-guru, hou mamam tuha pabhavao bhayavam.
Bhava-nivvea magganusariya, ittha-phala-siddhi.
Loga-viruddhachchao, guru-jana-pua parattha-karanam cha.
Suha-guru-jogo tavvayana-sevana, abhavamakhanda.`,
    meaning: `Victory to you, O dispassionate one, O teacher of the world! By your grace, may I attain:
detachment from worldly existence, the path of righteousness, fulfillment of beneficial wishes;
abandonment of unworthy conduct, devotion to elders, service to others;
the company of true gurus, devotion to their teachings — uninterrupted until liberation.`,
    youtubeSearchUrl: yt('Jay Veeyaraya Sutra'),
  },
  {
    id: 'karemi-bhante',
    name: 'Karemi Bhante Sutra',
    nameDevanagari: 'करेमि भंते सूत्र',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription:
      'The fundamental sutra of Samayik (equanimity meditation) — vow of self-restraint.',
    textDevanagari: `करेमि भंते! सामाइयं, सावज्जं जोगं पच्चक्खामि।
जाव नियमं पज्जुवासामि, दुविहं तिविहेणं — मणेणं वायाए कारणं —
न करेमि न कारवेमि, तस्स भंते! पडिक्कमामि निंदामि गरिहामि अप्पाणं वोसिरामि॥`,
    transliteration: `Karemi bhante! Samaiyam, savajjam jogam pachchakkhami.
Java niyamam pajjuvasami, duviham tiviheam — manenam vayae karanam —
na karemi na karavemi, tassa bhante! Padikkamami nindami garihami appanam vosirami.`,
    meaning: `O Lord! I undertake Samayik (equanimity). I renounce all sinful activities.
For as long as I am observing this vow, in two ways and three modes — by mind, speech, and body —
I shall neither do nor cause others to do (sinful actions). O Lord, I withdraw from such actions, censure them, denounce them, and renounce my (wrong) self.`,
    youtubeSearchUrl: yt('Karemi Bhante Samayik Sutra'),
  },
  {
    id: 'vandittu-sutra',
    name: 'Vandittu Sutra',
    nameDevanagari: 'वंदित्तु सूत्र',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription:
      'The Shravak (lay devotee) Pratikraman sutra — confession of transgressions of the 12 vows.',
    textDevanagari: `वंदित्तु सव्व-सिद्धे, धम्मायरिए अ सव्व-साहू अ।
इच्छामि पडिक्कमिउं, सावग-धम्माइयारस्स॥`,
    transliteration: `Vandittu savva-siddhe, dhammayarie a savva-sahu a.
Ichchhami padikkamium, savaga-dhammaiyarassa.`,
    meaning:
      'Having bowed to all the Siddhas, the religious teachers, and all the monks — I wish to repent for any transgressions in the conduct prescribed for a lay devotee (Shravak).',
    youtubeSearchUrl: yt('Vandittu Sutra Pratikraman'),
  },
  {
    id: 'iccha-mi-padikkamium',
    name: 'Ichchhami Padikkamium',
    nameDevanagari: 'इच्छामि पडिक्कमिउं',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription: 'The "Iriyavahi" sutra — repentance for unintentional harm caused while walking.',
    textDevanagari: `इच्छामि पडिक्कमिउं इरियावहियाए विराहणाए,
गमणागमणे पाण-क्कमणे बीय-क्कमणे, हरिय-क्कमणे
ओसा उत्तिंग पणग दग मट्टी मक्कडा संताणा-संकमणे,
जे मे जीवा विराहिया — एगिंदिया, बेइंदिया, तेइंदिया, चउरिंदिया, पंचिंदिया।
अभिहया वत्तिया लेसिया संघाइया संघट्टिया परियाविया किलामिया उद्दविया
ठाणाओ ठाणं संकामिया जीवियाओ ववरोविया, तस्स मिच्छा मि दुक्कडं॥`,
    transliteration: `Ichchhami padikkamium iriyavahiyae virahanae,
gamanagamane pana-kkamane biya-kkamane, hariya-kkamane
osa uttinga panaga daga matti makkada santana-sankamane,
je me jiva virahiya — egindiya, beindiya, teindiya, chaurindiya, panchindiya.
Abhihaya vattiya lesiya sanghaiya sanghattiya pariyaviya kilamiya uddaviya
thanao thanam sankamiya jiviyao vavaroviya, tassa michchha mi dukkadam.`,
    meaning:
      'I wish to repent for any harm caused while walking — by stepping on living beings, seeds, vegetation, dew, anthills, mold, water, mud, or spider webs. To any one-sensed, two-sensed, three-sensed, four-sensed, or five-sensed beings I may have struck, dusted, crushed, brought together, touched, pained, tired, frightened, displaced, or deprived of life — may all my misdeeds be in vain (forgiven).',
    youtubeSearchUrl: yt('Iriyavahi Sutra Ichhami Padikkamiu'),
  },
  {
    id: 'namutthunam',
    name: 'Namutthunam (Shakrastava)',
    nameDevanagari: 'नमुत्थुणं',
    category: 'sutra',
    sect: 'shvetambar',
    shortDescription: 'The praise hymn recited by Indra (king of gods) for the Tirthankaras.',
    textDevanagari: `नमुत्थु णं अरिहंताणं भगवंताणं।
आइगराणं तित्थयराणं सयं-संबुद्धाणं।
पुरिसुत्तमाणं पुरिस-सीहाणं पुरिस-वर-पुंडरीयाणं पुरिस-वर-गंध-हत्थीणं।
लोगुत्तमाणं लोग-नाहाणं लोग-हियाणं लोग-पईवाणं लोग-पज्जोयगराणं।
अभय-दयाणं चक्खु-दयाणं मग्ग-दयाणं सरण-दयाणं बोहि-दयाणं।
धम्म-दयाणं धम्म-देसयाणं धम्म-नायगाणं धम्म-सारहीणं धम्म-वर-चाउरंत-चक्कवट्टीणं।
अप्पडिहय-वर-नाण-दंसण-धराणं वियट्ट-छउमाणं।
जिणाणं जावयाणं तिन्नाणं तारयाणं बुद्धाणं बोहयाणं मुत्ताणं मोयगाणं।
सव्वन्नूणं सव्व-दरिसीणं, सिव-मयल-मरुयमणंत-मक्खय-मव्वाबाह-मपुणरावित्ति
सिद्धि-गइ-नामधेयं ठाणं संपत्ताणं नमो जिणाणं जिय-भयाणं॥`,
    transliteration: `Namutthu nam arihantanam bhagavantanam.
Aigaranam titthayaranam sayam-sambuddhanam.
Purisuttamanam purisa-sihanam purisa-vara-pundariyanam purisa-vara-gandha-hatthinam.
Loguttamanam loga-nahanam loga-hiyanam loga-paivanam loga-pajjoyagaranam.
Abhaya-dayanam chakkhu-dayanam magga-dayanam sarana-dayanam bohi-dayanam.
Dhamma-dayanam dhamma-desayanam dhamma-nayaganam dhamma-sarahinam dhamma-vara-chauranta-chakkavattinam.
Appadihaya-vara-nana-damsana-dharanam viyatta-chhaumanam.
Jinanam javayanam tinnanam tarayanam buddhanam bohayanam muttanam moyaganam.
Savvannunam savva-darisinam, siva-mayala-maruyamanantamakkhayamavvabaha-mapunaravitti
siddhi-gai-namadheyam thanam sampattanam namo jinanam jiya-bhayanam.`,
    meaning: `Salutations to the venerable Arihantas, the lord-makers, the founders of the dharma-tirtha, the self-enlightened ones.
The supreme among men, lions among men, the best lotus among men, the great fragrant elephant among men.
The most exalted in the world, lords of the world, benefactors of the world, lamps of the world, illuminators of the world.
Givers of fearlessness, givers of vision, givers of the path, givers of refuge, givers of enlightenment.
Givers of dharma, teachers of dharma, leaders of dharma, charioteers of dharma, supreme four-edged emperors of dharma.
Bearers of unhindered, supreme knowledge and perception, free from delusion.
Conquerors who help others conquer, crossed-over who help others cross, awakened who awaken others, liberated who liberate others.
Omniscient, all-perceiving — who have attained the abode called "Siddha-gati": auspicious, immovable, free from disease, eternal, indestructible, unobstructed, without return.
Salutations to the Jinas, the conquerors of fear.`,
    youtubeSearchUrl: yt('Namutthunam Shakrastava'),
  },

  // ─── DIGAMBAR PRAYERS ──────────────────────────────────────
  {
    id: 'bhaktamar-stotra',
    name: 'Bhaktamar Stotra',
    nameDevanagari: 'भक्तामर स्तोत्र',
    category: 'stotra',
    sect: 'digambar',
    shortDescription:
      'Composed by Acharya Manatunga — 48 verses praising Lord Adinath (Rishabhdev). Recited by both sects but prominent in Digambar tradition.',
    textDevanagari: `भक्तामर-प्रणत-मौलि-मणि-प्रभाणाम्,
उद्योतकं दलित-पाप-तमो-वितानम्।
सम्यक् प्रणम्य जिन-पाद-युगं युगादा-
वालम्बनं भव-जले पततां जनानाम्॥१॥

यः संस्तुतः सकल-वाङ्मय-तत्त्व-बोधाद्-
उद्भूत-बुद्धि-पटुभिः सुर-लोक-नाथैः।
स्तोत्रैर्जगत्-त्रितय-चित्त-हरैरुदारैः,
स्तोष्ये किलाहमपि तं प्रथमं जिनेन्द्रम्॥२॥`,
    transliteration: `Bhaktamara-pranata-mauli-mani-prabhanam,
Udyotakam dalita-papa-tamo-vitanam.
Samyak pranamya jina-pada-yugam yugada-
Valambanam bhava-jale patatam jananam. (1)

Yah samstutah sakala-vangmaya-tattva-bodhad,
Udbhuta-buddhi-patubhih sura-loka-nathaih.
Stotrair jagat-tritaya-chitta-harair udaraih,
Stoshye kilaham api tam prathamam jinendram. (2)

[44 more verses follow — search YouTube for the full chant.]`,
    meaning: `(Verse 1) Bowing reverently to the lotus feet of the first Jina — feet whose toenails are illumined by the gems on the crowns of devoted gods; feet which dispel the dense darkness of sins; feet which are the only support for souls drowning in the ocean of worldly existence.

(Verse 2) Even though great gods, with intellects sharpened by knowledge of all scriptures, have praised Him with hymns that capture the hearts of all three worlds — even I shall now attempt to praise that first Jinendra.

[The full Bhaktamar consists of 48 Sanskrit verses, each renowned for its devotional power. Many devotees memorize and recite all 48 daily.]`,
    youtubeSearchUrl: yt('Bhaktamar Stotra'),
  },
  {
    id: 'kalyana-mandir-stotra',
    name: 'Kalyana Mandir Stotra',
    nameDevanagari: 'कल्याण मंदिर स्तोत्र',
    category: 'stotra',
    sect: 'digambar',
    shortDescription:
      'Composed by Acharya Siddhasena Divakara in praise of Lord Parshvanath — 44 verses.',
    textDevanagari: `कल्याण-मन्दिर-मुदार-मवद्य-भेदि,
भीताभय-प्रदम् अनिन्दित-मङ्घ्रि-पद्मम्।
संसार-सागर-निमज्जद्-अशेष-जन्तु-
पोतायमानम् अभिनम्य जिनेश्वरस्य॥१॥`,
    transliteration: `Kalyana-mandira-mudara-mavadya-bhedi,
Bhitabhaya-pradam aninditam-anghri-padmam.
Samsara-sagara-nimajjad-ashesha-jantu-
Potayamanam abhinamya jineshvarasya. (1)

[43 more verses follow.]`,
    meaning:
      'Bowing to the lotus feet of the Jinendra — abode of all welfare, splendid, dispeller of all sins, giver of fearlessness to the frightened, irreproachable — feet which serve as a boat for all beings drowning in the ocean of samsara.',
    youtubeSearchUrl: yt('Kalyana Mandir Stotra'),
  },
  {
    id: 'sakalikarana-mantra',
    name: 'Sakalikarana Mantra',
    nameDevanagari: 'सकलीकरण मंत्र',
    category: 'mantra',
    sect: 'digambar',
    shortDescription: 'Recited at the start of puja for spiritual purification of the body and surroundings.',
    textDevanagari: `ॐ णमो अरिहंताणं ह्रां ह्रीं ह्रूं ह्रौं ह्रः
असि आ उ सा नमो नमः
सम्यग्दर्शन-ज्ञान-चारित्रेभ्यो नमः
स्वाहा॥`,
    transliteration: `Om namo arihantanam hraam hreem hroom hraum hraha
Asi a u sa namo namah
Samyag-darshan-jnana-charitrebhyo namah
Svaha.`,
    meaning:
      'Om, salutations to the Arihantas. (Bija mantras) Hraam, Hreem, Hroom, Hraum, Hraha. Asi-A-U-Sa, salutations again and again. Salutations to right faith, right knowledge, and right conduct. Svaha.',
    youtubeSearchUrl: yt('Sakalikarana Mantra Jain Puja'),
  },
  {
    id: 'meri-bhavna',
    name: 'Meri Bhavna',
    nameDevanagari: 'मेरी भावना',
    category: 'devotional',
    sect: 'digambar',
    shortDescription:
      'A modern Hindi devotional poem by Pandit Jugal Kishore Mukhtar expressing the highest spiritual aspirations.',
    textDevanagari: `जिसने राग-द्वेष कामादिक, जीते सब जग जान लिया।
सब जीवों को मोक्ष-मार्ग का, निस्पृह हो उपदेश दिया॥
बुद्ध, वीर, जिन, हरि, हर, ब्रह्मा, या उसको स्वाधीन कहो।
भक्ति-भाव से प्रेरित होकर, मैं तो उसकी शरण गहूँ॥
विषयों की आशा नहिं जिनके, साम्य-भाव धन रखते हैं।
निज-पर के हित-साधन में जो, निशि-दिन तत्पर रहते हैं॥
स्वार्थ त्याग की कठिन तपस्या, बिना खेद जो करते हैं।
ऐसे ज्ञानी साधु जगत के, दुःख-समूह को हरते हैं॥`,
    transliteration: `Jisne raga-dvesha kamadik, jite sab jag jaan liya.
Sab jivon ko moksha-marg ka, nispriha ho upadesh diya.
Buddha, Vir, Jin, Hari, Har, Brahma, ya usko svadhin kaho.
Bhakti-bhav se prerit hokar, main to uski sharan gahun.
Vishayon ki asha nahin jinke, samya-bhav dhan rakhte hain.
Nij-par ke hit-sadhan mein jo, nishi-din tatpar rahte hain.
Svartha tyag ki kathin tapasya, bina khed jo karte hain.
Aise jnani sadhu jagat ke, dukh-samuh ko harte hain.

[The full poem has 11 verses.]`,
    meaning: `One who has conquered attachment, aversion, and desires — who knows the entire world; who selflessly preached the path of liberation to all souls — call him Buddha, Mahavir, Jin, Vishnu, Shiva, Brahma, or simply the Self-Liberated One. Inspired by devotion, I take refuge in him.

Those who have no desire for sensory pleasures, who hold equanimity as their wealth, who day and night strive for the welfare of self and others, who endure the difficult austerity of self-renunciation without complaint — such enlightened sages remove the suffering of the entire world.`,
    youtubeSearchUrl: yt('Meri Bhavna Jain Bhajan Pandit Jugal Kishore'),
  },
  {
    id: 'visapahar-stotra',
    name: 'Visapahar Stotra',
    nameDevanagari: 'विषापहार स्तोत्र',
    category: 'stotra',
    sect: 'digambar',
    shortDescription: 'Composed by Acharya Dhananjaya — praise of Lord Adinath, removes spiritual "poison".',
    textDevanagari: `नमः श्रीवर्धमानाय निर्धूत-कलिलात्मने।
सालोक-लोक-लोकाय भगवते अर्हते सततम्॥`,
    transliteration: `Namah shri-vardhamanaya nirdhuta-kalil-atmane.
Salok-lok-lokaya bhagavate arhate satatam.`,
    meaning:
      'Salutations always to the venerable Vardhaman (Mahavir) — whose soul is purified of all impurities, who illumines all the worlds with their inhabitants, the worshipped Arhat.',
    youtubeSearchUrl: yt('Visapahar Stotra'),
  },
  {
    id: 'devvandana',
    name: 'Devvandana',
    nameDevanagari: 'देव वन्दना',
    category: 'aradhana',
    sect: 'digambar',
    shortDescription: 'The daily morning devotional ritual — bowing to the deities (Tirthankaras).',
    textDevanagari: `णमो जिणाणं जिदभवाणं
विदभवाणं तिलोयगुरुवाणं।
सिद्धाणं णमो सिद्धाणं
णमो आचारिय उवज्झायाणं
णमो लोए सव्व-साहूणं॥`,
    transliteration: `Namo jinanam jida-bhavanam
vida-bhavanam tiloya-guruvanam.
Siddhanam namo siddhanam
namo achariya uvajjhayanam
namo loe savva-sahunam.`,
    meaning:
      'Salutations to the Jinas who have conquered worldly existence, who are free from worldly bondage, who are the teachers of the three worlds. Salutations to the Siddhas, the Acharyas, the Upadhyayas, and to all the monks of the universe.',
    youtubeSearchUrl: yt('Digambar Jain Devvandana'),
  },
  {
    id: 'dasalakshana-dharma',
    name: 'Dasalakshana Dharma Stotra',
    nameDevanagari: 'दसलक्षण धर्म स्तोत्र',
    category: 'stotra',
    sect: 'digambar',
    shortDescription:
      'Praise of the ten characteristics of dharma (recited especially during Paryushan / Dasalakshana Parva).',
    textDevanagari: `उत्तमक्षमा मार्दवमार्जव-शौच-सत्य-संयम-तपः।
त्यागाकिंचन्य-ब्रह्मचर्याणि धर्मं दशलक्षणानि॥`,
    transliteration: `Uttama-kshama mardavam arjava-shaucha-satya-samyama-tapah.
Tyag-akinchanya-brahmacharyani dharmam dasha-lakshanani.`,
    meaning: `The ten characteristics of dharma are:
1. Supreme Forbearance (Kshama)
2. Humility (Mardav)
3. Straightforwardness (Arjav)
4. Purity / Contentment (Shauch)
5. Truth (Satya)
6. Self-restraint (Sanyam)
7. Austerity (Tap)
8. Renunciation (Tyag)
9. Non-possessiveness (Akinchanya)
10. Celibacy / Chastity (Brahmacharya)`,
    youtubeSearchUrl: yt('Dasalakshana Dharma Stotra Paryushan'),
  },
  {
    id: 'ratnakar-pachisi',
    name: 'Ratnakar Pachisi',
    nameDevanagari: 'रत्नाकर पच्चीसी',
    category: 'devotional',
    sect: 'digambar',
    shortDescription:
      '25 verses of self-introspection composed by Acharya Ratnakar Suri — confession of one\'s shortcomings.',
    textDevanagari: `आपको देखकर मेरे मन में, यह विचार उठता है।
ओ दीनदयाल! आपके सम्मुख, क्या सुनाऊँ अपनी कथा॥`,
    transliteration: `Aapko dekh-kar mere man mein, yah vichar uthata hai.
O dindayal! Aapke sammukh, kya sunaun apani katha.

[Full poem has 25 verses of confession and surrender.]`,
    meaning:
      'Looking at you (Lord), this thought arises in my mind: O Compassionate One! Standing before you, what story of mine shall I narrate? (Each subsequent verse confesses different shortcomings and asks for grace.)',
    youtubeSearchUrl: yt('Ratnakar Pachisi Jain Stotra'),
  },
  {
    id: 'swayambhu-stotra',
    name: 'Swayambhu Stotra',
    nameDevanagari: 'स्वयम्भू स्तोत्र',
    category: 'stotra',
    sect: 'digambar',
    shortDescription:
      'Composed by Acharya Samantabhadra — praise of all 24 Tirthankaras, 5 verses each.',
    textDevanagari: `स्वयम्भुवा भूत-हितेन भूतले
समन्तभद्रेण विनेय-संपदा।
स्तुति-व्ययत्या अहत्व-तत्वतः
प्रसन्नता मे भवदन्यथा कुतः॥`,
    transliteration: `Svayambhuva bhuta-hitena bhutale
samanta-bhadrena vineya-sampada.
Stuti-vyayatya ahatva-tattvatah
prasannata me bhavad-anyatha kutah.`,
    meaning:
      'By the self-arisen one — the universal benefactor — Samantabhadra, with disciplinary wealth, on this earth, through the praise of the truth of the Arhats, where else would my serenity arise from, if not from you?',
    youtubeSearchUrl: yt('Swayambhu Stotra Samantabhadra'),
  },
];
