# Development Environment Conventions

## File system access

- **Only read/write files under the project root directory.** Never access `/tmp`, `/temp`, system directories, or any path outside the project.
- If a new directory is needed (e.g., for scripts, temporary outputs), create it inside the project root.

## Database access (Claude / AI agent)

- **Claude must not access the database directly** (e.g., via Prisma `$queryRaw`, Prisma Studio, or psql).
- If database inspection is needed, ask the user to run the query manually on the server and share the result.
