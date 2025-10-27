import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as XLSX from 'xlsx';
import { log } from 'console';

// Article 57 database URL
const EMA_REPORT_FILENAME = 'medicines-output-medicines-report_en.xlsx';
const EMA_REPORT_URL = 'https://www.ema.europa.eu/en/documents/report/' + EMA_REPORT_FILENAME;

// Cache for update checks
const updateCheckCache: {
  lastCheck: Date | null;
  lastResult: boolean;
  etag: string | null;
  lastModified: string | null;
} = {
  lastCheck: null,
  lastResult: false,
  etag: null,
  lastModified: null
};

const CACHE_TIMEOUT = 60 * 60 * 1000; // 1 hour

/**
 * Calculate MD5 hash of a file
 */
function calculateFileHash(filePath: string): string {
  const fileBuffer = fs.readFileSync(filePath);
  const hashSum = crypto.createHash('md5');
  hashSum.update(fileBuffer);
  return hashSum.digest('hex');
}

/**
 * Remove directory recursively
 */
function removeDirectory(dirPath: string): void {
  if (fs.existsSync(dirPath)) {
    fs.readdirSync(dirPath).forEach((file) => {
      const curPath = path.join(dirPath, file);
      if (fs.lstatSync(curPath).isDirectory()) {
        removeDirectory(curPath);
      } else {
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(dirPath);
  }
}

/**
 * Check if there's a new Article 57 file available
 */
export async function checkForUpdates(
  targetCsvPath: string = 'assets/ema-report.csv'
): Promise<boolean> {
  try {
    if (!fs.existsSync(targetCsvPath)) {
      console.log('ema report CSV does not exist');
      return true;
    }

    const now = new Date();
    
    // Check cache first
    if (updateCheckCache.lastCheck && 
        (now.getTime() - updateCheckCache.lastCheck.getTime() < CACHE_TIMEOUT)) {
      console.log('Using cached update check result');
      return updateCheckCache.lastResult;
    }

    const stats = fs.statSync(targetCsvPath);
    const currentFileDate = stats.mtime;

    // HEAD request to check Last-Modified header
    try {
      const headers: Record<string, string> = {};
      if (updateCheckCache.etag) {
        headers['etag'] = updateCheckCache.etag;
      }
      if (updateCheckCache.lastModified) {
        headers['last-modified'] = updateCheckCache.lastModified;
      }

      const response = await axios.head(EMA_REPORT_URL, { headers });
      
      // Update cache headers
      if (response.headers.etag) {
        updateCheckCache.etag = response.headers.etag;
      }
      if (response.headers['last-modified']) {
        updateCheckCache.lastModified = response.headers['last-modified'];
      }

      // Check if file was modified
      if (response.headers['last-modified']) {
        const serverDate = new Date(response.headers['last-modified']);
        const needsUpdate = serverDate > currentFileDate;
        
        updateCheckCache.lastCheck = now;
        updateCheckCache.lastResult = needsUpdate;
        
        if (needsUpdate) {
          console.log(`New data available: ${response.headers['last-modified']}`);
        } else {
          console.log('Data is up-to-date');
        }
        
        return needsUpdate;
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.status === 304) {
        console.log('ema report file has not changed (304 Not Modified)');
        updateCheckCache.lastCheck = now;
        updateCheckCache.lastResult = false;
        return false;
      }
      
      console.error('Error checking for updates:', error);
    }
    
    // If we can't determine, check if file is older than 30 days
    const fileAgeDays = (now.getTime() - currentFileDate.getTime()) / (1000 * 60 * 60 * 24);
    const needsUpdate = fileAgeDays > 30;
    
    updateCheckCache.lastCheck = now;
    updateCheckCache.lastResult = needsUpdate;
    
    return needsUpdate;
    
  } catch (error) {
    console.error('Error checking for updates:', error);
    return false;
  }
}

/**
 * Download and convert Article 57 Excel to CSV
 */
export async function updateEMAData(
  targetCsvPath: string = 'assets/ema-report.csv'
): Promise<boolean> {
  const tempDir = path.join(process.cwd(), 'temp');
  const excelPath = path.join(tempDir, EMA_REPORT_FILENAME);
  
  try {
    console.log('Starting ema report data update...');
    
    // Create temp directory
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Check cache
    let needToDownload = true;
    const urlHash = crypto.createHash('md5').update(EMA_REPORT_URL).digest('hex');
    const cacheInfoPath = path.join(process.cwd(), 'assets', '.ema-cache-info');
    
    if (fs.existsSync(cacheInfoPath) && fs.existsSync(targetCsvPath)) {
      try {
        const cacheInfo = JSON.parse(fs.readFileSync(cacheInfoPath, 'utf8'));
        if (cacheInfo.urlHash === urlHash) {
          const currentHash = calculateFileHash(targetCsvPath);
          if (cacheInfo.csvHash === currentHash) {
            console.log('File already up-to-date (hash match), skipping download');
            needToDownload = false;
          }
        }
      } catch (error) {
        console.error('Error reading cache info:', error);
      }
    }
    
    if (needToDownload) {
      // Download Excel file
      console.log(`Downloading from: ${EMA_REPORT_URL}`);
      const response = await axios.get(EMA_REPORT_URL, {
        responseType: 'arraybuffer',
        onDownloadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            process.stdout.write(`Download progress: ${percentCompleted}%\r`);
          }
        }
      });
      console.log('\nDownload complete');
      
      // Save Excel file
      fs.writeFileSync(excelPath, response.data);
      
      // Convert to CSV
      console.log('Converting Excel to CSV...');
      const workbook = XLSX.read(response.data, { 
        type: 'buffer',
        cellDates: true,
        cellNF: false,
        cellText: false
      });
      
      // Get first sheet
      const sheetName = workbook.SheetNames[0];
      console.log(`Reading sheet: ${sheetName}`);
      const worksheet = workbook.Sheets[sheetName];
      
      // Convert to JSON for filtering
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        raw: false,
        defval: '',
        range: 8,
      });
      
      console.log(`Total rows before filtering: ${jsonData.length}`);
      const filteredData  = jsonData.filter((row: any) => {
        return row["Category"] === 'Human' && row["Medicine status"] === 'Authorised';
      });
      
      console.log(`Rows after filtering: ${filteredData.length}`);
      console.log(`Filtered out: ${jsonData.length - filteredData.length} rows`);
         
      const cleanedData = filteredData.map((row: any) => {
        const cleanRow: any = {};
        Object.keys(row).forEach(key => {
          if (!key.startsWith('__EMPTY')) {
            // Replace newlines and carriage returns in column names with spaces
            const cleanKey = key.replace(/[\r\n]+/g, ' ').trim();
            cleanRow[cleanKey] = row[key];
          }
        });
        return cleanRow;
      });

      // Convert filtered data back to worksheet
      const filteredWorksheet = (XLSX.utils as any).json_to_sheet(cleanedData);

      // Convert to CSV
      const csv = XLSX.utils.sheet_to_csv(filteredWorksheet, {
        FS: ',',
        RS: '\n',
        blankrows: false
      });
      
      // Ensure target directory exists
      const targetDir = path.dirname(targetCsvPath);
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true });
      }
      
      // Save CSV
      fs.writeFileSync(targetCsvPath, csv, 'utf8');
      console.log(`CSV saved to: ${targetCsvPath}`);
      
      // Count rows
      const lines = csv.split('\n').filter(line => line.trim());
      console.log(`Total rows: ${lines.length} (including header)`);
      
      // Save cache info
      const cacheInfo = {
        urlHash,
        csvHash: calculateFileHash(targetCsvPath),
        timestamp: new Date().toISOString(),
        rowCount: lines.length - 1
      };
      
      fs.writeFileSync(cacheInfoPath, JSON.stringify(cacheInfo, null, 2));
    }
    
    // Clean up temp directory
    console.log('Cleaning up temporary files...');
    removeDirectory(tempDir);
    
    console.log('EMA data update completed successfully!');
    
    // Reset update check cache
    updateCheckCache.lastCheck = new Date();
    updateCheckCache.lastResult = false;
    
    return true;
  } catch (error) {
    console.error('Error updating EMA data:', error);
    
    // Cleanup on error
    try {
      if (fs.existsSync(tempDir)) {
        removeDirectory(tempDir);
      }
    } catch (cleanupError) {
      console.error('Error cleaning up temp directory:', cleanupError);
    }
    
    return false;
  }
}

export default {
  updateEMAData,
  checkForUpdates
};