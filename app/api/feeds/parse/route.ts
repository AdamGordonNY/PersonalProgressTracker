import Parser from "rss-parser";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing URL parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const parser = new Parser();
    const feed = await parser.parseURL(url);

    return new Response(JSON.stringify(feed), {
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "s-maxage=3600, stale-while-revalidate=1800",
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: "Failed to parse feed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
