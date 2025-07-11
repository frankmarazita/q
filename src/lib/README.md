# Domain Layer Architecture

This directory contains the core business logic of the application, organized following Domain-Driven Design principles. Each domain is completely isolated from external dependencies and contains only pure functions.

## Architecture Principles

### 1. Pure Functions Only
All functions in the domain layer are pure:
- No side effects (I/O, mutations, console.log)
- Deterministic outputs for the same inputs
- No external dependencies

### 2. Domain Structure
Each domain follows a consistent structure:
```
domain/
├── types.ts       # TypeScript type definitions
├── validation.ts  # Runtime validation with Zod
├── operations.ts  # Pure business logic functions
├── transforms.ts  # Data transformation functions
└── index.ts      # Public API exports
```

### 3. Error Handling
All operations use the `Res<T>` discriminated union pattern:
```typescript
type Res<T> = 
  | { status: "success"; data: T }
  | { status: "error"; message: string }
```

## Domain Overview

### Models Domain (`models/`)
**Purpose**: Handles model data transformation and validation
- **Types**: `Model`, `TransformedModel`, capability interfaces
- **Operations**: Model searching, filtering, validation
- **Transforms**: Flattening nested model structures for display

**Key Functions**:
- `findModelByIdOrName()` - Locate models by identifier
- `transformModels()` - Convert to display format
- `validateModelExists()` - Business validation

### Chats Domain (`chats/`)
**Purpose**: Chat operations and message handling
- **Types**: `ChatData`, `Message`, `ChatSummary`
- **Operations**: Message manipulation, chat analysis
- **Transforms**: Raw chat parsing, summary generation

**Key Functions**:
- `addMessageToChat()` - Immutable message addition
- `createChatSummary()` - Generate chat previews
- `validateChatData()` - Data integrity checks

### Completions Domain (`completions/`)
**Purpose**: Stream processing and completion parsing
- **Types**: `CompletionChunk`, `StreamEvent`, tool call structures
- **Operations**: JSON parsing, content extraction
- **Processing**: Stream chunk handling, partial JSON recovery

**Key Functions**:
- `processStreamChunk()` - Parse streaming data
- `extractContentFromChunk()` - Extract message content
- `parseToolCallArguments()` - Handle tool invocations

### Config Domain (`config/`)
**Purpose**: Configuration management and validation
- **Types**: `Config`, `ConfigUpdate`, `CopilotToken`
- **Operations**: Config merging, token validation
- **Validation**: Runtime schema validation

**Key Functions**:
- `mergeConfigUpdates()` - Immutable config updates
- `validateConfig()` - Runtime validation
- `isCopilotTokenExpired()` - Token lifecycle management

### MCP Domain (`mcp/`)
**Purpose**: Model Context Protocol operations
- **Types**: Server configurations (`SSE`, `HTTP`, `stdio`)
- **Operations**: Server management, validation
- **Parsing**: JSONC support, configuration parsing

**Key Functions**:
- `validateMCPConfig()` - Server configuration validation
- `parseMCPConfigText()` - JSONC parsing with comments
- `getServersByType()` - Server filtering operations

## Testing Standards

### Pure Function Testing
All domain functions are tested with actual data:
```typescript
// ✅ Good - Tests actual functionality
it("should transform model capabilities", () => {
  const model = { /* actual model data */ };
  const result = transformModel(model);
  expect(result.vision).toBe(true);
});

// ❌ Bad - Mock-heavy test
it("should call transform", () => {
  const mockTransform = jest.fn();
  // ... mock setup
});
```

### Coverage Requirements
- **100%** function coverage for all domains
- **Edge cases** covered (empty arrays, null values)
- **Type safety** verified in all test scenarios

### Test Organization
```
__tests__/lib/domain/
├── types.test.ts        # Type validation tests
├── validation.test.ts   # Runtime validation tests
├── operations.test.ts   # Business logic tests
└── transforms.test.ts   # Data transformation tests
```

## Usage Patterns

### Importing Domain Functions
```typescript
// Import specific functions (preferred)
import { findModelByIdOrName, transformModels } from "../lib/models";

// Import entire domain (when using multiple functions)
import * as modelsLib from "../lib/models";
```

### Error Handling Pattern
```typescript
const result = validateModelExists(model, modelName);
if (result.status === "error") {
  return result; // Propagate error
}
// Use result.data safely
```

### Service Layer Integration
Services orchestrate domain operations:
```typescript
async function setModel(modelName: string): Promise<Res<Model>> {
  // 1. Get data from external API
  const models = await api.models();
  
  // 2. Use domain functions for business logic
  const selectedModel = findModelByIdOrName(models, modelName);
  const validation = validateModelExists(selectedModel, modelName);
  
  if (validation.status === "error") {
    return validation;
  }
  
  // 3. Persist using external service
  await updateConfig({ model: validation.data });
  return createSuccessResponse(validation.data);
}
```

## Best Practices

### 1. Keep Domains Isolated
- No imports between domains
- Shared utilities go in `common/`
- No external dependencies (APIs, databases, etc.)

### 2. Favor Immutability
```typescript
// ✅ Good - Returns new object
function addMessage(chat: ChatData, message: Message): ChatData {
  return {
    ...chat,
    messages: [...chat.messages, message]
  };
}

// ❌ Bad - Mutates input
function addMessage(chat: ChatData, message: Message): void {
  chat.messages.push(message);
}
```

### 3. Type Safety First
- Use discriminated unions for complex types
- Validate at domain boundaries
- Leverage TypeScript's type system

### 4. Descriptive Naming
- Functions describe what they do, not how
- Types reflect business concepts
- Clear parameter names

This architecture ensures maintainability, testability, and allows the business logic to evolve independently of external concerns.