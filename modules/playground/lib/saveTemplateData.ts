import fs from "fs";
import path from "path";
import os from "os";
import { TemplateFolder } from "./path-to-json";

export async function saveTemplateData(
  playgroundId: string,
  data: TemplateFolder,
) {
  try {
    // Writable on Vercel
    const outputDir = path.join(os.tmpdir(), "output");
    const filePath = path.join(outputDir, `${playgroundId}.json`);

    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");

    console.log(`✅ Template structure saved to ${filePath}`);
  } catch (err) {
    console.error("❌ Failed to save template data:", err);
  }
}
