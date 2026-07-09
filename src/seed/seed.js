import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const runScript = (scriptName) => {
  const scriptPath = path.resolve(__dirname, scriptName);
  console.log(`\n=========================================`);
  console.log(`Running seed script: ${scriptName}`);
  console.log(`=========================================`);
  try {
    execSync(`node "${scriptPath}"`, { stdio: 'inherit' });
  } catch (error) {
    console.error(`Error running ${scriptName}:`, error.message);
    throw error;
  }
};

async function main() {
  try {
    runScript('seedRole.js');
    runScript('seedPermissions.js');
    runScript('seedRolePermission.js');
    runScript('seedAdmin.js');
    runScript('seedEmployes.js');
    runScript('seedAttendance.js');
    console.log('\n=========================================');
    console.log('Database seeded successfully!');
    console.log('=========================================');
  } catch (error) {
    console.error('\n=========================================');
    console.error('Error seeding database:', error.message);
    console.error('=========================================');
    process.exit(1);
  }
}

main();
