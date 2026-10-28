// Trinenes tekster. Matematik skrives i $…$ (LaTeX).
//   title  – vises altid i trinboksen
//   instr  – betjening af appen; vises altid på det aktive trin
//   guide  – sproglig guide med fagbegreber; vises kun når guiden er slået til
//   prefix – står foran svarfeltet (kun udtrykstrin)
//   prefill – svarfeltet starter med svaret fra forrige trin
import { checks } from './checks.js'

export const STEPS = [
  {
    n: 1,
    kind: 'build',
    title: 'Placér trekanterne i skabelonen',
    instr:
      'Træk de fire trekanter ind i det store kvadrat. Markér en trekant og drej den med knapperne under figuren, eller dobbeltklik på den. Den klikker på plads, når den vender rigtigt.',
    guide:
      'De fire trekanter er ens og retvinklede med kateterne $a$ og $b$ og hypotenusen $c$. Læg dem, så kateterne ligger langs det store kvadrats sider, og hypotenuserne danner siderne i det lille kvadrat.',
    doneText: 'Et stort kvadrat med sidelængden $a+b$ og et lille kvadrat med sidelængden $c$.',
  },
  {
    n: 2,
    kind: 'expr',
    title: 'Arealet af det lille kvadrat',
    prefix: 'A_{\\text{lille}} =',
    guide:
      'Siderne i det lille kvadrat er trekanternes hypotenuser, så sidelængden er $c$. Arealet af et kvadrat er sidelængden i anden.',
  },
  {
    n: 3,
    kind: 'expr',
    title: 'Arealet af det store kvadrat',
    prefix: 'A_{\\text{stor}} =',
    guide:
      'Hver side i det store kvadrat består af en katete $a$ og en katete $b$. Skriv arealet med parentes – den skal ikke ganges ud endnu.',
  },
  {
    n: 4,
    kind: 'expr',
    title: 'Arealet af én trekant',
    prefix: 'A_{\\text{trekant}} =',
    guide:
      'Kateterne står vinkelret på hinanden og kan bruges som grundlinje og højde. Trekanten er det halve af et rektangel med siderne $a$ og $b$.',
  },
  {
    n: 5,
    kind: 'eq',
    title: 'Opstil ligningen $A_{\\text{lille}} = A_{\\text{stor}} - 4\\cdot A_{\\text{trekant}}$',
    instr: 'Skriv hele ligningen med lighedstegn.',
    guide:
      'Det lille kvadrat er det, der er tilbage af det store kvadrat, når de fire trekanter fjernes. Indsæt dine udtryk fra trin 2–4 i ligningen.',
  },
  {
    n: 6,
    kind: 'eq',
    prefill: true,
    title: 'Gang parentesen ud',
    instr: 'Din ligning fra forrige trin står i feltet – ret den til.',
    guide:
      'Brug 1. kvadratsætning til at skrive $(a+b)^2$ som en sum af tre led. Resten af ligningen skrives af.',
  },
  {
    n: 7,
    kind: 'eq',
    prefill: true,
    title: 'Udregn $4\\cdot\\tfrac12 ab$',
    instr: 'Din ligning fra forrige trin står i feltet – ret den til.',
    guide: 'Gang talfaktorerne sammen, så leddet står som ét tal gange $ab$.',
  },
  {
    n: 8,
    kind: 'eq',
    prefill: true,
    title: 'Reducér: $2ab - 2ab$ forsvinder',
    instr: 'Din ligning fra forrige trin står i feltet – ret den til.',
    guide:
      'Leddene $2ab$ og $-2ab$ er modsatte og ophæver hinanden. Skriv den reducerede ligning.',
  },
].map((s) => ({ ...s, check: checks[s.n] }))
