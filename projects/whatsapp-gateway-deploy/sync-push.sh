#!/bin/bash
# Push local voter data to server.
# Run from Git Bash: bash deploy/sync-push.sh
set -e

SERVER="User@35.224.252.212"
KEY="$HOME/.ssh/id_rsa"
DATA_DIR="$(dirname "$0")/../voter-list-tool/backend/data"

echo "=== Packing voter data ==="
tar -czf /tmp/voter-push.tar.gz -C "$DATA_DIR" .

echo "=== Uploading to server ==="
scp -i "$KEY" -o StrictHostKeyChecking=no /tmp/voter-push.tar.gz "$SERVER":/tmp/voter-push.tar.gz

echo "=== Extracting into Docker volume ==="
ssh -i "$KEY" -o StrictHostKeyChecking=no "$SERVER" \
  "sudo docker run --rm -v ifp_voter_data:/app/data -v /tmp:/src alpine sh -c 'cd /app/data && tar -xzf /src/voter-push.tar.gz' && sudo docker compose -f /home/iamashrafshaik/ifp/docker-compose.yml restart backend"

echo "=== Done. Server is updated. ==="
rm -f /tmp/voter-push.tar.gz
