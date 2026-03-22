#!/bin/bash
# Downloads card images from img.duelmasters.us to local assets
# Respectful: 500ms delay between requests, sequential downloads
# Usage: bash tools/download-card-images.sh

set -e

OUTPUT_DIR="apps/desktop/public/data/card-images"
DATA_FILE="apps/desktop/public/data/all-cards.json"
DELAY=1  # seconds between requests — be respectful
BASE_URL="https://img.duelmasters.us"
SET_FILTER="${1:-}"  # optional: pass a set name like "DM-01" to only download that set

mkdir -p "$OUTPUT_DIR"

# Extract card IDs, optionally filtered by set
CARD_IDS=$(node -e "
  const cards = require('./${DATA_FILE}');
  const filter = '${SET_FILTER}';
  const filtered = filter ? cards.filter(c => c.set === filter) : cards;
  filtered.forEach(c => console.log(c.id));
")

TOTAL=$(echo "$CARD_IDS" | wc -l | tr -d ' ')
COUNT=0

echo "Downloading $TOTAL card images to $OUTPUT_DIR"
echo "Delay between requests: ${DELAY}s"
echo ""

for ID in $CARD_IDS; do
  COUNT=$((COUNT + 1))
  FILE="$OUTPUT_DIR/$ID.webp"

  if [ -f "$FILE" ]; then
    echo "[$COUNT/$TOTAL] $ID.webp — already exists, skipping"
    continue
  fi

  echo "[$COUNT/$TOTAL] Downloading $ID.webp..."
  curl -s -o "$FILE" "$BASE_URL/$ID.webp"

  # Be respectful — wait between requests
  sleep $DELAY
done

echo ""
echo "Done! Downloaded images to $OUTPUT_DIR"
echo "Total files: $(ls -1 "$OUTPUT_DIR" | wc -l | tr -d ' ')"
