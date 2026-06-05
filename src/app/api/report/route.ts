import { NextResponse } from "next/server";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { PDFFont, PDFPage } from "pdf-lib";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const pdf = await PDFDocument.create();
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const pageSize: [number, number] = [595.28, 841.89];
  const margin = 48;

  const cover = pdf.addPage(pageSize);
  cover.drawRectangle({ x: 0, y: 0, width: pageSize[0], height: pageSize[1], color: rgb(0.02, 0.02, 0.025) });
  cover.drawText("Lingjing Oracle", { x: margin, y: 740, size: 30, font: bold, color: rgb(0.83, 0.69, 0.22) });
  cover.drawText("30 Day Destiny Report", { x: margin, y: 708, size: 14, font: regular, color: rgb(0.92, 0.88, 0.74) });
  cover.drawText("Entertainment and self-exploration only. Not a real-world prediction.", {
    x: margin,
    y: 674,
    size: 10,
    font: regular,
    color: rgb(0.88, 0.84, 0.72)
  });

  let page = pdf.addPage(pageSize);
  page.drawText("Report Snapshot", { x: margin, y: 780, size: 18, font: bold, color: rgb(0.06, 0.06, 0.07) });

  const content = [
    "Destiny Analysis",
    summarize("fortune", body.fortune),
    "Tarot Result",
    summarize("tarot", body.tarot),
    "Soul Portrait",
    summarize("soul", body.soul),
    "Next 30 Days",
    "Week 1: Clarify one main priority and remove low-value obligations.",
    "Week 2: Use direct communication instead of assumption.",
    "Week 3: Turn one idea into a visible artifact, even as a small version.",
    "Week 4: Review recent patterns, rest, and choose the next cycle intentionally.",
    "Notice: Entertainment and self-exploration only. Not a real-world prediction."
  ].join("\n\n");

  const lines = wrapText(content, 78);
  let y = 748;
  for (const line of lines) {
    if (y < 52) {
      y = 780;
      page = pdf.addPage(pageSize);
      drawReportLine(page, line, margin, y, regular);
    } else {
      drawReportLine(page, line, margin, y, regular);
    }
    y -= 14;
  }

  const bytes = await pdf.save();
  const arrayBuffer = bytes.buffer.slice(bytes.byteOffset, bytes.byteOffset + bytes.byteLength) as ArrayBuffer;
  return new NextResponse(arrayBuffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": 'attachment; filename="lingjing-oracle-report.pdf"'
    }
  });
}

function wrapText(value: string, maxChars: number) {
  return value.split("\n").flatMap((line) => {
    if (line.length <= maxChars) return [line];
    const chunks: string[] = [];
    for (let i = 0; i < line.length; i += maxChars) {
      chunks.push(line.slice(i, i + maxChars));
    }
    return chunks;
  });
}

function drawReportLine(
  page: PDFPage,
  line: string,
  x: number,
  y: number,
  font: PDFFont
) {
  page.drawText(line, {
    x,
    y,
    size: 10,
    font,
    color: rgb(0.08, 0.08, 0.09)
  });
}

function summarize(label: string, value: unknown) {
  const raw = JSON.stringify(value || {}, null, 2);
  const ascii = raw.replace(/[^\x20-\x7E\n]/g, "");
  return ascii.trim() || `${label} generated in the app. Full localized text is visible on the web page.`;
}
