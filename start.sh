#!/bin/sh
set -e

echo "Pushing database schema..."
./node_modules/.bin/prisma db push

echo "Starting server..."
exec node server.js
