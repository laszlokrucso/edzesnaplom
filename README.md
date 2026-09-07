# Edzésnaplóm

Magyar, mobilra is használható, helyben tároló edzésnapló. Az Edzésnapló alkalmazás 2-es verziójú JSON-mentését kezeli. A személyes bemeneti mentés nincs beépítve a weboldalba és nem kerül feltöltésre.

## Használat

1. Nyisd meg a webappot, válaszd a **Mentés megnyitása** gombot, és töltsd be az eredeti JSON-fájlt.
2. Ellenőrizd a beolvasott darabszámokat, majd válaszd a **Mentés betöltése** gombot.
3. A **Sablonok** fülről vagy egy korábbi edzés **Megismétlem** gombjával indulhatsz. Üres edzést is kezdhetsz.
4. A sorozatok szerkesztése automatikusan helyben mentődik. Az **Edzés mentése** lezárja az edzést; csak a lezárt edzések kerülnek a kompatibilis JSON-exportba.
5. A **Mentések → JSON-mentés letöltése** adja a régi appba visszatölthető szerkezetű fájlt. Őrizd meg az eredeti mentést is.

Az adatok böngészőnként és webcímenként külön tárolódnak; nincs felhős szinkron. Eszközváltáshoz exportálj, majd az új eszközön importálj. A böngészőadatok törlése a naplót is törli. Használd rendszeresen az exportot. Új import előtt a korábbi naplóról letöltés készül, és a teljes előző állapotot (a folyamatban lévő edzéssel együtt) egy helyi visszaállítási pont is megőrzi.

A kezdőképernyőhöz adható alkalmazás az első online megnyitás és a service worker telepítése után a gyorsítótárazott felülettel offline is működhet. Az „Offline használatra kész” jelzés a sikeres worker-aktiválást jelzi. Telefonos telepítést és hálózat nélküli indulást tényleges készüléken még ellenőrizni kell.

## Kompatibilitás

- A `version: 2` és a `workouts`, `exercises`, `templates`, `bodyweights`, `prs` struktúra változatlan.
- Az eredeti azonosítók, időbélyegek, tömbsorrend és ismeretlen mezők megmaradnak. Az exportálás időpontja frissül.
- A folyamatban lévő edzés külön helyi állapot; nem adunk saját mezőket a régi backuphoz.
- Új rekordoknál a mentés összes meglévő PR-értékével egyező, egy tizedesre kerekített Epley-becslést használunk: `súly × (1 + ismétlés / 30)`. Az importált rekordokat utólag lefelé nem módosítjuk.
- A régi app forrása és működő példánya hiányában tényleges importja nem tesztelhető. A szerkezeti és adatok megőrzésére vonatkozó kompatibilitás automatizáltan ellenőrzött; teljes körű visszaállítási garancia nem adható.

## Fejlesztés és ellenőrzés

Node.js 22.13 vagy újabb szükséges.

```sh
npm ci
npm run dev
npm test
npx tsc --noEmit
npm run build
```

A tesztek a projekt szülőkönyvtárában lévő `edzesnaplo-2026-08-20.json` eredeti mintával futnak. A kész statikus oldal a `dist/client` könyvtárba kerül. A build az offline gyorsítótár fájllistáját is előállítja. A Windows build segédje a sikeres azonnali kilépés helyett hagyja bezáródni a natív libuv-kezelőket; a hibás kilépést nem módosítja.

Ellenőrzött: 11 adatkompatibilitási teszt, TypeScript-ellenőrzés és éles build. Böngészős kattintásos / vizuális ellenőrzés és tényleges telefonos offline próba nem történt. Az opcionális WebMCP összegző eszköz csak támogató böngészőben regisztrálódik; ilyen környezetben még nem ellenőrzött.

## GitHub Pages

A `.github/workflows/pages.yml` automatikusan ellenőrzi, felépíti és közzéteszi az appot a `main` ágra küldött változtatásokból. A GitHub-tároló **Settings → Pages → Source** mezőjében a **GitHub Actions** lehetőséget kell kiválasztani.

A GitHub Pages által visszaadott alapútvonalat a build átveszi, így a `https://felhasznalo.github.io/tarolonev/` cím és az egyéni domain is használható. A személyes JSON-fájlt ne add a tárolóhoz. A tesztek mesterséges adatokkal is futnak; a személyes mentésre épülő 11 helyi teszt annak hiányában kimarad.

Helyi próba GitHub Pages útvonallal PowerShellben:

```powershell
$env:DEPLOY_TARGET='github-pages'
$env:NEXT_PUBLIC_BASE_PATH='/edzesnaplom'
npm run build
```

A Pages-felület általában nyilvános; a program nem tölt fel edzésadatokat. Az új webcímen a böngésző külön helyi naplót használ, ezért a korábbi webappból exportált JSON-t egyszer be kell tölteni. A jelenlegi Sites-oldal ettől változatlanul megmarad.
A GitHub Pages build kész csomagja a `dist/pages` könyvtárba kerül. A build az assetPrefix alapján hivatkozza a fájlokat, majd a Pages számára igazítja a könyvtárszerkezetet. A helyi ellenőrzés 15 sikeres adatkezelési tesztet, TypeScript-ellenőrzést és a Pages útvonalaihoz tartozó fájlok ellenőrzését tartalmazza; tényleges GitHub-közzététel bejelentkezés után végezhető el.
