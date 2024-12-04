import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { subscriptionPlans } from './db/schema';

const sqlite = new Database('sqlite.db'); // Connect to your SQLite database
const db = drizzle(sqlite); // Wrap with Drizzle ORM

async function main() {
    // Insert initial data
    await db.insert(subscriptionPlans).values([
        {id:'trialPlan',planName:'试用订阅', durationDays:3, price:0, features:JSON.stringify({}), createdAt:(new Date()).toISOString()},
        {id:'monthPlan',planName:'月付', durationDays:30, price:5, features:JSON.stringify({}), createdAt:(new Date()).toISOString()},
    ]);
    console.log('Seeding completed successfully.');
  }

// Execute the main function and handle errors
main()
.catch((error) => {
  console.error('Error during seeding:', error);
  process.exit(1);
})
.finally(() => {
  sqlite.close(); // Close the database connection when done
});