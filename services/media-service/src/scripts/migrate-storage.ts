import { getDatabase } from '../config/database';
import { getStorageService } from '../config/storage';
import fs from 'fs';
import path from 'path';

/**
 * Migrate media files from local storage to cloud storage (S3/R2)
 * 
 * Usage:
 * 1. Set your target storage provider in .env (STORAGE_PROVIDER=s3 or STORAGE_PROVIDER=r2)
 * 2. Configure credentials for the target provider
 * 3. Run: npm run migrate-storage
 */

async function migrateStorage() {
  console.log('Starting storage migration...');
  
  const db = getDatabase();
  const storageService = getStorageService();
  const provider = storageService.getProvider();

  if (provider === 'local') {
    console.error('Error: Target storage provider is set to "local". Please configure S3 or R2 in .env');
    process.exit(1);
  }

  console.log(`Target storage provider: ${provider}`);
  console.log('Fetching media files from database...');

  // Get all media files
  const result = await db.query('SELECT * FROM media_files ORDER BY created_at ASC');
  const files = result.rows;

  console.log(`Found ${files.length} files to migrate`);

  let successCount = 0;
  let errorCount = 0;
  const errors: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    console.log(`\n[${i + 1}/${files.length}] Processing: ${file.original_filename}`);

    try {
      // Skip if already has a storage key (already migrated)
      if (file.storage_key) {
        console.log('  ⏩ Already migrated, skipping...');
        successCount++;
        continue;
      }

      // Check if local file exists
      if (!fs.existsSync(file.file_path)) {
        console.log('  ⚠️  Local file not found, skipping...');
        errorCount++;
        errors.push({ file: file.original_filename, error: 'Local file not found' });
        continue;
      }

      // Generate storage key
      const fileExtension = path.extname(file.original_filename);
      const storageKey = `${file.filename || file.id}${fileExtension}`;

      console.log(`  📤 Uploading to ${provider}...`);

      // Upload to cloud storage
      const uploadResult = await storageService.uploadFile(
        file.file_path,
        storageKey,
        file.mime_type,
        {
          originalName: file.original_filename,
          uploadedBy: file.uploaded_by,
          fileType: file.file_type
        }
      );

      console.log('  ✅ Uploaded successfully');

      // Update database with new URLs and storage key
      await db.query(`
        UPDATE media_files 
        SET storage_key = $1, file_url = $2, updated_at = CURRENT_TIMESTAMP
        WHERE id = $3
      `, [uploadResult.key, uploadResult.url, file.id]);

      console.log('  💾 Database updated');

      // Migrate thumbnails if they exist
      const thumbnailsResult = await db.query(
        'SELECT * FROM media_thumbnails WHERE media_file_id = $1',
        [file.id]
      );

      if (thumbnailsResult.rows.length > 0) {
        console.log(`  🖼️  Migrating ${thumbnailsResult.rows.length} thumbnails...`);

        for (const thumbnail of thumbnailsResult.rows) {
          try {
            if (!fs.existsSync(thumbnail.thumbnail_path)) {
              console.log(`    ⚠️  Thumbnail not found: ${thumbnail.size}`);
              continue;
            }

            const thumbKey = `thumbnails/${file.id}_${thumbnail.size}${fileExtension}`;
            const thumbUpload = await storageService.uploadFile(
              thumbnail.thumbnail_path,
              thumbKey,
              'image/jpeg'
            );

            await db.query(`
              UPDATE media_thumbnails 
              SET storage_key = $1, thumbnail_url = $2
              WHERE id = $3
            `, [thumbUpload.key, thumbUpload.url, thumbnail.id]);

            console.log(`    ✅ Thumbnail uploaded: ${thumbnail.size}`);
          } catch (thumbError) {
            console.log(`    ❌ Thumbnail failed: ${thumbnail.size}`);
          }
        }
      }

      successCount++;

    } catch (error: any) {
      console.log(`  ❌ Error: ${error.message}`);
      errorCount++;
      errors.push({ file: file.original_filename, error: error.message });
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60));
  console.log('Migration Summary');
  console.log('='.repeat(60));
  console.log(`Total files: ${files.length}`);
  console.log(`Successfully migrated: ${successCount}`);
  console.log(`Errors: ${errorCount}`);

  if (errors.length > 0) {
    console.log('\nErrors:');
    errors.forEach(({ file, error }) => {
      console.log(`  - ${file}: ${error}`);
    });
  }

  console.log('\n✨ Migration complete!');
}

// Run migration
migrateStorage()
  .then(() => {
    console.log('Exiting...');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Migration failed:', error);
    process.exit(1);
  });
