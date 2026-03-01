// Lightweight proxy for Supabase requests. Deploy this as a serverless function
// (Vercel, Netlify, Cloudflare Workers, etc.) and point your frontend at the
// function's URL instead of the raw Supabase domain. This allows clients on
// restrictive networks to talk to Supabase via a hostname they can resolve.

import type { VercelRequest, VercelResponse } from '@vercel/node';
import fetch from 'node-fetch';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    // build target url by stripping our function prefix. When deployed to
    // Vercel the proxy is available at `/api/supabase-proxy`; in development we
    // also want to remove `/api` since the dev server rewrites it.
    //
    // Example incoming urls:
    //   /api/supabase-proxy/auth/v1/signup
    //   /supabase/auth/v1/signup       (if you ever use a custom rewrite)
    //
    // After removal we should be left with `/auth/v1/signup` so the request is
    // forwarded to the correct Supabase endpoint.
    let targetPath = req.url || '';
    targetPath = targetPath.replace(/^\/api\/supabase-proxy/, '');
    targetPath = targetPath.replace(/^\/supabase/, '');

    const supabaseUrl = process.env.SUPABASE_URL || 'https://ngxptvwtklwalmkbnylq.supabase.co';
    const url = supabaseUrl + targetPath;

    console.log('[proxy] incoming', req.method, req.url);
    console.log('[proxy] forwarding to', url);

    // prepare request body: node-fetch expects a string or Buffer. Vercel may
    // provide parsed JSON, so stringify it unless it is already a string.
    let body: any;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (req.body == null) {
        body = undefined;
      } else if (typeof req.body === 'string' || Buffer.isBuffer(req.body)) {
        body = req.body;
      } else {
        body = JSON.stringify(req.body);
      }
    }

    const options: any = {
      method: req.method,
      headers: {
        // pass along headers except host; node-fetch will set its own host
        ...req.headers,
        host: new URL(supabaseUrl).host,
      },
      body,
    };

    if (body) {
      console.log('[proxy] body:', body.toString().slice(0, 200));
    }

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
