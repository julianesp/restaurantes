// Jest para la lógica de servidor (seguridad multi-tenant, facturación, pagos, webhooks).
// Los tests corren en Node, no en workerd: `cloudflare:workers` se sustituye por un D1 falso
// (tests/mocks/cloudflare-workers.ts) que registra cada SQL ejecutado.

/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.(t|j)sx?$": [
      "@swc/jest",
      {
        jsc: { parser: { syntax: "typescript", tsx: true }, target: "es2022" },
        module: { type: "commonjs" },
      },
    ],
  },
  moduleNameMapper: {
    "^cloudflare:workers$": "<rootDir>/tests/mocks/cloudflare-workers.ts",
    "^@/(.*)$": "<rootDir>/$1",
  },
  clearMocks: true,
  restoreMocks: true,
  collectCoverageFrom: ["lib/**/*.ts", "proxy.ts"],
};
