---
name: css-modules
description: Use css-modules for styling components
---

# CSS Modules Styling Guide

## File Organization

- Co-locate CSS module files with their components
- Name files to match the component: `ComponentName.module.css`
- Use `.module.css` extension (not `.module.scss`)

```
app/components/
├── Button/
│   ├── Button.tsx
│   ├── Button.module.css
```

## Import Pattern

Always import styles as a default import named `styles`:

```typescript
import styles from './ComponentName.module.css';
```

## Class Naming Conventions

### Base and variant classes (camelCase)

```css
.button {
}
.primary {
}
.secondary {
}
.small {
}
.large {
}
.disabled {
}
.loading {
}
```

### Prop-based modifier classes (kebab-case with --)

```css
.direction--column {
}
.direction--row {
}
.color--neutral-000 {
}
.border-radius--sm {
}
.align-items--center {
}
```

## Applying Classes with clsx

Always use `clsx` for composing class names. Import it from the `clsx` package.

### Single class

```typescript
<div className={styles.container}>
```

### Multiple classes

```typescript
<span className={clsx(styles.badge, styles[color], className)}>
```

### Conditional classes

```typescript
<button
  className={clsx(
    styles.button,
    styles[variant],
    disabled ? styles.disabled : null,
    loading ? styles.loading : null,
    className,
  )}
>
```

### Dynamic prop-based classes

```typescript
className={clsx(
  styles.flex,
  styles[`direction--${direction}`],
  alignItems ? styles[`align-items--${alignItems}`] : null,
  className,
)}
```

## Best Practices

Follow the css-standards SKILL

## Component Example

```typescript
import clsx from 'clsx';
import styles from './Badge.module.css';

type BadgeProps = {
  color: 'primary' | 'secondary' | 'success';
  className?: string;
  children: React.ReactNode;
};

export const Badge = ({ color, children, className, ...props }: BadgeProps) => {
  return (
    <span className={clsx(styles.badge, styles[color], className)} {...props}>
      {children}
    </span>
  );
};
```
