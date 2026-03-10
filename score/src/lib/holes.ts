import fs from "fs";
import path from "path";
import matter from "gray-matter";

export interface HoleData {
  number: number;
  name: string;
  par: number;
  illustration: string;
  instructions: string;
}

export function loadHoles(): HoleData[] {
  const holesDir = path.join(process.cwd(), "src/content/holes");
  const files = fs
    .readdirSync(holesDir)
    .filter((f) => f.startsWith("hole-") && f.endsWith(".md"))
    .sort();

  return files.map((file) => {
    const raw = fs.readFileSync(path.join(holesDir, file), "utf-8");
    const { data, content } = matter(raw);
    const number = parseInt(file.replace("hole-", "").replace(".md", ""), 10);

    return {
      number,
      name: data.name as string,
      par: data.par as number,
      illustration: data.illustration as string,
      instructions: content.trim(),
    };
  });
}

export const holes: HoleData[] = loadHoles();
