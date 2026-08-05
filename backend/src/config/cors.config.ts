const DEFAULT_FRONTEND_ORIGINS = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://192.168.0.144:5173',
  'http://192.168.0.158:5173',
];

const configuredOrigins = [
  process.env.FRONTEND_URL,
  ...(process.env.FRONTEND_ORIGINS ?? '').split(','),
]
  .map((origin) => origin?.trim())
  .filter((origin): origin is string => Boolean(origin));

export const FRONTEND_ORIGINS =
  configuredOrigins.length > 0
    ? configuredOrigins
    : DEFAULT_FRONTEND_ORIGINS;
