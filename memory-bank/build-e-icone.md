# Build e ícone — restrições do n8n Creator Portal

Contexto: o Automated Review do n8n reprovou a versão `0.1.2`. Este documento registra
as duas restrições que causaram (ou quase causaram) reprovação, para não regredirem.

## 1. Não publicar arquivos `.d.ts`

**Sintoma:** o scan do Creator Portal reprovou com:

```
dist/credentials/ElegisApi.credentials.d.ts
  Rename file to ElegisApi.credentials.ts
  n8n-nodes-base/cred-filename-against-convention
```

**Causa:** o ESLint local roda com `globalIgnores(['dist'])`, então `npm run lint` passa.
Mas o Creator Portal escaneia o **tarball publicado**, onde `files: ["dist"]` faz o
código-fonte não existir — só sobra o `dist/`. Aí o glob `files: ['**/*.ts']` do plugin
casa com os `.d.ts` e as regras de nomenclatura disparam.

**Correção:** `"declaration": false` no `tsconfig.json`. Um community node não é consumido
como biblioteca; o n8n só carrega os `.js` apontados no campo `n8n` do `package.json`.
Declaration files ali só servem para o scanner tropeçar.

⚠️ O template oficial do `@n8n/node-cli` vem com `declaration: true`. É uma armadilha —
não "corrija" isso de volta ao rodar um scaffold novo.

## 2. `incremental` precisa ficar desligado

`"incremental": false` no `tsconfig.json`. **Não religue**, e principalmente não mova o
`tsBuildInfoFile` para fora do `dist/`.

**Por quê:** o `n8n-node build` faz `rimraf('dist')` antes de compilar. Com o `tsbuildinfo`
dentro do `dist` ele é apagado junto, forçando rebuild completo. Se ele sobreviver ao
`rimraf` (ex.: apontado para `node_modules/.cache`), o `tsc` conclui que os arquivos "não
mudaram" e **emite só os editados** — o build sai com exit 0 e um `dist` incompleto,
publicando um pacote quebrado.

**Como verificar:** rode `npm run build` duas vezes seguidas. O `dist` deve ter 19 arquivos
nas duas. Se a segunda vier menor, o incremental voltou.

## 3. O ícone tem que ser SVG

Referências (uma única arte, `icons/elegis.svg`, na convenção da pasta `icons/` da raiz):

- `nodes/Elegis/Elegis.node.ts` → `file:../../icons/elegis.svg`
- `credentials/ElegisApi.credentials.ts` → `file:../icons/elegis.svg`

**PNG não funciona**, mesmo o tipo `IconFile` do `n8n-workflow` aceitando `.png`. Duas
regras reprovam:

- `n8n-nodes-base/node-class-description-icon-not-svg` (ativa em `configs.nodes`, o
  `@n8n/node-cli` não desliga)
- `@n8n/community-nodes/icon-validation` — a que o Creator Portal usa

A validação olha só a extensão e se o arquivo existe (`isSvg = relativePath.endsWith('.svg')`);
não inspeciona o conteúdo. O build copia estáticos com o glob `**/*.{png,svg}` da raiz
preservando o caminho, então `icons/elegis.svg` → `dist/icons/elegis.svg` sozinho.

Não deixe `.png`/`.svg` órfãos no repo: esse mesmo glob os empacota para o npm à toa.

## Paleta da marca

- Verde do "e": `#5DC10B`
- Wordmark: `#FFFFFF`
- Fundo: degradê vertical, chapado `#1941CA` até ~50,5% da altura, depois linear até `#162456`
