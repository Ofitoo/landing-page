const UNAVAILABLE_STATUSES = new Set([502, 503, 504]);

export default async (request, context) => {
  try {
    const response = await context.next();
    if (!UNAVAILABLE_STATUSES.has(response.status)) {
      return response;
    }
  } catch {
    // The proxy can fail before returning an HTTP response.
  }

  const pageUrl = new URL("/activation-unavailable.html", request.url);
  const page = await fetch(pageUrl);
  if (!page.ok) {
    return new Response("Aktywacja chwilowo niedostępna. Spróbuj ponownie później.", {
      status: 503,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }

  return new Response(await page.text(), {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "no-store",
      "Referrer-Policy": "no-referrer",
      "X-Robots-Tag": "noindex",
    },
  });
};
