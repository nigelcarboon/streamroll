// Hand-written to match supabase/migrations/0001-0003.
// Once the Supabase project is live, regenerate with:
//   npx supabase gen types typescript --project-id <ref> > src/lib/types/database.ts

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          region: string;
          onboarded: boolean;
          created_at: string;
        };
        Insert: {
          id: string;
          region?: string;
          onboarded?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          region?: string;
          onboarded?: boolean;
          created_at?: string;
        };
        Relationships: [];
      };
      services: {
        Row: {
          id: string;
          name: string;
          colour: string;
          is_free: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          colour: string;
          is_free?: boolean;
        };
        Update: {
          id?: string;
          name?: string;
          colour?: string;
          is_free?: boolean;
        };
        Relationships: [];
      };
      roster_slots: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          month: number;
          year: number;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          month: number;
          year: number;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          month?: number;
          year?: number;
        };
        Relationships: [];
      };
      watchlist_items: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          tmdb_id: number | null;
          matched_service_id: string | null;
          status: "unwatched" | "watched";
          source: "manual" | "paste";
          added_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title: string;
          tmdb_id?: number | null;
          matched_service_id?: string | null;
          status?: "unwatched" | "watched";
          source?: "manual" | "paste";
          added_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          tmdb_id?: number | null;
          matched_service_id?: string | null;
          status?: "unwatched" | "watched";
          source?: "manual" | "paste";
          added_at?: string;
        };
        Relationships: [];
      };
      user_services: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
        };
        Relationships: [];
      };
      reminder_log: {
        Row: {
          id: string;
          user_id: string;
          service_id: string;
          sent_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          service_id: string;
          sent_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          service_id?: string;
          sent_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
