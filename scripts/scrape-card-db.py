#!/usr/bin/env python3
"""Scrape the Duel Masters card database from db.duelmasters.us.

Output: cards.json — array of card objects with fields:
id, name, civilizations[], cost, type, race, power, rarity, collectorNumber,
set, rulesText[], imageUrl
"""
import json
import re
import sys
import time
import urllib.request
from concurrent.futures import ThreadPoolExecutor, as_completed
from html import unescape
from html.parser import HTMLParser

BASE = "https://db.duelmasters.us"
IMG = "https://img.duelmasters.us"
SETS = [f"dm-{i:02d}" for i in range(1, 36) if i != 18] + ["promo"]
HEADERS = {"User-Agent": "kaijudo-game-dev/1.0 (card data for personal fan game)"}

ROW_RE = re.compile(
    r'<tr class="results-row" data-id="(\d+)">(.*?)</tr>', re.S
)
TD_RE = re.compile(r"<td[^>]*>(.*?)</td>", re.S)
IMG_TITLE_RE = re.compile(r'title="([^"]*)"')
TAG_RE = re.compile(r"<[^>]+>")


def fetch(url, retries=4):
    for attempt in range(retries):
        try:
            req = urllib.request.Request(url, headers=HEADERS)
            with urllib.request.urlopen(req, timeout=30) as resp:
                return resp.read().decode("utf-8", "replace")
        except Exception as e:
            if attempt == retries - 1:
                raise
            time.sleep(1.5 * (attempt + 1))


def strip_tags(html):
    return unescape(TAG_RE.sub("", html)).strip()


def parse_set_page(html, set_name):
    cards = {}
    for m in ROW_RE.finditer(html):
        card_id = m.group(1)
        tds = TD_RE.findall(m.group(2))
        if len(tds) < 10:
            continue
        civs = IMG_TITLE_RE.findall(tds[2])
        rarity_m = IMG_TITLE_RE.search(tds[7])
        set_m = IMG_TITLE_RE.search(tds[9])
        power = strip_tags(tds[6])
        cost = strip_tags(tds[3])
        cards[card_id] = {
            "id": card_id,
            "name": strip_tags(tds[1]),
            "civilizations": civs,
            "cost": int(cost) if cost.isdigit() else None,
            "type": strip_tags(tds[4]),
            "race": strip_tags(tds[5]) or None,
            "power": int(power) if re.fullmatch(r"\d+", power) else (power or None),
            "rarity": rarity_m.group(1) if rarity_m else None,
            "collectorNumber": strip_tags(tds[8]) or None,
            "set": set_m.group(1) if set_m else set_name.upper(),
            "imageUrl": f"{IMG}/{card_id}.webp",
        }
    return cards


RULES_RE = re.compile(r'<ul id="rules-text">(.*?)</ul>', re.S)
LI_RE = re.compile(r"<li>(.*?)</li>", re.S)


def parse_cardview(html):
    out = {}
    m = RULES_RE.search(html)
    if m:
        out["rulesText"] = [
            re.sub(r"\s+", " ", strip_tags(li)).strip()
            for li in LI_RE.findall(m.group(1))
        ]
        out["rulesText"] = [t for t in out["rulesText"] if t]
    else:
        out["rulesText"] = []
    return out


def main():
    all_cards = {}
    for s in SETS:
        html = fetch(f"{BASE}/search?card_set={s}")
        cards = parse_set_page(html, s)
        print(f"{s}: {len(cards)} cards", flush=True)
        for cid, c in cards.items():
            all_cards.setdefault(cid, c)
        time.sleep(0.3)

    print(f"total unique cards: {len(all_cards)}", flush=True)

    def enrich(cid):
        html = fetch(f"{BASE}/cardview/{int(cid)}")
        return cid, parse_cardview(html)

    done = 0
    with ThreadPoolExecutor(max_workers=6) as ex:
        futures = [ex.submit(enrich, cid) for cid in all_cards]
        for fut in as_completed(futures):
            cid, extra = fut.result()
            all_cards[cid].update(extra)
            done += 1
            if done % 200 == 0:
                print(f"enriched {done}/{len(all_cards)}", flush=True)

    result = sorted(all_cards.values(), key=lambda c: int(c["id"]))
    with open(sys.argv[1] if len(sys.argv) > 1 else "cards.json", "w") as f:
        json.dump(result, f, indent=1, ensure_ascii=False)
    print(f"wrote {len(result)} cards", flush=True)


if __name__ == "__main__":
    main()
