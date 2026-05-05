# Expense Tracker AI

A Next.js 14 expense tracker with AI capabilities. Track income and expenses with multi-currency support (USD, RUB), localStorage persistence, and data export features.

## Features

- **Income & Expense Tracking** — Add, edit, and delete transactions with categories
- **Multi-Currency Support** — Track amounts in USD and RUB with automatic formatting
- **Dashboard Analytics** — View spending charts, category breakdowns, and monthly trends
- **Filtering System** — Filter by date range, category, currency, and transaction type
- **Data Export** — Export filtered data to CSV, JSON, or PDF formats
- **Persistent Storage** — All data stored in localStorage

## Setup

```bash
npm install
```

## Commands

```bash
npm run dev      # Start development server
npm run build    # Production build
npm start        # Start production server
npm run lint     # Lint code
npm run test     # Run tests
npm run test:run # Run tests once
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: React Context with localStorage persistence
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **PDF Export**: jsPDF with jspdf-autotable
- **Testing**: Vitest with jsdom