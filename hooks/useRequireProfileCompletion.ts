import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export function useRequireProfileCompletion(loading: boolean) {
  const router = useRouter();

  useEffect(() => {
    if (loading) return; // Wait until loading is false
    async function checkProfile() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return; // Not signed in

      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Check for required fields (customize as needed)
      if (!profile || !profile.dob || !profile.first_name || !profile.last_name) {
        router.replace('/finish-signup');
      }
    }
    checkProfile();
  }, [router, loading]);
} 