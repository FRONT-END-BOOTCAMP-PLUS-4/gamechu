#!/bin/bash

# TSC Hook with Visible Output
# Uses stderr for visibility in Claude Code main interface

CLAUDE_PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
HOOK_INPUT=$(cat)
SESSION_ID="${session_id:-default}"
CACHE_DIR="$HOME/.claude/tsc-cache/$SESSION_ID"

# Create cache directory
mkdir -p "$CACHE_DIR"

# Extract tool name and input
TOOL_NAME=$(echo "$HOOK_INPUT" | jq -r '.tool_name // ""')
TOOL_INPUT=$(echo "$HOOK_INPUT" | jq -r '.tool_input // {}')

# Single Next.js app — check if the edited file is a TS/TSX file in this project
is_project_ts_file() {
    local file_path="$1"
    # Check file is under the project directory and is a TS/TSX file
    if [[ "$file_path" == "$CLAUDE_PROJECT_DIR"/* ]] && [[ "$file_path" =~ \.(ts|tsx)$ ]]; then
        return 0
    fi
    return 1
}

# Only process file modification tools
case "$TOOL_NAME" in
    Write|Edit|MultiEdit)
        # Extract file paths
        if [ "$TOOL_NAME" = "MultiEdit" ]; then
            FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.edits[].file_path // empty')
        else
            FILE_PATHS=$(echo "$TOOL_INPUT" | jq -r '.file_path // empty')
        fi

        # Check if any edited file is a TS/TSX file in the project
        NEEDS_CHECK=false
        while read -r file_path; do
            if [ -n "$file_path" ] && is_project_ts_file "$file_path"; then
                NEEDS_CHECK=true
                break
            fi
        done <<< "$FILE_PATHS"

        if [ "$NEEDS_CHECK" = true ]; then
            echo "⚡ TypeScript check on: gamechu" >&2

            cd "$CLAUDE_PROJECT_DIR" 2>/dev/null || exit 0
            CHECK_OUTPUT=$(npx tsc --noEmit 2>&1)
            CHECK_EXIT_CODE=$?

            if [ $CHECK_EXIT_CODE -ne 0 ] || echo "$CHECK_OUTPUT" | grep -q "error TS"; then
                echo "❌ Errors found" >&2

                # Save error information for the agent
                echo "$CHECK_OUTPUT" > "$CACHE_DIR/last-errors.txt"
                echo "gamechu" > "$CACHE_DIR/affected-repos.txt"
                echo "gamechu: npx tsc --noEmit" > "$CACHE_DIR/tsc-commands.txt"

                # Output to stderr for visibility
                {
                    echo ""
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo "🚨 TypeScript errors found"
                    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
                    echo ""
                    echo "👉 IMPORTANT: Use the auto-error-resolver agent to fix the errors"
                    echo ""
                    echo "Error Preview:"
                    echo "$CHECK_OUTPUT" | grep "error TS" | head -10
                    echo ""
                    err_count=$(echo "$CHECK_OUTPUT" | grep -c "error TS")
                    if [ "$err_count" -gt 10 ]; then
                        echo "... and $((err_count - 10)) more errors"
                    fi
                } >&2

                exit 1
            else
                echo "✅ OK" >&2
            fi
        fi
        ;;
esac

# Cleanup old cache directories (older than 7 days)
find "$HOME/.claude/tsc-cache" -maxdepth 1 -type d -mtime +7 -exec rm -rf {} \; 2>/dev/null || true

exit 0