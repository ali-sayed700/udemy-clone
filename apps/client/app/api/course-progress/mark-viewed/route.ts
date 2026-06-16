import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { authFetchGraphQL } from "@/lib/api/fetchGraphqlServer";
import { MARK_LECTURE_VIEWED_MUTATION } from "@/lib/graphql/progress";

export async function POST(request: NextRequest) {
  try {
    const { courseId, lectureId } = await request.json();

    if (!courseId || !lectureId) {
      return NextResponse.json(
        { error: "Missing courseId or lectureId" },
        { status: 400 },
      );
    }

    const session = await getSession();
    if (!session?.accessToken) {
      return NextResponse.json(
        { error: "Unauthorized - please login" },
        { status: 401 },
      );
    }

    // Call GraphQL mutation with server-side auth
    const response = await authFetchGraphQL(MARK_LECTURE_VIEWED_MUTATION, {
      courseId,
      lectureId,
    });

    // response is { markLectureViewed: {...} }
    return NextResponse.json({
      data: response,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to mark lecture as viewed",
      },
      { status: 500 },
    );
  }
}
