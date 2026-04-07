import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import XLSX from 'xlsx';
import { protect } from '../middleware/auth.js';
import db from '../db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOADS_DIR = path.join(__dirname, '../../uploads');

const router = express.Router();

if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const upload = multer({
  dest: UPLOADS_DIR,
  limits: { fileSize: 50 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (['.xlsx', '.xls'].includes(ext)) cb(null, true);
    else cb(new Error('Only Excel files (.xlsx or .xls) are allowed'));
  }
});

function removeDuplicates(data) {
  const seen = new Set();
  return data.filter(row => {
    const key = JSON.stringify(row);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function trimSpaces(data) {
  return data.map(row => {
    const newRow = {};
    for (const key of Object.keys(row)) {
      const val = row[key];
      newRow[key] = typeof val === 'string' ? val.trim() : val;
    }
    return newRow;
  });
}

function fillMissingValues(data) {
  let filled = 0;
  const result = data.map(row => {
    const newRow = {};
    for (const key of Object.keys(row)) {
      if (row[key] === null || row[key] === undefined || row[key] === '') {
        newRow[key] = 'N/A';
        filled++;
      } else {
        newRow[key] = row[key];
      }
    }
    return newRow;
  });
  return { result, filled };
}

function removeBlankRows(data) {
  return data.filter(row =>
    Object.values(row).some(v => v !== null && v !== undefined && v !== '')
  );
}

function generateChartData(data, columns) {
  if (data.length === 0 || columns.length === 0) return null;
  const numericCols = columns.filter(col => {
    const v = data[0][col];
    return v !== null && v !== undefined && v !== '' && !isNaN(v);
  });
  if (numericCols.length === 0) return null;
  const labelCol = columns[0];
  const valueCol = numericCols[0];
  const rows = data.slice(0, 15);
  
  const values = rows.map(row => Number(row[valueCol]) || 0);
  const labels = rows.map(row => String(row[labelCol] || '').substring(0, 20));
  
  // Calculate simple linear regression for trendline
  const n = values.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += values[i];
    sumXY += i * values[i];
    sumXX += i * i;
  }
  const slope = n > 1 ? (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX) : 0;
  const intercept = n > 1 ? (sumY - slope * sumX) / n : values[0];
  
  const trendData = values.map((_, i) => slope * i + intercept);
  const expectedGrowth = slope > 0 ? ((slope * 6) / (intercept || 1) * 100).toFixed(1) : 0;

  return {
    labels: labels,
    datasets: [
      {
        label: valueCol + ' (Actual)',
        data: values,
        backgroundColor: 'rgba(34, 197, 94, 0.5)',
        borderColor: 'rgb(34, 197, 94)',
        borderWidth: 2
      }
    ],
    trendDatasets: [
      {
        label: 'Trend Projection',
        data: trendData,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        borderWidth: 2,
        fill: true,
        tension: 0.3
      }
    ],
    expectedGrowth: expectedGrowth
  };
}

router.post('/clean', protect, upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'Please upload a file' });
  }
  try {
    const options = JSON.parse(req.body.options || '{}');
    const workbook = XLSX.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    let data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    const originalRows = data.length;
    let duplicatesRemoved = 0;
    let missingFilled = 0;

    if (options.trimSpaces !== false) data = trimSpaces(data);
    data = removeBlankRows(data);

    if (options.removeDuplicates !== false) {
      const before = data.length;
      data = removeDuplicates(data);
      duplicatesRemoved = before - data.length;
    }

    if (options.fillMissing !== false) {
      const { result, filled } = fillMissingValues(data);
      data = result;
      missingFilled = filled;
    }

    const cleanedRows = data.length;
    const originalName = req.file.originalname || 'data.xlsx';
    const cleanedFilename = 'cleaned_' + Date.now() + '_' + originalName;
    const cleanedPath = path.join(UPLOADS_DIR, cleanedFilename);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(data), 'Cleaned Data');
    XLSX.writeFile(wb, cleanedPath);

    fs.unlinkSync(req.file.path);

    const historyResult = db.prepare(
      'INSERT INTO file_history (user_id, user_name, filename, original_rows, cleaned_rows, duplicates_removed, missing_filled) VALUES (?, ?, ?, ?, ?, ?, ?)'
    ).run(req.user.id, req.user.name, originalName, originalRows, cleanedRows, duplicatesRemoved, missingFilled);

    db.prepare('UPDATE users SET files_processed = files_processed + 1 WHERE id = ?').run(req.user.id);

    const columns = data.length > 0 ? Object.keys(data[0]) : [];

    res.json({
      success: true,
      message: 'File cleaned successfully!',
      fileId: historyResult.lastInsertRowid,
      cleanedFilename,
      stats: { originalRows, cleanedRows, duplicatesRemoved, missingFilled, columns: columns.length },
      preview: data.slice(0, 50),
      columns,
      chartData: generateChartData(data, columns)
    });
  } catch (error) {
    console.error('Excel clean error:', error);
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    res.status(500).json({ success: false, message: 'Error processing file: ' + error.message });
  }
});

router.get('/download/:filename', protect, (req, res) => {
  const filename = path.basename(req.params.filename);
  const filePath = path.join(UPLOADS_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, message: 'File not found' });
  }
  res.download(filePath, filename);
});

router.get('/history', protect, (req, res) => {
  const history = db.prepare(
    'SELECT * FROM file_history WHERE user_id = ? ORDER BY created_at DESC LIMIT 20'
  ).all(req.user.id);
  res.json({ success: true, history });
});

export default router;
