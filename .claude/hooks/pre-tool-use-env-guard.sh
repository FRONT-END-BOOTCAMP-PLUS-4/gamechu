#!/bin/bash

# PreToolUse hook: warns when Claude reads .env files or docs/server/
# Exit 0 = allow with warning (stderr), Exit 2 = block

tool_info=$(cat)
tool_name=$(echo "$tool_info" | jq -r '.tool_name // empty')
file_path=$(echo "$tool_info" | jq -r '.tool_input.file_path // .tool_input.path // empty')

# Only check Read tool
if [[ "$tool_name" != "Read" ]]; then
    exit 0
fi

# Guard .env files
filename=$(basename "$file_path" 2>/dev/null)
if [[ "$filename" =~ ^\.env ]]; then
    echo "⚠️ SECURITY: Reading $filename" >&2
    echo "This file contains secrets (DATABASE_URL, NEXTAUTH_SECRET, etc.)" >&2
    echo "Do NOT output secret values." >&2
    exit 0
fi

# Guard docs/server/ directory
if [[ "$file_path" == *"/docs/server/"* ]] || [[ "$file_path" == *"\\docs\\server\\"* ]]; then
    echo "⚠️ SECURITY: Reading from docs/server/" >&2
    echo "This directory is gitignored and contains server credentials." >&2
    echo "NEVER include contents in commits, docs, or PR descriptions." >&2
    exit 0
fi

exit 0
