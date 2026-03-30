import { NextRequest, NextResponse } from 'next/server';
import { backupDatabase, listBackups, deleteBackup } from '@/lib/backup';

/**
 * 备份管理接口
 *
 * GET - 获取备份列表
 * POST - 创建备份
 * DELETE - 删除备份
 *
 * 需要 X-API-Key 鉴权
 */
export async function GET(request: NextRequest) {
  try {
    // API Key 鉴权
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.COMMUNITY_SYNC_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backups = listBackups();

    return NextResponse.json({
      success: true,
      count: backups.length,
      backups: backups.map(b => ({
        name: b.name,
        size: `${(b.size / 1024 / 1024).toFixed(2)} MB`,
        date: b.date.toISOString(),
      })),
    });

  } catch (error) {
    console.error('[Backup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to list backups' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // API Key 鉴权
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.COMMUNITY_SYNC_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const backupPath = backupDatabase();

    return NextResponse.json({
      success: true,
      message: 'Backup created successfully',
      path: backupPath,
    });

  } catch (error) {
    console.error('[Backup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create backup' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // API Key 鉴权
    const apiKey = request.headers.get('X-API-Key');
    if (apiKey !== process.env.COMMUNITY_SYNC_API_KEY) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
      return NextResponse.json({ error: 'Backup name required' }, { status: 400 });
    }

    const backupPath = `${process.cwd()}/data/backups/${name}`;
    deleteBackup(backupPath);

    return NextResponse.json({
      success: true,
      message: 'Backup deleted successfully',
    });

  } catch (error) {
    console.error('[Backup API] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup' },
      { status: 500 }
    );
  }
}
