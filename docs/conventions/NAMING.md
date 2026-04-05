# Naming Conventions

## Case rules

| Target                | Case                                        | Example                                        |
| --------------------- | ------------------------------------------- | ---------------------------------------------- |
| DB tables & columns   | snake_case                                  | `member_id`                                    |
| Folders               | kebab-case                                  | `folder-name`                                  |
| Files                 | PascalCase (exceptions for framework files) | `FileName.ts` (but `.env.local`, `layout.tsx`) |
| Variables & functions | camelCase                                   | `const camelCase = {}`                         |
| React components      | PascalCase, declared with `function`        | `function ExComp() {}`                         |

## Variable naming rules

- Strings use double quotes: `const s: string = "example"`
- Indentation: tab, 4 spaces (unified via linter)
- Arrays: plural names (`const data: number[] = []`)
- Event handlers: prefix `handle` (`handleClick`, `handleChange`)
- Booleans: prefix `is` for state (`isLoading`, `isLoggedIn`), `has` for existence/possession (`hasError`, `hasCalled`)

## React components

- Do NOT use `React.FC`
- Define props with `type` (not `interface`)

```typescript
type ExCompProps = {
    // ...
};

function ExComp(props: ExCompProps) {
    // ...
}
```
