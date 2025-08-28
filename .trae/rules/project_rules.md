# HarmonicRealm Development Rules

## Framework & Dependencies

- **Next.js 15** (App Router only, no Pages Router)
- **TypeScript** (strict mode required)
- **Prisma ORM** with PostgreSQL
- **shadcn/ui** + **Tailwind CSS** for styling
- **Zod** for validation schemas
- **Inngest** for workflows
- **Vercel AI SDK** for AI integration
- **Pi Network SDK** for Pi payments
- **LocationIQ SDK** for location services
- **React Hook Form** for form handling
- **Zod** for form validation
- **Sonner** for toast notifications
- **Tanstack Query** for data fetching and caching
- **Nuqs** for url search params states

## Core Patterns

### Database

```typescript
// Use Prisma client, always include error handling
const result = await prisma.model.findUnique({
  where: { id },
  include: { relationships: true },
});
```

### API Routes

```typescript
// app/api/[endpoint]/route.ts - Always validate input
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  /* validation */
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = schema.parse(body);
    // Process request
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

### Components

use server components for data fetching, except for client-side components that require interactivity. for dynamic data fetching, use client components with tantstack query (use zod for data validation and typing)
You can use the nuqs library for url search params states
Use client componets with react hook forms, server actions, zod and sonner for form validation and mutations

```typescript
// Use TypeScript interfaces for props
interface ComponentProps {
  required: string;
  optional?: number;
}

export function Component({ required, optional }: ComponentProps) {
  // Implementation
}
```

## Forbidden Patterns

❌ **NEVER use localStorage/sessionStorage** - Not supported in artifacts
❌ **No Pages Router** - App Router only
❌ **No default exports in API routes** - Use named exports
❌ **No unvalidated user input** - Always use Zod schemas

## File Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API endpoints
│   └── (dashboard)/    # Route groups
├── components/         # React components
│   └── ui/            # shadcn/ui components
├── lib/               # Utilities & services
│   ├── services/      # External integrations
│   └── validations/   # Zod schemas
└── types/             # TypeScript definitions
```

## Testing

- **Vitest** for unit tests
- **Playwright** for E2E tests
- Test files: `__tests__/` or `.test.ts`
- Mock external services in tests

## Specific Requirements

### Pi Network Integration

```typescript
// Always validate Pi payments server-side
const payment = await piPaymentService.verifyPayment(paymentId);
```

### Location Services

```typescript
// Cache LocationIQ responses, handle rate limits
const locationContext = await locationIQService.reverseGeocode(lat, lng);
```

### AI Content Generation

```typescript
// Use Vercel AI SDK with fallback providers
const { text } = await generateText({
  model: openai("gpt-4"),
  prompt: contextualPrompt,
  maxTokens: levelLimits[level],
});
```

### Database Queries

```typescript
// Always use proper indexing for geospatial queries
const nodes = await prisma.node.findMany({
  where: {
    latitude: { gte: lat - 0.1, lte: lat + 0.1 },
    longitude: { gte: lng - 0.1, lte: lng + 0.1 },
  },
});
```

## Error Handling

- Always wrap async operations in try-catch
- Use proper HTTP status codes
- Log errors for monitoring
- Provide user-friendly error messages

## Performance

- Use React Suspense for loading states
- Implement proper caching for external API calls
- Optimize database queries with proper includes
- Use Next.js Image component for optimized images

## Code Style

- Use descriptive variable names
- Prefer async/await over Promises
- Use TypeScript strict mode
- Follow ESLint configuration
- Use Prettier for formatting
