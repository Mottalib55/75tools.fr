// Cloudflare Worker pour 75tools.fr
// Ce worker intercepte les requêtes vers /card/* et injecte les bons meta tags
// et proxie /seo/* vers le SEO platform sur Vercel

const SEO_PLATFORM_ORIGIN = 'https://seo-platform-sigma.vercel.app';

export default {
  async fetch(request) {
    const url = new URL(request.url);

    // Proxy /seo/* to SEO platform on Vercel (strip /seo prefix)
    if (url.pathname === '/seo' || url.pathname.startsWith('/seo/')) {
      const strippedPath = url.pathname === '/seo' ? '/' : url.pathname.slice(4);
      const targetUrl = new URL(strippedPath + url.search, SEO_PLATFORM_ORIGIN);
      const proxyRequest = new Request(targetUrl, {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'manual',
      });
      const response = await fetch(proxyRequest);
      // Pass through the response, rewriting any Location headers
      const newHeaders = new Headers(response.headers);
      const location = newHeaders.get('location');
      if (location) {
        const locUrl = new URL(location, SEO_PLATFORM_ORIGIN);
        if (locUrl.origin === SEO_PLATFORM_ORIGIN) {
          newHeaders.set('location', locUrl.pathname + locUrl.search);
        }
      }
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }

    // Only process /card/* routes
    if (!url.pathname.startsWith('/card/')) {
      return fetch(request);
    }

    // Extract username from URL
    const username = url.pathname.split('/card/')[1]?.split('/')[0]?.split('?')[0];

    if (!username) {
      return fetch(request);
    }

    // Fetch the original page
    const response = await fetch(request);
    const contentType = response.headers.get('content-type') || '';

    // Only modify HTML responses
    if (!contentType.includes('text/html')) {
      return response;
    }

    let html = await response.text();

    // Try to fetch the profile data from Supabase to get the real name
    let displayName = username;
    let profileTitle = '';

    try {
      const supabaseUrl = 'https://olnptfkxzyshvdrmjkdw.supabase.co';
      const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9sbnB0Zmt4enlzaHZkcm1qa2R3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzY1OTQ0ODQsImV4cCI6MjA1MjE3MDQ4NH0.L6KRjOLHwHMAmlw1TNbFyAL9g3vJERUjDT53gj0AXNE';

      const profileResponse = await fetch(
        `${supabaseUrl}/rest/v1/profiles?username=eq.${username}&select=first_name,last_name,title`,
        {
          headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
          },
        }
      );

      if (profileResponse.ok) {
        const profiles = await profileResponse.json();
        if (profiles && profiles.length > 0) {
          const profile = profiles[0];
          const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
          if (fullName) {
            displayName = fullName;
            profileTitle = profile.title || '';
          }
        }
      }
    } catch (e) {
      // If fetch fails, use username as fallback
      console.error('Failed to fetch profile:', e);
    }

    const cardUrl = `https://75tools.fr/card/${username}`;
    const pageTitle = profileTitle
      ? `${displayName} - ${profileTitle} | Digital Card`
      : `${displayName} | Digital Card`;

    // Replace meta tags in the HTML
    const replacements = [
      // Title
      [/<title>[^<]*<\/title>/, `<title>${pageTitle}</title>`],

      // Apple mobile web app title
      [/<meta name="apple-mobile-web-app-title" content="[^"]*"/,
       `<meta name="apple-mobile-web-app-title" content="${displayName}"`],

      // Application name
      [/<meta name="application-name" content="[^"]*"/,
       `<meta name="application-name" content="${displayName}"`],

      // OG title
      [/<meta property="og:title" content="[^"]*"/,
       `<meta property="og:title" content="${pageTitle}"`],

      // OG URL
      [/<meta property="og:url" content="[^"]*"/,
       `<meta property="og:url" content="${cardUrl}"`],

      // Twitter title
      [/<meta name="twitter:title" content="[^"]*"/,
       `<meta name="twitter:title" content="${pageTitle}"`],

      // Canonical URL
      [/<link rel="canonical" href="[^"]*"/,
       `<link rel="canonical" href="${cardUrl}"`],
    ];

    for (const [pattern, replacement] of replacements) {
      html = html.replace(pattern, replacement);
    }

    // Inject a proper manifest link for this specific card
    const manifestJson = JSON.stringify({
      name: pageTitle,
      short_name: displayName,
      start_url: cardUrl,
      scope: 'https://75tools.fr/card/',
      display: 'standalone',
      background_color: '#f1f5f9',
      theme_color: '#0f172a',
      icons: [
        {
          src: 'https://75tools.fr/favicon.svg',
          sizes: 'any',
          type: 'image/svg+xml',
          purpose: 'any maskable'
        }
      ]
    });

    // Remove the existing manifest script that creates blob URL and add static manifest
    // Add a data URL manifest directly in the HTML head
    const manifestDataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(manifestJson)}`;
    const manifestLink = `<link rel="manifest" href="${manifestDataUrl}">`;

    // Insert manifest link right after <head>
    html = html.replace('<head>', `<head>\n    ${manifestLink}`);

    // Return modified HTML
    return new Response(html, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        'content-type': 'text/html;charset=UTF-8',
      },
    });
  },
};
