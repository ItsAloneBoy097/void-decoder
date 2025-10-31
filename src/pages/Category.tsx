import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { ResourceCard } from "@/components/resources/ResourceCard";
import { ResourceCardSkeleton } from "@/components/resources/ResourceCardSkeleton";
import { Map, Package, Wrench, Box, Sparkles, Palette } from "lucide-react";

const categoryIcons: Record<string, any> = {
  maps: Map,
  mods: Package,
  plugins: Wrench,
  "resource-packs": Box,
  shaders: Sparkles,
  skins: Palette,
};

const categoryNames: Record<string, string> = {
  maps: "Maps",
  mods: "Mods",
  plugins: "Plugins",
  "resource-packs": "Resource Packs",
  shaders: "Shaders",
  skins: "Skins",
};

import { mockResources } from "@/data/mockData";

export default function Category() {
  const { category } = useParams<{ category: string }>();
  const [isLoading, setIsLoading] = useState(true);

  const CategoryIcon = categoryIcons[category || ""] || Map;
  const categoryName = categoryNames[category || ""] || "Category";

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [category]);

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Header */}
        <section className="border-b border-border bg-gradient-to-br from-background to-card">
          <div className="container mx-auto px-4 md:px-6 py-8">
            <div className="flex items-center gap-3 mb-2">
              <CategoryIcon className="h-8 w-8 text-primary" />
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-cyan bg-clip-text text-transparent">{categoryName}</span>
              </h1>
            </div>
            <p className="text-muted-foreground">
              Browse all {categoryName.toLowerCase()} resources
            </p>
          </div>
        </section>

        {/* Resources Grid */}
        <div className="container mx-auto px-4 md:px-6 py-8">
          <div className="grid gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ResourceCardSkeleton key={i} />)
              : mockResources.map((resource) => (
                  <ResourceCard key={resource.id} {...resource} />
                ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
