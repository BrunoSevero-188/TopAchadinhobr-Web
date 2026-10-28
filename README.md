# Top Achadinho BR

Site estático de descoberta de produtos e ofertas (HTML + CSS + JavaScript puros + JSON).
O Express em `api/server.js` serve apenas os arquivos para uso local.

## Rodar localmente

```bash
npm install
npm start          # http://localhost:3000
```

## Estrutura

```
index.html            página principal
privacidade.html      Política de Privacidade (texto-base)
termos.html           Termos de Uso (texto-base)
manifest.json         PWA
data/produtos.json    catálogo de produtos
data/video-produto.json  vídeos promocionais (carrossel "Vídeos dos achadinhos")
css/globals.css       tokens de design (cores, espaçamentos, raios, sombras, fontes) e base
css/styles.css        componentes (header, hero, cards, filtros, rodapé...)
css/carrossel.css     carrosséis horizontais e preço do card (inteiro + centavos + % OFF)
css/videos.css        carrossel de vídeos promocionais
js/data.js            textos, regras de negócio (preço, desconto, prazo, categorias) e carregamento
js/render.js          geração do HTML dos cards, chips e categorias
js/filters.js         estado, busca, filtros, ordenação e seleção de destaques
js/ui.js              menu mobile, header e utilidades de interface
js/carrossel.js       setas e estado dos carrosséis (scroll-snap)
js/videos.js          carrossel de vídeos: leitura do JSON, vínculo com produtos, reprodução
js/app.js             orquestra tudo
assets/               logo PNG original + logos SVG (símbolo, horizontal, escuro, monocromático)
```

## Formato de `data/produtos.json`

| Campo | Obrigatório | Descrição |
|---|---|---|
| `id` | sim, para ter vídeo | Número único (1, 2, 3...). Liga o produto aos vídeos em `video-produto.json`. Nunca reutilize nem renumere |
| `titulo` | sim | Itens sem título são ignorados |
| `precoNovo` | sim | Ex.: `"R$ 49,90"` |
| `precoAntigo` | não | Se maior que o novo, o desconto (%) é calculado automaticamente |
| `link` | sim | Link do produto (afiliado). Só `http(s)` é aceito |
| `dataFim` | sim | `AAAA-MM-DD`. Depois dessa data o card vira "Produto indisponível" |
| `imagem` | não | URL da imagem |
| `categoria01` ... `categoria05` | não | Texto livre. As categorias do site são geradas a partir delas |
| `descricao` | não | Texto curto exibido no card |
| `textoBotao` | não | Padrão: "Ver oferta" |
| `destaque` | não | `true` para aparecer em "Achadinhos em destaque" |
| `desconto` | não | Ex.: `"-37%"`. Se vazio, é calculado |

Sem produtos ativos marcados com `destaque`, a seção de destaques mostra as 4 ofertas ativas de maior desconto.

## Personalização visual

Cores, tipografia, espaçamentos e raios ficam em `css/globals.css` (`:root`).

## Vídeos promocionais (`data/video-produto.json`)

A seção "Vídeos dos achadinhos" lê esse arquivo. Com `[]` (vazio) ela mostra "Vídeos em breve".
O vídeo se liga ao produto pelo `id`: o título, o preço, a imagem (capa) e o link de compra vêm de `produtos.json`, então não se repetem aqui.

```json
[
  { "id": 1, "video": "https://seu-servidor.com/video-1.mp4" },
  { "id": 1, "video": "https://www.youtube.com/watch?v=XXXXXXXXXXX" },
  { "id": 5, "video": "https://seu-servidor.com/video-2.mp4" }
]
```

| Campo | Obrigatório | Descrição |
|---|---|---|
| `id` | sim | `id` do produto em `produtos.json` |
| `video` | sim | Uma única URL de vídeo (ou `{ "url": "...", "tipo": "arquivo" }`). Para mais de um vídeo do mesmo produto, repita o item com o mesmo `id` |

- **Para cadastrar:** crie/escolha o produto em `produtos.json` (com `id` novo, o próximo número livre) e adicione `{ "id": N, "video": "..." }`.
- `id` que não existe no catálogo: o vídeo aparece com o título "Vídeo do achadinho", sem preço nem botão (e um aviso no console do navegador).
- Produto com a data vencida: o vídeo continua, mas o botão vira "Oferta encerrada".
- **Arquivo** (`.mp4`, `.webm`, `.ogv`, `.m4v`): toca em `<video>` com controles. URL sem extensão (ex.: link de storage) precisa de `"tipo": "arquivo"`.
- **YouTube** (`watch`, `youtu.be`, `shorts`, `embed`): incorporado com `youtube-nocookie`, só carrega o player ao clicar.
- **Outros links** (Instagram, TikTok etc.): aparecem como cartão "Assistir vídeo" que abre em nova aba.
- O servidor do vídeo precisa permitir reprodução direta (hotlink); páginas que não são o arquivo de vídeo não tocam em `<video>`.

## Categorias na home

- **"Explore por categoria"** é um carrossel com as categorias mais relevantes: ordenadas por quantidade de produtos, só as que têm 2 ou mais produtos, no máximo 12. As demais continuam acessíveis pela busca (que também procura nas categorias).
- **Carrossel de produtos por categoria:** toda categoria com 5 ou mais produtos ganha, abaixo, um carrossel com os produtos dela (disponíveis primeiro, até 12) e um botão "Ver todos" que filtra a lista completa. No máximo 4 carrosséis.
- Os **filtros (chips) de "Achadinhos recentes"** usam essa mesma lista reduzida, em vez das 121 categorias.
- Os limites ficam no topo de `js/filters.js` (`CATEGORIAS_MIN_PRODUTOS`, `CATEGORIAS_MAX`, `VITRINE_MIN_PRODUTOS`, `VITRINE_MAX_CATEGORIAS`, `VITRINE_MAX_PRODUTOS`).
