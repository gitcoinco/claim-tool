# Claim Tool

## Description
The Claim Tool is a web application for grant recipients to claim and delegate awarded tokens. It integrates with Hedgey API for token claims and Agora API for delegate information, providing a dashboard for grant metrics and delegation statuses.

## Quick Start

1. Clone and install:
   ```
   git clone https://github.com/gitcoinco/claim-tool.git
   cd claim-tool
   pnpm install
   ```

2. Run development server:
   ```
   pnpm dev
   ```

3. Build for production:
   ```
   pnpm build
   pnpm start
   ```

## Adding shadcn Components

1. Add a new component:
   ```
   npx shadcn@latest add [component-name]
   ```
   Example:
   ```
   npx shadcn@latest add button
   ```

2. Use the component in your code:
   ```typescript
   import { Button } from "@/components/ui/button";

   export default function MyComponent() {
     return <Button>Click me</Button>;
   }
   ```

## Technologies
- Next.js
- React
- Rainbow Kit
- wagmi
- viem
- Tailwind CSS
- shadcn/ui

## Scripts
- `pnpm dev`: Run development server
- `pnpm build`: Build for production
- `pnpm start`: Start production server
- `pnpm lint`: Run Biome linter
- `pnpm format`: Run Biome formatter

For more details, refer to the project documentation.
