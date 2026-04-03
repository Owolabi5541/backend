import type { Params } from 'nestjs-pino';

/**
 * Shared nestjs-pino options: JSON in production, pino-pretty locally.
 * Every log line includes a `service` field for filtering in log aggregators.
 */
export function createPinoParams(service: string): Params {
  const level = process.env.LOG_LEVEL ?? 'info';
  const isProd = process.env.NODE_ENV === 'production';

  return {
    pinoHttp: {
      level,
      transport: isProd
        ? undefined
        : {
            target: 'pino-pretty',
            options: {
              singleLine: true,
              colorize: true,
              translateTime: 'SYS:standard',
            },
          },
      customProps: () => ({ service }),
      serializers: {
        req: (req: { id?: string; method?: string; url?: string }) => ({
          id: req.id,
          method: req.method,
          url: req.url,
        }),
        res: (res: { statusCode?: number }) => ({
          statusCode: res.statusCode,
        }),
      },
    },
  };
}
