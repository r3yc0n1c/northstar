export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          display_name: string;
          avatar_url: string | null;
          timezone: string;
          locale: string;
          currency_code: string;
          week_starts_on: number;
          working_days: number[];
          working_hours: Json;
          onboarding_completed_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          display_name?: string;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          currency_code?: string;
          week_starts_on?: number;
          working_days?: number[];
          working_hours?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          display_name?: string;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          currency_code?: string;
          week_starts_on?: number;
          working_days?: number[];
          working_hours?: Json;
          onboarding_completed_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'profiles_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      workspaces: {
        Row: {
          id: string;
          owner_id: string;
          name: string;
          vision: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          owner_id: string;
          name?: string;
          vision?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          owner_id?: string;
          name?: string;
          vision?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'workspaces_owner_id_fkey';
            columns: ['owner_id'];
            isOneToOne: true;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: {
      is_workspace_owner: {
        Args: {
          ws: string;
        };
        Returns: boolean;
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row'];
export type Profile = Tables<'profiles'>;
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update'];
export type Workspace = Tables<'workspaces'>;
export type WorkspaceUpdate = Database['public']['Tables']['workspaces']['Update'];
