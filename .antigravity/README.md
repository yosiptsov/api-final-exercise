# Antigravity AI Assistant Guide

This repository is configured to work natively with the Antigravity (and similar agentic) AI assistant. 

## 1. Project Rules (`.clinerules`)
The `.clinerules` file in the root of the project acts as the primary "System Prompt" for the AI. 
Every time you ask the AI to generate or modify code, it will read this file first.
- **Do:** Place global project standards here (e.g. "Always use TypeScript", "Organize tests by AAA principle").
- **Don't:** Place complex, multi-step execution flows here (those belong in Skills).

## 2. Skills (`.antigravity/skills/`)
The `.antigravity/skills/` directory contains Markdown files (`SKILL.md`) that act as standard operating procedures (SOPs) for the AI. 
Think of these as highly specific checklists for complex, repeatable tasks.

### How to use a Skill:
Simply ask the AI to use it in your prompt:
> *"Hey Antigravity, please write tests for the POST /users endpoint using the create-api-tests skill."*

The AI will automatically locate the skill, read the execution steps, anti-patterns, and done criteria, and execute the task exactly as requested.

### How to write a Skill:
A good skill is a Markdown file with:
1. **Description**: When to use it.
2. **Done When**: A checklist the AI must follow before it considers the job complete.
3. **Anti-Patterns**: Explicit mistakes the AI should avoid during this specific task.
