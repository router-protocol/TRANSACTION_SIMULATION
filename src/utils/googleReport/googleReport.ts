import { Logger } from '@nestjs/common';
import { google } from 'googleapis';
const fs = require('fs');
const path = require('path');

// Load Google Sheets credentials
import { googleCreds } from 'src/config/credentials/google-credentials';
import { mapReportDataToSheet } from './reportMapper';

// Google Sheets setup
const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials: googleCreds,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1vyXpK-QQKjgRGS_9zadNKlKRB17DwhrQQEaXUp65y0U';
const SHEET_NAME = 'Sheet1'; // Change if your sheet has a different name

const logger = new Logger('googleReports');

async function appendBatchToSheet(rows: any[][]) {
  // const values = data.map((item) => [
  //   item.timestamp,
  //   item.status,
  //   item.details,
  // ]);

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });

  console.log('Data added to Google Sheet successfully!');
}

// Sample cron task function
// export async function cronTask(jsonFile) {
//   const output = [
//     {
//       timestamp: new Date().toISOString(),
//       status: 'Success',
//       details: 'Task completed in 10 mins',
//     },
//   ];

//   try {
//     await appendToSheet(output);
//   } catch (error) {
//     console.error('Error writing to Google Sheets:', error);
//   }
// }

async function clearSheetData() {
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`, // Clears all rows except header
    });
    logger.log('Sheet data cleared successfully');
  } catch (error) {
    logger.error('Error clearing sheet data', error.stack);
    throw error;
  }
}

export async function processReport(filePath: string) {
  try {
    // const fullPath = path.join(process.cwd(), filePath);
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    const sheetRows = mapReportDataToSheet(jsonData);

    // Add headers if needed
    const headers = [
      [
        'Timestamp',
        'Source Chain',
        'Dest Chain',
        'Source Token',
        'Dest Token',
        'Amount',
        'Status',
        'Quote Time (ms)',
        'Txn Time (ms)',
        'Error Reason',
        'Error Code',
        'Full Error',
      ],
    ];

    await clearSheetData();

    await appendBatchToSheet([...headers, ...sheetRows]);
    return { success: true, rowsProcessed: sheetRows.length };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      stack: error.stack,
    };
  }
}

// Trigger your cron logic
// export function cronTask();
