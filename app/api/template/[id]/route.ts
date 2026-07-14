import {
  readTemplateStructureFromJson,
  saveTemplateStructureToJson,
} from "@/modules/playground/lib/path-to-json";
import { db } from "@/lib/db";
import { templatePaths } from "@/lib/template";
import path from "path";
import fs from "fs/promises";
import { NextRequest, NextResponse } from "next/server";
import os from "os";

// Utility to validate JSON structure
function validateJsonStructure(data: unknown): boolean {
  try {
    JSON.parse(JSON.stringify(data)); // Ensures it's serializable
    return true;
  } catch (error) {
    console.error("Invalid JSON structure:", error);
    return false;
  }
}

// ✅ FIXED: context.params must be awaited in Next.js 15+
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params; // ✅ Await the params object
  console.log("✅ /api/template hit with id:", id);

  if (!id) {
    return NextResponse.json(
      { error: "Missing playground ID" },
      { status: 400 },
    );
  }

  const playground = await db.playground.findUnique({
    where: { id },
  });

  if (!playground) {
    return NextResponse.json(
      { error: "Playground not found" },
      { status: 404 },
    );
  }

  const templateKey = playground.template as keyof typeof templatePaths;
  const templatePath = templatePaths[templateKey];

  if (!templatePath) {
    return NextResponse.json({ error: "Invalid template" }, { status: 404 });
  }

  try {
    const inputPath = path.join(process.cwd(), templatePath);
    const outputDir = path.join(os.tmpdir(), "output");
    await fs.mkdir(outputDir, { recursive: true });

    const outputFile = path.join(outputDir, `${templateKey}.json`);

    await saveTemplateStructureToJson(inputPath, outputFile);
    const result = await readTemplateStructureFromJson(outputFile);

    // Validate the JSON structure before saving
    if (!validateJsonStructure(result.items)) {
      return NextResponse.json(
        { error: "Invalid JSON structure" },
        { status: 500 },
      );
    }

    await fs.unlink(outputFile);

    return NextResponse.json(
      { success: true, templateJson: result, playground },
      { status: 200 },
    );
  } catch (error) {
    console.error("Error generating template JSON:", error);
    return NextResponse.json(
      { error: "Failed to generate template" },
      { status: 500 },
    );
  }
}
