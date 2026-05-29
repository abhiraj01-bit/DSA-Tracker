import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const parentDir = path.resolve(__dirname, '..');

// Basic CSV parser to handle quotes and commas correctly
function parseCSVLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function parseCSVFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/).filter(line => line.trim());
  if (lines.length < 2) return [];

  // Parse headers
  const headers = parseCSVLine(lines[0]).map(h => h.toLowerCase().trim());
  const diffIdx = headers.indexOf('difficulty');
  const titleIdx = headers.indexOf('title');
  const freqIdx = headers.indexOf('frequency');
  const linkIdx = headers.indexOf('link');
  const topicsIdx = headers.indexOf('topics');

  const questions = [];

  for (let i = 1; i < lines.length; i++) {
    const row = parseCSVLine(lines[i]);
    if (row.length < headers.length) continue;

    const title = titleIdx !== -1 ? row[titleIdx] : '';
    if (!title) continue;

    const difficulty = diffIdx !== -1 ? row[diffIdx] : 'Medium';
    const frequency = freqIdx !== -1 ? Math.round(parseFloat(row[freqIdx]) || 0) : 0;
    const leetcode_url = linkIdx !== -1 ? row[linkIdx] : '';
    const topicsRaw = topicsIdx !== -1 ? row[topicsIdx] : '';
    const topic = topicsRaw ? topicsRaw.replace(/"/g, '').split(',').map(t => t.trim()).filter(Boolean) : [];

    // Simple cleaning of difficulty to match interface
    let diff = 'Medium';
    if (difficulty.toLowerCase() === 'easy') diff = 'Easy';
    if (difficulty.toLowerCase() === 'hard') diff = 'Hard';

    questions.push({
      id: uuidv4(),
      title,
      difficulty: diff,
      frequency,
      leetcode_url,
      gfg_url: '', // Will populate or leave blank
      topic,
      solved: false,
      bookmarked: false,
      notes: ''
    });
  }

  return questions;
}

function run() {
  console.log('Scanning directories in:', parentDir);
  const items = fs.readdirSync(parentDir);
  const allQuestions = [];
  const companiesFound = [];

  for (const item of items) {
    const fullPath = path.join(parentDir, item);
    if (!fs.statSync(fullPath).isDirectory()) continue;
    if (item.startsWith('.') || item === 'dsa-tracker' || item === 'node_modules') continue;

    // Look for CSVs in the company directory
    const files = fs.readdirSync(fullPath);
    let csvFile = files.find(f => f === '5. All.csv');
    if (!csvFile) csvFile = files.find(f => f.endsWith('.csv'));

    if (csvFile) {
      const csvPath = path.join(fullPath, csvFile);
      try {
        const questions = parseCSVFile(csvPath);
        if (questions.length > 0) {
          questions.forEach(q => {
            q.company = item;
          });
          allQuestions.push(...questions);
          companiesFound.push(item);
        }
      } catch (err) {
        console.error(`Error parsing ${csvPath}:`, err.message);
      }
    }
  }

  console.log(`Parsed ${allQuestions.length} questions across ${companiesFound.length} companies.`);

  // Write to src/data/questions.json
  const dataDir = path.resolve(__dirname, 'src', 'data');
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const outputPath = path.join(dataDir, 'questions.json');
  fs.writeFileSync(outputPath, JSON.stringify(allQuestions, null, 2), 'utf-8');
  console.log('Successfully wrote questions to:', outputPath);
}

run();
