#!/bin/bash
# Run from YOUR LAPTOP (Git Bash on Windows) to upload voter data to the server.
# Usage:  bash deploy/push-data.sh  <server-ip>  <path-to-ssh-key>
#
# Example:
#   bash deploy/push-data.sh 129.154.12.34 ~/.ssh/oracle_key.pem

SERVER_IP="${1:?Usage: $0 <server-ip> <ssh-key>}"
SSH_KEY="${2:?Usage: $0 <server-ip> <ssh-key>}"
REMOTE_USER="ubuntu"
REMOTE_PATH="/home/ubuntu/islamic-front"

SSH="ssh -i $SSH_KEY $REMOTE_USER@$SERVER_IP"
RSYNC="rsync -avz --progress -e \"ssh -i $SSH_KEY\""

echo "=== Uploading project files (code only, no node_modules) ==="
rsync -avz --progress \
  --exclude 'node_modules' \
  --exclude '.next' \
  --exclude '__pycache__' \
  --exclude '*.pyc' \
  --exclude '.git' \
  -e "ssh -i $SSH_KEY" \
  ./ "$REMOTE_USER@$SERVER_IP:$REMOTE_PATH/"

echo "=== Uploading voter data (JSON + images) ==="
# This uploads the actual data directory separately (can be large)
rsync -avz --progress \
  -e "ssh -i $SSH_KEY" \
  ./voter-list-tool/backend/data/ \
  "$REMOTE_USER@$SERVER_IP:$REMOTE_PATH/voter-list-tool/backend/data/"

echo "=== Seeding the Docker volume with existing data ==="
$SSH "cd $REMOTE_PATH && docker compose run --rm -v \"\$(pwd)/voter-list-tool/backend/data:/src\" backend sh -c 'cp -r /src/. /app/data/'"

echo "=== Done. Now on the server run: docker compose up -d --build ==="
