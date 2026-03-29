# MTG Arena Web App

A feature-rich, frontend-only web application for Magic: The Gathering Arena players.

## Features

- 🃏 **Deck Builder** — Build and manage decks with card search powered by the Scryfall API
- 📦 **Collection Tracker** — Track your card collection and identify missing wildcards
- 🎲 **Draft Simulator** — Practice drafting with simulated packs from Arena sets
- 📊 **Meta Dashboard** — Browse tier lists and win-rate stats for the current Arena meta

## Tech Stack

- **React 18** with React Router v6
- **Zustand** for global state management (decks, collection)
- **Recharts** for meta stats/charts
- **Scryfall API** for card data and images (free, no key required)
- **localStorage** for persisting decks and collection between sessions

## Getting Started

```bash
# Install dependencies
npm install

# Start dev server
npm start

# Build for production
npm run build
```

## Project Structure

```
src/
├── components/
│   ├── layout/       # Navbar, Sidebar
│   ├── deck/         # DeckBuilder, DeckCard, DeckStats
│   ├── collection/   # CollectionView, CardGrid, CardFilter
│   ├── draft/        # DraftSimulator, DraftPack, DraftPick
│   └── meta/         # MetaDashboard, TierList, WinRateChart
├── pages/            # Route-level page components
├── hooks/            # Custom React hooks (Scryfall, deck, collection, draft)
├── utils/            # API helpers and utility functions
└── styles/           # Global styles and CSS variables
```

## Data Sources

- **Card data & images**: [Scryfall API](https://scryfall.com/docs/api) — free, no authentication required
- **Arena set list**: Filtered from Scryfall's set catalog using Arena-legal sets
- **Meta stats**: Seeded from community sources (customizable — see `src/utils/metaData.js`)

## License

MIT
