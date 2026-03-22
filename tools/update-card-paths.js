#!/usr/bin/env node
// Updates all-cards.json to use local image paths for downloaded images,
// and keeps remote URLs for images not yet downloaded.
// Run AFTER download-card-images.sh has completed for a set.

const fs = require('fs');
const path = require('path');

const dataFile = path.join(__dirname, '..', 'apps/desktop/public/data/all-cards.json');
const imageDir = path.join(__dirname, '..', 'apps/desktop/public/data/card-images');
const cards = JSON.parse(fs.readFileSync(dataFile, 'utf-8'));

let localCount = 0;
let remoteCount = 0;

const updated = cards.map(card => {
  const localPath = path.join(imageDir, `${card.id}.webp`);
  if (fs.existsSync(localPath)) {
    localCount++;
    return { ...card, imageSrc: `/data/card-images/${card.id}.webp` };
  }
  remoteCount++;
  return { ...card, imageSrc: `https://img.duelmasters.us/${card.id}.webp` };
});

fs.writeFileSync(dataFile, JSON.stringify(updated, null, 2));
console.log(`Updated ${cards.length} cards: ${localCount} local, ${remoteCount} remote.`);
