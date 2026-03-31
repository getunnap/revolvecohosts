import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

/** Most browsers become unstable above ~8k px; stay under for toDataURL + jsPDF. */
const MAX_CANVAS_EDGE = 8096;

/** html2canvas 1.x cannot parse modern color syntax (lab/oklch) from stylesheets. */
const UNSAFE_COLOR_FN = /lab\(|oklch\(|lch\(|color\(/i;

/** Per-capture cache: pairing walk hits the same (prop,value) many times. */
let colorResolveCache: Map<string, string | null> | null = null;

function isCssColorProperty(prop: string): boolean {
  return (
    prop === "color" ||
    prop === "background-color" ||
    prop === "text-decoration-color" ||
    prop === "outline-color" ||
    (prop.startsWith("border-") && prop.endsWith("-color"))
  );
}

/**
 * Let the browser resolve lab()/oklch() to rgb()/rgba() on a detached node, then read it back.
 * html2canvas only sees inline styles on the clone, so this avoids black fill bugs.
 */
function resolveColorFromComputed(prop: string, declaredValue: string): string | null {
  const v = declaredValue.trim();
  if (!v || v === "none") return null;
  const key = `${prop}\0${v}`;
  if (colorResolveCache?.has(key)) return colorResolveCache.get(key) ?? null;

  let result: string | null = null;
  try {
    const probe = document.createElement("div");
    probe.style.cssText =
      "position:fixed;left:-99999px;top:0;visibility:hidden;opacity:0;pointer-events:none;border:0;margin:0;padding:0;width:0;height:0;";
    probe.style.setProperty(prop, v);
    document.body.appendChild(probe);
    const out = getComputedStyle(probe).getPropertyValue(prop).trim();
    document.body.removeChild(probe);
    if (!out) {
      result = null;
    } else if (prop === "background-color" && (out === "rgba(0, 0, 0, 0)" || out === "transparent")) {
      result = "transparent";
    } else if (UNSAFE_COLOR_FN.test(out)) {
      result = null;
    } else {
      result = out;
    }
  } catch {
    result = null;
  }
  colorResolveCache?.set(key, result);
  return result;
}

function fallbackForUnresolvedColorProp(prop: string): string {
  if (prop === "background-color") return "transparent";
  if (prop === "outline-color" || (prop.startsWith("border-") && prop.endsWith("-color"))) {
    return "#d4d4d8";
  }
  if (prop === "color" || prop === "text-decoration-color") return "#0f172a";
  return "";
}

function shouldIgnorePdfNode(node: Element): boolean {
  return node.classList?.contains("pdf-ignore-logo") ?? false;
}

/**
 * Do NOT remove nodes: that shrinks the clone vs the live tree and breaks 1:1 pairing.
 * Hide controls we don't want in the PDF.
 */
function hidePdfExcludeOnClone(clonedDoc: Document) {
  clonedDoc.querySelectorAll<HTMLElement>("[data-pdf-exclude]").forEach((node) => {
    node.style.setProperty("display", "none", "important");
    node.style.setProperty("visibility", "hidden", "important");
    node.style.setProperty("height", "0", "important");
    node.style.setProperty("overflow", "hidden", "important");
    node.style.setProperty("margin", "0", "important");
    node.style.setProperty("padding", "0", "important");
  });
}

/** Drop Tailwind/Next stylesheets on the clone — we re-apply layout via computed inline styles. */
function stripPdfStylesheets(clonedDoc: Document) {
  clonedDoc.querySelectorAll('link[rel="stylesheet"]').forEach((n) => n.remove());
  clonedDoc.querySelectorAll("style").forEach((n) => n.remove());
  try {
    clonedDoc.adoptedStyleSheets = [];
  } catch {
    /* ignore */
  }
}

const INLINE_PROPS = [
  "color",
  "background-color",
  "background-image",
  "border-top-width",
  "border-right-width",
  "border-bottom-width",
  "border-left-width",
  "border-top-style",
  "border-right-style",
  "border-bottom-style",
  "border-left-style",
  "border-top-color",
  "border-right-color",
  "border-bottom-color",
  "border-left-color",
  "border-radius",
  "outline",
  "outline-width",
  "outline-style",
  "outline-color",
  "font-family",
  "font-size",
  "font-weight",
  "font-style",
  "line-height",
  "letter-spacing",
  "text-align",
  "text-transform",
  "text-decoration",
  "text-decoration-line",
  "text-decoration-color",
  "padding-top",
  "padding-right",
  "padding-bottom",
  "padding-left",
  "margin-top",
  "margin-right",
  "margin-bottom",
  "margin-left",
  "width",
  "max-width",
  "min-width",
  "height",
  "min-height",
  "max-height",
  "display",
  "flex-direction",
  "flex-wrap",
  "flex",
  "flex-grow",
  "flex-shrink",
  "align-items",
  "align-self",
  "justify-content",
  "justify-items",
  "gap",
  "row-gap",
  "column-gap",
  "grid-template-columns",
  "box-shadow",
  "opacity",
  "overflow",
  "overflow-x",
  "overflow-y",
  "visibility",
  "white-space",
  "word-break",
  "vertical-align",
  "position",
  "top",
  "right",
  "bottom",
  "left",
  "z-index",
] as const;

function safeSetProperty(el: HTMLElement, prop: string, value: string) {
  const v = value?.trim();
  if (!v) return;

  if (isCssColorProperty(prop)) {
    const resolved = resolveColorFromComputed(prop, v);
    if (resolved) {
      el.style.setProperty(prop, resolved);
      return;
    }
    if (!UNSAFE_COLOR_FN.test(v)) {
      el.style.setProperty(prop, v);
      return;
    }
    const fb = fallbackForUnresolvedColorProp(prop);
    if (fb) el.style.setProperty(prop, fb);
    return;
  }

  if (UNSAFE_COLOR_FN.test(v)) {
    if (prop === "background-image" || prop.includes("shadow")) {
      return;
    }
    return;
  }
  el.style.setProperty(prop, v);
}

function elementChildren(el: Element): Element[] {
  return Array.from(el.children);
}

/** Same-depth pairing: html2canvas clone may differ only inside excluded subtrees if we had removed nodes — we now hide instead. */
function inlineComputedStylesPaired(source: Element, clone: Element) {
  if (source.nodeName !== clone.nodeName) return;

  if (source instanceof HTMLElement && clone instanceof HTMLElement) {
    clone.removeAttribute("class");
    const cs = window.getComputedStyle(source);
    for (const prop of INLINE_PROPS) {
      const raw = cs.getPropertyValue(prop);
      if (prop === "background-image") {
        if (!raw || raw === "none") {
          clone.style.setProperty(prop, "none");
          continue;
        }
        if (UNSAFE_COLOR_FN.test(raw)) {
          clone.style.setProperty(prop, "none");
          const bgc = cs.getPropertyValue("background-color");
          if (bgc) safeSetProperty(clone, "background-color", bgc);
          continue;
        }
        safeSetProperty(clone, prop, raw);
        continue;
      }
      safeSetProperty(clone, prop, raw);
    }
    const bx = cs.getPropertyValue("box-shadow");
    if (bx && bx !== "none" && UNSAFE_COLOR_FN.test(bx)) {
      clone.style.setProperty("box-shadow", "none");
    }
  }

  const srcCh = elementChildren(source);
  const clCh = elementChildren(clone);
  const n = Math.min(srcCh.length, clCh.length);
  if (srcCh.length !== clCh.length) {
    console.warn(
      `[pdf] Sibling count mismatch at <${source.nodeName}> (${srcCh.length} vs ${clCh.length}).`,
    );
  }
  for (let i = 0; i < n; i++) {
    inlineComputedStylesPaired(srcCh[i], clCh[i]);
  }
}

/** Remove any remaining lab()/oklch( strings html2canvas might still read from inline styles. */
function purgeModernColorFunctions(root: HTMLElement) {
  const nodes = [root, ...root.querySelectorAll<HTMLElement>("*")];
  for (const el of nodes) {
    const st = el.style;
    const removeProps: string[] = [];
    for (let i = 0; i < st.length; i++) {
      const p = st.item(i);
      const v = st.getPropertyValue(p);
      if (UNSAFE_COLOR_FN.test(v)) removeProps.push(p);
    }
    for (const p of removeProps) {
      st.removeProperty(p);
      if (p === "background-color") {
        st.setProperty(p, "transparent");
        continue;
      }
      if (p === "outline-color" || (p.startsWith("border-") && p.endsWith("-color"))) {
        st.setProperty(p, "#d4d4d8");
        continue;
      }
      if (p === "color" || p === "text-decoration-color") {
        st.setProperty(p, "#0f172a");
      }
    }
  }
  root.querySelectorAll("svg, svg *").forEach((node) => {
    if (!(node instanceof Element)) return;
    for (const attr of ["fill", "stroke", "stop-color"]) {
      const v = node.getAttribute(attr);
      if (v && UNSAFE_COLOR_FN.test(v)) node.removeAttribute(attr);
    }
  });
}

function stripClassesOnClone(root: HTMLElement) {
  const all: Element[] = [root, ...root.querySelectorAll("*")];
  for (const el of all) {
    el.removeAttribute("class");
    el.removeAttribute("style");
  }
}

function sanitizeCloneForPdf(clonedDoc: Document, clonedRoot: HTMLElement) {
  const walk: HTMLElement[] = [clonedRoot];
  clonedRoot.querySelectorAll<HTMLElement>("*").forEach((el) => walk.push(el));
  for (const el of walk) {
    el.style.backdropFilter = "none";
    el.style.setProperty("-webkit-backdrop-filter", "none");
    el.style.filter = "none";
  }
  clonedRoot.querySelectorAll("header").forEach((h) => {
    const el = h as HTMLElement;
    el.style.position = "relative";
    el.style.top = "auto";
    el.style.zIndex = "0";
  });
}

function computeSafeScale(el: HTMLElement): number {
  if (typeof window === "undefined") return 1.25;
  const h = Math.max(el.scrollHeight, el.clientHeight, 1);
  const w = Math.max(el.scrollWidth, el.clientWidth, 1);
  const maxDim = Math.max(h, w);
  const cap = MAX_CANVAS_EDGE / maxDim;
  return Math.max(0.85, Math.min(1.75, Math.min(cap, (window.devicePixelRatio || 1) * 1.25)));
}

type RenderOpts = {
  scale?: number;
};

export async function renderNodeToCanvas(
  element: HTMLElement,
  opts?: RenderOpts,
): Promise<HTMLCanvasElement> {
  const scale = opts?.scale ?? computeSafeScale(element);

  return html2canvas(element, {
    scale,
    useCORS: true,
    allowTaint: false,
    logging: false,
    backgroundColor: "#ffffff",
    imageTimeout: 20000,
    foreignObjectRendering: false,
    ignoreElements: (node) => shouldIgnorePdfNode(node),
    onclone: (clonedDoc, clonedRoot) => {
      colorResolveCache = new Map();
      try {
        stripPdfStylesheets(clonedDoc);
        stripClassesOnClone(clonedRoot);
        inlineComputedStylesPaired(element, clonedRoot);
        hidePdfExcludeOnClone(clonedDoc);
        purgeModernColorFunctions(clonedRoot);
        sanitizeCloneForPdf(clonedDoc, clonedRoot);
      } finally {
        colorResolveCache = null;
      }
    },
  });
}

/** Append one tall image to the PDF, splitting across A4 pages when needed. */
export function appendCanvasMultipage(
  pdf: jsPDF,
  canvas: HTMLCanvasElement,
  insertPageBreakBefore: boolean,
) {
  let imgData: string;
  try {
    imgData = canvas.toDataURL("image/png", 0.92);
  } catch (err: unknown) {
    throw new Error(
      err instanceof Error
        ? err.message
        : "Canvas could not be exported (often caused by oversized capture).",
    );
  }

  if (!imgData || imgData.length < 100) {
    throw new Error("PDF image export returned empty data.");
  }

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();
  const imgWidth = pdfWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  if (insertPageBreakBefore) {
    pdf.addPage();
  }

  pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
  heightLeft -= pdfHeight;

  while (heightLeft > 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, "PNG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;
  }
}

/** Prefer automatic scale; retry at 1× if canvas rejects (blur / size limits). */
export async function renderNodeToCanvasWithFallback(
  element: HTMLElement,
): Promise<HTMLCanvasElement> {
  try {
    return await renderNodeToCanvas(element);
  } catch (first) {
    try {
      return await renderNodeToCanvas(element, { scale: 1 });
    } catch (second) {
      const msg =
        second instanceof Error ? second.message : String(second);
      throw new Error(
        msg || (first instanceof Error ? first.message : "html2canvas failed"),
      );
    }
  }
}

export async function downloadElementAsPdf(
  element: HTMLElement,
  filename: string,
): Promise<void> {
  const canvas = await renderNodeToCanvasWithFallback(element);
  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  appendCanvasMultipage(pdf, canvas, false);
  const name = filename.toLowerCase().endsWith(".pdf") ? filename : `${filename}.pdf`;
  pdf.save(name);
}

export async function delayForPaint(ms = 200) {
  await new Promise((r) => setTimeout(r, ms));
}

export function pdfFilenameForUrl(url: string, prefix: string): string {
  try {
    const host = new URL(url).hostname.replace(/[^a-z0-9]+/gi, "-").slice(0, 48);
    return `${prefix}-${host || "listing"}.pdf`;
  } catch {
    return `${prefix}.pdf`;
  }
}
