import * as fs from "fs";
import * as path from "path";

function encodeImageToBase64(): string {
  const filePath = process.argv[2];
  const fileBuffer = fs.readFileSync(filePath);
  const base64Data = fileBuffer.toString("base64");

  // Infer MIME type from file extension
  const ext = path.extname(filePath).toLowerCase();
  let mimeType = "application/octet-stream";

  if (ext === ".png") mimeType = "image/png";
  else if (ext === ".jpg" || ext === ".jpeg") mimeType = "image/jpeg";
  else if (ext === ".gif") mimeType = "image/gif";
  else if (ext === ".ico") mimeType = "image/x-icon";
  else if (ext === ".svg") mimeType = "image/svg+xml";

  return `data:${mimeType};base64,${base64Data}`;
}

// Example usage:
const base64EncodedLogo = encodeImageToBase64();
console.log(base64EncodedLogo);
