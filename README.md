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
css/globals.css       tokens de design (cores, espaçamentos, raios, sombras, fontes) e base
css/styles.css        componentes (header, hero, cards, filtros, rodapé...)
js/data.js            textos, regras de negócio (preço, desconto, prazo, categorias) e carregamento
js/render.js          geração do HTML dos cards, chips e categorias
js/filters.js         estado, busca, filtros, ordenação e seleção de destaques
js/ui.js              menu mobile, header e utilidades de interface
js/app.js             orquestra tudo
assets/               logo PNG original + logos SVG (símbolo, horizontal, escuro, monocromático)
```

## Formato de `data/produtos.json`

| Campo | Obrigatório | Descrição |
|---|---|---|
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
