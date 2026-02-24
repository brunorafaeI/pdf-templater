# PDF Templater

Editor visual de templates em formato A4 para exportação em HTML, imagem (PNG/JPG) e PDF. O projeto gera pacotes compatíveis com a API **Gotenberg** (rota *Convert HTML to PDF*) para conversão HTML → PDF em servidor.

## Estrutura do projeto

```
pdf-templater/
├── src/
│   ├── main.tsx              # Entrada da aplicação
│   ├── App.tsx               # Layout principal e estado do editor
│   ├── types/                # Tipos TypeScript (elementos, páginas, canvas)
│   ├── components/           # Componentes React (Canvas, painéis, sidebar)
│   └── services/             # Export (HTML, imagem, ZIP Gotenberg)
├── docs/
│   └── GOTENBERG-AGENT.md    # Instruções para uso da API Gotenberg (convert-html-to-pdf)
├── index.html
├── vite.config.ts
├── tsconfig.json
├── eslint.config.js
├── .prettierrc
└── package.json
```

## Pré-requisitos

- **Node.js** 18+
- **npm** ou **yarn**

## Como usar

### Instalação

```bash
npm install
```

### Desenvolvimento

```bash
npm run dev
```

Abre em [http://localhost:3000](http://localhost:3000).

### Build

```bash
npm run build
```

Saída em `dist/`. Para preview:

```bash
npm run preview
```

### Scripts adicionais

| Script          | Descrição                          |
|-----------------|-------------------------------------|
| `npm run lint`  | ESLint em `src`                    |
| `npm run lint:fix` | ESLint com correção automática |
| `npm run format`   | Prettier em `src`                |
| `npm run format:check` | Verifica formatação          |
| `npm run typecheck`  | Verificação de tipos (tsc)     |

## Funcionalidades

- **Canvas A4:** páginas em 794×1123 px (A4), com réguas e guias.
- **Elementos:** texto, imagem, formas (retângulo, círculo, linha, SVG), arrastar, redimensionar, rotacionar, raio de borda.
- **Páginas:** múltiplas páginas, duplicar, renomear, ordenar.
- **Camadas:** painel de layers com visibilidade, bloqueio e reordenação.
- **Propriedades:** painel para elemento selecionado (posição, tamanho, estilo, tipografia).
- **Export:**
  - **JPG/PNG:** captura do canvas via html2canvas.
  - **PDF (navegador):** impressão via `window.print()`.
  - **HTML/CSS:** download do HTML completo.
  - **Pacote Gotenberg:** ZIP com `index.html` (+ opcional `header.html`/`footer.html`) e `readme.txt` com sugestões de parâmetros para a API.

## Integração com Gotenberg

O export **“Gotenberg Package”** gera um ZIP contendo:

- `index.html` – documento principal
- `header.html` / `footer.html` – se header/footer estiverem ativos no template
- `readme.txt` – dimensões e sugestão de parâmetros (margens, etc.)

Para converter esse HTML em PDF no servidor:

1. Instale e suba o [Gotenberg](https://gotenberg.dev/) (ex.: Docker).
2. Envie o ZIP ou os arquivos em **multipart/form-data** para:
   - **POST** `/forms/chromium/convert/html`
3. Use os parâmetros descritos em `readme.txt` e, em detalhe, em **docs/GOTENBERG-AGENT.md**.

Referência oficial da rota: [Convert HTML to PDF | Gotenberg](https://gotenberg.dev/docs/convert-with-chromium/convert-html-to-pdf).

## Formatação e lint

- **ESLint:** regras em `eslint.config.js` (flat config), com TypeScript e React.
- **Prettier:** opções em `.prettierrc`; formatação ao salvar recomendada (ex.: VS Code com “Format on Save” e extensão Prettier).
- **VS Code:** em `.vscode/settings.json` estão `editor.formatOnSave` e `source.fixAll.eslint` para formatar e aplicar correções ao salvar.

## Tecnologias

- **React 18** + TypeScript
- **Vite 6**
- **Tailwind CSS** (via CDN no `index.html`)
- **Lucide React** (ícones)
- **html2canvas** (export de imagem)
- **JSZip** (ZIP do pacote Gotenberg)

## Licença

Uso interno / conforme definido no repositório.
