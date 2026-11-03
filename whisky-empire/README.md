# WHISKY EMPIRE

Lokalna gra kolekcjonerska: pracuj w barze, rozwijaj sprzęt, zdrapuj tematyczne zestawy, kolekcjonuj Johnnie Walkera i handluj na symulowanym rynku. Wszystkie pieniądze są fikcyjne. Brak płatności, wpłat, wypłat i wymiany waluty.

Gra jest osobnym projektem `/workspace/gambling/whisky-empire`. Aplikacja katalogowa Dram w `/workspace/whisky` pozostaje niezmieniona.

## Uruchomienie i testy

Node.js 24:

```sh
cd /workspace/gambling/whisky-empire
npm ci
npm test
npm run build
npm run dev
```

Serwer: port 5173. Build `dist/` to samodzielna aplikacja statyczna. IndexedDB wymaga stabilnego originu HTTP/HTTPS; nie otwieraj przez `file://`. Żadne dodatkowe usługi ani sekrety nie są wymagane.

```sh
npm run simulate       # 10 000 losowań każdego zestawu; raport progresji
npm run test:browser   # serwer musi działać; zakładki, ulepszenia, szanse, aukcje, telefon
npm run test:wash      # prawdziwe ruchy gąbki: zwykły sprzęt kontra 15 ulepszeń
npm run test:pages     # sam uruchamia serwer buildu pod /gambling/
```

Testy przeglądarkowe używają `/usr/bin/chromium`; można wskazać inny plik przez `CHROMIUM_PATH`. Każdy test korzysta z osobnego profilu. Granty w scenariuszach testowych nie są funkcją aplikacji i nie trafiają do zapisu gracza.

## Ulepszenia baru

Pięć ścieżek po trzy poziomy. Zakup obciąża konto dokładnie raz i zapisuje się atomowo. Oczekiwany poziom w żądaniu chroni przed podwójnym zakupem ze starej oferty. Istniejące zapisy bez `upgrades` zaczynają od zerowych poziomów, bez resetowania postępu.

| Ulepszenie | Start → poziomy 1 / 2 / 3 | Koszty kolejnych poziomów |
|---|---|---|
| Gąbka XXL | promień 48 → 58 / 68 / 80 px | 12 / 32 / 85 € |
| Turbo piana | siła 1 → 1,25 / 1,6 / 2× | 18 / 45 / 110 € |
| Zwinne dłonie | min. 2,5 → 2,2 / 1,9 / 1,6 s | 25 / 65 / 160 € |
| Napiwki | 1 → 1,25 / 1,50 / 1,80 € za szkło | 20 / 60 / 150 € |
| Klub kolekcjonera | rabat 0 → 2 / 5 / 8% | 45 / 120 / 280 € |

Większa gąbka ułatwia trafienie, piana skraca wymagane szorowanie plam, a zwinność obniża dolny limit czasu pracy. Ich połączenie daje odczuwalny efekt. Napiwki zwiększają wypłatę dopiero za ukończone mycie. Samo kliknięcie, bezruch i niepełne pokrycie nie płacą. Dowód mycia zawiera jednorazowy `workId`; replay jest odrzucany.

Koszt wszystkich ulepszeń: **1 227 €**. Pierwszy poziom napiwków zwraca się po 80 kieliszkach, drugi po 240, trzeci po 500. To zakup długoterminowy, konkurujący z kolejnymi dropami. Rabat ma największy sens przy droższych kolekcjach. Idealne maksimum wynikające z limitu aktywnego czasu to 24 €/min bez ulepszeń i 67,5 €/min z pełnym sprzętem; rzeczywista prędkość zależy od ruchu i pokrycia powierzchni. Test Chromium: 2,87 s zwykły kieliszek i 2,08 s maksymalne ulepszenia.

Po pierwszym myciu pozostaje jednorazowy darmowy Red Label (`jw-004`). Przycisk odbioru działa także na istniejącym zapisie i nie pozwala duplikować prezentu.

## Nowe zestawy zdrapek

Stare Budget/Classic/Silver itd. zastąpiono kolekcjami tematycznymi. **Każda nowa karta przyznaje dokładnie jedną prawdziwą butelkę z katalogu.** Dawne, zapisane nagrody (także fragment) nadal można odebrać i sprzedać.

| Zestaw | Pula | Cena bez rabatu | Teoretyczny zwrot Quick Sell przy cenach bazowych |
|---|---|---:|---:|
| Basic | Red Label / Red Soul / Black Label 12 | 16 € | 72,79% |
| Black Edition | wszystkie 35 wycenionych Black Labeli | 46 € | 69,12% |
| Green Room | 4 Green Label / Island Green | 59 € | 69,08% |
| Labels | wszystkie 151 wydań z samodzielnym „Label” w nazwie | 67 € | 69,08% |
| Blue Society | 96 Blue Labeli | 240 € | 69,72% |
| World Passport | 31 wydań podróżniczych i miejskich | 113 € | 69,52% |
| Collector’s Vault | 53 historyczne i kolekcjonerskie wydania | 172 € | 69,78% |

Pule mogą się tematycznie pokrywać. Cena nie wynika z kolejności kart. Basic: **60% Red Label, 32% Red Soul, 8% Black Label 12**. Pozostałe pule obejmują wszystkie pasujące, wycenione rekordy i wykorzystują jawny rozkład wag `basePrice^(-power)`. Wagi pochodzą wyłącznie z katalogu, a nie salda, historii strat, zakupów czy tempa gry. Rozdzielamy milion całkowitych jednostek prawdopodobieństwa; każda pozycja ma dodatnią szansę, a suma wynosi 100%.

Ceny pozostałych zestawów są zaokrąglone w górę do pełnego euro z docelowego bazowego EV Quick Sell / 0,70. Rabat obniża cenę, nigdy nie zmienia puli ani szans. Poniższe granice dotyczą powtarzalnych cen; jednorazowy bon startowy opisano osobno. Test matematyczny potwierdza ujemne EV także przy maksymalnym rabacie 8% i równoczesnym wzroście wszystkich notowań do górnego limitu 120% bazy. Basic osiąga w tym skrajnym przypadku około 94,95% zwrotu; pozostałe zestawy około 90–97%.

`data/economy-report.jsonl` zawiera **120 000 losowań**, po 10 000 dla każdej z 12 kolekcji, ze stałym seedem do odtwarzalnego porównania. Zaobserwowane zwroty wynoszą około 69–74%; pełne wyniki dla każdego zestawu są w raporcie. Wysoki zwrot średni nie oznacza częstych zyskownych trafień; pełny rozkład i wartości widać przed zakupem. `data/progression-report.json` zawiera parametry sprzętu, sumę kosztów i teoretyczne tempo zarabiania.

Podgląd szans otwiera przewijany modal z prawdziwymi zdjęciami, cenami, procentami, wyszukiwarką i bieżącym EV sprzedaży. Nie rozwija ani nie przesuwa kafla zdrapki. Każda karta pokazuje postęp zbierania własnego zestawu. Losowanie, cena i obciążenie konta zapisują się przed rozpoczęciem Canvas; odświeżenie nie zmienia nagrody.

## Rozgrywka, aukcje i zapis

Każda butelka jest osobnym egzemplarzem. Keep/Na półkę, Quick Sell oraz aukcja operują na tym samym ID. Zakup rynkowy kosztuje 103% ceny; natychmiastowa sprzedaż daje 85%, więc zakup–odsprzedaż zawsze traci przez spread.

Dom aukcyjny ma wizualne karty produktów, sekundowy zegar, najwyższą ofertę, awatary symulowanych kolekcjonerów, animację nowej oferty i osobny modal historii. Wystawianie: zdjęcie, porównanie z rynkiem, cena startowa, opcjonalne Buy Now oraz 1/5/15 min. Prowizja: 5%. Boty mają ograniczoną skłonność do zapłaty i nie gwarantują sprzedaży. Brak ofert zwraca egzemplarz do kolekcji. Podczas aukcji nie można sprzedać tej samej butelki inną drogą; rozliczenie jest jednokrotne, także po odświeżeniu.

Dzień rynku trwa 5 minut i obejmuje 24 notowania. Trend z pamięcią, powrót do bazy, zmienność według rzadkości i zdarzenia korzystają z zapisanego generatora RNG. Ceny mieszczą się w 55–120% bazy. Ticki i rozliczenia są zapisywane razem. Zegar nie cofa się względem ostatniego zapisanego czasu; nadrabianie jest ograniczone do 240 ticków na operację i kontynuuje się przy kolejnych aktualizacjach. Wykresy wykorzystują rzeczywistą historię zapisu, maks. 6000 punktów.

Wszystkie kwoty są całkowitymi centami. IndexedDB wykonuje odczyt, walidację i zapis w pojedynczej transakcji readwrite, również pomiędzy kartami przeglądarki. 19 testów obejmuje finanse, pakiety, rabaty, ulepszenia, stary zapis, współbieżność, mycie, rynek i aukcje. Testy przeglądarkowe sprawdzają wszystkie ekrany, zakup ulepszeń, cenę z rabatem, geometrię kart po otwarciu szans, wyszukiwarkę nagród, zachowanie wyniku po reloadzie i telefon.

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

Workflow `.github/workflows/pages.yml` testuje i buduje po pushu na `main`, a następnie publikuje wyłącznie `dist`. Repozytorium: **Settings → Pages → Source → GitHub Actions**. Adres: https://tressiotokozak.github.io/gambling/.

Moduły, katalog i zdjęcia używają ścieżek względnych; build działa pod `/gambling/`. `.nojekyll` wyłącza Jekyll. Zależności modułów i zasoby interfejsu mają wersję cache `lounge-5`. IndexedDB na Pages jest oddzielne od zapisu localhost, ponieważ należy do originu.

## Struktura i ograniczenia

- `game/engine.js` — komendy i transakcje ekonomii, rynek i aukcje.
- `game/upgrades.js` — poziomy, koszty i wspólne reguły mycia.
- `game/packs.js` — kolekcje tematyczne, wagi, ceny i rabaty.
- `game/storage.js` — atomowy IndexedDB.
- `components/wash-canvas.js` — renderowanie kryształowej szklanki.
- `components/bottle-art.js` — przezroczystość oryginalnych fotografii.
- `app.js` — UI, interakcje, modale i dźwięki; `style.css` — responsywny wygląd gry.

Natywne moduły JavaScript, Canvas, SVG i IndexedDB. Zależności developerskie służą testom. Gra jest single-player i działa lokalnie w przeglądarce. Nie ma autorytatywnego serwera, multiplayera ani synchronizacji urządzeń. Transakcje chronią przed błędami interfejsu i współbieżnością; nie chronią przed świadomą edycją DevTools ani przestawianiem zegara w przyszłość. Reset wymaga potwierdzenia, a czyszczenie danych przeglądarki usuwa postęp.


## Aktualizacja: zwarty warsztat i więcej dropów na start

Ekran ulepszeń to jedna konsola z pięcioma wierszami zakupów i podglądem wybranego sprzętu. Wszystkie poziomy, efekty i przyciski pozostają widoczne bez przewijania. Test Chromium obejmuje 1440×1000, 1366×768, 1280×720, 390×844 i 360×740. Na telefonie dodatkowe wyjaśnienia otwiera ikona sprzętu w osobnym oknie.

Plansza aukcji pokazuje wyłącznie aktywne licytacje. Zakończone aukcje nadal są zachowane wraz z rozliczeniami i historią ofert, ale trafiają do osobnego okna „Archiwum”. Przeniesienie do archiwum nie wykonuje żadnej operacji finansowej. Kolekcja otrzymała album z postępem unikatowych wydań i licznikami rzadkości.

Nowa domyślna półka „Na start” zawiera sześć zestawów; „Kolekcjonerskie” pokazuje sześć wcześniejszych droższych zestawów, a „Wszystkie” pełne dwanaście.

| Startowy zestaw | Cena zwykła | Cena z jednorazowym bonem, bez VIP | Pula i szanse |
|---|---:|---:|---|
| Red Club | 14,50 € | 9,50 € | Red Soul 90%, Red Label 10% |
| Basic | 16 € | 11 € | Red Label 60%, Red Soul 32%, Black Label 12 8% |
| Ruby Rush | 20 € | 15 € | Red Soul 55%, Black Ruby 30%, Red Label Icons 2.0 15% |
| Double Trouble | 24 € | 19 € | Black Label 12 65%, Double Black 25%, Black Ruby 10% |
| Cask Lab | 24 € | 19 € | Red Soul 55%, Red Rye Finish 25%, Select Casks Rye Cask Finish 15%, Triple Grain American Oak 5% |
| Golden Hour | 28 € | 23 € | Black Label 12 65%, Gold Label Reserve 28%, Green Label 15 7% |

**Starter Pass:** jeden jawny bon 5 € na jeden dowolny zakup startowy, dostępny także dla dotychczasowych zapisów, które nie mają tej flagi. Najtańszy drop można dzięki temu kupić od razu z początkowych 10 €. Bon łączy się ze zniżką VIP, ale nie zmienia prawdopodobieństw. Flaga `starterPassUsed` i koszt są zapisywane atomowo przy zakupie, przed animacją; odświeżenie nie przywraca bonu. Niewystarczające środki nie zużywają bonu.

Oferta powitalna jest celową jednorazową dotacją: może mieć dodatnie EV sprzedaży. Jej łączny koszt dla gry jest ograniczony do 5 € na zapis. **Powtarzalne** zakupy wszystkich 12 kolekcji pozostają poniżej 100% EV nawet z rabatem 8% i przy maksymalnych notowaniach. Raport odróżnia zwykłą cenę od hipotetycznej ceny pierwszego wyboru; bonu nie można wykorzystać raz dla każdej karty. Starsza otwarta zdrapka zachowuje swoją uprzednio zapłaconą cenę i nagrodę.
