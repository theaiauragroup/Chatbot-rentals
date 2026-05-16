import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Forward to ImgBB for permanent hosting (Works on Vercel!)
    const IMGBB_API_KEY = '71f4560731604a08153408546f041280';
    
    // Convert file to base64 for reliable API transmission
    const bytes = await file.arrayBuffer();
    const base64 = Buffer.from(bytes).toString('base64');
    
    const body = new FormData();
    body.append('image', base64);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
      method: 'POST',
      body,
    });

    if (!response.ok) {
      throw new Error("ImgBB upload failed");
    }

    const result = await response.json();
    const url = result.data.display_url;
    
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
