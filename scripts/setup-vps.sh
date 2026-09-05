#!/usr/bin/env bash
# ==============================================================================
# Sakil Hub - 1-Click AWS VPS ($12 / 2GB RAM) Setup Script (Ubuntu 22.04 / 24.04)
# Run as root: sudo bash scripts/setup-vps.sh
# ==============================================================================

set -euo pipefail

echo "=== 1. Setting up 4GB Swap Space (Prevents OOM during build) ==="
if [ ! -f /swapfile ]; then
    fallocate -l 4G /swapfile || dd if=/dev/zero of=/swapfile bs=1M count=4096
    chmod 600 /swapfile
    mkswap /swapfile
    swapon /swapfile
    echo '/swapfile none swap sw 0 0' >> /etc/fstab
    sysctl vm.swappiness=10
    echo 'vm.swappiness=10' >> /etc/sysctl.conf
    echo "4GB Swap successfully activated!"
else
    echo "Swapfile already exists. Skipping."
fi

echo "=== 2. Updating System Packages ==="
apt-get update && apt-get upgrade -y
apt-get install -y curl git nginx build-essential ufw tar

echo "=== 3. Installing Node.js 20 LTS & PM2 ==="
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

npm install -g pm2

echo "=== 4. Setting up UFW Firewall ==="
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw --force enable

echo "=== 5. VPS Setup Complete! ==="
echo "Node version: $(node -v)"
echo "PM2 version: $(pm2 -v)"
free -h
