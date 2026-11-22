# Igor TV

Tela inicial personalizada para a TV Samsung UN40NU7100 (2018, Tizen 4).

- **Favoritos** em ordem alfabética, com botões grandes que se ajustam à quantidade de apps instalados.
- **YouTube sem anúncios**: o botão abre o TizenBrew com o módulo TizenTube.
- **TV ao vivo**: só transmissões oficiais e gratuitas (TV Brasil, TV Cultura, Rede Minas, CNN Brasil, Record News, TV Câmara). O app testa os sinais ao abrir e esconde os que estiverem fora do ar.
- **Todos os apps**, **Entradas HDMI**, **Configurações** (com o passo a passo do modo instalação) e **Ajuda**.

## Como instalar

1. Na TV: Apps → `12345` → Host PC IP = IP do PC → reiniciar.
2. No PC: clique em `instalar-na-tv.bat`.
3. Na TV: volte o Host PC IP para `127.0.0.1` e reinicie (necessário para o TizenBrew).

## Estrutura

- `app/`: o app Tizen (HTML, CSS, JS). Escrito para o navegador antigo do Tizen 4: sem CSS grid, sem `gap` em flex, sem spread.
- `app/js/data.js`: favoritos, canais e IDs editáveis.
- `build.ps1`: gera `dist/IgorTV.wgt`, assinado com o perfil `igortv` do Tizen Studio.
- `tools/serve.js`: servidor local para ver o app no navegador do PC (`node tools/serve.js`, porta 8123).

## Créditos

Fontes Atkinson Hyperlegible (Braille Institute) e Sora (Jonathan Barnbrook, Julián Moncada), sob a SIL Open Font License. Lista de canais com base no projeto [iptv-org/iptv](https://github.com/iptv-org/iptv).
