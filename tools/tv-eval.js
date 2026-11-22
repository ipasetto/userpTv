// Roda uma expressão JS dentro do Igor TV aberto na TV (modo depuração) e mostra o resultado.
// Uso: node tools/tv-eval.js <porta> "<expressão>"
// Antes: sdb shell 0 debug IgorTVHome.IgorTV  →  sdb forward tcp:<porta> tcp:<porta>
const [port, expr] = process.argv.slice(2);
(async () => {
  const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  const ws = new WebSocket(list[0].webSocketDebuggerUrl);
  let id = 0; const pend = {};
  const send = (method, params = {}) => new Promise(r => { pend[++id] = r; ws.send(JSON.stringify({ id, method, params })); });
  ws.onmessage = m => {
    const d = JSON.parse(m.data);
    if (d.id && pend[d.id]) { pend[d.id](d); delete pend[d.id]; }
    else if (d.method === "Runtime.exceptionThrown") console.log("ERRO NA PÁGINA:", d.params.exceptionDetails.exception && d.params.exceptionDetails.exception.description);
    else if (d.method === "Runtime.consoleAPICalled") console.log("console:", d.params.args.map(a => a.value).join(" "));
  };
  await new Promise(r => (ws.onopen = r));
  await send("Runtime.enable");
  const res = await send("Runtime.evaluate", { expression: "Promise.resolve(" + expr + ")", awaitPromise: true, returnByValue: true });
  const r = res.result;
  if (!r) { console.log("resposta:", JSON.stringify(res)); return setTimeout(() => process.exit(1), 100); }
  if (r.exceptionDetails) console.log("EXCEÇÃO:", r.exceptionDetails.exception && r.exceptionDetails.exception.description);
  else console.log(typeof r.result.value === "string" ? r.result.value : JSON.stringify(r.result.value, null, 1));
  setTimeout(() => process.exit(0), 300);
})().catch(e => { console.error("falhou:", e.message); process.exit(1); });
