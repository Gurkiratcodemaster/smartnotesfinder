import { promises as fs } from "fs";
import path from "path";
import os from "os";
import pLimit from "p-limit";
import { createWorker, PSM } from "tesseract.js";
import { createCanvas } from "canvas";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.js";
import sharp from "sharp";

// Add proper types
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

interface PDFPageProxy {
  getViewport(params: { scale: number }): any;
  render(context: any): { promise: Promise<void> };
}

function tempDir(prefix = "ocr-") {
  const id = Math.random().toString(36).slice(2, 10);
  return path.join(os.tmpdir(), `${prefix}${id}`);
}

class NodeCanvasFactory {
  create(width: number, height: number) {
    const canvas = createCanvas(width, height);
    const context = canvas.getContext("2d");
    return { canvas, context };
  }
  reset(canvasAndContext: any, width: number, height: number) {
    canvasAndContext.canvas.width = width;
    canvasAndContext.canvas.height = height;
  }
  destroy(canvasAndContext: any) {
    canvasAndContext.canvas = null;
    canvasAndContext.context = null;
  }
}

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const file = form.get("file") as File | null;

    if (!file) {
      return new Response(JSON.stringify({ error: "No file uploaded under field 'file'." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mime = (file.type || "").toLowerCase();
    const name = file.name || "upload";

    // Create work dir
    const work = tempDir();
    await fs.mkdir(work, { recursive: true });

    // We'll produce an array of PNG buffers (one per page/image)
    const renderedPages: Buffer[] = [];

    const isImage = mime.startsWith("image/") || /\.(png|jpe?g|jpe|tiff?|bmp|gif)$/i.test(name);

    if (isImage) {
      // Single image uploaded. Convert to PNG buffer for consistency / preprocessing
      const imageBuf = await sharp(buffer).png().toBuffer();
      const outPath = path.join(work, "page-0001.png");
      await fs.writeFile(outPath, imageBuf);
      renderedPages.push(imageBuf);
    } else {
      // Assume PDF — render pages with pdfjs-dist
      const loadingTask = getDocument({ data: buffer });
      const pdf = (await loadingTask.promise) as PDFDocumentProxy;

      const canvasFactory = new NodeCanvasFactory();

      for (let p = 1; p <= pdf.numPages; p++) {
        const page = await pdf.getPage(p);

        // scale controls rendered DPI; tune for OCR quality/perf
        const scale = 2.5; // ~180 DPI (adjust as desired)
        const viewport = page.getViewport({ scale });

        const canvasAndContext = canvasFactory.create(Math.ceil(viewport.width), Math.ceil(viewport.height));
        const renderContext = {
          canvasContext: canvasAndContext.context,
          viewport,
          canvasFactory,
        };

        const renderTask = page.render(renderContext);
        await renderTask.promise;

        const pngBuffer = canvasAndContext.canvas.toBuffer("image/png");
        const pngPath = path.join(work, `page-${String(p).padStart(4, "0")}.png`);
        await fs.writeFile(pngPath, pngBuffer);
        renderedPages.push(pngBuffer);

        canvasFactory.destroy(canvasAndContext);
      }
    }

    if (renderedPages.length === 0) {
      return new Response(JSON.stringify({ error: "No pages/images to OCR." }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // OCR with tesseract.js worker pool
    const cpuCount = Math.max(1, (os.cpus()?.length || 2) - 1);
    const poolSize = Math.min(cpuCount, renderedPages.length);
    const limit = pLimit(Math.max(1, poolSize));
    const pageTexts = new Array<string>(renderedPages.length);

    const workers = await Promise.all(
      Array.from({ length: poolSize }).map(async (_, idx) => {
        const worker = await createWorker('eng');
        await worker.setParameters({
          tessedit_ocr_engine_mode: "1",
          tessedit_pageseg_mode: PSM.AUTO,
        });
        return worker;
      })
    );

    const jobs = renderedPages.map((buf, i) =>
      limit(async () => {
        try {
          // Optional preprocessing: grayscale/thresholding to improve OCR
          const procBuf = await sharp(buf).grayscale().normalize().threshold(180).png().toBuffer();

          const worker = workers[i % poolSize];
          const { data } = await worker.recognize(procBuf);
          pageTexts[i] = data?.text ? String(data.text) : "";
        } catch (err: any) {
          console.error("tesseract.js error for page", i + 1, err);
          pageTexts[i] = `ERROR: Tesseract failed on page ${i + 1}: ${err?.message ?? String(err)}`;
        }
      })
    );

    await Promise.all(jobs);

    try {
      await Promise.all(workers.map((w) => w.terminate()));
    } catch (e) {
      console.warn("Worker termination failed:", e);
    }

    const full = pageTexts.join("\n\n--- PAGE BREAK ---\n\n");

    // Cleanup
    try {
      const tmpFiles = await fs.readdir(work);
      await Promise.all(tmpFiles.map((f) => fs.unlink(path.join(work, f))));
      await fs.rmdir(work);
    } catch (cleanupErr) {
      console.warn("Cleanup failed:", cleanupErr);
    }

    return new Response(JSON.stringify({ text: full, perPage: pageTexts }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Unexpected error in /api/extract-ocr:", err);
    return new Response(JSON.stringify({ error: err?.message ?? String(err) }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}