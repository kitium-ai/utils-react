# @kitiumai/utils-react

Comprehensive React utilities and custom hooks for KitiumAI projects, following industry best practices from usehooks-ts, ahooks, and React patterns.

## Installation

```bash
npm install @kitiumai/utils-react
# or
pnpm add @kitiumai/utils-react
```

## Features

### Custom Hooks (40+ hooks planned)

Currently implemented:

- **State Management**: `useToggle`, `usePrevious`
- **Performance**: `useDebounce`, `useDebounceCallback`
- **Browser APIs**: `useLocalStorage`

## Usage

### useToggle

Toggle boolean state easily:

```tsx
import { useToggle } from '@kitiumai/utils-react';

const Modal = () => {
  const [isOpen, toggle, setIsOpen] = useToggle();
  
  return (
    <>
      <button onClick={toggle}>Toggle Modal</button>
      <button onClick={() => setIsOpen(true)}>Open</button>
      {isOpen && <div>Modal Content</div>}
    </>
  );
};
```

### useDebounce

Debounce value changes:

```tsx
import { useState } from 'react';
import { useDebounce } from '@kitiumai/utils-react';

const SearchInput = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);

  // This effect runs only when debouncedSearch changes
  useEffect(() => {
    // API call with debouncedSearch
    fetchResults(debouncedSearch);
  }, [debouncedSearch]);

  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
};
```

### useLocalStorage

Sync state with localStorage:

```tsx
import { useLocalStorage } from '@kitiumai/utils-react';

const Settings = () => {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  
  return (
    <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
      Current Theme: {theme}
    </button>
  );
};
```

## Tree-Shaking

This package is fully tree-shakeable. Import only what you need:

```tsx
// Import specific hooks
import { useToggle, useDebounce } from '@kitiumai/utils-react';
```

## TypeScript

All hooks are written in TypeScript with full type safety and excellent IDE support.

## License

MIT © KitiumAI
