
const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json());

app.post('/extract', async (req, res) => {
  const { url } = req.body;
  if (!url) return res.status(400).json({ error: 'Missing URL' });

  let browser;
  try {
    browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });

    const bodyText = await page.evaluate(() => document.body.innerText);
    const paragraph = bodyText
      .split('\n')
      .find(p => p.includes('ESRS 1') || p.includes('ESRS E1')) || 'NOT FOUND';

    res.json({ paragraph });
  } catch (err) {
    res.status(500).json({ error: err.message });
  } finally {
    if (browser) await browser.close();
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Running on port ${port}`));
