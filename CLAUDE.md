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
