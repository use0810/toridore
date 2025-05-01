import getCurrentUserWithRetry from '@/lib/session';
import storeSupabase from '@/lib/storeSupabase';

const checkUserStore = async () => {
 const user = await getCurrentUserWithRetry();

 if (!user) return { user: null, store: null };

 const { data: store } = await storeSupabase
   .from('stores')
   .select('id')
   .eq('auth_user_id', user.id)
   .maybeSingle();

 return { user, store };
};

export default checkUserStore;