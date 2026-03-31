# OPC社区数据同步接口文档

## 概述

本文档描述 OPC 社区数据同步接口的调用方式、安全机制和使用示例。

**适用场景**：外部程序定时同步 OPC 社区数据到 WeOPC 平台，数据需经管理员审核后对外展示。

## 基本信息

| 项目 | 值 |
|------|------|
| 接口地址 | `https://weopc.com.cn/api/admin/communities/sync` |
| 请求方法 | `POST` |
| 内容类型 | `application/json` |
| 签名算法 | `HMAC-SHA256` |
| 时间戳有效期 | 5 分钟 |
| 单次批量限制 | 100 条（可调整） |

## 快速开始

### 1. 获取密钥

联系 WeOPC 管理员获取以下密钥：

| 密钥 | 用途 | 获取方式 |
|------|------|----------|
| `SECRET` | 签名密钥 | 联系管理员获取 |
| `API_KEY` | API 密钥 | 联系管理员获取 |

> ⚠️ **重要**：密钥仅用于服务端调用，请勿在前端代码或客户端暴露。

### 2. 调用接口

最小可用请求示例：

```bash
# 1. 准备数据
body='{"communities":[{"syncId":"BJ-001","province":"北京","city":"北京","name":"朝阳AI社区"}]}'

# 2. 生成时间戳
timestamp=$(date +%s)

# 3. 生成签名
signature=$(echo -n "${body}:${timestamp}:${SECRET}" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

# 4. 发送请求
curl -X POST "https://weopc.com.cn/api/admin/communities/sync" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $signature" \
  -H "X-Timestamp: $timestamp" \
  -H "X-API-Key: $API_KEY" \
  -d "$body"
```

### 3. 查看结果

成功响应：

```json
{
  "success": true,
  "message": "Sync completed",
  "inserted": 1,
  "updated": 0,
  "total": 1
}
```

## 安全机制

### 1. 签名验证

请求必须包含以下 Header：

| Header | 类型 | 必填 | 说明 |
|--------|------|--------|------|
| `X-Signature` | String | 是 | HMAC-SHA256 签名（hex格式） |
| `X-Timestamp` | String | 是 | Unix 时间戳（秒级） |
| `X-API-Key` | String | 是 | API 密钥 |
| `Content-Type` | String | 是 | 必须为 `application/json` |

### 2. 签名算法

```
签名 = HMAC-SHA256(body + ":" + timestamp + ":" + secret, secret)
```

**关键点**：
- `body` 是原始请求体字符串（JSON序列化后的字符串）
- `timestamp` 是字符串形式的时间戳
- 使用 **同一个 secret** 进行签名和验证

### 3. 时间戳防重放

请求时间戳必须在当前时间 **±5 分钟** 内，过期请求将被拒绝。

**作用**：防止请求被截获后重复发送。

### 4. IP 白名单（可选）

配置 `ALLOWED_SYNC_IPS` 环境变量后，只允许指定 IP 调用接口。

```
ALLOWED_SYNC_IPS=192.168.1.100,10.0.0.50
```

## 数据结构

### 请求体

```json
{
  "communities": [
    {
      "syncId": "BJ-001",
      "province": "北京市",
      "city": "北京市",
      "district": "朝阳区",
      "name": "朝阳AI创新社区",
      "address": "朝阳区望京街道xxx路123号",
      "policySummary": "提供免费工位、算力补贴、投资对接等服务",
      "freeWorkspace": "提供3个月免费工位",
      "freeAccommodation": "提供7天免费人才公寓",
      "computingSupport": "提供10万/年算力补贴",
      "investmentSupport": "优质项目可获得50-500万投资",
      "registrationSupport": "免费代办公司注册",
      "otherServices": "法律咨询、财务代理",
      "benefitCount": 5,
      "contact": "张老师 13800138000",
      "verificationStatus": "已认证",
      "confidence": "高"
    }
  ]
}
```

### 字段说明

| 字段 | 类型 | 必填 | 示例值 | 说明 |
|------|------|--------|--------|------|
| `syncId` | String | 否 | `BJ-001` | 外部唯一ID，用于去重和更新已有记录。**建议填写**，否则每次同步都会新增记录 |
| `province` | String | 是 | `北京市` | 省份，完整名称 |
| `city` | String | 是 | `北京市` | 城市，完整名称 |
| `district` | String | 否 | `朝阳区` | 区县 |
| `name` | String | 是 | `朝阳AI创新社区` | 社区名称 |
| `address` | String | 否 | `朝阳区望京街道xxx路123号` | 详细地址 |
| `policySummary` | String | 否 | `提供免费工位...` | 政策摘要，建议200字以内 |
| `freeWorkspace` | String | 否 | `提供3个月免费工位` | 免费工位信息 |
| `freeAccommodation` | String | 否 | `提供7天免费人才公寓` | 免费住宿信息 |
| `computingSupport` | String | 否 | `提供10万/年算力补贴` | 算力支持 |
| `investmentSupport` | String | 否 | `优质项目可获得50-500万投资` | 投资支持 |
| `registrationSupport` | String | 否 | `免费代办公司注册` | 注册支持 |
| `otherServices` | String | 否 | `法律咨询、财务代理` | 其他服务 |
| `benefitCount` | Number | 否 | `5` | 权益数量，默认0 |
| `contact` | String | 否 | `张老师 13800138000` | 联系方式 |
| `verificationStatus` | String | 否 | `已认证` | 认证状态，可选值：`已认证`、`待认证` |
| `confidence` | String | 否 | `高` | 数据置信度，可选值：`高`、`中`、`低` |

### 响应体

**成功响应**：

```json
{
  "success": true,
  "message": "Sync completed",
  "inserted": 10,
  "updated": 5,
  "total": 15
}
```

| 字段 | 说明 |
|------|------|
| `inserted` | 新增记录数 |
| `updated` | 更新记录数（通过 syncId 匹配已有记录） |
| `total` | 本次处理总数 |

**错误响应**：

```json
{
  "error": "Invalid signature or expired timestamp"
}
```

## 调用示例

### Node.js 示例

```javascript
const crypto = require('crypto');

// 配置（从管理员处获取）
const SECRET = 'your-secret-key';
const API_KEY = 'your-api-key';
const API_URL = 'https://weopc.com.cn/api/admin/communities/sync';

/**
 * 生成签名
 * @param {string} body - JSON序列化后的请求体
 * @param {string} timestamp - Unix时间戳（秒）
 * @returns {string} HMAC-SHA256签名（hex格式）
 */
function generateSignature(body, timestamp) {
  const data = `${body}:${timestamp}:${SECRET}`;
  return crypto.createHmac('sha256', SECRET).update(data).digest('hex');
}

/**
 * 同步社区数据
 * @param {Array} communities - 社区数据数组
 */
async function syncCommunities(communities) {
  const body = JSON.stringify({ communities });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = generateSignature(body, timestamp);

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'X-API-Key': API_KEY,
      },
      body,
    });

    const result = await response.json();

    if (response.ok) {
      console.log(`✅ 同步成功: 新增 ${result.inserted} 条, 更新 ${result.updated} 条`);
    } else {
      console.error(`❌ 同步失败: ${result.error}`);
    }

    return result;
  } catch (err) {
    console.error('❌ 请求失败:', err.message);
    throw err;
  }
}

// 使用示例
syncCommunities([
  {
    syncId: 'BJ-001',
    province: '北京市',
    city: '北京市',
    district: '朝阳区',
    name: '朝阳AI创新社区',
    address: '朝阳区望京街道xxx路123号',
    contact: '张老师 13800138000',
  },
]);
```

### Python 示例

```python
import hmac
import hashlib
import json
import time
import requests

# 配置（从管理员处获取）
SECRET = 'your-secret-key'
API_KEY = 'your-api-key'
API_URL = 'https://weopc.com.cn/api/admin/communities/sync'

def generate_signature(body: str, timestamp: str) -> str:
    """生成 HMAC-SHA256 签名"""
    data = f"{body}:{timestamp}:{SECRET}"
    return hmac.new(
        SECRET.encode('utf-8'),
        data.encode('utf-8'),
        hashlib.sha256
    ).hexdigest()

def sync_communities(communities: list) -> dict:
    """同步社区数据"""
    body = json.dumps({'communities': communities}, ensure_ascii=False)
    timestamp = str(int(time.time()))
    signature = generate_signature(body, timestamp)

    headers = {
        'Content-Type': 'application/json',
        'X-Signature': signature,
        'X-Timestamp': timestamp,
        'X-API-Key': API_KEY,
    }

    response = requests.post(API_URL, data=body.encode('utf-8'), headers=headers)
    result = response.json()

    if response.ok:
        print(f"✅ 同步成功: 新增 {result.get('inserted')} 条, 更新 {result.get('updated')} 条")
    else:
        print(f"❌ 同步失败: {result.get('error')}")

    return result

# 使用示例
if __name__ == '__main__':
    sync_communities([
        {
            'syncId': 'BJ-001',
            'province': '北京市',
            'city': '北京市',
            'district': '朝阳区',
            'name': '朝阳AI创新社区',
            'contact': '张老师 13800138000',
        },
    ])
```

### curl 示例

```bash
#!/bin/bash

# 配置（从管理员处获取）
SECRET="your-secret-key"
API_KEY="your-api-key"
API_URL="https://weopc.com.cn/api/admin/communities/sync"

# 准备数据（注意：JSON字符串不要有多余空格）
body='{"communities":[{"syncId":"BJ-001","province":"北京市","city":"北京市","name":"朝阳AI创新社区","contact":"张老师 13800138000"}]}'

# 生成时间戳（秒级）
timestamp=$(date +%s)

# 生成签名
signature=$(echo -n "${body}:${timestamp}:${SECRET}" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')

echo "请求信息:"
echo "  Body: $body"
echo "  Timestamp: $timestamp"
echo "  Signature: $signature"
echo ""

# 发送请求
echo "发送请求..."
curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "X-Signature: $signature" \
  -H "X-Timestamp: $timestamp" \
  -H "X-API-Key: $API_KEY" \
  -d "$body"
```

### Go 示例

```go
package main

import (
	"bytes"
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"
)

// 配置（从管理员处获取）
const (
	SECRET  = "your-secret-key"
	API_KEY = "your-api-key"
	API_URL = "https://weopc.com.cn/api/admin/communities/sync"
)

// Community 社区数据结构
type Community struct {
	SyncID              string `json:"syncId,omitempty"`
	Province            string `json:"province"`
	City                string `json:"city"`
	District            string `json:"district,omitempty"`
	Name                string `json:"name"`
	Address             string `json:"address,omitempty"`
	PolicySummary       string `json:"policySummary,omitempty"`
	FreeWorkspace       string `json:"freeWorkspace,omitempty"`
	FreeAccommodation   string `json:"freeAccommodation,omitempty"`
	ComputingSupport    string `json:"computingSupport,omitempty"`
	InvestmentSupport   string `json:"investmentSupport,omitempty"`
	RegistrationSupport string `json:"registrationSupport,omitempty"`
	OtherServices       string `json:"otherServices,omitempty"`
	BenefitCount        int    `json:"benefitCount,omitempty"`
	Contact             string `json:"contact,omitempty"`
	VerificationStatus  string `json:"verificationStatus,omitempty"`
	Confidence          string `json:"confidence,omitempty"`
}

// SyncRequest 同步请求结构
type SyncRequest struct {
	Communities []Community `json:"communities"`
}

// SyncResponse 同步响应结构
type SyncResponse struct {
	Success  bool   `json:"success"`
	Message  string `json:"message"`
	Inserted int    `json:"inserted"`
	Updated  int    `json:"updated"`
	Total    int    `json:"total"`
	Error    string `json:"error,omitempty"`
}

// generateSignature 生成 HMAC-SHA256 签名
func generateSignature(body string, timestamp string) string {
	data := body + ":" + timestamp + ":" + SECRET
	h := hmac.New(sha256.New, []byte(SECRET))
	h.Write([]byte(data))
	return hex.EncodeToString(h.Sum(nil))
}

// syncCommunities 同步社区数据
func syncCommunities(communities []Community) (*SyncResponse, error) {
	// 序列化请求体
	req := SyncRequest{Communities: communities}
	bodyBytes, err := json.Marshal(req)
	if err != nil {
		return nil, fmt.Errorf("JSON序列化失败: %w", err)
	}
	body := string(bodyBytes)

	// 生成签名
	timestamp := fmt.Sprintf("%d", time.Now().Unix())
	signature := generateSignature(body, timestamp)

	// 创建请求
	httpReq, err := http.NewRequest("POST", API_URL, bytes.NewReader(bodyBytes))
	if err != nil {
		return nil, fmt.Errorf("创建请求失败: %w", err)
	}

	// 设置请求头
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("X-Signature", signature)
	httpReq.Header.Set("X-Timestamp", timestamp)
	httpReq.Header.Set("X-API-Key", API_KEY)

	// 发送请求
	client := &http.Client{Timeout: 30 * time.Second}
	resp, err := client.Do(httpReq)
	if err != nil {
		return nil, fmt.Errorf("请求失败: %w", err)
	}
	defer resp.Body.Close()

	// 解析响应
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("读取响应失败: %w", err)
	}

	var result SyncResponse
	if err := json.Unmarshal(respBody, &result); err != nil {
		return nil, fmt.Errorf("解析响应失败: %w", err)
	}

	return &result, nil
}

func main() {
	communities := []Community{
		{
			SyncID:   "BJ-001",
			Province: "北京市",
			City:     "北京市",
			District: "朝阳区",
			Name:     "朝阳AI创新社区",
			Contact:  "张老师 13800138000",
		},
	}

	result, err := syncCommunities(communities)
	if err != nil {
		fmt.Printf("❌ 同步失败: %v\n", err)
		return
	}

	if result.Success {
		fmt.Printf("✅ 同步成功: 新增 %d 条, 更新 %d 条\n", result.Inserted, result.Updated)
	} else {
		fmt.Printf("❌ 同步失败: %s\n", result.Error)
	}
}
```

## 错误码

| HTTP 状态码 | 错误信息 | 原因 | 解决方案 |
|-------------|----------|------|----------|
| 400 | `Missing required headers` | 缺少必要的 Header | 检查是否包含 X-Signature, X-Timestamp, X-API-Key |
| 400 | `Invalid JSON body` | JSON 格式错误 | 检查 JSON 语法是否正确 |
| 400 | `Invalid data format` | communities 不是数组 | 确保 communities 是数组类型 |
| 400 | `Batch size exceeds limit` | 批量数量超过限制 | 减少单次同步数量，分批调用 |
| 401 | `Invalid API Key` | API Key 错误 | 检查 X-API-Key 是否正确 |
| 401 | `Invalid signature or expired timestamp` | 签名错误或时间戳过期 | 检查签名算法和时间戳是否正确 |
| 403 | `IP not allowed` | IP 不在白名单中 | 联系管理员添加 IP 到白名单 |
| 500 | `Internal server error` | 服务器内部错误 | 联系管理员排查 |

## 测试环境

### 测试接口地址

测试环境接口地址请联系管理员获取。

### 测试步骤

1. **获取测试密钥**：联系管理员获取测试环境的 SECRET 和 API_KEY
2. **构造测试数据**：使用少量测试数据调用接口
3. **检查响应**：确认返回 `success: true`
4. **查看数据**：联系管理员确认数据已入库（状态为 pending）
5. **审核测试**：管理员审核后，数据对用户可见

### 调试技巧

**签名不匹配**：

```bash
# 检查签名计算是否正确
# 1. 确认 body 字符串没有多余空格或换行
# 2. 确认 timestamp 是字符串形式
# 3. 确认使用同一个 SECRET 进行签名

# 调试命令
body='{"communities":[{"syncId":"test","province":"北京","city":"北京","name":"测试"}]}'
timestamp=$(date +%s)
echo "Body: $body"
echo "Timestamp: $timestamp"
echo "Data to sign: ${body}:${timestamp}:${SECRET}"
signature=$(echo -n "${body}:${timestamp}:${SECRET}" | openssl dgst -sha256 -hmac "$SECRET" | awk '{print $2}')
echo "Signature: $signature"
```

## 审核流程

```
外部程序                    WeOPC平台                     用户侧
    │                          │                           │
    │  1. 同步数据              │                           │
    │ ─────────────────────────>│                           │
    │                          │                           │
    │  2. 返回成功              │                           │
    │ <─────────────────────────│                           │
    │                          │                           │
    │                          │  3. 数据入库              │
    │                          │     auditStatus=pending   │
    │                          │                           │
    │                          │  4. 管理员审核            │
    │                          │     ┌──────────────┐      │
    │                          │     │ 通过/拒绝    │      │
    │                          │     └──────────────┘      │
    │                          │                           │
    │                          │  5. 状态变更              │
    │                          │     published / rejected  │
    │                          │                           │
    │                          │  6. 查询接口              │
    │                          │ <─────────────────────────│
    │                          │                           │
    │                          │  7. 返回已发布数据        │
    │                          │ ─────────────────────────>│
    │                          │                           │
```

## 其他相关接口

### 获取待审核列表

```bash
GET /api/admin/communities/sync
Header: X-API-Key: your-api-key

# 响应
{
  "success": true,
  "pending": [...],
  "stats": {
    "pending": 10,
    "approved": 5,
    "rejected": 2,
    "published": 100
  }
}
```

### 审核通过

```bash
POST /api/admin/communities/:id/approve
Header: X-API-Key: your-api-key
Body: { "notes": "审核备注（可选）" }

# 响应
{
  "success": true,
  "message": "Community approved and published"
}
```

### 审核拒绝

```bash
POST /api/admin/communities/:id/reject
Header: X-API-Key: your-api-key
Body: { "reason": "拒绝原因（必填）" }

# 响应
{
  "success": true,
  "message": "Community rejected"
}
```

### 用户查询（只返回已发布数据）

```bash
GET /api/communities?city=北京&search=AI

# 响应
{
  "success": true,
  "count": 10,
  "data": [...]
}
```

## 最佳实践

### 1. 定时同步建议

```python
# 推荐每天同步一次，凌晨执行
# 使用 crontab 或定时任务框架

# crontab 示例（每天凌晨2点执行）
0 2 * * * /usr/bin/python3 /path/to/sync_communities.py
```

### 2. 错误重试

```python
import time

def sync_with_retry(communities, max_retries=3):
    for attempt in range(max_retries):
        try:
            result = sync_communities(communities)
            if result.get('success'):
                return result
        except Exception as e:
            print(f"第 {attempt + 1} 次尝试失败: {e}")
            if attempt < max_retries - 1:
                time.sleep(2 ** attempt)  # 指数退避
    raise Exception("同步失败，已达到最大重试次数")
```

### 3. 数据去重

```python
# 使用 syncId 实现幂等同步
# syncId 可以是外部系统的唯一标识，如：
# - "BJ-001" (城市编号)
# - "community_12345" (外部数据库ID)
# - "MD5(name+address)" (根据名称和地址生成)

import hashlib

def generate_sync_id(name, address):
    return hashlib.md5(f"{name}_{address}".encode()).hexdigest()[:8]
```

### 4. 批量限制

```python
# 单次最多100条，超过需分批
def sync_large_batch(communities, batch_size=100):
    results = []
    for i in range(0, len(communities), batch_size):
        batch = communities[i:i + batch_size]
        result = sync_communities(batch)
        results.append(result)
    return results
```

## 安全建议

1. **密钥管理**：将 `SECRET` 和 `API_KEY` 存储在环境变量中，不要硬编码
2. **HTTPS**：生产环境必须使用 HTTPS
3. **IP 限制**：建议配置 IP 白名单，限制调用来源
4. **日志记录**：记录每次同步的请求和响应，便于排查问题
5. **定期轮换**：建议每季度更换一次密钥
6. **最小权限**：密钥仅用于同步接口，不与其他系统共用

## 常见问题

### Q1: 签名验证失败怎么办？

**排查步骤**：
1. 确认 body 字符串与实际发送的完全一致（包括空格、顺序）
2. 确认 timestamp 是字符串类型，不是数字
3. 确认使用的是 SECRET，不是 API_KEY
4. 确认 HMAC 输出是 hex 格式（小写）

### Q2: 数据同步后为什么看不到？

**原因**：同步的数据状态为 `pending`，需要管理员审核通过后才会对用户可见。

**解决方案**：联系管理员进行审核。

### Q3: 如何更新已有数据？

**方案**：使用相同的 `syncId` 再次同步，系统会自动更新已有记录。

### Q4: 单次同步数量有限制吗？

**限制**：默认单次最多 100 条。如需调整，联系管理员修改 `MAX_SYNC_BATCH_SIZE` 环境变量。

## 更新日志

| 版本 | 日期 | 更新内容 |
|------|------|----------|
| v1.0 | 2024-03-31 | 初始版本 |

## 联系方式

如有问题，请联系：
- 邮箱：contact@weopc.com.cn
- 微信公众号：WeOPC

---

**文档版本**：v1.0
**最后更新**：2024-03-31
