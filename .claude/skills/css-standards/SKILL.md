---
name: css-standards
description: Use css-standards for styling components and global css
---

# CSS Standards

## File Organization

### Global styles

- Global styles should be defined under `./app/styles`
- Use `.css` extension

### Components

Use the 'css-modules' skill

## Best Practices

1. **Use CSS variables for theming** - Reference design tokens:

   ```css
   padding: var(--spacing-4);
   color: var(--color-neutral-999);
   border-radius: var(--border-radius-sm);
   ```

2. **Accessible focus states** - Use `:focus-visible` instead of `:focus`:

   ```css
   .button:focus-visible {
     outline: 2px solid var(--color-focus);
   }
   ```

3. **Support reduced motion** - Respect user preferences:

   ```css
   @media (prefers-reduced-motion: reduce) {
     .animated {
       animation: none;
     }
   }
   ```

4. **Use data attributes and ARIA for states**:
   ```css
   .checkbox[data-state='checked'] {
   }
   .tab[aria-current='page'] {
   }
   ```
