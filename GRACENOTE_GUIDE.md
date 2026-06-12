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
│   ├── _layout.tsx         # Root layout (Stack navigator + onboarding + auth)
│   ├── (tabs)/             # Tab Navigator (5 itens no bottom tabs)
│   │   ├── _layout.tsx
│   │   ├── index.tsx       # Dashboard / Home
│   │   ├── search.tsx      # Search screen com filtros avançados
│   │   ├── create-button.tsx  # Botão "+" vazio (navega via tabBarButton)
│   │   ├── premium.tsx     # Premium inline na tab
│   │   └── profile.tsx     # Profile & avatar
│   ├── auth/               # Authentication screens
│   │   ├── login.tsx
│   │   ├── register.tsx
│   │   ├── callback.tsx    # OAuth redirect handler
│   │   └── forgot-password.tsx
│   ├── onboarding/         # 4-step onboarding carousel
│   ├── sermon/             # Sermon CRUD
│   │   ├── create.tsx
│   │   ├── [id].tsx        # Detail view (com categorias/tags)
│   │   └── edit/[id].tsx
│   ├── premium/            # Premium/Paywall screen (standalone)
│   └── settings/           # Perfil + Configurações do app
├── features/               # Feature modules
│   ├── auth/               # Auth hooks, services, store
│   ├── sermons/            # Sermon CRUD + localStorage service
│   ├── categories/         # Category management
│   ├── tags/               # Tag management
│   ├── covers/             # Cover picker
│   ├── editor/             # Font + Color pickers
│   ├── premium/            # Entitlements, RevenueCat (mock)
│   ├── profile/            # Profile service
│   └── library/            # Search + filters + hooks
├── shared/                 # Shared code
│   ├── components/         # UI components (Button, Input, Modal, Chip, etc.)
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
- **Gerencia sessão**: `getSession()` na inicialização + `onAuthStateChange` global

### Tab Layout (`app/(tabs)/_layout.tsx`)
5 abas: Início, Buscar, [+], Premium, Perfil

O botão "+" central é customizado: círculo com fundo `colors.accent.primary`, navega para `/sermon/create`.

### Fluxo de telas:
```
Onboarding → Tabs (qualquer aba sem login)
Login/Registro → Tabs
[+] → Create → Save → Back
Sermão [id] → Detail → Edit → Save → Back
Perfil → Configurações (avatar + nome)
```

---

## Autenticação

### Email/Senha (funciona 100%)
- `useAuth()` hook → `signIn(email, password)`, `signUp(email, password, name)`
- **IMPORTANTE**: `signUp`, `signIn` e `signOut` devem SEMPRE persistir na store Zustand:
  ```ts
  useAuthStore.getState().setSession(data.session)
  useAuthStore.getState().setLoading(false)
  ```
- Sessão persiste via AsyncStorage (configurado em `shared/services/supabase.ts`)
- `supabase.auth.setSession()` após OAuth

### Sessão — Root Layout
O `onAuthStateChange` DEVE ficar no root layout (`app/_layout.tsx`), não em hooks de tela:
```ts
// app/_layout.tsx
const setSession = useAuthStore((s) => s.setSession)
const setLoading = useAuthStore((s) => s.setLoading)

useEffect(() => {
  authService.getSession().then((s) => { setSession(s); setLoading(false) })
  const { data: subscription } = authService.onAuthStateChange((session) => setSession(session as any))
  return () => subscription?.subscription.unsubscribe()
}, [])
```

### Email Confirmation
Se o Supabase tem confirmação de email ativada (padrão), `signUp` retorna `session: null`. O register screen deve verificar:
```ts
const data = await signUp(email, password, name)
if (data?.session) router.replace('/(tabs)')
else setEmailSent(true) // Mostra mensagem "Confirme seu email"
```

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
- Busca offline: `localStorageService.search(filters)` — filtra em memória (case-insensitive, data, preacher, favoritos)

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
- Banner offline

### Busca com Filtros (`app/(tabs)/search.tsx`)
- Campo de texto com **debounce de 300ms**
- **FilterBar horizontal**: Categorias, Tags, Pregador, Favoritos, Data, Ordenar
- **Filtros disponíveis**:
  - Texto: busca em título + conteúdo (ILIKE)
  - Categoria: multi-select com AND logic
  - Tags: multi-select com AND logic
  - Pregador: select único
  - Favoritos: toggle
  - Data: opções rápidas (Este mês, 30 dias, Este ano) + personalizado
  - Ordenação: 5 opções (recentes, antigas, A-Z, Z-A, última leitura)
- **ActiveFiltersBar**: chips removíveis mostrando filtros ativos
- **Dual-storage**: busca online (Supabase) + offline (AsyncStorage)
- **Empty states**: pré-busca ("O que deseja encontrar?") vs sem resultados

### Editor de Ministração

**Layout:**
1. **Capa** (antes do título) — área touchable com preview
2. **Título**
3. **Pregador**
4. **Categoria + Tags** (botões lado a lado)
5. **Toolbar**: Fonte, Cor, Destacar
6. **Editor** (TextInput multiline, flex para ocupar espaço)

**Toolbar:**
- **Fonte**: abre FontSelector com preview via `fontFamily`
- **Cor** (`mode='text'`): altera `color` do TextInput
- **Destacar** (`mode='highlight'`): altera `backgroundColor` do TextInput

**Fontes:**
- Gratuitas: Clássica, Moderna, Serifada, Elegante, Minimalista
- Premium: Lettering, Manuscrita, Caligrafia, Brush, Assinatura (bloqueadas para free)
- Preview funciona com `fontFamily: f.fontFamily` + fontes carregadas via `expo-font`

**Cores:**
- Texto: 9 cores (Padrão, Vermelho, Laranja, Âmbar, Verde, Azul, Roxo, Rosa, Cinza)
- Marca-texto: 6 cores (Amarelo, Verde, Azul, Rosa, Laranja, Roxo)

**CoverPicker:**
- Aba "Modelos": capas gradientes built-in
- Aba "Câmera": solicita permissão, tira foto
- Aba "Galeria": solicita permissão, seleciona foto

### Alerta ao sair sem salvar
- **Create e Edit**: `handleBack()` no botão Voltar
- **Android**: `BackHandler.addEventListener('hardwareBackPress', ...)` intercepta botão físico
- **NUNCA** usar `navigation.addListener('beforeRemove')` — não funciona com native-stack
- `isDirty` monitora: title, content, preacher, capa, categorias, tags, fonte, cor, highlight

### Perfil
- Funciona com ou sem login
- **Com login**: avatar (clicável para trocar foto), nome, email, badge Premium/Free, tema
- **Sem login**: "Conectar-se" com opções de criar conta ou entrar
- Menu: Configurações, Política de Privacidade, Sair

### Configurações (`app/settings/index.tsx`)
- **Perfil** (só visível logado): avatar + nome
- Aparência: Idioma
- Notificações: toggle
- Dados: Backup automático

### Premium
- Acesso via tab bar (ícone Crown) ou pelo `/premium`
- Logo oficial GraceNote + selo "PREMIUM"
- 5 benefícios: Remoção de anúncios, Ministrações ilimitadas, Recursos premium no editor, Capas exclusivas, Exportação em PDF
- Planos: Mensal R$ 9,90 (selo "Popular") / Anual R$ 79,90 (selo "Economia")
- Implementação mock (RevenueCat integrado mas não ativo — preparado para conexão real)

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
Executar TODAS as migrations em ordem no SQL Editor do Supabase:

1. `001_rls_categories_tags.sql` — RLS para `categories` e `tags`
2. `002_full_setup.sql` — colunas `preacher` + `last_opened_at`, índices
3. `003_search_indexes.sql` — `tsvector` + GIN index para full-text search (OPCIONAL)
4. `004_storage_rls.sql` — RLS para buckets `avatars` e `covers`
5. `005_rls_junction_tables.sql` — RLS para `sermon_categories` e `sermon_tags` (OBRIGATÓRIO)

**Regra de ouro para RLS:**
- `FOR ALL USING (...)` NÃO cobre INSERT. INSERT precisa de `WITH CHECK`.
- Sempre criar 4 políticas separadas: SELECT, INSERT (WITH CHECK), UPDATE (USING + WITH CHECK), DELETE (USING).

### Storage Buckets
- `avatars` — fotos de perfil (público, upsert)
- `covers` — capas de ministrações (público)

### Auth Providers
- **Google:** Ativar em Authentication → Providers. URI de redirecionamento: `gracenote://auth/callback`
- **Facebook:** Mesmo processo. Requer App Review para modo público.

---

## Padrões de Código

### JOINs do Supabase em `select`
```ts
// ❌ ERRADO: select('*') não inclui relações
const { data } = await supabase.from('sermons').select('*')

// ✅ CORRETO: select explícito com joins
const { data } = await supabase.from('sermons').select(`
  *,
  categories:sermon_categories(category:categories(id, name, color)),
  tags:sermon_tags(tag:tags(id, name))
`)
```

### Atualização com categorias/tags
```ts
// Separar campos do sermão dos campos de junção
update: async (id, u) => {
  const { category_ids, tag_ids, ...sermonFields } = u
  // Update na tabela sermons (só campos do sermão)
  const { data, error } = await supabase.from('sermons').update(sermonFields).eq('id', id)
  // Sync categories
  if (category_ids !== undefined) {
    await supabase.from('sermon_categories').delete().eq('sermon_id', id)
    if (category_ids.length > 0) {
      await supabase.from('sermon_categories').insert(category_ids.map(c => ({ sermon_id: id, category_id: c })))
    }
  }
  // Sync tags (mesmo padrão)
}
```

### Category/Tag Picker — Display
**NUNCA** renderizar chips com IDs diretamente:
```tsx
// ❌ ERRADO: mostra ID do Supabase
categoryIds.map(id => <Chip label={id} />)

// ✅ CORRETO: mostra nome (populado via estado ou lookup)
// Ou simplesmente não mostra chips — apenas os botões "Categoria (N)" indicam seleção
<Button title={`Categoria${categoryIds.length > 0 ? ` (${categoryIds.length})` : ''}`} />
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
- Usar `navigation.addListener('beforeRemove')` — causa erro com native-stack
- Esquecer de separar `category_ids`/`tag_ids` do update da tabela `sermons`

### Problemas conhecidos:
1. **Login Google:** Funciona apenas com URI de redirecionamento `gracenote://auth/callback` configurado corretamente no Supabase e Google Cloud Console
2. **Categorias/Tags:** Requer RLS policies executadas no Supabase (ver migration 005)
3. **react-native-reanimated warning:** "shared value's .value inside reanimated inline style" — causado pelo react-native-screens, inofensivo, suprimido via LogBox
4. **Fontes:** As fontes Inter, Merriweather, Caveat são nomes de sistema/bundle — podem não renderizar em todos os dispositivos sem carregamento explícito via expo-font
5. **Salvar com categorias/tags:** Se der erro "Could not find the 'category_ids' column of 'sermons'", é porque `category_ids`/`tag_ids` estão sendo passados para o `update()` da tabela `sermons`. Separar os campos (ver padrão acima).
6. **Swipar para voltar do editor:** O `beforeRemove` não funciona com native-stack. Usar `BackHandler` para Android + botão Voltar na tela.

---

## Checklist de Configuração Inicial

- [ ] npm install
- [ ] npx expo start --clear (testar no Expo Go)
- [ ] Executar migrations no Supabase SQL Editor (001 a 005)
- [ ] Configurar Google OAuth no Supabase
- [ ] Configurar Facebook OAuth no Supabase
- [ ] Rodar `npx tsc --noEmit` (0 erros)
- [ ] Rodar `npx expo-doctor` (18/18 checks)
