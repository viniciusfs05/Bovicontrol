# BoviControl

**Controle de gado e cotacoes em tempo real** - Goias, Brasil

PWA (Progressive Web App) completo para gestao pecuaria bovina.

## Funcionalidades

### Cotacao Boi Gordo
- Busca automatica de cotacoes via CEPEA/ESALQ
- Fallback inteligente via IA (Claude) quando fontes offline
- Indicador visual de status em tempo real

### Gestao de Compra
- Cadastro de multiplos lotes
- Calculo por arroba (@) ou por cabeca
- Totalizacao automatica

### Gastos Operacionais
- Categorias pre-definidas: Alimentacao, Sanidade, Transporte, Outros
- Calculo de subtotais por categoria
- Total geral automatico

### Simulacao de Venda
- Calculo de receita por @ e por cabeca
- Resumo de custos completo
- Lucro/Prejuizo com ROI e margem
- Resultado final destacado

### Assistente IA
- Chat integrado com Claude (Anthropic)
- Analises personalizadas da operacao
- Consultas sobre mercado pecuario
- Busca web em tempo real

### Recursos Extras (v2.0)
- **Persistencia automatica**: dados salvos no localStorage
- **Backup/Restauracao**: exportar e importar dados em JSON
- **Funciona offline**: Service Worker com cache inteligente
- **Instalavel**: PWA com manifest para Android/iOS
- **Responsivo**: funciona em celular, tablet e desktop
- **Acessibilidade**: aria-labels e navegacao por teclado

## Como Usar

### Opcao 1: Netlify (recomendado)
1. Acesse [app.netlify.com/drop](https://app.netlify.com/drop)
2. Arraste a pasta `BoviControl` inteira para a tela
3. O Netlify gera um link (ex: `https://abc123.netlify.app`)
4. Acesse pelo celular e instale como app

### Opcao 2: Servidor Local
```bash
# Com Python
python3 -m http.server 8000

# Com Node.js
npx serve .
```

### Instalar no Android
1. Abra o link no Google Chrome
2. Toque nos 3 pontinhos (menu)
3. Toque em "Adicionar a tela inicial"
4. Confirme e pronto!

## Estrutura do Projeto

```
BoviControl/
  index.html       - Pagina principal (HTML semantico)
  css/
    styles.css     - Estilos (tema escuro, responsivo)
  js/
    app.js         - Logica do app (persistencia, calculos, IA)
  manifest.json    - Manifesto PWA
  sw.js            - Service Worker (cache offline)
  icon-192.png     - Icone 192x192
  icon-512.png     - Icone 512x512
```

## Tecnologias
- HTML5 / CSS3 / JavaScript (Vanilla)
- PWA (Service Worker + Web App Manifest)
- API Anthropic (Claude) para assistente IA
- CEPEA/ESALQ para cotacoes

## Licenca
Uso pessoal - BoviControl
