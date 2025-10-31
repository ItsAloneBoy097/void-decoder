export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      comment_reactions: {
        Row: {
          comment_id: string
          created_at: string
          emoji: string
          id: string
          user_id: string
        }
        Insert: {
          comment_id: string
          created_at?: string
          emoji: string
          id?: string
          user_id: string
        }
        Update: {
          comment_id?: string
          created_at?: string
          emoji?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comment_reactions_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comment_reports: {
        Row: {
          comment_id: string
          created_at: string
          details: string | null
          id: string
          reason: string
          reporter_id: string
          status: string | null
        }
        Insert: {
          comment_id: string
          created_at?: string
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          status?: string | null
        }
        Update: {
          comment_id?: string
          created_at?: string
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comment_reports_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          created_at: string
          deleted: boolean | null
          edited: boolean | null
          id: string
          locked: boolean | null
          parent_id: string | null
          pinned: boolean | null
          reaction_count: number | null
          reply_count: number | null
          resource_id: string
          text: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          deleted?: boolean | null
          edited?: boolean | null
          id?: string
          locked?: boolean | null
          parent_id?: string | null
          pinned?: boolean | null
          reaction_count?: number | null
          reply_count?: number | null
          resource_id: string
          text: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          deleted?: boolean | null
          edited?: boolean | null
          id?: string
          locked?: boolean | null
          parent_id?: string | null
          pinned?: boolean | null
          reaction_count?: number | null
          reply_count?: number | null
          resource_id?: string
          text?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      dependencies: {
        Row: {
          created_at: string | null
          dependency_id: string
          id: string
          is_required: boolean | null
          resource_id: string
        }
        Insert: {
          created_at?: string | null
          dependency_id: string
          id?: string
          is_required?: boolean | null
          resource_id: string
        }
        Update: {
          created_at?: string | null
          dependency_id?: string
          id?: string
          is_required?: boolean | null
          resource_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dependencies_dependency_id_fkey"
            columns: ["dependency_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dependencies_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      dismissed_resources: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dismissed_resources_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      email_queue: {
        Row: {
          created_at: string
          error: string | null
          id: string
          notification_ids: string[]
          scheduled_at: string
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          notification_ids: string[]
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          notification_ids?: string[]
          scheduled_at?: string
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: []
      }
      follows: {
        Row: {
          created_at: string
          id: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          target_id: string
          target_type: Database["public"]["Enums"]["follow_target_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          target_id?: string
          target_type?: Database["public"]["Enums"]["follow_target_type"]
          user_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          category_community: boolean | null
          category_creator: boolean | null
          category_moderation: boolean | null
          category_system: boolean | null
          created_at: string | null
          do_not_disturb_until: string | null
          email_enabled: boolean | null
          email_frequency: string | null
          event_comments: boolean | null
          event_mentions: boolean | null
          event_milestones: boolean | null
          event_new_upload: boolean | null
          event_reactions: boolean | null
          event_resource_update: boolean | null
          event_reviews: boolean | null
          id: string
          in_app_enabled: boolean | null
          sound_enabled: boolean | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          category_community?: boolean | null
          category_creator?: boolean | null
          category_moderation?: boolean | null
          category_system?: boolean | null
          created_at?: string | null
          do_not_disturb_until?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          event_comments?: boolean | null
          event_mentions?: boolean | null
          event_milestones?: boolean | null
          event_new_upload?: boolean | null
          event_reactions?: boolean | null
          event_resource_update?: boolean | null
          event_reviews?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          category_community?: boolean | null
          category_creator?: boolean | null
          category_moderation?: boolean | null
          category_system?: boolean | null
          created_at?: string | null
          do_not_disturb_until?: string | null
          email_enabled?: boolean | null
          email_frequency?: string | null
          event_comments?: boolean | null
          event_mentions?: boolean | null
          event_milestones?: boolean | null
          event_new_upload?: boolean | null
          event_reactions?: boolean | null
          event_resource_update?: boolean | null
          event_reviews?: boolean | null
          id?: string
          in_app_enabled?: boolean | null
          sound_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          actor_id: string | null
          category: string
          created_at: string | null
          event: Database["public"]["Enums"]["notification_event"] | null
          group_key: string | null
          grouped: boolean | null
          icon: string | null
          id: string
          link: string | null
          message: string
          read: boolean | null
          resource_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          actor_id?: string | null
          category: string
          created_at?: string | null
          event?: Database["public"]["Enums"]["notification_event"] | null
          group_key?: string | null
          grouped?: boolean | null
          icon?: string | null
          id?: string
          link?: string | null
          message: string
          read?: boolean | null
          resource_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          actor_id?: string | null
          category?: string
          created_at?: string | null
          event?: Database["public"]["Enums"]["notification_event"] | null
          group_key?: string | null
          grouped?: boolean | null
          icon?: string | null
          id?: string
          link?: string | null
          message?: string
          read?: boolean | null
          resource_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          average_rating: number | null
          banner_url: string | null
          bio: string | null
          created_at: string | null
          email: string
          id: string
          premium: boolean | null
          social_discord: string | null
          social_github: string | null
          social_twitter: string | null
          social_youtube: string | null
          total_downloads: number | null
          total_followers: number | null
          total_uploads: number | null
          updated_at: string | null
          username: string
          verified: boolean | null
        }
        Insert: {
          avatar_url?: string | null
          average_rating?: number | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email: string
          id: string
          premium?: boolean | null
          social_discord?: string | null
          social_github?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          total_downloads?: number | null
          total_followers?: number | null
          total_uploads?: number | null
          updated_at?: string | null
          username: string
          verified?: boolean | null
        }
        Update: {
          avatar_url?: string | null
          average_rating?: number | null
          banner_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string
          id?: string
          premium?: boolean | null
          social_discord?: string | null
          social_github?: string | null
          social_twitter?: string | null
          social_youtube?: string | null
          total_downloads?: number | null
          total_followers?: number | null
          total_uploads?: number | null
          updated_at?: string | null
          username?: string
          verified?: boolean | null
        }
        Relationships: []
      }
      ratings: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          score: number
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          score: number
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          score?: number
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ratings_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      recommendations: {
        Row: {
          created_at: string | null
          id: string
          reason: string | null
          resource_id: string
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reason?: string | null
          resource_id: string
          score?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reason?: string | null
          resource_id?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recommendations_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_files: {
        Row: {
          changelog: string | null
          download_count: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          is_primary: boolean | null
          minecraft_version: string | null
          resource_id: string
          uploaded_at: string | null
          version_label: string
        }
        Insert: {
          changelog?: string | null
          download_count?: number | null
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id?: string
          is_primary?: boolean | null
          minecraft_version?: string | null
          resource_id: string
          uploaded_at?: string | null
          version_label?: string
        }
        Update: {
          changelog?: string | null
          download_count?: number | null
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          is_primary?: boolean | null
          minecraft_version?: string | null
          resource_id?: string
          uploaded_at?: string | null
          version_label?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_files_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_images: {
        Row: {
          display_order: number | null
          id: string
          image_type: string
          image_url: string
          resource_id: string
          uploaded_at: string | null
        }
        Insert: {
          display_order?: number | null
          id?: string
          image_type: string
          image_url: string
          resource_id: string
          uploaded_at?: string | null
        }
        Update: {
          display_order?: number | null
          id?: string
          image_type?: string
          image_url?: string
          resource_id?: string
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "resource_images_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      resource_tags: {
        Row: {
          created_at: string | null
          id: string
          resource_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          resource_id: string
          tag_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          resource_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "resource_tags_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "resource_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "tags"
            referencedColumns: ["id"]
          },
        ]
      }
      resources: {
        Row: {
          average_rating: number | null
          created_at: string | null
          creator_id: string
          description: string | null
          featured: boolean | null
          id: string
          license: Database["public"]["Enums"]["license_type"] | null
          minecraft_version: string | null
          price: number | null
          published_at: string | null
          rating_count: number | null
          search_vector: unknown
          slug: string
          title: string
          total_downloads: number | null
          total_views: number | null
          trending_score: number | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at: string | null
          visibility: Database["public"]["Enums"]["resource_visibility"] | null
        }
        Insert: {
          average_rating?: number | null
          created_at?: string | null
          creator_id: string
          description?: string | null
          featured?: boolean | null
          id?: string
          license?: Database["public"]["Enums"]["license_type"] | null
          minecraft_version?: string | null
          price?: number | null
          published_at?: string | null
          rating_count?: number | null
          search_vector?: unknown
          slug: string
          title: string
          total_downloads?: number | null
          total_views?: number | null
          trending_score?: number | null
          type: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["resource_visibility"] | null
        }
        Update: {
          average_rating?: number | null
          created_at?: string | null
          creator_id?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          license?: Database["public"]["Enums"]["license_type"] | null
          minecraft_version?: string | null
          price?: number | null
          published_at?: string | null
          rating_count?: number | null
          search_vector?: unknown
          slug?: string
          title?: string
          total_downloads?: number | null
          total_views?: number | null
          trending_score?: number | null
          type?: Database["public"]["Enums"]["resource_type"]
          updated_at?: string | null
          visibility?: Database["public"]["Enums"]["resource_visibility"] | null
        }
        Relationships: []
      }
      review_flags: {
        Row: {
          created_at: string | null
          details: string | null
          id: string
          reason: string
          reporter_id: string
          review_id: string
        }
        Insert: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason: string
          reporter_id: string
          review_id: string
        }
        Update: {
          created_at?: string | null
          details?: string | null
          id?: string
          reason?: string
          reporter_id?: string
          review_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_flags_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_helpful: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_helpful_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_reactions: {
        Row: {
          created_at: string | null
          id: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          reaction_type: string
          review_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          reaction_type?: string
          review_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_reactions_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      review_replies: {
        Row: {
          created_at: string | null
          id: string
          review_id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          review_id: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          review_id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "review_replies_review_id_fkey"
            columns: ["review_id"]
            isOneToOne: false
            referencedRelation: "reviews"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          created_at: string | null
          flagged: boolean | null
          helpful_count: number | null
          hidden: boolean | null
          id: string
          images: string[] | null
          rating_id: string
          resource_id: string
          text: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          flagged?: boolean | null
          helpful_count?: number | null
          hidden?: boolean | null
          id?: string
          images?: string[] | null
          rating_id: string
          resource_id: string
          text: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          flagged?: boolean | null
          helpful_count?: number | null
          hidden?: boolean | null
          id?: string
          images?: string[] | null
          rating_id?: string
          resource_id?: string
          text?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_rating_id_fkey"
            columns: ["rating_id"]
            isOneToOne: false
            referencedRelation: "ratings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      tags: {
        Row: {
          created_at: string | null
          id: string
          name: string
          slug: string
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          slug: string
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          slug?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      trending_metrics: {
        Row: {
          comments_24h: number | null
          downloads_24h: number | null
          id: string
          likes_24h: number | null
          resource_id: string
          trending_score: number | null
          updated_at: string | null
          views_24h: number | null
        }
        Insert: {
          comments_24h?: number | null
          downloads_24h?: number | null
          id?: string
          likes_24h?: number | null
          resource_id: string
          trending_score?: number | null
          updated_at?: string | null
          views_24h?: number | null
        }
        Update: {
          comments_24h?: number | null
          downloads_24h?: number | null
          id?: string
          likes_24h?: number | null
          resource_id?: string
          trending_score?: number | null
          updated_at?: string | null
          views_24h?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trending_metrics_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: true
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity: {
        Row: {
          action_type: string
          created_at: string | null
          id: string
          resource_id: string
          user_id: string
          weight: number | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          id?: string
          resource_id: string
          user_id: string
          weight?: number | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          id?: string
          resource_id?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_resource_id_fkey"
            columns: ["resource_id"]
            isOneToOne: false
            referencedRelation: "resources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_interests: {
        Row: {
          created_at: string | null
          followed_creators: string[] | null
          followed_tags: string[] | null
          id: string
          preferred_resource_types: string[] | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          followed_creators?: string[] | null
          followed_tags?: string[] | null
          id?: string
          preferred_resource_types?: string[] | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          followed_creators?: string[] | null
          followed_tags?: string[] | null
          id?: string
          preferred_resource_types?: string[] | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_trending_score: {
        Args: { resource_id_param: string }
        Returns: number
      }
      create_notification: {
        Args: {
          p_category: string
          p_icon?: string
          p_link?: string
          p_message: string
          p_title: string
          p_type: string
          p_user_id: string
        }
        Returns: string
      }
      generate_slug: {
        Args: { creator_id: string; title: string }
        Returns: string
      }
      get_follower_count: {
        Args: {
          p_target_id: string
          p_target_type: Database["public"]["Enums"]["follow_target_type"]
        }
        Returns: number
      }
      get_unread_notification_count: {
        Args: { p_user_id: string }
        Returns: number
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_download_count: {
        Args: { file_id: string }
        Returns: undefined
      }
      increment_view_count: { Args: { res_id: string }; Returns: undefined }
      is_following: {
        Args: {
          p_target_id: string
          p_target_type: Database["public"]["Enums"]["follow_target_type"]
          p_user_id: string
        }
        Returns: boolean
      }
      update_trending_scores: { Args: never; Returns: undefined }
    }
    Enums: {
      app_role: "user" | "creator" | "moderator" | "admin"
      follow_target_type: "creator" | "resource" | "tag"
      license_type:
        | "mit"
        | "gpl"
        | "cc_by"
        | "cc_by_sa"
        | "cc0"
        | "apache"
        | "all_rights_reserved"
        | "custom"
      notification_event:
        | "new_upload"
        | "resource_update"
        | "new_comment"
        | "comment_reply"
        | "mention"
        | "new_review"
        | "review_reply"
        | "reaction"
        | "milestone"
        | "system_announcement"
        | "moderation_action"
        | "tag_match"
      resource_type:
        | "map"
        | "plugin"
        | "mod"
        | "modpack"
        | "resource_pack"
        | "texture_pack"
        | "shader"
        | "skin"
        | "schematic"
        | "datapack"
        | "world"
        | "seed"
        | "build"
        | "script"
        | "other"
      resource_visibility: "draft" | "public" | "private" | "premium"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "creator", "moderator", "admin"],
      follow_target_type: ["creator", "resource", "tag"],
      license_type: [
        "mit",
        "gpl",
        "cc_by",
        "cc_by_sa",
        "cc0",
        "apache",
        "all_rights_reserved",
        "custom",
      ],
      notification_event: [
        "new_upload",
        "resource_update",
        "new_comment",
        "comment_reply",
        "mention",
        "new_review",
        "review_reply",
        "reaction",
        "milestone",
        "system_announcement",
        "moderation_action",
        "tag_match",
      ],
      resource_type: [
        "map",
        "plugin",
        "mod",
        "modpack",
        "resource_pack",
        "texture_pack",
        "shader",
        "skin",
        "schematic",
        "datapack",
        "world",
        "seed",
        "build",
        "script",
        "other",
      ],
      resource_visibility: ["draft", "public", "private", "premium"],
    },
  },
} as const
