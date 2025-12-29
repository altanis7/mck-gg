import { createClient } from '@supabase/supabase-js';

// 환경 변수 확인
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// 클라이언트용 (브라우저 및 서버 컴포넌트)
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 서버 전용 (API 라우트) - Service Role Key 사용
if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY 환경 변수가 설정되지 않았습니다');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
