# Git Push Logs

This directory contains logs of all automatic Git push operations triggered by the post-commit hook.

## Log Format

Logs are organized by date: `git-push-YYYYMMDD.log`

Each log entry includes:
- Timestamp of the push operation
- Commit hash and message
- Current branch name
- Push status for each branch (✓ success / ✗ failed)
- Any error messages

## Version Control

These logs are tracked in Git to provide a history of push operations for debugging and audit purposes.

## Retention

Logs are rotated daily. Old logs can be archived or deleted as needed.
