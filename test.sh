#!/bin/bash
set -euo pipefail

echo "Loracles: Test"

# Check presence package.json
if [ ! -f "package.json" ]; then
  echo "Error: package.json not found in current directory"
  exit 1
fi

echo "==Installing node=="
echo "  npm ci"

# Run npm ci, and save the status to a variable
out_npm_install=$(npm ci) 
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Error: Failed to install npm. Returned $status"
  echo "==Output of npm ci=="
  echo "$out_npm_install"
  exit 2
fi

echo "  :) Success!"

echo "==Testing=="
echo "  npm run test"

# Run npm run test, and save the status to a variable
out_npm_run_test=$(npm run test) 
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Testing issues"
  echo "==Output of npm run test=="
  echo "$out_npm_run_test"
  exit 3
fi

echo "  :) Success!"

echo "==Linting=="
echo "  npm run lint"

# Run npm run lint, and save the status to a variable
out_npm_run_lint=$(npm run lint) 
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Linting issues"
  echo "==Output of npm run lint=="
  echo "$out_npm_run_lint"
  exit 4
fi

echo "  :) Success!"
exit 0