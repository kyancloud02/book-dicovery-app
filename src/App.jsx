import { useState, useEffect, useRef, useCallback } from "react";
import { Search, X, BookOpen, ChevronRight, Shield, Heart, Sparkles, Eye, Star, Sliders, Database, Globe, RefreshCw, Users, User, Flame, Zap } from "lucide-react";

/* ═══ TOKENS ═══ */
const A="#1A7A6D",AW="#C4653A",BG="#F9F7F2",BGC="#FFFFFF",INK="#2D3436",BODY="#636E72",MU="#A4A9AD",BD="#E8E5DF",RED="#B91C1C",GOLD="#8B6914";
const SF="'Playfair Display',Georgia,serif",BSF="'Source Serif 4',Georgia,serif",SN="'Libre Franklin',sans-serif";

/*  ════════════════════════════════════════════════════════════════
    CONTENT TAXONOMY — every entry is classified with:
    ─ lead: "Male" | "Female" | "Ensemble"
    ─ dynamics: "Solo" | "Duo" | "Team" | "Harem"
    ─ sensuality: "None" | "Low" | "Moderate" | "High"
    ─ occult: 1-5 (1=no magic, 3=fantasy magic, 5=demonic pacts as good)
    ─ virtues: 3 Core Virtues (Faith Bridge)
    ─ hooks: 3 structural genres / core hooks
    ─ maturity: "G" | "PG" | "PG-13" | "R"
    ─ tone: emotional tone tag for matching
    ════════════════════════════════════════════════════════════════ */

/* ═══ SPIRIT BOOKS ═══ */
const SPIRIT_BOOKS = [
  { id:"sb-1",title:"The Wingfeather Saga",author:"Andrew Peterson",type:"novel",
    synopsis:"In the land of Skree, the Igiby children discover they are heirs to a forgotten kingdom and must flee the fanged overlords who hunt them. A story of sacrifice, courage, and stubborn hope.",
    faith_score:9.5,genres:["Fantasy","Adventure"],tags:["Redemption","Family Bond"],
    lead:"Ensemble",dynamics:"Team",sensuality:"None",occult:2,maturityRating:"PG",
    virtues:["Protective","Courageous","Loyal"],hooks:["World Building","Coming of Age","Quest Narrative"],
    tone:"Heroic",year:2008,pages:325,source:"spirit-books" },
  { id:"sb-2",title:"The Screwtape Letters",author:"C.S. Lewis",type:"novel",
    synopsis:"A senior demon writes letters to his nephew on corrupting a human soul. Lewis inverts the demonic perspective to illuminate spiritual warfare in everyday choices, temptation, and grace.",
    faith_score:10,genres:["Satire","Theology"],tags:["Spiritual Warfare","Grace"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:3,maturityRating:"PG-13",
    virtues:["Truth-Seeker","Discerning","Vigilant"],hooks:["Epistolary","Psychological Warfare","Moral Philosophy"],
    tone:"Cerebral",year:1942,pages:175,source:"spirit-books" },
  { id:"sb-3",title:"Till We Have Faces",author:"C.S. Lewis",type:"novel",
    synopsis:"A retelling of Cupid and Psyche from the ugly elder sister. Orual's rage against the gods mirrors the self-deception keeping mortals from divine encounter.",
    faith_score:9.7,genres:["Mythology","Fantasy"],tags:["Self-Deception","Suffering"],
    lead:"Female",dynamics:"Solo",sensuality:"Low",occult:3,maturityRating:"PG-13",
    virtues:["Truth-Seeker","Humble","Self-Aware"],hooks:["Myth Retelling","Unreliable Narrator","Character Study"],
    tone:"Melancholic",year:1956,pages:313,source:"spirit-books" },
  { id:"sb-4",title:"Hinds' Feet on High Places",author:"Hannah Hurnard",type:"novel",
    synopsis:"Much-Afraid is called by the Good Shepherd to journey to the High Places. Companions named Sorrow and Suffering teach her the path to joy is never expected.",
    faith_score:9.6,genres:["Allegory","Fantasy"],tags:["Faith Journey","Transformation"],
    lead:"Female",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"G",
    virtues:["Trusting","Enduring","Hopeful"],hooks:["Allegory","Journey Narrative","Transformation Arc"],
    tone:"Tender",year:1955,pages:240,source:"spirit-books" },
  { id:"sb-5",title:"Perelandra",author:"C.S. Lewis",type:"novel",
    synopsis:"Ransom is sent to Venus to prevent a second Fall. On a paradisal floating world, he faces a Tempter armed with relentless persuasion and must decide what faithfulness costs.",
    faith_score:9.9,genres:["Science Fiction","Theology"],tags:["Temptation","Heroic Boldness"],
    lead:"Male",dynamics:"Solo",sensuality:"Low",occult:3,maturityRating:"PG-13",
    virtues:["Courageous","Faithful","Steadfast"],hooks:["Theological Sci-Fi","Moral Duel","Alien World"],
    tone:"Epic",year:1943,pages:222,source:"spirit-books" },
  { id:"sb-6",title:"The Pilgrim's Progress",author:"John Bunyan",type:"novel",
    synopsis:"Christian flees the City of Destruction. His journey passes through the Slough of Despond, Vanity Fair, and Doubting Castle — allegories for every believer's trials.",
    faith_score:10,genres:["Allegory","Adventure"],tags:["Perseverance","Redemption"],
    lead:"Male",dynamics:"Solo",sensuality:"None",occult:2,maturityRating:"G",
    virtues:["Persevering","Hopeful","Courageous"],hooks:["Allegory","Quest Narrative","Spiritual Journey"],
    tone:"Resolute",year:1678,pages:336,source:"spirit-books" },
  { id:"sb-7",title:"Silence",author:"Shūsaku Endō",type:"novel",
    synopsis:"A Jesuit priest travels to 17th-century Japan to find his apostate mentor. Under persecution, he confronts why God remains silent when His people suffer.",
    faith_score:9.0,genres:["Historical Fiction","Theology"],tags:["Martyrdom","Doubt & Faith"],
    lead:"Male",dynamics:"Solo",sensuality:"None",occult:1,maturityRating:"R",
    virtues:["Enduring","Sacrificial","Faithful"],hooks:["Historical Drama","Crisis of Faith","Persecution Narrative"],
    tone:"Anguished",year:1966,pages:201,source:"spirit-books" },
  { id:"sb-8",title:"A Voice in the Wind",author:"Francine Rivers",type:"novel",
    synopsis:"Hadassah, a Jewish slave in first-century Rome, lives out her faith amid gladiatorial spectacle. Her gentle witness transforms lives — even as it costs her everything.",
    faith_score:9.4,genres:["Historical Fiction","Romance"],tags:["Sacrificial Love","Courage"],
    lead:"Female",dynamics:"Duo",sensuality:"Low",occult:1,maturityRating:"PG-13",
    virtues:["Humble","Courageous","Gentle"],hooks:["Historical Romance","Martyrdom Drama","Culture Clash"],
    tone:"Tender",year:1993,pages:500,source:"spirit-books" },
];

/* ═══ ANIME/MANGA CORPUS ═══ */
const CORPUS = [
  { id:"a-1",title:"Frieren: Beyond Journey's End",subtitle:"葬送のフリーレン",author:"Kanehito Yamada",type:"anime",
    synopsis:"An elven mage outlives her mortal companions after defeating the Demon King. Decades later she retraces their journey, learning what it means to understand a human heart before time erases every memory.",
    genres:["Fantasy","Adventure","Drama"],tags:["Fantasy","Drama","Seinen"],
    lead:"Female",dynamics:"Team",sensuality:"None",occult:3,maturityRating:"PG-13",
    virtues:["Devoted","Reflective","Selfless"],hooks:["World Building","Character Study","Bittersweet Journey"],
    tone:"Melancholic",mal_score:9.3,episodes:28,year:2023,cover_url:"https://cdn.myanimelist.net/images/anime/1015/138006l.jpg",source:"jikan" },
  { id:"a-2",title:"Steins;Gate",subtitle:"シュタインズ・ゲート",author:"5pb./Nitroplus",type:"anime",
    synopsis:"A self-proclaimed mad scientist accidentally discovers time travel via microwave. As he edits the past, every correction spawns catastrophe, forcing him to confront the cost of playing god.",
    genres:["Sci-Fi","Drama","Thriller"],tags:["Sci-Fi","Thriller","Drama"],
    lead:"Male",dynamics:"Team",sensuality:"Low",occult:1,maturityRating:"PG-13",
    virtues:["Sacrificial","Determined","Protective"],hooks:["Time Travel","Psychological Thriller","Mystery Box"],
    tone:"Intense",mal_score:9.1,episodes:24,year:2011,cover_url:"https://cdn.myanimelist.net/images/anime/1935/127974l.jpg",source:"jikan" },
  { id:"a-3",title:"Fullmetal Alchemist: Brotherhood",subtitle:"鋼の錬金術師",author:"Hiromu Arakawa",type:"anime",
    synopsis:"Two brothers use alchemy to try to resurrect their mother, paying a terrible price. Their quest for the Philosopher's Stone reveals a conspiracy built on sacrifice and equivalent exchange.",
    genres:["Action","Adventure","Fantasy","Drama"],tags:["Action","Adventure","Fantasy","Shounen"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:3,maturityRating:"PG-13",
    virtues:["Sacrificial","Loyal","Truth-Seeker"],hooks:["World Building","Political Intrigue","Power System"],
    tone:"Epic",mal_score:9.1,episodes:64,year:2009,cover_url:"https://cdn.myanimelist.net/images/anime/1208/94745l.jpg",source:"jikan" },
  { id:"a-4",title:"Attack on Titan",subtitle:"進撃の巨人",author:"Hajime Isayama",type:"anime",
    synopsis:"Humanity lives behind enormous walls to escape man-eating Titans. When the walls are breached, Eren vows vengeance — but the truth will challenge everything he believes about freedom and justice.",
    genres:["Action","Drama","Fantasy"],tags:["Action","Drama","Gore"],
    lead:"Male",dynamics:"Team",sensuality:"None",occult:2,maturityRating:"R",
    virtues:["Determined","Protective","Bold"],hooks:["Mystery Box","Political Intrigue","Survival"],
    tone:"Intense",mal_score:8.5,episodes:87,year:2013,cover_url:"https://cdn.myanimelist.net/images/anime/10/47347l.jpg",source:"jikan" },
  { id:"a-5",title:"March Comes in Like a Lion",subtitle:"3月のライオン",author:"Chica Umino",type:"anime",
    synopsis:"A teenage shogi prodigy burdened by loneliness discovers warmth through three sisters who open their home and hearts. A meditation on depression, resilience, and letting yourself be loved.",
    genres:["Drama","Slice of Life"],tags:["Drama","Slice of Life","Seinen"],
    lead:"Male",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"PG",
    virtues:["Persevering","Humble","Compassionate"],hooks:["Character Study","Found Family","Competition"],
    tone:"Tender",mal_score:8.9,episodes:44,year:2016,cover_url:"https://cdn.myanimelist.net/images/anime/9/82898l.jpg",source:"jikan" },
  { id:"a-6",title:"Violet Evergarden",subtitle:"ヴァイオレット・エヴァーガーデン",author:"Kana Akatsuki",type:"anime",
    synopsis:"A former child soldier becomes an Auto Memory Doll, ghostwriting letters for others. Through each client's story, she slowly learns to understand the words 'I love you' her commander spoke before dying.",
    genres:["Drama","Fantasy","Slice of Life"],tags:["Drama","Fantasy","Slice of Life"],
    lead:"Female",dynamics:"Solo",sensuality:"None",occult:1,maturityRating:"PG-13",
    virtues:["Devoted","Gentle","Truth-Seeker"],hooks:["Episodic Drama","Emotional Recovery","Beautiful Animation"],
    tone:"Tender",mal_score:8.7,episodes:13,year:2018,cover_url:"https://cdn.myanimelist.net/images/anime/1795/95088l.jpg",source:"jikan" },
  { id:"a-7",title:"Vinland Saga",subtitle:"ヴィンランド・サガ",author:"Makoto Yukimura",type:"anime",
    synopsis:"Young Thorfinn seeks revenge against the Viking warlord who killed his father. As years of bloodshed pass, he questions whether true strength lies in violence or the peaceful world his father dreamed of.",
    genres:["Action","Adventure","Drama"],tags:["Action","Drama","Historical","Seinen"],
    lead:"Male",dynamics:"Duo",sensuality:"Low",occult:1,maturityRating:"R",
    virtues:["Courageous","Peaceful","Just"],hooks:["Historical Epic","Revenge to Redemption","Philosophical Action"],
    tone:"Epic",mal_score:8.7,episodes:48,year:2019,cover_url:"https://cdn.myanimelist.net/images/anime/1500/103005l.jpg",source:"jikan" },
  { id:"a-8",title:"Mob Psycho 100",subtitle:"モブサイコ100",author:"ONE",type:"anime",
    synopsis:"Shigeo 'Mob' Kageyama is an unassuming middle-schooler with immense psychic power. Under his con-man mentor, he learns that true strength comes from kindness, not power.",
    genres:["Action","Comedy","Supernatural"],tags:["Action","Comedy","Supernatural","Shounen"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:2,maturityRating:"PG-13",
    virtues:["Humble","Gentle","Self-Aware"],hooks:["Power Deconstruction","Coming of Age","Comedy Action"],
    tone:"Uplifting",mal_score:8.6,episodes:37,year:2016,cover_url:"https://cdn.myanimelist.net/images/anime/8/80356l.jpg",source:"jikan" },
  { id:"a-9",title:"A Place Further Than the Universe",subtitle:"宇宙よりも遠い場所",author:"Atsuko Ishizuka",type:"anime",
    synopsis:"Four high school girls embark on an expedition to Antarctica. A story about finding the courage to take the first step, the beauty of friendship, and what it means to truly move forward.",
    genres:["Adventure","Comedy","Drama"],tags:["Adventure","Drama","Friendship"],
    lead:"Female",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"G",
    virtues:["Courageous","Loyal","Hopeful"],hooks:["Journey Narrative","Female Friendship","Inspirational"],
    tone:"Uplifting",mal_score:8.6,episodes:13,year:2018,cover_url:"https://cdn.myanimelist.net/images/anime/6/89879l.jpg",source:"jikan" },
  { id:"a-10",title:"Monster",subtitle:"モンスター",author:"Naoki Urasawa",type:"anime",
    synopsis:"Dr. Tenma saves a young boy's life instead of the mayor's. Years later, the boy becomes a serial killer, and Tenma must hunt down the monster he created while wrestling with the ethics of his oath.",
    genres:["Drama","Mystery","Thriller"],tags:["Drama","Mystery","Psychological","Seinen"],
    lead:"Male",dynamics:"Solo",sensuality:"None",occult:1,maturityRating:"R",
    virtues:["Principled","Sacrificial","Truth-Seeker"],hooks:["Cat and Mouse","Moral Philosophy","Slow Burn Thriller"],
    tone:"Anguished",mal_score:8.7,episodes:74,year:2004,cover_url:"https://cdn.myanimelist.net/images/anime/10/18793l.jpg",source:"jikan" },
  { id:"a-11",title:"Spy x Family",subtitle:"スパイファミリー",author:"Tatsuya Endo",type:"anime",
    synopsis:"A spy, an assassin, and a telepath form a fake family — each hiding their identity. What begins as a mission becomes something real, as the pretend family discovers genuine love and loyalty.",
    genres:["Action","Comedy","Slice of Life"],tags:["Action","Comedy","Shounen"],
    lead:"Ensemble",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"PG",
    virtues:["Protective","Loyal","Compassionate"],hooks:["Found Family","Spy Comedy","Heartwarming Action"],
    tone:"Uplifting",mal_score:8.6,episodes:37,year:2022,cover_url:"https://cdn.myanimelist.net/images/anime/1441/122795l.jpg",source:"jikan" },
  { id:"a-12",title:"Haikyuu!!",subtitle:"ハイキュー!!",author:"Haruichi Furudate",type:"anime",
    synopsis:"Short but determined Hinata joins his high school volleyball team, forming a rivalry-turned-partnership with genius setter Kageyama. A story about perseverance, teamwork, and the thrill of competition.",
    genres:["Sports","Comedy","Drama"],tags:["Sports","Drama","Shounen"],
    lead:"Male",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"G",
    virtues:["Persevering","Collaborative","Bold"],hooks:["Competition","Rivalry to Friendship","Team Dynamics"],
    tone:"Uplifting",mal_score:8.5,episodes:85,year:2014,cover_url:"https://cdn.myanimelist.net/images/anime/7/76014l.jpg",source:"jikan" },
  { id:"a-13",title:"Trigun Stampede",subtitle:"トライガン・スタンピード",author:"Yasuhiro Nightow",type:"anime",
    synopsis:"Vash the Stampede is a legendary outlaw with a sixty-billion-dollar bounty — and a pacifist who refuses to kill. On a desert planet, his commitment to mercy is tested by his genocidal twin brother.",
    genres:["Action","Adventure","Sci-Fi"],tags:["Action","Adventure","Sci-Fi"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:1,maturityRating:"PG-13",
    virtues:["Merciful","Peaceful","Sacrificial"],hooks:["Pacifist Action","Brother vs Brother","Sci-Fi Western"],
    tone:"Heroic",mal_score:7.9,episodes:12,year:2023,cover_url:"https://cdn.myanimelist.net/images/anime/1914/132195l.jpg",source:"jikan" },
  { id:"a-14",title:"Death Note",subtitle:"デスノート",author:"Tsugumi Ohba",type:"anime",
    synopsis:"A brilliant student finds a notebook that kills anyone whose name is written in it. His crusade to become god of a new world pits him against the world's greatest detective in lethal wits.",
    genres:["Thriller","Supernatural","Mystery"],tags:["Thriller","Supernatural","Psychological"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:4,maturityRating:"R",
    virtues:["Determined","Strategic","Principled"],hooks:["Cat and Mouse","Psychological Warfare","Moral Descent"],
    tone:"Intense",mal_score:8.6,episodes:37,year:2006,cover_url:"https://cdn.myanimelist.net/images/anime/9/9453l.jpg",source:"jikan" },
  { id:"a-15",title:"Demon Slayer",subtitle:"鬼滅の刃",author:"Koyoharu Gotouge",type:"anime",
    synopsis:"After demons slaughter his family and curse his sister, gentle Tanjiro becomes a demon slayer. His compassion — even for the demons he fights — sets him apart in a world of endless night.",
    genres:["Action","Fantasy","Adventure"],tags:["Action","Fantasy","Shounen"],
    lead:"Male",dynamics:"Team",sensuality:"None",occult:3,maturityRating:"PG-13",
    virtues:["Compassionate","Protective","Persevering"],hooks:["Power System","Family Bond","Beautiful Animation"],
    tone:"Heroic",mal_score:8.5,episodes:55,year:2019,cover_url:"https://cdn.myanimelist.net/images/anime/1286/99889l.jpg",source:"jikan" },
  { id:"a-16",title:"Mushoku Tensei",subtitle:"無職転生",author:"Rifujin na Magonote",type:"anime",
    synopsis:"A hopeless man is reborn into a world of swords and sorcery. Determined not to repeat his mistakes, he lives this new life to the fullest — but the world has plans of its own.",
    genres:["Fantasy","Adventure","Drama"],tags:["Fantasy","Isekai","Ecchi"],
    lead:"Male",dynamics:"Harem",sensuality:"Moderate",occult:3,maturityRating:"R",
    virtues:["Determined","Growth-Minded","Protective"],hooks:["World Building","System Progression","Isekai"],
    tone:"Epic",mal_score:8.4,episodes:34,year:2021,cover_url:"https://cdn.myanimelist.net/images/anime/1530/117776l.jpg",source:"jikan",gug_flags:["sexual"] },
  { id:"a-17",title:"Bocchi the Rock!",subtitle:"ぼっち・ざ・ろっく！",author:"Aki Hamaji",type:"anime",
    synopsis:"Hitori Gotoh is a guitar prodigy with crippling social anxiety. When she stumbles into a struggling band, she discovers that music — and friends — might be the bridge out of her lonely world.",
    genres:["Comedy","Music","Slice of Life"],tags:["Comedy","Music","Slice of Life"],
    lead:"Female",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"G",
    virtues:["Persevering","Humble","Creative"],hooks:["Music","Social Anxiety Comedy","Female Friendship"],
    tone:"Uplifting",mal_score:8.8,episodes:12,year:2022,cover_url:"https://cdn.myanimelist.net/images/anime/1448/127956l.jpg",source:"jikan" },
  { id:"a-18",title:"Fruits Basket (2019)",subtitle:"フルーツバスケット",author:"Natsuki Takaya",type:"anime",
    synopsis:"Orphaned Tohru Honda stumbles into the Sohma family's secret: they transform into zodiac animals when embraced. Through unconditional kindness, she slowly heals a family shattered by generational trauma.",
    genres:["Drama","Romance","Slice of Life"],tags:["Drama","Romance","Shoujo"],
    lead:"Female",dynamics:"Team",sensuality:"Low",occult:2,maturityRating:"PG-13",
    virtues:["Compassionate","Gentle","Healing"],hooks:["Found Family","Generational Trauma","Romance"],
    tone:"Tender",mal_score:8.6,episodes:63,year:2019,cover_url:"https://cdn.myanimelist.net/images/anime/1447/99827l.jpg",source:"jikan" },
  { id:"a-19",title:"Rurouni Kenshin",subtitle:"るろうに剣心",author:"Nobuhiro Watsuki",type:"anime",
    synopsis:"A legendary swordsman who vowed never to kill again wanders Meiji-era Japan seeking atonement. His reverse-blade sword symbolizes the tension between justice and mercy, violence and peace.",
    genres:["Action","Historical","Drama"],tags:["Action","Historical","Shounen"],
    lead:"Male",dynamics:"Team",sensuality:"Low",occult:1,maturityRating:"PG-13",
    virtues:["Merciful","Courageous","Repentant"],hooks:["Historical Action","Atonement Arc","Samurai"],
    tone:"Heroic",mal_score:8.3,episodes:94,year:1996,cover_url:"https://cdn.myanimelist.net/images/anime/1640/121220l.jpg",source:"jikan" },
  { id:"a-20",title:"Cowboy Bebop",subtitle:"カウボーイビバップ",author:"Shinichiro Watanabe",type:"anime",
    synopsis:"A ragtag crew of bounty hunters drifts through space chasing criminals and running from their pasts. Jazz-infused, melancholy, and effortlessly cool — a meditation on loneliness and letting go.",
    genres:["Action","Adventure","Sci-Fi","Drama"],tags:["Action","Sci-Fi","Drama","Seinen"],
    lead:"Male",dynamics:"Team",sensuality:"Low",occult:1,maturityRating:"R",
    virtues:["Independent","Loyal","Enduring"],hooks:["Episodic Adventure","Neo-Noir","Jazz Aesthetic"],
    tone:"Melancholic",mal_score:8.8,episodes:26,year:1998,cover_url:"https://cdn.myanimelist.net/images/anime/4/19644l.jpg",source:"jikan" },
  { id:"a-21",title:"The Apothecary Diaries",subtitle:"薬屋のひとりごと",author:"Natsu Hyuuga",type:"anime",
    synopsis:"Maomao, a pharmacist from the red-light district, is kidnapped to serve the imperial court. Her sharp mind draws her into palace intrigues far above her station.",
    genres:["Drama","Mystery","Slice of Life"],tags:["Drama","Mystery","Historical"],
    lead:"Female",dynamics:"Duo",sensuality:"Low",occult:1,maturityRating:"PG-13",
    virtues:["Discerning","Independent","Truth-Seeker"],hooks:["Political Intrigue","Medical Mystery","Historical Setting"],
    tone:"Cerebral",mal_score:8.5,episodes:24,year:2024,cover_url:"https://cdn.myanimelist.net/images/anime/1708/139579l.jpg",source:"jikan" },
  { id:"a-22",title:"Ascendance of a Bookworm",subtitle:"本好きの下剋上",author:"Miya Kazuki",type:"anime",
    synopsis:"A book-obsessed librarian is reborn in a medieval world where books are luxuries. With nothing but determination and modern knowledge, she sets out to create her own printing revolution.",
    genres:["Fantasy","Slice of Life"],tags:["Fantasy","Slice of Life","Isekai"],
    lead:"Female",dynamics:"Solo",sensuality:"None",occult:2,maturityRating:"G",
    virtues:["Determined","Creative","Persevering"],hooks:["System Progression","Isekai","Knowledge as Power"],
    tone:"Uplifting",mal_score:8.1,episodes:36,year:2019,cover_url:"https://cdn.myanimelist.net/images/anime/1809/104723l.jpg",source:"jikan" },
  { id:"a-23",title:"Natsume's Book of Friends",subtitle:"夏目友人帳",author:"Yuki Midorikawa",type:"anime",
    synopsis:"Takashi Natsume inherited a book containing the names of spirits bound by his grandmother. He spends his days freeing them — finding belonging, compassion, and connection along the way.",
    genres:["Drama","Fantasy","Slice of Life"],tags:["Drama","Fantasy","Shoujo"],
    lead:"Male",dynamics:"Duo",sensuality:"None",occult:2,maturityRating:"G",
    virtues:["Compassionate","Gentle","Selfless"],hooks:["Episodic Drama","Yokai Folklore","Healing"],
    tone:"Tender",mal_score:8.4,episodes:74,year:2008,cover_url:"https://cdn.myanimelist.net/images/anime/1079/133081l.jpg",source:"jikan" },
  { id:"a-24",title:"Dr. Stone",subtitle:"ドクターストーン",author:"Riichiro Inagaki",type:"anime",
    synopsis:"When all of humanity is turned to stone, genius Senku awakens 3,700 years later. Armed only with science, he sets out to rebuild civilization from zero — one invention at a time.",
    genres:["Adventure","Comedy","Sci-Fi"],tags:["Adventure","Sci-Fi","Shounen"],
    lead:"Male",dynamics:"Team",sensuality:"None",occult:1,maturityRating:"PG",
    virtues:["Determined","Collaborative","Creative"],hooks:["System Progression","Rebuilding Civilization","Science Education"],
    tone:"Uplifting",mal_score:8.3,episodes:59,year:2019,cover_url:"https://cdn.myanimelist.net/images/anime/1613/102576l.jpg",source:"jikan" },
];

/* ═══ GUG CHECK ═══ */
function gugCheck(e,disc){
  if(disc===0)return{pass:true,v:null};
  const tags=new Set([...e.genres,...(e.tags||[])].map(t=>t.toLowerCase()));
  const s=(e.synopsis||"").toLowerCase();
  if((e.gug_flags||[]).includes("sexual"))return{pass:false,v:"Sexual: Fan-service content flagged"};
  if(e.sensuality==="High")return{pass:false,v:"Sexual: Explicit/mature sexual content"};
  if(disc>=2&&e.sensuality==="Moderate")return{pass:false,v:"Sexual: Moderate fan-service (Med+ filter)"};
  if(disc>=2&&e.dynamics==="Harem")return{pass:false,v:"Sexual: Harem dynamics (Med+ filter)"};
  if(tags.has("ecchi"))return{pass:false,v:"Sexual: Ecchi genre"};
  if(e.occult>=5)return{pass:false,v:"Occult: Demonic pacts portrayed as moral good"};
  if(disc>=2&&e.occult>=4)return{pass:false,v:"Occult: Dark supernatural forces (Med+ filter)"};
  if(disc>=3&&e.occult>=4)return{pass:false,v:"Occult: Supernatural themes above threshold"};
  if(s.includes("become god"))return{pass:false,v:"Occult: Protagonist pursues godhood"};
  return{pass:true,v:null};
}

/* ═══ WORLDVIEW AUDIT (1-100) ═══ */
function audit(e){
  const s=(e.synopsis||"").toLowerCase();let sc=50;const k=[],t=[];
  if(s.includes("sacrifice")){sc+=12;k.push("Self-Sacrifice");}
  if(s.includes("atonement")||s.includes("redempt")){sc+=14;k.push("Redemptive Arc");}
  if(s.includes("compassion")||s.includes("kindness")||s.includes("gentle")){sc+=8;k.push("Compassion");}
  if(s.includes("mercy")){sc+=9;k.push("Mercy");}
  if(s.includes("hope")){sc+=6;k.push("Hope");}
  if(s.includes("protect")){sc+=6;k.push("Protector Heart");}
  if(s.includes("courage")||s.includes("brave")){sc+=7;k.push("Courage");}
  if(s.includes("peace")||s.includes("pacifist")){sc+=8;k.push("Non-Violence");}
  if(s.includes("family")){sc+=4;}if(s.includes("loyal")){sc+=4;k.push("Loyalty");}
  if(s.includes("grace")||s.includes("unconditional")){sc+=10;k.push("Grace");}
  if(s.includes("cost")||s.includes("consequence")){sc+=5;t.push("Moral Consequence");}
  if(s.includes("oath")||s.includes("vow")){sc+=5;t.push("Weight of Oaths");}
  if(s.includes("faith")||s.includes("trust")){sc+=5;t.push("Faith & Trust");}
  if(s.includes("freedom")||s.includes("justice")){sc+=4;t.push("Freedom & Justice");}
  if((e.tags||[]).some(x=>x.toLowerCase()==="gore")){sc-=8;}
  if(s.includes("revenge")&&(s.includes("question")||s.includes("peace"))){sc+=6;t.push("Revenge → Redemption");}
  else if(s.includes("revenge")){sc-=3;}
  return{score:Math.max(1,Math.min(100,Math.round(sc))),kingdom:k.slice(0,4),tavern:t.slice(0,3)};
}

/* ═══ SCORING ═══ */
function tasteMatch(e,profile){
  const entryTerms=new Set([...e.genres,...(e.tags||[]),...(e.hooks||[]),e.lead||"",e.dynamics||"",e.tone||"",...(e.virtues||[])].map(x=>x.toLowerCase()).filter(Boolean));
  const profTerms=[...profile.genres,...profile.hooks,...profile.tones,...profile.virtues].map(f=>f.toLowerCase());

  // Count how many profile terms this entry satisfies
  const hits=profTerms.filter(f=>entryTerms.has(f)).length;

  // Use the SMALLER of (profile size, entry size) as denominator
  // This prevents rich profiles from diluting scores
  const denom=Math.min(profTerms.length, entryTerms.size) || 1;
  let sc=(hits/denom)*100;

  // Bonus: if entry shares 3+ terms, it's clearly aligned
  if(hits>=5)sc=Math.min(100,sc+10);
  else if(hits>=3)sc=Math.min(100,sc+5);

  // Penalty for disliked content
  if(profile.dislike.some(d=>entryTerms.has(d.toLowerCase())))sc-=30;

  return Math.max(0,Math.min(100,Math.round(sc)));
}

function buildProfile(virtueProfile,likedItems){
  const genres=new Map(),hooks=new Map(),tones=new Map();
  for(const it of likedItems){
    for(const g of it.genres)(genres.set(g,(genres.get(g)||0)+1));
    for(const h of(it.hooks||[]))(hooks.set(h,(hooks.get(h)||0)+1));
    if(it.tone)tones.set(it.tone,(tones.get(it.tone)||0)+1);
  }
  const topN=(m,n)=>[...m.entries()].sort((a,b)=>b[1]-a[1]).slice(0,n).map(e=>e[0]);
  return{
    genres:topN(genres,5).length?topN(genres,5):["Fantasy","Drama","Adventure","Sci-Fi","Slice of Life"],
    hooks:topN(hooks,4).length?topN(hooks,4):["World Building","Character Study","Quest Narrative"],
    tones:topN(tones,3).length?topN(tones,3):["Epic","Tender","Uplifting"],
    virtues:virtueProfile.slice(0,5),
    dislike:["Ecchi","Harem"],
  };
}

function score(taste,auditSc,gugPass,disc){
  if(disc===0||!gugPass)return Math.round(taste);
  // Weighted blend: taste matters more (60/40), and take the higher of blend vs taste-only
  // This prevents the audit from dragging down a clearly liked show
  const blend=taste*0.6+auditSc*0.4;
  return Math.round(Math.max(0,Math.min(100,Math.max(blend, taste*0.85))));
}

function lbl(sc,gug,disc){
  if(disc===0)return"—";if(!gug)return"GUG Violation";
  if(sc>=85)return"Kingdom";if(sc>=70)return"Strong";if(sc>=55)return"Solid";if(sc>=40)return"Neutral";return"Shallow";
}

/* ═══ MATCH CHIPS (user-facing, derived from hidden metadata) ═══ */
function makeChips(e, gugPass, disc, auditData, profile) {
  const chips = [];
  if (!gugPass && disc > 0) chips.push("⚠ GUG Flagged");

  // Pick from hooks (structural genre matches)
  const profHooks = new Set(profile.hooks.map(h => h.toLowerCase()));
  const matchedHooks = (e.hooks || []).filter(h => profHooks.has(h.toLowerCase()));
  if (matchedHooks[0]) chips.push(matchedHooks[0]);

  // Pick from virtues (the bridge — but shown as thematic labels, not "virtues")
  const profVirtues = new Set(profile.virtues.map(v => v.toLowerCase()));
  const matchedVirtues = (e.virtues || []).filter(v => profVirtues.has(v.toLowerCase()));
  if (matchedVirtues[0] && chips.length < 4) chips.push(matchedVirtues[0]);

  // Pick from kingdom values if audit ran
  if (gugPass && disc > 0 && auditData && auditData.kingdom && auditData.kingdom[0] && chips.length < 4) {
    chips.push(auditData.kingdom[0]);
  }

  // Genre match
  const profGenres = new Set(profile.genres.map(g => g.toLowerCase()));
  const matchedGenres = (e.genres || []).filter(g => profGenres.has(g.toLowerCase()));
  if (matchedGenres[0] && chips.length < 3) chips.push(matchedGenres[0]);

  // Tone match
  const profTones = new Set(profile.tones.map(t => t.toLowerCase()));
  if (e.tone && profTones.has(e.tone.toLowerCase()) && chips.length < 4) chips.push(e.tone);

  // Fallback from hooks/virtues if we still need more
  const fallbacks = [...(e.hooks || []), ...(e.virtues || [])];
  let fi = 0;
  while (chips.length < 3 && fi < fallbacks.length) {
    if (!chips.includes(fallbacks[fi])) chips.push(fallbacks[fi]);
    fi++;
  }

  return chips.slice(0, 4);
}

/* ═══ PIPELINE ═══ */
function getResults(query,disc,mat,vp,likedItems){
  const q=query.toLowerCase().trim();
  const profile=buildProfile(vp,likedItems);
  const search=(arr)=>q?arr.filter(a=>a.title.toLowerCase().includes(q)||(a.subtitle||"").toLowerCase().includes(q)||(a.author||"").toLowerCase().includes(q)||(a.synopsis||"").toLowerCase().includes(q)||a.genres.some(g=>g.toLowerCase().includes(q))||(a.tags||[]).some(t=>t.toLowerCase().includes(q))||(a.hooks||[]).some(h=>h.toLowerCase().includes(q))):arr;
  let spirit=search(SPIRIT_BOOKS),anime=search(CORPUS);
  const seen=new Set(),merged=[];
  for(const e of[...spirit,...anime]){const k=e.title.toLowerCase().replace(/[^a-z0-9]/g,"");if(!seen.has(k)){seen.add(k);merged.push(e);}}
  const matMap={"G":0,"PG":1,"PG-13":2,"R":3};
  const total=merged.length;
  const filtered=merged.filter(e=>(matMap[e.maturityRating]??0)<=mat);
  const vpSet=new Set(vp.map(v=>v.toLowerCase()));

  const scored=filtered.map(e=>{
    const tm=tasteMatch(e,profile);
    // Direct boost: if user already liked this exact item, guarantee high score
    const isLiked=likedItems.some(li=>li.id===e.id);
    const likedBonus=isLiked?15:0;
    if(e.source==="spirit-books"){
      const as=Math.round((e.faith_score/10)*100);
      const vb=disc>0?(e.virtues||[]).filter(v=>vpSet.has(v.toLowerCase())).length*5:0;
      const ms=Math.min(100,score(tm,as,true,disc)+vb+likedBonus);
      const ad={kingdom:e.tags.slice(0,3),tavern:[]};
      return{...e,tasteMatch:tm,auditScore:as,matchScore:ms,faithLbl:lbl(as,true,disc),gugPassed:true,gugViolation:null,matchChips:makeChips(e,true,disc,ad,profile)};
    }
    const gug=gugCheck(e,disc);
    const a=gug.pass&&disc>0?audit(e):{score:0,kingdom:[],tavern:[]};
    const vb=disc>0?(e.virtues||[]).filter(v=>vpSet.has(v.toLowerCase())).length*4:0;
    const ms=Math.min(100,score(tm,a.score,gug.pass,disc)+vb+likedBonus);
    return{...e,tasteMatch:tm,auditScore:a.score,matchScore:ms,faithLbl:lbl(a.score,gug.pass,disc),gugPassed:gug.pass,gugViolation:gug.v,auditData:a,matchChips:makeChips(e,gug.pass,disc,a,profile)};
  });
  scored.sort((a,b)=>b.matchScore-a.matchScore);
  return{results:scored.slice(0,20),meta:{spiritCount:spirit.length,jikanCount:anime.length,filteredOut:total-filtered.length}};
}

function bridgeBooks(vp,mat,exclude){
  if(!vp.length)return[];const s=new Set(vp.map(v=>v.toLowerCase()));
  const matMap={"G":0,"PG":1,"PG-13":2,"R":3};
  return SPIRIT_BOOKS.filter(b=>(matMap[b.maturityRating]??0)<=mat&&!exclude.has(b.id)).map(b=>({...b,overlap:(b.virtues||[]).filter(v=>s.has(v.toLowerCase())).length})).filter(b=>b.overlap>0).sort((a,b)=>b.overlap-a.overlap);
}

/* ═══════════════════════════════════════════════════════════════
   UI
   ═══════════════════════════════════════════════════════════════ */

function Badge({score:sc,label:lb,gugPass:gp,discOff:dOff}){
  if(dOff)return null;
  if(!gp)return(<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{backgroundColor:RED+"10",border:`1px solid ${RED}22`}}><Shield size={10} style={{color:RED}}/><span style={{fontFamily:SN,fontSize:"0.6rem",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:RED}}>{lb}</span></div>);
  const c=sc>=85?"#2D7D46":sc>=70?A:sc>=55?AW:MU;
  return(<div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{backgroundColor:`${c}10`,border:`1px solid ${c}22`}}><Shield size={10} style={{color:c}}/><span style={{fontFamily:SN,fontSize:"0.6rem",fontWeight:600,letterSpacing:"0.05em",textTransform:"uppercase",color:c}}>{lb} · {sc}</span></div>);
}
function Ring({pct}){const r=20,c2=2*Math.PI*r,o=c2-(pct/100)*c2,cl=pct>=75?A:pct>=55?AW:MU;return(<div className="relative flex items-center justify-center" style={{width:52,height:52}}><svg width="52" height="52" className="absolute"><circle cx="26" cy="26" r={r} fill="none" stroke={BD} strokeWidth="2.5"/><circle cx="26" cy="26" r={r} fill="none" stroke={cl} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={c2} strokeDashoffset={o} style={{transform:"rotate(-90deg)",transformOrigin:"center",transition:"stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)"}}/></svg><div style={{textAlign:"center",lineHeight:1}}><span style={{fontFamily:SF,fontSize:"0.85rem",fontWeight:700,color:cl}}>{pct}</span><span style={{fontFamily:SN,fontSize:"0.4rem",color:MU,display:"block"}}>%</span></div></div>);}
function Chip({label:l}){const w=l.startsWith("⚠");return(<span style={{fontFamily:SN,fontSize:"0.6rem",fontWeight:w?600:500,color:w?RED:BODY,backgroundColor:w?RED+"08":A+"08",border:`1px solid ${w?RED+"18":A+"12"}`,borderRadius:"9999px",padding:"2px 9px",whiteSpace:"nowrap"}}>{l}</span>);}

function Card({item:it,index:ix,visible:vis,onLike,liked,disc,onMore}){
  const [hov,setHov]=useState(false);const [imgOk,setImgOk]=useState(false);
  const hasCov=it.cover_url&&it.cover_url.length>10;const dOff=disc===0;
  return(
    <article onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} className="relative overflow-hidden" style={{backgroundColor:BGC,border:`1px solid ${hov?"#d0cdc6":BD}`,borderRadius:"6px",opacity:vis?1:0,transform:vis?"translateY(0)":"translateY(16px)",transition:`opacity 0.4s ease ${ix*0.04}s, transform 0.4s cubic-bezier(0.23,1,0.32,1) ${ix*0.04}s, border-color 0.3s, box-shadow 0.3s`,boxShadow:hov?"0 12px 40px -10px rgba(0,0,0,0.08)":"0 1px 3px rgba(0,0,0,0.02)"}}>
      <div className="card-layout">
        {hasCov?(<div className="card-cover relative overflow-hidden flex-shrink-0">
          <img src={it.cover_url} alt="" onLoad={()=>setImgOk(true)} className="absolute inset-0 w-full h-full object-cover" style={{opacity:imgOk?1:0,transform:hov?"scale(1.03)":"scale(1)",transition:"transform 0.7s cubic-bezier(0.23,1,0.32,1), opacity 0.3s"}}/>
          <button onClick={()=>onLike(it)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{backgroundColor:liked?A:"rgba(255,255,255,0.88)",backdropFilter:"blur(6px)",transition:"background 0.2s"}}><Heart size={12} className={liked?"fill-white text-white":"text-gray-500"}/></button>
        </div>):(<div className="card-cover relative overflow-hidden flex-shrink-0 flex items-center justify-center" style={{background:`linear-gradient(145deg,${A}10,${AW}08)`}}>
          <BookOpen size={24} style={{color:A,opacity:0.3}}/><button onClick={()=>onLike(it)} className="absolute top-3 right-3 w-7 h-7 rounded-full flex items-center justify-center" style={{backgroundColor:liked?A:"rgba(255,255,255,0.88)"}}><Heart size={12} className={liked?"fill-white text-white":"text-gray-500"}/></button>
        </div>)}

        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between" style={{minHeight:240}}>
          <div>
            <div className="flex items-start justify-between gap-2 mb-2 flex-wrap">
              <Badge score={it.auditScore} label={it.faithLbl} gugPass={it.gugPassed} discOff={dOff}/>
              <Ring pct={it.matchScore}/>
            </div>
            {!it.gugPassed&&it.gugViolation&&!dOff&&(<div className="flex items-start gap-2 mb-2 px-2.5 py-1.5 rounded" style={{backgroundColor:RED+"06",border:`1px solid ${RED}12`}}><Shield size={10} style={{color:RED,marginTop:1,flexShrink:0}}/><p style={{fontFamily:SN,fontSize:"0.62rem",lineHeight:1.4,color:RED}}><b>GUG: </b>{it.gugViolation}</p></div>)}

            {/* Title block */}
            <div className="flex items-center gap-2 mb-0.5 flex-wrap">
              <span style={{fontFamily:SN,fontSize:"0.55rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:A}}>{(it.genres||[]).slice(0,2).join(" · ")}</span>
              <span style={{color:BD}}>·</span><span style={{fontFamily:SN,fontSize:"0.55rem",color:MU}}>{it.year}</span>
            </div>
            <h3 style={{fontFamily:SF,fontSize:"1.3rem",fontWeight:600,color:INK,lineHeight:1.25}}>{it.title}</h3>
            {it.author&&<p style={{fontFamily:SN,fontSize:"0.75rem",color:MU,marginTop:1}}>by {it.author}</p>}

            {/* Why this matches — 3-4 chips derived from hidden metadata */}
            <div style={{marginTop:10,marginBottom:10}}>
              <p style={{fontFamily:SN,fontSize:"0.52rem",fontWeight:600,letterSpacing:"0.13em",textTransform:"uppercase",color:MU,marginBottom:5}}>{!it.gugPassed&&!dOff?"Genre match only":"Why this matches"}</p>
              <div className="flex flex-wrap gap-1.5">{(it.matchChips||[]).map(c=><Chip key={c} label={c}/>)}</div>
            </div>

            <p style={{fontFamily:BSF,fontSize:"0.88rem",lineHeight:1.7,color:BODY,display:"-webkit-box",WebkitLineClamp:3,WebkitBoxOrient:"vertical",overflow:"hidden"}}>{it.synopsis||""}</p>
          </div>
          <div className="flex items-center justify-between mt-3 pt-3 flex-wrap gap-2" style={{borderTop:`1px solid ${BD}`}}>
            <div className="flex items-center gap-3">
              {it.mal_score>0&&<div className="flex items-center gap-1"><Star size={10} style={{color:"#D4A017",fill:"#D4A017"}}/><span style={{fontFamily:SN,fontSize:"0.74rem",fontWeight:600,color:INK}}>{it.mal_score?.toFixed?.(1)}</span></div>}
              <span style={{fontFamily:SN,fontSize:"0.68rem",color:MU}}>{it.episodes?`${it.episodes} ep`:it.pages?`${it.pages} pg`:""}</span>
            </div>
            <div className="flex items-center gap-2.5">
              <button onClick={()=>onMore(it)} className="flex items-center gap-1" style={{fontFamily:SN,fontSize:"0.62rem",fontWeight:600,color:hov?A:MU,background:"none",border:"none",cursor:"pointer",padding:0,transition:"color 0.2s"}}><RefreshCw size={10}/>More like this</button>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ═══ SLIDER ═══ */
function Sl({label:lb,desc:d,value:v,onChange:oc,stops:st}){
  const p=(v/(st.length-1))*100;
  return(<div style={{marginBottom:20}}><div className="flex justify-between items-baseline mb-1"><span style={{fontFamily:SN,fontSize:"0.78rem",fontWeight:600,color:INK}}>{lb}</span><span style={{fontFamily:SF,fontSize:"0.82rem",fontWeight:600,color:v===0?MU:A}}>{st[v]}</span></div>{d&&<p style={{fontFamily:SN,fontSize:"0.66rem",color:MU,marginBottom:10,lineHeight:1.5}}>{d}</p>}<div style={{position:"relative",height:28,display:"flex",alignItems:"center"}}><div style={{position:"absolute",left:0,right:0,height:3,borderRadius:2,backgroundColor:BD}}/><div style={{position:"absolute",left:0,height:3,borderRadius:2,backgroundColor:v===0?MU:A,width:`${p}%`,transition:"width 0.15s"}}/><input type="range" min={0} max={st.length-1} step={1} value={v} onChange={e=>oc(parseInt(e.target.value))} style={{position:"absolute",left:-4,right:-4,width:"calc(100% + 8px)",height:28,opacity:0,cursor:"pointer",zIndex:2,margin:0}}/><div style={{position:"absolute",left:`${p}%`,width:16,height:16,borderRadius:"50%",backgroundColor:BGC,border:`2.5px solid ${v===0?MU:A}`,transform:"translateX(-50%)",transition:"left 0.15s",boxShadow:"0 1px 4px rgba(0,0,0,0.1)",pointerEvents:"none"}}/>{st.map((s,i)=><span key={i} style={{position:"absolute",left:`${(i/(st.length-1))*100}%`,bottom:-12,transform:"translateX(-50%)",fontFamily:SN,fontSize:"0.5rem",color:MU}}>{s}</span>)}</div></div>);
}

/* ═══ TASTE DNA ANALYSIS ═══ */
function analyzeTaste(likedItems) {
  if (likedItems.length === 0) return null;
  const n = likedItems.length;

  // Count every dimension
  const count = (arr) => { const m = new Map(); for (const v of arr) m.set(v, (m.get(v)||0)+1); return [...m.entries()].sort((a,b)=>b[1]-a[1]); };
  const pct = (c, label) => Math.round((c / n) * 100);

  const leads = count(likedItems.map(i => i.lead));
  const dynamics = count(likedItems.map(i => i.dynamics));
  const tones = count(likedItems.flatMap(i => i.tone ? [i.tone] : []));
  const genres = count(likedItems.flatMap(i => i.genres));
  const hooks = count(likedItems.flatMap(i => i.hooks || []));
  const virtues = count(likedItems.flatMap(i => i.virtues || []));
  const sensuality = count(likedItems.map(i => i.sensuality));
  const maturity = count(likedItems.map(i => i.maturityRating));
  const occultLevels = likedItems.map(i => i.occult || 1);
  const avgOccult = Math.round((occultLevels.reduce((a,b)=>a+b,0) / n) * 10) / 10;

  // Build portrait sentences
  const sentences = [];

  // Lead preference
  if (leads[0] && leads[0][1] >= n * 0.5) {
    sentences.push(`You gravitate toward **${leads[0][0].toLowerCase()}-led** stories${leads[0][1] === n ? " exclusively" : ` (${pct(leads[0][1])}% of your likes)`}.`);
  } else if (leads.length >= 2) {
    sentences.push(`You enjoy both **${leads[0][0].toLowerCase()}-led** and **${leads[1][0].toLowerCase()}-led** narratives.`);
  }

  // Dynamics
  if (dynamics[0] && dynamics[0][1] >= n * 0.4) {
    const dyn = dynamics[0][0];
    const dynDesc = dyn === "Team" ? "team-based ensemble casts" : dyn === "Duo" ? "stories built on a central duo or rivalry" : dyn === "Solo" ? "solo protagonist journeys" : "complex relationship webs";
    sentences.push(`You prefer **${dynDesc}**.`);
  }

  // Tone
  if (tones[0]) {
    const top2 = tones.slice(0, 2).map(t => t[0].toLowerCase());
    sentences.push(`Your emotional register runs **${top2.join("** and **")}**.`);
  }

  // Core hooks (what structurally draws them)
  if (hooks.length >= 2) {
    const topH = hooks.slice(0, 3).map(h => h[0]);
    sentences.push(`Structurally, you're drawn to **${topH.join("**, **")}**.`);
  }

  // Virtues (the deep why)
  if (virtues.length >= 2) {
    const topV = virtues.slice(0, 3).map(v => v[0]);
    sentences.push(`The character qualities that resonate most: **${topV.join("**, **")}**.`);
  }

  // Sensuality preference
  const cleanPct = sensuality.filter(s => s[0] === "None" || s[0] === "Low").reduce((a, s) => a + s[1], 0);
  if (cleanPct >= n * 0.8) {
    sentences.push(`You strongly prefer **clean content** — ${pct(cleanPct)}% of your likes have no or minimal sensuality.`);
  }

  // Occult comfort
  if (avgOccult <= 2) {
    sentences.push(`You're comfortable with **grounded stories** (avg occult level ${avgOccult}/5) — minimal magic or supernatural elements.`);
  } else if (avgOccult <= 3.5) {
    sentences.push(`You're comfortable with **fantasy magic** (avg occult level ${avgOccult}/5) but nothing dark.`);
  }

  // Genre fingerprint
  if (genres.length >= 2) {
    const topG = genres.slice(0, 3).map(g => g[0]);
    sentences.push(`Your genre fingerprint: **${topG.join("**, **")}**.`);
  }

  return {
    sentences,
    stats: {
      topLead: leads[0]?.[0] || "—",
      topDynamic: dynamics[0]?.[0] || "—",
      topTones: tones.slice(0,2).map(t=>t[0]),
      topHooks: hooks.slice(0,3).map(h=>h[0]),
      topVirtues: virtues.slice(0,4).map(v=>v[0]),
      cleanPct: pct(cleanPct),
      avgOccult,
      topGenres: genres.slice(0,3).map(g=>g[0]),
    }
  };
}

function TasteDNA({ analysis }) {
  if (!analysis) return null;
  return (
    <div style={{ borderTop: `1px solid ${BD}`, paddingTop: 16 }}>
      <p style={{ fontFamily: SN, fontSize: "0.58rem", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: A, marginBottom: 10 }}>
        <Eye size={10} style={{ display: "inline", verticalAlign: "-1px", marginRight: 4 }} />Your Taste DNA
      </p>
      <div style={{ fontFamily: BSF, fontSize: "0.84rem", lineHeight: 1.75, color: BODY }}>
        {analysis.sentences.map((s, i) => (
          <p key={i} style={{ marginBottom: 6 }} dangerouslySetInnerHTML={{
            __html: s.replace(/\*\*(.*?)\*\*/g, `<span style="font-weight:600;color:${INK}">$1</span>`)
          }} />
        ))}
      </div>
      {/* Visual stat chips */}
      <div className="flex flex-wrap gap-1.5 mt-3">
        {analysis.stats.topVirtues.map(v => (
          <span key={v} style={{ fontFamily: SN, fontSize: "0.58rem", fontWeight: 500, color: GOLD, backgroundColor: "#F5F0E0", border: "1px solid #D4C48A40", borderRadius: "9999px", padding: "2px 9px" }}>{v}</span>
        ))}
        {analysis.stats.topHooks.map(h => (
          <span key={h} style={{ fontFamily: SN, fontSize: "0.58rem", fontWeight: 500, color: A, backgroundColor: A + "08", border: `1px solid ${A}12`, borderRadius: "9999px", padding: "2px 9px" }}>{h}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══ MODAL ═══ */
function Modal({open:o,onClose:oc,settings:st,onChange:ch,vp,tasteAnalysis}){
  if(!o)return null;
  return(<><div onClick={oc} style={{position:"fixed",inset:0,backgroundColor:"rgba(26,26,26,0.3)",backdropFilter:"blur(4px)",zIndex:200}}/><div style={{position:"fixed",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:"min(460px,calc(100vw-40px))",backgroundColor:BG,border:`1px solid ${BD}`,borderRadius:8,zIndex:201,boxShadow:"0 24px 80px -16px rgba(0,0,0,0.18)",maxHeight:"90vh",overflowY:"auto",animation:"modalIn 0.3s cubic-bezier(0.23,1,0.32,1)"}}>
    <div className="flex items-center justify-between" style={{padding:"18px 20px 0"}}><div><h2 style={{fontFamily:SF,fontSize:"1.2rem",fontWeight:600,color:INK}}>Settings</h2><p style={{fontFamily:SN,fontSize:"0.68rem",color:MU,marginTop:1}}>Tune your recommendation engine</p></div><button onClick={oc} style={{width:30,height:30,borderRadius:"50%",border:`1px solid ${BD}`,backgroundColor:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={13} color={MU}/></button></div>
    <div style={{margin:"14px 20px 0",borderTop:`1px solid ${BD}`}}/>
    <div style={{padding:"18px 20px 8px"}}>
      <Sl label="Discernment" desc="Off = pure taste match, no faith scoring. Low–High = GUG content check + worldview audit with increasing strictness." value={st.discernment} onChange={v=>ch({...st,discernment:v})} stops={["Off","Low","Medium","High"]}/>
      <div style={{height:14}}/>
      <Sl label="Maturity Guard" desc="Removes titles above this rating entirely." value={st.maturity} onChange={v=>ch({...st,maturity:v})} stops={["G","PG","PG-13","R"]}/>
    </div>
    {/* Taste DNA */}
    {tasteAnalysis&&<div style={{padding:"0 20px 14px"}}><TasteDNA analysis={tasteAnalysis}/></div>}
    {/* Flavor Profile chips */}
    {vp.length>0&&!tasteAnalysis&&<div style={{padding:"0 20px 14px"}}><div style={{borderTop:`1px solid ${BD}`,paddingTop:14}}><p style={{fontFamily:SN,fontSize:"0.56rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:MU,marginBottom:6}}>Your Flavor Profile</p><div className="flex flex-wrap gap-1">{vp.map(v=><span key={v} style={{fontFamily:SN,fontSize:"0.6rem",fontWeight:500,color:GOLD,backgroundColor:"#F5F0E0",border:"1px solid #D4C48A40",borderRadius:"9999px",padding:"2px 9px"}}>{v}</span>)}</div></div></div>}
    <div style={{padding:"0 20px 18px",display:"flex",justifyContent:"flex-end",gap:6}}><button onClick={oc} style={{fontFamily:SN,fontSize:"0.72rem",fontWeight:600,padding:"7px 14px",borderRadius:6,border:`1px solid ${BD}`,backgroundColor:"transparent",color:BODY,cursor:"pointer"}}>Cancel</button><button onClick={oc} style={{fontFamily:SN,fontSize:"0.72rem",fontWeight:600,padding:"7px 18px",borderRadius:6,border:"none",backgroundColor:INK,color:"#F5F4F0",cursor:"pointer"}}>Save</button></div>
  </div></>);
}

/* ═══ BRIDGE BANNER ═══ */
function Bridge({books:bk,disc:d}){if(d===0||!bk.length)return null;return(<div className="mb-5 px-4 py-3 rounded-lg" style={{backgroundColor:"#F5F0E0",border:"1px solid #D4C48A40"}}><p style={{fontFamily:SN,fontSize:"0.58rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:GOLD,marginBottom:6}}><Sparkles size={10} style={{display:"inline",verticalAlign:"-1px",marginRight:3}}/>From your taste — our curated shelf</p><div className="flex flex-wrap gap-2">{bk.slice(0,3).map(b=><div key={b.id} className="flex items-center gap-2 px-2.5 py-1.5 rounded" style={{backgroundColor:"rgba(255,255,255,0.65)",border:"1px solid #D4C48A25",flex:"1 1 180px",minWidth:160}}><BookOpen size={14} style={{color:GOLD,flexShrink:0}}/><div><p style={{fontFamily:SF,fontSize:"0.78rem",fontWeight:600,color:INK,lineHeight:1.2}}>{b.title}</p><p style={{fontFamily:SN,fontSize:"0.58rem",color:MU}}>by {b.author} · {b.overlap} shared</p></div></div>)}</div></div>);}

/* ═══ FEED GENERATION ═══ */
function generateFeeds(query, disc, mat, vp, likedItems, allLikedIds) {
  const feeds = [];

  // 1. TRENDING — top scored with minimal profile bias, with occasional wildcards
  const trending = getResults(query, disc, mat, [], likedItems);
  // Inject wildcard: pick an entry that DOESN'T match user taste
  const userGenres = new Set(likedItems.flatMap(i => i.genres).map(g => g.toLowerCase()));
  const wildcardPool = trending.results.filter(r => !(r.genres || []).some(g => userGenres.has(g.toLowerCase())));
  if (wildcardPool.length > 0 && trending.results.length > 3 && !query) {
    const wc = { ...wildcardPool[Math.floor(Math.random() * wildcardPool.length)], isWildcard: true };
    // Insert at position 3
    const idx = Math.min(3, trending.results.length);
    trending.results.splice(idx, 0, wc);
    // Remove duplicate
    const seen = new Set();
    trending.results = trending.results.filter(r => { const k = r.id + (r.isWildcard ? '-wc' : ''); if (seen.has(r.id) && !r.isWildcard) return false; seen.add(r.id); return true; });
  }
  feeds.push({ id: "trending", name: "Trending", results: trending.results, meta: trending.meta });

  // 2. FOR YOU — based on recent likes (current virtue profile)
  if (vp.length > 0) {
    const forYou = getResults(query, disc, mat, vp, likedItems);
    // Build a descriptive subtitle from strongest patterns
    const leadCounts = {};
    const hookCounts = {};
    for (const it of likedItems) {
      leadCounts[it.lead] = (leadCounts[it.lead] || 0) + 1;
      for (const h of (it.hooks || [])) hookCounts[h] = (hookCounts[h] || 0) + 1;
    }
    const topLead = Object.entries(leadCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
    const topHooks = Object.entries(hookCounts).sort((a, b) => b[1] - a[1]).slice(0, 2).map(e => e[0]);
    const subtitle = [topLead ? `${topLead}-led` : "", ...topHooks].filter(Boolean).join(" · ");
    feeds.push({ id: "foryou", name: "For You", subtitle, results: forYou.results, meta: forYou.meta });
  }

  // 3. CLASSICS — based on ALL likes (full history), only if different from For You
  if (likedItems.length >= 3) {
    const allVirtues = new Map();
    for (const it of likedItems) for (const v of (it.virtues || [])) allVirtues.set(v, (allVirtues.get(v) || 0) + 1);
    const classicsVp = [...allVirtues.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(e => e[0]);
    // Only show if classics profile differs meaningfully from for-you
    const vpSet = new Set(vp.map(v => v.toLowerCase()));
    const classicsSet = new Set(classicsVp.map(v => v.toLowerCase()));
    const overlap = [...vpSet].filter(v => classicsSet.has(v)).length;
    const isDifferent = overlap < Math.min(vpSet.size, classicsSet.size) * 0.7;
    if (isDifferent) {
      const classics = getResults(query, disc, mat, classicsVp, likedItems);
      feeds.push({ id: "classics", name: "Classics", subtitle: "From all your likes", results: classics.results, meta: classics.meta });
    }
  }

  return feeds;
}

/* ═══ WILDCARD BADGE ═══ */
function WildcardBadge() {
  return (
    <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 px-2.5 py-1 rounded-full" style={{ backgroundColor: "#7C3AED", boxShadow: "0 2px 8px rgba(124,58,237,0.3)" }}>
      <Sparkles size={10} color="white" />
      <span style={{ fontFamily: SN, fontSize: "0.58rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", color: "white" }}>Discovery</span>
    </div>
  );
}

/* ═══ TAB BAR ═══ */
function TabBar({ tabs, active, onSelect, onRefresh }) {
  const scrollRef = useRef(null);
  const [longPress, setLongPress] = useState(null);
  const timerRef = useRef(null);

  const handleDown = (id) => {
    timerRef.current = setTimeout(() => { setLongPress(id); onRefresh(id); setTimeout(() => setLongPress(null), 800); }, 600);
  };
  const handleUp = () => { if (timerRef.current) clearTimeout(timerRef.current); };

  return (
    <div ref={scrollRef} style={{ maxWidth: 820, margin: "0 auto", padding: "0 24px", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" }}>
      <style>{`.tab-scroll::-webkit-scrollbar{display:none}`}</style>
      <div className="tab-scroll flex items-center gap-1" style={{ paddingBottom: 2, minWidth: "max-content" }}>
        {tabs.map(tab => {
          const isActive = tab.id === active;
          const isRefreshing = longPress === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onSelect(tab.id)}
              onMouseDown={() => handleDown(tab.id)}
              onMouseUp={handleUp}
              onMouseLeave={handleUp}
              onTouchStart={() => handleDown(tab.id)}
              onTouchEnd={handleUp}
              style={{
                fontFamily: SN, fontSize: "0.72rem", fontWeight: isActive ? 700 : 500,
                color: isActive ? INK : MU,
                backgroundColor: isActive ? BGC : "transparent",
                border: isActive ? `1px solid ${BD}` : "1px solid transparent",
                borderRadius: "9999px",
                padding: "7px 16px",
                cursor: "pointer",
                transition: "all 0.25s ease",
                whiteSpace: "nowrap",
                boxShadow: isActive ? "0 1px 4px rgba(0,0,0,0.04)" : "none",
                transform: isRefreshing ? "scale(0.95)" : "scale(1)",
                opacity: isRefreshing ? 0.6 : 1,
              }}
            >
              {tab.name}
              {tab.subtitle && isActive && (
                <span style={{ fontFamily: SN, fontSize: "0.58rem", fontWeight: 400, color: MU, marginLeft: 6 }}>{tab.subtitle}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ═══ APP ═══ */
export default function App(){
  const [query,setQuery]=useState("");const [focused,setFocused]=useState(false);const [modal,setModal]=useState(false);
  const [settings,setSettings]=useState(()=>{try{const s=localStorage.getItem("bda-settings");return s?{discernment:2,maturity:2,...JSON.parse(s)}:{discernment:2,maturity:2};}catch{return{discernment:2,maturity:2};}});
  const [loaded,setLoaded]=useState(false);
  const [likedIds,setLikedIds]=useState(new Set());const [vp,setVp]=useState([]);
  const [activeTab,setActiveTab]=useState("trending");
  const [feeds,setFeeds]=useState([]);
  const [slideDir,setSlideDir]=useState(0); // -1 left, 0 none, 1 right
  const [transitioning,setTransitioning]=useState(false);
  const [refreshKey,setRefreshKey]=useState(0);
  const searchRef=useRef(null);
  // Persist Maturity and Discernment settings across sessions
  useEffect(()=>{try{localStorage.setItem("bda-settings",JSON.stringify(settings));}catch{}},[settings]);

  const getLikedItems=useCallback(()=>{const all=[...SPIRIT_BOOKS,...CORPUS];return[...likedIds].map(id=>all.find(x=>x.id===id)).filter(Boolean);},[likedIds]);

  const refreshFeeds=useCallback((q,s,v)=>{
    const items=getLikedItems();
    const f=generateFeeds(q,s.discernment,s.maturity,v||vp,items,likedIds);
    setFeeds(f);
    if(!loaded)setLoaded(true);
    // If active tab no longer exists, reset to trending
    if(!f.find(t=>t.id===activeTab)) setActiveTab("trending");
  },[loaded,vp,getLikedItems,likedIds,activeTab]);

  useEffect(()=>{refreshFeeds("",settings);},[]);
  useEffect(()=>{if(loaded)refreshFeeds(query,settings,vp);},[settings.discernment,settings.maturity,refreshKey]);

  const handleSearch=(q)=>{setQuery(q);refreshFeeds(q,settings);};

  const handleTabSelect=(id)=>{
    if(id===activeTab)return;
    const tabIds=feeds.map(f=>f.id);
    const oldIdx=tabIds.indexOf(activeTab);
    const newIdx=tabIds.indexOf(id);
    setSlideDir(newIdx>oldIdx?1:-1);
    setTransitioning(true);
    setTimeout(()=>{setActiveTab(id);setTimeout(()=>setTransitioning(false),30);},150);
  };

  const handleRefreshTab=(id)=>{
    if(id==="foryou"){
      // Reset "For You" to only use recent likes (last 3)
      const items=getLikedItems();
      const recent=items.slice(-3);
      const vm=new Map();for(const it of recent)for(const v of(it.virtues||[]))vm.set(v,(vm.get(v)||0)+1);
      const nvp=[...vm.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
      setVp(nvp);
      setRefreshKey(k=>k+1);
    } else {
      setRefreshKey(k=>k+1);
    }
  };

  const handleLike=(item)=>{
    const nxt=new Set(likedIds);nxt.has(item.id)?nxt.delete(item.id):nxt.add(item.id);setLikedIds(nxt);
    const all=[...SPIRIT_BOOKS,...CORPUS];const items=[...nxt].map(id=>all.find(x=>x.id===id)).filter(Boolean);
    const vm=new Map();for(const it of items)for(const v of(it.virtues||[]))vm.set(v,(vm.get(v)||0)+1);
    const nvp=[...vm.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);
    setVp(nvp);
    // Regenerate feeds so new tabs (For You, Classics) appear,
    // but preserve the CURRENT tab's card order to prevent jumping.
    setTimeout(()=>{
      const newFeeds=generateFeeds(query,settings.discernment,settings.maturity,nvp,items,nxt);
      setFeeds(prev=>{
        // For the active tab, keep old results order — only update other tabs
        return newFeeds.map(nf=>{
          const oldTab=prev.find(of=>of.id===nf.id);
          if(nf.id===activeTab && oldTab){
            // Keep old order, but update liked state by merging
            return {...nf, results:oldTab.results};
          }
          return nf;
        });
      });
    },30);
  };

  const handleMore=(item)=>{
    const g=(item.genres||[])[0]||"";setQuery(g);
    const vm=new Map();for(const v of vp)vm.set(v,(vm.get(v)||0)+1);for(const v of(item.virtues||[]))vm.set(v,(vm.get(v)||0)+3);
    const nvp=[...vm.entries()].sort((a,b)=>b[1]-a[1]).slice(0,8).map(e=>e[0]);setVp(nvp);refreshFeeds(g,settings,nvp);
  };

  const activeFeed=feeds.find(f=>f.id===activeTab);
  const results=activeFeed?.results||[];
  const meta=activeFeed?.meta||null;
  const bb=bridgeBooks(vp,settings.maturity,likedIds);
  const tasteAnalysis=getLikedItems().length>=2?analyzeTaste(getLikedItems()):null;

  return(<div style={{backgroundColor:BG,minHeight:"100vh"}}>
    <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Source+Serif+4:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Libre+Franklin:wght@300;400;500;600;700&display=swap');*,*::before,*::after{box-sizing:border-box;margin:0;padding:0}::selection{background:${A}22;color:${INK}}::-webkit-scrollbar{width:5px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:#d0cdc6;border-radius:3px}@keyframes modalIn{from{opacity:0;transform:translate(-50%,-48%)}to{opacity:1;transform:translate(-50%,-50%)}}.card-layout{display:flex;flex-direction:column}.card-cover{width:100%;height:190px}@media(min-width:640px){.card-layout{flex-direction:row}.card-cover{width:190px;height:auto;min-height:280px}}`}</style>
    <div className="fixed inset-0 pointer-events-none" style={{opacity:0.02,zIndex:0,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`}}/>

    <nav style={{position:"sticky",top:0,zIndex:100,backgroundColor:BG+"E6",backdropFilter:"blur(14px)",borderBottom:`1px solid ${BD}`}}><div style={{maxWidth:860,margin:"0 auto",padding:"11px 24px",display:"flex",alignItems:"center",justifyContent:"space-between"}}><div className="flex items-center gap-2.5"><div className="flex items-center justify-center" style={{width:30,height:30,borderRadius:6,backgroundColor:INK}}><Eye size={14} color={BG}/></div><span style={{fontFamily:SF,fontSize:"1.05rem",fontWeight:700,color:INK}}>Identity</span></div><button onClick={()=>setModal(true)} className="flex items-center gap-2 cursor-pointer select-none" style={{padding:"5px 12px",borderRadius:"9999px",border:`1.5px solid ${BD}`,backgroundColor:"transparent"}}><Sliders size={12} color={BODY}/><span style={{fontFamily:SN,fontSize:"0.68rem",fontWeight:600,color:BODY}}>Settings</span>{vp.length>0&&<span style={{width:5,height:5,borderRadius:"50%",backgroundColor:A}}/>}</button></div></nav>

    <header style={{maxWidth:640,margin:"0 auto",padding:"42px 24px 10px",textAlign:"center",opacity:loaded?1:0,transform:loaded?"translateY(0)":"translateY(8px)",transition:"all 0.5s cubic-bezier(0.23,1,0.32,1)"}}><p style={{fontFamily:SN,fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.28em",textTransform:"uppercase",color:A,marginBottom:8}}>Fiction · Anime · Light Novels</p><h1 style={{fontFamily:SF,fontSize:"clamp(1.8rem,5vw,2.5rem)",fontWeight:500,color:INK,lineHeight:1.15}}>Stories chosen <em style={{fontWeight:400}}>for who you are</em></h1></header>

    <div style={{maxWidth:520,margin:"18px auto 0",padding:"0 24px",opacity:loaded?1:0,transition:"all 0.5s ease 0.1s"}}><div className="flex items-center" style={{backgroundColor:BGC,border:`1.5px solid ${focused?A:BD}`,borderRadius:"9999px",padding:"2px 4px 2px 14px",transition:"all 0.3s",boxShadow:focused?`0 4px 20px -4px ${A}12`:"0 1px 3px rgba(0,0,0,0.02)",transform:focused?"scale(1.012)":"scale(1)"}}><Search size={15} style={{color:focused?A:MU,flexShrink:0}}/><input ref={searchRef} type="text" value={query} onChange={e=>handleSearch(e.target.value)} onFocus={()=>setFocused(true)} onBlur={()=>{if(!query)setFocused(false);}} placeholder="Search title, author, genre, hook..." style={{flex:1,padding:"10px 8px",fontSize:"0.88rem",fontFamily:BSF,color:INK,background:"transparent",border:"none",outline:"none"}}/>{query&&<button onClick={()=>{setQuery("");handleSearch("");}} style={{width:24,height:24,borderRadius:"50%",border:"none",background:"transparent",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center"}}><X size={12} color={MU}/></button>}<div style={{width:32,height:32,borderRadius:"50%",backgroundColor:focused?INK:"transparent",display:"flex",alignItems:"center",justifyContent:"center",transition:"background 0.3s"}}><Search size={12} style={{color:focused?BG:"transparent"}}/></div></div></div>

    {/* Tab Bar */}
    <div style={{marginTop:20}}>
      <TabBar tabs={feeds} active={activeTab} onSelect={handleTabSelect} onRefresh={handleRefreshTab}/>
    </div>

    <div style={{maxWidth:820,margin:"12px auto 0",padding:"0 24px"}}><div style={{borderTop:`1px solid ${BD}`}}/><div className="flex items-center justify-between flex-wrap gap-2" style={{paddingTop:12,paddingBottom:2}}><div className="flex items-center gap-2"><Sparkles size={12} style={{color:MU}}/><span style={{fontFamily:SN,fontSize:"0.62rem",fontWeight:600,letterSpacing:"0.1em",textTransform:"uppercase",color:MU}}>{results.length} matches</span></div>{meta&&<div className="flex items-center gap-2"><span style={{fontFamily:SN,fontSize:"0.58rem",color:MU}}>{meta.spiritCount} curated · {meta.jikanCount} corpus</span>{meta.filteredOut>0&&<span style={{fontFamily:SN,fontSize:"0.58rem",color:AW}}>{meta.filteredOut} filtered</span>}</div>}</div></div>

    {/* Feed with slide transition */}
    <main style={{maxWidth:800,margin:"0 auto",padding:"12px 24px 80px",overflow:"hidden"}}>
      <div style={{
        transform: transitioning ? `translateX(${slideDir * 40}px)` : "translateX(0)",
        opacity: transitioning ? 0 : 1,
        transition: transitioning ? "none" : "transform 0.35s cubic-bezier(0.23,1,0.32,1), opacity 0.3s ease",
      }}>
        <Bridge books={bb} disc={settings.discernment}/>
        {results.length>0?(<div style={{display:"flex",flexDirection:"column",gap:18}}>{results.map((it,i)=>(
          <div key={it.id+(it.isWildcard?'-wc':'')} style={{position:"relative"}}>
            {it.isWildcard && <WildcardBadge/>}
            <Card item={it} index={i} visible={loaded&&!transitioning} onLike={handleLike} liked={likedIds.has(it.id)} disc={settings.discernment} onMore={handleMore}/>
          </div>
        ))}</div>):(<div style={{textAlign:"center",padding:"60px 0"}}><BookOpen size={36} style={{color:BD,margin:"0 auto 10px"}}/><p style={{fontFamily:SF,fontSize:"1.1rem",color:MU}}>No stories found</p></div>)}
      </div>
    </main>

    <footer style={{maxWidth:820,margin:"0 auto",padding:"20px 24px",borderTop:`1px solid ${BD}`,display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:8}}><div className="flex items-center gap-2"><div style={{width:18,height:18,borderRadius:4,backgroundColor:INK,display:"flex",alignItems:"center",justifyContent:"center"}}><Eye size={8} color={BG}/></div><span style={{fontFamily:SF,fontSize:"0.78rem",color:BODY}}>Identity</span></div><p style={{fontFamily:SN,fontSize:"0.58rem",color:MU}}>Content taxonomy + faith bridge · Spirit Books + Anime Corpus</p></footer>

    <Modal open={modal} onClose={()=>setModal(false)} settings={settings} onChange={setSettings} vp={vp} tasteAnalysis={tasteAnalysis}/>
  </div>);
}
