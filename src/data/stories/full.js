import part1 from "./part1.js";
import part2 from "./part2.js";
import part3 from "./part3.js";
import part4 from "./part4.js";

// Every story with its full text. Only the server and the build read this
// file: the app gets ./public.js, where Premium stories stop after their
// opening lines (see scripts/split-stories.mjs).
export const FULL_STORIES = [...part1, ...part2, ...part3, ...part4];

// Stories whose id ends in "-b" need Premium.
export const isPremiumStoryId = (id) => String(id).endsWith("-b");
