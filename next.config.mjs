/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bgotkjqweuzdcvspbcxb.supabase.co',
    NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJnb3RranF3ZXV6ZGN2c3BiY3hiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE5MjM5NjksImV4cCI6MjA3NzQ5OTk2OX0.RL9NiK_4GaEIxEiM8NiolsMxNHPWfRKSFYxbEcC9eYs'
  }
};

export default nextConfig;
