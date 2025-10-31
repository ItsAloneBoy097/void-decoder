import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Download, Star, Eye, Heart, Flag, Share2, Calendar, User2 } from "lucide-react";
import { ReviewSection } from "@/components/reviews/ReviewSection";
import { CommentSection } from "@/components/comments/CommentSection";
import { useAuth } from "@/hooks/useAuth";

import { mockResourceDetail } from "@/data/mockData";

const resourceData = mockResourceDetail;

export default function ResourceDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const resource = resourceData; // In real app, fetch by id

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="min-h-screen">
          {/* Hero Skeleton */}
          <Skeleton className="h-64 md:h-96 lg:h-[500px] w-full rounded-none" />
          
          <div className="container mx-auto px-4 md:px-6 -mt-16 md:-mt-32 relative z-10">
            <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
              {/* Main Content Skeleton */}
              <div className="lg:col-span-2 space-y-6 md:space-y-8">
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-4">
                  <Skeleton className="h-8 w-3/4" />
                  <Skeleton className="h-6 w-1/2" />
                  <div className="flex gap-4">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card">
                  <Skeleton className="h-6 w-32 mb-4" />
                  <Skeleton className="h-32 w-full" />
                </div>
              </div>
              
              {/* Sidebar Skeleton */}
              <div className="space-y-6">
                <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-4">
                  <Skeleton className="h-12 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen">
        {/* Hero Image */}
        <div className="relative h-64 md:h-96 lg:h-[500px] overflow-hidden border-b border-border">
          <img
            src={resource.images[0]}
            alt={resource.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        </div>

        <div className="container mx-auto px-4 md:px-6 -mt-16 md:-mt-32 relative z-10">
          <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6 md:space-y-8">
              {/* Header */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-3 md:space-y-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="bg-gradient-cyan text-primary-foreground text-xs">
                        {resource.category}
                      </Badge>
                      <span className="text-xs md:text-sm text-muted-foreground">{resource.version}</span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold break-words">{resource.title}</h1>
                  </div>
                  <div className="flex gap-1 md:gap-2 flex-shrink-0">
                    <Button size="icon" variant="glass" className="h-9 w-9 md:h-10 md:w-10">
                      <Heart className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button size="icon" variant="glass" className="h-9 w-9 md:h-10 md:w-10">
                      <Share2 className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                    <Button size="icon" variant="glass" className="h-9 w-9 md:h-10 md:w-10">
                      <Flag className="h-4 w-4 md:h-5 md:w-5" />
                    </Button>
                  </div>
                </div>

                {/* Stats */}
                <div className="flex flex-wrap items-center gap-3 md:gap-6 text-xs md:text-sm">
                  <div className="flex items-center gap-1 md:gap-2">
                    <Download className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <span className="font-medium">{resource.downloads.toLocaleString()}</span>
                    <span className="text-muted-foreground hidden sm:inline">downloads</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Eye className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground" />
                    <span className="font-medium">{resource.views.toLocaleString()}</span>
                    <span className="text-muted-foreground hidden sm:inline">views</span>
                  </div>
                  <div className="flex items-center gap-1 md:gap-2">
                    <Star className="h-3 w-3 md:h-4 md:w-4 text-primary fill-current" />
                    <span className="font-medium">{resource.rating}</span>
                    <span className="text-muted-foreground hidden sm:inline">rating</span>
                  </div>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {resource.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Description */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">About</h2>
                <div className="prose prose-invert max-w-none">
                  <pre className="whitespace-pre-wrap font-sans text-xs md:text-sm text-muted-foreground leading-relaxed">
                    {resource.description}
                  </pre>
                </div>
              </div>

              {/* Gallery */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card">
                <h2 className="text-xl md:text-2xl font-bold mb-3 md:mb-4">Gallery</h2>
                <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2">
                  {resource.images.slice(1).map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-video overflow-hidden rounded-lg border border-border cursor-pointer hover:border-primary/40 transition-colors"
                    >
                      <img
                        src={image}
                        alt={`Screenshot ${index + 1}`}
                        className="h-full w-full object-cover transition-transform duration-300 hover:scale-110"
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Reviews & Ratings Section */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card">
                <h2 className="text-xl md:text-2xl font-bold mb-6">Reviews & Ratings</h2>
                <ReviewSection
                  resourceId={resource.id}
                  creatorId={resource.author.id}
                  currentUserId={user?.id}
                />
              </div>

              {/* Comments Section */}
              <CommentSection 
                resourceId={resource.id}
                creatorId={resource.author.id}
              />
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-6">
              {/* Download Card */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-3 md:space-y-4">
                <Button variant="glow" size="lg" className="w-full h-11 md:h-12">
                  <Download className="h-4 w-4 md:h-5 md:w-5" />
                  Download Now
                </Button>
                
                <div className="space-y-2 text-xs md:text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">File Size:</span>
                    <span className="font-medium">{resource.fileSize}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Game Version:</span>
                    <span className="font-medium">{resource.gameVersions.join(", ")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">License:</span>
                    <span className="font-medium break-words">{resource.license}</span>
                  </div>
                </div>
              </div>

              {/* Author Card */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-3 md:space-y-4">
                <h3 className="text-sm md:text-base font-semibold">Created by</h3>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-full bg-gradient-cyan flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm md:text-base font-medium truncate">{resource.author.name}</p>
                    <p className="text-xs md:text-sm text-muted-foreground">
                      {resource.author.uploads} uploads · {resource.author.followers.toLocaleString()} followers
                    </p>
                  </div>
                </div>
                <Button variant="glass" className="w-full h-10 md:h-11">
                  <User2 className="h-3 w-3 md:h-4 md:w-4" />
                  View Profile
                </Button>
              </div>

              {/* Info Card */}
              <div className="rounded-xl border border-border bg-card/80 backdrop-blur-sm p-4 md:p-6 shadow-card space-y-3">
                <h3 className="text-sm md:text-base font-semibold mb-3 md:mb-4">Information</h3>
                <div className="space-y-3 text-xs md:text-sm">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Published</p>
                      <p className="font-medium">{new Date(resource.uploadDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-muted-foreground">Last Updated</p>
                      <p className="font-medium">{new Date(resource.lastUpdate).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
