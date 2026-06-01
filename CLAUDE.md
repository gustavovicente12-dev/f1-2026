# F1 2026 Dashboard — Guía para Claude Code

## Setup inicial
```bash
npm install
cp .env.example .env
# Completar SUPABASE_URL y SUPABASE_ANON_KEY en .env
```

## Base de datos
1. Ir a Supabase → SQL Editor
2. Ejecutar el contenido de `db/schema.sql`
3. Luego correr: `npm run seed`

## Desarrollo
```bash
npm run dev   # nodemon con hot reload
npm start     # producción
```

## Estructura
```
f1-2026/
├── server.js              Express app principal
├── db/
│   ├── supabase.js        Cliente Supabase
│   ├── schema.sql         Crear tablas (correr en Supabase)
│   └── seed.js            Poblar datos (npm run seed)
├── routes/
│   ├── drivers.js         GET /api/drivers
│   ├── constructors.js    GET /api/constructors
│   ├── calendar.js        GET /api/calendar
│   ├── results.js         GET /api/results
│   ├── news.js            GET /api/news
│   └── stats.js           GET /api/stats
└── public/
    ├── index.html         SPA principal
    ├── css/style.css      Todos los estilos
    └── js/
        ├── app.js         Lógica principal + render
        └── chart.js       Gráfico SVG de evolución
```

## API Endpoints
- GET /api/health        → test conexión Supabase
- GET /api/drivers       → standings pilotos
- GET /api/constructors  → standings constructores
- GET /api/calendar      → calendario completo
- GET /api/results       → resultados por carrera
- GET /api/news          → noticias
- GET /api/stats         → hero data (líder, próxima carrera, etc.)

## Paleta de colores
- Fondo: #0a0a0f
- Surface: #111118
- Surface2: #1a1a24
- Rojo F1: #E10600
- Cyan: #00D2FF
- Gold: #FFD700
- Texto: #e8e8e8
- Muted: #666680

## Tipografías (Google Fonts)
- Bebas Neue → títulos y números grandes
- Inter → cuerpo
- JetBrains Mono → badges y código

## Colores de equipos
- Mercedes: #00D2BE
- Ferrari: #E8002D
- McLaren: #FF8000
- Red Bull: #3671C6
- Alpine: #0093CC
- Haas: #B6BABD
- Racing Bulls: #6692FF
- Williams: #00A3E0
- Audi: #BB86FC
- Aston Martin: #358C75
- Cadillac: #9E9E9E

## Secciones del frontend (8 tabs)
1. RESUMEN — hero + standings resumidos
2. RESULTADOS — 4 GPs con sub-tabs carrera/sprint
3. PILOTOS — standings + cards de perfil
4. CONSTRUCTORES — ranking con barras proporcionales
5. EVOLUCIÓN — gráfico SVG líneas (acumulado/por carrera)
6. NOTICIAS — grid de cards con tags coloreados
7. CALENDARIO — lista con estados visuales
8. REGLAMENTO — cards informativas 2026

## Notas importantes
- Todos los datos son ficticios (temporada alternativa 2026)
- El gráfico de evolución usa SVG puro sin librerías externas
- Responsive: 3 cols → 2 cols → 1 col
- race_points tiene columnas: australia, china, japan, miami (agregar más conforme avance la temporada)
