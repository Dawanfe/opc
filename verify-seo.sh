#!/bin/bash

# SEO验证脚本
# 用于验证WeOPC网站的SEO配置是否正确

BASE_URL="https://weopc.com.cn"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "========================================="
echo "  WeOPC SEO 验证脚本"
echo "========================================="
echo ""

# 1. 验证 robots.txt
echo "1. 验证 robots.txt..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/robots.txt")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} robots.txt 可访问 (HTTP $STATUS)"
    echo "内容预览:"
    curl -s "$BASE_URL/robots.txt" | head -5
else
    echo -e "${RED}✗${NC} robots.txt 不可访问 (HTTP $STATUS)"
fi
echo ""

# 2. 验证 sitemap.xml
echo "2. 验证 sitemap.xml..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/sitemap.xml")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} sitemap.xml 可访问 (HTTP $STATUS)"
    URLS=$(curl -s "$BASE_URL/sitemap.xml" | grep -c "<loc>")
    echo "包含 $URLS 个URL"
else
    echo -e "${RED}✗${NC} sitemap.xml 不可访问 (HTTP $STATUS)"
fi
echo ""

# 3. 验证 manifest.json
echo "3. 验证 manifest.json..."
STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/manifest.json")
if [ "$STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} manifest.json 可访问 (HTTP $STATUS)"
else
    echo -e "${RED}✗${NC} manifest.json 不可访问 (HTTP $STATUS)"
fi
echo ""

# 4. 验证首页 metadata
echo "4. 验证首页 metadata..."
PAGE=$(curl -s "$BASE_URL/")

# Title
TITLE=$(echo "$PAGE" | grep -o '<title>[^<]*</title>' | sed 's/<[^>]*>//g')
if [ -n "$TITLE" ]; then
    echo -e "${GREEN}✓${NC} Title: $TITLE"
else
    echo -e "${RED}✗${NC} Title 未找到"
fi

# Description
DESC=$(echo "$PAGE" | grep -o '<meta name="description" content="[^"]*"' | sed 's/.*content="//;s/".*//')
if [ -n "$DESC" ]; then
    echo -e "${GREEN}✓${NC} Description: ${DESC:0:60}..."
else
    echo -e "${RED}✗${NC} Description 未找到"
fi

# Open Graph
OG=$(echo "$PAGE" | grep -c 'property="og:')
if [ "$OG" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} Open Graph 标签: $OG 个"
else
    echo -e "${RED}✗${NC} Open Graph 标签未找到"
fi

# Structured Data
JSONLD=$(echo "$PAGE" | grep -c 'application/ld+json')
if [ "$JSONLD" -gt 0 ]; then
    echo -e "${GREEN}✓${NC} JSON-LD 结构化数据: $JSONLD 个"
else
    echo -e "${YELLOW}!${NC} JSON-LD 结构化数据未找到"
fi
echo ""

# 5. 验证子页面
echo "5. 验证子页面..."
PAGES=("/policy" "/marketplace" "/events" "/news")
for page in "${PAGES[@]}"; do
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$page")
    if [ "$STATUS" = "200" ]; then
        echo -e "${GREEN}✓${NC} $page (HTTP $STATUS)"
    else
        echo -e "${RED}✗${NC} $page (HTTP $STATUS)"
    fi
done
echo ""

# 6. HTTPS 验证
echo "6. HTTPS 配置验证..."
if curl -s -I "$BASE_URL" | grep -q "HTTP/2 200"; then
    echo -e "${GREEN}✓${NC} HTTPS 配置正确 (HTTP/2)"
else
    echo -e "${YELLOW}!${NC} HTTPS 可能配置不完整"
fi
echo ""

# 7. Gzip 压缩验证
echo "7. Gzip 压缩验证..."
if curl -s -I -H "Accept-Encoding: gzip" "$BASE_URL" | grep -q "Content-Encoding: gzip"; then
    echo -e "${GREEN}✓${NC} Gzip 压缩已启用"
else
    echo -e "${YELLOW}!${NC} Gzip 压缩未启用"
fi
echo ""

echo "========================================="
echo "  验证完成"
echo "========================================="
echo ""
echo "后续步骤:"
echo "1. 提交sitemap到 Google Search Console"
echo "   https://search.google.com/search-console"
echo ""
echo "2. 提交sitemap到百度站长平台"
echo "   https://ziyuan.baidu.com"
echo ""
echo "3. 验证结构化数据"
echo "   https://search.google.com/test/rich-results"
echo ""
echo "4. 测试移动友好性"
echo "   https://search.google.com/test/mobile-friendly"
echo ""
