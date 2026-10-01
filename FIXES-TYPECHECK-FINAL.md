# Typecheck final fixes

Correções aplicadas após a validação local da v14:

- `src/app/api/profile/curation/route.ts`: `albumId` do ListeningLog pode ser nulo no Prisma; agora a lista de IDs permitidos filtra valores nulos antes da validação do Top 5/Obsessão.
- `src/components/Dashboard.tsx`: adicionada a função `buildCalendar` usada pelo calendário do perfil.
- `Community`: a navegação `go()` agora é recebida como prop, corrigindo o uso do botão Groov Drop.

A pasta `src - Copia` continua excluída do TypeScript e não deve ser mantida no projeto.
