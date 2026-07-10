import fs from 'fs';
import path from 'path';

const filesToFix = [
  "app/schedule/ScheduleClient.tsx",
  "app/results/ResultsClient.tsx",
  "app/driver/DriverProfileClient.tsx",
  "app/components/PackOpener.tsx",
  "app/components/NextRaceCard.tsx",
  "app/compare/CompareClient.tsx",
  "app/collection/page.tsx",
];

for (const file of filesToFix) {
  const filePath = path.join(process.cwd(), file);
  if (!fs.existsSync(filePath)) continue;
  
  let content = fs.readFileSync(filePath, 'utf-8');
  
  // Replace <img with <Image
  // Add width={500} height={500} to images that don't have width/fill
  let updated = content.replace(/<img([^>]+)>/g, (match, attrs) => {
    let newAttrs = attrs;
    if (!/width=/.test(newAttrs) && !/fill/.test(newAttrs)) {
      newAttrs = ` width={500} height={500}${newAttrs}`;
    }
    return `<Image${newAttrs}>`;
  });

  // Self closing images?
  updated = updated.replace(/<img([^>]+)\/>/g, (match, attrs) => {
    let newAttrs = attrs;
    if (!/width=/.test(newAttrs) && !/fill/.test(newAttrs)) {
      newAttrs = ` width={500} height={500}${newAttrs}`;
    }
    return `<Image${newAttrs}/>`;
  });

  // Ensure import Image from 'next/image' exists
  if (updated !== content && !/import\s+Image\s+from\s+['"]next\/image['"]/.test(updated)) {
    // Insert after the first import or at the top
    const importStatement = `import Image from "next/image";\n`;
    if (updated.includes('import ')) {
      updated = updated.replace(/import /, importStatement + 'import ');
    } else {
      updated = importStatement + updated;
    }
  }

  if (updated !== content) {
    fs.writeFileSync(filePath, updated);
    console.log(`Updated ${file}`);
  }
}
