"use client";

import { useState, useEffect, useCallback } from "react";
import { toast } from "sonner";
import { getPlaygroundById, SaveUpdatedCode } from "../actions";
import type { TemplateFolder } from "../lib/path-to-json";

export interface PlaygroundData {
  id: string;
  title?: string | null; // ✅ Allow null or undefined safely
  templateFiles?: { content: string }[];
  [key: string]: any;
}

interface UsePlaygroundReturn {
  playgroundData: PlaygroundData | null;
  templateData: TemplateFolder | null;
  isLoading: boolean;
  error: string | null;
  loadPlayground: () => Promise<void>;
  saveTemplateData: (data: TemplateFolder) => Promise<void>;
}

export const usePlayground = (id: string): UsePlaygroundReturn => {
  const [playgroundData, setPlaygroundData] = useState<PlaygroundData | null>(
    null
  );
  const [templateData, setTemplateData] = useState<TemplateFolder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Load playground by ID
  const loadPlayground = useCallback(async () => {
    if (!id) return;

    try {
      setIsLoading(true);
      setError(null);

      const data = await getPlaygroundById(id);
      if (!data) throw new Error("No playground found");

      // ✅ Ensure `title` is normalized
      setPlaygroundData({
        ...data,
        title: data.title ?? undefined,
      });

      // ✅ Extract template JSON from content
      const rawContent = data?.templateFiles?.[0]?.content;
      if (typeof rawContent === "string") {
        try {
          const parsedContent = JSON.parse(rawContent);
          setTemplateData(parsedContent);
          toast.success("Playground loaded successfully");
          return;
        } catch {
          console.warn(
            "Failed to parse stored JSON, loading from API instead..."
          );
        }
      }

      // ✅ If template not embedded, fetch from API
      const res = await fetch(`/api/template/${id}`);
      if (!res.ok) throw new Error(`Failed to load template: ${res.status}`);

      const templateRes = await res.json();

      if (templateRes.templateJson && Array.isArray(templateRes.templateJson)) {
        setTemplateData({
          id: "root",
          type: "folder",
          folderName: "Root",
          items: templateRes.templateJson,
        });
      } else {
        setTemplateData(
          templateRes.templateJson || {
            id: "root",
            type: "folder",
            folderName: "Root",
            items: [],
          }
        );
      }

      toast.success("Template loaded successfully");
    } catch (error) {
      console.error("❌ Error loading playground:", error);
      setError("Failed to load playground data");
      toast.error("Failed to load playground data");
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  // ✅ Save updated template
  const saveTemplateData = useCallback(
    async (data: TemplateFolder) => {
      try {
        await SaveUpdatedCode(id, data);
        setTemplateData(data);
        toast.success("Changes saved successfully");
      } catch (error) {
        console.error("Error saving template data:", error);
        toast.error("Failed to save changes");
        throw error;
      }
    },
    [id]
  );

  useEffect(() => {
    loadPlayground();
  }, [loadPlayground]);

  return {
    playgroundData,
    templateData,
    isLoading,
    error,
    loadPlayground,
    saveTemplateData,
  };
};
