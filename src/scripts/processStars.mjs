// Process HYG star data into optimized formats for web usage
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { parse } from 'csv-parse/sync';

// Handle ES module paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Define interfaces for our application
/**
 * @typedef {Object} Star
 * @property {string} id
 * @property {number} [hipId]
 * @property {string} proper
 * @property {number} ra
 * @property {number} dec
 * @property {number} mag
 * @property {number} absMag
 * @property {number} dist
 * @property {number} colorIndex
 * @property {string} spectrum
 * @property {number} x
 * @property {number} y
 * @property {number} z
 * @property {string} constellation
 * @property {string} [bayer]
 * @property {number} displayX
 * @property {number} displayY
 * @property {string} color
 * @property {boolean} isNavigable
 * @property {'project'|'cosmic'} type
 */

/**
 * @typedef {Object} Constellation
 * @property {string} id
 * @property {string} abbr
 * @property {string} name
 * @property {string} description
 * @property {string[]} stars
 * @property {string[]} mainStars
 * @property {[string, string][]} connections
 */

// Configure which constellations to include (can expand later)
const CONSTELLATIONS_TO_INCLUDE = [
  'And', 'Aql', 'Aur', 'Boo', 'CMa', 'CMi', 'Cas', 'CrB', 'Cyg',
  'Del', 'Gem', 'Her', 'Hya', 'Leo', 'Lyr', 'Ori', 'Peg', 'Per',
  'Psc', 'Sgr', 'Sco', 'Tau', 'UMa', 'UMi', 'Vir'
];

// Map of constellation abbreviations to full names
const CONSTELLATION_NAMES = {
  'And': 'Andromeda',
  'Aql': 'Aquila',
  'Aur': 'Auriga',
  'Boo': 'Boötes',
  'CMa': 'Canis Major',
  'CMi': 'Canis Minor',
  'Cas': 'Cassiopeia',
  'CrB': 'Corona Borealis',
  'Cyg': 'Cygnus',
  'Del': 'Delphinus',
  'Gem': 'Gemini',
  'Her': 'Hercules',
  'Hya': 'Hydra',
  'Leo': 'Leo',
  'Lyr': 'Lyra',
  'Ori': 'Orion',
  'Peg': 'Pegasus',
  'Per': 'Perseus',
  'Psc': 'Pisces',
  'Sgr': 'Sagittarius',
  'Sco': 'Scorpius',
  'Tau': 'Taurus',
  'UMa': 'Ursa Major',
  'UMi': 'Ursa Minor',
  'Vir': 'Virgo'
};

// Define notable stars in each constellation (for navigation)
const NOTABLE_STARS = {
  'And': ['21 And', 'Alpha And', 'Beta And', 'Gamma And'], // Alpheratz, Mirach, Alamak
  'Aql': ['Alpha Aql', 'Beta Aql', 'Gamma Aql'], // Altair, Alshain, Tarazed
  'Aur': ['Alpha Aur', 'Beta Aur', 'Epsilon Aur'], // Capella, Menkalinan
  'Boo': ['Alpha Boo', 'Epsilon Boo', 'Eta Boo', 'Gamma Boo'], // Arcturus, Izar
  'CMa': ['Alpha CMa', 'Beta CMa', 'Delta CMa'], // Sirius, Mirzam
  'CMi': ['Alpha CMi', 'Beta CMi'], // Procyon
  'Cas': ['Alpha Cas', 'Beta Cas', 'Gamma Cas', 'Delta Cas'], // Schedar, Caph
  'CrB': ['Alpha CrB', 'Beta CrB', 'Gamma CrB'], // Alphecca
  'Cyg': ['Alpha Cyg', 'Beta Cyg', 'Gamma Cyg', 'Delta Cyg', 'Epsilon Cyg'], // Deneb, Albireo
  'Del': ['Alpha Del', 'Beta Del', 'Gamma Del'], // Sualocin, Rotanev
  'Gem': ['Alpha Gem', 'Beta Gem', 'Gamma Gem'], // Castor, Pollux
  'Her': ['Alpha Her', 'Beta Her', 'Delta Her', 'Epsilon Her'], 
  'Hya': ['Alpha Hya', 'Gamma Hya', 'Zeta Hya'],
  'Leo': ['Alpha Leo', 'Beta Leo', 'Gamma Leo', 'Delta Leo', 'Epsilon Leo'], // Regulus, Denebola
  'Lyr': ['Alpha Lyr', 'Beta Lyr', 'Gamma Lyr'], // Vega
  'Ori': ['Alpha Ori', 'Beta Ori', 'Gamma Ori', 'Delta Ori', 'Epsilon Ori', 'Zeta Ori'], // Betelgeuse, Rigel, Bellatrix
  'Peg': ['Alpha Peg', 'Beta Peg', 'Gamma Peg', 'Epsilon Peg'], // Markab, Scheat, Algenib
  'Per': ['Alpha Per', 'Beta Per', 'Gamma Per', 'Delta Per'], // Mirfak, Algol
  'Psc': ['Alpha Psc', 'Eta Psc', 'Gamma Psc', 'Omega Psc'], 
  'Sgr': ['Alpha Sgr', 'Beta Sgr', 'Gamma Sgr', 'Delta Sgr', 'Epsilon Sgr'], // Kaus Australis
  'Sco': ['Alpha Sco', 'Beta Sco', 'Delta Sco', 'Lambda Sco'], // Antares, Shaula
  'Tau': ['Alpha Tau', 'Beta Tau', 'Gamma Tau', 'Delta Tau'], // Aldebaran
  'UMa': ['Alpha UMa', 'Beta UMa', 'Gamma UMa', 'Delta UMa', 'Epsilon UMa', 'Zeta UMa', 'Eta UMa'], // Big Dipper
  'UMi': ['Alpha UMi', 'Beta UMi', 'Gamma UMi'], // Polaris, Kochab
  'Vir': ['Alpha Vir', 'Gamma Vir', 'Delta Vir', 'Epsilon Vir'] // Spica
};

// Define connections between stars for constellation lines
const CONSTELLATION_CONNECTIONS = {
  'UMa': [
    ['Alpha UMa', 'Beta UMa'], ['Beta UMa', 'Gamma UMa'], ['Gamma UMa', 'Delta UMa'], 
    ['Delta UMa', 'Epsilon UMa'], ['Epsilon UMa', 'Zeta UMa'], ['Zeta UMa', 'Eta UMa']
  ],
  'Ori': [
    ['Alpha Ori', 'Gamma Ori'], ['Gamma Ori', 'Beta Ori'], ['Beta Ori', 'Kappa Ori'],
    ['Alpha Ori', 'Lambda Ori'], ['Delta Ori', 'Epsilon Ori'], ['Epsilon Ori', 'Zeta Ori']
  ],
  // More connections for other constellations
  // These would be populated with the proper connections
  'Cyg': [
    ['Alpha Cyg', 'Gamma Cyg'], ['Gamma Cyg', 'Delta Cyg'], ['Gamma Cyg', 'Epsilon Cyg'], 
    ['Gamma Cyg', 'Beta Cyg']
  ]
};

/**
 * Convert spectral type to RGB color
 * @param {string} specType 
 * @returns {string} Hex color value
 */
function spectralTypeToColor(specType) {
  // Default to white if we can't determine
  if (!specType || specType.length < 1) return '#FFFFFF';
  
  // Extract the main spectral class (O, B, A, F, G, K, M)
  const mainClass = specType.charAt(0).toUpperCase();
  
  switch (mainClass) {
    case 'O': return '#9BB0FF'; // Blue
    case 'B': return '#AAC0FF'; // Blue-white
    case 'A': return '#CAD7FF'; // White
    case 'F': return '#F8F7FF'; // Yellow-white
    case 'G': return '#FFF4EA'; // Yellow
    case 'K': return '#FFD2A1'; // Orange
    case 'M': return '#FFCC6F'; // Red
    default: return '#FFFFFF';  // White for unknown
  }
}

/**
 * Map star coordinates to screen coordinates
 * @param {number} ra - Right ascension in radians
 * @param {number} dec - Declination in radians
 * @param {number} width - Width of output canvas
 * @param {number} height - Height of output canvas
 * @returns {Object} x and y coordinates
 */
function mapCoordinatesToScreen(ra, dec, width = 10000, height = 10000) {
  // Simple equirectangular projection
  // We're mapping celestial coordinates to a 2D plane
  // This is a simple projection that works OK near the equator
  
  // Normalize RA to [0, 2π]
  const normalizedRA = ra % (2 * Math.PI);
  
  // Map RA to x-coordinate (reversed because RA increases eastward)
  const x = width * (1 - normalizedRA / (2 * Math.PI));
  
  // Map declination to y-coordinate
  // Dec ranges from -π/2 to π/2
  const y = height * (0.5 - dec / Math.PI);
  
  return { x, y };
}

/**
 * Main function to process the HYG database
 */
async function processHygData() {
  const rootDir = path.resolve(__dirname, '..');
  const filePath = path.join(rootDir, 'data', 'hygdata_v41.csv');
  
  console.log(`Processing file: ${filePath}`);
  const csvData = fs.readFileSync(filePath, 'utf8');
  
  // Parse CSV
  console.log("Parsing CSV data...");
  const records = parse(csvData, {
    columns: true,
    skip_empty_lines: true
  });
  
  console.log(`Found ${records.length} stars in the CSV file`);
  
  // Create maps to store processed data
  const stars = {};
  const constellations = {};
  
  // Initialize constellations
  CONSTELLATIONS_TO_INCLUDE.forEach(abbr => {
    constellations[abbr] = {
      id: abbr.toLowerCase(),
      abbr,
      name: CONSTELLATION_NAMES[abbr] || abbr,
      description: `The ${CONSTELLATION_NAMES[abbr] || abbr} constellation`,
      stars: [],
      mainStars: [],
      connections: []
    };
  });
  
  // Process each star
  console.log("Processing stars...");
  records.forEach((record) => {
    // Filter out stars without constellation or too dim
    if (!record.con || !CONSTELLATIONS_TO_INCLUDE.includes(record.con) || parseFloat(record.mag) > 6.5) {
      return;
    }
    
    // Generate a unique ID for the star
    const starId = record.proper 
      ? record.proper.replace(/\s+/g, '-').toLowerCase() 
      : `${record.con.toLowerCase()}-${record.id}`;
    
    // Convert RA and Dec to radians if they aren't already
    const raRad = parseFloat(record.rarad) || 0;
    const decRad = parseFloat(record.decrad) || 0;
    
    // Map to screen coordinates
    const { x, y } = mapCoordinatesToScreen(raRad, decRad);
    
    // Generate combined Bayer/Flamsteed designation
    let designation = '';
    if (record.bayer) designation += record.bayer + ' ';
    if (record.flam) designation += record.flam + ' ';
    designation = designation ? designation + record.con : '';
    
    // Determine if this is a notable star for navigation
    const isNotable = designation && 
      constellations[record.con] &&
      NOTABLE_STARS[record.con] && 
      NOTABLE_STARS[record.con].includes(designation);
    
    // Create star object
    const star = {
      id: starId,
      hipId: record.hip ? parseInt(record.hip) : undefined,
      proper: record.proper || designation || `Star ${record.id}`,
      ra: parseFloat(record.ra) || 0,
      dec: parseFloat(record.dec) || 0,
      mag: parseFloat(record.mag) || 0,
      absMag: parseFloat(record.absmag) || 0,
      dist: parseFloat(record.dist) || 0,
      colorIndex: parseFloat(record.ci) || 0,
      spectrum: record.spect || '',
      x: parseFloat(record.x) || 0,
      y: parseFloat(record.y) || 0,
      z: parseFloat(record.z) || 0,
      constellation: record.con || '',
      bayer: designation || undefined,
      displayX: x,
      displayY: y,
      color: spectralTypeToColor(record.spect),
      isNavigable: isNotable,
      type: 'cosmic' // Default type - projects will be assigned later
    };
    
    // Add to stars collection
    stars[starId] = star;
    
    // Add to constellation's star list
    if (record.con && constellations[record.con]) {
      constellations[record.con].stars.push(starId);
      
      // If it's a notable star, add to main stars list
      if (isNotable) {
        constellations[record.con].mainStars.push(starId);
      }
    }
  });
  
  // Process constellation connections
  console.log("Processing constellation connections...");
  Object.keys(CONSTELLATION_CONNECTIONS).forEach(con => {
    if (!constellations[con]) return;
    
    CONSTELLATION_CONNECTIONS[con].forEach(([starDes1, starDes2]) => {
      // Find stars with these designations
      const star1 = Object.values(stars).find(s => s.constellation === con && s.bayer === starDes1);
      const star2 = Object.values(stars).find(s => s.constellation === con && s.bayer === starDes2);
      
      if (star1 && star2) {
        constellations[con].connections.push([star1.id, star2.id]);
      }
    });
  });
  
  console.log("Saving processed data...");
  
  // Save processed data to files
  // 1. Save a limited set of navigable stars for interactive use
  const navigableStars = Object.values(stars).filter(s => s.isNavigable || s.mag < 3);
  fs.writeFileSync(
    path.join(rootDir, 'data', 'navigableStars.json'), 
    JSON.stringify(navigableStars, null, 2)
  );
  
  // 2. Save background stars (non-navigable, dimmer stars)
  const backgroundStars = Object.values(stars)
    .filter(s => !s.isNavigable && s.mag > 3 && s.mag <= 6.5)
    .map(s => ({
      x: s.displayX,
      y: s.displayY,
      mag: s.mag,
      color: s.color
    }));
  fs.writeFileSync(
    path.join(rootDir, 'data', 'backgroundStars.json'), 
    JSON.stringify(backgroundStars, null, 2)
  );
  
  // 3. Save constellation data
  fs.writeFileSync(
    path.join(rootDir, 'data', 'processedConstellations.json'), 
    JSON.stringify(constellations, null, 2)
  );
  
  console.log(`Processed ${navigableStars.length} navigable stars`);
  console.log(`Processed ${backgroundStars.length} background stars`);
  console.log(`Processed ${Object.keys(constellations).length} constellations`);
}

// Execute the processing
processHygData().catch(console.error); 