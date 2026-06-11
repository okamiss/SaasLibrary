- - # AI Company Assistant

    Before starting any task, read the following files.

    ## Read Order

    1. PRD.md
    2. ARCHITECTURE.md
    3. DESIGN.md

    ---

    ## Purpose

    This project is a SaaS multi-tenant AI knowledge base assistant for SMEs.

    ---

    ## Document Responsibilities

    ### PRD.md

    Defines:

    - Product requirements
    - MVP scope
    - Business workflows
    - Acceptance criteria

    ### ARCHITECTURE.md

    Defines:

    - Multi-tenant rules
    - Database design
    - Storage strategy
    - RAG architecture
    - Backend layering

    ### DESIGN.md

    Defines:

    - UI design system
    - Layout
    - Visual style
    - Components
    - Dark mode
    - Interaction design

    ---

    ## Priority Order

    When conflicts occur:

    ARCHITECTURE.md
    >
    >PRD.md
    >
    >DESIGN.md

    ---

    ## Development Principles

    - Implement MVP first
    - Do not over-engineer
    - Do not add features outside PRD
    - Respect multi-tenant isolation
    - Always use company_id filtering
    - Keep code simple and maintainable

    ---

    ## Required Checks

    Before submitting code:

    - pnpm lint
    - pnpm build
    - docker compose config

    ---

    ## Critical Rules

    Never:

    - Query business data without company_id
    - Store original files in database
    - Let AI answer without retrieval context
    - Skip source citation
    - Build features outside MVP scope



    ## CodeGraph (Required)

This repository uses CodeGraph.

Before performing code analysis, debugging, refactoring, or feature implementation:

- Use CodeGraph MCP tools as the primary navigation mechanism.
- Use CodeGraph to locate symbols, references, callers, callees, dependencies, and impact scope.
- Use CodeGraph to understand architecture before reading files.
- Determine affected code paths before making changes.

Do NOT start with:

- grep
- ripgrep
- find
- global text search
- reading large portions of the repository

Read source files only after the relevant locations have been identified through CodeGraph.

If CodeGraph is not initialized:

```bash
codegraph init -i
```

Preferred workflow:

1. Analyze repository structure with CodeGraph.
2. Locate relevant symbols and references.
3. Trace dependencies and call chains.
4. Determine impact scope.
5. Read only necessary files.
6. Implement changes.
7. Verify changes.