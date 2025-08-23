import { NextApiResponse } from 'next';

type APIHandler = <T extends NextApiResponse = NextApiResponse>(
  req: any,
  res: T,
) => void | Promise<void>;

const FLAG_ALLOW_ALL_ORIGINS = true;

export const withCORS =
  (apiHandler: APIHandler): APIHandler =>
  async (req, res) => {
    const origin = req.headers.origin || '';
    if (FLAG_ALLOW_ALL_ORIGINS) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }

    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader(
      'Access-Control-Allow-Methods',
      'GET,OPTIONS,PATCH,DELETE,POST,PUT,HEAD',
    );
    res.setHeader(
      'Access-Control-Allow-Headers',
      'X-CSRF-Token, X-Requested-With, x-supabase-auth, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version',
    );
    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }
    return await apiHandler(req, res);
  };
