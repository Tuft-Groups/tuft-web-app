export {};

declare global {
  interface CustomJwtSessionClaims {
    metadata: {
      new_user?: boolean;
    };
  }
}

export type Analytics = {
  basic: {
    // Basic stats
    no_of_members: number;
    no_of_files: number;
    no_of_messages: number;
    no_of_feed: number;
    storage_used: number;
  };

  // Time series data
  active_users: Array<{
    date: string;
    date_formatted: string;
    active_users: number;
  }>;

  user_growth: Array<{
    date: string;
    date_formatted: string;
    new_users: number;
    cumulative_users: number;
  }>;

  messages: Array<{
    date: string;
    date_formatted: string;
    count: number;
  }>;

  feed: Array<{
    date: string;
    date_formatted: string;
    count: number;
  }>;

  top_users: Array<{
    name: string;
    user_id: number;
    message_count: number;
    percentage_of_total: number;
  }>;

  storage: Array<{
    date: string;
    date_formatted: string;
    storage_added_gb: number;
    cumulative_storage_gb: number;
  }>;

  bandwidth: Array<{
    date: string;
    date_formatted: string;
    bandwidth_gb: number;
  }>;
};
