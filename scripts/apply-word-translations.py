"""Merge scripts/word-translations/*.tsv and scripts/word-examples/*.tsv into
data/lessonN.json.

word-translations: <lesson>-<id> <TAB> english <TAB> russian.
uzbek-fixes.tsv:   <lesson>-<id> <TAB> corrected uzbek.
word-examples:     <lesson>-<id> <TAB> korean <TAB> uzbek <TAB> english <TAB> russian.
"""
import glob
import json
import os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
meanings, fixes = {}, {}
for path in sorted(glob.glob(os.path.join(ROOT, "scripts/word-translations/*.tsv"))):
    target = fixes if path.endswith("uzbek-fixes.tsv") else meanings
    for line in open(path, encoding="utf-8"):
        if not line.strip():
            continue
        key, *values = line.rstrip("\n").split("\t")
        target[key] = values

examples = {}
for path in sorted(glob.glob(os.path.join(ROOT, "scripts/word-examples/*.tsv"))):
    for line in open(path, encoding="utf-8"):
        if line.strip():
            key, ko, uz, en, ru = line.rstrip("\n").split("\t")
            examples[key] = {"ko": ko, "uz": uz, "en": en, "ru": ru}

missing = []
for n in range(1, 29):
    path = os.path.join(ROOT, f"data/lesson{n}.json")
    words = json.load(open(path, encoding="utf-8"))
    for word in words:
        key = f"{word['lesson']}-{word['id']}"
        if key in fixes:
            word["uzbek"] = fixes[key][0]
        if key in examples:
            word["example"] = examples[key]
        if key not in meanings:
            missing.append(key)
            continue
        english, russian = meanings[key]
        word["english"], word["russian"] = english, russian
    with open(path, "w", encoding="utf-8") as handle:
        json.dump(words, handle, ensure_ascii=False, indent=2)
        handle.write("\n")
print("missing:", missing or "none", "| translated:", len(meanings), "| examples:", len(examples))
