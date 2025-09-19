# Favicons e Ícones do Portal NRC

Este diretório contém todos os ícones e favicons utilizados pelo Portal de Treinamento NRC.

## Arquivos de Ícone

### Favicons
- `favicon.svg` - Favicon principal em formato SVG (32x32)
- `favicon-16x16.svg` - Favicon pequeno para navegadores (16x16)
- `icon.svg` - Ícone principal da aplicação (localizado em `/src/app/`)

### Ícones para Dispositivos
- `apple-touch-icon.svg` - Ícone para dispositivos iOS (180x180)

### Configurações
- `manifest.json` - Web App Manifest para PWA
- `browserconfig.xml` - Configuração para Internet Explorer/Edge

### Design
Os ícones seguem o padrão visual do NRC:
- **Cor principal**: #1e40af (azul)
- **Cor secundária**: #fbbf24 (amarelo)
- **Cor de apoio**: #10b981 (verde)
- **Tipografia**: Arial, sans-serif
- **Elemento principal**: Texto "NRC" centralizado

## Compatibilidade

### Navegadores Suportados
- ✅ Chrome/Chromium
- ✅ Firefox
- ✅ Safari
- ✅ Edge
- ✅ Opera

### Dispositivos
- ✅ Desktop
- ✅ Mobile (iOS/Android)
- ✅ Tablets
- ✅ PWA (Progressive Web App)

## Como Funciona

O Next.js 13+ automaticamente detecta e utiliza:
1. `icon.svg` na pasta `/src/app/` como favicon principal
2. Configurações do `metadata` no `layout.tsx`
3. Arquivos adicionais na pasta `/public/` conforme referenciados

## Atualizações

Para modificar os ícones:
1. Edite os arquivos SVG mantendo as dimensões
2. Mantenha a paleta de cores do NRC
3. Teste em diferentes navegadores e dispositivos
4. Verifique se o manifest.json está atualizado