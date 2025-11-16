"use client";

import { useParams } from "next/navigation";
import { redirect } from "next/navigation";

export default function ReadmePage() {
  const params = useParams();
  const fileId = params.id as string;
  
  // Redirect to the main file page which serves as the README viewer
  redirect(`/file/${fileId}`);
}
