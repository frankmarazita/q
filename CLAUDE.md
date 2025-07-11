# Q - GitHub Copilot CLI Repository (CLAUDE Reference)

This file should be updated by you when you are told of reminders of how you do things in this repository. It is a living document that should be kept up to date with the latest practices and standards.

## Reminders

- When writing up documentation, don't reference things that frequently change as per the lifecycle of the project. For example, don't list all the features or commands in the README, as they may change frequently. Instead, provide a general overview and link to the CLI help command for the most up-to-date information.
- When writing documentation, focus on the architecture and design principles rather than implementation details. This helps maintain clarity as the code evolves. Do include the core implementation details that are necessary for understanding the architecture, but avoid going into specifics that may change frequently.
- When adding types, ensure you understand the context of where they should be placed in relation to where they are to be used. For example, if a type is used in the CLI layer, it should be defined in the CLI layer's types file.
- Consider using zod type constants as well as exporting types from the type files. See other type exports for examples.
- When adding and editing files, ensure that there is a carriage return at the end of the file. This is a common convention in many programming languages and helps prevent issues with version control systems and text editors that expect a newline at the end of files.
- Make sure to clean up any unused imports as you edit files. This helps maintain code clarity and prevents confusion about which imports are actually being used in the codebase.
- When making new changes in the codebase, first check how things are done elsewhere to validate your approach. This helps maintain consistency across the codebase and ensures that new changes align with existing patterns and practices.
- Don't create functions are that not going to be used. If a function is not needed, it should not be created. This helps keep the codebase clean and focused on necessary functionality. Otherwise, we end up maintaining dead code that serves no purpose.

## Core Purpose

This is a custom CLI tool called "q" that provides command-line access to GitHub Copilot Chat API through reverse engineering. It's designed as a more convenient way to interact with Copilot Chat outside of the official GitHub interfaces.

## Architecture Overview

The codebase follows **Hexagonal Architecture** with **Domain-Driven Design** principles, ensuring clean separation of concerns and maintainability.

### Runtime & Language

- **Runtime**: Bun (JavaScript/TypeScript runtime)
- **Language**: TypeScript with ES modules
- **Entry Point**: `index.ts` - Bootstraps CLI with dependency injection

### Architecture Layers

#### 1. Domain Layer (`src/lib/`)

- Pure business logic with no external dependencies

#### 2. CLI Layer (`src/cli/`)

Command-line interface with modular command structure:

- **Commands**: Individual command modules with proper separation
- **Input**: User input parsing and validation
- **Rendering**: Output formatting and presentation
- **MCP**: Client management for external tools

#### 3. Service Layer (`src/services/`)

- Application services that orchestrate domain operations

#### 4. Infrastructure (`src/db.ts`, `src/server.ts`)

- External integrations and I/O operations

## Development Standards

### Testing Requirements

- **Comprehensive Coverage**: Tests across all domains
- **No Mock-Heavy Tests**: Test actual functionality, not mocked behavior
- **Domain Purity**: Domain layer tests use pure functions only
- **TypeScript Compliance**: All tests must be type-safe

### Code Quality Standards

- **Pure Functions**: Domain layer contains only pure functions
- **Dependency Injection**: CLI uses context pattern for dependencies
- **Error Handling**: Consistent `Res<T>` pattern for all operations
- **Type Safety**: Strict TypeScript with discriminated unions

### Build Requirements

- **All Tests Must Pass**: 100% test success rate required
- **TypeScript Compliance**: Zero compilation errors
- **No Console.log in Business Logic**: Separated from presentation layer

### Key Dependencies

- **Commander.js**: CLI framework for command parsing
- **Express**: Web server capabilities for API mode
- **SQLite3**: Local database for chat storage
- **Zod**: Runtime type validation and schema parsing
- **MCP SDK**: Model Context Protocol support
- **Sentry**: Error tracking and monitoring

## Documentation References

For detailed implementation guides:

- `src/lib/README.md` - Domain layer patterns and best practices
- Test files in `src/__tests__/` - Implementation examples and patterns

## Development Commands

- `bun test` - Run all tests (must pass 100%)
- `bunx tsc --noEmit` - TypeScript type checking
- `bun run q` - Local CLI execution
