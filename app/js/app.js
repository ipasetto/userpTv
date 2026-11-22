/* Igor TV — tela inicial. Escrito para o navegador do Tizen 4 (Chromium antigo):
   sem spread, sem optional chaining, sem CSS grid. */
(function () {
  "use strict";
  var D = IGORTV;
  var NA_TV = typeof window.tizen !== "undefined";
  function $(id) { return document.getElementById(id); }
  function each(list, fn) { for (var i = 0; i < list.length; i++) fn(list[i], i); }
  function low(s) { return String(s || "").toLowerCase(); }

  /* ---------------- teclas do controle ---------------- */
  var K = { LEFT: 37, UP: 38, RIGHT: 39, DOWN: 40, ENTER: 13, BACK: 10009, ESC: 27, BKSP: 8, CH_UP: 427, CH_DOWN: 428 };
  if (NA_TV) {
    try {
      tizen.tvinputdevice.registerKeyBatch(["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "ChannelUp", "ChannelDown"]);
    } catch (e) { /* segue sem as teclas extras */ }
  }

  /* ---------------- aviso rápido ---------------- */
  var toastT;
  function toast(t) {
    var e = $("toast"); e.textContent = t; e.className = "toast show";
    clearTimeout(toastT); toastT = setTimeout(function () { e.className = "toast"; }, 2200);
  }

  /* ---------------- abrir apps da TV ---------------- */
  function launch(id, nome, depois) {
    if (!NA_TV) { toast("Abrindo " + nome + "…"); return; }
    try {
      tizen.application.launch(id, function () {}, function () {
        if (depois) depois(); else toast("Não consegui abrir " + nome + ".");
      });
    } catch (e) { if (depois) depois(); else toast("Não consegui abrir " + nome + "."); }
  }
  function launchFirst(ids, nome, i) {
    i = i || 0;
    if (i >= ids.length) { toast("Não achei " + nome + " nesta TV."); return; }
    launch(ids[i], nome, function () { launchFirst(ids, nome, i + 1); });
  }

  /* ---------------- apps instalados ---------------- */
  var installed = [];
  var SELF = "";
  function loadApps(cb) {
    if (!NA_TV) {
      installed = [
        { id: "n", name: "Netflix" }, { id: "p", name: "Prime Video" }, { id: "g", name: "Globoplay" },
        { id: "d", name: "Disney+" }, { id: "m", name: "Max" }, { id: "s", name: "Spotify" },
        { id: "yk", name: "YouTube Kids" }, { id: D.youtubeSemAnuncios, name: "TizenBrew" },
        { id: "y", name: "YouTube" }, { id: "b", name: "Navegador" }, { id: "gal", name: "Gallery" }
      ];
      cb(); return;
    }
    try { SELF = tizen.application.getCurrentApplication().appInfo.id; } catch (e) {}
    try {
      tizen.application.getAppsInfo(function (list) {
        installed = [];
        each(list, function (a) {
          if (a.show === false || a.id === SELF || !a.name) return;
          installed.push({ id: a.id, name: a.name, icon: a.iconPath });
        });
        cb();
      }, function () { cb(); });
    } catch (e) { cb(); }
  }
  function findApp(def) {
    var hit = null;
    each(def.match, function (m) {
      if (hit) return;
      if (m === "__youtube__") {
        each(installed, function (a) { if (!hit && a.id === D.youtubeSemAnuncios) hit = a; });
        if (!hit) each(installed, function (a) { if (!hit && low(a.name) === "youtube") hit = a; });
        return;
      }
      each(installed, function (a) {
        if (hit) return;
        var n = low(a.name);
        if (def.exato ? (n === m || n.indexOf(m + " ") === 0) : n.indexOf(m) >= 0) hit = a;
      });
    });
    return hit;
  }

  /* Nome curto e cores de um app instalado ("Spotify - Music and Podcasts" vira "Spotify"). */
  var PALETA = ["#1b4f8f", "#1a5a6a", "#1a7a5a", "#8a3a14", "#2a3a8a", "#8a1a3a", "#3a6a1a", "#5a4a14"];
  function hash(s) { var h = 0; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0; return Math.abs(h); }
  function matchDef(a) {
    var n = low(a.name), found = null;
    each(D.favoritos, function (def) {
      if (found) return;
      each(def.match, function (m) {
        if (found) return;
        if (m === "__youtube__") { if (a.id === D.youtubeSemAnuncios) found = def; return; }
        if (def.exato ? (n === m || n.indexOf(m + " ") === 0) : n.indexOf(m) >= 0) found = def;
      });
    });
    return found;
  }
  function present(a) {
    if (a.id !== D.youtubeSemAnuncios && low(a.name) === "youtube")
      return { n: "YouTube original", sub: "com anúncios", bg: "linear-gradient(135deg,#2a1414,#6a1a1a)", id: a.id };
    var def = matchDef(a);
    if (def) return { n: def.n, bg: def.bg, fg: def.fg, sub: def.sub, id: a.id };
    var c = PALETA[hash(a.id) % PALETA.length];
    return { n: a.name, bg: "linear-gradient(135deg," + c + ",#172231)", id: a.id };
  }

  /* Favoritos escolhidos pelo usuário, guardados na TV. Na primeira vez, usa os conhecidos que estiverem instalados. */
  var FAVKEY = "igortv.favoritos";
  function getFavIds() {
    try { var s = localStorage.getItem(FAVKEY); if (s) return JSON.parse(s); } catch (e) {}
    var ids = [];
    each(D.favoritos, function (def) { var h = findApp(def); if (h && ids.indexOf(h.id) < 0) ids.push(h.id); });
    return ids;
  }
  function setFavIds(ids) { try { localStorage.setItem(FAVKEY, JSON.stringify(ids)); } catch (e) {} }
  function isFav(id) { return getFavIds().indexOf(id) >= 0; }
  function toggleFav(app) {
    var ids = getFavIds(), i = ids.indexOf(app.id);
    if (i >= 0) { ids.splice(i, 1); toast(app.n + " saiu dos favoritos."); }
    else { ids.push(app.id); toast(app.n + " entrou nos favoritos."); }
    setFavIds(ids);
  }

  /* ---------------- menu de opções (abrir / favoritar) ---------------- */
  var menuPrev = null;
  function openMenu(title, opts) {
    menuPrev = { items: items, cur: cur, onOk: onOk };
    $("m-title").textContent = title;
    var box = $("m-opts"); box.innerHTML = "";
    var els = [];
    each(opts, function (o) {
      var b = document.createElement("div"); b.className = "mopt"; b.textContent = o[0]; b._do = o[1];
      box.appendChild(b); els.push(b);
    });
    $("menu").hidden = false;
    wire(els, function (el) { closeMenu(); if (el._do) el._do(); });
  }
  function closeMenu() {
    if (!menuPrev) return;
    $("menu").hidden = true;
    var p = menuPrev; menuPrev = null;
    items = p.items; onOk = p.onOk;
    each(items, function (el) { el.classList.remove("on"); });
    if (items.length) setOn(Math.min(p.cur, items.length - 1));
  }

  /* ---------------- foco (quadro âmbar) ---------------- */
  var view = "home", items = [], cur = 0, onOk = null;
  function scrollTo(el) {
    if (el.scrollIntoViewIfNeeded) el.scrollIntoViewIfNeeded(false); else el.scrollIntoView(false);
  }
  function setOn(i) {
    if (items[cur]) items[cur].classList.remove("on");
    cur = i; var el = items[cur]; if (!el) return;
    el.classList.add("on");
    if (el.getAttribute("data-scroll")) scrollTo(el);
    if (el.onfocusin2) el.onfocusin2();
  }
  function wire(list, ok, start) {
    items = list; onOk = ok; cur = 0;
    each(list, function (el, i) {
      el.classList.remove("on");
      el.onmouseover = function () { if (items === list) setOn(i); };
      el.onclick = function () { if (items !== list) return; setOn(i); ok(el); };
    });
    if (list.length) setOn(start || 0);
  }
  function nearest(dx, dy) {
    if (!items[cur]) return;
    var r = items[cur].getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
    var best = -1, bd = Infinity;
    each(items, function (el, i) {
      if (i === cur) return;
      var q = el.getBoundingClientRect(), x = q.left + q.width / 2 - cx, y = q.top + q.height / 2 - cy;
      var main = dx ? x * dx : y * dy, cross = dx ? Math.abs(y) : Math.abs(x);
      if (main <= 4) return;
      var d = main + cross * 2.5;
      if (d < bd) { bd = d; best = i; }
    });
    if (best >= 0) setOn(best);
  }

  function show(v) {
    view = v;
    each(["home", "apps", "guide", "watch", "settings", "help"], function (x) { $(x).hidden = x !== v; });
    if (v === "watch") document.documentElement.classList.add("watching"); else document.documentElement.classList.remove("watching");
  }

  /* ---------------- grade adaptável ---------------- */
  function shape(n) {
    if (n <= 4) return { cols: Math.max(n, 1), mark: 3.4 };
    if (n <= 6) return { cols: 3, mark: 3 };
    if (n <= 8) return { cols: 4, mark: 2.6 };
    return { cols: 4, mark: 2, compact: true, scroll: n > 12 };
  }
  function tileHTML(a) {
    var sub = a.sub ? '<span class="sub">' + a.sub + "</span>" : "";
    var tag = a.sub ? '<span class="tag">' + a.sub + "</span>" : "";
    return '<span class="mark">' + a.n + sub + '</span><span class="name"><span class="t">' + a.n + tag +
      '</span><span class="letter">' + a.n.charAt(0) + '</span><span class="okt">OK para abrir</span></span>';
  }
  function fillGrid(box, list, s, rowH) {
    box.innerHTML = "";
    box.className = "grid" + (s.compact ? " compact" : "") + (s.scroll ? " scroll" : "");
    box.style.setProperty("--mark", s.mark + "rem");
    var rows = Math.ceil(list.length / s.cols);
    var out = [];
    each(list, function (a) {
      var cell = document.createElement("div"); cell.className = "cell";
      cell.style.width = (100 / s.cols) + "%";
      cell.style.height = s.scroll ? rowH : (100 / rows) + "%";
      var b = document.createElement("div"); b.className = "app";
      b.style.setProperty("--bg", a.bg); b.style.setProperty("--fg", a.fg || "#fff");
      b.innerHTML = tileHTML(a);
      if (s.scroll) b.setAttribute("data-scroll", "1");
      b._app = a;
      cell.appendChild(b); box.appendChild(cell); out.push(b);
    });
    return out;
  }

  /* ---------------- INÍCIO ---------------- */
  var ICONS = {
    tv: '<rect x="3" y="5" width="18" height="12" rx="2"/><path d="M8 21h8M12 17v4"/>',
    hdmi: '<path d="M4 8h16v5l-3 3H7l-3-3z"/><path d="M8 11h8"/>',
    grid: '<rect x="4" y="4" width="6" height="6" rx="1.2"/><rect x="14" y="4" width="6" height="6" rx="1.2"/><rect x="4" y="14" width="6" height="6" rx="1.2"/><rect x="14" y="14" width="6" height="6" rx="1.2"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M4.2 7.5l2.1 1.2M17.7 15.3l2.1 1.2M4.2 16.5l2.1-1.2M17.7 8.7l2.1-1.2"/><circle cx="12" cy="12" r="7"/>',
    help: '<circle cx="12" cy="12" r="9"/><path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .8-1 1.5v.4M12 17h.01"/>'
  };
  /* setas e ícones das dicas: desenhados em SVG, mesmo traço dos ícones da barra */
  var KEYI = {
    left: '<path d="M15 5l-7 7 7 7"/>', right: '<path d="M9 5l7 7-7 7"/>',
    up: '<path d="M5 15l7-7 7 7"/>', down: '<path d="M5 9l7 7 7-7"/>',
    back: '<path d="M15 5l-7 7 7 7"/>',
    home: '<path d="M4 11l8-7 8 7"/><path d="M6 10v9h12v-9"/>'
  };
  each(document.querySelectorAll("[data-i]"), function (el) {
    var p = KEYI[el.getAttribute("data-i")];
    if (p) el.outerHTML = el.tagName === "I" ? '<svg viewBox="0 0 24 24">' + p + "</svg>" :
      el.outerHTML.replace("></span>", '><svg viewBox="0 0 24 24">' + p + "</svg></span>");
  });
  var FNS = [["tv", "TV ao vivo"], ["hdmi", "Entradas HDMI"], ["grid", "Todos os apps"], ["gear", "Configurações"], ["help", "Ajuda"]];
  each(FNS, function (f) {
    var b = document.createElement("div"); b.className = "fn"; b._fn = f[1];
    b.innerHTML = '<svg viewBox="0 0 24 24">' + ICONS[f[0]] + "</svg><span>" + f[1] + "</span>";
    $("dock").appendChild(b);
  });
  var homeKey = null;
  function enterHome() {
    show("home");
    var favs = [], ids = getFavIds();
    each(installed, function (a) { if (ids.indexOf(a.id) >= 0) favs.push(present(a)); });
    favs.sort(function (a, b) { return a.n.localeCompare(b.n, "pt-BR"); });
    var s = shape(favs.length);
    $("more").textContent = (s.scroll ? "· " + favs.length + " apps, role para ver todos " : "") + "· para mudar, abra Todos os apps";
    var tiles = fillGrid($("grid"), favs, s, "9rem");
    if (!favs.length) $("grid").innerHTML = '<p class="nofav">Nenhum favorito ainda. Abra <b>Todos os apps</b> na barra de baixo, escolha um app e aperte OK para adicionar.</p>';
    var all = tiles.concat(Array.prototype.slice.call($("dock").children));
    var start = 0;
    each(all, function (el, i) { if (homeKey && (el._app ? el._app.id : el._fn) === homeKey) start = i; });
    wire(all, function (el) {
      homeKey = el._app ? el._app.id : el._fn;
      if (el._app) return launch(el._app.id, el._app.n);
      if (el._fn === "TV ao vivo") return enterGuide();
      if (el._fn === "Entradas HDMI") return launchFirst(D.entradas, "a troca de entrada");
      if (el._fn === "Todos os apps") return enterApps();
      if (el._fn === "Configurações") return enterSettings();
      if (el._fn === "Ajuda") return enterHelp();
    }, start);
  }

  /* ---------------- TODOS OS APPS ---------------- */
  var STAR = '<svg class="star" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z"/></svg>';
  function enterApps(focus) {
    show("apps");
    var ids = getFavIds(), tiles = [];
    each(installed, function (a) { var p = present(a); p.fav = ids.indexOf(a.id) >= 0; tiles.push(p); });
    tiles.sort(function (a, b) { return a.n.localeCompare(b.n, "pt-BR"); });
    var els = fillGrid($("allgrid"), tiles, { cols: 4, mark: 2, compact: true, scroll: true }, "8.6rem");
    each(els, function (el) {
      if (el._app.fav) { el.classList.add("isfav"); el.querySelector(".letter").outerHTML = STAR; }
      el.querySelector(".okt").textContent = "OK: opções";
    });
    wire(els, function (el) {
      var a = el._app, at = cur;
      openMenu(a.n, [
        ["Abrir " + a.n, function () { launch(a.id, a.n); }],
        [a.fav ? "Tirar dos favoritos" : "Adicionar aos favoritos", function () { toggleFav(a); enterApps(at); }],
        ["Cancelar", null]
      ]);
    }, Math.min(focus || 0, els.length - 1));
  }

  /* ---------------- TV AO VIVO ---------------- */
  var CATS = ["Todos", "Abertos", "Notícias", "Públicos"];
  var canais = [], catIdx = 0, lastCh = 1, checked = false;
  try { lastCh = +localStorage.getItem("ultimoCanal") || 1; } catch (e) {}
  function checkChannels(cb) {
    var pend = D.canais.length, ok = [];
    each(D.canais, function (ch, i) {
      var done = false;
      function fin(good) { if (done) return; done = true; if (good) ok.push(i); if (--pend === 0) end(); }
      var x = new XMLHttpRequest();
      x.open("GET", ch.url, true); x.timeout = 7000;
      x.onload = function () { fin(x.status === 200 && x.responseText.indexOf("#EXTM3U") >= 0); };
      x.onerror = function () { fin(!NA_TV); }; x.ontimeout = function () { fin(false); };
      try { x.send(); } catch (e) { fin(!NA_TV); }
    });
    function end() {
      ok.sort(function (a, b) { return a - b; });
      canais = [];
      each(ok, function (i, k) {
        var c = D.canais[i];
        canais.push({ n: c.n, c: c.c, url: c.url, bg: c.bg, num: k + 1 });
      });
      checked = true; cb();
    }
  }
  each(CATS, function (c) {
    var b = document.createElement("div"); b.className = "cat"; b.textContent = c; $("cats").appendChild(b);
  });
  function showPreview(ch) {
    $("preview").style.setProperty("--pbg", ch.bg);
    $("p-wm").textContent = ch.n; $("p-num").textContent = "Canal " + ch.num + " · " + ch.c; $("p-nm").textContent = ch.n;
  }
  function fillList(focusNum) {
    each($("cats").children, function (b, i) { b.className = "cat" + (i === catIdx ? " sel" : ""); });
    var list = [];
    each(canais, function (ch) { if (catIdx === 0 || ch.c === CATS[catIdx]) list.push(ch); });
    $("g-empty").hidden = canais.length > 0;
    $("preview").style.visibility = list.length ? "visible" : "hidden";
    var box = $("list"); box.innerHTML = "";
    var els = [], start = 0;
    each(list, function (ch, i) {
      var b = document.createElement("div"); b.className = "ch"; b.setAttribute("data-scroll", "1"); b._ch = ch;
      b.innerHTML = '<span class="n">' + ch.num + '</span><span class="t">' + ch.n + '<span class="c">' + ch.c + '</span></span><span class="go">OK assistir</span>';
      b.onfocusin2 = function () { showPreview(ch); };
      box.appendChild(b); els.push(b);
      if (ch.num === focusNum) start = i;
    });
    wire(els, function (el) { enterWatch(el._ch.num); }, start);
  }
  function enterGuide(focusNum) {
    show("guide");
    if (!checked) {
      /* a verificação já começou ao abrir o app; quando terminar, ela preenche esta lista */
      $("list").innerHTML = '<p class="empty">Verificando os canais…</p>'; items = [];
      return;
    }
    fillList(focusNum || lastCh);
  }

  /* ---------------- ASSISTINDO ---------------- */
  var AV = null;
  try { if (window.webapis && webapis.avplay) AV = webapis.avplay; } catch (e) {}
  var wnum = 1, bannerT;
  function stopPlayer() {
    if (AV) { try { AV.stop(); } catch (e) {} try { AV.close(); } catch (e) {} }
    var v = $("vid"); v.pause(); v.removeAttribute("src");
  }
  function play(url) {
    stopPlayer();
    $("w-load").hidden = false; $("w-load").textContent = "Carregando o canal…";
    if (AV) {
      $("vid").hidden = true; $("av").style.display = "block";
      try {
        AV.open(url);
        var r = $("tv").getBoundingClientRect(), k = 1920 / window.innerWidth;
        AV.setDisplayRect(Math.round(r.left * k), Math.round(r.top * k), Math.round(r.width * k), Math.round(r.height * k));
        AV.setListener({
          onbufferingcomplete: function () { $("w-load").hidden = true; },
          onerror: function () { $("w-load").hidden = false; $("w-load").textContent = "Este canal não abriu agora. Use ▲ ▼ para trocar."; }
        });
        AV.prepareAsync(function () { AV.play(); $("w-load").hidden = true; },
          function () { $("w-load").textContent = "Este canal não abriu agora. Use ▲ ▼ para trocar."; });
      } catch (e) { $("w-load").textContent = "Este canal não abriu agora. Use ▲ ▼ para trocar."; }
    } else {
      $("av").style.display = "none";
      var v = $("vid"); v.hidden = false; v.src = url;
      v.onplaying = function () { $("w-load").hidden = true; };
      v.onerror = function () { $("w-load").textContent = "Prévia no PC: o vídeo só toca na TV."; };
      var p = v.play(); if (p && p.catch) p.catch(function () {});
    }
  }
  function bannerShow() {
    var b = $("banner"); b.className = "banner";
    clearTimeout(bannerT); bannerT = setTimeout(function () { b.className = "banner hide"; }, 4000);
  }
  function tune(num) {
    if (!canais.length) return;
    wnum = ((num - 1 + canais.length) % canais.length) + 1; lastCh = wnum;
    try { localStorage.setItem("ultimoCanal", wnum); } catch (e) {}
    var ch = canais[wnum - 1];
    $("w-num").textContent = ch.num; $("w-nm").textContent = ch.n; $("w-c").textContent = ch.c;
    bannerShow(); play(ch.url);
  }
  function enterWatch(num) { show("watch"); items = []; tune(num); }
  function leaveWatch() { stopPlayer(); enterGuide(wnum); }

  /* ---------------- número digitado ---------------- */
  var typed = "", typT;
  function digit(d) {
    typed = (typed + d).slice(-2);
    var t = $("typed");
    if (view === "watch") { t.hidden = false; t.textContent = typed; }
    clearTimeout(typT);
    typT = setTimeout(function () {
      var n = +typed; typed = ""; t.hidden = true;
      if (!checked) { enterGuide(n); return; }
      if (n >= 1 && n <= canais.length) {
        if (view === "watch") tune(n); else { catIdx = 0; show("guide"); fillList(n); }
      } else toast("Não existe o canal " + n + ".");
    }, 1000);
  }

  /* ---------------- CONFIGURAÇÕES ---------------- */
  var PANELS = {
    instalar:
      "<h2>Modo instalação</h2><p>Use só quando for instalar ou atualizar o Igor TV pelo computador.</p><ol>" +
      "<li>Aperte a casinha do controle e vá em <b>Apps</b>.</li>" +
      "<li>Digite <b>1 2 3 4 5</b> no controle.</li>" +
      "<li>Em “Host PC IP”, coloque <span class='ip'>" + D.ipDoPC + "</span> e aperte OK.</li>" +
      "<li>Segure o botão de energia até aparecer o logo da Samsung.</li></ol>" +
      "<p>Terminou? Repita os passos com <span class='ip'>127.0.0.1</span> para o YouTube sem anúncios voltar a funcionar.</p>",
    tv: "<h2>Ajustes da TV</h2><p>Imagem, som, rede e atualização ficam no menu da Samsung.</p><ol><li>Aperte a <b>casinha</b> do controle.</li><li>Vá até a <b>engrenagem</b> (Configurações), no canto esquerdo.</li><li>Para voltar aqui, aperte a casinha e escolha <b>Igor TV</b>.</li></ol>",
    sobre: ""
  };
  function enterSettings() {
    show("settings");
    PANELS.sobre = "<h2>Sobre o Igor TV</h2><p>Versão " + D.versao + "</p><p>" + installed.length +
      " apps instalados encontrados.</p><p>" + (checked ? canais.length + " canais ao vivo funcionando." : "Canais ainda não verificados.") + "</p>";
    var opts = [
      ["instalar", "Modo instalação", "Para instalar ou atualizar pelo PC"],
      ["tv", "Ajustes da TV", "Como chegar no menu da Samsung"],
      ["sobre", "Sobre o Igor TV", "Versão e informações"]
    ];
    var box = $("setmenu"); box.innerHTML = "";
    var els = [];
    each(opts, function (o) {
      var b = document.createElement("div"); b.className = "opt"; b._k = o[0];
      b.innerHTML = o[1] + "<small>" + o[2] + "</small>";
      b.onfocusin2 = function () { $("setpanel").innerHTML = PANELS[o[0]]; };
      box.appendChild(b); els.push(b);
    });
    wire(els, function () {});
  }

  function enterHelp() { show("help"); items = []; }

  /* ---------------- teclado / controle ---------------- */
  function back() {
    if (view === "watch") return leaveWatch();
    if (view !== "home") return enterHome();
  }
  document.addEventListener("keydown", function (e) {
    var k = e.keyCode;
    if (menuPrev) {
      if (k === K.BACK || k === K.ESC || k === K.BKSP) { e.preventDefault(); return closeMenu(); }
      if (k === K.UP) { e.preventDefault(); return nearest(0, -1); }
      if (k === K.DOWN) { e.preventDefault(); return nearest(0, 1); }
      if (k === K.ENTER) { e.preventDefault(); return onOk(items[cur]); }
      e.preventDefault(); return;
    }
    if (k >= 48 && k <= 57) { e.preventDefault(); return digit(String(k - 48)); }
    if (k === K.BACK || k === K.ESC || k === K.BKSP) { e.preventDefault(); return back(); }
    if (view === "watch") {
      if (k === K.UP || k === K.CH_UP) tune(wnum + 1);
      else if (k === K.DOWN || k === K.CH_DOWN) tune(wnum - 1);
      else if (k === K.ENTER) leaveWatch();
      else bannerShow();
      e.preventDefault(); return;
    }
    if ((k === K.CH_UP || k === K.CH_DOWN) && view !== "watch") {
      e.preventDefault(); if (!checked) return enterGuide();
      return enterWatch(k === K.CH_UP ? lastCh + 1 : lastCh - 1);
    }
    if (view === "guide" && (k === K.LEFT || k === K.RIGHT)) {
      e.preventDefault(); if (!checked) return;
      catIdx = (catIdx + (k === K.RIGHT ? 1 : -1) + CATS.length) % CATS.length; fillList(-1); return;
    }
    if (k === K.LEFT) { e.preventDefault(); nearest(-1, 0); }
    else if (k === K.RIGHT) { e.preventDefault(); nearest(1, 0); }
    else if (k === K.UP) { e.preventDefault(); nearest(0, -1); }
    else if (k === K.DOWN) { e.preventDefault(); nearest(0, 1); }
    else if (k === K.ENTER) { e.preventDefault(); if (items[cur] && onOk) onOk(items[cur]); }
  });

  /* Ao voltar para o app (depois de abrir Netflix etc.), atualiza a lista de apps. */
  document.addEventListener("visibilitychange", function () {
    if (document.hidden) { if (view === "watch") stopPlayer(); return; }
    if (view === "watch") { tune(wnum); return; }
    loadApps(function () { if (view === "home") enterHome(); });
  });

  /* ---------------- relógio ---------------- */
  function tick() {
    var d = new Date();
    $("time").textContent = d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    $("day").textContent = d.toLocaleDateString("pt-BR", { weekday: "long", day: "numeric", month: "long" });
    var h = d.getHours(), s = h < 12 ? "Bom dia" : h < 18 ? "Boa tarde" : "Boa noite";
    $("greet").innerHTML = s + ". <b>O que vamos assistir?</b>";
  }
  tick(); setInterval(tick, 15000);

  loadApps(enterHome);
  checkChannels(function () { if (view === "guide") fillList(lastCh); });
})();
