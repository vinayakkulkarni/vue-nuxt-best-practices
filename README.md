# Vue & Nuxt Best Practices

[![Agent Skills](https://img.shields.io/badge/Agent%20Skills-Compatible-blue)](https://agentskills.io)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

Comprehensive performance optimization guides for Vue.js and Nuxt.js applications, designed for AI agents and LLMs. Built following the [Agent Skills specification](https://agentskills.io/specification).

## Overview

This repository contains two agent skills:

| Skill | Description | Rules |
|-------|-------------|-------|
| **[vue-best-practices](./skills/vue-best-practices/)** | Vue 3 performance optimization, reactivity patterns, and Composition API best practices | 40+ rules |
| **[nuxt-best-practices](./skills/nuxt-best-practices/)** | Nuxt 3/4 data fetching, auto-imports, server patterns, and full-stack best practices | 40+ rules |

## Installation

### Using npx (Recommended)

```bash
# Install both skills
npx add-skill vue-nuxt-best-practices

# Or install individually
npx add-skill vue-nuxt-best-practices/vue-best-practices
npx add-skill vue-nuxt-best-practices/nuxt-best-practices
```

### Manual Installation

Clone this repository and reference the skills directly in your AI coding agent configuration.

## Skill Structure

Each skill follows the [Agent Skills specification](https://agentskills.io/specification):

```
skills/
├── vue-best-practices/
│   ├── SKILL.md          # Main skill file with frontmatter
│   ├── AGENTS.md         # Compiled document for agents
│   ├── metadata.json     # Skill metadata
│   └── rules/            # Individual rule files
│       ├── _sections.md  # Section definitions
│       ├── _template.md  # Rule template
│       └── *.md          # Individual rules
│
└── nuxt-best-practices/
    ├── SKILL.md
    ├── AGENTS.md
    ├── metadata.json
    └── rules/
        └── *.md
```

## Rule Categories

### Vue Best Practices

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Reactivity Fundamentals | CRITICAL | `reactivity-` |
| 2 | Component Performance | CRITICAL | `component-` |
| 3 | Computed & Watchers | HIGH | `computed-` |
| 4 | Template Optimization | MEDIUM-HIGH | `template-` |
| 5 | Composition API Patterns | MEDIUM | `composable-` |
| 6 | State Management | MEDIUM | `state-` |
| 7 | Async & Data Fetching | LOW-MEDIUM | `async-` |
| 8 | Advanced Patterns | LOW | `advanced-` |

### Nuxt Best Practices

| Priority | Category | Impact | Prefix |
|----------|----------|--------|--------|
| 1 | Data Fetching | CRITICAL | `data-` |
| 2 | Auto-Imports & Organization | CRITICAL | `imports-` |
| 3 | Server & API Routes | HIGH | `server-` |
| 4 | Rendering Modes | HIGH | `rendering-` |
| 5 | State Management | MEDIUM-HIGH | `state-` |
| 6 | Type Safety | MEDIUM | `types-` |
| 7 | Modules & Plugins | LOW-MEDIUM | `modules-` |
| 8 | Performance & Deployment | LOW | `perf-` |

## Usage

### In Claude Code / Cursor

Once installed, the skills are automatically available. Reference them when:

- Writing new Vue/Nuxt components
- Reviewing code for performance issues
- Refactoring existing Vue/Nuxt code
- Implementing data fetching patterns
- Optimizing bundle size or load times

### Example Prompts

```
Review this Vue component for performance issues using vue-best-practices

Help me refactor this data fetching to follow Nuxt best practices

What's the correct way to use computed properties according to Vue best practices?
```

## Development

This is a [Bun workspace](https://bun.sh/docs/install/workspaces) project.

```bash
# Install dependencies
bun install

# Build AGENTS.md for all skills
bun run build

# Validate skill structure
bun run validate
```

## Contributing

1. Fork the repository
2. Create a new rule file following `rules/_template.md`
3. Add the rule to the appropriate section in `_sections.md`
4. Run `bun run build` to regenerate `AGENTS.md`
5. Submit a pull request

## Related Projects

- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) - React best practices
- [supabase/agent-skills](https://github.com/supabase/agent-skills) - Postgres best practices
- [Agent Skills Specification](https://agentskills.io/specification)

## License

MIT License - see [LICENSE](./LICENSE) for details.
