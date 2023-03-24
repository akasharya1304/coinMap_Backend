require('dotenv').config();
const express = require('express');
const { google } = require('googleapis');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const spreadsheetId = process.env.SPREADSHEET_ID;

// --- helper functions ---
// get auth token
function getAuth() {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'coinmap-381415-9771da8c0217.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  return auth;
}

// proccure googleSheet method
async function getGoogleSheet(auth) {
  const client = await auth.getClient();
  const googleSheet = google.sheets({ version: 'v4', auth: client });
  return googleSheet;
}
// --- helper functions ---

//fetches data from the spreadsheet
app.get('/datafetch', async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  // const getMetaData = await googleSheet.spreadsheets.get({
  //   auth,
  //   spreadsheetId,
  // });

  const getSheetData = await googleSheet.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'Sheet1!A:Z',
  });
  console.log("data Fetched")
  res.send(getSheetData.data.values);
});

//posts data to cell
app.post('/post', async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  await googleSheet.spreadsheets.values.append({
    auth,
    spreadsheetId,
    range: 'Sheet1!A2:B',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [['NextJS', 'The framework of the future']],
    },
  });

  res.send('Submitted Successfully');
});

// deletes cell data
app.post('/delete', async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  await googleSheet.spreadsheets.values.clear({
    auth,
    spreadsheetId,
    range: 'Sheet1!A5:B5',
  });

  res.send('Deleted Successfully');
});

// update cell data
app.put('/update', async (req, res) => {
  const auth = getAuth();
  const googleSheet = await getGoogleSheet(auth);

  await googleSheet.spreadsheets.values.update({
    auth,
    spreadsheetId,
    range: 'Sheet1!A2:B2',
    valueInputOption: 'USER_ENTERED',
    resource: {
      values: [['Elon', 'Make a spaceship']],
    },
  });

  res.send('Updated Successfully');
});

app.listen(3003 || process.env.PORT, () => {
  console.log('Up and running!!');
});