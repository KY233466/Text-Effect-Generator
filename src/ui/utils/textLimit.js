export const MAX_TEXT_CHARACTERS = 100;

const graphemeSegmenter = typeof Intl !== "undefined" && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: "grapheme" })
  : null;

const getCharacters = (value = "") => {
  const text = String(value);

  if (graphemeSegmenter) {
    return Array.from(graphemeSegmenter.segment(text), ({ segment }) => segment);
  }

  // Array.from is code-point aware, which is safer than String#slice in older
  // runtimes even though it cannot keep every joined emoji sequence together.
  return Array.from(text);
};

export const countTextCharacters = (value) => getCharacters(value).length;

export const limitText = (value, limit = MAX_TEXT_CHARACTERS) =>
  getCharacters(value).slice(0, limit).join("");
