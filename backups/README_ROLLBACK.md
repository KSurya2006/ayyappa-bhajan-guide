# Backup & Disaster Recovery Rollback Procedure
## Project: Ayyappa Bhajan Guide (Nellore Pilot)

### 1. Database Backup & Restore

#### A. Active Pre-Launch Backup
- Snapshot file: `backups/ayyappa_db_backup_prelaunch.db`
- Verified schema: SQLite with WAL mode, tables `admins`, `bhajans`, `announcements`, `content_blocks`, `audit_logs`.
- Atomic snapshot created using `better-sqlite3` online `.backup()` method.

#### B. Restoration Command
To restore the database from this backup:
```bash
# 1. Stop application server
# (e.g. pm2 stop ayyappa-server or kill node process)

# 2. Overwrite database files
cp backups/ayyappa_db_backup_prelaunch.db ayyappa.db
rm -f ayyappa.db-shm ayyappa.db-wal

# 3. Restart server
npm run server
```

### 2. Codebase Rollback Procedure
If any deployment requires rollback:
1. Revert to the tested commit/tag `v1.0.0-nellore-pilot`.
2. Run `npm --prefix client run build` to restore verified client artifacts in `client/dist/`.
3. Restart backend service via PM2 or Docker.
4. Execute smoke test:
   `node server/scripts/full-qa-test.js`
   Ensure 50/50 tests pass.
