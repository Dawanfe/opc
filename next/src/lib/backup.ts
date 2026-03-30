import fs from 'fs';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'opc.db');
const backupsDir = path.join(process.cwd(), 'data', 'backups');

// 确保备份目录存在
if (!fs.existsSync(backupsDir)) {
  fs.mkdirSync(backupsDir, { recursive: true });
}

/**
 * 备份数据库
 * @returns 备份文件路径
 */
export function backupDatabase(): string {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `opc-backup-${timestamp}.db`;
  const backupPath = path.join(backupsDir, backupFileName);

  try {
    fs.copyFileSync(dbPath, backupPath);
    console.log(`[Backup] Database backed up to: ${backupPath}`);

    // 清理旧备份（保留最近7天）
    cleanOldBackups();

    return backupPath;
  } catch (error) {
    console.error('[Backup] Failed to backup database:', error);
    throw error;
  }
}

/**
 * 清理7天前的备份文件
 */
function cleanOldBackups() {
  try {
    const files = fs.readdirSync(backupsDir);
    const now = Date.now();
    const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;

    for (const file of files) {
      const filePath = path.join(backupsDir, file);
      const stats = fs.statSync(filePath);

      // 删除7天前的备份
      if (now - stats.mtimeMs > sevenDaysMs) {
        fs.unlinkSync(filePath);
        console.log(`[Backup] Cleaned old backup: ${file}`);
      }
    }
  } catch (error) {
    console.error('[Backup] Failed to clean old backups:', error);
  }
}

/**
 * 恢复数据库
 * @param backupPath 备份文件路径
 */
export function restoreDatabase(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  try {
    fs.copyFileSync(backupPath, dbPath);
    console.log(`[Backup] Database restored from: ${backupPath}`);
  } catch (error) {
    console.error('[Backup] Failed to restore database:', error);
    throw error;
  }
}

/**
 * 获取所有备份文件列表
 */
export function listBackups(): Array<{ name: string; path: string; size: number; date: Date }> {
  try {
    const files = fs.readdirSync(backupsDir);
    return files
      .filter(f => f.endsWith('.db'))
      .map(f => {
        const filePath = path.join(backupsDir, f);
        const stats = fs.statSync(filePath);
        return {
          name: f,
          path: filePath,
          size: stats.size,
          date: stats.mtime,
        };
      })
      .sort((a, b) => b.date.getTime() - a.date.getTime());
  } catch (error) {
    console.error('[Backup] Failed to list backups:', error);
    return [];
  }
}

/**
 * 删除指定备份
 */
export function deleteBackup(backupPath: string): void {
  if (!fs.existsSync(backupPath)) {
    throw new Error(`Backup file not found: ${backupPath}`);
  }

  try {
    fs.unlinkSync(backupPath);
    console.log(`[Backup] Deleted backup: ${backupPath}`);
  } catch (error) {
    console.error('[Backup] Failed to delete backup:', error);
    throw error;
  }
}

/**
 * 启动定时备份（每天凌晨2点）
 */
export function startScheduledBackup() {
  const msUntil2AM = getMillisecondsUntil(2, 0);

  console.log(`[Backup] Scheduled to run daily at 02:00, first run in ${msUntil2AM}ms`);

  // 首次执行
  setTimeout(() => {
    backupDatabase();
    // 之后每24小时执行一次
    setInterval(backupDatabase, 24 * 60 * 60 * 1000);
  }, msUntil2AM);
}

/**
 * 获取距离指定时间（小时:分钟）的毫秒数
 */
function getMillisecondsUntil(targetHour: number, targetMinute: number): number {
  const now = new Date();
  const target = new Date(now);
  target.setHours(targetHour, targetMinute, 0, 0);

  if (target <= now) {
    // 目标时间已过，设为明天
    target.setDate(target.getDate() + 1);
  }

  return target.getTime() - now.getTime();
}

// 如果环境变量设置了自动备份，则启动定时任务
if (process.env.ENABLE_AUTO_BACKUP === 'true') {
  startScheduledBackup();
}
