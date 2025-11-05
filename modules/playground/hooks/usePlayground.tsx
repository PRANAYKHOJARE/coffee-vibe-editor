"use client";

import { useEffect, useState } from "react";

export function usePlayground(id?: string) {
  const [templateData, setTemplateData] = useState<any>(null);
  const [playgroundData, setPlaygroundData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchData = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/template/${id}`);
        const data = await res.json();
        console.log("📦 API Response:", data); // <-- Add this log

        if (!res.ok) throw new Error(data.error || "Failed to load template");

        // ✅ Adjust this to your real API structure
        const templateJson =
          data.templateJson || data.data?.templateJson || null;
        const playgroundJson = data.playground || data.data?.playground || null;

        setTemplateData(templateJson);
        setPlaygroundData(playgroundJson);
      } catch (err: any) {
        console.error("❌ usePlayground error:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const saveTemplateData = async () => {
    console.log("Saving template data not yet implemented.");
  };

  return { templateData, playgroundData, isLoading, error, saveTemplateData };
}
