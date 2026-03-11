module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/../src/$1',
  },
  collectCoverageFrom: [
    '../src/lib/utils/invite.ts',
    '../src/app/api/auth/register/route.ts',
    '../src/app/api/user/invite-info/route.ts',
    '../src/app/api/admin/invite-stats/route.ts',
  ],
};
