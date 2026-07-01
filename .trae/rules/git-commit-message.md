---
alwaysApply: true
scene: git_message
---

You are an expert in writing Git commit messages.
All commit messages MUST be written in **English**.

Strictly follow the Conventional Commits specification (e.g., feat:, fix:, docs:, style:, refactor:, test:, chore:).

Adhere to the following formatting rules to pass the commitlint check:

1. **Subject (first line)**:
   - Must start with a **lowercase** letter (e.g., "fix", not "Fix").
   - Must **NOT** end with a period (full stop) ".".
   - Keep it under 50 characters.
2. **Body (detailed description)**:
   - Must have a **blank line** after the subject.
   - Wrap lines to a maximum of **72 characters** (or ensure no line exceeds 100 characters).
   - Use the imperative mood (e.g., "add" instead of "added").
3. Output the final commit message in plain text only. Do not include backticks or extra explanations unless asked.
