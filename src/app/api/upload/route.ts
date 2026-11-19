import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

function detectImageType(buffer: Buffer): string | null {
  if (buffer.length < 12) return null;
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff)
    return "image/jpeg";
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  )
    return "image/png";
  if (
    buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
    buffer.subarray(8, 12).toString("ascii") === "WEBP"
  )
    return "image/webp";
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Nenhum arquivo enviado." },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "Apenas imagens são aceitas." },
        { status: 400 }
      );
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Arquivo muito grande. Máximo 5MB." },
        { status: 400 }
      );
    }

    // Verify magic bytes — o mime declarado pelo cliente não é confiável
    const buffer = Buffer.from(await file.arrayBuffer());
    const detected = detectImageType(buffer);
    if (!detected || detected !== file.type) {
      return NextResponse.json(
        { error: "Tipo de imagem não suportado. Use JPEG, PNG ou WebP." },
        { status: 400 }
      );
    }

    // Upload to Cloudinary CDN
    const url = await uploadImage(buffer, detected);

    return NextResponse.json({ url });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor." },
      { status: 500 }
    );
  }
}
