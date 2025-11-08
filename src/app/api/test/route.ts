export const runtime = "nodejs";

export async function GET() {
  console.log("TEST ROUTE HIT — ENV KEY:", process.env.OPENROUTER_API_KEY);
  return Response.json({ key: process.env.OPENROUTER_API_KEY ?? "NOT_FOUND" });
}
