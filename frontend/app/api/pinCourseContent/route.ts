import { NextRequest, NextResponse } from "next/server";
import { PinataSDK } from "pinata";

const pinata = new PinataSDK({
  pinataJwt: process.env.PINATA_JWT!,
  pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type");

    if (contentType?.includes("multipart/form-data")) {
      // Handle FormData (file uploads)
      const formData = await request.formData();
      const file = formData.get("file") as File;
      const title = formData.get("title") as string;
      const description = formData.get("description") as string;
      const type = formData.get("type") as string;
      const courseId = formData.get("courseId") as string;

      if (file) {
        // Upload file to IPFS with metadata tags
        const upload = await pinata.upload.public.file(file, {
          metadata: {
            name: `${title}_${Date.now()}`,
            keyvalues: {
              courseId: courseId || "0",
              contentType: type,
              uploadType: "individual",
            },
          },
        });

        // Create metadata for the content with courseId
        const metadata = {
          title,
          description,
          type,
          courseId: courseId ? parseInt(courseId) : null,
          fileHash: upload.cid,
          fileName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString(),
        };

        // Create metadata file and upload with tags
        const metadataFile = new File(
          [JSON.stringify(metadata, null, 2)],
          `content_metadata_${title.replace(
            /[^a-zA-Z0-9]/g,
            "_"
          )}_${Date.now()}.json`,
          { type: "application/json" }
        );

        const metadataUpload = await pinata.upload.public.file(metadataFile, {
          metadata: {
            name: `content_metadata_${title}_${Date.now()}`,
            keyvalues: {
              courseId: courseId || "0",
              contentType: "metadata",
              uploadType: "individual",
            },
          },
        });

        return NextResponse.json({
          success: true,
          cid: metadataUpload.cid,
          fileCid: upload.cid,
          metadata,
        });
      }
    } else if (contentType?.includes("application/json")) {
      // Handle JSON data (bulk content updates)
      const requestData = await request.json();
      const { courseId, content } = requestData;

      // Create content metadata with courseId
      const contentWithCourseId = {
        courseId: courseId ? parseInt(courseId) : null,
        content: content || [],
        uploadedAt: new Date().toISOString(),
      };

      // Create JSON file and upload with metadata tags
      const contentFile = new File(
        [JSON.stringify(contentWithCourseId, null, 2)],
        `course_content_${courseId}_${Date.now()}.json`,
        { type: "application/json" }
      );

      const upload = await pinata.upload.public.file(contentFile, {
        metadata: {
          name: `course_content_${courseId}_${Date.now()}`,
          keyvalues: {
            courseId: courseId?.toString() || "0",
            contentType: "bulk_content",
            uploadType: "bulk",
          },
        },
      });

      return NextResponse.json({
        success: true,
        cid: upload.cid,
        metadata: contentWithCourseId,
      });
    }

    return NextResponse.json(
      { error: "Unsupported content type" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error uploading to IPFS:", error);
    return NextResponse.json(
      { error: "Failed to upload to IPFS" },
      { status: 500 }
    );
  }
}
