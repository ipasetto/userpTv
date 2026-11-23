/* IPTV — dados editáveis. */
var USERPTV = {
  versao: "2.0.5",
  ipDoPC: "192.168.1.53",

  /* App que abre no botão YouTube: o TizenBrew, que carrega o TizenTube (sem anúncios). */
  youtubeSemAnuncios: "xvvl3S1bvH.TizenBrewStandalone",

  /* Favoritos: nomes como aparecem na TV. Só os que estiverem instalados aparecem.
     "match" é comparado com o nome do app instalado, sem diferenciar maiúsculas. */
  /* Em cada favorito, "icone" troca o ícone: false = sem ícone (só o nome); "https://..." = imagem própria. */
  favoritos: [
    { n: "Netflix",      match: ["netflix"],               bg: "#1c1414", fg: "#ff3b45" },
    { n: "YouTube",      match: ["__youtube__"],           bg: "#c4161c", sub: "sem anúncios", icone: false },
    { n: "Prime Video",  match: ["prime video", "amazon"], bg: "#1b5e8f", icone: false },
    { n: "Globoplay",    match: ["globoplay"],             bg: "#a8460c" },
    { n: "Disney+",      match: ["disney"],                bg: "#1a3fa8" },
    { n: "Max",          match: ["max", "hbo"],            bg: "#0b3fd6", exato: true },
    { n: "Spotify",      match: ["spotify"],               bg: "#1a8f43" },
    { n: "YouTube Kids", match: ["youtube kids"],          bg: "#a85a0e" },
    { n: "Apple TV",     match: ["apple tv"],              bg: "#3a3a3c" },
    { n: "Paramount+",   match: ["paramount"],             bg: "#0d5ad1" },
    { n: "Pluto TV",     match: ["pluto"],                 bg: "#5a4a0a" },
    { n: "Crunchyroll",  match: ["crunchyroll"],           bg: "#c25a12" },
    { n: "Deezer",       match: ["deezer"],                bg: "#6a2ab0" },
    { n: "Twitch",       match: ["twitch"],                bg: "#6b3fc4" },
    { n: "Telecine",     match: ["telecine"],              bg: "#a3123a" },
    { n: "Samsung TV Plus", match: ["samsung tv plus"],    bg: "#1a5ab0", icone: false }
  ],

  /* Atualização pelo botão das Configurações: o serviço do TizenBrew Installer baixa a última versão
     publicada neste repositório e instala por cima (IDs conferidos no pacote do Installer, v1.1.3). */
  repo: "ipasetto/userpTv",
  instaladorServico: "xvvl3S1bTI.InstallerService",
  instaladorApp: "xvvl3S1bTI.TizenBrewStandalone",

  /* Lista de canais editável no GitHub: o app lê este arquivo ao abrir (sem precisar reinstalar).
     Se não conseguir, usa a última lista boa ou a lista abaixo. */
  canaisURL: "https://raw.githubusercontent.com/ipasetto/userpTv/main/canais.json",

  /* Atalhos de sites (apps web): editados em atalhos.json no GitHub. Cada um vira um botão nos
     favoritos e abre no navegador da TV. */
  atalhosURL: "https://raw.githubusercontent.com/ipasetto/userpTv/main/atalhos.json",
  atalhos: [],

  /* Canais ao vivo: só transmissões oficiais e gratuitas das emissoras.
     Testados em 22/11/2026. O app testa de novo ao abrir e esconde os que estiverem fora do ar. */
  canais: [
    { n: "TV Brasil",   c: "Abertos",  url: "https://tvbrasil-stream.ebc.com.br/index.m3u8", bg: "#1270a8" },
    { n: "TV Cultura",  c: "Abertos",  url: "https://player-tvcultura.stream.uol.com.br/live/tvcultura.m3u8", bg: "#16806a" },
    { n: "Rede Minas",  c: "Abertos",  url: "https://8hzcavccys.zoeweb.tv/redeminas/ngrp:redeminas_all/playlist.m3u8", bg: "#b8441a" },
    { n: "CNN Brasil",  c: "Notícias", url: "https://d25usgadhphvwi.cloudfront.net/hls/main.m3u8", bg: "#a01818" },
    { n: "Record News", c: "Notícias", url: "https://rnw-rn.otteravision.com/rnw/rn/rnw_rn.m3u8", bg: "#8a1a2a" },
    { n: "TV Câmara",   c: "Públicos", url: "https://stream3.camara.gov.br/tv1/manifest.m3u8", bg: "#13804f" }
  ],

  /* Canais que dependem de app da emissora foram retirados a pedido do dono (22/11/2026). */
  canaisApp: [],

  /* Apps da Samsung tentados pelos botões (o primeiro que existir abre). */
  /* conferido na TV em 22/11/2026: o app de TV/HDMI existe; os Ajustes da Samsung não podem ser abertos por outro app */
  entradas: ["org.tizen.tv-viewer"],
  ajustesDaTV: []
};
