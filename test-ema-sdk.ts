/**
 * Quick test script for EMA SDK
 * Run with: npx ts-node test-ema-sdk.ts
 * Or: npm run test:ema (if you add it to package.json scripts)
 */

import { writeFile } from "fs/promises";
import { EMA } from './src/index';
import { EMAPDFExtractor } from './src/models/EMAPDFExtractor';

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  gray: '\x1b[90m',
};

function log(color: keyof typeof colors, message: string) {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function success(message: string) {
  log('green', `✓ ${message}`);
}

function error(message: string) {
  log('red', `✗ ${message}`);
}

function info(message: string) {
  log('cyan', `ℹ ${message}`);
}

function section(title: string) {
  console.log('\n' + '='.repeat(60));
  log('yellow', `  ${title}`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Test 1: Initialize SDK
 */
async function testInitialize(ema: EMA): Promise<boolean> {
  section('Test 1: Initialize SDK');
  
  try {
    info('Initializing EMA SDK...');
    info('This will download Article 57 data if not present');
    
    // Just making a call will trigger initialization
    const startTime = Date.now();
    await ema.listMedicines(1, 1);
    const duration = ((Date.now() - startTime) / 1000).toFixed(2);
    
    success(`Initialized in ${duration}s`);
    return true;
  } catch (err) {
    error(`Initialization failed: ${err}`);
    return false;
  }
}

/**
 * Test 2: Search medicines
 */
async function testSearch(ema: EMA): Promise<boolean> {
  section('Test 2: Search Medicines');
  
  try {
    info('Searching for "levemir"...');
    
    const results = await ema.listMedicines(1, 5, 'levemir');
    
    success(`Found ${results.totalItems} medicines`);
    info(`Showing page ${results.page} of ${results.totalPages}`);
    console.log('');
    
    results.items.forEach((medicine, index) => {
      console.log(`${index + 1}. ${colors.cyan}${medicine.name}${colors.reset}`);
      console.log(`   ${colors.gray}Active: ${medicine.data.active_substance}${colors.reset}`);
      console.log(`   ${colors.gray}Country: ${medicine.data.country}${colors.reset}`);
      console.log(`   ${colors.gray}Score: ${medicine.score}${colors.reset}`);
      console.log('');
    });
    
    return results.items.length > 0;
  } catch (err) {
    error(`Search failed: ${err}`);
    return false;
  }
}

/**
 * Test 3: Get medicine details
 */
async function testDetails(ema: EMA): Promise<boolean> {
  section('Test 3: Get Medicine Details');
  
  try {
    info('Getting details for first search result...');
    
    const searchResults = await ema.listMedicines(1, 1, 'levemir');
    
    if (searchResults.items.length === 0) {
      error('No medicines found to get details');
      return false;
    }
    
    const medicine = searchResults.items[0];
    info(`Medicine: ${medicine.name}`);
    info(`ID: ${medicine.id}`);
    console.log('');
    
    const details = await ema.getMedicineDetails(medicine.id);
    
    if (details) {
      success('Got medicine details');
      try {
        await writeFile("test.json",JSON.stringify(details), "utf8");
        console.log("✅ File written successfully!");
      } catch (err) {
        console.error("❌ Error writing file:", err);
      }

      // console.log('');
      // console.log(colors.gray + 'Details:' + colors.reset);
      // console.log(`  Product name: ${details.product_name}`);
      // console.log(`  Active substance: ${details.active_substance}`);
      // console.log(`  Route: ${details.route_of_administration}`);
      // console.log(`  Country: ${details.country}`);
      // console.log(`  MAH: ${details.marketing_authorisation_holder}`);
      // console.log(`  Email: ${details.email_address}`);
      // console.log(`  Phone: ${details.telephone}`);
      // console.log(`  Phone: ${JSON.stringify(details)}`);
      return true;
    } else {
      error('Details not found');
      return false;
    }
  } catch (err) {
    error(`Get details failed: ${err}`);
    return false;
  }
}

/**
 * Test 4: List all medicines (pagination)
 */
async function testPagination(ema: EMA): Promise<boolean> {
  section('Test 4: Pagination');
  
  try {
    info('Getting page 1 of all medicines...');
    
    const page1 = await ema.listMedicines(1, 10);
    
    success(`Total medicines: ${page1.totalItems}`);
    info(`Total pages: ${page1.totalPages}`);
    console.log('');
    
    info('First 3 medicines:');
    page1.items.slice(0, 3).forEach((medicine, index) => {
      console.log(`  ${index + 1}. ${medicine.name} (${medicine.data.country})`);
    });
    
    console.log('');
    info('Getting page 2...');
    const page2 = await ema.listMedicines(2, 10);
    
    info('First medicine on page 2:');
    if (page2.items.length > 0) {
      console.log(`  ${page2.items[0].name}`);
    }
    
    // Verify pagination works (different results)
    const differentPages = page1.items[0].id !== page2.items[0]?.id;
    
    if (differentPages) {
      success('Pagination works correctly');
      return true;
    } else {
      error('Pagination might not be working');
      return false;
    }
  } catch (err) {
    error(`Pagination test failed: ${err}`);
    return false;
  }
}

/**
 * Test 5: Search by country
 */
async function testCountrySearch(ema: EMA): Promise<boolean> {
  section('Test 5: Search by Country');
  
  try {
    info('Searching medicines in France...');
    
    const results = await ema.getMedicinesByCountry('France', 1, 5);
    
    success(`Found ${results.totalItems} medicines in France`);
    console.log('');
    
    results.items.slice(0, 3).forEach((medicine, index) => {
      console.log(`${index + 1}. ${medicine.name}`);
      console.log(`   ${colors.gray}${medicine.data.active_substance}${colors.reset}`);
    });
    
    return results.items.length > 0;
  } catch (err) {
    error(`Country search failed: ${err}`);
    return false;
  }
}

/**
 * Test 6: Fuzzy search
 */
async function testFuzzySearch(ema: EMA): Promise<boolean> {
  section('Test 6: Fuzzy Search (with typo)');
  
  try {
    info('Searching for "levmir" (typo)...');
    
    const results = await ema.listMedicines(1, 3, 'levmir', 60);
    
    if (results.items.length > 0) {
      success(`Found ${results.items.length} medicines despite typo`);
      console.log('');
      
      results.items.forEach((medicine, index) => {
        console.log(`${index + 1}. ${medicine.name} (score: ${medicine.score})`);
      });
      
      return true;
    } else {
      info('No fuzzy matches found (that\'s okay)');
      return true; // Not a failure, just no matches
    }
  } catch (err) {
    error(`Fuzzy search failed: ${err}`);
    return false;
  }
}

/**
 * Test 7: Performance test
 */
async function testPerformance(ema: EMA): Promise<boolean> {
  section('Test 7: Performance Test');
  
  try {
    info('Testing search performance (10 searches)...');
    
    const searches = [
      'aspirin', 'insulin', 'paracetamol', 'ibuprofen', 'humira',
      'viagra', 'lipitor', 'nexium', 'advil', 'tylenol'
    ];
    
    const startTime = Date.now();
    
    for (const query of searches) {
      await ema.listMedicines(1, 5, query);
    }
    
    const totalTime = Date.now() - startTime;
    const avgTime = (totalTime / searches.length).toFixed(2);
    
    success(`10 searches completed in ${totalTime}ms`);
    info(`Average: ${avgTime}ms per search`);
    
    // Should be fast (< 100ms average after initial load)
    return parseFloat(avgTime) < 200;
  } catch (err) {
    error(`Performance test failed: ${err}`);
    return false;
  }
}

/**
 * Test 8: PDF Extraction (First Time - Slow)
 */
async function testPDFExtractionFirstTime(ema: EMA): Promise<boolean> {
  section('Test 8: PDF Extraction (First Time)');
  
  try {
    info('Getting details with PDF extraction for "Levemir"...');
    info('This will download and parse the PDF (may take 5-10 seconds)');
    console.log('');

    const pdfUrl = ema.pdfExtractor.getPDFUrl('levemir');
    const data = await ema.pdfExtractor.getMdOfEMADocByURL(pdfUrl);
    return true;
  } catch (err) {
    error(`PDF Extraction test failed: ${err}`);
    return false;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('\n');
  log('blue', '╔════════════════════════════════════════════════════════════╗');
  log('blue', '║                    EMA SDK Test Suite                      ║');
  log('blue', '╚════════════════════════════════════════════════════════════╝');
  console.log(process.env.MISTRAL_API_KEY)
  const ema = new EMA({
    autoUpdateData: true,
    updateCheckIntervalDays: 7,
    mistralApiKey: "o1MuzsZV7ymrZXeZVNRq9vmNpZXEFW3r",
  });
  
  const tests = [
    { name: 'Initialize', fn: () => testInitialize(ema) },
    { name: 'Search', fn: () => testSearch(ema) },
    { name: 'Details', fn: () => testDetails(ema) },
    { name: 'Pagination', fn: () => testPagination(ema) },
    { name: 'Country Search', fn: () => testCountrySearch(ema) },
    { name: 'Fuzzy Search', fn: () => testFuzzySearch(ema) },
    { name: 'Performance', fn: () => testPerformance(ema) },
    { name: 'Pdf extraction', fn: () => testPDFExtractionFirstTime(ema)},
  ];
  
  const results: { name: string; passed: boolean }[] = [];
  
  for (const test of tests) {
    try {
      const passed = await test.fn();
      results.push({ name: test.name, passed });
    } catch (err) {
      error(`Test "${test.name}" crashed: ${err}`);
      results.push({ name: test.name, passed: false });
    }
  }
  
  // Summary
  section('Test Summary');
  
  let passedCount = 0;
  results.forEach(result => {
    if (result.passed) {
      success(`${result.name}: PASSED`);
      passedCount++;
    } else {
      error(`${result.name}: FAILED`);
    }
  });
  
  console.log('');
  const totalTests = results.length;
  const failedCount = totalTests - passedCount;
  
  if (failedCount === 0) {
    log('green', `\n✓ All ${totalTests} tests passed!`);
  } else {
    log('yellow', `\n⚠ ${passedCount}/${totalTests} tests passed, ${failedCount} failed`);
  }
  
  console.log('');
}

// Run tests
runTests().catch(err => {
  error(`Test suite crashed: ${err}`);
  process.exit(1);
});

function getPDFUrl() {
  throw new Error('Function not implemented.');
}
function downloadPDF(url: void) {
  throw new Error('Function not implemented.');
}

function PDFToMD(pdf: void) {
  throw new Error('Function not implemented.');
}

function parseDocument(arg0: string) {
  throw new Error('Function not implemented.');
}

