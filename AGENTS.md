# GraceNote — Guia do Agente

## Documentação principal
Leia `GRACENOTE_GUIDE.md` para o guia completo do projeto.

## Expo SDK
Usamos Expo SDK 54. Leia a documentação versionada em:
https://docs.expo.dev/versions/v54.0.0/

## Regras essenciais
1. TypeScript deve compilar sem erros (`npx tsc --noEmit`)
2. Expo Doctor deve passar (`npx expo-doctor`)
3. Use `useSafeAreaInsets()` em TODAS as telas
4. Use `useTheme()` para cores — nunca hardcoded
5. `npx expo install` para Expo packages
6. `npm install --legacy-peer-deps` para pacotes não-Expo
