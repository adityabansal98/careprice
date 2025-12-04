# CarePrice - Healthcare Price Comparison Tool

A modern web application that allows users to estimate and compare the cost of medical procedures across different hospitals based on their specific insurance provider.

## Features

- 🔍 **Procedure Search**: Search by procedure name or CPT code with autocomplete
- 📍 **Location-Based**: Find hospitals near your ZIP code
- 💰 **Price Comparison**: Compare cash prices and insurance-negotiated rates
- 🏥 **Hospital Details**: View ratings, distance, and price confidence scores
- 📊 **Smart Sorting**: Sort by price, distance, or hospital rating

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Icons**: Lucide React
- **Components**: Custom shadcn/ui-style components

## Getting Started

### Prerequisites

- Node.js 18.17 or later
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd CareCompare
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── globals.css         # Global styles
│   ├── layout.tsx          # Root layout
│   └── page.tsx            # Main page component
├── components/             # React components
│   ├── ui/                 # Base UI components
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   └── select.tsx
│   ├── HospitalCard.tsx    # Individual hospital result
│   ├── ResultsList.tsx     # Results container with sorting
│   └── SearchForm.tsx      # Search form with autocomplete
├── data/                   # Mock data
│   ├── hospitals.json      # Hospital pricing data
│   └── procedures.json     # Medical procedures
├── lib/                    # Utility functions
│   ├── search.ts           # Search logic
│   └── utils.ts            # Helper functions
└── types/                  # TypeScript types
    └── index.ts
```

## Mock Data

The application uses mock JSON data to simulate hospital pricing:

### Procedures
- MRI Lumbar Spine (72148)
- MRI Brain (70553)
- Chest X-Ray (71046)
- Comprehensive Metabolic Panel (80053)
- Complete Blood Count (85025)
- MRI Knee (73721)
- Upper GI Endoscopy (43239)
- Knee Arthroscopy (29881)

### Insurance Providers
- Aetna
- Blue Cross Blue Shield (BCBS)
- UnitedHealthcare (UHC)
- Cigna
- Humana

## Usage

1. **Search for a procedure**: Type in the search box (e.g., "MRI" or "72148")
2. **Enter your ZIP code**: Input your 5-digit ZIP code
3. **Select your insurance**: Choose your provider or "Cash Price"
4. **Compare results**: View and sort hospital results

## Price Logic

- If a user's insurance matches available rates, the negotiated rate is shown
- If no matching insurance rate exists, the cash price is displayed
- Confidence scores are calculated based on data freshness

## License

MIT

