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
npm run test:quests
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
| Tempo | minimalna aktywna praca 2 → 1,25 s |
| Napiwki | wypłata 1,50 → 2,50 € |

| Zdrapki | Efekt start → maksimum |
|---|---|
| VIP | rabat 0 → 8% |
| Moneta | promień 22 → 43 px |
| Quick Sell | 85 → 88% rynku |
| Fortuna | do +24% względnej wagi cenniejszych wydań |

Fortuna porządkuje nagrody według ceny bazowej, zwiększa wagi proporcjonalnie do miejsca i normalizuje sumę do 100%. +24% wagi nie oznacza +24 punktów procentowych. Dokładne szanse i EV są widoczne przed zakupem. Nie zależą od salda, strat ani historii zakupów. Zakup ulepszenia nie zmienia już wylosowanej nagrody.

24 poziomy kosztują razem 3 099 €. Zachowane są stare poziomy i zapisy. Zakładki mieszczą się bez scrollowania przy testowanych rozmiarach 1440×1000, 1366×768, 1280×720, 390×844 i 360×740. Mycie wymaga pokrycia zabrudzeń, ruchu oraz aktywnego czasu; klikanie nie daje wypłaty.

## Zestawy i balans

13 tematycznych kolekcji, w tym sześć startowych. Każda przyznaje jedną butelkę. Jednorazowy bon startowy −5 € jest skończoną dotacją; Red Club jest dostępny za 7,75 € z początkowych 10 € przy bazowych notowaniach.

| Zestaw | Cena przy bazowych notowaniach bez ulepszeń |
|---|---:|
| Basic | 13,50 € |
| Red Club | 12,75 € |
| Ruby Rush | 19,50 € |
| Double Trouble | 20,25 € |
| Cask Lab | 23,50 € |
| Golden Hour | 26,00 € |
| Black Edition | 37,50 € |
| Green Room | 47,75 € |
| Labels | 55,25 € |
| Blue Society | 194,75 € |
| World Passport | 93,25 € |
| Collector’s Vault | 144,50 € |
| Imperial Reserve | 8500,00 € |

Red Club: Red Soul 90%, Red Label 8%, Red Rye 2%. Basic: Red Label 60%, Red Soul 32%, Black Label 8%. Pozostałe pełne pule i aktualne szanse znajdują się w grze oraz `game/packs.js`. Każda kolekcja ma najwyższą nagrodę, której bazowy Quick Sell przekracza zwykłą cenę biletu; popularne trafienia przeważnie przynoszą stratę.

Imperial Reserve zawiera wyłącznie sześć istniejących rekordów: Commemorative 1949 (30%), Directors Blend 2008 (22%), Vault The Couture Blend (20%), Master's Ruby Reserve 40YO (14%), White Label około 1900 (8%) i Masters of Flavour 48YO (6%).

Ceny reagują na aktualny rynek zamiast uwzględniać jego hipotetyczne maksimum już na starcie. Cena zestawu to większa z wyceny bazowej skalowanej aktualnym EV i zabezpieczenia `EV(max Fortuna, QS 88%) / 0,92 / 0,985`, zaokrąglona w górę do 0,25 €. Następnie stosowany jest VIP i jednorazowy bon. Dlatego przy dowolnych notowaniach powtarzalne EV pozostaje poniżej 100%, nawet po wszystkich ulepszeniach. Przed zakupem widoczne są aktualne szanse, ceny i EV. Komenda odrzuca zakup, jeśli cena wzrosła powyżej pokazanej oferty; istniejąca opłacona zdrapka zachowuje koszt i nagrodę.

W pięciu z sześciu zestawów startowych środkowa nagroda cenowa ma Quick Sell w granicach ±10% ceny biletu przy bazowych notowaniach. To nie oznacza gwarantowanego zwrotu ani mediany ważonej szansami: tańsze nagrody nadal są częstsze. Double Trouble ma 73% Black Label, 18% Double Black, 7% Black Ruby, 2% Triple Cask. Cask Lab: Red Soul 40%, Red Rye 32%, Select Casks Rye 23%, Triple Grain 5%. Golden Hour: Black Label 55%, Gold Label Reserve 36%, Green Label 9%.

`data/economy-report.jsonl`: 130 000 losowań ze stałym seedem, po 10 000 na zestaw. Typowy bazowy zwrot wzrósł z około 70–73% do około 83–87%; Imperial około 74%. Matematyczny test obejmuje wszystkie 64 kombinacje ulepszeń przy maksymalnych i mieszanych i odwróconych notowaniach. Bon powitalny jest skończoną dotacją, ograniczoną do 5 € na zapis.

## Misje i rytm gry

24 jednorazowe questy z nagrodą w fikcyjnym euro:

- Mycie: 10 / 25 / 100 / 250 szklanek → 5 / 10 / 35 / 70 €.
- Odkrycie: 1 / 10 / 25 / 100 / 250 zdrapek → 2 / 8 / 15 / 45 / 100 €.
- Handel: 5 / 25 sprzedanych butelek → 5 / 20 €.
- Albumy: 13 misji za posiadanie wszystkich wydań danego zestawu naraz. Nagroda to 12% sumy cen bazowych, minimum 5 €, maksimum 10 000 €. Duplikaty nie zastępują brakującego wydania; sprzedane butelki nie liczą się, te zablokowane na aukcji tak.

Osobna zakładka Misje ma filtry, paski postępu, gotowe nagrody i podgląd albumu z oznaczeniem posiadanych wydań. Baza, bar i sklep pokazują kompaktowy następny cel. Postęp pochodzi z istniejącego zapisu; starszy gracz może odebrać już osiągnięte kamienie milowe. Otworzenia są liczone dopiero po odkryciu, nie przy zakupie. Wypłata i oznaczenie odbioru zapisują się atomowo, także przy dwóch kartach przeglądarki. Nie ma odnawialnych nagród za ten sam cel.

`data/session-report.json`: 10 000 par sekwencji po 20 Basic, te same losowania, rynek bazowy, natychmiastowy Quick Sell, odbiór osiągniętych misji, bez ulepszeń. Średnio 84,16 myć w poprzednim balansie vs 10,91 teraz (−87%). Wynik opisuje tę strategię i fazę startową, nie całą rozgrywkę ani gwarancję zysku. Zatrzymywanie butelek zużywa więcej gotówki.

Mycie płaci bazowo +1,50 € za minimum 2 s aktywnego ruchu, do +2,50 € za minimum 1,25 s po ulepszeniu. Przejście przez powierzchnię nadal jest wymagane; test prawdziwego ruchu myszy trwał około 2,69 s bez sprzętu i 1,81 s z pełnym sprzętem. Koszt sprzętu barowego spadł z 782 € do 414 €.

Szklanka i plamy korzystają z buforowanych warstw i sprite’ów. W spoczynku ograniczona jest liczba klatek; ukryta karta nie rysuje. Ruch gąbki nie ustawia już efektów CSS dla całego otoczenia. `data/wash-performance-report.json`: porównanie równoważnych 200 klatek z poprzednią wersją w Chromium wykazało około 66% redukcji czasu rysowania (pomiar na maszynie cloud, nie gwarancja FPS na każdym urządzeniu).


## Rynek i aukcje

Rynek wykorzystuje zapisany seed, tick, trendy, powrót do średniej, wydarzenia i limity cen. Historia wykresów pochodzi z zapisu. Zakup kosztuje 103% rynku. Boty licytują do 108% wartości; po prowizji 5% maksimum 102,6% nie umożliwia gwarantowanego arbitrażu zakup–aukcja przy stałej cenie.

Formularz sugeruje start 94% rynku i pokazuje szacowane zainteresowanie oraz kwotę po prowizji. Konkurencyjne ceny przyciągają więcej ofert, ale nie gwarantują sprzedaży. W 10 000 niezależnych scenariuszy (rynek 19 €, start 18 €, 1 minuta) sprzedano 85,56% butelek; raport `data/auction-report.json`. Aukcje zakończone są w archiwum. Egzemplarz pozostaje zablokowany do rozliczenia, a niesprzedany wraca do kolekcji.

## Weryfikacja i trwałość

31 testów logiki: atomowe finanse, zapis, współbieżność, pojedyncze wypłaty, pending, ulepszenia, szanse, rynek i rozliczenia. Testy Chromium sprawdzają niezmienność elementów headera, szklanki i aktywnej aukcji, popup i monetę, zapis po odświeżeniu, wszystkie ekrany, mobile i brak scrollowania warsztatu. Test Pages sprawdza build pod prefiksem, 235 fotografii i maski hero.

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

Adres: https://tressiotokozak.github.io/gambling/. Ścieżki zasobów są względne, cache modułów `quests-7`. Zapis Pages jest oddzielny od localhost; aktualizacja zachowuje istniejący zapis na tym samym originie.

## Struktura i ograniczenia

- `game/engine.js` — komendy i transakcje ekonomii, rynek i aukcje.
- `game/upgrades.js` — poziomy, koszty i wspólne reguły mycia.
- `game/packs.js` — kolekcje tematyczne, wagi, ceny i rabaty.
- `game/storage.js` — atomowy IndexedDB.
- `components/wash-canvas.js` — renderowanie kryształowej szklanki.
- `components/bottle-art.js` — przezroczystość oryginalnych fotografii.
- `app.js` — UI, interakcje, modale i dźwięki; `style.css` — responsywny wygląd gry.

Natywne moduły JavaScript, Canvas, SVG i IndexedDB. Zależności developerskie służą testom. Gra jest single-player i działa lokalnie w przeglądarce. Nie ma autorytatywnego serwera, multiplayera ani synchronizacji urządzeń. Transakcje chronią przed błędami interfejsu i współbieżnością; nie chronią przed świadomą edycją DevTools ani przestawianiem zegara w przyszłość. Reset wymaga potwierdzenia, a czyszczenie danych przeglądarki usuwa postęp.
