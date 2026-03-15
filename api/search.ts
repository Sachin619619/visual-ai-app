// Vercel Edge Function — proxies to Brave Search API
// Set BRAVE_SEARCH_API_KEY in Vercel project environment variables
// Free tier: https://api.search.brave.com (2000 req/month)

export const config = { runtime: 'edge' };

export default async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const query = url.searchParams.get('q');

  if (!query) {
    return new Response(JSON.stringify({ error: 'Missing query parameter' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Accept key from env var (admin-set) or from query param (user-provided)
  const apiKey = process.env.BRAVE_SEARCH_API_KEY || url.searchParams.get('key');
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: 'No Brave Search API key. Add one in the app Settings → Web Search.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    );
  }

  try {
    const searchUrl = `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=5&search_lang=en&result_filter=web`;
    const response = await fetch(searchUrl, {
      headers: {
        Accept: 'application/json',
        'Accept-Encoding': 'gzip',
        'X-Subscription-Token': apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Brave API returned ${response.status}`);
    }

    const data = await response.json() as any;
    const results = (data.web?.results ?? []).slice(0, 5).map((r: any) => ({
      title: r.title ?? '',
      url: r.url ?? '',
      snippet: r.description ?? r.extra_snippets?.[0] ?? '',
    }));

    return new Response(JSON.stringify({ results }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
      },
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
