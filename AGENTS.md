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