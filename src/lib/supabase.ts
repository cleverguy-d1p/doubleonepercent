import {createClient, type SupabaseClient} from "@supabase/supabase-js";
let client: SupabaseClient | undefined;
export function getClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL;
 const key=process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
 if(!url || !key) throw new Error("Member onboarding is not open yet. Please check back soon.");
 return client ??= createClient(url,key);
}
