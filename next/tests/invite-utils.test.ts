/**
 * 邀请码工具函数单元测试
 */

import { generateInviteCode, validateInviteCodeFormat } from '@/lib/utils/invite';

describe('邀请码工具函数', () => {
  describe('generateInviteCode', () => {
    it('应生成8位字符的邀请码', () => {
      const code = generateInviteCode();
      expect(code).toHaveLength(8);
    });

    it('应只包含字母和数字', () => {
      const code = generateInviteCode();
      expect(code).toMatch(/^[A-Za-z0-9]{8}$/);
    });

    it('不应包含易混淆字符 (0,O,o,I,l,1)', () => {
      const confusingChars = ['0', 'O', 'o', 'I', 'l', '1'];

      // 生成100个邀请码进行测试
      for (let i = 0; i < 100; i++) {
        const code = generateInviteCode();
        confusingChars.forEach(char => {
          expect(code).not.toContain(char);
        });
      }
    });

    it('应生成不同的邀请码（随机性测试）', () => {
      const codes = new Set();

      // 生成100个邀请码，应该几乎全部不同
      for (let i = 0; i < 100; i++) {
        codes.add(generateInviteCode());
      }

      expect(codes.size).toBeGreaterThan(90); // 至少90%不同
    });
  });

  describe('validateInviteCodeFormat', () => {
    it('应接受有效的8位字母数字邀请码', () => {
      expect(validateInviteCodeFormat('ABC12345')).toBe(true);
      expect(validateInviteCodeFormat('XyZ98765')).toBe(true);
      expect(validateInviteCodeFormat('aBcDeF23')).toBe(true);
    });

    it('应拒绝长度不正确的邀请码', () => {
      expect(validateInviteCodeFormat('ABC123')).toBe(false);    // 太短
      expect(validateInviteCodeFormat('ABC123456')).toBe(false); // 太长
      expect(validateInviteCodeFormat('')).toBe(false);          // 空字符串
    });

    it('应拒绝包含特殊字符的邀请码', () => {
      expect(validateInviteCodeFormat('ABC@1234')).toBe(false);
      expect(validateInviteCodeFormat('ABC-1234')).toBe(false);
      expect(validateInviteCodeFormat('ABC_1234')).toBe(false);
      expect(validateInviteCodeFormat('ABC 1234')).toBe(false);
    });

    it('应拒绝包含中文的邀请码', () => {
      expect(validateInviteCodeFormat('ABC中文12')).toBe(false);
    });

    it('应处理 null 和 undefined', () => {
      expect(validateInviteCodeFormat(null as any)).toBe(false);
      expect(validateInviteCodeFormat(undefined as any)).toBe(false);
    });
  });
});
