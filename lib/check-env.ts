export function checkEnvVars() {
  const missingVars: string[] = [];

  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_URL');
  }
  
  if (!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('YOUR_')) {
    missingVars.push('NEXT_PUBLIC_SUPABASE_ANON_KEY');
  }

  return {
    isValid: missingVars.length === 0,
    missingVars,
    instructions: missingVars.length > 0 
      ? `Missing environment variables: ${missingVars.join(', ')}\n\n` +
        `Please update .env.local with your Supabase credentials:\n` +
        `1. Go to: https://supabase.com/dashboard/project/fhdthidolwyetbghopbp/settings/api\n` +
        `2. Copy the "anon public" key\n` +
        `3. Update .env.local file\n` +
        `4. Restart the dev server`
      : 'All environment variables are set!'
  };
}
