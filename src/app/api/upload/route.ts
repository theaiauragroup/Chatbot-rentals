import { NextResponse } from "next/server";
import { writeFile } from "fs/promises";
import path from "path";
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create a unique filename
    const ext = path.extname(file.name) || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    const uploadPath = path.join(process.cwd(), "public", "uploads", filename);

    await writeFile(uploadPath, buffer);

    // Return the clean local URL
    const url = `/uploads/${filename}`;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
