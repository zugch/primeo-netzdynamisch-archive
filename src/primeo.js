const axios = require('axios');
const fs = require('fs');
const path = require('path');

const API_URL = "https://tarife.primeo-energie.ch/api/v1/tariffs";
const OUT_DIR = path.join(__dirname, "..", "data");

async function readPrimeo() {
  try {
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