# WHISKY EMPIRE

Gra kolekcjonerska Johnnie Walker z fikcyjnym euro, pracą w barze, zdrapkami i rynkiem. Osobna aplikacja; katalog Dram pozostaje niezmieniony.

## Uruchomienie

Node.js 24, z katalogu `whisky-empire`:

```sh
npm ci
npm test
npm run build
npm run dev
```

Serwer HTTP: port 5173. Build `dist/` działa pod `/gambling/`. IndexedDB wymaga stabilnego originu HTTP/HTTPS. Brak sekretów i usług backendowych.

```sh
npm run simulate
npm run test:browser
npm run test:wash
npm run test:pages
```

Testy browser/wash wymagają uruchomionego serwera oraz Chromium (`CHROMIUM_PATH`, domyślnie `/usr/bin/chromium`). Test Pages uruchamia własny serwer buildu. Granty używane w testach nie są funkcją gry.

## Płynny interfejs

Header i nawigacja pozostają tymi samymi elementami DOM i mają stałe wymiary. Tick rynku aktualizuje notowania i licytacje, bez ponownego renderowania strony. Umycie resetuje tylko stan tej samej szklanki Canvas. Kupowanie na rynku i Quick Sell aktualizują odpowiednie dane lub kartę.

Zdrapka otwiera się w osobnym oknie. Można je zamknąć i wznowić; nagroda i koszt zapisują się atomowo przy zakupie. Moneta podąża za kursorem/palcem, a jej rozmiar odpowiada szerokości ścierania. Odkrycie 70% kończy animację. Przyciski zarządzają jednym zapisanym egzemplarzem, bez ponownego przyznania.

## Ulepszenia

Dwie zakładki, każda z czterema ścieżkami po trzy poziomy:

| Bar | Efekt start → maksimum |
|---|---|
| Gąbka | promień 48 → 80 px |
| Płyn | skuteczność ×1 → ×2 |
| Tempo | minimalna aktywna praca 2,5 → 1,6 s |
| Napiwki | wypłata 1 → 1,80 € |

| Zdrapki | Efekt start → maksimum |
|---|---|
| VIP | rabat 0 → 8% |
| Moneta | promień 22 → 43 px |
| Quick Sell | 85 → 88% rynku |
| Fortuna | do +24% względnej wagi cenniejszych wydań |

Fortuna porządkuje nagrody według ceny bazowej, zwiększa wagi proporcjonalnie do miejsca i normalizuje sumę do 100%. +24% wagi nie oznacza +24 punktów procentowych. Dokładne szanse i EV są widoczne przed zakupem. Nie zależą od salda, strat ani historii zakupów. Zakup ulepszenia nie zmienia już wylosowanej nagrody.

24 poziomy kosztują razem 3 467 €. Zachowane są stare poziomy i zapisy. Zakładki mieszczą się bez scrollowania przy testowanych rozmiarach 1440×1000, 1366×768, 1280×720, 390×844 i 360×740. Mycie wymaga pokrycia zabrudzeń, ruchu oraz aktywnego czasu; klikanie nie daje wypłaty.

## Zestawy i balans

13 tematycznych kolekcji, w tym sześć startowych. Każda przyznaje jedną butelkę. Jednorazowy bon startowy −5 € jest skończoną dotacją; Red Club jest dostępny za początkowe 10 €.

| Zestaw | Zwykła cena bez ulepszeń |
|---|---:|
| Basic | 16 € |
| Red Club | 15 € |
| Ruby Rush | 23 € |
| Double Trouble | 25,50 € |
| Cask | 24,50 € |
| Golden Hour | 28,50 € |
| Black | 45 € |
| Green | 57 € |
| Labels | 65,50 € |
| Blue | 233 € |
| Passport | 110,50 € |
| Vault | 171 € |
| Imperial Reserve | 10 000 € |

Red Club: Red Soul 90%, Red Label 8%, Red Rye 2%. Basic: Red Label 60%, Red Soul 32%, Black Label 8%. Pozostałe pełne pule i aktualne szanse znajdują się w grze oraz `game/packs.js`. Każda kolekcja ma najwyższą nagrodę, której bazowy Quick Sell przekracza zwykłą cenę biletu; popularne trafienia przeważnie przynoszą stratę.

Imperial Reserve zawiera wyłącznie sześć istniejących rekordów: Commemorative 1949 (30%), Directors Blend 2008 (22%), Vault The Couture Blend (20%), Master's Ruby Reserve 40YO (14%), White Label około 1900 (8%) i Masters of Flavour 48YO (6%).

Cena uwzględnia EV bazowe i ograniczenie dla maksymalnej Fortuny, Quick Sell 88%, VIP 8% oraz rynku przy 120% bazy. Powtarzalne zakupy mają ujemne EV we wszystkich 64 kombinacjach tych ulepszeń. Bon powitalny jest oddzielnym wyjątkiem ograniczonym do 5 € na zapis.

`data/economy-report.jsonl`: 130 000 losowań ze stałym seedem, po 10 000 na zestaw. Zaobserwowany bazowy zwrot Quick Sell wynosi około 70–73%, Imperial około 63%. Najwyższy obliczony zwrot przy wszystkich ulepszeniach i maksymalnych notowaniach pozostaje poniżej 100%. `data/progression-report.json` zapisuje koszty i tempo rozwoju.

## Rynek i aukcje

Rynek wykorzystuje zapisany seed, tick, trendy, powrót do średniej, wydarzenia i limity cen. Historia wykresów pochodzi z zapisu. Zakup kosztuje 103% rynku. Boty licytują do 108% wartości; po prowizji 5% maksimum 102,6% nie umożliwia gwarantowanego arbitrażu zakup–aukcja przy stałej cenie.

Formularz sugeruje start 94% rynku i pokazuje szacowane zainteresowanie oraz kwotę po prowizji. Konkurencyjne ceny przyciągają więcej ofert, ale nie gwarantują sprzedaży. W 10 000 niezależnych scenariuszy (rynek 19 €, start 18 €, 1 minuta) sprzedano 85,56% butelek; raport `data/auction-report.json`. Aukcje zakończone są w archiwum. Egzemplarz pozostaje zablokowany do rozliczenia, a niesprzedany wraca do kolekcji.

## Weryfikacja i trwałość

24 testy logiki: atomowe finanse, zapis, współbieżność, pojedyncze wypłaty, pending, ulepszenia, szanse, rynek i rozliczenia. Testy Chromium sprawdzają niezmienność elementów headera, szklanki i aktywnej aukcji, popup i monetę, zapis po odświeżeniu, wszystkie ekrany, mobile i brak scrollowania warsztatu. Test Pages sprawdza build pod prefiksem, 235 fotografii i maski hero.

## Katalog, fotografie i źródła

Źródło: https://github.com/TressioToKozak/whisky, commit `5c99c4eaed7c48047b58c29e4f442fd08552ccc3`.

Zidentyfikowano 253 rekordy marek Johnnie Walker / John Walker & Sons. Gra korzysta z 235 rekordów z użyteczną ceną EUR; 18 referencji wyłączono z handlu i losowań. Lista wyłączeń jest w `data/provenance.json`. Red Soul istnieje jako `jw-2e092d2b628a`.

`data/catalog.json` zachowuje oryginalne ID, opisy, źródła produktów i fotografii oraz pełne referencje cenowe. Ceny katalogowe są historycznymi referencjami, nie bieżącymi ofertami. Wszystkie dalsze notowania to symulacja gry.

Fotografie w `data/bottles/` są skopiowane bez przetwarzania. `components/bottle-art.js` stosuje wyłącznie maski do wyświetlania; pięć produktów z hero ma ręczne sylwetki, a inne usuwanie jasnego neutralnego tła połączonego z brzegiem. Etykiety i proporcje nie są generowane ponownie. Nietypowe tło może wymagać dodatkowej maski. `data/art/scratch-tickets.png` jest osobną wygenerowaną ilustracją interfejsu i nie zastępuje fotografii produktu. Szklanka w minigrze jest proceduralnym rysunkiem Canvas: kryształowe dno, fasety, refleksy, smugi, piana i animowana gąbka.

Prawa do fotografii należą do właścicieli; nie potwierdzono licencji na ich publiczną redystrybucję. Informacje o źródłach pozostają dostępne. Przed dalszym rozpowszechnianiem należy ustalić uprawnienia.

Celowy ponowny import katalogu z istniejącego checkoutu:

```sh
npm run import:catalog -- /workspace/whisky
npm test
node tools/simulate.js > data/economy-report.jsonl
npm run build
```

## GitHub Pages

`.github/workflows/pages.yml` testuje, buduje i publikuje `dist/` po pushu na `main`. Ustawienie repozytorium: Settings → Pages → Source → GitHub Actions.

Adres: https://tressiotokozak.github.io/gambling/. Ścieżki zasobów są względne, cache modułów `smooth-6`. Zapis Pages jest oddzielny od localhost; aktualizacja zachowuje istniejący zapis na tym samym originie.

## Struktura i ograniczenia

- `game/engine.js` — komendy i transakcje ekonomii, rynek i aukcje.
- `game/upgrades.js` — poziomy, koszty i wspólne reguły mycia.
- `game/packs.js` — kolekcje tematyczne, wagi, ceny i rabaty.
- `game/storage.js` — atomowy IndexedDB.
- `components/wash-canvas.js` — renderowanie kryształowej szklanki.
- `components/bottle-art.js` — przezroczystość oryginalnych fotografii.
- `app.js` — UI, interakcje, modale i dźwięki; `style.css` — responsywny wygląd gry.

Natywne moduły JavaScript, Canvas, SVG i IndexedDB. Zależności developerskie służą testom. Gra jest single-player i działa lokalnie w przeglądarce. Nie ma autorytatywnego serwera, multiplayera ani synchronizacji urządzeń. Transakcje chronią przed błędami interfejsu i współbieżnością; nie chronią przed świadomą edycją DevTools ani przestawianiem zegara w przyszłość. Reset wymaga potwierdzenia, a czyszczenie danych przeglądarki usuwa postęp.
