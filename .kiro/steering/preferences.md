# User Preferences

## Terminal Access
- Do NOT run terminal commands autonomously
- Always provide commands as copy-pasteable text blocks
- The user runs all terminal commands themselves
- Reason: user prefers full control over what executes on their machine

## File Access Restrictions
- Do NOT read, open, or access any .env files
- Do NOT read any file containing credentials, API keys, or secrets
- If a task requires knowing credential values, ask the user to provide only what is needed in the chat — never read the file directly

## Code Editing
- Editing files directly is allowed
- Always explain what changed and why after editing

## Communication Style
- Be direct and concise
- No unnecessary filler text
- When giving commands, format them clearly in code blocks

## Project Context
- Project: SafeNode — safety mobile app (Ionic + React + Node.js)
- User runs: macOS, Android Studio Panda 3, VS Code / Kiro
- Backend credentials (.env) are managed by the user only — never read or access .env files
