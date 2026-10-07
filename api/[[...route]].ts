import type { IncomingMessage, ServerResponse } from 'http';
import app from '../server/src/app';

export default function handler(req: IncomingMessage & { url?: string }, res: ServerResponse) {
  if (req.url?.startsWith('/api')) {
    req.url = req.url.slice(4) || '/';
  }

  return app(req as any, res as any);
}