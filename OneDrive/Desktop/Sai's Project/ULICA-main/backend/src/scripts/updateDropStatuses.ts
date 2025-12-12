import { DropStatusService } from '../services/dropStatusService';

/**
 * Script to update drop statuses
 * This should be run periodically (e.g., every minute via cron job)
 */
async function updateDropStatuses() {
  console.log('Starting drop status update...');
  
  try {
    await DropStatusService.updateDropStatuses();
    console.log('Drop status update completed successfully');
  } catch (error) {
    console.error('Drop status update failed:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  updateDropStatuses();
}

export { updateDropStatuses };
