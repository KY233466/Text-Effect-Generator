import { limitText } from "./textLimit.js";

export const EDITOR_DRAFT_STORAGE_KEY = "text-warp-expanded-editor-draft";

export const DEFAULT_EDITOR_STATE = Object.freeze({
  activeTab: "text",
  text: "TEXT WARP\nMULTI LINE",
  fontUrl: "./fonts/Arial.ttf",
  lineHeight: 1.2,
  letterSpacing: 0,
  alignment: "center",
  warpType: "wave",
  intensity: 50,
});

const clampNumber = (value, fallback, min, max) => {
  const number = Number(value);
  return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
};

const normalizeBounds = (bounds) => {
  if (!bounds || typeof bounds !== "object") return null;

  const normalized = {
    minX: Number(bounds.minX),
    minY: Number(bounds.minY),
    maxX: Number(bounds.maxX),
    maxY: Number(bounds.maxY),
    width: Number(bounds.width),
    height: Number(bounds.height),
  };

  return Object.values(normalized).every(Number.isFinite) ? normalized : null;
};

const normalizeCustomEffect = (effect) => {
  const bounds = normalizeBounds(effect?.bounds);
  if (typeof effect?.d !== "string" || !effect.d || !bounds) return null;

  return {
    d: effect.d,
    bounds,
    originalText: limitText(effect.originalText ?? ""),
    warpType: effect.warpType === "custom-smudge" ? "custom-smudge" : "custom-mesh",
    type: effect.type === "smudge" ? "smudge" : "mesh",
    intensity: 1,
  };
};

export const normalizeEditorState = (value = {}) => ({
  activeTab: ["text", "warp", "custom"].includes(value.activeTab)
    ? value.activeTab
    : DEFAULT_EDITOR_STATE.activeTab,
  text: limitText(value.text ?? DEFAULT_EDITOR_STATE.text),
  fontUrl: typeof value.fontUrl === "string"
    ? value.fontUrl
    : DEFAULT_EDITOR_STATE.fontUrl,
  lineHeight: clampNumber(value.lineHeight, DEFAULT_EDITOR_STATE.lineHeight, 0.8, 2.5),
  letterSpacing: clampNumber(value.letterSpacing, DEFAULT_EDITOR_STATE.letterSpacing, 0, 20),
  alignment: ["left", "center", "right"].includes(value.alignment)
    ? value.alignment
    : DEFAULT_EDITOR_STATE.alignment,
  warpType: typeof value.warpType === "string"
    ? value.warpType
    : DEFAULT_EDITOR_STATE.warpType,
  intensity: clampNumber(value.intensity, DEFAULT_EDITOR_STATE.intensity, 0, 100),
  customEffect: normalizeCustomEffect(value.customEffect),
});
