# MeetGeek CLI 🎙️

Command-line interface for MeetGeek meeting intelligence.

## Installation

```bash
npm install -g meetgeek-cli
```

## Setup

```bash
export MEETGEEK_API_KEY="your_api_key"
```

## Usage

```bash
# List recent meetings
meetgeek list

# Show meeting details
meetgeek show <meeting-id>

# Get meeting summary
meetgeek summary <meeting-id>

# Get transcript
meetgeek transcript <meeting-id>

# Get highlights
meetgeek highlights <meeting-id>

# Search meetings
meetgeek ask "what did we discuss about the budget?"
```

## Credits

Built with [LoopShip](https://github.com/nexty5870/loopship) 🚀
Based on [MeetGeek MCP Server](https://github.com/meetgeekai/meetgeek-mcp-server)
