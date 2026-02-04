import { init, remove } from "./count_badge";
export { CountBadgeOptions } from "./count_badge";
export const CountBadgeUtils = { init, remove };

import { initTag, initTags, removeTag, addTag } from "./tag";
export { SingleTagOptions, MultiTagOptions, TagsOptions } from "./tag";
export const TagUtils = { initTag, initTags, removeTag, addTag };

import { init as NoteMarkerInit } from "./note_marker";
export { IMarkerOptions } from "./note_marker";
export const NoteMarkerUtils = { init: NoteMarkerInit };

import { init as LinkInit } from "./link";
export { LinkOptions } from "./link";
export const LinkUtils = { init: LinkInit };

import { init as ProgressInit, update } from "./progress";
export { IProgressOptions, IProgressUpdateOptions } from "./progress";
export const ProgressUtils = { init: ProgressInit, update };
