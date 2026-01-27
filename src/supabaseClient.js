import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = "https://cbgykgcvcyiigyjajnoz.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_fQO-TyK-GMXSqMK6NRTvPQ_f31mZ6z8"

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

