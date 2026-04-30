---
name: react
description: Use named useEffect hooks for side effects in React components
---

# React useEffect Hook Naming Guide

Always use named functions for useEffect hooks to improve readability and debugging:

```typescript
// Good: Named function for useEffect
useEffect(
  function fetchData() {
    // Effect logic here
  },
  [dependencies],
);
```
