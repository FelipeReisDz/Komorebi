# Komorebi

Projeto acadêmico SEDUC/SENAI para um restaurante japonês.

## Como abrir

1. Abra a pasta do projeto no VS Code.
2. Inicie o Live Server no arquivo `index.html`.
3. Navegue entre Home, Cardápio, Delivery, Contato, Área do Cliente e Termos.

## Publicar no GitHub Pages

1. Coloque todos os arquivos deste projeto diretamente na raiz do repositório.
2. No GitHub, abra `Settings > Pages`.
3. Em `Source`, escolha `Deploy from a branch`.
4. Selecione a branch `main`, a pasta `/(root)` e clique em `Save`.
5. Aguarde a publicação e use o endereço exibido em `Visit site`.

## Estrutura

- `template/`: páginas HTML.
- `static/css/theme.css`: identidade visual responsiva.
- `static/js/site.js`: interações dos formulários, busca e carrinho.
- `static/img/`: imagens utilizadas pelo site.
- `FONTES_IMAGENS.md`: páginas de origem das novas fotos do cardápio.

O cardápio possui 15 pratos e 10 sobremesas. Todos os 25 itens também estão
disponíveis na demonstração do delivery, com busca, categorias e carrinho.

Os formulários e o carrinho funcionam como demonstração no navegador. Para
registrar usuários, enviar mensagens ou criar pedidos reais, é necessário
conectar o projeto a um backend e a um banco de dados.
