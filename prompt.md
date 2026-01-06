# MeetGeek CLI - Ralph Iteration

You are building a CLI tool for the MeetGeek API. Reference implementation is in `reference/mcp-server/`.

## Each iteration:

1. Read prd.json - find next story where `passes` is false
2. Implement the story
3. Test with: `node src/cli.js <command>`
4. If working:
   - Commit: "feat: [story title]"
   - Update prd.json: set passes: true
   - Log learnings to progress.txt

## API Reference

Base URL: https://api.meetgeek.ai/v1
Auth: Bearer token via MEETGEEK_API_KEY env var

Endpoints (from reference/mcp-server/src/services/meetgeek-api.ts):
- GET /meetings - list meetings
- GET /meetings/:id - meeting details
- GET /meetings/:id/transcript - transcript
- GET /meetings/:id/highlights - highlights
- GET /meetings/:id/summary - summary

## Project Structure

```
meetgeek-cli/
├── src/
│   ├── cli.js         # Entry point
│   ├── commands/      # Command implementations
│   └── lib/
│       └── api.js     # MeetGeek API client
├── package.json
└── reference/         # MCP server for reference
```

## Tech Stack

- Node.js ES modules
- commander.js for CLI
- chalk for colors
- Simple fetch for API calls

Begin with the next incomplete story.
