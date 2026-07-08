# Top Achadinho BR (Web)

Site promocional "Top Achadinhos BR" que exibe ofertas em cards e carrega os produtos via arquivo JSON local (servido por uma API Express simples).

## Como funciona
- Os dados dos produtos ficam em `data/produtos.json`.
- No front, o JavaScript faz `fetch` em `data/produtos.json` e renderiza os cards na página.
- A barra lateral de redes sociais e o texto do anúncio são renderizados a partir de constantes definidas no `js/data.js`.
- O servidor Express (`api/server.js`) serve os arquivos estáticos e expõe o JSON de produtos.

## Estrutura principal
- `index.html` — layout da página.
- `js/app.js` — renderização dos cards e carregamento do JSON.
- `js/data.js` — constantes (texto do anúncio, links sociais, etc.).
- `js/slidebar.js` — comportamento da barra lateral.
- `data/produtos.json` — lista de produtos com campos:
  - `titulo`, `imagem`, `precoNovo`, `precoAntigo` (opcional), `link`, `dataFim`, `categoria` (uma única categoria, de `categoria001` a `categoria007`).
- `api/server.js` — servidor Express mínimo (arquivo reconstituído — não estava no material original; ajuste conforme sua implementação real).

## Rodar o projeto
Instale as dependências e rode:

```bash
npm install
npm run start   # produção
npm run dev     # com --watch, reinicia sozinho
```

O servidor sobe por padrão em `http://localhost:3000`.

## Observações
- A página exibe `produto.categoria` diretamente no card.
- Para alterar a categoria de um produto, ajuste o campo `categoria` em `data/produtos.json` (aceita `categoria001` a `categoria007`).
- Exemplo de estrutura de produto em `data/produtos.json`:
  - `titulo` (string)
  - `imagem` (string URL)
  - `precoNovo` (string)
  - `precoAntigo` (string, opcional — omitir se não houver preço antigo)
  - `link` (string URL)
  - `dataFim` (string YYYY-MM-DD)
  - `categoria` (string única, ex: `"categoria003"`)

## Correções aplicadas nesta reorganização
1. Removido o campo solto `"categoria"` (singular) duplicado que só existia em 2 produtos, e depois reintroduzido de forma consistente como campo único em todos os produtos (ver item 5).
2. Corrigido `"precoAntigo": "R$ 000,00"` no produto do DJI Mini 4 Pro — removido o campo (fica sem preço "de/por" já que não havia valor real informado). Se você tiver o preço antigo real, é só adicionar de volta.
3. Corrigido caractere corrompido no fallback de erro do `app.js` (estava aparecendo `▤` no lugar do emoji 🛒).
4. Criado `api/server.js` mínimo (Express, serve estático + rota de produtos), já que o `package.json` referenciava esse arquivo mas ele não veio no material enviado.
5. Substituído o array `categorias` (que repetia as 7 categorias em todo produto) por um campo único `categoria`, distribuído ciclicamente de `categoria001` a `categoria007` entre os 15 produtos. O `app.js` foi simplificado para ler esse campo direto, sem a lógica de normalizar array.
6. Corrigido bug em `app.js`: o template do card referenciava uma variável `categoria` que nunca tinha sido declarada (só existia `categoriaNormalizada`), o que quebraria a renderização de todos os cards.
