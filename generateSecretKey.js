const fs = require('fs');
const crypto = require('crypto');
const path = require('path');

// Generate a secure random secret key (256-bit / 32 bytes)
const secretKey = crypto.randomBytes(32).toString('hex');

// Define the path to the .env file
const envFilePath = path.resolve(__dirname, '.env');

// Read the current content of the .env file
let envContent = '';
try {
    envContent = fs.readFileSync(envFilePath, 'utf-8');
} catch (err) {
    if (err.code !== 'ENOENT') {
        console.error('Error reading .env file:', err);
        process.exit(1);
    }
    // If the file does not exist, proceed with an empty string
}

// Check if JWT_SECRET_KEY is already in the .env file
const regex = /^JWT_SECRET_KEY=.*/gm;

if (regex.test(envContent)) {
    // If JWT_SECRET_KEY exists, replace its value
    envContent = envContent.replace(regex, `JWT_SECRET_KEY=${secretKey}`);
} else {
    // If it doesn't exist, append it at the end
    envContent += `JWT_SECRET_KEY=${secretKey}\n`;
}

// Write the updated content back to the .env file
fs.writeFileSync(envFilePath, envContent);