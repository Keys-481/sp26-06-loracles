#!/bin/bash
echo "Loracles: Test"

returnCode=0

echo "==Testing=="
echo "  npm run test"

# Run npm run test, and save the status to a variable
npm run test
status=$?
echo "Fails: $status"
returnCode=$((returnCode+status))

exit "$returnCode"