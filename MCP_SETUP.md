# Nx MCP Setup

This workspace is configured with the Nx Model Context Protocol (MCP) server, which allows AI assistants to interact with your Nx workspace.

## Quick Start

### Running the MCP Server

You can start the MCP server using:

```bash
pnpm mcp:start
```

Or directly:

```bash
npx nx-mcp .
```

### Configuring AI Agents

To configure your AI agent (like Claude Code or Cursor) to use the Nx MCP server:

```bash
npx nx configure-ai-agents
```

This will guide you through setting up the MCP server for your preferred AI assistant.

## For Claude Code

Add the Nx MCP server to Claude Code:

```bash
claude mcp add nx-mcp npx nx-mcp@latest
```

Or add it manually to your Claude Code configuration:

```json
{
  "mcpServers": {
    "nx-mcp": {
      "command": "npx",
      "args": ["nx-mcp@latest", "."]
    }
  }
}
```

## For Cursor

Add to your Cursor settings (`.cursor/mcp.json` or similar):

```json
{
  "mcpServers": {
    "nx-mcp": {
      "command": "npx",
      "args": ["nx-mcp@latest", "."]
    }
  }
}
```

## What Nx MCP Provides

The Nx MCP server gives your AI assistant:

- **Workspace Structure Understanding**: Full awareness of your monorepo's architecture and project dependencies
- **Real-time Terminal Integration**: Access to terminal outputs and running processes
- **CI Pipeline Context**: Insights into build failures and test results
- **Enhanced Code Generation**: AI-powered generator suggestions
- **Cross-project Impact Analysis**: Understanding implications of changes across the monorepo
- **Autonomous Error Debugging**: AI-assisted issue identification and resolution

## Available Scripts

- `pnpm mcp` - Run nx-mcp (defaults to current directory)
- `pnpm mcp:start` - Start the MCP server for this workspace
