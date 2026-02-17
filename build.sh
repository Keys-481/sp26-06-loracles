#!/bin/bash
echo "Loracles: Build"

echo "==Making file=="
echo "  npm run make"

# Run npm run make, and save the status to a variable
npm run make
status=$?
# If failed, error out
if [[ "$status" != 0 ]]; then
  echo "  :( Error: Failed to make file. Returned $status"
  exit $status
fi

echo "  :) Success!"
exit 0