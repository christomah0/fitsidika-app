# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fitsidika-App is a cross-platform mobile health management application built with Expo (React Native) and TypeScript. It supports patient vital signs tracking, medication management, and doctor-patient messaging. The UI is in French.

## Common Commands

```bash
npm start              # Start Expo dev server
npm run android        # Run on Android emulator
npm run ios            # Run on iOS simulator
npm run web            # Run on web browser
npm run lint           # Run ESLint (expo lint)
```

No test framework is currently configured.

## Architecture

### Routing & Roles

The app uses **Expo Router** (file-based routing) with role-based route groups:

- `app/(tabs)/` — Patient-facing bottom tab navigation (accueil, vitaux, medocs, messages)
- `app/(doctor)/` — Doctor-facing routes (patient list, details, history)
- `app/login.tsx` — Email-based authentication against Firestore `users` collection
- User roles: `patient`, `doctor`, `admin`

### Data Layer

- **Firebase/Firestore** for server-side data (users, patients, vital signs, symptoms, medications)
- **`@tanstack/react-query`** for server state management and caching
- **AsyncStorage** for client-side medication persistence
- **expo-secure-store** for session tokens and sensitive credentials
- Service layer in `services/` wraps all Firestore operations (`firestoreServices.ts`) and local medication logic (`medicationService.ts`)

### Key Directories

- `services/firebase/` — Firebase config and Firestore CRUD operations
- `services/` — Business logic (medications, notifications, validation)
- `hooks/` — Custom hooks (auth, medications, theming)
- `types/` — TypeScript interfaces for all domain entities
- `constants/` — Theme (colors/fonts), menu items, medication types
- `components/` — Reusable UI components; `components/ui/` for low-level primitives

### Styling & UI

- Direct React Native `StyleSheet` (no CSS framework like NativeWind)
- Theme constants in `constants/theme.ts`
- Charts via `react-native-gifted-charts` and `react-native-chart-kit`

## TypeScript

- Strict mode enabled
- Path alias: `@/*` maps to project root (e.g., `import { User } from '@/types/user.type'`)
- Expo typed routes enabled (`experiments.typedRoutes` in app.json)

## Expo Configuration

- React Native New Architecture enabled
- React Compiler experiment enabled
- Plugins: expo-router, expo-splash-screen, datetimepicker, expo-secure-store
