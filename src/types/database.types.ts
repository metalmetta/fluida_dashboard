export type TopUpStatus = 'pending' | 'completed' | 'failed' | 'cancelled';

export interface Database {
  public: {
    Tables: {
      actions: {
        Row: {
          id: string;
          type: string;
          amount: number;
          status: string;
          approvals_required: number;
          approvals_received: number;
          user_id: string;
          reference_id?: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          amount: number;
          status: string;
          approvals_required: number;
          approvals_received: number;
          user_id: string;
          reference_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          amount?: number;
          status?: string;
          approvals_required?: number;
          approvals_received?: number;
          user_id?: string;
          reference_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "actions_reference_id_fkey";
            columns: ["reference_id"];
            referencedRelation: "top_ups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "actions_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      top_ups: {
        Row: {
          id: string;
          user_id: string;
          bank_account_id: string;
          amount: number;
          currency: string;
          status: TopUpStatus;
          transaction_reference: string;
          created_at: string;
          updated_at: string;
          completed_at: string | null;
          error_message: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          bank_account_id: string;
          amount: number;
          currency: string;
          status?: TopUpStatus;
          transaction_reference: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          bank_account_id?: string;
          amount?: number;
          currency?: string;
          status?: TopUpStatus;
          transaction_reference?: string;
          created_at?: string;
          updated_at?: string;
          completed_at?: string | null;
          error_message?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "top_ups_bank_account_id_fkey";
            columns: ["bank_account_id"];
            referencedRelation: "bank_accounts";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "top_ups_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      // Add other tables as needed
    };
  };
} 