// Gera canais.json (lido pelo app no GitHub) a partir da lista de reserva em app/js/data.js.
// Uso: node tools/gerar-canais.js
const fs = require("fs"), path = require("path"), vm = require("vm");
const root = path.join(__dirname, "..");
const ctx = {};
vm.runInNewContext(fs.readFileSync(path.join(root, "app/js/data.js"), "utf8") + ";this.IGORTV = IGORTV;", ctx);
const out = {
  comoEditar: "Cada canal: n = nome, c = tipo (vira uma aba no guia), url = endereço .m3u8, bg = cor do quadro. " +
    "Só transmissões oficiais e gratuitas. O app lê este arquivo toda vez que abre.",
  canais: ctx.IGORTV.canais
};
fs.writeFileSync(path.join(root, "canais.json"), JSON.stringify(out, null, 2) + "\n", "utf8");
console.log("canais.json com " + out.canais.length + " canais");
