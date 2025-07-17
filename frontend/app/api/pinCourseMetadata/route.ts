import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function POST(request: NextRequest) {
    try {
        const { courseData, thumbnailCid } = await request.json();

        if (!courseData) {
            return NextResponse.json(
                { error: 'Course data is required' },
                { status: 400 }
            );
        }

        // Construct course metadata
        const metadata = {
            title: courseData.title,
            description: courseData.description,
            duration: courseData.duration,
            price: courseData.price,
            level: courseData.level,
            tags: courseData.tags,
            thumbnail: thumbnailCid ? `https://ipfs.io/ipfs/${thumbnailCid}` : null,
            createdAt: new Date().toISOString(),
            type: 'course_metadata',
        };

        // Create metadata file
        const metadataFile = new File(
            [JSON.stringify(metadata, null, 2)],
            `course_metadata_${courseData.title.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}.json`,
            {
                type: 'application/json',
            }
        );

        // Upload metadata to IPFS
        const uploadResult = await pinata.upload.public.file(metadataFile);

        return NextResponse.json({
            success: true,
            cid: uploadResult.cid,
            ipfsUrl: `https://ipfs.io/ipfs/${uploadResult.cid}`,
            gatewayUrl: `${process.env.PINATA_GATEWAY}/ipfs/${uploadResult.cid}`,
        });
    } catch (error) {
        console.error('Error uploading course metadata to Pinata:', error);
        return NextResponse.json(
            { error: 'Failed to upload course metadata to IPFS' },
            { status: 500 }
        );
    }
}