// test-maintenance.ts
import { testMaintenance } from './dailyBillingMaintenance.ts';

(async () => {
  try {
    await testMaintenance();
    process.exit(0);
  } catch (error) {
    console.error('Test failed:', error);
    process.exit(1);
  }
})();