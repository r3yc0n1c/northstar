export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: { extensions?: Json; operationName?: string; query?: string; variables?: Json };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      cycles: {
        Row: {
          created_at: string;
          cycle_type: string;
          end_date: string;
          id: string;
          name: string;
          start_date: string;
          status: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          cycle_type: string;
          end_date: string;
          id?: string;
          name: string;
          start_date: string;
          status?: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          cycle_type?: string;
          end_date?: string;
          id?: string;
          name?: string;
          start_date?: string;
          status?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'cycles_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      domains: {
        Row: {
          archived_at: string | null;
          color: string;
          created_at: string;
          icon: string;
          id: string;
          name: string;
          sort_order: number;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          name: string;
          sort_order?: number;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          archived_at?: string | null;
          color?: string;
          created_at?: string;
          icon?: string;
          id?: string;
          name?: string;
          sort_order?: number;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'domains_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      goals: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string;
          domain_id: string | null;
          id: string;
          priority: string;
          start_date: string | null;
          status: string;
          target_date: string | null;
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string;
          domain_id?: string | null;
          id?: string;
          priority?: string;
          start_date?: string | null;
          status?: string;
          target_date?: string | null;
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string;
          domain_id?: string | null;
          id?: string;
          priority?: string;
          start_date?: string | null;
          status?: string;
          target_date?: string | null;
          title?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'goals_domain_fk';
            columns: ['workspace_id', 'domain_id'];
            isOneToOne: false;
            referencedRelation: 'domains';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'goals_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      key_results: {
        Row: {
          archived_at: string | null;
          baseline_value: number;
          confidence: number | null;
          created_at: string;
          currency_code: string | null;
          current_value: number;
          description: string | null;
          direction: string | null;
          due_date: string;
          id: string;
          metric_type: string;
          objective_id: string;
          start_date: string;
          target_value: number;
          title: string;
          unit: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          baseline_value: number;
          confidence?: number | null;
          created_at?: string;
          currency_code?: string | null;
          current_value: number;
          description?: string | null;
          direction?: string | null;
          due_date: string;
          id?: string;
          metric_type: string;
          objective_id: string;
          start_date: string;
          target_value: number;
          title: string;
          unit?: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          archived_at?: string | null;
          baseline_value?: number;
          confidence?: number | null;
          created_at?: string;
          currency_code?: string | null;
          current_value?: number;
          description?: string | null;
          direction?: string | null;
          due_date?: string;
          id?: string;
          metric_type?: string;
          objective_id?: string;
          start_date?: string;
          target_value?: number;
          title?: string;
          unit?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_key_results_objective_workspace';
            columns: ['workspace_id', 'objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'key_results_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      kr_check_ins: {
        Row: {
          confidence: number | null;
          created_at: string;
          evidence_url: string | null;
          id: string;
          key_result_id: string;
          notes: string | null;
          progress_percent: number;
          raw_progress_percent: number;
          recorded_at: string;
          recorded_by: string;
          supersedes_id: string | null;
          value: number;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          confidence?: number | null;
          created_at?: string;
          evidence_url?: string | null;
          id?: string;
          key_result_id: string;
          notes?: string | null;
          progress_percent: number;
          raw_progress_percent: number;
          recorded_at?: string;
          recorded_by: string;
          supersedes_id?: string | null;
          value: number;
          workspace_id: string;
        };
        Update: {
          confidence?: number | null;
          created_at?: string;
          evidence_url?: string | null;
          id?: string;
          key_result_id?: string;
          notes?: string | null;
          progress_percent?: number;
          raw_progress_percent?: number;
          recorded_at?: string;
          recorded_by?: string;
          supersedes_id?: string | null;
          value?: number;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'fk_kr_check_ins_key_result_workspace';
            columns: ['workspace_id', 'key_result_id'];
            isOneToOne: false;
            referencedRelation: 'key_results';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'kr_check_ins_supersedes_id_fkey';
            columns: ['supersedes_id'];
            isOneToOne: false;
            referencedRelation: 'kr_check_ins';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'kr_check_ins_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      labels: {
        Row: {
          color: string;
          created_at: string;
          id: string;
          name: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          color?: string;
          created_at?: string;
          id?: string;
          name: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          color?: string;
          created_at?: string;
          id?: string;
          name?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'labels_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      objectives: {
        Row: {
          archived_at: string | null;
          confidence: number | null;
          created_at: string;
          cycle_id: string;
          description: string;
          due_date: string;
          goal_id: string | null;
          id: string;
          priority: string;
          start_date: string;
          status: string;
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          confidence?: number | null;
          created_at?: string;
          cycle_id: string;
          description?: string;
          due_date: string;
          goal_id?: string | null;
          id?: string;
          priority?: string;
          start_date: string;
          status?: string;
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          archived_at?: string | null;
          confidence?: number | null;
          created_at?: string;
          cycle_id?: string;
          description?: string;
          due_date?: string;
          goal_id?: string | null;
          id?: string;
          priority?: string;
          start_date?: string;
          status?: string;
          title?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'objectives_cycle_fk';
            columns: ['workspace_id', 'cycle_id'];
            isOneToOne: false;
            referencedRelation: 'cycles';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'objectives_goal_fk';
            columns: ['workspace_id', 'goal_id'];
            isOneToOne: false;
            referencedRelation: 'goals';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'objectives_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          created_at: string;
          currency_code: string;
          display_name: string;
          id: string;
          locale: string;
          onboarding_completed_at: string | null;
          timezone: string;
          updated_at: string;
          week_starts_on: number;
          working_days: number[];
          working_hours: NonNullable<Json>;
        };
        ComputedFields: never;
        Insert: {
          avatar_url?: string | null;
          created_at?: string;
          currency_code?: string;
          display_name?: string;
          id: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          timezone?: string;
          updated_at?: string;
          week_starts_on?: number;
          working_days?: number[];
          working_hours?: NonNullable<Json>;
        };
        Update: {
          avatar_url?: string | null;
          created_at?: string;
          currency_code?: string;
          display_name?: string;
          id?: string;
          locale?: string;
          onboarding_completed_at?: string | null;
          timezone?: string;
          updated_at?: string;
          week_starts_on?: number;
          working_days?: number[];
          working_hours?: NonNullable<Json>;
        };
        Relationships: [];
      };
      project_key_results: {
        Row: {
          created_at: string;
          key_result_id: string;
          project_id: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          key_result_id: string;
          project_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          key_result_id?: string;
          project_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_key_results_kr_fk';
            columns: ['workspace_id', 'key_result_id'];
            isOneToOne: false;
            referencedRelation: 'key_results';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'project_key_results_project_fk';
            columns: ['workspace_id', 'project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'project_key_results_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      project_milestones: {
        Row: {
          completed_at: string | null;
          created_at: string;
          due_date: string | null;
          id: string;
          project_id: string;
          sort_order: number;
          status: string;
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          completed_at?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          project_id: string;
          sort_order?: number;
          status?: string;
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          completed_at?: string | null;
          created_at?: string;
          due_date?: string | null;
          id?: string;
          project_id?: string;
          sort_order?: number;
          status?: string;
          title?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_milestones_project_fk';
            columns: ['workspace_id', 'project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'project_milestones_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      project_objectives: {
        Row: {
          created_at: string;
          objective_id: string;
          project_id: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          objective_id: string;
          project_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          objective_id?: string;
          project_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'project_objectives_objective_fk';
            columns: ['workspace_id', 'objective_id'];
            isOneToOne: false;
            referencedRelation: 'objectives';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'project_objectives_project_fk';
            columns: ['workspace_id', 'project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'project_objectives_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      projects: {
        Row: {
          archived_at: string | null;
          created_at: string;
          description: string;
          domain_id: string | null;
          due_date: string | null;
          id: string;
          priority: string;
          start_date: string | null;
          status: string;
          title: string;
          updated_at: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          archived_at?: string | null;
          created_at?: string;
          description?: string;
          domain_id?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string;
          start_date?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          workspace_id: string;
        };
        Update: {
          archived_at?: string | null;
          created_at?: string;
          description?: string;
          domain_id?: string | null;
          due_date?: string | null;
          id?: string;
          priority?: string;
          start_date?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'projects_domain_fk';
            columns: ['workspace_id', 'domain_id'];
            isOneToOne: false;
            referencedRelation: 'domains';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'projects_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      task_labels: {
        Row: {
          created_at: string;
          label_id: string;
          task_id: string;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          label_id: string;
          task_id: string;
          workspace_id: string;
        };
        Update: {
          created_at?: string;
          label_id?: string;
          task_id?: string;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'task_labels_label_fk';
            columns: ['workspace_id', 'label_id'];
            isOneToOne: false;
            referencedRelation: 'labels';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'task_labels_task_fk';
            columns: ['workspace_id', 'task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'task_labels_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      tasks: {
        Row: {
          board_rank: number;
          completed_at: string | null;
          created_at: string;
          created_by: string | null;
          deleted_at: string | null;
          description: string;
          due_at: string | null;
          due_date: string | null;
          estimated_minutes: number | null;
          id: string;
          key_result_id: string | null;
          parent_task_id: string | null;
          planned_date: string | null;
          planned_end_at: string | null;
          planned_start_at: string | null;
          priority: string;
          project_id: string | null;
          status: string;
          title: string;
          updated_at: string;
          updated_by: string | null;
          version: number;
          workspace_id: string;
        };
        ComputedFields: never;
        Insert: {
          board_rank?: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string;
          due_at?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          key_result_id?: string | null;
          parent_task_id?: string | null;
          planned_date?: string | null;
          planned_end_at?: string | null;
          planned_start_at?: string | null;
          priority?: string;
          project_id?: string | null;
          status?: string;
          title: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          workspace_id: string;
        };
        Update: {
          board_rank?: number;
          completed_at?: string | null;
          created_at?: string;
          created_by?: string | null;
          deleted_at?: string | null;
          description?: string;
          due_at?: string | null;
          due_date?: string | null;
          estimated_minutes?: number | null;
          id?: string;
          key_result_id?: string | null;
          parent_task_id?: string | null;
          planned_date?: string | null;
          planned_end_at?: string | null;
          planned_start_at?: string | null;
          priority?: string;
          project_id?: string | null;
          status?: string;
          title?: string;
          updated_at?: string;
          updated_by?: string | null;
          version?: number;
          workspace_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tasks_key_result_fk';
            columns: ['workspace_id', 'key_result_id'];
            isOneToOne: false;
            referencedRelation: 'key_results';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'tasks_parent_task_fk';
            columns: ['workspace_id', 'parent_task_id'];
            isOneToOne: false;
            referencedRelation: 'tasks';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'tasks_project_fk';
            columns: ['workspace_id', 'project_id'];
            isOneToOne: false;
            referencedRelation: 'projects';
            referencedColumns: ['workspace_id', 'id'];
          },
          {
            foreignKeyName: 'tasks_workspace_id_fkey';
            columns: ['workspace_id'];
            isOneToOne: false;
            referencedRelation: 'workspaces';
            referencedColumns: ['id'];
          },
        ];
      };
      workspaces: {
        Row: {
          created_at: string;
          id: string;
          name: string;
          owner_id: string;
          updated_at: string;
          vision: string;
        };
        ComputedFields: never;
        Insert: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id: string;
          updated_at?: string;
          vision?: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          name?: string;
          owner_id?: string;
          updated_at?: string;
          vision?: string;
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
    Views: {
      [_ in never]: never;
    };
    Functions: {
      is_workspace_owner: { Args: { ws: string }; Returns: boolean };
      kr_progress: {
        Args: {
          baseline: number;
          current: number;
          direction: string;
          metric_type: string;
          target: number;
        };
        Returns: number;
      };
      record_kr_check_in: {
        Args: {
          p_confidence?: number;
          p_evidence_url?: string;
          p_key_result_id: string;
          p_notes?: string;
          p_recorded_at?: string;
          p_supersedes_id?: string;
          p_value: number;
        };
        Returns: {
          confidence: number | null;
          created_at: string;
          evidence_url: string | null;
          id: string;
          key_result_id: string;
          notes: string | null;
          progress_percent: number;
          raw_progress_percent: number;
          recorded_at: string;
          recorded_by: string;
          supersedes_id: string | null;
          value: number;
          workspace_id: string;
        };
        SetofOptions: {
          from: '*';
          to: 'kr_check_ins';
          isOneToOne: true;
          isSetofReturn: false;
        };
      };
      validate_working_hours: { Args: { wh: Json }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, 'public'>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] & DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const;
