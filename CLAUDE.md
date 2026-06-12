# GraceNote

Leia o guia completo em `GRACENOTE_GUIDE.md`.

## Comandos rápidos

```powershell
npx expo start              # Iniciar servidor
npx expo start --clear      # Iniciar com cache limpo
npx tsc --noEmit            # Verificar TypeScript
npx expo-doctor             # Verificar saúde do projeto
```

## Lembre-se

- Nunca usar cores hardcoded — sempre usar `useTheme()`
- Todas as telas precisam de `useSafeAreaInsets()`
- `npx expo install` para Expo packages, `npm install --legacy-peer-deps` para outros

## Padrões Críticos

### Autenticação — Store Zustand
- **SEMPRE** persistir sessão na store após `signUp`/`signIn`/`signOut`:
  ```ts
  useAuthStore.getState().setSession(data.session)
  useAuthStore.getState().setLoading(false)
  ```
- `onAuthStateChange` deve ficar no **root layout** (`app/_layout.tsx`), não em hooks de tela
- `getSession()` deve ser chamado no root layout para restaurar sessão ao iniciar

### Supabase — Joins
- `select('*')` NÃO inclui relações — use select explícito com joins:
  ```ts
  .select(`*, categories:sermon_categories(category:categories(id,name,color)), tags:sermon_tags(tag:tags(id,name))`)
  ```
- Query builder é **síncrono** — erros só ocorrem no `await`. Não use try/catch para montar query.

### RLS Policies
- `FOR ALL USING (...)` NÃO cobre INSERT. INSERT precisa de `WITH CHECK` explícito.
- Sempre criar 4 políticas separadas: SELECT, INSERT, UPDATE, DELETE.

### Editor — Alerta ao sair sem salvar
- Usar `handleBack()` no botão Voltar + `BackHandler.addEventListener` no Android.
- **NUNCA** usar `navigation.addListener('beforeRemove')` — causa erro com native-stack.

### Debug
- `console.warn` aparece em amarelo no Metro (mais visível que console.log)
- Mostrar `err.message` em Alert para diagnóstico

### Categorias/Tags
- AO CRIAR: inserir depois do sermão, com `if (catError) throw catError`
- AO EDITAR: separar `category_ids`/`tag_ids` do `update` da tabela `sermons`
- `sermonsService.update` deve destruturar: `const { category_ids, tag_ids, ...sermonFields } = u`
- AO CARREGAR: usar select com joins + extrair IDs no useEffect

### Fontes
- Fontes precisam ser carregadas via `expo-font` para preview funcionar no FontSelector
- Nomes registrados no `useFonts` devem corresponder ao `fontFamily` usado no TextInput
