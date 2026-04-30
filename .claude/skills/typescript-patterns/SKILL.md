---
name: typescript-patterns
description: TypeScript patterns for type safety, interfaces, and validation
---

# TypeScript Patterns

This project uses TypeScript with strict type checking. Follow these patterns for type safety and consistency.

## Interface vs Type

Use interfaces by default. Only use type aliases when you need specific type functionality that interfaces don't support.

### When to Use Interfaces

```tsx
// Do - Use interfaces for object shapes
interface ManuscriptPassage {
  text: string;
  startPosition: number;
  endPosition: number;
}

// Do - Use interfaces for component props
interface ButtonProps {
  variant: 'primary' | 'secondary';
  children: ReactNode;
  onClick?: () => void;
}

// Do - Use interfaces for extending
interface BaseStreamData {
  timestamp: string;
}

interface ChatStreamData extends BaseStreamData {
  content?: { chunk: string };
}
```

### When to Use Types

Only use type aliases for:

**1. Union Types**

```tsx
// Do - Use type for unions
type StreamData =
  | PaperStatusStreamData
  | ManuscriptStatusStreamData
  | ChatStreamData;

type StatusStreamData =
  | PaperStatusStreamData
  | ManuscriptStatusStreamData
  | ResourceStatusStreamData;
```

**2. Derived Types from Zod Schemas**

```tsx
// Do - Infer types from Zod schemas
import type { z } from 'zod';

type ResourceEvent = z.infer<typeof resourceEventSchema>;
type ManuscriptAdviceEvent = z.infer<typeof manuscriptAdviceEventSchema>;
```

**3. Utility Types**

```tsx
// Do - Use type for utility types
type PartialManuscript = Partial<Manuscript>;
type PickedProps = Pick<ManuscriptAdvice, 'id' | 'status'>;
```

**4. Simple Type Aliases**

```tsx
// Do - Use type for simple aliases
type ManuscriptMarkdown = string;
```

## Type Imports

Always use the `type` keyword for type-only imports:

```tsx
// Do
import type {
  ManuscriptAdvice,
  ManuscriptAdviceType,
} from '~/@types/manuscript';
import type { z } from 'zod';

// Don't
import { ManuscriptAdvice } from '~/@types/manuscript';
```

## Enums: `const enum` vs `enum`

### Use `const enum` for Status/Type Values (Default)

`const enum` values are inlined at compile time, resulting in smaller bundle sizes:

```tsx
// Do - Use const enum for status values
export const enum FiguresStatus {
  Pending = 'PENDING',
  Fetching = 'FETCHING',
  Fetched = 'FETCHED',
  Failed = 'FAILED',
}

export const enum DocumentType {
  Manuscript = 'MANUSCRIPT',
  Paper = 'PAPER',
}
```

### Use Regular `enum` When You Need Runtime Access

Regular `enum` creates a runtime object, allowing `Object.values()` and reverse mapping:

```tsx
// Do - Use regular enum when you need Object.values() or reverse mapping
export enum StreamEvent {
  Start = 'stream.start',
  Part = 'stream.part',
  End = 'stream.end',
  Error = 'stream.error',
}

// This works with regular enum
const isStreamEvent = (event: string): event is StreamEvent => {
  return Object.values(StreamEvent).includes(event as StreamEvent);
};
```

### Companion Arrays for `const enum` Runtime Iteration

Since `const enum` values are inlined, you cannot iterate over them. Create a companion array when needed:

```tsx
// const enum - values inlined, no runtime object
export const enum FiguresStatus {
  Pending = 'PENDING',
  Fetching = 'FETCHING',
  Fetched = 'FETCHED',
  Failed = 'FAILED',
}

// Companion array for runtime iteration
export const figuresStatuses: FiguresStatus[] = [
  FiguresStatus.Pending,
  FiguresStatus.Fetching,
  FiguresStatus.Fetched,
  FiguresStatus.Failed,
];

// Now you can use includes() checks
const errorStatuses: FiguresStatus[] = [FiguresStatus.Failed];

export const isErrorFiguresStatus = (status: FiguresStatus): boolean =>
  errorStatuses.includes(status);
```

### Decision: `const enum` vs `enum`

| Use Case                           | Choice                         |
| ---------------------------------- | ------------------------------ |
| Status values, document types      | `const enum` + companion array |
| Need `Object.values()` iteration   | Regular `enum`                 |
| Need reverse mapping (value → key) | Regular `enum`                 |
| Error identifiers (AppErrorId)     | Regular `enum`                 |
| Event types (StreamEvent)          | Regular `enum`                 |

## Const Arrays for Zod Schemas

When enum values need runtime validation with Zod, use the companion array pattern:

```tsx
// In @types file - define const enum and companion array
export const enum DocumentType {
  Manuscript = 'MANUSCRIPT',
  Paper = 'PAPER',
}

export const documentTypes = [DocumentType.Paper, DocumentType.Manuscript];

// Type guard using the array
export const isDocumentType = (type: string): type is DocumentType =>
  documentTypes.includes(type as DocumentType);

// In @schemas file - use the array for Zod validation
import z from 'zod';
import { documentTypes } from '~/@types/document';

export const resourceEventSchema = z.object({
  resourceType: z.enum(documentTypes),
  status: z.enum(resourceStatuses),
});
```

## Zod Schemas

Place runtime validation schemas in `app/@schemas/`:

```tsx
// app/@schemas/manuscript-advice-event.ts
import z from 'zod';

import { manuscriptAdviceTypes } from '~/@types/manuscript-advice';
import { manuscriptAdviceEventStatuses } from '~/@types/manuscript-advice-event-status';

export const manuscriptAdviceEventSchema = z.object({
  adviceType: z.enum(manuscriptAdviceTypes),
  manuscriptId: z.string(),
  userId: z.string(),
  status: z.enum(manuscriptAdviceEventStatuses),
});
```

## Type Predicates (Type Guards)

Use type predicates for runtime type checking:

```tsx
// Do - Type predicate for enum values
export const isStreamEvent = (event: string): event is StreamEvent => {
  return Object.values(StreamEvent).includes(event as StreamEvent);
};

// Do - Type predicate for interfaces
export const isPaperStreamData = (
  data?: StreamData | null,
): data is PaperStatusStreamData =>
  (data as PaperStatusStreamData)?.fileStatus !== undefined &&
  (data as PaperStatusStreamData)?.doiStatus !== undefined;

// Do - Type predicate for error checking
export const isAppError = (error: unknown): error is AppError =>
  error instanceof AppError ||
  (error instanceof Error && isAppErrorId(error.message));
```

## Custom Error Classes

Extend Error for domain-specific errors:

```tsx
export type AppErrorData = Record<string, unknown> & {
  message?: string;
  status?: number | string;
};

export class AppError extends Error {
  id: AppErrorId;
  data?: AppErrorData;

  constructor(id: AppErrorId, data?: AppErrorData) {
    super(composeAppErrorMessage(id, data));
    this.id = id;
    this.data = data;
  }
}
```

## Props Interface Naming

Use descriptive, component-specific names:

```tsx
// Do - Descriptive interface names
interface ManuscriptAdviceSuggestionCardProps {
  suggestion: string;
  isCopyable?: boolean;
}

interface PaperHeaderCardProps {
  metadata: PaperMetadata;
  paper: Paper;
}

// Don't - Generic names
interface Props {
  suggestion: string;
}
```

## Generic Interfaces

Use generics for reusable type patterns:

```tsx
// Do - Generic interfaces for reusable shapes
interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
}

interface ListProps<T> {
  items: T[];
  renderItem: (item: T) => ReactNode;
}

interface StreamPart<T = StreamData> {
  id: number;
  event: StreamEvent;
  data: T;
}
```

## File Organization

```
app/
  @types/           # TypeScript interfaces and types
    manuscript.ts
    paper.ts
    stream.ts
  @schemas/         # Zod validation schemas
    manuscript-event.ts
    paper-event.ts
```

## Code Organization Within Files

Place all interfaces and types at the top of the file, after imports:

```tsx
// 1. Imports
import { type ComponentProps, type ReactNode } from 'react';
import { Text } from '~/components/Text/Text';

// 2. All interfaces and types grouped together
interface CardProps extends ComponentProps<'section'> {
  children: ReactNode;
}

interface HeaderProps extends ComponentProps<'header'> {
  children: ReactNode;
}

interface BodyProps {
  children: ReactNode;
  className?: string;
}

// 3. Component implementations
```

### Exception: Const Used for Type Derivation

When a `const` is used to derive a type via `keyof typeof`, place it before the derived type:

```tsx
// 1. Imports
import { ComponentA } from '~/components/ComponentA';
import { ComponentB } from '~/components/ComponentB';

// 2. Const used for type derivation (allowed before types)
const componentMap = {
  'option-a': ComponentA,
  'option-b': ComponentB,
} as const;

// 3. Types derived from const
type ComponentName = keyof typeof componentMap;

interface SelectProps {
  name: ComponentName;
}

// 4. Component implementations
```

## Reference Files

- `app/@types/stream.ts` - Interfaces, regular enums, unions, and type predicates
- `app/@types/figures-status.ts` - `const enum` with companion array and helper functions
- `app/@types/document.ts` - `const enum` with companion array and type guard
- `app/@types/error.ts` - Custom error class with type guards
- `app/@types/manuscript.ts` - Simple interfaces and type aliases
- `app/@schemas/manuscript-advice-event.ts` - Zod schema example

## Anti-patterns

Avoid:

- Using `type` when `interface` would work for object shapes
- Using `any` type (use `unknown` and narrow with type guards)
- Type assertions without validation (`as` casts)
- Non-descriptive interface names (`Props`, `Data`)
- Duplicating type definitions across files
- Not using `import type` for type-only imports
- Implicit any in function parameters
- Defining types inline when they could be reused
- Using `Object.values()` on `const enum` (values are inlined, won't work)
- Forgetting companion arrays when `const enum` values need runtime iteration

## Decision Flow

1. Defining an object shape? → Use `interface`
2. Defining component props? → Use `interface`
3. Need to extend or implement? → Use `interface`
4. Creating a union of types? → Use `type`
5. Inferring from Zod schema? → Use `type` with `z.infer`
6. Simple alias (e.g., `string`)? → Use `type`
7. Fixed set of status/type values? → Use `const enum` + companion array
8. Need `Object.values()` on enum? → Use regular `enum`
9. Need runtime validation? → Create Zod schema in `@schemas/`
10. Need runtime type checking? → Create type predicate function
11. When in doubt → Use `interface`
