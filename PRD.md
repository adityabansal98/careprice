Product Requirements Document: CarePrice - Healthcare Price Comparison Tool

1. Executive Summary

Product Name: CarePrice
Objective: A web application that allows users to estimate and compare the cost of medical procedures across different hospitals in their vicinity based on their specific insurance provider.
Target Audience: Patients seeking price transparency for elective procedures (e.g., MRI, X-Rays, Lab tests).

2. Core User Flow

Landing Page: User arrives at a clean, search-focused homepage.

Search Inputs:

Procedure: User types a keyword (e.g., "MRI") or CPT code (e.g., "72148").

Location: User enters Zip Code or City (defaults to current location if allowed).

Insurance (Optional): User selects their Payer (e.g., "Aetna", "BlueCross", "UHC").

Insurance Plan Name (Optional): User selects their Plan Type: "PPO", "HMO"

System Logic: If no insurance is selected, show "Cash Price". If insurance is selected and no Plan is selected, show "Negotiated Range for Insurance". If insurance and plan both are selected show "Negotiated Range for Plan". 

Results Page:

List of hospitals matching the query.

Cards displaying: Hospital Name, Estimated Cost, Distance from User, and a "Confidence Score" (based on data freshness).

Sort options: Lowest Price, Closest Distance.

Detail View (Modal or Page):

Breakdown of the cost (Facility fee vs. Professional fee).

Historical price trend (optional MVP feature).

3. Technical Specifications

3.1 Tech Stack

Framework: Next.js 14 (App Router)

Styling: Tailwind CSS (Mobile-first design)

Components: Shadcn/UI (for polished tables, cards, and inputs)

Icons: Lucide React

State Management: React Hooks / Context API

Data Source (MVP): Local Mock JSON Data (Simulating a database)

3.2 Data Structure (Mock Schema)

To succeed in the MVP, we will not fetch live API data initially due to CORS/Auth complexity. We will use a robust mock dataset.

data/procedures.json

[
  {
    "cpt_code": "72148",
    "name": "MRI Lumbar Spine w/o Dye",
    "category": "Radiology"
  }
]


data/hospitals.json

[
  {
    "id": "hosp_001",
    "name": "General City Hospital",
    "zip": "10001",
    "prices": {
      "72148": {
        "gross_charge": 2500,
        "cash_price": 800,
        "insurance_rates": {
          "aetna": {
                "a": {
                    "min": 1200,
                    "max": 1300
                }
                "b": {
                    "min": 1240,
                    "max": 1350
                }
          }
          "bcbs": {
                "c": {
                    "min": 1200,
                    "max": 1300
                },
                "d": {
                    "min": 1200,
                    "max": 1300
                }
            }
          "uhc": {
            "e": {
                    "min": 1200,
                    "max": 1300
                },
            "f": {
                    "min": 1200,
                    "max": 1300
                }
          }
        }
      }
    }
  }
]


4. Functional Requirements

4.1 Search Component

Autocomplete: As user types "MRI", suggest "MRI Lumbar Spine (72148)".

Validation: Zip code must be 5 digits.

4.2 Comparison Logic

Price Calculation:

If UserInsurance matches hospital.prices[code].insurance_rates[payer].[plan_type], display that range.

If user doesn't enter plan and just the insurance name, the range should be min and maximum across all the plans for that hospital and insurance name.

Else, display cash_price with a label "Cash Price (Insurance rate unavailable)".

Sorting:

Default: Lowest Price.

Secondary: Distance (Mock distance logic: assume all zips starting with same 3 digits are "close").

5. UI/UX Guidelines

Theme: Medical, trustworthy (Blues, Teals, Whites).

Accessibility: High contrast text, proper ARIA labels for inputs.

Responsiveness: Results list must stack vertically on mobile.

6. Success Metrics (MVP)

User can successfully find a price for "MRI" in "10001".

User sees a price difference when toggling between "Cash Price" and "Aetna".