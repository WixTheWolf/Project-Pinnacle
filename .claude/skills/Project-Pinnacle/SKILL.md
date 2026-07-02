```markdown
# Project-Pinnacle Development Patterns

> Auto-generated skill from repository analysis

## Overview
This skill teaches the core development patterns and conventions used in the Project-Pinnacle repository, a TypeScript codebase built with Next.js. You'll learn how to structure files, write and organize code, follow commit conventions, and implement testing patterns consistent with this project.

## Coding Conventions

### File Naming
- Use **camelCase** for file and directory names.
  - Example: `userProfile.ts`, `dashboardLayout/`

### Import Style
- Use **alias imports** rather than relative paths.
  - Example:
    ```typescript
    import { getUser } from '@services/userService'
    ```

### Export Style
- **Mixed**: Both default and named exports are used.
  - Example:
    ```typescript
    // Named export
    export function fetchData() { ... }

    // Default export
    export default function Dashboard() { ... }
    ```

### Commit Messages
- Use **conventional commit** format.
- Prefix with `feat` for new features.
- Keep messages concise (average ~32 characters).
  - Example: `feat: add user authentication`

## Workflows

_No custom workflows detected in this repository._

## Testing Patterns

- **Test File Naming:** Test files use the pattern `*.test.*`
  - Example: `userService.test.ts`
- **Testing Framework:** Not specified in the repository, but test files are present.
- **Test Structure:** Place test files alongside the code they test or in a dedicated test directory.

  ```typescript
  // userService.test.ts
  import { getUser } from '@services/userService'

  test('should fetch user data', () => {
    // ...test implementation
  })
  ```

## Commands
| Command | Purpose |
|---------|---------|
| /test   | Run all test files matching `*.test.*` |
| /commit | Create a conventional commit (e.g., `feat: ...`) |
```