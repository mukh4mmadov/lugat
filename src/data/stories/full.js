import lessons01to07 from "./lessons01-07.js";
import lessons08to14 from "./lessons08-14.js";
import lessons15to21 from "./lessons15-21.js";
import lessons22to28 from "./lessons22-28.js";

// Every story with its full text. Only the server and the build read this
// file: the app gets ./public.js, where Premium stories stop after their
// opening lines (see scripts/split-stories.mjs).
export const FULL_STORIES = [...lessons01to07, ...lessons08to14, ...lessons15to21, ...lessons22to28];

// The second story of a lesson needs Premium.
export const isPremiumStoryId = (id) => String(id).endsWith("-b");
