import * as XLSX from 'xlsx';

// Communities 模板定义
export const COMMUNITIES_TEMPLATE = {
  headers: [
    '省份*',
    '城市*',
    '区县',
    '社区名称*',
    '社区地址',
    '政策摘要',
    '免费工位',
    '免费住宿',
    '算力支持',
    '投资支持',
    '注册支持',
    '其他服务',
    '福利数量',
    '联系方式',
    '验证状态',
    '可信度',
  ],
  fields: [
    'province',
    'city',
    'district',
    'name',
    'address',
    'policySummary',
    'freeWorkspace',
    'freeAccommodation',
    'computingSupport',
    'investmentSupport',
    'registrationSupport',
    'otherServices',
    'benefitCount',
    'contact',
    'verificationStatus',
    'confidence',
  ],
  uniqueKey: 'name', // 去重字段
  sampleData: [
    {
      province: '北京市',
      city: '北京',
      district: '海淀区',
      name: '示例社区名称',
      address: '北京市海淀区中关村大街1号',
      policySummary: '提供免费工位、算力支持等优惠政策',
      freeWorkspace: '提供20个免费工位',
      freeAccommodation: '未明确提及',
      computingSupport: '提供GPU算力支持',
      investmentSupport: '提供种子轮投资对接',
      registrationSupport: '提供工商注册服务',
      otherServices: '提供法律咨询、财税服务',
      benefitCount: 4,
      contact: '联系人:张三；电话:010-12345678；邮箱:contact@example.com',
      verificationStatus: '已验证',
      confidence: '高',
    },
  ],
};

// Events 模板定义
export const EVENTS_TEMPLATE = {
  headers: [
    '地点*',
    '主办方*',
    '日期',
    '活动名称*',
    '报名链接',
    '嘉宾',
    '嘉宾头衔',
    '活动描述',
  ],
  fields: [
    'location',
    'organizer',
    'date',
    'name',
    'registrationLink',
    'guests',
    'guestTitles',
    'description',
  ],
  uniqueKey: 'name', // 去重字段
  sampleData: [
    {
      location: '北京·中关村',
      organizer: '示例组织机构',
      date: '2026-03-15',
      name: '示例活动名称',
      registrationLink: 'https://example.com/register',
      guests: '张三, 李四',
      guestTitles: 'CEO, CTO',
      description: '这是一场关于AI技术的分享活动',
    },
  ],
};

// News 模板定义
export const NEWS_TEMPLATE = {
  headers: [
    '标题*',
    '分类',
    '日期',
    '来源',
    '链接',
    '摘要',
    '内容*',
    '标签',
  ],
  fields: [
    'title',
    'category',
    'date',
    'source',
    'url',
    'summary',
    'content',
    'tags',
  ],
  uniqueKey: 'title', // 去重字段
  sampleData: [
    {
      title: '示例新闻标题',
      category: 'news',
      date: '2026-02-27',
      source: '示例媒体',
      url: 'https://example.com/news',
      summary: '这是新闻摘要',
      content: '这是新闻的详细内容...',
      tags: 'AI, 技术',
    },
  ],
};

// 生成 Excel 模板
export function generateTemplate(
  templateType: 'communities' | 'events' | 'news'
): XLSX.WorkBook {
  let template;
  switch (templateType) {
    case 'communities':
      template = COMMUNITIES_TEMPLATE;
      break;
    case 'events':
      template = EVENTS_TEMPLATE;
      break;
    case 'news':
      template = NEWS_TEMPLATE;
      break;
  }

  const wb = XLSX.utils.book_new();

  // 创建工作表数据
  const wsData = [
    template.headers, // 表头
    ...template.sampleData.map(sample =>
      template.fields.map(field => sample[field as keyof typeof sample] || '')
    ),
  ];

  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // 设置列宽
  ws['!cols'] = template.headers.map(() => ({ wch: 20 }));

  XLSX.utils.book_append_sheet(wb, ws, '数据模板');

  // 添加说明工作表
  const instructionsData = [
    ['批量导入说明'],
    [''],
    ['1. 请勿修改表头(第一行)'],
    ['2. 带*的字段为必填项'],
    ['3. 日期格式: YYYY-MM-DD (例如: 2026-02-27)'],
    ['4. 系统会根据关键字段自动去重'],
    [`5. 去重字段: ${template.uniqueKey}`],
    ['6. 填写完成后,保存文件并在管理页面上传'],
    [''],
    ['字段说明:'],
    ...template.headers.map((header, i) => [
      header,
      `对应字段: ${template.fields[i]}`,
    ]),
  ];

  const instructionWs = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionWs['!cols'] = [{ wch: 30 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, instructionWs, '使用说明');

  return wb;
}

// 下载模板
export function downloadTemplate(
  templateType: 'communities' | 'events' | 'news'
) {
  const wb = generateTemplate(templateType);
  const filename = `${templateType}_template_${Date.now()}.xlsx`;
  XLSX.writeFile(wb, filename);
}

// 解析上传的 Excel 文件
export function parseExcelFile<T>(
  file: File,
  templateType: 'communities' | 'events' | 'news'
): Promise<T[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        let template;
        switch (templateType) {
          case 'communities':
            template = COMMUNITIES_TEMPLATE;
            break;
          case 'events':
            template = EVENTS_TEMPLATE;
            break;
          case 'news':
            template = NEWS_TEMPLATE;
            break;
        }

        // 跳过表头,解析数据
        const rows = jsonData.slice(1) as any[][];
        const parsed = rows
          .filter(row => row.length > 0 && row.some(cell => cell)) // 过滤空行
          .map(row => {
            const obj: any = {};
            template.fields.forEach((field, index) => {
              obj[field] = row[index] !== undefined ? row[index] : '';
            });
            return obj as T;
          });

        resolve(parsed);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = () => {
      reject(new Error('文件读取失败'));
    };

    reader.readAsBinaryString(file);
  });
}

// 数据去重
export function deduplicateData<T extends Record<string, any>>(
  newData: T[],
  existingData: T[],
  uniqueKey: string
): { toAdd: T[]; duplicates: T[] } {
  const existingKeys = new Set(existingData.map(item => item[uniqueKey]));
  const toAdd: T[] = [];
  const duplicates: T[] = [];

  newData.forEach(item => {
    if (existingKeys.has(item[uniqueKey])) {
      duplicates.push(item);
    } else {
      toAdd.push(item);
      existingKeys.add(item[uniqueKey]);
    }
  });

  return { toAdd, duplicates };
}
