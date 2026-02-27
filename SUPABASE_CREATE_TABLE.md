Steps to create the `otp_codes` table in Supabase

1) Using the Supabase web UI (recommended):
   - Open your Supabase project
   - Go to "SQL Editor"
   - Create a new query and paste the contents of `supabase/migrations/001_create_otp_codes.sql`
   - Run the query

2) Using the Supabase CLI (requires CLI installed and authenticated):
   - Save the SQL file locally (already in `supabase/migrations/001_create_otp_codes.sql`)
   - Run:
     ```bash
     supabase sql "$(cat supabase/migrations/001_create_otp_codes.sql)"
     ```

3) Using psql (if you have a direct DB connection string):
   - Connect with psql and run the SQL file, e.g.:
     ```bash
     psql "<your_supabase_db_connection>" -f supabase/migrations/001_create_otp_codes.sql
     ```

Notes:
- Ensure you use the Service Role key for server-side operations in your functions (`SUPABASE_SERVICE_KEY`).
- After creating the table, verify it appears under Schema → public → Tables in Supabase.
- If Row Level Security (RLS) is enabled, either use the service role key for inserts or add a policy allowing the insert for the service role.
