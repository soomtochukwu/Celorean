import { NextRequest, NextResponse } from 'next/server';
import { PinataSDK } from 'pinata';

const pinata = new PinataSDK({
    pinataJwt: process.env.PINATA_JWT!,
    pinataGateway: process.env.PINATA_GATEWAY!,
});

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const thumbnailFile = formData.get('thumbnail') as File;
        const courseTitle = formData.get('courseTitle') as string;

        if (!thumbnailFile || !courseTitle) {
            return NextResponse.json(
                { error: 'Thumbnail file and course title are required' },
                { status: 400 }
            );
        }

        // Create a descriptive filename
        const fileName = `course_thumbnail_${courseTitle.replace(/[^a-zA-Z0-9]/g, '_')}_${Date.now()}${thumbnailFile.name.substring(
            thumbnailFile.name.lastIndexOf('.')
        )}`;

        // Create a new File object with the custom filename
        // Use Object.defineProperty to set the name property
        const fileToUpload = thumbnailFile;
        Object.defineProperty(fileToUpload, 'name', {
            writable: true,
            value: fileName
        });

        // Upload to Pinata using the correct method
        const uploadResult = await pinata.upload.public.file(fileToUpload);

        return NextResponse.json({
            success: true,
            cid: uploadResult.cid,
            ipfsUrl: `https://ipfs.io/ipfs/${uploadResult.cid}`,
            gatewayUrl: `${process.env.PINATA_GATEWAY}/ipfs/${uploadResult.cid}`,
        });
    } catch (error) {
        console.error('Error uploading thumbnail to Pinata:', error);
        return NextResponse.json(
            { error: 'Failed to upload thumbnail to IPFS' },
            { status: 500 }
        );
    }
}