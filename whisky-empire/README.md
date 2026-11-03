# WHISKY EMPIRE

Niezależna gra przeglądarkowa w `gambling/whisky-empire`. Nie zmienia aplikacji katalogowej Dram w `/workspace/whisky`. Wszystkie pieniądze są fikcyjne; brak płatności, wpłat i wypłat.

## Uruchomienie

Node.js 24 (zgodny z `.nvmrc` źródłowego repozytorium):

```sh
cd /workspace/gambling/whisky-empire
npm ci
npm test
npm run build
npm run dev
```

Serwer słucha na porcie 5173. `dist/` zawiera pliki statyczne do hostowania HTTP. Zapis wymaga IndexedDB i stabilnego originu przeglądarki. Gra nie wymaga usług, kont ani sekretów. Nie otwieraj plików przez `file://`.

```sh
npm run simulate         # 10 000 losowań każdej z 7 kart
npm run test:browser     # serwer musi już działać; systemowy /usr/bin/chromium
npm run test:wash        # fizyczne ruchy gąbki i sprawdzenie wypłaty
```

Opcjonalnie ustaw `CHROMIUM_PATH`, jeśli Chromium jest zainstalowany w innym miejscu. Testy przeglądarkowe używają osobnych, nietrwałych profili i nie usuwają zapisu użytkownika.

## Dane i fotografie

Źródło: https://github.com/TressioToKozak/whisky, commit `5c99c4eaed7c48047b58c29e4f442fd08552ccc3`.

Zidentyfikowano 253 rekordy marek Johnnie Walker / John Walker & Sons. Do gry zaimportowano 235 rekordów z użyteczną ceną EUR; 18 rekordów referencyjnych wyłączono z handlu. Lista wyłączeń znajduje się w `data/provenance.json`. Red Soul istnieje w katalogu jako `jw-2e092d2b628a` — nie jest wymyśloną edycją.

- `data/catalog.json`: oryginalne ID, nazwy, opis, źródło produktu, źródło zdjęcia, pełna referencja cenowa i konfiguracja rzadkości.
- `data/bottles/`: istniejące lokalne fotografie, skopiowane bez przetwarzania. `object-fit: contain` zachowuje proporcje; niedziałające zdjęcie zastępuje nazwa. Nie powstały sztuczne fotografie butelek.
- Fotografie i ich etykiety należą do właścicieli. Repozytorium źródłowe nie ustanawia tutaj prawa do dalszej redystrybucji. Przed publicznym wydaniem należy ustalić uprawnienia; zachowano oryginalne URL-e i pochodzenie każdego zdjęcia.
- Ceny katalogowe to historyczne referencje, nie bieżące oferty ani porady inwestycyjne. Dalej zmienia je wyłącznie symulacja gry.

Ponowny import z istniejącego checkoutu (zmienia tylko wygenerowane dane gry):

```sh
npm run import:catalog -- /workspace/whisky
npm test
npm run simulate
npm run build
```

## Pętla gry

Start: 10 €. Szorowanie 48 obszarów szkła wymaga ruchu, dystansu i minimum 8 sekund aktywnego kontaktu; jedna wypłata = 1 €. W praktyce tempo zależy od dokładności ruchów; test systematycznego szorowania kończy kieliszek po około 8–15 sekundach. Powtórne użycie dowodu wypłaty jest odrzucane.

Karty mają stałe, jawne pule. Losowanie i obciążenie konta zapisują się atomowo przed animacją. Canvas usuwa warstwę pod kursorem; przy 70% odkrywa resztę. Nagroda trafia raz do kolekcji; Keep, Quick Sell i Auction zarządzają tym samym egzemplarzem.

Każdy egzemplarz ma ID, koszt, datę, źródło i status. Quick Sell daje 85% notowania; zakup na rynku kosztuje 103%. Fragment jest jawnym przedmiotem gry wymienianym na 2 €, nie oficjalną whisky; nie jest sprzedawany na rynku ani licytowany.

Aukcje: 1/5/15 minut, cena startowa, opcjonalne Buy Now, boty o ograniczonej skłonności do zapłaty, historia ofert, prowizja 5%, możliwość braku sprzedaży. Wystawione egzemplarze są zablokowane; rozliczenie następuje raz, również po ponownym otwarciu gry.

## Balans

Dostosowano ceny Silver–Diamond, ponieważ ceny katalogu są niższe od przykładowych wartości w specyfikacji. Classic zachowuje 70% Red Label / 24% Red Soul / 6% Black Label 12.

| Karta | Cena | EV Quick Sell, ceny bazowe | Zwrot teoretyczny |
|---|---:|---:|---:|
| Budget | 5 € | 2,96 € | 59,21% |
| Classic | 15 € | 11,64 € | 77,59% |
| Silver | 25 € | 16,36 € | 65,43% |
| Gold | 35 € | 22,34 € | 63,84% |
| Platinum | 60 € | 40,02 € | 66,70% |
| Diamond | 250 € | 175,94 € | 70,38% |
| Legendary | 2 500 € | 1 815,20 € | 72,61% |

Dokładne pule: `game/engine.js`, widoczne również przed zakupem każdej karty. Budget: 90% fragment 2 € i 10% Red Label. Legendary: 67,5% The John Walker, 30% The Directors Blend 2008, 2% 40 Year Old Master's Ruby Reserve, 0,5% 48 Year Old Masters of Flavour.

`data/economy-report.jsonl` zapisuje 70 000 losowań: po 10 000 każdej karty, stały seed do odtwarzalnych porównań. Zaobserwowane zwroty: 58,80 / 77,74 / 65,20 / 63,70 / 66,53 / 71,20 / 72,69%. Samo mycie daje 4–7,5 € na minutę przy 8–15 s/sztukę; karty mają ujemny oczekiwany wynik. Nie dopasowujemy szans do salda ani historii gracza.

## Rynek i poprawność

Dzień rynkowy = 5 minut, 24 notowania/dzień. Zapisany generator pseudolosowy, trend z pamięcią, powrót do ceny bazowej, zmienność zależna od konfiguracji rzadkości i wydarzenia. Granice cen: 55–120% bazy. Górny limit utrzymuje ujemne EV wszystkich zdrapek nawet przy maksymalnych notowaniach; zapobiega bezryzykownemu masowemu otwieraniu na szczycie rynku. Natychmiastowy zakup–Quick Sell zawsze traci przez spread.

Czas nigdy nie cofa się względem ostatniego zapisanego czasu. Kolejne ticki i rozliczenia zapisują się razem; nadrabianie jest ograniczone do 240 ticków na operację i kontynuuje się przy kolejnych aktualizacjach. Refresh nie losuje historii na nowo. Historia wykresów pochodzi z zapisu (maks. 6000 punktów), a filtry nie tworzą brakujących danych. Wykresy mają podgląd wartości pod kursorem.

IndexedDB wykonuje cały odczyt–modyfikację–zapis w jednej transakcji readwrite, także między kartami przeglądarki. Kwoty są całkowitymi centami. Testy obejmują brak środków, replay nagrody/wypłaty, podwójną sprzedaż, blokadę i rozliczenie aukcji, deterministyczność rynku, cofnięcie zegara, spread i współbieżność IndexedDB.

## Struktura i decyzje

`game/engine.js` — niezależny od DOM model ekonomii, RNG, rynek, aukcje, osiągnięcia. `game/storage.js` — atomowy IndexedDB. `app.js` — osiem ekranów, obsługa Pointer Events, Canvas, dźwięk i wykresy SVG. `style.css` — responsywny motyw. `tools/` — serwer, statyczny build, import i symulacja. `tests/` — logika, transakcje i przeglądarka.

Implementacja korzysta z natywnych modułów JavaScript zamiast preferowanego React/TypeScript/Vite. Nie ma zależności runtime ani zewnętrznych fontów; zależności developerskie służą testom. Wykresy są własnymi interaktywnymi SVG, a nie Recharts. Minigry i efekty są stylizowane: kieliszek rysowany Canvas, piana podczas ruchu, sygnały dźwiękowe i świetlny efekt rzadkiej nagrody.

## Ograniczenia

To lokalna gra single-player. IndexedDB zapewnia poprawność współbieżnych operacji aplikacji, lecz nie chroni przed ręczną edycją zapisu/DevTools ani świadomym przestawianiem zegara w przyszłość. Brak serwera autorytatywnego, synchronizacji urządzeń i multiplayera. Reset wymaga potwierdzenia; wyczyszczenie danych przeglądarki usuwa grę.

Przy awarii zapisu nowa operacja nie jest zatwierdzana; komunikat błędu pozostaje widoczny. Przed publikacją produkcyjną warto rozszerzyć testy dostępności, długotrwałego zapisu i dotyku na fizycznych urządzeniach. Prawa do redystrybucji zdjęć pozostają niepotwierdzone.

## GitHub Pages

Workflow `.github/workflows/pages.yml` testuje i buduje grę po pushu na `main`, a następnie publikuje wyłącznie `whisky-empire/dist` jako stronę repozytorium. Można go też uruchomić ręcznie w Actions. W repozytorium ustaw **Settings → Pages → Source → GitHub Actions**. Docelowy adres: `https://tressiotokozak.github.io/gambling/`.

Ścieżki modułów, katalogu i zdjęć są względne, więc gra działa pod prefiksem `/gambling/` i na domenie własnej. Plik `.nojekyll` zapobiega przetwarzaniu przez Jekyll. Test wdrożenia: `npm run build`, następnie `npm run test:pages` (systemowy Chromium). Ten test sprawdza załadowanie modułów, katalogu i wszystkich 235 zdjęć z podkatalogu.

Zapis na GitHub Pages jest oddzielny od zapisu na serwerze lokalnym, ponieważ IndexedDB należy do originu przeglądarki.
