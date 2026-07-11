#!/usr/bin/env bash
# Builds the Docker image and (re)runs the container locally.
#
# Usage:
#   ./deploy.sh              # build + run on port 3000
#   ./deploy.sh -p 8080      # run on a different host port
#   PORT=8080 ./deploy.sh    # same, via env var
#
# Requires Docker. Reads a local .env file if present (for
# NEXT_PUBLIC_SITE_URL / ANILIST_ENABLED / ANILIST_API_KEY — see .env.example).

set -euo pipefail

IMAGE_NAME="anime-halli"
CONTAINER_NAME="anime-halli"
PORT="${PORT:-3000}"

while getopts "p:" opt; do
  case "$opt" in
    p) PORT="$OPTARG" ;;
    *) echo "Usage: $0 [-p host_port]" >&2; exit 1 ;;
  esac
done

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is required but not found on PATH. Install Docker first: https://docs.docker.com/get-docker/" >&2
  exit 1
fi

ENV_FILE_ARGS=()
if [ -f .env ]; then
  echo "Using env file: .env"
  ENV_FILE_ARGS=(--env-file .env)
fi

echo "Building image ${IMAGE_NAME}:latest..."
docker build -t "${IMAGE_NAME}:latest" .

if docker ps -a --format '{{.Names}}' | grep -qx "${CONTAINER_NAME}"; then
  echo "Removing existing container ${CONTAINER_NAME}..."
  docker rm -f "${CONTAINER_NAME}" >/dev/null
fi

echo "Starting container on port ${PORT}..."
docker run -d \
  --name "${CONTAINER_NAME}" \
  -p "${PORT}:3000" \
  ${ENV_FILE_ARGS[@]+"${ENV_FILE_ARGS[@]}"} \
  --restart unless-stopped \
  "${IMAGE_NAME}:latest"

echo "Waiting for the app to respond..."
for _ in $(seq 1 30); do
  if curl -sf "http://localhost:${PORT}/" >/dev/null 2>&1; then
    echo "Anime Halli is up: http://localhost:${PORT}"
    exit 0
  fi
  sleep 1
done

echo "App didn't respond in time — check logs with: docker logs ${CONTAINER_NAME}" >&2
exit 1
