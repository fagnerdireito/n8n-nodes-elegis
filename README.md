# n8n-nodes-elegis

Community node for [n8n](https://n8n.io) that integrates with the [Elegis](https://elegis.com.br) API.

Use it to automate **Cadastro**, **Grupo**, **Demanda**, and **linking cadastros to grupos**.

- API docs: https://elegis.com.br/docs  
- Brand image (public): https://elegis.com.br/images/elegis_app.png  
- Node icon in package: themed SVG pair (`icons/elegis.light.svg` + `icons/elegis.dark.svg`) — required by n8n community lint / verification; PNG source kept as `nodes/Elegis/elegis.png`

## Installation

### n8n Cloud / self-hosted (community nodes UI)

1. Go to **Settings → Community Nodes**
2. Select **Install**
3. Enter `n8n-nodes-elegis`
4. Agree to the risks and install

### Manual (self-hosted)

```bash
cd ~/.n8n/nodes
npm install n8n-nodes-elegis
```

Restart n8n afterwards.

### Local development

```bash
npm install
npm run build
npm run dev   # starts n8n with this node (hot reload)
```

## Credentials

Create credentials of type **Elegis API**:

| Field | Required | Description |
| --- | --- | --- |
| Access Token | Yes | Sanctum bearer token from Elegis (`POST /api/login` or your account) |
| Base URL | Yes | Default: `https://elegis.com.br/api` |

Every app API call also needs **Cliente ID** (`cliente_id`) and **User ID** (`user_id`) on the node.

## Resources & operations

| Resource | Operations | API routes |
| --- | --- | --- |
| **Cadastro** | Create, Get, Get Many, Update, Delete | `/app/api/cadastros` |
| **Grupo** | Create, Get, Get Many, Update, Delete | `/app/api/grupos` |
| **Demanda** | Create, Get, Get Many, Update, Delete | `/app/api/demandas` |
| **Grupo Cadastro** | Link, Unlink, Get Many | `/app/api/grupos/{id}/cadastros` |

### Flexible JSON body (API as source of truth)

For **Create** / **Update**, send a **Data** JSON object with any fields the Elegis API accepts.

Examples:

**Create cadastro**

```json
{
  "nome": "Maria Silva",
  "email": "maria@example.com",
  "celular": "11999999999",
  "grupos_ids": [1]
}
```

**Create demanda**

```json
{
  "cadastro_id": 10,
  "descricao": "Solicitação de atendimento",
  "assuntos": [1, 2]
}
```

**Link cadastros to grupo**

- Resource: `Grupo Cadastro`
- Operation: `Link`
- Cadastros IDs: `[10, 11]`

See https://elegis.com.br/docs for the full field reference.

## Development scripts

| Script | Description |
| --- | --- |
| `npm run build` | Compile TypeScript / package assets (`n8n-node build`) |
| `npm run lint` | Run community-node linter |
| `npm run lint:fix` | Auto-fix lint issues where possible |
| `npm run dev` | Run n8n locally with this node |
| `npm run release` | Version bump + tag (triggers GitHub Actions publish) |

## Verification readiness (Creator Portal)

This package follows the [n8n community node standards](https://docs.n8n.io/integrations/community-nodes/building-community-nodes/) and is structured for [verification submission](https://docs.n8n.io/connect/create-nodes/deploy-your-node/submit-community-nodes#submit-your-node-for-verification-by-n8n):

- Package name: `n8n-nodes-elegis`
- Keyword: `n8n-community-node-package`
- Nodes/credentials registered under `package.json` → `n8n`
- Built with `@n8n/node-cli` (≥ 0.23.0)
- **No runtime `dependencies`** (only `devDependencies` + `peerDependencies`)
- GitHub Actions publish workflow with npm **provenance**: `.github/workflows/publish.yml`

### What is already done in this repo

- [x] Community-node package structure (`nodes/`, `credentials/`, `n8n` attribute)
- [x] CRUD for Cadastro, Grupo, Demanda + link/unlink Grupo↔Cadastro
- [x] Token auth credentials + default production base URL
- [x] Node icon (`nodes/Elegis/elegis.png`)
- [x] `publish.yml` with provenance (required from **1 May 2026** for verified nodes)
- [x] Lint/build scripts via `@n8n/node-cli`
- [x] README for npm / public repository

### What you must do manually before submitting

These steps need **your** GitHub + npm + Creator Portal accounts. This repo cannot automate them.

1. **Push to GitHub**
   - Create a public repository
   - Update `repository.url` / `author` in `package.json` if needed
   - `git remote add origin <your-repo-url>`
   - `git push -u origin main` (or `master`)

2. **Configure npm Trusted Publisher (recommended)**  
   On [npmjs.com](https://www.npmjs.com) → package settings → **Publish access → Trusted Publishers**:
   - Repository owner / name = your GitHub repo
   - Workflow name = `publish.yml`  
   **Or** set a GitHub Actions secret `NPM_TOKEN` (granular automation token).

3. **Publish to npm via GitHub Actions (with provenance)**
   ```bash
   npm run release
   ```
   This bumps the version, commits, tags (`x.y.z`), and pushes. The tag triggers `.github/workflows/publish.yml`.  
   From **1 May 2026**, verified nodes must be published this way (not `npm publish` from a laptop).

4. **Smoke-test the published package**
   - Install `n8n-nodes-elegis` in an n8n instance
   - Configure credentials and run Create/Get for each resource

5. **Submit for verification**
   - Open https://creators.n8n.io/nodes
   - Sign in and submit the npm package for review
   - Ensure UX/technical guidelines are followed: https://docs.n8n.io/integrations/community-nodes/building-community-nodes/

### Blockers (cannot be completed without you)

| Item | Why |
| --- | --- |
| GitHub remote / push | Needs your GitHub repository |
| npm Trusted Publisher / `NPM_TOKEN` | Needs your npm account |
| First npm publish | Needs Actions + npm trust setup |
| Creator Portal submit button | Needs login at https://creators.n8n.io/nodes |

## License

[MIT](./LICENSE.md)
