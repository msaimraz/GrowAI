# GrowAI — AI-Powered Vertical Gardening Platform

GrowAI is a production-grade, AI-assisted home gardening and vertical farming platform designed for beginners and experienced urban growers.

It empowers growers to discover compact crops, learn accurate agronomic timelines, track developmental growth stages, plan multi-tiered vertical racks, and implement closed-loop sustainable 3R (Reduce, Reuse, Recycle) practices.

---

## 🌿 Core Features

1. **Curated Plant Library & Botanical Index (`/app/plants` & `/app/plants/[slug]`)**
   - 16 verified species across 6 categories (Vegetables & Fruits, Herbs & Leafy Greens, Indoor & Decorative, Flowering, Traditional Medicinal & Aromatic, Microgreens).
   - Real-world temperature ranges in Celsius, light requirements, moisture levels, soil recipes, pot depths, and spacing.
   - Accurately segmented growth timelines: germination, seedling establishment, first harvest, and maturity horizons.
   - Sourced references from agricultural extensions; clear distinction between verified and unknown values.

2. **Interactive Plant Growth Tracker (`/app/my-garden`)**
   - Onboard plants from the library with custom nicknames, locations, and vertical tiers.
   - Advance plants across 6 standardized developmental stages: *Seed*, *Germination*, *Seedling*, *Growing*, *Mature*, and *Harvested*.
   - Record dated botanical notes with measured height benchmarks (cm).
   - Check off daily and weekly care tasks (watering, pruning, feeding, harvesting).
   - Local demo state safely maintained in browser storage with single-click reset capability.

3. **Vertical Garden Rack Planner (`/app/planner`)**
   - Interactive 3-tier visual planner (Top Tier: high-light sun lovers; Middle Tier: partial-sun herbs & greens; Bottom Tier: shade-tolerant root crops & heavy pots).
   - Slot capacity controls, light and weight distribution guidance, and direct links to botanical specifications.
   - Transparent conceptual disclaimer regarding structural load and irrigation certifications.

4. **AI Plant Doctor (`/app/ai-doctor`)**
   - Diagnostic evaluation tool for inspecting chlorosis (yellowing), powdery mildew, tipburn, and insect pests.
   - Provides probable causes, physical validation checks, immediate corrective steps, and non-toxic organic remedies.
   - Built behind a secure Next.js API route (`/api/ai-doctor`).
   - Honest demonstration disclosure regarding agronomic rulebase heuristics before multimodal vision API connection.

5. **Gardening Education & Sustainability (`/app/learn`)**
   - The 5 Growth Essentials: Water, Sunlight, Air, Nutrients, Space.
   - The 4-phase Botanical Life Cycle from seed embryo to harvest.
   - The 3Rs of Sustainable Urban Agriculture:
     - **Reduce**: Precision bottom-watering and runoff recycling.
     - **Reuse**: Upcycling food-grade HDPE/PP containers with drainage.
     - **Recycle**: Odorless balcony 2:1 carbon-to-nitrogen vermicomposting.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router, Turbopack, React 19)
- **Language**: TypeScript (Strict Mode)
- **Styling**: Tailwind CSS v4 with bespoke botanical design tokens
- **Icons**: Lucide React
- **Architecture**:
  - `src/lib/storage.ts` — Client state persistence with typed data abstraction
  - `src/lib/supabase.ts` — Clean integration boundary for future Supabase Auth & PostgreSQL sync
  - `src/lib/payload.ts` — Decoupled content boundary for future Payload CMS species management
  - `src/lib/ai-doctor.ts` & `src/app/api/ai-doctor/route.ts` — Server-side AI diagnostic boundary
  - `public/manifest.json` — PWA readiness configuration

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18.17+ or 20+ (tested on Node v25)
- npm 9+ or pnpm / yarn

### Installation

1. Clone or navigate into the repository:
   ```bash
   cd GrowAI
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env.local
   ```
   *(Note: The application runs completely in local demo mode without external API keys).*

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Build and Verification

- **Type Checking**:
  ```bash
  npx tsc --noEmit
  ```

- **Production Build**:
  ```bash
  npm run build
  ```

- **Run Production Server**:
  ```bash
  npm run start
  ```

---

## 🔐 External Services & Next Steps

GrowAI is engineered with clean architectural boundaries to prevent coupling or database schema collisions:

1. **Supabase (Phase 2)**:
   - Boundary defined in `src/lib/supabase.ts`.
   - Planned for user authentication and synchronizing user garden logs, growth notes, and care tasks.
   - To connect: Provide `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local`.

2. **Payload CMS (Phase 2)**:
   - Boundary defined in `src/lib/payload.ts`.
   - Planned for editorial botanical curation, educational articles, and seasonal growing calendars.
   - Does NOT share or mutate user garden tables in Supabase.
   - To connect: Provide `PAYLOAD_CMS_URL` and `PAYLOAD_API_TOKEN` in `.env.local`.

3. **Multimodal AI Vision (Phase 2)**:
   - Route handler defined in `src/app/api/ai-doctor/route.ts`.
   - Planned for connecting Gemini 1.5 Flash / Pro multimodal vision API.
   - Keeps private API keys strictly on the server (`AI_VISION_API_KEY`).

---

## 📄 License

MIT License. Designed for home gardeners and vertical farming communities.
