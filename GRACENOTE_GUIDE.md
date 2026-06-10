# GraceNote — Guia do Projeto

## Identidade

- **Nome:** GraceNote
- **Slogan:** Seu Caderno Espiritual
- **Missão:** Ajudar cristãos a preservar sua caminhada espiritual
- **Público:** Mulheres cristãs 18-45 anos (primário), líderes e pastores (secundário)
- **Tom:** Claro, simples, inspirador, elegante, acolhedor
- **Personalidade:** Organizado, acolhedor, inteligente, elegante, confiável, discreto

---

## Tech Stack

| Camada | Tecnologia | Versão |
|--------|-----------|--------|
| Framework | Expo (React Native) | SDK 54 |
| Linguagem | TypeScript | ~5.9.2 |
| UI | React Native | 0.81.5 |
| Navegação | expo-router | ~6.0.24 |
| Animações | react-native-reanimated | ~4.1.1 |
| Backend | Supabase | ^2.108.1 |
| Cache/State | TanStack Query | ^5.101.0 |
| Estado local | Zustand | ^5.0.14 |
| Ícones | lucide-react-native | ^1.17.0 |
| Storage local | AsyncStorage | 2.2.0 |
| Fontes (editor) | Inter, Merriweather, Caveat | via expo-font |
| SVG | react-native-svg | 15.12.1 |
| OAuth | expo-auth-session + expo-web-browser | SDK 54 |

---

## Arquitetura de Pastas

```
gracenote-app/
├── app/                    # Expo Router (file-based routing)
│   ├── _layout.tsx         # Root layout (Stack navigator + onboarding check)
│   ├── (tabs)/             # Tab Navigator (bottom tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Dashboard / Home
│   │   ├── search.tsx      # Search screen
│   │   ├── favorites.tsx   # Favorites screen
│   │   └── profile.tsx     # Profile & Settings
│   ├── auth/               # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── callback.tsx    # OAuth redirect handler
│   │   └── forgot-password.tsx
│   ├── onboarding/         # 4-step onboarding carousel
│   ├── sermon/             # Sermon CRUD
│   │   ├── create.tsx
│   │   ├── [id].tsx        # Detail view
│   │   └── edit/[id].tsx
│   ├── premium/            # Premium/Paywall screen
│   └── settings/           # App settings & privacy
├── features/               # Feature modules
│   ├── auth/               # Auth hooks, services, store
│   ├── sermons/            # Sermon CRUD + localStorage service
│   ├── categories/         # Category management
│   ├── tags/               # Tag management
│   ├── covers/             # Cover picker
│   ├── editor/             # Font + Color pickers
│   ├── premium/            # Entitlements, RevenueCat
│   ├── profile/            # Profile service
│   └── library/            # Search + favorites hooks
├── shared/                 # Shared code
│   ├── components/         # UI components (Button, Input, Modal, etc.)
│   ├── design/             # Design tokens (colors, typography, spacing)
│   ├── hooks/              # Shared hooks (useTheme, useThemeStore)
│   ├── i18n/               # Internationalization (pt, en)
│   ├── services/           # Supabase client
│   └── types/              # TypeScript interfaces
├── supabase/migrations/    # SQL migrations
├── assets/                 # Icons, splash screen
├── app.json                # Expo config
├── eas.json                # EAS Build config
├── babel.config.js         # Babel + reanimated plugin
└── package.json
```

---

## Design System

### Paleta de Cores (Tons Terrosos)

```ts
// Acento principal: Terracota suave (#C7705C)
// Acento secundário: Dourado fosco (#D4A853)
// Fundo: Off-white (#FAFAF9)
// Superfície: Off-white aquecido (#FEFCF9)
// Texto: Marrom escuro (#2C2420)
```

**Estrutura de cores (`shared/design/colors.ts`):**
- `palette` — cores brutas (gray, terracotta, gold, emerald, amber, red, highlight)
- `light` — tema claro
- `dark` — tema escuro (fundo `#1A1714`)

**Toda tela usa `useTheme()` → `colors`** para garantir consistência entre temas.

### Tipografia

```ts
fontFamily: { sans: 'Inter', serif: 'Merriweather', mono: 'JetBrainsMono', handwriting: 'Caveat' }
fontSize: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 }
```

### Espaçamento

```ts
spacing: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64, '4xl': 96 }
borderRadius: { sm: 6, md: 12, lg: 16, xl: 24, full: 9999 }
```

### Safe Area

**TODAS as telas** devem usar `useSafeAreaInsets()` de `react-native-safe-area-context`:
```tsx
const insets = useSafeAreaInsets()
// Aplicar em paddingTop e paddingBottom dos containers principais
```

---

## Navegação

### Root Layout (`app/_layout.tsx`)
- Stack navigator com `animation: 'slide_from_right'`
- `gestureEnabled: true` e `fullScreenGestureEnabled: true` para swipe-to-go-back
- Não exige autenticação — app abre direto no dashboard
- Redireciona para onboarding apenas na primeira execução

### Tab Layout (`app/(tabs)/_layout.tsx`)
4 abas: Início, Buscar, Favoritos, Perfil

### Fluxo de telas:
```
Onboarding → Tabs (qualquer aba sem login)
Login/Registro → Tabs
Sermão(+) → Create → Save → Back
Sermão [id] → Detail → Edit → Save → Back
Perfil → Configurações / Privacidade
```

---

## Autenticação

### Email/Senha (funciona 100%)
- `useAuth()` hook → `signIn(email, password)`, `signUp(email, password, name)`
- Sessão persiste via AsyncStorage (configurado em `shared/services/supabase.ts`)
- `supabase.auth.setSession()` após OAuth

### Google / Facebook (parcial)
- Implementado via `expo-auth-session` + `expo-web-browser`
- `makeRedirectUri({ native: 'gracenote://auth/callback' })`
- Requer configuração no Supabase (Authentication → Providers)
- URI de redirecionamento: `gracenote://auth/callback`
- Código em `features/auth/services/auth.service.ts`

### Auth Store
```ts
// Zustand store em features/auth/store/auth.store.ts
interface AuthState {
  session: Session | null
  isLoading: boolean
  setSession: (s: Session | null) => void
  setLoading: (b: boolean) => void
}
```

---

## Persistência de Dados

### Dual Storage Strategy

O app funciona **com ou sem login**:

| Situação | Armazenamento |
|----------|---------------|
| Usuário logado | Supabase (nuvem) |
| Usuário anônimo | AsyncStorage (local) |

**Implementação:**
- `features/sermons/hooks/useSermons.ts` detecta `isOnline()` e usa o repositório correto
- `features/sermons/services/localStorage.service.ts` — CRUD completo em AsyncStorage
- Dados locais podem ser migrados para nuvem via `localStorageService.migrateToSupabase(userId)`

**Estrutura do sermão local:**
```ts
interface LocalSermon {
  id: string        // local_timestamp_random
  title: string
  plain_text: string
  preacher: string | null
  cover_id: string | null
  is_favorite: boolean
  font: string
  textColor: string
  created_at: string
  updated_at: string
}
```

### Banner Offline
Quando o usuário não está logado, o dashboard mostra:
> "Dados salvos apenas localmente. Conecte-se para sincronizar."

---

## Funcionalidades Principais

### Onboarding
- 4 telas swipeáveis com `Animated.FlatList`
- Animações: fade + scale nos slides, dots com largura animada
- Botão "Pular" nas primeiras 3 telas, "Criar Conta" / "Entrar" na última
- Flag `onboarding_completed` no AsyncStorage

### Dashboard
- Saudação por horário: "Bom dia/tarde/noite, [Nome] ☀️/🌤️/🌙"
- Campo de busca com placeholder "O que deseja encontrar?"
- Últimas ministrações (scroll horizontal de cards)
- Continuar lendo (última ministração atualizada)
- Neste dia (registros de anos anteriores na mesma data)
- Estatísticas rápidas (total de ministrações, categorias)
- Banner offline + FAB "+"

### Editor de Ministração
- Toolbar com: Fonte, Cor, Destacar, Capa (apenas botões funcionais)
- Fonte e cor são aplicadas visualmente no `TextInput` via `style`
- Fontes gratuitas: Clássica, Moderna, Serifada, Elegante, Minimalista
- Fontes premium: Lettering, Manuscrita, Caligrafia, Brush, Assinatura (bloqueadas para free)
- Cores de texto: 9 cores + 6 cores de marca-texto
- Categorias e tags associadas via modais

### Perfil
- Funciona com ou sem login
- Com login: avatar, nome, email, badge Premium/Free, salvar, sair
- Sem login: "Conectar-se" com opções de criar conta ou entrar
- Sempre visível: tema (claro/escuro/sistema), configurações, política de privacidade, versão

### Premium
- 6 benefícios: biblioteca ilimitada, sem anúncios, fontes premium, capas premium, exportação PDF, selo premium
- Planos: Mensal R$ 9,90 / Anual R$ 79,90
- Implementação mock (RevenueCat integrado mas não ativo)

---

## Configuração Supabase

### Tabelas Necessárias
- `profiles` — id, user_id, name, avatar_url, theme
- `sermons` — id, user_id, title, content(JSON), plain_text, preacher, cover_id, is_favorite, archived, last_opened_at
- `categories` — id, user_id, name, color
- `tags` — id, user_id, name
- `sermon_categories` — sermon_id, category_id
- `sermon_tags` — sermon_id, tag_id
- `subscriptions` — id, user_id, is_active, plan_type, expires_at
- `covers` — id, url, is_premium, is_builtin, user_id

### RLS Policies
Executar `supabase/migrations/001_rls_categories_tags.sql` no SQL Editor do Supabase para ativar as policies de categories e tags.

### Auth Providers
- **Google:** Ativar em Authentication → Providers. URI de redirecionamento: `gracenote://auth/callback`
- **Facebook:** Mesmo processo. Requer App Review para modo público.

---

## Configuração do Projeto

### Instalação
```powershell
cd gracenote-app
npm install
npx expo start
```

### Expo Go (teste rápido)
- SDK 54 compatível com Expo Go
- Escanear QR Code com iPhone ou Android
- Login social requer configuração OAuth no Supabase

### EAS Build (APK/IPA)
```powershell
npx eas build --profile development --platform android
```

---

## Regras para Agentes de IA

### Ao modificar código:
1. **TypeScript estrito** — `npx tsc --noEmit` deve passar SEMPRE
2. **Expo Doctor** — `npx expo-doctor` deve passar (18/18 checks)
3. **Safe Area** — TODAS as telas devem usar `useSafeAreaInsets()`
4. **Temas** — Nunca usar cores hardcoded. Usar `const { colors } = useTheme()`

### Ao adicionar dependências:
- Usar `npx expo install <pacote>` (não `npm install`) para Expo packages
- `npm install --legacy-peer-deps` para pacotes não-Expo

### Estrutura de commits:
- Commits em português
- Um commit por feature/bugfix
- `git add -A` + `git commit -m "descrição"`

### Fluxo de desenvolvimento:
1. `npx expo start --clear` (iniciar servidor com cache limpo)
2. Testar no iPhone via Expo Go
3. Verificar erros no terminal do Metro
4. `npx tsc --noEmit` antes de cada commit

### Evitar:
- Remover `react-native-reanimated` ou `react-native-worklets` — são necessários
- Modificar `supabase.ts` sem entender o dual-storage
- Usar `require()` em vez de `import`
- Ignorar warnings do Metro — investigar ou documentar

### Problemas conhecidos:
1. **Login Google:** Funciona apenas com URI de redirecionamento `gracenote://auth/callback` configurado corretamente no Supabase e Google Cloud Console
2. **Categorias/Tags:** Requer RLS policies executadas no Supabase (ver migration)
3. **react-native-reanimated warning:** "shared value's .value inside reanimated inline style" — causado pelo react-native-screens, inofensivo, atenuado com babel.config.js
4. **Fontes:** As fontes Inter, Merriweather, Caveat são nomes de sistema/bundle — podem não renderizar em todos os dispositivos sem carregamento explícito via expo-font

---

## Checklist de Configuração Inicial

- [ ] npm install
- [ ] npx expo start --clear (testar no Expo Go)
- [ ] Executar migrations no Supabase SQL Editor
- [ ] Configurar Google OAuth no Supabase
- [ ] Configurar Facebook OAuth no Supabase
- [ ] Rodar `npx tsc --noEmit` (0 erros)
- [ ] Rodar `npx expo-doctor` (18/18 checks)
