import { NextRequest } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function POST(req: NextRequest) {
  const { fileName } = await req.json();

  if (!fileName) {
    return Response.json({ error: "fileName is required" }, { status: 400 });
  }

  const client = new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT!,
    credentials: {
      accessKeyId: process.env.R2_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET!,
    },
  });

  const command = new PutObjectCommand({
    Bucket: process.env.R2_BUCKET!,
    Key: fileName,
    ContentType: "application/octet-stream",
  });

  const signedUrl = await getSignedUrl(client, command, {
    expiresIn: 3600,
  });

  return Response.json({ uploadUrl: signedUrl });
}
