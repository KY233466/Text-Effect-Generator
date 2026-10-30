const SVG_MIME_TYPE = "image/svg+xml";
const DEFAULT_PADDING = 2;

function assertFiniteNumber(value, name) {
  if (!Number.isFinite(value)) {
    throw new Error(`Invalid SVG ${name}`);
  }
}

export function createWarpedSvgBlob({
  d,
  bounds,
  fill = "#06001A",
  padding = DEFAULT_PADDING,
}) {
  if (!d || !d.trim()) {
    throw new Error("SVG path data is empty");
  }

  if (!bounds) {
    throw new Error("SVG bounds are unavailable");
  }

  const { minX, minY, width, height } = bounds;
  [minX, minY, width, height, padding].forEach((value, index) => {
    const names = ["minX", "minY", "width", "height", "padding"];
    assertFiniteNumber(value, names[index]);
  });

  if (width <= 0 || height <= 0 || padding < 0) {
    throw new Error("SVG bounds must have positive dimensions");
  }

  const viewBoxX = minX - padding;
  const viewBoxY = minY - padding;
  const svgWidth = width + padding * 2;
  const svgHeight = height + padding * 2;
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg"`,
    ` width="${svgWidth}" height="${svgHeight}"`,
    ` viewBox="${viewBoxX} ${viewBoxY} ${svgWidth} ${svgHeight}">`,
    `<path d="${d}" fill="${fill}" stroke="none"/>`,
    `</svg>`,
  ].join("");

  return new Blob([svg], { type: SVG_MIME_TYPE });
}

export async function insertWarpedSvg(documentApi, options) {
  if (!documentApi || typeof documentApi.addImage !== "function") {
    throw new Error("Adobe Express image import API is unavailable");
  }

  const blob = createWarpedSvgBlob(options);
  const startedAt = performance.now();

  await documentApi.addImage(blob, {
    title: "Warped text",
    author: "Text Warp Add-on",
  });

  const durationMs = performance.now() - startedAt;
  console.info(`Warped SVG inserted in ${durationMs.toFixed(1)}ms`);

  return { success: true, durationMs };
}
