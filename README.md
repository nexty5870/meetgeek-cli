# MeetGeek CLI 🎙️

Command-line interface for [MeetGeek](https://meetgeek.ai) meeting intelligence.

List your meetings, get AI summaries, view transcripts, and search across all your calls with natural language.

## Installation

```bash
npm install -g meetgeek-cli
```

## Setup

### Interactive setup (recommended)

```bash
meetgeek auth
```

This will guide you through:
1. Getting your API key from MeetGeek
2. Verifying the key works
3. Saving it securely to `~/.config/meetgeek/config.json`

### Manual setup

```bash
export MEETGEEK_API_KEY="your_api_key"
```

### Getting your API key

1. Log in to [meetgeek.ai](https://meetgeek.ai)
2. Go to **Integrations**
3. Find **Public API Integration**
4. Generate or copy your API key

## Usage

### List meetings

```bash
meetgeek list              # List recent meetings
meetgeek list --limit 20   # Show more meetings
```

### Get meeting details

```bash
meetgeek show <meeting-id>
```

### Get AI summary

```bash
meetgeek summary <meeting-id>
```

Shows the AI-generated summary including key points and action items.

### Get transcript

```bash
meetgeek transcript <meeting-id>              # Print to console
meetgeek transcript <meeting-id> -o call.txt  # Save to file
```

### Get highlights

```bash
meetgeek highlights <meeting-id>
```

### Search meetings

```bash
# Search in a specific meeting
meetgeek ask "budget discussion" -m <meeting-id>

# Search across all recent meetings
meetgeek ask "what did we decide about the timeline"
```

### Manage auth

```bash
meetgeek auth --show   # Show current API key status
meetgeek auth --clear  # Remove saved API key
```

## Examples

```bash
# List your meetings
$ meetgeek list

📋 Recent Meetings:

  94d7f121  ☕️ Coffee hour community
           1/4/2026 • 88 min

  81a6ab96  Quentin / Czesia
           12/22/2025 • 26 min

# Get the summary
$ meetgeek summary 81a6ab96

📝 Meeting Summary:

The meeting focused on the technical demo of the competitive
monitoring platform and the behavior of automated workflows...

✅ Action Items:

  • Implement TLDR per competitor
  • Refine aggregation logic
  • Send PDF via Slack for validation

# Search for a topic
$ meetgeek ask "slack integration" -m 81a6ab96

🔍 Searching for: "slack integration"

Found 5 matches:

[2:14:12 PM] Czesia:
  We had talked about Slack integration, the idea was to have a TLDR...
```

## License

MIT © [Quentin Daems](https://shvz.fr)

## Credits

- Built with [LoopShip](https://github.com/nexty5870/loopship) 🚀
- Based on [MeetGeek MCP Server](https://github.com/meetgeekai/meetgeek-mcp-server)
