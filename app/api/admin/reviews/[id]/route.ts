// app/api/admin/reviews/[id]/route.ts
import { NextRequest } from "next/server";
import { handleModerateReview } from "@/lib/admin/reviews.handlers";

// PATCH /api/admin/reviews/[id]
// Body: { "action": "approve" }  or  { "action": "reject" }
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return handleModerateReview(req, id);
}