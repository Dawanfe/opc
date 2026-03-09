const Database = require('better-sqlite3');
const db = new Database('/app/data/opc.db');
db.pragma('journal_mode = WAL');

// 由于 SQLite 不支持直接修改列约束，需要重建表
db.exec('PRAGMA foreign_keys=off');
db.transaction(() => {
  // 重命名旧表
  db.exec('ALTER TABLE users RENAME TO users_old');

  // 创建新表，password 允许为空
  db.exec(`CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT UNIQUE,
    username TEXT,
    email TEXT,
    password TEXT,
    nickname TEXT,
    avatar TEXT,
    membershipType TEXT DEFAULT 'free',
    wechatOpenId TEXT,
    wechatUnionId TEXT,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
  )`);

  // 迁移数据
  db.exec(`INSERT INTO users (id, phone, username, email, password, nickname, avatar, membershipType, wechatOpenId, wechatUnionId, createdAt, updatedAt)
    SELECT id, phone, username, email, password, nickname, avatar, membershipType, wechatOpenId, wechatUnionId, createdAt, updatedAt
    FROM users_old`);

  // 删除旧表
  db.exec('DROP TABLE users_old');
})();
db.exec('PRAGMA foreign_keys=on');

// 创建索引
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_phone ON users(phone) WHERE phone IS NOT NULL');
db.exec('CREATE UNIQUE INDEX IF NOT EXISTS idx_users_wechatOpenId ON users(wechatOpenId) WHERE wechatOpenId IS NOT NULL');

const newColumns = db.prepare('PRAGMA table_info(users)').all();
console.log('New columns:', newColumns.map(c => c.name + ' (NOT NULL: ' + c.notnull + ')'));

db.close();
console.log('Table migration completed');
