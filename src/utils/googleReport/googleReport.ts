import { Logger } from '@nestjs/common';
import { google } from 'googleapis';
const fs = require('fs');
const path = require('path');
import * as dotenv from 'dotenv';
dotenv.config();

import { googleCreds } from '../../config/credentials/google-credentials';
import { mapReportDataToSheet } from './reportMapper';

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
const auth = new google.auth.GoogleAuth({
  credentials: googleCreds,
  scopes: SCOPES,
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = '1vyXpK-QQKjgRGS_9zadNKlKRB17DwhrQQEaXUp65y0U';
const SHEET_NAME = 'Sheet1';
const logger = new Logger('googleReports');

async function appendBatchToSheet(rows: any[][]) {
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:L`,
    valueInputOption: 'RAW',
    insertDataOption: 'INSERT_ROWS',
    requestBody: {
      values: rows,
    },
  });

  logger.log('Data added to Google Sheet successfully!');
}


async function clearSheetData() {
  try {
    await sheets.spreadsheets.values.clear({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_NAME}!A:Z`,
    });
    logger.log('Sheet data cleared successfully');
  } catch (error) {
    logger.error('Error clearing sheet data', error.stack);
    throw error;
  }
}

export async function processReport(filePath: string) {
  try {
    const rawData = fs.readFileSync(filePath, 'utf8');
    const jsonData = JSON.parse(rawData);

    const sheetRows = mapReportDataToSheet(jsonData);

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
        'Number of Swaps',
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
