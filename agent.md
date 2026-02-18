Project: Minecraft Tycoon Optimizer (The "Vindicator" Calc)
1. Role & Objective

You are an expert Senior Full-Stack Engineer specializing in Next.js 14+ (App Router), TypeScript, and Tailwind CSS.

Your goal is to build a high-performance, visually stunning "dark mode" calculator for a Minecraft server economy. The application must calculate ROI (Return on Investment), compound interest (reinvesting), and "Island Level" efficiency based on specific server constraints.
2. Core Game Logic (The Math)

The application must handle the following constants as defaults, but allow the user to edit them in a "Settings" slide-over:

Assets:

    Vindicator Spawner (The Engine)

        Cost: $67,000,000

        Output: $26,161.38 per 4 minutes.

        Derived Rate: ~$6,540.345 per minute.

    Lodestone (The Sink/Prestige)

        Cost: $7,500,000

        Output: 300,000 Island Levels.

Constraints:

    Server Balance Cap: $10,000,000,000,000 (10 Trillion).

Calculators Required:

    Simple ROI: How long to break even on 1 Spawner? (Time = Cost / Rate).

    Time to Cap: Given X current spawners, how long to hit 10T balance?

    Compound Growth (The "Snowball"): If I immediately reinvest earned money into more Spawners, how does my income curve look over 24 hours / 7 days?

    Level Converter: How much money is required to reach Y Island Level (buying Lodestones), and how long will it take to generate that money with current Spawners?

3. Tech Stack & Requirements

    Framework: Next.js 14 (App Router).

    Language: TypeScript.

    Styling: Tailwind CSS.

    UI Components: Shadcn UI (Card, Slider, Input, Switch, Button, Dialog).

    Icons: Lucide-React.

    Charts: Recharts (for visualizing the exponential growth of money/spawners).

    State Management: Zustand (preferred) or React Context to hold the "User State" (Current Balance, Current Spawner Count, Current Island Level).

    Deployment: Optimized for Cloudflare Pages (static export or edge runtime).

4. Design System ("The Vibe")

    Theme: "Cyber-Minecraft". Deep blacks (#09090b), slate grays, and neon accent colors (Emerald Green for money, Purple for Island Levels).

    Font: Inter for UI, JetBrains Mono for numbers/data.

    Aesthetics: Glassmorphism effects on cards, subtle gradients, crisp borders.

5. File Structure Specification

Please implement the solution using this structure:
Plaintext

/src
  /components
    /calculators
      - SpawnerRoiCard.tsx      # Simple ROI stats
      - CompoundGrowthChart.tsx # Recharts graph showing money/spawners over time
      - LodestonePlanner.tsx    # Slider to convert Money -> Levels
    /ui
      - ... (Shadcn components)
    - Dashboard.tsx             # Main grid layout
    - SettingsPanel.tsx         # Edit the costs/rates
  /lib
    - calculations.ts           # Pure functions for the math logic
    - store.ts                  # Zustand store for user inputs
  /app
    - layout.tsx                # Dark mode provider
    - page.tsx                  # Landing page

6. Step-by-Step Implementation Plan
Step 1: The Calculation Engine (/lib/calculations.ts)

Create pure functions to handle the logic.

    calculateProfitPerMinute(spawnerCount, ratePer4Min)

    calculateTimeToGoal(goalAmount, currentBalance, profitPerMinute)

    simulateCompoundGrowth(startSpawners, durationHours): This needs to simulate a loop where every time balance >= spawnerCost, we buy a spawner, increasing the rate for future ticks.

Step 2: The State Store (/lib/store.ts)

Use Zustand to manage:

    spawnerCost (Default: 67,000,000)

    spawnerRevenue (Default: 26,161.38)

    revenueInterval (Default: 4 mins)

    lodestoneCost (Default: 7,500,000)

    lodestoneValue (Default: 300,000)

    balanceLimit (Default: 10,000,000,000,000)

    currentSpawners (User Input)

    currentBalance (User Input)

Step 3: The UI Components

    Header: Simple logo "VindicatorCalc".

    Input Section: Two big input fields for "Current Spawners" and "Current Balance".

    Stats Grid:

        $/Hour (calculated).

        $/Day (calculated).

        Time to next Spawner (countdown format).

        Max Possible Levels (Current Balance / Lodestone Cost * Level Value).

    Chart Section: A line chart showing two lines:

        Linear: Money generated if you just save.

        Exponential: Money generated if you reinvest every time you can afford a spawner.

Step 4: Cloudflare Deployment Configuration

Create a next.config.js optimized for static export if no server-side features are used, or configure for Edge runtime.

    Add output: 'export' to next.config.js (simplest for Cloudflare Pages).

    Ensure images: { unoptimized: true }.

7. Deployment Instructions (for the User)

Once the code is generated, run these commands to deploy:

    Push to GitHub:
    Bash

    git init
    git add .
    git commit -m "Initial commit"
    git branch -M main
    git remote add origin <your-repo-url>
    git push -u origin main

    Deploy on Cloudflare:

        Go to Cloudflare Dashboard > Workers & Pages.

        Create Application > Connect to Git.

        Select the repo.

        Framework Preset: Next.js (Static).

        Build Command: npm run build.

        Output Directory: out.