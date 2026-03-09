const FREE_MONTHLY_LIMIT = 0;

export async function checkUsage(userId: string): Promise<{
  allowed: boolean;
  used: number;
  limit: number;
}> {
  return {
    allowed: true,
    used: 0,
    limit: FREE_MONTHLY_LIMIT,
  };
}

export async function incrementUsage(userId: string): Promise<void> {
  return;
}
