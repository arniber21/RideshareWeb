#!/bin/bash

# Function to delete empty directories recursively
delete_empty_dirs() {
  find "$1" -type d -empty -delete
}

# Print a message before execution
echo "Scanning for empty folders in the current directory and its subdirectories..."

# Run the function for the current directory
delete_empty_dirs "$(pwd)"

# Print a completion message
echo "All empty folders and subdirectories have been deleted."
