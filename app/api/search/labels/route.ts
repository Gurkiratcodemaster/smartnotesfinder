import { NextRequest, NextResponse } from "next/server";
import { File } from "@/app/models/File";

export async function GET(req: NextRequest) {
  try {
    // Get all files from database
    const allFiles = await (File as any).findAll();
    
    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({
        subjects: [],
        classes: [],
        semesters: [],
        uploaderTypes: [],
        topics: [],
        tags: []
      });
    }

    // Extract unique values for each filter
    const subjects = new Set<string>();
    const classes = new Set<string>();
    const semesters = new Set<string>();
    const uploaderTypes = new Set<string>();
    const topics = new Set<string>();
    const tags = new Set<string>();

    allFiles.forEach((file: any) => {
      if (file.labels) {
        if (file.labels.subject) subjects.add(file.labels.subject);
        if (file.labels.class) classes.add(file.labels.class);
        if (file.labels.semester) semesters.add(file.labels.semester);
        if (file.labels.uploaderType) uploaderTypes.add(file.labels.uploaderType);
        if (file.labels.topic) topics.add(file.labels.topic);
        if (Array.isArray(file.labels.tags)) {
          file.labels.tags.forEach((tag: string) => tags.add(tag));
        }
      }
    });

    return NextResponse.json({
      subjects: Array.from(subjects).sort(),
      classes: Array.from(classes).sort(),
      semesters: Array.from(semesters).sort(), 
      uploaderTypes: Array.from(uploaderTypes).sort(),
      topics: Array.from(topics).sort(),
      tags: Array.from(tags).sort()
    });

  } catch (error: any) {
    console.error("Labels API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch labels", detail: error.message },
      { status: 500 }
    );
  }
}