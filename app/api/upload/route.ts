// route.ts
import { NextRequest, NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export const runtime = "nodejs"; // ensure AWS SDK can use Node built-ins

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { fileName } = body ?? {};

    if (!fileName) {
      return NextResponse.json({ error: "fileName is required" }, { status: 400 });
    }

    // Make sure these env var names match what you set in your env/.env
    const accountId = process.env.R2_ACCOUNT_ID;
    const accessKeyId = process.env.R2_ACCESS_KEY_ID;
    const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
    const bucket = process.env.R2_BUCKET_NAME;

    if (!accountId || !accessKeyId || !secretAccessKey || !bucket) {
      console.error("Missing R2 configuration:", {
        accountIdExists: !!accountId,
        accessKeyExists: !!accessKeyId,
        secretKeyExists: !!secretAccessKey,
        bucketExists: !!bucket,
      });
      return NextResponse.json({ error: "R2 configuration is incomplete" }, { status: 500 });
    }

    const client = new S3Client({
      region: "auto",
      endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucket,
      Key: fileName,
      ContentType: "application/octet-stream",
    });

    const signedUrl = await getSignedUrl(client, command, {
      expiresIn: 3600,
    });

    return NextResponse.json({ uploadUrl: signedUrl });
  } catch (err) {
    console.error("Error in upload URL handler:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}