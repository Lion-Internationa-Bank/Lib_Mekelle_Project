export const cronConfig = {
  // Run every day at 2 AM
  billStatusUpdate: '0 2 * * *',
  // Run every day at 3 AM
  penaltyCalculation: '0 3 * * *',
  // Run every day at 4 AM
  interestCalculation: '0 4 * * *',
  // Run every day at 5 AM
  leaseStatusUpdate: '0 5 * * *',
  
  // For testing - run every minute
//   billStatusUpdate: '* * * * *',
//   penaltyCalculation: '* * * * *',
//   interestCalculation: '* * * * *',
//   leaseStatusUpdate: '* * * * *',
};

export const cronOptions = {
  timezone: 'Africa/Addis_Ababa',
  runOnInit: true, // Don't run on server start
};