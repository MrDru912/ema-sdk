/**
 * Usage examples for EMA Medicine Mapper
 * Step 1: Article 57 basic functionality
 */

import { EMAMedicineMapper } from './ema-medicine-mapper';

// Initialize mapper
const emaMapper = new EMAMedicineMapper(
  'assets/ema-report.csv',
  true // auto-update enabled
);

/**
 * Example 1: Basic search
 */
async function basicSearch() {
  console.log('=== Example 1: Basic Search ===\n');
  
  const results = await emaMapper.getPaginatedMedicines(
    1,    // page
    10,   // pageSize
    'aspirin' // query
  );

  console.log(`Found ${results.totalItems} medicines matching "aspirin"`);
  console.log(`Page ${results.page} of ${results.totalPages}\n`);
  
  results.items.forEach((medicine, index) => {
    console.log(`${index + 1}. ${medicine.name}`);
    console.log(`   Active substance: ${medicine.data.active_substance}`);
    console.log(`   Country: ${medicine.data.country}`);
    console.log(`   MAH: ${medicine.data.marketing_authorisation_holder}`);
    console.log(`   Score: ${medicine.score}`);
    console.log('');
  });
}

/**
 * Example 2: Get medicine details
 */
async function getMedicineDetails() {
  console.log('=== Example 2: Get Medicine Details ===\n');
  
  // First search to get an ID
  const results = await emaMapper.getPaginatedMedicines(1, 1, 'humira');
  
  if (results.items.length > 0) {
    const medicine = results.items[0];
    console.log('Medicine ID:', medicine.id);
    
    // Get full details
    const details = await emaMapper.getMedicineDetails(medicine.id);
    
    if (details) {
      console.log('\nFull Details:');
      console.log(JSON.stringify(details, null, 2));
    }
  }
}

/**
 * Example 3: List all medicines (paginated)
 */
async function listAllMedicines() {
  console.log('=== Example 3: List All Medicines ===\n');
  
  const results = await emaMapper.getPaginatedMedicines(1, 20);
  
  console.log(`Total medicines in database: ${results.totalItems}`);
  console.log(`Showing page 1 of ${results.totalPages}\n`);
  
  results.items.forEach((medicine, index) => {
    console.log(`${index + 1}. ${medicine.name} (${medicine.data.country})`);
  });
}

/**
 * Example 4: Search by country
 */
async function searchByCountry() {
  console.log('=== Example 4: Search by Country ===\n');
  
  const results = await emaMapper.getMedicinesByCountry('France', 1, 10);
  
  console.log(`Found ${results.totalItems} medicines in France`);
  console.log(`Showing page 1 of ${results.totalPages}\n`);
  
  results.items.forEach((medicine, index) => {
    console.log(`${index + 1}. ${medicine.name}`);
    console.log(`   Active substance: ${medicine.data.active_substance}`);
  });
}

/**
 * Example 5: Force update
 */
async function forceUpdate() {
  console.log('=== Example 5: Force Update ===\n');
  
  console.log('Checking for updates...');
  const success = await emaMapper.forceUpdate();
  
  if (success) {
    console.log('✓ Data updated successfully!');
  } else {
    console.log('✗ Update failed');
  }
}

/**
 * Example 6: Search with fuzzy matching
 */
async function fuzzySearch() {
  console.log('=== Example 6: Fuzzy Search ===\n');
  
  // Search with typo
  const results = await emaMapper.getPaginatedMedicines(
    1, 
    5, 
    'aspirn', // typo
    60 // lower threshold for fuzzy matching
  );

  console.log(`Found ${results.totalItems} medicines with fuzzy match\n`);
  
  results.items.forEach((medicine, index) => {
    console.log(`${index + 1}. ${medicine.name} (score: ${medicine.score})`);
  });
}

/**
 * Run all examples
 */
async function runExamples() {
  try {
    await basicSearch();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await getMedicineDetails();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await listAllMedicines();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await searchByCountry();
    console.log('\n' + '='.repeat(60) + '\n');
    
    await fuzzySearch();
    console.log('\n' + '='.repeat(60) + '\n');
        
  } catch (error) {
    console.error('Error in examples:', error);
  }
}

// Uncomment to run
// runExamples();

export {
  basicSearch,
  getMedicineDetails,
  listAllMedicines,
  searchByCountry,
  forceUpdate,
  fuzzySearch,
};