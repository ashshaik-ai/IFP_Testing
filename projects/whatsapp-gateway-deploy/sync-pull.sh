#!/bin/bash
# Pull voter data from server to local machine.
# Run from Git Bash: bash deploy/sync-pull.sh
set -e

SERVER="User@35.224.252.212"
KEY="$HOME/.ssh/id_rsa"
DATA_DIR="$(dirname "$0")/../voter-list-tool/backend/data"

echo "=== Packing data on server ==="
ssh -i "$KEY" -o StrictHostKeyChecking=no "$SERVER" \
  "sudo docker run --rm -v ifp_voter_data:/app/data -v /tmp:/dst alpine sh -c 'tar -czf /dst/voter-pull.tar.gz -C /app/data .'"

echo "=== Downloading from server ==="
scp -i "$KEY" -o StrictHostKeyChecking=no "$SERVER":/tmp/voter-pull.tar.gz /tmp/voter-pull.tar.gz

echo "=== Extracting locally ==="
tar -xzf /tmp/voter-pull.tar.gz -C "$DATA_DIR"

echo "=== Done. Local data is updated. ==="
rm -f /tmp/voter-pull.tar.gz
