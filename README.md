# Pythagoras' sætning – interaktivt bevis

Eleverne lægger fire ens retvinklede trekanter i en skabelon (et stort og et lille kvadrat) og regner sig derefter frem til $c^2 = a^2 + b^2$ i otte trin:

1. Placér trekanterne i skabelonen (træk og drej 90°)
2. Arealet af det lille kvadrat: $c^2$
3. Arealet af det store kvadrat: $(a+b)^2$
4. Arealet af én trekant: $\tfrac12 ab$
5. Opstil ligningen $A_{lille} = A_{stor} - 4\cdot A_{trekant}$
6. Gang parentesen ud
7. Udregn $4\cdot\tfrac12 ab$
8. Reducér: $2ab - 2ab$ forsvinder

Ved start vælges **med sproglig guide** (forklaringer med fagbegreber og målrettede hint ved fejl) eller **uden guide** (kun overskrifter; hint kan hentes efter to forkerte forsøg). Guiden kan slås til og fra undervejs.

Eleven skriver selv udtrykkene. Appen tjekker, om svaret er matematisk korrekt, og om det står på den form, trinnet beder om (fx at $(a+b)^2$ ikke er ganget ud i trin 3).

## Læg appen på Vercel

1. Pak zip-filen ud.
2. Opret et nyt repository på GitHub, og upload **indholdet** af mappen `pythagoras-bevis` (så `package.json` ligger øverst i repoet). Mappen `node_modules` skal ikke med.
3. Gå til [vercel.com](https://vercel.com) → **Add New… → Project** → vælg repoet → **Deploy**.
   Vercel genkender selv Vite (build: `npm run build`, output: `dist`).

Hver gang du ændrer noget i repoet, bygger Vercel automatisk en ny version.

## Kør lokalt (valgfrit)

```bash
npm install
npm run dev      # åbner på http://localhost:5173
npm test         # tester svarkontrollen
```

## Hvor ændrer jeg hvad?

| Fil | Indhold |
|---|---|
| `src/lib/steps.js` | Trinenes overskrifter, guidetekster og betjeningsvejledning |
| `src/lib/checks.js` | Svarkontrol og hint for hvert trin |
| `src/lib/geometry.js` | Trekantens kateter (`A = 2`, `B = 3`) |
| `src/styles.css` | Farver og layout |

Matematik i teksterne skrives i LaTeX mellem `$…$`.

## Hvad eleven kan skrive

- Potens: `c^2` eller `c²`
- Gange: `*`, `·` eller intet tegn (`2ab`, `(a+b)(a+b)`)
- Brøk: `1/2`, `½` eller `0,5`
- Ligninger med `=` (siderne må gerne byttes om)

Under feltet vises, hvordan appen har læst svaret, og der er et lille tastatur med symbolerne til tablets.
