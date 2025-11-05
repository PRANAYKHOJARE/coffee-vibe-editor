"use server";

import { db } from "@/lib/db";
import { TemplateFolder } from "../lib/path-to-json";
import { currentUser } from "@/modules/auth/actions";

export interface PlaygroundData {
  id: string;
  title?: string | null;
  templateFiles?: { content: string | null }[];
}

/**
 * Get playground details by ID
 */
export const getPlaygroundById = async (
  id: string
): Promise<PlaygroundData | null> => {
  try {
    const playground = await db.playground.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        templateFiles: {
          select: { content: true },
        },
      },
    });

    if (!playground) return null;

    // ✅ Explicitly match the PlaygroundData type
    const result: PlaygroundData = {
      id: playground.id,
      title: playground.title ?? null,
      templateFiles: playground.templateFiles ?? [],
    };

    return result;
  } catch (error) {
    console.error("❌ getPlaygroundById error:", error);
    return null; // ✅ Ensures consistent return type
  }
};

/**
 * Save or update template content for a playground
 */
export const SaveUpdatedCode = async (
  playgroundId: string,
  data: TemplateFolder
) => {
  const user = await currentUser();
  if (!user) return null;

  try {
    const updatedPlayground = await db.templateFile.upsert({
      where: {
        playgroundId,
      },
      update: {
        content: JSON.stringify(data),
      },
      create: {
        playgroundId,
        content: JSON.stringify(data),
      },
    });

    return updatedPlayground;
  } catch (error) {
    console.error("❌ SaveUpdatedCode error:", error);
    return null;
  }
};
