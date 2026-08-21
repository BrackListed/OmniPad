import { createClient } from "@supabase/supabase-js"

export const PDF_BUCKET = "pdfs"

export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
)
