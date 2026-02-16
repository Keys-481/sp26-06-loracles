#!/bin/bash
set -euo pipefail

echo "Loracles: Build"

# Check presence package.json
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in current directory"
  exit 1
fi

echo "==Installing node=="
echo "  npm install"

# Run npm install, and save the status to a variable
out_npm_install=$(npm install) 
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Error: Failed to install npm. Returned $status"
  echo "==Output of npm install=="
  echo "$out_npm_install"
  exit 2
fi

echo "  :) Success!"

echo "==Making file=="
echo "  npm run make"

# Run npm run make, and save the status to a variable
out_npm_run_make=$(npm run make) 
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Error: Failed to make file. Returned $status"
  echo "==Output of npm run make=="
  echo "$out_npm_run_make"
  exit 3
fi

echo "  :) Success!"
exit 0