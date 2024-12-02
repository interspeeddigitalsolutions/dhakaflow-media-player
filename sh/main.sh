#!/bin/bash

# takes CONFIG_FILE file path from arguments. e.g bash main conf=/path/to/conf.file
source parse_args.sh
if [[ -z "$ENV_FILE" ]]; then
    echo -e "${RED}env file path is required in the command argument.${NC}"
    exit 1
fi
# loads config file values. REPO_URL, BRANCH, BUILD_COMMAND, RUN_COMMAND, ENV_FILE etc
source load_config.sh 
# get available port in AVAILABLE_PORT variable
# source get_available_port.sh


# Colors for better output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color


# Function to create a safe container and image name
generate_name() {
    # Extract repository name from URL and sanitize
    local repo_name=$(echo "$REPO_URL" | sed -E 's|.*/(.+)\.git|\1|')
    local safe_branch=$(echo "$BRANCH" | sed 's/[^a-zA-Z0-9-]/_/g')
    
    # Generate consistent names
    CONTAINER_NAME="app-${repo_name}-${safe_branch}"
    IMAGE_NAME="app-${repo_name}-${safe_branch}"
}

# Function to clean up existing deployments
cleanup_existing_deployment() {
    # Stop and remove existing container if it exists
    if docker ps -a | grep -q "$CONTAINER_NAME"; then
        echo -e "${YELLOW}Stopping existing container: $CONTAINER_NAME${NC}"
        docker stop "$CONTAINER_NAME" 2>/dev/null
        docker rm "$CONTAINER_NAME" 2>/dev/null
    fi

    # Remove existing image if it exists
    if docker images | grep -q "$IMAGE_NAME"; then
        echo -e "${YELLOW}Removing existing image: $IMAGE_NAME${NC}"
        docker rmi "$IMAGE_NAME" 2>/dev/null
    fi
}



# Main deployment function
deploy() {
    # Load configuration
    load_config

    if [[ -z "$APPLICATION_PORT" ]]; then
        echo -e "${RED}Application port is required. Please define the value of APPLICATION_PORT in your config file.${NC}"
        exit 1
    fi


    # Generate consistent container and image names
    generate_name

    # Clean up any existing deployments
    cleanup_existing_deployment

    # Print parsed configuration for debugging
    echo -e "${YELLOW}Deployment Configuration:${NC}"
    echo "Repository: $REPO_URL"
    echo "Branch: $BRANCH"
    echo "Container Name: $CONTAINER_NAME"
    echo "Image Name: $IMAGE_NAME"
    echo "Build Command: ${BUILD_COMMAND:-None}"
    echo "Run Command: $RUN_COMMAND"
    echo "Environment File: $ENV_FILE"

    # Create temporary directory for deployment
    DEPLOY_DIR=$(mktemp -d)
    cd "$DEPLOY_DIR" || exit 1

    echo "Cloning at ${DEPLOY_DIR}"
    # Clone repository
    echo -e "${YELLOW}Cloning repository from $REPO_URL (Branch: $BRANCH)${NC}"
    git clone -b "$BRANCH" "$REPO_URL" .

    # Remove .env file if it exists
    if [ -f .env ]; then
        rm .env
        echo -e "${YELLOW}Removed .env file${NC}"
    fi

    # Copy .env file
    cp "$ENV_FILE" .env

    # Create Dockerfile
    cat > Dockerfile << EOL
FROM node:21-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Optional build step
${BUILD_COMMAND:+RUN $BUILD_COMMAND}

# Expose default port (modify as needed)
EXPOSE ${APPLICATION_PORT}

# Default run command
CMD $RUN_COMMAND
EOL

    # Build Docker image with custom name
    echo -e "${YELLOW}Building Docker image: $IMAGE_NAME${NC}"
    docker build -t "$IMAGE_NAME" .

    # Run Docker container with host network
    echo -e "${GREEN}Starting Docker container: $CONTAINER_NAME${NC}"
    docker run -d \
        --restart=always \
        -p "${APPLICATION_PORT}:${APPLICATION_PORT}" \
        --env-file .env \
        --name "$CONTAINER_NAME" \
        "$IMAGE_NAME"

    echo -e "${GREEN}Deployment completed successfully!${NC}"
    echo -e "${GREEN}Application will run at port ${APPLICATION_PORT}${NC}"

    docker logs --follow "$CONTAINER_NAME"
}

# Error handling
set -e
trap 'echo -e "${RED}Deployment failed. Check the error messages above.${NC}"' ERR

# Run deployment
deploy

# Final cleanup function
# final_cleanup() {
#     echo -e "${YELLOW}Cleaning up temporary files...${NC}"
#     rm -rf "$DEPLOY_DIR"
# }

# Register final cleanup to run on script exit
trap final_cleanup EXIT