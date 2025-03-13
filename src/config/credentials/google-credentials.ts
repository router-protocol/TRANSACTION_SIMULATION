import * as dotenv from 'dotenv';
dotenv.config();

export const googleCreds = {
  type: 'service_account',
  project_id: 'simulation-reporter',
  private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
  private_key: process.env.GOOGLE_PRIVATE_KEY,
  client_email:
    'simulation-reporter@simulation-reporter.iam.gserviceaccount.com',
  client_id: '114362959798931451558',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/simulation-reporter%40simulation-reporter.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com',
};
