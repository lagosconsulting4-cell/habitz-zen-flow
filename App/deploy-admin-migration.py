#!/usr/bin/env python3
"""
Deploy Admin System Migration to Supabase
Uses psycopg2 to connect directly to PostgreSQL
"""

import sys

try:
    import psycopg2
    from psycopg2 import sql
except ImportError:
    print("psycopg2 not installed. Installing...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "psycopg2-binary"])
    import psycopg2
    from psycopg2 import sql

# Supabase connection details
PROJECT_REF = "jbucnphyrziaxupdsnbn"
# Try pooler first (session mode for DDL)
DB_HOST = f"aws-0-sa-east-1.pooler.supabase.com"
DB_PORT = 5432  # Direct connection port for DDL statements
DB_NAME = "postgres"
DB_USER = "postgres"
DB_PASSWORD = "Trendly2025@"

# Read migration file
migration_file = "supabase/migrations/20251211000000_admin_system.sql"

print("Deploying Admin System Migration to Supabase\n")
print(f"Reading migration file: {migration_file}")

try:
    with open(migration_file, 'r', encoding='utf-8') as f:
        migration_sql = f.read()
    print(f"OK: Read {len(migration_sql)} characters\n")
except FileNotFoundError:
    print(f"ERROR: Migration file not found: {migration_file}")
    sys.exit(1)

print(f"Connecting to Supabase PostgreSQL...")
print(f"   Host: {DB_HOST}")
print(f"   Database: {DB_NAME}")
print(f"   User: {DB_USER}\n")

try:
    # Connect to Supabase PostgreSQL
    conn = psycopg2.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        sslmode='require'
    )

    print("OK: Connected successfully!\n")
    print("Executing migration SQL...\n")

    # Create cursor
    cur = conn.cursor()

    # Execute the entire migration
    cur.execute(migration_sql)

    # Commit the transaction
    conn.commit()

    print("OK: Migration executed successfully!\n")

    # Verify the changes
    print("Verifying migration results...\n")

    # Check if is_admin column exists
    cur.execute("""
        SELECT column_name
        FROM information_schema.columns
        WHERE table_name = 'profiles'
        AND column_name IN ('is_admin', 'admin_since')
    """)
    columns = cur.fetchall()
    print(f"   OK: profiles table columns: {[c[0] for c in columns]}")

    # Check if admin_audit_log table exists
    cur.execute("""
        SELECT EXISTS (
            SELECT FROM information_schema.tables
            WHERE table_name = 'admin_audit_log'
        )
    """)
    audit_exists = cur.fetchone()[0]
    print(f"   OK: admin_audit_log table exists: {audit_exists}")

    # Check if functions were created
    cur.execute("""
        SELECT routine_name
        FROM information_schema.routines
        WHERE routine_schema = 'public'
        AND routine_name LIKE '%admin%'
        ORDER BY routine_name
    """)
    functions = cur.fetchall()
    print(f"   OK: Admin functions created: {len(functions)}")
    for func in functions:
        print(f"      - {func[0]}")

    # Check if views were created
    cur.execute("""
        SELECT table_name
        FROM information_schema.views
        WHERE table_schema = 'public'
        AND table_name LIKE 'admin_%'
        ORDER BY table_name
    """)
    views = cur.fetchall()
    print(f"   OK: Admin views created: {len(views)}")
    for view in views:
        print(f"      - {view[0]}")

    # Close cursor and connection
    cur.close()
    conn.close()

    print("\n" + "="*60)
    print("SUCCESS: MIGRATION COMPLETED!")
    print("="*60)
    print("\nNext Steps:")
    print("1. Get your user UUID from the app console:")
    print("   (await supabase.auth.getUser()).data.user.id")
    print("\n2. Make yourself admin by running this SQL:")
    print("   UPDATE profiles SET is_admin = true, admin_since = now()")
    print("   WHERE user_id = 'YOUR-UUID-HERE';")
    print("\n3. Reload the app and check for the 'Admin' link in sidebar")

except psycopg2.Error as e:
    print(f"ERROR: PostgreSQL Error: {e}")
    print(f"   Error Code: {e.pgcode}")
    print(f"   Error Message: {e.pgerror}")
    sys.exit(1)
except Exception as e:
    print(f"ERROR: Unexpected Error: {e}")
    sys.exit(1)
