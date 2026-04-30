---
name: code-style
description: Code style conventions for React/TypeScript components
---

# Code Style Guide

## Early Returns

Use guard clauses at the start of functions to handle edge cases first:

```typescript
// Good: Early return for guard conditions
const handleSubmit = (value: string) => {
  if (!value.trim()) {
    return;
  }
  onSubmit(value);
};

// Good: Early return in components
const UserCard = ({ user }: Props) => {
  if (!user) {
    return null;
  }
  return <Card>{user.name}</Card>;
};

// Good: Early return in useEffect
useEffect(() => {
  if (!isEnabled || !url) {
    return;
  }
  // Effect logic here
}, [isEnabled, url]);
```

```typescript
// Avoid: Nested conditions
const handleSubmit = (value: string) => {
  if (value.trim()) {
    onSubmit(value);
  }
};
```

## JSX Conditional Rendering

### Use Ternaries, Not &&

Always use ternary operators with explicit `null` for conditional rendering:

```typescript
// Good: Ternary with explicit null
{isLoading ? <Spinner /> : null}

{user ? (
  <UserCard user={user} />
) : null}

{items.length > 0 ? (
  <List items={items} />
) : null}
```

```typescript
// Avoid: && operator
{isLoading && <Spinner />}
{user && <UserCard user={user} />}
```

### Use Ternaries for Branching

When rendering different content based on a condition:

```typescript
// Good: Ternary for two branches
{isError ? (
  <ErrorMessage />
) : (
  <Content />
)}

{status === 'loading' ? (
  <Skeleton />
) : (
  <Data />
)}
```

## Event Handler Naming

### Props: "on" Prefix

```typescript
interface ButtonProps {
  onClick?: () => void;
  onSubmit?: (value: string) => void;
  onOpenChange?: (open: boolean) => void;
}
```

### Internal Handlers: "handle" Prefix

```typescript
const handleClick = () => {
  // ...
};

const handleSubmit = (event: FormEvent) => {
  event.preventDefault();
  onSubmit?.(value);
};
```

## TypeScript Event Types

Always type events using React's event types:

```typescript
import type {
  ChangeEvent,
  FormEvent,
  KeyboardEvent,
  MouseEvent,
  FocusEvent,
} from 'react';

const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
  setValue(event.target.value);
};

const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    onSubmit?.(value);
  }
};
```

## useCallback

Wrap handlers in `useCallback` when passed to child components:

```typescript
const handleSubmit = useCallback(
  (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    onSubmit?.(value);
  },
  [value, onSubmit],
);
```

## Nullish Coalescing and Optional Chaining

### Default Values with ??

```typescript
const padding = paddingX ?? paddingY ?? 8;
const items = response?.data ?? [];
const position = passage?.startPosition ?? 0;
```

### Safe Access with ?.

```typescript
const title = resource.paperData?.title;
element?.querySelector('[data-child="content"]');
ref.current?.close();
```

### Optional Handler Calls

```typescript
onSubmit?.(value);
onClose?.();
onChange?.(newValue);
```

## Import Organization

Order imports as follows:

1. External dependencies
2. Type imports (with `type` keyword)
3. Internal imports (using `~/` alias)
4. Styles

```typescript
import clsx from 'clsx';
import { useCallback, useState } from 'react';
import { Link } from 'react-router';

import type { PageMetadata } from '~/@types/pagination';
import type { CardProps } from '~/components/Card/Card';

import { Card } from '~/components/Card/Card';
import { Button } from '~/components/Button/Button';

import styles from './Component.module.css';
```

## Destructuring

### Props with Rest Spread

```typescript
const Button = ({ children, variant, className, ...props }: ButtonProps) => (
  <button className={clsx(styles.button, styles[variant], className)} {...props}>
    {children}
  </button>
);
```

### Hook Returns

```typescript
const [value, setValue] = useState('');
const { data, isLoading, isError } = useQuery();
const { t } = useTranslation();
```

## Boolean Naming

Use descriptive prefixes for boolean variables:

```typescript
// State
const isLoading = true;
const isOpen = false;
const isEnabled = true;

// Derived
const hasItems = items.length > 0;
const hasNextPage = nextPage !== null;
const hasSuggestions = suggestions.length > 0;

// Capabilities
const canSubmit = !isDisabled && value.trim() !== '';
const shouldScrollToBottom = messages.length > previousCount;
```

## Function Definitions

### Single Expression

```typescript
const getUrl = (id: string) => `/api/items/${id}`;

const hasPermission = (permission: Permission, permissions: Permission[]) =>
  permissions.includes(permission);
```

### Multi-line with Block

```typescript
const handleSubmit = useCallback(
  (event: FormEvent) => {
    event.preventDefault();
    if (!value.trim()) {
      return;
    }
    onSubmit?.(value);
    setValue('');
  },
  [value, onSubmit],
);
```
