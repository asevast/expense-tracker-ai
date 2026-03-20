# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Status

This is a **new/fresh repository** with no existing codebase. The project is an "expense-tracker-ai" application that will track expenses with AI capabilities.

## Recommended Development Setup

### Language & Framework Recommendations

Consider one of these stacks based on your requirements:

- **Python**: FastAPI/Flask for backend, PostgreSQL for storage, AI integration via Anthropic/OpenAI APIs
- **TypeScript/Node.js**: Express/Fastify for backend, PostgreSQL/Prisma ORM, AI SDK integrations
- **Full-stack**: Add React/Vue.js frontend for user interface

### Common Commands (To Be Implemented)

Once the project is initialized, add these standard commands:

```bash
# Setup
poetry install              # or: pip install -r requirements.txt
# or: npm install

# Development
poetry run uvicorn app:app --reload   # Python FastAPI
# or: npm run dev

# Testing
pytest tests/              # Python
# or: npm test

# Linting
ruff check .               # Python
# or: npm run lint

# Database
alembic upgrade head       # migrations (Python)
# or: npx prisma migrate dev
```

### Directory Structure (Recommended)

```
expense-tracker-ai/
├── src/            # Application code
│   ├── api/       # API endpoints/handlers
│   ├── models/    # Data models/schemas
│   ├── services/  # Business logic (expense categorization, AI processing)
│   ├── database/  # DB connection, migrations
│   └── utils/     # Utilities
├── tests/         # Unit and integration tests
├── .env.example   # Environment variable template
├── pyproject.toml # Python dependencies (or package.json)
└── README.md      # Project documentation
```

## Architecture Guidelines

Once the project structure is defined, update this file with:
- Exact build/lint/test commands
- Database setup and migration instructions
- AI service configuration (Anthropic API keys, prompts)
- Expense categorization logic location
- Receipt parsing (OCR) details if applicable

## Key Considerations for Expense Tracker AI

1. **AI Integration**: Expect to use Claude API for categorizing expenses, extracting data from receipts, or providing insights
2. **Data Privacy**: Expense data is sensitive—ensure proper security and encryption
3. **Multi-format Support**: Receipts come as images, PDFs, or text—plan for OCR capabilities
4. **Currency & Locale**: Support multiple currencies and date formats
5. **Category Management**: Flexible categorization with AI-assisted suggestions

## Notes for Claude Code

- The user may be in early planning or implementation phase
- Look for README.md, pyproject.toml, package.json for actual commands
- If no files exist yet, ask the user about preferred stack and features
- Update this file as the project matures with real commands and structure
