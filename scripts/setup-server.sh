#!/bin/bash

# Update system packages
apt-get update
apt-get upgrade -y

# Install required packages
apt-get install -y \
    apt-transport-https \
    ca-certificates \
    curl \
    gnupg \
    lsb-release

# Add Docker's official GPG key
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /usr/share/keyrings/docker-archive-keyring.gpg

# Set up stable repository
echo \
  "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/docker-archive-keyring.gpg] https://download.docker.com/linux/ubuntu \
  $(lsb_release -cs) stable" | tee /etc/apt/sources.list.d/docker.list > /dev/null

# Install Docker
apt-get update
apt-get install -y docker-ce docker-ce-cli containerd.io

# Install Docker Compose
curl -L "https://github.com/docker/compose/releases/download/v2.23.3/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

# Create application directory
mkdir -p /opt/euphoria

# Create .env file
cat > /opt/euphoria/.env << EOL
# Docker Hub settings
DOCKERHUB_USERNAME=denvill

# Database settings
DB_USERNAME=postgres
DB_PASSWORD=your_secure_password_here
DB_DATABASE=euphoria

# Application settings
NODE_ENV=production
PORT=3001

# Redis settings
REDIS_HOST=redis
REDIS_PORT=6380
EOL

# Set proper permissions
chmod 600 /opt/euphoria/.env
chown -R root:root /opt/euphoria

# Create data directories
mkdir -p /opt/euphoria/uploads
chmod 755 /opt/euphoria/uploads

# Create deploy user and add to docker group
useradd -m -s /bin/bash deploy
usermod -aG docker deploy

# Setup SSH for GitHub Actions
mkdir -p /home/deploy/.ssh
touch /home/deploy/.ssh/authorized_keys
chown -R deploy:deploy /home/deploy/.ssh
chmod 700 /home/deploy/.ssh
chmod 600 /home/deploy/.ssh/authorized_keys

echo "Server setup completed!" 