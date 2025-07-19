import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get("courseId");

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Search for course content files by courseId in metadata
    // Using 'public' network - change to 'private' if your files are private
    // @ts-ignore
    const files = await pinata.files.list("public", {
      metadata: {
        courseId: {
          value: courseId,
          op: "eq",
        },
      },
    });

    const contentItems = [];

    // Fetch and parse each content file
    for (const file of files.data.files) {
      try {
        const response = await fetch(
          `https://gateway.pinata.cloud/ipfs/${file.cid}`
        );
        const content = await response.json();

        if (content.courseId && content.courseId.toString() === courseId) {
          if (Array.isArray(content.content)) {
            // Bulk content upload format
            contentItems.push(...content.content);
          } else {
            // Individual content item format
            contentItems.push({
              id: file.cid,
              title: content.title,
              description: content.description,
              type: content.type,
              courseId: content.courseId,
              ipfsUrl: content.fileHash
                ? `https://gateway.pinata.cloud/ipfs/${content.fileHash}`
                : undefined,
              thumbnail: content.thumbnail,
              uploadedAt: content.uploadedAt,
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching content for file ${file.cid}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      content: contentItems,
    });
  } catch (error) {
    console.error("Error fetching course content:", error);
    return NextResponse.json(
      { error: "Failed to fetch course content" },
      { status: 500 }
    );
  }
}
