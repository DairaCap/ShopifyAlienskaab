import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const srcDir = path.join(process.cwd(), 'app/assets');
const webpDir = path.join(process.cwd(), 'app/assets/webp');

// Create webp directory if it doesn't exist
if (!fs.existsSync(webpDir)) {
  fs.mkdirSync(webpDir, { recursive: true });
}

// Function to convert and resize image
async function optimizeImage(inputPath, outputPath, options = {}) {
  try {
    let image = sharp(inputPath);
    
    // Get image metadata
    const metadata = await image.metadata();
    
    // Apply resizing if specified
    if (options.width || options.height) {
      image = image.resize(options.width, options.height, {
        fit: 'inside',
        withoutEnlargement: true
      });
    }
    
    // Convert to WebP with quality setting
    image = image.webp({ quality: options.quality || 80 });
    
    // Ensure output directory exists
    const outputDir = path.dirname(outputPath);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }
    
    // Write the file
    await image.toFile(outputPath);
    
    // Get output file size
    const stats = fs.statSync(outputPath);
    const sizeInKB = Math.round(stats.size / 1024);
    
    console.log(`✅ Optimized: ${path.basename(inputPath)} → ${path.basename(outputPath)} (${sizeInKB} KB)`);
    return true;
  } catch (error) {
    console.error(`❌ Error processing ${inputPath}:`, error.message);
    return false;
  }
}

// Function to get all PNG files recursively
function getAllPngFiles(dir) {
  const files = [];
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const itemPath = path.join(dir, item);
    const stat = fs.statSync(itemPath);
    
    if (stat.isDirectory()) {
      // Recursively get files from subdirectory
      files.push(...getAllPngFiles(itemPath));
    } else if (item.toLowerCase().endsWith('.png')) {
      // Add PNG file
      files.push(itemPath);
    }
  }
  
  return files;
}

// Main function to process all PNG files
async function optimizeAllImages() {
  console.log('🚀 Starting image optimization...\n');
  
  // Get all PNG files recursively
  const allPngFiles = getAllPngFiles(srcDir);
  
  console.log(`Found ${allPngFiles.length} PNG files to process\n`);
  
  let processed = 0;
  let failed = 0;
  
  for (const filePath of allPngFiles) {
    // Determine optimization settings based on file path/name
    let options = {};
    
    // Hero images (root assets folder, not in subfolders)
    if (filePath.includes('/app/assets/') && 
        !filePath.includes('/app/assets/mobilVersion/') && 
        !filePath.includes('/app/assets/productos/') && 
        !filePath.includes('/app/assets/awards/') && 
        !filePath.includes('/app/assets/galeria/') && 
        !filePath.includes('/app/assets/fondos/') &&
        filePath.split('/app/assets/')[1].split('/').length === 1) { // Only direct children of assets/
      options = { width: 1920, quality: 85 }; // Full HD width
    }
    // Mobile hero images
    else if (filePath.includes('/app/assets/mobilVersion/')) {
      options = { width: 768, quality: 80 }; // Mobile width
    }
    // Product images
    else if (filePath.includes('/app/assets/productos/')) {
      options = { width: 600, quality: 80 }; // Product image width
    }
    // Gallery and awards images
    else if (filePath.includes('/app/assets/galeria/') || filePath.includes('/app/assets/awards/')) {
      options = { width: 400, quality: 75 }; // Thumbnail size
    }
    // Fondos images
    else if (filePath.includes('/app/assets/fondos/')) {
      options = { width: 800, quality: 80 }; // Background images
    }
    // Default for any other PNGs
    else {
      options = { width: 800, quality: 75 }; // Reasonable default
    }
    
    // Create output path with .webp extension, preserving directory structure
    const relativePath = path.relative(srcDir, filePath);
    const outputPath = path.join(webpDir, relativePath.replace(/\.png$/, '.webp'));
    
    const success = await optimizeImage(filePath, outputPath, options);
    if (success) processed++;
    else failed++;
  }
  
  console.log(`\n🎉 Optimization complete!`);
  console.log(`   Processed: ${processed} images`);
  console.log(`   Failed: ${failed} images`);
  console.log(`   WebP images saved to: ${webpDir}`);
  
  // Create a mapping file for easy reference
  const mapping = {
    hero: {},
    products: {},
    gallery: {},
    awards: {},
    mobilVersion: {},
    fondos: {}
  };
  
  // Scan optimized files and create mapping
  function scanWebpFiles(dir) {
    const items = [];
    const dirItems = fs.readdirSync(dir);
    
    for (const item of dirItems) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory()) {
        items.push(...scanWebpFiles(itemPath));
      } else if (item.toLowerCase().endsWith('.webp')) {
        items.push(itemPath);
      }
    }
    
    return items;
  }
  
  const webpFiles = scanWebpFiles(webpDir);
  for (const filePath of webpFiles) {
    const relativePath = path.relative(webpDir, filePath);
    
    if (relativePath.includes('mobilVersion/')) {
      const key = path.basename(filePath, '.webp');
      mapping.mobilVersion[key] = `app/assets/webp/${relativePath}`;
    } else if (relativePath.includes('productos/')) {
      const key = path.basename(filePath, '.webp');
      mapping.products[key] = `app/assets/webp/${relativePath}`;
    } else if (relativePath.includes('galeria/') || relativePath.includes('awards/')) {
      const key = path.basename(filePath, '.webp');
      if (relativePath.includes('galeria/')) {
        mapping.gallery[key] = `app/assets/webp/${relativePath}`;
      } else {
        mapping.awards[key] = `app/assets/webp/${relativePath}`;
      }
    } else if (relativePath.includes('fondos/')) {
      const key = path.basename(filePath, '.webp');
      mapping.fondos[key] = `app/assets/webp/${relativePath}`;
    } else {
      const key = path.basename(filePath, '.webp');
      mapping.hero[key] = `app/assets/webp/${relativePath}`;
    }
  }
  
  // Write mapping to file
  fs.writeFileSync(
    path.join(process.cwd(), 'app/assets/image-mapping.json'),
    JSON.stringify(mapping, null, 2)
  );
  
  console.log(`📋 Image mapping saved to: app/assets/image-mapping.json`);
}

// Run the optimization
optimizeAllImages().catch(console.error);
