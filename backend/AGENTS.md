# Agents Guidelines

## General Rules

- Write production-grade code.
- Prefer readability and maintainability over clever code.
- Keep files small and focused.
- Avoid duplication.
- Follow strict TypeScript practices.
- Use async/await instead of raw promise chains.
- Never use `any`.
- Use meaningful variable and function names.
- Write business logic in services folder.

---

# HTTP Status Codes

- Always use the `http-status` library for status codes.
- Never hardcode status codes like `200`, `400`, `404`, `500`, etc.

Correct:

```ts
import httpStatus from "http-status";

return res.status(httpStatus.OK).json({
  success: true,
});