# Logos e imagens MedFlow Pro

## Estrutura

| Ficheiro | Descrição | Uso |
|----------|-----------|-----|
| `logo.svg` | Logo principal em SVG (escalável) | Sidebar, Header, Login |
| `medflow-logo.png` | Logo em PNG (opcional) | Favicon, partilha em redes sociais |

## Como substituir o logo

1. **Logo principal:** Substitua `logo.svg` mantendo o mesmo nome, ou edite `lib/logo.ts` para apontar para o novo ficheiro.

2. **Logo PNG:** Coloque o ficheiro `medflow-logo.png` nesta pasta. Utilize para favicon ou quando PNG for necessário.

## Referência no código

```ts
import { LOGO } from '@/lib/logo';

<img src={LOGO.main} alt="MedFlow Pro" />
```

## Formatos recomendados

- **SVG:** Melhor para interfaces (escalável, leve)
- **PNG:** 512x512px ou superior para favicon e partilhas
