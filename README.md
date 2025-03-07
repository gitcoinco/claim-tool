# OP Claim Tool

## Description
The OP Claim Tool is a web application for Optimism grant recipients to claim and delegate awarded tokens. It integrates with Hedgey API for token claims and Agora API for delegate information, providing a dashboard for grant metrics and delegation statuses.

## Quick Start

1. Clone and install:
   ```
   git clone https://github.com/grants-stack-frontier/op-claim-tool.git
   cd op-claim-tool
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

## Testing
- For testing use sepolia
- [Mint PLBR token](https://eth-sepolia.blockscout.com/token/0xdF0A43D15B036c065f6895734B878fD31269Bfa3?tab=read_write_contract)
- Create a hedgey token grant
