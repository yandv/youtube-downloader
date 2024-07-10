import { Params } from "@/types/api-params";
import { createWriteStream } from "fs";
import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import ytdl from "ytdl-core";

export async function GET(
  request: NextRequest,
  { params }: Params<{ videoId: string }>
) {
  const quality = request.nextUrl.searchParams.get("id");
  const { videoId } = params;

  const info = await ytdl.getInfo(videoId);

  const videoFormat = quality
    ? info.formats.find((f) => f.itag === parseInt(quality))
    : ytdl.chooseFormat(info.formats, { quality: "highest" });

  if (!videoFormat) {
    return NextResponse.json(
      {
        error: "Formato de vídeo inválido",
      },
      { status: 400 }
    );
  }

  const mimeType = videoFormat.mimeType?.includes("; ")
    ? videoFormat.mimeType.split("; ")[0]
    : videoFormat.mimeType;

  console.log(mimeType);

  const extension = mimeType?.split("/")[1];

  const fileName =
    videoId +
    "-" +
    videoFormat.qualityLabel +
    "@" +
    videoFormat.fps +
    "." +
    extension;
  const filePath = "static/" + fileName;

  if (fs.existsSync(filePath)) {
    const stat = fs.statSync(filePath);
    const buffer = Buffer.from(fs.readFileSync(filePath));
    const response = new NextResponse(buffer);

    response.headers.set(
      "Content-Disposition",
      `attachment; filename=${fileName}`
    );
    response.headers.set("Content-Type", videoFormat.mimeType!);
    response.headers.set("Content-Length", stat.size.toString());

    return response;
  }

  return new Promise((resolve, reject) => {
    ytdl(videoId, { quality: videoFormat.itag })
      .pipe(createWriteStream(filePath))
      .on("finish", () => {
        const stat = fs.statSync(filePath);
        const buffer = Buffer.from(fs.readFileSync(filePath));
        const response = new NextResponse(buffer);

        response.headers.set(
          "Content-Disposition",
          `attachment; filename=${fileName}`
        );
        response.headers.set("Content-Type", videoFormat.mimeType!);
        response.headers.set("Content-Length", stat.size.toString());

        setTimeout(() => {
          fs.unlinkSync(filePath);
        }, 1000 * 60 * 15);

        resolve(response);
      })
      .on("error", (error) => {
        reject(
          NextResponse.json(
            {
              error: error.message,
            },
            { status: 500 }
          )
        );
      });
  });
}
