#!/bin/bash

# Function to validate URL
validate_url() {
    local url=$1
    # Basic URL validation regex
    if [[ $url =~ ^https?://github\.com/[a-zA-Z0-9-]+/[a-zA-Z0-9_-]+(.git)?$ ]]; then
        return 0
    else
        return 1
    fi
}

# Function to create or read config file
load_config() {
    # Check if config file exists
    if [ ! -f "$CONFIG_FILE" ]; then
        echo -e "${YELLOW}No configuration file found. Let's create one.${NC}"
        
        # Prompt for GitHub Repository
        while true; do
            read -p "Enter GitHub Repository URL (e.g., https://github.com/username/repo): " REPO_URL
            if validate_url "$REPO_URL"; then
                break
            else
                echo -e "${RED}Invalid GitHub repository URL. Please try again.${NC}"
            fi
        done

        # Prompt for Branch (optional)
        read -p "Enter Git Branch Name (press Enter for 'main'): " BRANCH
        BRANCH=${BRANCH:-main}

        # Prompt for Build Command (optional)
        read -p "Enter Build Command (press Enter to skip): " BUILD_COMMAND

        # Prompt for Run Command (optional)
        read -p "Enter Run Command (press Enter for 'npm start'): " RUN_COMMAND
        RUN_COMMAND=${RUN_COMMAND:-npm start}

        # Prompt for application port
        while true; do
            read -p "At which port the application will run: " APPLICATION_PORT
            APPLICATION_PORT=${APPLICATION_PORT}
            if [[ -z "$APPLICATION_PORT" ]]; then
                echo -e "${RED}Application port is required${NC}"
            else
                break
            fi
        done

        # Save configuration with proper escaping
        cat > "$CONFIG_FILE" << EOL
REPO_URL=$REPO_URL
BRANCH=$BRANCH
BUILD_COMMAND=$BUILD_COMMAND
RUN_COMMAND=$RUN_COMMAND
APPLICATION_PORT=$APPLICATION_PORT
EOL

        echo -e "${GREEN}Configuration saved to $CONFIG_FILE${NC}"
    fi

    # Parse the configuration file
    parse_config

    # Validate required fields
    if [ -z "$REPO_URL" ]; then
        echo -e "${RED}Error: REPO_URL is required in the configuration file.${NC}"
        exit 1
    fi
}


# Function to parse config file safely
parse_config() {
    # Reset variables to ensure clean state
    REPO_URL=""
    BRANCH=""
    BUILD_COMMAND=""
    RUN_COMMAND=""
    APPLICATION_PORT=""

    # Read config file line by line
    while IFS='=' read -r key value
    do
        # Trim whitespace
        key=$(echo "$key" | xargs)
        value=$(echo "$value" | xargs)

        # Skip empty or comment lines
        [[ -z "$key" || "$key" == \#* ]] && continue

        # Parse each configuration key
        case "$key" in
            "REPO_URL")
                REPO_URL="$value"
                ;;
            "BRANCH")
                BRANCH="$value"
                ;;
            "BUILD_COMMAND")
                BUILD_COMMAND="$value"
                ;;
            "RUN_COMMAND")
                RUN_COMMAND="$value"
                ;;
            "APPLICATION_PORT")
                APPLICATION_PORT="$value"
                ;;
            *)
                echo -e "${YELLOW}Warning: Unknown configuration key '$key' ignored.${NC}"
                ;;
        esac
    done < "$CONFIG_FILE"

    # Set default values if not specified
    BRANCH=${BRANCH:-main}
    RUN_COMMAND=${RUN_COMMAND:-npm start}
}