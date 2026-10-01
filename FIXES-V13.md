# Groov v13 — UX + funcionalidades

## Corrigido

1. Login e cadastro agora possuem retorno explícito para a Home.
2. Botões da Home receberam dimensões, espaçamento, contraste e estados hover mais consistentes.
3. Links da navegação pública ficaram maiores e mais legíveis.
4. Botão flutuante "↑" aparece após rolagem e leva suavemente ao topo, tanto na Home quanto no app autenticado.
5. Top 5 e Obsessão agora podem ser definidos pelo usuário a partir dos álbuns registrados no diário.
6. Vinyl Shelf agora é alimentada pelos registros cujo formato é VINYL, sem duplicar dados fictícios.
7. Descobrir artistas ganhou fallback para Spotify Catalog API e Last.fm Similar Artists quando o catálogo local não possui recomendações.
8. PATCH de perfil deixou de exigir username, corrigindo também o salvamento de bio, localização, avatar e links.

## Banco

Nenhuma migração é necessária. O Top 5 usa `TopPick` e a obsessão usa `User.currentObsessionId`, já existentes no schema.
