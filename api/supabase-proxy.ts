// Lightweight proxy for Supabase requests. Deploy this as a serverless function
// (Vercel, Netlify, Cloudflare Workers, etc.) and point your frontend at the
// function's URL instead of the raw Supabase domain. This allows clients on
// restrictive networks to talk to Supabase via a hostname they can resolve.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // build target url by stripping the proxy path prefix
    const targetPath = req.url?.replace(/^\/supabase/, '') || '';
    const supabaseUrl = process.env.SUPABASE_URL || 'https://ngxptvwtklwalmkbnylq.supabase.co';
    const url = supabaseUrl + targetPath;

    const options: any = {
      method: req.method,
      headers: {
        // pass along headers except host
        ...req.headers,
        host: new URL(supabaseUrl).host,
      },
      body: req.method !== 'GET' && req.method !== 'HEAD' ? req.body : undefined,
    };

    const response = await fetch(url, options);
    const body = await response.text();

    res.status(response.status);
    response.headers.forEach((value, key) => {
      // avoid setting hop-by-hop headers that Vercel/Netlify reserves
      if (!['connection', 'keep-alive', 'host', 'transfer-encoding'].includes(key)) {
        res.setHeader(key, value);
      }
    });
    res.send(body);
  } catch (err: any) {
    console.error('Proxy error:', err);
    res.status(500).json({ error: 'Proxy error', details: err.message });
  }
}
