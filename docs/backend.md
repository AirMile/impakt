# Impakt — Backend-specificatie

## Wat is dit?

Impakt is een nieuws-app voor jongeren. De frontend (React Native) draait nu op nep-data uit JSON-bestanden. Jullie bouwen de echte backend die die JSON-bestanden vervangt. Dit document legt uit welke endpoints jullie moeten bouwen, hoe de data eruit moet zien, en wat er als eerste klaar moet zijn.

---

## Endpoints — MVP (eerste sprint)

Dit zijn de endpoints die de app nodig heeft om zonder mock-data te draaien.

---

### Auth

#### `POST /auth/register`

Maak een nieuw account aan.

**Request body:**

```json
{
  "name": "Mila",
  "email": "mila@example.com",
  "password": "geheim123"
}
```

**Response:**

```json
{
  "token": "abc123...",
  "user": { "id": "u1", "name": "Mila", "email": "mila@example.com" }
}
```

---

#### `POST /auth/login`

Inloggen met e-mail en wachtwoord.

**Request body:**

```json
{
  "email": "mila@example.com",
  "password": "geheim123"
}
```

**Response:** zelfde als `/auth/register`.

---

#### `POST /auth/logout`

Sessie beëindigen. Geen body nodig. Response: `{ "ok": true }`.

---

#### `POST /auth/social/:provider`

Inloggen via Google, Apple of Facebook. `:provider` is `google`, `apple` of `facebook`.

**Request body:**

```json
{ "token": "token-van-google-sdk" }
```

**Response:** zelfde als `/auth/register`.

---

### Feed

#### `GET /feed`

Haalt een lijst stories op.

**Query params (alle optioneel):**

| Param      | Waarde                                                       | Betekenis              |
| ---------- | ------------------------------------------------------------ | ---------------------- |
| `cat`      | `Klimaat`, `Politiek`, `Sport`, `Tech`, `Wereld`, `Voor jou` | Filter op categorie    |
| `goodNews` | `true`                                                       | Alleen positief nieuws |
| `page`     | getal (start bij 1)                                          | Paginering             |

`cat=Voor jou` geeft een persoonlijke selectie op basis van de interesses die de user bij het aanmaken van het account heeft gekozen.

**Response:**

```json
{
  "stories": [
    {
      "id": 1,
      "title": "...",
      "sub": "...",
      "img": "...",
      "cat": "Wereld",
      "tone": "Live",
      "date": "2026-05-20T06:32:00Z",
      "views": 34200,
      "trending": true,
      "tags": ["Live"],
      "reactions": { "smile": 18, "meh": 31, "frown": 51 },
      "my_reaction": null
    }
  ],
  "page": 1,
  "total": 11
}
```

> Tip: voor de lijstweergave hoeft `body`, `poll`, `actions` en `sources` niet mee — die zijn alleen nodig in de detailpagina.

---

#### `GET /stories/:id`

Haalt één volledig artikel op (inclusief body, poll, acties en bronnen).

**Response:** één Story-object zoals hierboven beschreven, met alle velden.

---

#### `GET /stories/top-read`

De meest gelezen stories. Gebruikt op de zoekpagina onder "Meest gelezen".

**Query params:**

- `limit` = getal (standaard 4)

**Response:** zelfde shape als `/feed`, maar gesorteerd op views (hoog naar laag).

---

### Memes

#### `GET /memes`

Haalt de humor-feed op.

**Query params (optioneel):**

- `storyId` = getal — geef de meme voor dit specifieke artikel als eerste terug (de app opent soms de humor-feed op een specifieke meme)
- `cursor` = string — voor paginering (geef de `nextCursor` uit de vorige response terug)

**Response:**

```json
{
  "memes": [
    {
      "id": "m1",
      "storyId": 2,
      "img": "...",
      "top": "...",
      "bot": "...",
      "likes": 12400,
      "reactions": { "smile": 72, "meh": 19, "frown": 9 },
      "my_reaction": null,
      "my_liked": false
    }
  ],
  "nextCursor": "m5"
}
```

---

### Categorieën

#### `GET /categories`

Haalt de lijst van nieuwscategorieën op. Wordt gebruikt voor de filterknoppen in de feed.

**Response:**

```json
{
  "categories": ["Voor jou", "Klimaat", "Politiek", "Sport", "Tech", "Wereld"]
}
```

---

### Zoeken

#### `GET /search`

Zoekt door alle verhalen op titel, samenvatting, categorie en tags.

**Query params:**

- `q` = zoekterm (verplicht)

**Response:** zelfde shape als `/feed` (zonder paginering nodig voor nu).

---

### Onboarding

#### `GET /onboarding/topics`

Haalt de lijst van keuze-onderwerpen op voor het aanmeldscherm.

**Response:**

```json
{
  "topics": [
    { "id": "politiek", "label": "Politiek" },
    { "id": "klimaat", "label": "Klimaat" },
    { "id": "sport", "label": "Sport" },
    { "id": "innovatie", "label": "Innovatie" },
    { "id": "economie", "label": "Economie" },
    { "id": "natuur", "label": "Natuur" },
    { "id": "kunst", "label": "Kunst" },
    { "id": "lokaal", "label": "Lokaal" }
  ]
}
```

---

#### `POST /me/onboarding`

Sla de gekozen interesses op na het registreren.

**Request body:**

```json
{
  "topics": ["politiek", "klimaat", "sport"]
}
```

**Response:** `{ "ok": true }`

---

### Profiel

#### `GET /me`

Haalt de gegevens van de ingelogde gebruiker op.

**Response:** User-object zoals hierboven beschreven.

---

#### `PATCH /me/tags`

Voeg een tag toe of verwijder een tag van het profiel van de gebruiker.

**Request body:**

```json
{
  "add": ["Tech"],
  "remove": ["School"]
}
```

**Response:** bijgewerkt User-object.

---

## Endpoints — Later (interactiviteit)

Deze endpoints zijn niet nodig voor de eerste sprint, maar wel voor een volledige app.

---

### Reacties op verhalen

> **Let op — afwijking van de live API (geverifieerd juni 2026):** de app gebruikt
> `POST /articles/:id/reaction` (enkelvoud) met body `{ "reaction": "smile" }`, en
> `DELETE /articles/:id/reaction` om een stem te verwijderen. De `/stories/...`-routes
> hieronder bestaan niet op de huidige backend (404).

#### `POST /articles/:id/reaction` / `DELETE /articles/:id/reaction`

Geef of verwijder een reactie (smile, meh of frown) op een artikel. Memes gebruiken
`POST|DELETE /memes/:id/reaction`. Geverifieerd werkend (HTTP 200, count gaat op/neer).

**Request body (POST):** `{ "reaction": "smile" }` — `smile`, `meh` of `frown`.

#### ⚠️ Nog te doen: `my_reaction` in de GET-responses

**Probleem:** de stem wórdt opgeslagen, maar `GET /articles`, `GET /articles/:id` en
`GET /memes` geven (ook mét geldige Bearer-token) géén `my_reaction` terug. Daardoor
kan de app na een reload niet tonen welke reactie de gebruiker gaf — je ziet weer de
smileys i.p.v. je eigen stem.

**Backend-fix:** voeg per item `my_reaction` toe in de API Resource (de reactie van de
ingelogde user, of `null`). De app leest dit veld al (`mapArticle`/`mapMeme` →
`myReaction`) en stuurt de token mee bij het ophalen.

```php
// ArticleResource.php (pas relatie-/kolomnaam aan op je schema)
'my_reaction' => $request->user()
    ? optional(
        $this->reactions()->where('user_id', $request->user()->id)->first()
      )->reaction          // of ->type, afhankelijk van je kolomnaam
    : null,
// idem in MemeResource.php
```

---

### Poll stemmen

#### `POST /stories/:id/poll/vote`

Stem op een poll-optie in een artikel. Elke gebruiker mag maar één keer stemmen.

**Request body:** `{ "optionId": "a" }`

**Response:** bijgewerkte poll met nieuwe aantallen en `my_choice`.

---

### Opslaan (bookmarks)

#### `POST /stories/:id/bookmark` / `DELETE /stories/:id/bookmark`

Sla een artikel op of verwijder het uit de opgeslagen lijst.

#### `POST /memes/:id/bookmark` / `DELETE /memes/:id/bookmark`

Zelfde voor memes.

**Response:** `{ "saved": true }` of `{ "saved": false }`.

> **Let op — de app gebruikt de `/account/...`-routes**, niet de `/:id/bookmark`-vorm
> hierboven: `POST|DELETE /account/articles/:id/save` en `POST|DELETE
/account/memes/:id/save`. Geverifieerd op 2026-06-15 met een verse testgebruiker
> (`POST /register` → token).
>
> **Bewaarde lijsten staan in `GET /account` onder snake_case-velden:**
> `user.saved_articles` en `user.saved_memes` (niet camelCase). De frontend leest nu
> beide vormen (`src/lib/saves.js` — snake_case eerst, camelCase als fallback).
>
> **Save/unsave werkt voor beide:** `POST /account/articles/:id/save` en
> `POST /account/memes/:id/save` geven 200 en persisteren (`saved_articles` /
> `saved_memes` bevatten het id), `DELETE` → 200. Geverifieerd op 2026-06-15.
>
> Tijdens het koppelen gaf de meme-save kort 200 zonder te persisteren (DELETE erna
> → 404 `MEME_NOT_FOUND`); dat bleek een tijdelijk/deploy-probleem en is server-side
> opgelost. Een `DELETE` op een meme die níét bewaard is geeft (terecht) nog steeds
> 404 — de frontend behandelt die idempotent als "al verwijderd"
> (`src/lib/saves.js#unsaveMeme`), zodat de UI niet vastloopt bij dubbel-tappen of
> stale state.

---

### Meme liken

#### `POST /memes/:id/like` / `DELETE /memes/:id/like`

Like een meme (dubbel-tap in de app) of verwijder de like.

**Response:** `{ "liked": true, "likes": 12401 }`.

---

### Reacties op memes

#### `POST /memes/:id/reactions`

Zelfde als reactions op verhalen.

---

### Kijkteller

#### `POST /stories/:id/view`

De app roept dit aan wanneer iemand een artikel opent. Geen body nodig. Wordt gebruikt om de viewteller bij te houden.

**Response:** `{ "ok": true }`

---

### Delen (share)

De share-knop is nu client-side gebouwd: de app genereert een `impakt://story/<id>` deep-link en opent het native share-sheet. De backend hoeft hier niets voor te doen.

**Status (juni 2026)**: de share-URL gebruikt het custom scheme `impakt://`. Dit werkt alleen voor recipients die de app al hebben en de link handmatig openen — messengers zoals WhatsApp/iMessage maken er geen tappable link van. Universal Links (`https://...` die de app opent én een nette fallback-pagina toont voor mensen zonder app) volgen pas zodra we een echte EAS-build draaien. Dat vereist `.well-known/apple-app-site-association` + `assetlinks.json` op een gehost domein (waarschijnlijk `impakt-beta.vercel.app`), plus `ios.associatedDomains` + `android.intentFilters` in `app.json`. In Expo Go werkt dat niet, dus uitgesteld tot TestFlight/store-prep.

Zodra jullie hier meer mee willen doen zijn er twee opties:

#### `POST /stories/:id/share` _(analytics)_

Registreer een gedeeld artikel voor tellerweergave of analytics. De app roept dit aan na een succesvolle share.

**Request body:** geen (of optioneel `{ "platform": "whatsapp" }`).

**Response:** `{ "ok": true }`

#### `GET /s/:id` _(short-link / OG-preview)_

Een server-side redirect-route die:

1. De juiste `<meta og:title>`, `og:image` en `og:description` server-side rendert op basis van het artikel (zodat WhatsApp / iMessage een mooie preview-card toont).
2. Redirects naar `impakt://story/<id>` voor gebruikers die de app hebben, of naar een webpagina voor gebruikers zonder de app.

Dit vereist ook wijzigingen in de app-config: `ios.associatedDomains` en `android.intentFilters` in `app.json` voor universal links.

**Prioriteit:** niet nodig voor MVP — alleen relevant als de share-functionaliteit zichtbaar moet zijn voor mensen die de app nog niet hebben.

---

## Authenticatie

Gebruik een `Authorization`-header voor alle beveiligde endpoints:

```
Authorization: Bearer <token>
```

De token krijgt de gebruiker terug bij het inloggen of registreren. Welke technologie jullie daarvoor gebruiken (JWT, sessie, etc.) is aan jullie.

Endpoints die geen login vereisen: `/feed`, `/stories/:id`, `/memes`, `/categories`, `/search`, `/onboarding/topics`.

---

## Web-hosting (Vercel)

De web-build (`react-native-web`) kan gratis als deelbare HTTPS-demo live via
Vercel. Eén horde: de Vercel-URL is `https://…`, maar de backend draait op
`http://145.24.237.97/api` (geen HTTPS). Een https-pagina mag geen http-API
aanroepen ("mixed content"). Oplossing: een **same-origin proxy** via een
`vercel.json`-rewrite — geen code, Vercel proxyt `/api/*` server-side naar de
backend.

**Hoe het werkt**

- `vercel.json` → `rewrites`: `/api/:path*` wordt server-side doorgestuurd naar
  `http://145.24.237.97/api/:path*` (server→server http is toegestaan). De
  browser ziet alleen same-origin `https://<app>/api/…`, dus geen mixed content.
  Query-strings worden automatisch meegestuurd.
- `.env.production` zet `EXPO_PUBLIC_API_BASE_URL=/api` (relatief). `expo export`
  draait in production-mode en geeft `.env.production` voorrang op `.env`, zodat
  de app via de proxy praat i.p.v. het harde IP. Lokale dev (`npm run web` /
  native) gebruikt `.env` en blijft het IP gebruiken.
- `vercel.json` zet `buildCommand` (`npm run export:web`) en `outputDirectory`
  (`dist`) vast, zodat Vercel de Expo-web-export bouwt zonder dashboardconfig.
- `npm run export:web` draait met `--clear`: Metro cachet de ingebakken
  `EXPO_PUBLIC_*`-waarde, dus zonder cache-clear zou een eerdere `npm run web`
  (IP) het verkeerde adres in de bundle bakken.

**Deploy-stappen**

1. Push de repo naar GitHub.
2. Vercel dashboard → Add New → Project → importeer de repo. `vercel.json` vult
   build-command en output-dir automatisch in — niets handmatig instellen.
3. Deploy → resultaat: `https://impakt-rn.vercel.app`.

**Verificatie:** open de URL, check in DevTools → Network dat calls naar
`https://<domein>/api/…` 200 geven, zonder mixed-content- of CORS-fout.

> **Backend-adres wijzigen?** Het IP staat in `vercel.json`. Wil je het niet
> hardcoden, vervang de rewrite dan door een Edge-function in `api/[...path].js`
> die `process.env.API_ORIGIN` leest en met `fetch` proxyt — dezelfde aanpak,
> maar dan instelbaar via een Vercel-env-var. Voor een vaste demo-backend is de
> rewrite simpeler.

---

## Vragen?

Stuur een berichtje in het team-kanaal of maak een issue aan in de repo.
