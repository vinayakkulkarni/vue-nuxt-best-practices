# Vue & Nuxt Skills for Claude Code

A collection of AI agent skills focused on Vue.js and Nuxt best practices. Built for developers who want Claude Code (or similar AI coding assistants) to help with reactivity patterns, component performance, data fetching, SSR/SSG, and full-stack Vue/Nuxt development.

Built by [Vinayak Kulkarni](https://vinayakkulkarni.dev).

**Contributions welcome!** Found a way to improve a skill or have a new one to add? [Open a PR](#contributing).

## What are Skills?

Skills are markdown files that give AI agents specialized knowledge and workflows for specific tasks. When you add these to your project, Claude Code can recognize when you're working on a Vue/Nuxt task and apply the right frameworks and best practices.

## Available Skills

| Skill | Description | Triggers |
|-------|-------------|----------|
| [vue-best-practices](skills/vue-best-practices/) | Vue.js reactivity, components, computed, watchers, Composition API | "Vue," "ref," "reactive," "computed," "v-if," "v-for" |
| [nuxt-best-practices](skills/nuxt-best-practices/) | Nuxt data fetching, SSR, server routes, auto-imports, state | "Nuxt," "useFetch," "useAsyncData," "SSR," "useState" |

## Installation

### Option 1: CLI Install (Recommended)

Use [add-skill](https://github.com/vercel-labs/add-skill) to install skills directly:

```bash
# Install all skills
npx add-skill vinayakkulkarni/vue-nuxt-best-practices

# Install specific skills
npx add-skill vinayakkulkarni/vue-nuxt-best-practices --skill vue-best-practices

# List available skills
npx add-skill vinayakkulkarni/vue-nuxt-best-practices --list
```

This automatically installs to your `.claude/skills/` directory.

### Option 2: Clone and Copy

Clone the entire repo and copy the skills folder:

```bash
git clone https://github.com/vinayakkulkarni/vue-nuxt-best-practices.git
cp -r vue-nuxt-best-practices/skills/* .claude/skills/
```

### Option 3: Git Submodule

Add as a submodule for easy updates:

```bash
git submodule add https://github.com/vinayakkulkarni/vue-nuxt-best-practices.git .claude/vue-nuxt-best-practices
```

Then reference skills from `.claude/vue-nuxt-best-practices/skills/`.

### Option 4: Fork and Customize

1. Fork this repository
2. Customize skills for your specific needs
3. Clone your fork into your projects

## Usage

Once installed, just ask Claude Code to help with Vue/Nuxt tasks:

```
"Help me optimize this Vue component for performance"
-> Uses vue-best-practices skill

"Set up data fetching with useFetch in Nuxt"
-> Uses nuxt-best-practices skill

"What's the correct way to use computed properties?"
-> Uses vue-best-practices skill

"Create an SSR-safe server route with validation"
-> Uses nuxt-best-practices skill
```

You can also invoke skills directly:

```
/vue-best-practices
/nuxt-best-practices
```

## Skill Categories

### Vue Best Practices

| Category | Impact | Topics |
|----------|--------|--------|
| Reactivity Fundamentals | CRITICAL | ref vs reactive, destructuring, toRefs, shallowRef |
| Component Performance | CRITICAL | v-once, v-memo, async components, KeepAlive |
| Computed & Watchers | HIGH | caching, dependencies, deep watchers |
| Template Optimization | MEDIUM-HIGH | v-show vs v-if, keys, v-if with v-for |
| Composition API Patterns | MEDIUM | single responsibility, return refs |

### Nuxt Best Practices

| Category | Impact | Topics |
|----------|--------|--------|
| Data Fetching | CRITICAL | useFetch, unique keys, transform, error handling |
| Auto-Imports & Organization | CRITICAL | barrel exports, component naming, type locations |
| Server & API Routes | HIGH | validated input (Zod), route meta, runtime config |
| Rendering Modes | HIGH | ClientOnly, route rules, hybrid rendering |
| State Management | MEDIUM-HIGH | useState for SSR-safe state |
| Type Safety | MEDIUM | no any, strict emits, import paths |

## Contributing

Found a way to improve a skill? Have a new skill to suggest? PRs and issues welcome!

**Ideas for contributions:**
- Improve existing skill instructions or frameworks
- Add new best practices or patterns
- Fix typos or clarify confusing sections
- Suggest new skills (open an issue first to discuss)
- Add examples or case studies

**How to contribute:**
1. Fork the repo
2. Edit the skill file(s)
3. Submit a PR with a clear description of what you improved

### Skill File Structure

Each skill is a directory containing a `SKILL.md` file:

```
skills/
  skill-name/
    SKILL.md
```

The `SKILL.md` file follows this format:

```markdown
---
name: skill-name
description: One-line description for skill selection with trigger words
---

# Skill Name

[Full instructions for the AI agent]
```

## Related Projects

- [coreyhaines31/marketingskills](https://github.com/coreyhaines31/marketingskills) - Marketing skills for Claude Code
- [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) - React best practices

## License

MIT - Use these however you want.
