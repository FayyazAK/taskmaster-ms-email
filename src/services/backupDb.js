// backup-db.js
const cron = require("node-cron");
const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const config = require("../config/env");
const util = require("util");

const execPromise = util.promisify(exec);
const { host, port, user, password, name } = config.db;
const { dir, retentionDays } = config.backup;

if (!fs.existsSync(dir)) {
  fs.mkdirSync(dir, { recursive: true });
}

async function backupDatabase() {
  try {
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, 19);
    const filename = `${name}-${timestamp}.sql.gz`;
    const filepath = path.join(dir, filename);

    const cmd = `mysqldump --host=${host} --port=${port} --user=${user} --password=${password} ${name} | gzip > "${filepath}"`;

    console.log(`[Backup] Starting dump at ${new Date().toISOString()}`);

    await execPromise(cmd);
    console.log(`[Backup] Completed: ${filename}`);

    // Verify the file was created
    if (!fs.existsSync(filepath)) {
      throw new Error("Backup file was not created");
    }

    // rotate old files
    await rotateBackups();

    return filepath;
  } catch (error) {
    console.error("[Backup] ERROR:", error.message);
    throw error;
  }
}

async function rotateBackups() {
  try {
    const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;
    const files = await fs.promises.readdir(dir);

    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stats = await fs.promises.stat(fullPath);

      if (stats.mtimeMs < cutoff) {
        await fs.promises.unlink(fullPath);
        console.log(`[Rotate] Deleted old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error("[Rotate] ERROR:", error);
    throw error;
  }
}

// Runs every day at 02:30 AM Asia/Karachi time
cron.schedule(
  "30 2 * * *",
  async () => {
    try {
      await backupDatabase();
    } catch (error) {
      console.error("[Cron Backup] Failed:", error);
    }
  },
  {
    timezone: "Asia/Karachi",
    scheduled: true,
  }
);

// Optionally export for manual triggering/tests
module.exports = { backupDatabase };
