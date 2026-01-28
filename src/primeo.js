const axios = require('axios');
const fs = require('fs');
const path = require('path');

const BASE_URL = "https://tarife.primeo-energie.ch/api/v1/tariffs";
const OUT_DIR = path.join(__dirname, "..", "data");

function formatIsoWithOffset(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const time = "00:00:00+01:00";
  return `${year}-${month}-${day}T${time}`;
}

async function readPrimeo() {
  try {
    // "Today" in local time
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const startIso = formatIsoWithOffset(tomorrow);
    const endIso = formatIsoWithOffset(new Date(tomorrow.getTime() + 24 * 60 * 60 * 1000));

    const params = new URLSearchParams({
      start_timestamp: startIso,
      end_timestamp: endIso,
    });

    const API_URL = `${BASE_URL}?${params.toString()}`;
    console.log(`Requesting: ${API_URL}`);

    const res = await axios.get(API_URL);
    const data = res.data;

    const rawName = String(data.publication_timestamp);
    // sanitize filename: keep alnum, dash, underscore
    const safeName = rawName.replace(/[^a-zA-Z0-9-_]/g, "_");
    const fileName = `${safeName}.json`;

    if (!fs.existsSync(OUT_DIR)) {
      fs.mkdirSync(OUT_DIR, { recursive: true });
    }

    const outPath = path.join(OUT_DIR, fileName);
    fs.writeFileSync(outPath, JSON.stringify(data, null, 2), "utf8");

    console.log(`Wrote ${outPath}`);

  } catch (error) {
    console.error('API call failed:', error.response?.data || error.message);
    console.error('Status:', error.response?.status);
    process.exit(1);
  }
}

// One-way execution
readPrimeo();