# HarmonicRealm AI Coding Agent Instructions

**Project:** Location-based Pi Network mining game with cosmic gamification, Inngest-powered workflows, and Stellar payments integration. Built with Next.js 15, Prisma, TanStack Query, and MapLibre GL.

## Architecture Overview

### Core Data Layers

- **Prisma ORM** (`lib/prisma.ts`): PostgreSQL database with adaptive connection pooling (PrismaPg for dev, PrismaNeon for prod)
- **API Responses**: Standardized wrapper via `ApiResponse<T>` in `lib/schema/api.ts` - always follow this pattern
- **Environment**: Type-safe config via `env.ts` (T3 env validation) - server vs client variables are strictly separated

### App Structure (Next.js 15 App Router)

- **`(auth)`**: Login/signup via Pi Network SDK (`useAuth()` context in `components/shared/auth/auth-context`)
- **`(game)`**: Protected routes requiring location data; sub-routes include:
  - `dashboard`: User stats, phase progress, quick actions
  - `map`: MapLibre GL-based node visualization with `nuqs` URL search params
  - `resonant-anchors`, `lore-stakes`: Payment/staking flows
  - `nodes`, `lore`, `awakening-contributions`: Game content
- **`(marketing)`**: Public landing page
- **`api`**: Route handlers for auth, payments, Inngest webhooks, profile endpoints

### Event-Driven System (Inngest)

**Dispatcher Pattern** (`inngest/dispatcher.ts`):

```typescript
InngestEventDispatcher.startLoreGeneration(nodeId, level, jobId);
InngestEventDispatcher.processPayment(paymentId, userId, amount, metadata);
InngestEventDispatcher.sendAppToUserPayment({
  amount,
  memo,
  modelId,
  uid,
  type,
});
```

Workflows live in `inngest/workflows/` folders (achievements, location-lores, payments, phases). Events are type-safe via `Events` union in `inngest/events.ts`.

## Critical Development Patterns

### Server Actions & Data Mutations

- **Location:** `actions/` (anchor/mining/calibration/echo/payments folders)
- **Pattern:** `"use server"` functions returning `ApiResponse<T>`, validate input with Zod schemas from `lib/schema/`
- **Example:** `actions/mining/start-mining-session.ts` - validates user location, checks node capacity, creates session, then `revalidatePath()`
- **Auth:** All use `verifyTokenAndGetUser(accessToken)` from `lib/api-helpers/server/users`

### Client-Side Data Fetching (TanStack Query)

- **Queries:** Defined in `hooks/queries/` (e.g., `use-profile.ts`, `use-mining-session-assets.ts`)
- **Setup:** Provider in `components/shared/tanstack-query/provider.tsx` wraps `RootLayout`
- **Config:** `staleTime: 60s`, `refetchInterval: 10min`, custom retry logic for 401 errors
- **Key Pattern:**

```typescript
export function useProfile() {
  const { isAuthenticated, accessToken } = useAuth();
  const query = useQuery({
    queryKey: ["profile", accessToken],
    enabled: isAuthenticated && !!accessToken,
    // Auth error handling blocks retries
  });
  return { ...query, refreshProfile: () => queryClient.invalidateQueries(...) };
}
```

### Form Submission Flow

- **Client:** `react-hook-form` + `zodResolver` + Zod schema from `lib/schema/`
- **Mutation:** Use `useTransition()` to call server action, handle `toast()` feedback (Sonner)
- **Pattern:** Form validates client-side, calls server action, displays result via toast
- **Reference:** `app/(game)/resonant-anchors/_components/anchoring-form.tsx`

### URL Search Params Management

- **Library:** `nuqs` for type-safe URL state (not `useSearchParams`)
- **Setup:** Define parsers in route `search-params.ts` (e.g., `app/(game)/map/search-params.ts`)
- **Hook:** Custom hook wraps `useQueryStates()` with `startTransition` (e.g., `use-map-search-params.ts`)
- **Usage:** Updates search params without page reload, syncs client state with URL

### Schema & Type Generation

- **Location:** `lib/schema/` contains Zod validators for mining, calibration, lore, anchors, user profiles
- **Pattern:** Export both Zod schema AND inferred TypeScript type: `export type UserProfile = z.infer<typeof UserProfileSchema>`
- **Prisma Models:** Auto-generated in `lib/generated/prisma/`, include type-safe enums (SessionStatus, PaymentStatus)

### Component Organization

- **Server Components (default):** Page layouts, data fetching, SEO metadata
- **Client Components:** Forms, interactivity, context consumers (`useAuth()`, `useProfile()`)
- **Naming:** `_components/` folder for private route-level components, `[id]/_components/` for detail pages
- **Pattern:** Page fetches data server-side → passes to client component via props for interactivity
- **Example:** `app/(game)/awakening-contributions/[id]/page.tsx` (server) → `ContributionDetailClient` (client with hooks)

## Location & Geolocation

- **Range Check:** Mining requires user ≤100m from node (configurable via `MINING_RANGE_METERS` in `config/site.ts`)
- **Utility:** `calculateDistance()` in `lib/utils` uses haversine formula
- **Permission:** Requests via `getUserLocation()` in client components, updates stored in `MiningSession`
- **Binning:** Contributions stored with `latitudeBin`/`longitudeBin` for privacy-preserving aggregation

## Pi Network & Payment Integration

- **SDK:** Pi JavaScript SDK initialized via `useAuth()` context, accessed in components
- **Payment Types:** `MINING_REWARD`, `STAKING_REWARD`, `DAILY_BONUS`, etc. (enums in Prisma schema)
- **Inngest Event:** `InngestEventDispatcher.processPayment()` triggers webhook for Stellar transfers
- **Metadata:** `PiMetadata` type includes nodeId, userId, reason (used for auditing)

## Database & Migration Patterns

- **Generator:** Prisma generates client in `lib/generated/prisma/` (custom output path)
- **JSON Types:** `prisma-json-types-generator` creates type-safe Decimal and JSON serialization
- **Decimal Fields:** Use `.toNumber()` when serializing for JSON responses (e.g., `piCost.toNumber()`)
- **Connection:** Adapter selection in `lib/prisma.ts` based on `NODE_ENV` (dev uses PrismaPg, production uses PrismaNeon)

## Common Workflows

### Start Mining Session

1. Client calls `startMiningAction()` with location + accessToken
2. Server validates: auth, node exists, capacity not full, distance ≤100m, no active session
3. Creates `MiningSession` record
4. Returns `ApiResponse<MiningSession>` with session ID
5. Client refetches profile/sessions via TanStack Query invalidation

### Location Lore Generation

1. Triggered via stake payment or phase completion
2. `InngestEventDispatcher.startLoreGeneration(nodeId, level, jobId)` queues event
3. Inngest workflow in `inngest/workflows/location-lores/` runs AI generation (XAI/OpenRouter APIs)
4. Stores result with `CosmeticTheme`, `LoreGenerationResult` enums
5. Webhook triggers payment distribution via `app-to-user` event

### Payment Processing

1. User clicks "Stake" → selects Pi amount via Pi SDK
2. Verified payment triggers Inngest event via webhook
3. Workflow updates staking record, triggers lore generation if threshold met
4. Returns success/failure to frontend via TanStack Query refetch

## Build & Development

- **Dev Server:** `npm run dev` (runs with Turbopack)
- **Build:** `npm run build` (standard Next.js)
- **Lint:** `npm run lint` (ESLint via Next.js)
- **Migrations:** `prisma migrate dev --name <change_name>` (local), `prisma migrate deploy` (production)
- **Database:** Use `prisma studio` to inspect live data
- **Testing:** `npm run test` runs `coverage/index.ts` via tsx (custom test runner)

## Key Dependencies & Their Roles

- **maplibre-gl + react-map-gl**: Interactive map rendering with node clustering (`use-supercluster`)
- **Stellar SDK (@stellar/stellar-sdk)**: Blockchain payment integration
- **Turf.js**: Geographic calculations (circle queries, distance calculations)
- **Redis (Upstash)**: Session caching, rate limiting
- **Inngest**: Durable event workflows for async game logic
- **Zod**: Runtime validation + type inference

## Common Pitfalls to Avoid

1. **Auth Errors:** TanStack Query catches 401s and stops retries—don't add middleware that breaks this
2. **Decimal Precision:** Always use `Prisma.Decimal` in DB, convert to number for JSON only (can lose precision otherwise)
3. **Revalidation:** Call `revalidatePath()` after server actions that modify data, or TanStack Query may show stale data
4. **Search Params:** Use `nuqs` for type safety; plain `useSearchParams()` breaks on navigation
5. **Session Uniqueness:** Mining session uses composite key `userId_nodeId`—enforce one active session per user per node
