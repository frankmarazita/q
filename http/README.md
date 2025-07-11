# Q API Test Collection

This Bruno collection contains comprehensive tests for the Q API endpoints.

## Running Tests

### Using Bruno CLI

1. Start the Q server: `bun run q serve` (If not already running)
2. Run all tests: `bru run --env dev`
3. Run with JSON output: `bru run --env dev --output results.json`
4. Run specific files: `bru run --env dev "Chat - Basic.bru"`

### CLI Command Options

- `--env dev` - Use the development environment (localhost:3000)
- `--output results.json` - Generate JSON test results
- `--delay 100` - Add delay between requests (ms)
- `--tests-only` - Run only requests with tests
- `--bail` - Stop on first failure

## Environment

Tests use the `dev` environment which points to `http://localhost:3000`

## References

- https://docs.usebruno.com/bru-cli/overview
- https://docs.usebruno.com/bru-cli/commandOptions
- https://docs.usebruno.com/bru-cli/runCollection
