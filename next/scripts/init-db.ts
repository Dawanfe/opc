import { initDb, migrateData } from '../src/lib/db';
import fs from 'fs';
import path from 'path';

// 确保 data 目录存在
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 初始化数据库
console.log('Initializing database...');
initDb();
console.log('Database initialized successfully');

// 迁移数据
console.log('Migrating data from JSON files...');
migrateData()
  .then(() => {
    console.log('All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
