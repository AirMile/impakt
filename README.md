# Impakt

Nieuws-app voor jongeren, gebouwd met React Native en Expo (JavaScript). De app toont een persoonlijke nieuwsfeed, een humor-feed met memes en een zoekpagina.

---

## Stack

- **Expo** SDK 54 + **React Native** 0.81.5 + React 19
- **Animaties**: moti + react-native-reanimated 4
- **Navigatie**: eigen state-machine in `App.jsx` (geen React Navigation)
- **Opslag**: AsyncStorage
- **Fonts**: Bebas Neue, Poppins, Geist (via expo-google-fonts)
- **Tests**: Jest + jest-expo, Playwright (e2e web-target)

---

## Aan de slag

### Vereisten

- **Node 20+** en npm
- **Expo Go** op je telefoon ([iOS](https://apps.apple.com/app/expo-go/id982107779) / [Android](https://play.google.com/store/apps/details?id=host.exp.exponent)) — voor draaien op je eigen toestel
- Xcode (iOS simulator) of Android Studio (Android emulator) — optioneel, alleen voor simulator

### Installeren en opstarten

```bash
git clone https://github.com/AirMile/impakt.git
cd impakt-rn
npm install
npm run start
```

In de terminal verschijnt een QR-code:

- **Android**: scan met de camera in de Expo Go app
- **iOS**: scan met de standaard Camera app

De app opent dan direct op je telefoon.

### Simulatoren

```bash
npm run ios        # iOS simulator (vereist Xcode op macOS)
npm run android    # Android emulator (vereist Android Studio)
npm run web        # web-versie in de browser
```

---

## Scripts

| Commando          | Wat doet het                                    |
| ----------------- | ----------------------------------------------- |
| `npm run start`   | Start de Expo dev-server (Expo Go / dev client) |
| `npm run ios`     | Start de app in de iOS simulator                |
| `npm run android` | Start de app in de Android emulator             |
| `npm run web`     | Start de app als web-app via react-native-web   |
| `npm run lint`    | Linting via ESLint 10                           |
| `npm run format`  | Code formatteren via Prettier 3                 |
| `npm run test`    | Unit-tests via Jest                             |

---

## Projectstructuur

```
App.jsx              # entry-point — navigatie via state (phase, tab, flags)
src/
  screens/           # FeedScreen, HumorScreen, DetailScreen, SearchScreen, ...
  components/        # BottomNav, Icons, ImpaktLogo, ...
  api/
    mock/            # nep-API data: stories.json, memes.json, categories.json
  theme/             # kleur- en font-tokens, animatie-helpers
  storage/           # AsyncStorage helpers voor gebruikersvoorkeuren
docs/
  backend.md         # API-spec voor het backend-team
e2e/
  feed-smoke.js      # Playwright smoke-test (web target)
```

---

## Mock-data

De app draait momenteel op JSON-bestanden in `src/api/mock/` — er is nog geen live backend. Zodra de backend klaar is, vervangen we de `import`-statements door `fetch`-calls naar de echte endpoints.

Zie `docs/backend.md` voor de volledige API-spec die het backend-team bouwt.

---

## Problemen oplossen

**Telefoon kan de app niet laden ("Network response timed out")**
Zorg dat je telefoon en laptop op hetzelfde wifi-netwerk zitten. Gebruik eventueel de tunnel-optie: druk op `t` in de terminal na `npm run start`.

**Fonts laden niet / app blijft hangen op splash**
Stop de dev-server en start opnieuw:

```bash
npm run start
```

**Reanimated- of worklets-fout bij opstarten**
Wis de Metro-cache:

```bash
npx expo start --clear
```
