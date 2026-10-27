# Carrossel de vídeos de produtos

O site lê os vídeos em `data/video-produto.json`. O arquivo começa com uma lista vazia para que nenhum endereço fictício seja exibido. Adicione um objeto por produto.

## Formato simples (URLs diretas)

```json
[
  {
    "nome": "Nome real do produto",
    "linkProduto": "https://loja.example/oferta",
    "videos": [
      "https://servidor.example/video.mp4",
      "https://servidor.example/video.webm"
    ]
  }
]
```

## Formato detalhado

Cada item de `videos` também pode ser um objeto:

```json
[
  {
    "nome": "Nome real do produto",
    "linkProduto": "https://loja.example/oferta",
    "videos": [
      {
        "url": "https://servidor.example/video.mp4",
        "tipo": "mp4",
        "titulo": "Veja o produto em ação",
        "miniatura": "https://servidor.example/miniatura.webp",
        "ativo": true
      },
      {
        "url": "https://www.youtube.com/shorts/ID_REAL_DO_VIDEO",
        "titulo": "Demonstração no YouTube",
        "ativo": true
      }
    ]
  }
]
```

- Troque todos os endereços de exemplo pelos URLs reais.
- Para vídeos hospedados diretamente, use arquivos MP4 ou WebM acessíveis por HTTPS.
- URLs de YouTube (vídeos, Shorts ou links youtu.be) são incorporadas no player ao clicar em reproduzir.
- `ativo: false` desativa um vídeo sem precisar removê-lo.
- `linkProduto` é opcional; quando informado, aparece o botão **Ver produto**.
- Não coloque links de afiliado no campo `url` do vídeo: use `linkProduto` para a oferta e deixe `url` para o vídeo.
- O carrossel não inicia reprodução automática com som. No celular, deslize horizontalmente para navegar.
