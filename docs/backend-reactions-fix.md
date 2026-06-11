# Backend-fix nodig: reactie-endpoints (smile/meh/frown)

De frontend connect de reactie-rail (smile/meh/frown) op artikelen, memes en
feed-kaarten aan:

- `POST /articles/{id}/reaction` body `{ "reaction": "smile" }`
- `POST /memes/{id}/reaction` body `{ "reaction": "smile" }`
- (`DELETE` varianten voor later)

## Probleem (live geverifieerd op `http://145.24.237.97/api`)

`ReactionController` is **niet in sync** met de rest van de backend:

- DB-enum (migratie `2026_06_04_..._align_reactions_enum_with_rn_mock`) én
  `ArticleResource` gebruiken **`smile/meh/frown`**.
- `app/Http/Controllers/Api/ReactionController.php` valideert echter op
  `happy/shocked/sad` en telt counts onder die keys.

Gevolg:

- `GET /articles/3/reactions` → `{happy:0,shocked:0,sad:0}` terwijl `GET /articles`
  voor datzelfde artikel `reactions:{smile:1,...}` geeft → counts altijd 0.
- `POST .../reaction` faalt altijd: `reaction=smile` → 422 (validatie),
  `reaction=happy` → DB-enum-constraint.

## Benodigde wijzigingen in `ReactionController.php`

1. **Validatie** in `saveReaction()`:

   ```php
   // van:
   'reaction' => ['required', 'in:happy,shocked,sad'],
   // naar:
   'reaction' => ['required', 'in:smile,meh,frown'],
   ```

2. **Counts-keys** in `reactionStats()`:

   ```php
   'counts' => [
       'smile'  => $reactionCounts['smile']  ?? 0,
       'meh'    => $reactionCounts['meh']    ?? 0,
       'frown'  => $reactionCounts['frown']  ?? 0,
   ],
   ```

3. **(Aanrader)** reactie-counts meesturen in `GET /memes` (zoals `ArticleResource`
   al doet voor artikelen). Memes krijgen nu geen counts mee, waardoor een meme na
   het stemmen 100% voor je eigen keuze toont tot dit er is.

De frontend stuurt al `smile/meh/frown` en werkt volledig zodra deze fix live staat.
