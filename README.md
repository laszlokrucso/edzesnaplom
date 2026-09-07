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

## Gyakorlatcsere és ajánlások

Aktív vagy szerkesztett edzésben a gyakorlat melletti **Csere** megnyitja az alternatívákat. A lista eszköz szerint szűrhető; minden találat jelzi a mozgáscsaládot, az eszközt, a saját előzmény elérhetőségét és az észlelt végrehajtási különbségeket. Az **Összes gyakorlat** nézetben kézi választás is lehetséges. Az edzésben már szereplő gyakorlat nem választható ismét.

A csere előtt előnézet jelzi, hány sorozat cserélődik le. Kizárólag a kiválasztott új gyakorlat legutóbbi saját súlyai és ismétlései kerülnek be; előzmény nélkül üres sorozatot kell kitölteni. Az eredeti gyakorlat teljes tartalma a következő módosításig visszavonható. A sablon, más gyakorlatok, előzmények és a kompatibilis export szerkezete változatlan marad. A visszavonási állapot csak az aktuális böngészőmunkamenetben él; újratöltés után nem áll rendelkezésre.

Az ajánlás determinisztikus, név és izomcsoport alapján működő szabályrendszer. Hasonló mozgáscsaládon belül a testhelyzet, az egy-/kétoldalas végrehajtás, az izomcímkék és a saját előzmény alakítja a sorrendet. Nem személyre szabott edzésterv és nem állít azonos hatékonyságot vagy azonos használható súlyt. Ismeretlen mozgásnál nincs automatikus ajánlás. A névből nem biztosan megállapítható eszközt ismeretlenként jelöli.

Az általános szemlélet szakmai háttere: [NASM: Chest Press Machine](https://www.nasm.org/resource-center/exercise-library/chest-press-machine), különösen a nyomó változatok és a gépi/szabadsúlyos megtámasztás különbsége. A teljes helyettesítési szabályrendszer saját implementáció; nem a NASM által ellenőrzött ajánló.

A cserefunkcióhoz 10 új automatizált teszt készült: mozgás szerinti szűrés, eszközök, ismeretlen gyakorlat, saját előzmény, érvénytelen/ismételt választás, visszavonás, adatmegőrzés és v2 export/import. A teljes helyi csomag 25 tesztje sikeres. A funkciót valódi telefonos edzés közben még nem próbáltuk.

## Sorrend, teljesítés, pihenő és visszavonás

- A gyakorlatok az edzésben és a sablonokban is rendezhetők a fogantyú húzásával, valamint fel/le gombokkal. A pipák a megfelelő gyakorlatokkal együtt mozognak. Az edzés közbeni rendezés nem írja át a sablont; a **mostani sorrend mentése sablonba** művelet csak kifejezett választásra teszi ezt meg, egyező gyakorlatlistánál.
- Új edzésben a korábbi sorozatok csak javaslatok. A **Kész** jelölést kézzel kell bekapcsolni, érvényes értékekkel. Lezáráskor kizárólag a kipipált sorozatok kerülnek a naplóba; a ki nem pipáltak kihagyásáról az app megerősítést kér. A már lezárt edzés szerkesztése kész állapottal indul.
- Frissítéskor a régebbi folyamatban lévő edzés értékei megmaradnak, de az app nem találja ki, melyik sorozat történt meg: ezeket egyszer kézzel meg kell jelölni. A már lezárt edzések változatlanok.
- Sorozat kipipálásakor automatikusan indulhat a pihenő. Ez kikapcsolható, és gyakorlatonként külön pihenő is beállítható. A határidő abszolút időpontként tárolódik, ezért az újratöltés vagy a háttérbe helyezés nem indítja újra. A lejárati jelzés az edzésnézetben működik; nem rendszerértesítés. A mobil böngészők háttérfutása és rezgésjelzése eltérhet.
- Sorozat-/gyakorlattörlés, sorrendcsere, gyakorlatcsere, edzéslezárás és elvetés után az előző teljes állapot a visszavonás gombbal visszaállítható. Egy lépés őrződik meg az aktuális munkamenetben, a következő mentett módosításig. A gomb a képernyő alján is látható.
- Öt különböző új vagy módosított, elmentett edzés után exportemlékeztető jelenik meg. Elhalasztható a következő edzésig; egy JSON-export újrakezdi a számlálást. A mentés fülön az utolsó export és a még nem exportált edzések száma is látszik. A számlálás a frissítés/import utáni változtatásoktól indul, a régi edzéseket nem számolja újként.

A helyi boríték `meta` mezőjében élnek a pipák, a pihenőbeállítások és az emlékeztető. Ezek nem kerülnek a kompatibilis v2 JSON-exportba. Az import előtti helyi visszaállítási pont viszont a teljes helyi állapotot megőrzi. Az új állapotkezeléshez 14 teszt került be; a teljes helyi csomag 39 tesztje sikeres. Éles építés és TypeScript-ellenőrzés készül; valódi telefonos húzásos és kattintásos próba még nem történt.
