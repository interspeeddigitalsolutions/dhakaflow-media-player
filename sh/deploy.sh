#!/bin/bash

# Function to display usage
usage() {
    echo "Usage: $0 VPS_USER@VPS_IP CONFIG_FILE ENV_FILE [REMOTE_DEPLOYMENT_PATH]"
    echo "  - VPS_USER@VPS_IP: Required"
    echo "  - CONFIG_FILE: Required configuration file"
    echo "  - ENV_FILE: Required environment file"
    echo "  - REMOTE_DEPLOYMENT_PATH: Optional (default: /root/auto-deploy/app-deployment-timestamp)"
    exit 1
}

# Function to convert DOS to Unix line endings
convert_line_endings() {
    local file="$1"
    # Convert using tr if available
    tr -d '\r' < "$file" > "${file}.unix"
    mv "${file}.unix" "$file"
}

# Check if required arguments are provided
if [[ $# -lt 3 ]]; then
    usage
fi

# Parse VPS details
VPS_DETAILS="$1"
IFS='@' read -r VPS_USER VPS_IP <<< "$VPS_DETAILS"

# Required arguments
CONFIG_FILE="$2"
ENV_FILE="$3"

# Optional argument with default
DEPLOYMENT_PATH="${4:-/root/auto-deploy/app-deployment-$(date +%s)}"

# Validate file existence
for file in "$CONFIG_FILE" "$ENV_FILE"; do
    if [[ ! -f "$file" ]]; then
        echo "Error: File '$file' not found."
        exit 1
    fi
done

# Files to transfer (dynamic based on arguments)
FILES_TO_TRANSFER=(
    "main.sh"
    "parse_args.sh"
    "load_config.sh"
    "$CONFIG_FILE"
    "$ENV_FILE"
)

# Convert line endings for all files
for file in "${FILES_TO_TRANSFER[@]}"; do
    convert_line_endings "$file"
done

# First, create the remote directory
ssh "${VPS_USER}@${VPS_IP}" "mkdir -p ${DEPLOYMENT_PATH}"
if [[ $? -ne 0 ]]; then
    echo "Failed to create remote directory ${DEPLOYMENT_PATH}"
    exit 1
fi

# Transfer files
echo "Transferring files to $VPS_IP..."
for file in "${FILES_TO_TRANSFER[@]}"; do
    scp "$file" "${VPS_USER}@${VPS_IP}:${DEPLOYMENT_PATH}/"
    if [[ $? -ne 0 ]]; then
        echo "Failed to transfer $file"
        exit 1
    fi
done

# Execute remote deployment
echo "Executing deployment on remote server..."
ssh "${VPS_USER}@${VPS_IP}" << ENDSSH
# Ensure we're in the deployment directory
cd "$DEPLOYMENT_PATH"

# Ensure Unix line endings and executable permissions
for file in main.sh parse_args.sh load_config.sh; do
    # Convert line endings
    tr -d '\r' < "\$file" > "\$file.unix"
    mv "\$file.unix" "\$file"
    
    # Set executable permissions
    chmod +x "\$file"
done

# Run deployment with specified config
./main.sh conf="$DEPLOYMENT_PATH/$(basename "$CONFIG_FILE")" env="$DEPLOYMENT_PATH/$(basename "$ENV_FILE")"

rm -rf "$DEPLOYMENT_PATH"

ENDSSH

echo "Deployment process finished."