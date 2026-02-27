import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'data', 'opc.db');

// 创建数据库实例
export function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');
  return db;
}

// 初始化数据库表
export function initDb() {
  const db = getDb();

  // 创建 Communities 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS communities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      province TEXT NOT NULL,
      city TEXT NOT NULL,
      district TEXT,
      name TEXT NOT NULL,
      address TEXT,
      policySummary TEXT,
      freeWorkspace TEXT,
      freeAccommodation TEXT,
      computingSupport TEXT,
      investmentSupport TEXT,
      registrationSupport TEXT,
      otherServices TEXT,
      benefitCount INTEGER DEFAULT 0,
      contact TEXT,
      verificationStatus TEXT,
      confidence TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 Events 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      location TEXT,
      organizer TEXT,
      date TEXT,
      name TEXT NOT NULL,
      registrationLink TEXT,
      guests TEXT,
      guestTitles TEXT,
      description TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 News 表
  db.exec(`
    CREATE TABLE IF NOT EXISTS news (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      date TEXT,
      source TEXT,
      url TEXT,
      summary TEXT,
      content TEXT,
      tags TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 Users 表 (用户侧)
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  db.close();
}

// 迁移数据从 JSON 到数据库
export async function migrateData() {
  const db = getDb();
  const fs = require('fs');
  const path = require('path');

  try {
    // 迁移 Communities 数据
    const communitiesPath = path.join(process.cwd(), 'public', 'communities.json');
    if (fs.existsSync(communitiesPath)) {
      const communities = JSON.parse(fs.readFileSync(communitiesPath, 'utf-8'));
      const insertCommunity = db.prepare(`
        INSERT INTO communities (
          province, city, district, name, address, policySummary,
          freeWorkspace, freeAccommodation, computingSupport, investmentSupport,
          registrationSupport, otherServices, benefitCount, contact,
          verificationStatus, confidence
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((communities) => {
        for (const community of communities) {
          insertCommunity.run(
            community.province,
            community.city,
            community.district,
            community.name,
            community.address,
            community.policySummary,
            community.freeWorkspace,
            community.freeAccommodation,
            community.computingSupport,
            community.investmentSupport,
            community.registrationSupport,
            community.otherServices,
            community.benefitCount,
            community.contact,
            community.verificationStatus,
            community.confidence
          );
        }
      });

      insertMany(communities);
      console.log(`Migrated ${communities.length} communities`);
    }

    // 迁移 Events 数据 - 优先使用 opcData.json 中的数据
    const opcDataPath = path.join(process.cwd(), 'src', 'data', 'opcData.json');
    let eventsData = [];

    if (fs.existsSync(opcDataPath)) {
      const opcData = JSON.parse(fs.readFileSync(opcDataPath, 'utf-8'));
      if (opcData.events && opcData.events.length > 0) {
        eventsData = opcData.events;
      }
    }

    // 如果 opcData 中没有活动数据，则从 public/events.json 读取
    if (eventsData.length === 0) {
      const eventsPath = path.join(process.cwd(), 'public', 'events.json');
      if (fs.existsSync(eventsPath)) {
        eventsData = JSON.parse(fs.readFileSync(eventsPath, 'utf-8'));
      }
    }

    if (eventsData.length > 0) {
      const insertEvent = db.prepare(`
        INSERT INTO events (
          location, organizer, date, name, registrationLink,
          guests, guestTitles, description
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `);

      const insertMany = db.transaction((events) => {
        for (const event of events) {
          insertEvent.run(
            event['省市区'] || event.location || '',
            event['组织机构'] || event.organizer || '',
            event['活动时间'] || event.date || '',
            event['活动名称'] || event.name || '',
            event['报名链接'] || event.registrationLink || '',
            event['活动嘉宾'] || event.guests || '',
            event['嘉宾身份介绍'] || event.guestTitles || '',
            event['活动介绍'] || event.description || ''
          );
        }
      });

      insertMany(eventsData);
      console.log(`Migrated ${eventsData.length} events`);
    }

    // 迁移 News 数据从 opcData.json
    if (fs.existsSync(opcDataPath)) {
      const opcData = JSON.parse(fs.readFileSync(opcDataPath, 'utf-8'));
      if (opcData.news && opcData.news.length > 0) {
        const insertNews = db.prepare(`
          INSERT INTO news (
            title, category, date, source, url, summary, content, tags
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `);

        const insertMany = db.transaction((newsList) => {
          for (const news of newsList) {
            insertNews.run(
              news['标题'] || news.title || '',
              news['分类'] || news.category || '政策资讯',
              news['日期'] || news.date || '',
              news['媒体平台'] || news.source || '微信公众号',
              news['链接'] || news.url || '',
              news['摘要'] || news.summary || '',
              news['内容'] || news.content || '',
              news['标签'] || news.tags || ''
            );
          }
        });

        insertMany(opcData.news);
        console.log(`Migrated ${opcData.news.length} news items`);
      }
    }

    console.log('Data migration completed successfully');
  } catch (error) {
    console.error('Error during migration:', error);
    throw error;
  } finally {
    db.close();
  }
}
