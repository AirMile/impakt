# Impakt

Visuele nieuws-app voor Nederlandse jongeren, gebouwd met **React Native + Expo** (JavaScript). Impakt brengt het nieuws op een manier die past bij hoe jongeren scrollen: een persoonlijke, beeldgedreven **feed**, een aparte **humor-feed** met memes, een **Happy feed** met goed nieuws, en artikelen waarop je kunt **reageren, stemmen, opslaan en delen**.

De app draait op een live **Laravel-backend** voor content, reacties en peilingen. Delen gebeurt voorlopig client-side (native Share / Web Share).

---

## Screenshots

|                           Feed                           |                         Humor                          |                         Detail                          |                              Doe mee                               |
| :------------------------------------------------------: | :----------------------------------------------------: | :-----------------------------------------------------: | :----------------------------------------------------------------: |
| ![Persoonlijke nieuwsfeed](docs/screenshots/01-feed.png) | ![Humor-feed met memes](docs/screenshots/02-humor.png) | ![Artikel-detailpagina](docs/screenshots/03-detail.png) | ![Peiling, meme en bronnen](docs/screenshots/04-detail-acties.png) |
|          Feed met thema-filter en reactie-rail           |            Meme-feed met gekoppeld artikel             |           Detailpagina met reacties + opslaan           |            Peiling, "meme over dit verhaal" en bronnen             |

---

## Features

- **Persoonlijke feed** — verhalen gefilterd op je gekozen thema's (Kunst, Sport, Politiek, Buitenland, …).
- **Humor-feed** — memes met een koppeling naar het bijbehorende nieuwsartikel.
- **Happy feed** — een aparte stroom met goed nieuws.
- **Reageren** — emoji-reactie per artikel (😊 / 😐 / 🙁) met live percentages.
- **Opslaan** — bookmark artikelen en vind ze terug in je opgeslagen-overzicht.
- **Delen** — via de native deel-sheet (mobiel) of Web Share / clipboard (web).
- **Peilingen** — stem mee in een artikel en zie direct de uitslag.
- **Bronnen & context** — elk artikel toont bronlinks en een "wat kan jij doen?"-blok.
- **Zoeken** — zoek door alle verhalen.
- **Account** — registreren, inloggen en profielbeheer.

---

## Stack

- **Expo** SDK 54 + **React Native** 0.81.5 + React 19
- **Animaties**: moti + react-native-reanimated 4
- **Navigatie**: eigen state-machine in `App.jsx` (`phase` + `tab` + flags — geen React Navigation)
- **Opslag**: AsyncStorage (voorkeuren, opgeslagen artikelen)
- **Backend**: Laravel-API (REST), basis-URL via `EXPO_PUBLIC_API_BASE_URL`
- **Fonts**: Bebas Neue, Poppins, Geist (via expo-google-fonts)
- **Tests**: Jest + jest-expo + Testing Library; Playwright (e2e web-target)
- **Web-deploy**: `expo export` → statische `dist/` op de Laravel-server (same-origin `/api`)

---

## Aan de slag

### Vereisten

- **Node 20+** en npm
- **Expo Go** op je telefoon ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) — voor draaien op je eigen toestel
- Xcode (iOS simulator) of Android Studio (Android emulator) — optioneel, alleen voor de simulator

### Installeren en opstarten

```bash
git clone https://github.com/AirMile/impakt.git
cd impakt-rn
npm install
cp .env.example .env   # API-basis-URL instellen (zie hieronder)
npm run start
```

In de terminal verschijnt een QR-code:

- **Android**: scan met de camera in de Expo Go app
- **iOS**: scan met de standaard Camera app

De app opent dan direct op je telefoon.

### Simulatoren en web

```bash
npm run ios        # iOS simulator (vereist Xcode op macOS)
npm run android    # Android emulator (vereist Android Studio)
npm run web        # web-versie op http://localhost:3000
```

De web-versie draait op `http://localhost:3000`, omdat de backend-CORS deze origin toestaat.

---

## Configuratie (`.env`)

De app praat met de Laravel-backend via `EXPO_PUBLIC_API_BASE_URL`. Deze staat in `src/lib/config.js` en valt zonder `.env` terug op het dev-backend-IP, zodat tests en CI blijven werken.

```bash
cp .env.example .env
```

```dotenv
# Lokale dev (native + web) praat rechtstreeks met de backend:
EXPO_PUBLIC_API_BASE_URL=http://145.24.237.97/api
```

> **Let op:** na het wijzigen van `.env` de dev-server herstarten met cache-clear:
>
> ```bash
> npx expo start -c
> ```

Voor de gehoste web-build wordt `.env.production` gebruikt (`/api` relatief). De statische build wordt vanaf dezelfde server als de Laravel-backend geserveerd, zodat de app de API same-origin via `/api` aanroept — geen CORS, geen proxy. Zie `docs/backend.md` voor de volledige API-spec en hosting-stappen.

---

## Scripts

| Commando             | Wat doet het                                               |
| -------------------- | ---------------------------------------------------------- |
| `npm run start`      | Start de Expo dev-server (Expo Go / dev client)            |
| `npm run ios`        | Start de app in de iOS simulator                           |
| `npm run android`    | Start de app in de Android emulator                        |
| `npm run web`        | Start de app als web-app via react-native-web              |
| `npm run export:web` | Bouwt de statische web-build naar `dist/` (voor de server) |
| `npm run lint`       | Linting via ESLint 10                                      |
| `npm run format`     | Code formatteren via Prettier 3                            |
| `npm run test`       | Unit-tests via Jest                                        |

---

## Projectstructuur

```
App.jsx                # entry-point — navigatie via state (phase, tab, flags)
src/
  screens/             # FeedScreen, HumorScreen, HappyFeedScreen, DetailScreen,
                       #   SearchScreen, SavedScreen, ProfileScreen, AuthScreen
  components/          # BottomNav, ReactionRail, AppHeader, Icons, ImpaktLogo, ...
  hooks/               # useArticleReactions, useAsyncData, useSaveArticle
  lib/                 # pure helpers: articles, filterStories, config, auth/, ...
  api/mock/            # fixtures voor tests (stories/memes/categories)
  storage/             # AsyncStorage helpers voor voorkeuren
  theme/               # kleur- en font-tokens, animatie-helpers
docs/
  backend.md           # API-spec voor het backend-team
  screenshots/         # afbeeldingen voor deze README
e2e/
  feed-smoke.js        # Playwright smoke-test (web target)
```

---

## Tests

```bash
npm run test          # alle unit-tests (Jest + jest-expo)
```

Pure helpers in `src/lib/` hebben unit-tests; componenten en hooks render+interactie-tests via Testing Library. Bij elke nieuwe of gewijzigde functionaliteit hoort een test — een feature is pas af als de test groen draait.

---

## Bijdragen

- Werk in een feature-branch (`feat/...`, `fix/...`) en open een PR naar `dev`.
- Draai vóór een PR: `npm run lint && npm run format && npm run test`.
- Commit-berichten volgen de [Conventional Commits](https://www.conventionalcommits.org/)-stijl (`feat(...)`, `fix(...)`, …).

---

## Problemen oplossen

**Telefoon kan de app niet laden ("Network response timed out")**
Zorg dat je telefoon en laptop op hetzelfde wifi-netwerk zitten. Gebruik eventueel de tunnel-optie: druk op `t` in de terminal na `npm run start`.

**Geen data / lege feed**
Controleer dat `EXPO_PUBLIC_API_BASE_URL` in je `.env` naar een bereikbare backend wijst, en herstart met `npx expo start -c`.

**Reanimated- of worklets-fout bij opstarten**
Wis de Metro-cache:

```bash
npx expo start --clear
```

---

## Licentie

MIT — zie [`LICENSE`](LICENSE).
