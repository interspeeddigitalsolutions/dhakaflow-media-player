#!/bin/bash

# Loop through all arguments passed to the script
for arg in "$@"; do
  case $arg in
    conf=*)
      CONFIG_FILE="${arg#*=}" # Extract value after 'conf='
      shift # Remove processed argument
      ;;
    env=*)
      ENV_FILE="${arg#*=}" # Extract value after 'env='
      shift # Remove processed argument
      ;;
    *)
      echo "Unknown argument: $arg"
      ;;
  esac
done


# Check if required arguments are empty
# if [[ -z "$CONFIG_FILE" ]]; then
#   echo "Error: 'conf' argument is required but not provided."
#   exit 1
# fi
