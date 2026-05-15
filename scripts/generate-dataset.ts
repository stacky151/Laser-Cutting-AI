import fs from 'fs';
import path from 'path';
import cliProgress from 'cli-progress';
import chalk from 'chalk';
import { generateBoxSVG, BoxConfig } from '../src/lib/maker-engine';

const BATCH_SIZE = 100000;
const DATASET_DIR = path.join(process.cwd(), 'dataset');
const SVGS_DIR = path.join(DATASET_DIR, 'svgs');
const CSV_FILE = path.join(DATASET_DIR, 'metadata.csv');

// Ensure directories exist
if (!fs.existsSync(DATASET_DIR)) fs.mkdirSync(DATASET_DIR, { recursive: true });
if (!fs.existsSync(SVGS_DIR)) fs.mkdirSync(SVGS_DIR, { recursive: true });

function getRandomNumber(min: number, max: number, decimals: number = 2): number {
  const num = Math.random() * (max - min) + min;
  return parseFloat(num.toFixed(decimals));
}

function generateRandomConfig(): BoxConfig {
  return {
    width: getRandomNumber(50, 300),
    depth: getRandomNumber(50, 300),
    height: getRandomNumber(20, 150),
    thickness: getRandomNumber(1.5, 6, 1),
    kerf: getRandomNumber(0.05, 0.25, 3),
    tabWidth: getRandomNumber(10, 40, 0),
  };
}

async function runHarvester() {
  console.log(chalk.blue.bold('\n🚀 CutCAD.ai Data Harvester Initializing...'));
  console.log(chalk.gray(`Target: ${BATCH_SIZE} files`));
  console.log(chalk.gray(`Output Directory: ${DATASET_DIR}\n`));

  // Initialize CSV with headers if it doesn't exist
  if (!fs.existsSync(CSV_FILE)) {
    fs.writeFileSync(CSV_FILE, 'filename,prompt,parameters\n', 'utf8');
  }

  // Setup Progress Bar
  const progressBar = new cliProgress.SingleBar({
    format: `${chalk.cyan('{bar}')} {percentage}% | ETA: {eta}s | {value}/{total} SVGs | Mem: {memory}`,
    barCompleteChar: '\u2588',
    barIncompleteChar: '\u2591',
    hideCursor: true
  });

  progressBar.start(BATCH_SIZE, 0, { memory: '0 MB' });

  let csvBuffer = '';
  
  for (let i = 1; i <= BATCH_SIZE; i++) {
    const config = generateRandomConfig();
    const svgContent = generateBoxSVG(config);
    const filename = `box_${String(i).padStart(6, '0')}.svg`;
    const prompt = `A laser cut parametric box. Dimensions: ${config.width}mm width, ${config.depth}mm depth, ${config.height}mm height. Material thickness: ${config.thickness}mm. Tab width: ${config.tabWidth}mm. Kerf offset: ${config.kerf}mm.`;
    
    // Write SVG to disk
    fs.writeFileSync(path.join(SVGS_DIR, filename), svgContent, 'utf8');

    // Prepare CSV row
    const jsonParams = JSON.stringify(config).replace(/"/g, '""'); // Escape quotes for CSV
    csvBuffer += `${filename},"${prompt}","${jsonParams}"\n`;

    // Flush CSV buffer every 100 iterations to save memory
    if (i % 100 === 0) {
      fs.appendFileSync(CSV_FILE, csvBuffer, 'utf8');
      csvBuffer = '';
    }

    // Update progress bar
    const memoryUsage = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
    progressBar.update(i, { memory: `${memoryUsage} MB` });
  }

  // Flush remaining
  if (csvBuffer.length > 0) {
    fs.appendFileSync(CSV_FILE, csvBuffer, 'utf8');
  }

  progressBar.stop();
  console.log(chalk.green.bold('\n✅ Dataset Generation Complete!'));
  console.log(chalk.gray(`Total Size: ${BATCH_SIZE} SVGs`));
  console.log(chalk.gray(`Ledger updated at: ${CSV_FILE}\n`));
}

runHarvester().catch((err) => {
  console.error(chalk.red('\n❌ Harvester Failed:'), err);
});
