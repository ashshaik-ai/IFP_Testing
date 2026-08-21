#!/bin/bash
# Run this ONCE on the Oracle VM after first SSH login.
# Installs Docker, opens ports, clones the repo.
set -e

echo "=== Updating system ==="
sudo apt-get update && sudo apt-get upgrade -y

echo "=== Installing Docker ==="
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER

echo "=== Opening firewall ports (80 + 443) ==="
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80  -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save

echo "=== Done. Log out and back in so Docker works without sudo ==="
echo "Then run:  git clone <your-repo-url>  OR  use deploy/push-files.sh"
