export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      actions: {
        Row: {
          amount: number
          approvals_received: number
          approvals_required: number
          created_at: string
          id: string
          invoice_id: string | null
          status: string
          top_up_id: string | null
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          approvals_received?: number
          approvals_required?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          status: string
          top_up_id?: string | null
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          approvals_received?: number
          approvals_required?: number
          created_at?: string
          id?: string
          invoice_id?: string | null
          status?: string
          top_up_id?: string | null
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "actions_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_top_up_id_fkey"
            columns: ["top_up_id"]
            isOneToOne: false
            referencedRelation: "top_ups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "actions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bank_accounts: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          currency: string
          id: string
          last_synced_at: string | null
          name: string
          plaid_access_token: string | null
          plaid_account_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          currency: string
          id?: string
          last_synced_at?: string | null
          name: string
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          currency?: string
          id?: string
          last_synced_at?: string | null
          name?: string
          plaid_access_token?: string | null
          plaid_account_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "bank_accounts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          date: string
          description: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          status: string
          updated_at: string
          user_id: string | null
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          date: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          date?: string
          description?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_vendor_id_fkey"
            columns: ["vendor_id"]
            isOneToOne: false
            referencedRelation: "vendors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      top_ups: {
        Row: {
          amount: number
          bank_account_id: string
          completed_at: string | null
          created_at: string
          currency: string
          error_message: string | null
          id: string
          status: Database["public"]["Enums"]["top_up_status"] | null
          transaction_reference: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bank_account_id: string
          completed_at?: string | null
          created_at?: string
          currency: string
          error_message?: string | null
          id?: string
          status?: Database["public"]["Enums"]["top_up_status"] | null
          transaction_reference?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bank_account_id?: string
          completed_at?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          id?: string
          status?: Database["public"]["Enums"]["top_up_status"] | null
          transaction_reference?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "top_ups_bank_account_id_fkey"
            columns: ["bank_account_id"]
            isOneToOne: false
            referencedRelation: "bank_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      vendors: {
        Row: {
          address: string
          bank_account_number: string | null
          bank_holder_name: string | null
          bank_name: string | null
          bank_routing_number: string | null
          country: string
          created_at: string
          email: string
          id: string
          last_payment_date: string | null
          name: string
          status: string
          updated_at: string
          user_id: string | null
          wallet_address: string | null
        }
        Insert: {
          address: string
          bank_account_number?: string | null
          bank_holder_name?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          country: string
          created_at?: string
          email: string
          id?: string
          last_payment_date?: string | null
          name: string
          status?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Update: {
          address?: string
          bank_account_number?: string | null
          bank_holder_name?: string | null
          bank_name?: string | null
          bank_routing_number?: string | null
          country?: string
          created_at?: string
          email?: string
          id?: string
          last_payment_date?: string | null
          name?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          wallet_address?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vendors_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      top_up_status: "pending" | "completed" | "failed" | "cancelled"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
