// ATENÇÃO: este arquivo não estava no material original enviado.
// O package.json referencia "api/server.js" nos scripts start/dev,
// então recriei uma versão mínima com Express para o projeto rodar.
// Ajuste conforme sua implementação real (rotas extras, CORS, etc.).

const path = require("path");
const express = require("express");

const app = express();
const PORT = process.env.PORT || 3000;

const ROOT_DIR = path.join(__dirname, "..");

// Serve os arquivos estáticos do site (index.html, css, js, assets, data)
app.use(express.static(ROOT_DIR));

// Rota explícita para os produtos, caso queira consumir via /api/produtos
// além do fetch direto em data/produtos.json
app.get("/api/produtos", (req, res) => {
  res.sendFile(path.join(ROOT_DIR, "data", "produtos.json"));
});

app.listen(PORT, () => {
  console.log(`Top Achadinho BR rodando em http://localhost:${PORT}`);
});
