/* Igor TV — dados editáveis. */
var IGORTV = {
  versao: "1.0.0",
  ipDoPC: "192.168.1.53",

  /* App que abre no botão YouTube: o TizenBrew, que carrega o TizenTube (sem anúncios). */
  youtubeSemAnuncios: "xvvl3S1bvH.TizenBrewStandalone",

  /* Favoritos: nomes como aparecem na TV. Só os que estiverem instalados aparecem.
     "match" é comparado com o nome do app instalado, sem diferenciar maiúsculas. */
  favoritos: [
    { n: "Netflix",      match: ["netflix"],               bg: "linear-gradient(135deg,#141414,#3a0a0c)", fg: "#ff3b45" },
    { n: "YouTube",      match: ["__youtube__"],           bg: "linear-gradient(135deg,#2a0a0a,#c4161c)", sub: "sem anúncios" },
    { n: "Prime Video",  match: ["prime video", "amazon"], bg: "linear-gradient(135deg,#0f2a44,#1b5e8f)" },
    { n: "Globoplay",    match: ["globoplay"],             bg: "linear-gradient(135deg,#b3241c,#a8460c)" },
    { n: "Disney+",      match: ["disney"],                bg: "linear-gradient(135deg,#0b1d5c,#1a3fa8)" },
    { n: "Max",          match: ["max", "hbo"],            bg: "linear-gradient(135deg,#1630c9,#5a1bd1)", exato: true },
    { n: "Spotify",      match: ["spotify"],               bg: "linear-gradient(135deg,#0f3d22,#1a8f43)" },
    { n: "YouTube Kids", match: ["youtube kids"],          bg: "linear-gradient(135deg,#a3121a,#a85a0e)" },
    { n: "Apple TV",     match: ["apple tv"],              bg: "linear-gradient(135deg,#1c1c1e,#3a3a3c)" },
    { n: "Paramount+",   match: ["paramount"],             bg: "linear-gradient(135deg,#0a2a8a,#0d5ad1)" },
    { n: "Pluto TV",     match: ["pluto"],                 bg: "linear-gradient(135deg,#2b2b2b,#5a4a0a)" },
    { n: "Crunchyroll",  match: ["crunchyroll"],           bg: "linear-gradient(135deg,#a8410a,#c25a12)" },
    { n: "Deezer",       match: ["deezer"],                bg: "linear-gradient(135deg,#3a1a6a,#6a2ab0)" },
    { n: "Twitch",       match: ["twitch"],                bg: "linear-gradient(135deg,#3d1f7a,#6b3fc4)" },
    { n: "Telecine",     match: ["telecine"],              bg: "linear-gradient(135deg,#5a0a1e,#a3123a)" },
    { n: "Samsung TV Plus", match: ["samsung tv plus"],    bg: "linear-gradient(135deg,#0a2a5a,#1a5ab0)" }
  ],

  /* Canais ao vivo: só transmissões oficiais e gratuitas das emissoras.
     Testados em 22/11/2026. O app testa de novo ao abrir e esconde os que estiverem fora do ar. */
  canais: [
    { n: "TV Brasil",   c: "Abertos",  url: "https://tvbrasil-stream.ebc.com.br/index.m3u8", bg: "linear-gradient(135deg,#0a3a5a,#1270a8)" },
    { n: "TV Cultura",  c: "Abertos",  url: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8", bg: "linear-gradient(135deg,#0d4a3a,#16806a)" },
    { n: "Rede Minas",  c: "Abertos",  url: "https://8hzcavccys.zoeweb.tv/redeminas/ngrp:redeminas_all/playlist.m3u8", bg: "linear-gradient(135deg,#4a1a5a,#8a2aa0)" },
    { n: "CNN Brasil",  c: "Notícias", url: "https://d25usgadhphvwi.cloudfront.net/hls/main.m3u8", bg: "linear-gradient(135deg,#3a0a0a,#a01818)" },
    { n: "Record News", c: "Notícias", url: "https://rnw-rn.otteravision.com/rnw/rn/rnw_rn.m3u8", bg: "linear-gradient(135deg,#4a0a1a,#8a1a2a)" },
    { n: "TV Câmara",   c: "Públicos", url: "https://stream3.camara.gov.br/tv1/manifest.m3u8", bg: "linear-gradient(135deg,#0a3a2a,#13804f)" }
  ],

  /* Apps da Samsung tentados pelos botões (o primeiro que existir abre). */
  entradas: ["org.tizen.tv-viewer", "com.samsung.tv.source", "org.tizen.source-menu"],
  ajustesDaTV: ["com.samsung.tv.setting", "org.tizen.setting", "com.samsung.tv.settings"]
};
