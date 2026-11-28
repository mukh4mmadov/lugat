import part1 from "./part1.js";
import part2 from "./part2.js";
import part3 from "./part3.js";
import part4 from "./part4.js";

export const FULL_STORIES = [...part1, ...part2, ...part3, ...part4];

export const isPremiumStoryId = (id) => String(id).endsWith("-b");
