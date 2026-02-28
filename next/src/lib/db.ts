import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'opc.db');
let dbInitialized = false;

// 确保data目录存在
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库实例
export function getDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

  // 首次调用时自动初始化数据库表
  if (!dbInitialized) {
    initDb();
    dbInitialized = true;
  }

  return db;
}

// 初始化数据库表
export function initDb() {
  const db = new Database(dbPath);
  db.pragma('journal_mode = WAL');

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
      phone TEXT UNIQUE NOT NULL,
      username TEXT,
      email TEXT,
      password TEXT NOT NULL,
      nickname TEXT,
      avatar TEXT,
      membershipType TEXT DEFAULT 'free',
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 创建 Demands 表 (需求广场)
  db.exec(`
    CREATE TABLE IF NOT EXISTS demands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      category TEXT,
      budget TEXT,
      deadline TEXT,
      description TEXT,
      requirements TEXT,
      postedBy TEXT,
      postedAt TEXT,
      contact TEXT,
      status TEXT DEFAULT 'open',
      auditStatus TEXT DEFAULT 'pending',
      rejectReason TEXT,
      createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
      updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 兼容旧表：如果 demands 表已存在但没有 contact 列，自动添加
  try {
    db.exec(`ALTER TABLE demands ADD COLUMN contact TEXT`);
  } catch {
    // 列已存在，忽略
  }

  // 初始化 Demands 种子数据（仅在表为空时插入）
  const demandCount = db.prepare('SELECT COUNT(*) as count FROM demands').get() as any;
  if (demandCount.count === 0) {
    const insertDemand = db.prepare(`
      INSERT INTO demands (title, category, budget, deadline, description, requirements, postedBy, postedAt, status, auditStatus)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const seedDemands = db.transaction(() => {
      insertDemand.run('AI漫剧《未来都市》角色设计', 'ai-comic', '¥5,000 - ¥8,000', '2026-03-15', '需要为科幻题材AI漫剧设计主要角色形象，包含主角3人、配角5人，要求风格统一，适合AI生成 workflow。', '熟练使用 Midjourney/Stable Diffusion,有漫画角色设计经验,能输出角色设定文档', '未来视界传媒', '2026-02-25', 'open', 'approved');
      insertDemand.run('企业宣传视频后期剪辑', 'video-edit', '¥3,000 - ¥5,000', '2026-03-10', '科技公司产品发布会视频剪辑，时长约5分钟，需要添加字幕、特效和背景音乐。', '熟练使用 Premiere Pro / Final Cut,有商业视频剪辑经验,能理解科技产品调性', '创新科技有限公司', '2026-02-26', 'open', 'approved');
      insertDemand.run('智能客服对话系统开发', 'ai-dev', '¥20,000 - ¥35,000', '2026-04-01', '基于大语言模型的智能客服系统，需要支持多轮对话、知识库检索、工单自动创建等功能。', '熟悉 Python / Node.js,有 LLM API 集成经验,了解 RAG 技术', '云智科技', '2026-02-24', 'open', 'approved');
      insertDemand.run('AI生成短视频批量制作', 'video-edit', '¥8,000 - ¥12,000', '2026-03-20', '需要制作30条电商产品推广短视频，每条15-30秒，使用AI工具辅助生成素材。', '熟练使用剪映/CapCut,了解 AI 视频生成工具,有电商视频制作经验', '优选电商', '2026-02-27', 'open', 'approved');
      insertDemand.run('AI绘本插画绘制', 'ai-comic', '¥10,000 - ¥15,000', '2026-03-30', '儿童绘本项目，需要绘制20页插画，风格温馨可爱，适合3-6岁儿童。', '有儿童插画经验,熟练使用 AI 绘画工具,能配合修改调整', '童趣出版社', '2026-02-23', 'open', 'approved');
      insertDemand.run('AI Agent 自动化工作流开发', 'ai-dev', '¥15,000 - ¥25,000', '2026-03-25', '开发自动化内容发布Agent，实现从选题、写作、配图到多平台发布的全流程自动化。', '熟悉 LangChain / AutoGen,有 API 集成经验,了解内容运营流程', '自媒体工作室', '2026-02-26', 'open', 'approved');
    });

    seedDemands();
  }

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
