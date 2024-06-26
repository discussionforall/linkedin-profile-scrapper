const express = require('express');
const puppeteer = require('puppeteer');

const app = express();
const PORT = 3000;

app.get('/linkedin-profile', async (req, res) => {
  const profileUrl = req.query.profileUrl;
  
  if (!profileUrl) {
    return res.status(400).send('Profile URL is required');
  }

  try {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(profileUrl, { waitUntil: 'networkidle2' });

    const profileData = await page.evaluate(() => {
      const getTextContent = (selector) => document.querySelector(selector)?.textContent.trim() || '';
      const getSrc = (selector) => document.querySelector(selector)?.src || '';

      return {
        email: getTextContent('div.pv-profile-section__section-info.section-info section.pv-contact-info__contact-type a[href^="mailto:"]'),
        imageUrl: getSrc('.pv-top-card__photo img'),
        name: getTextContent('.text-heading-xlarge.inline.t-24.v-align-middle.break-words'),
        about: getTextContent('div.display-flex.ph5.pv3 > div > div > div > span'),
        services: Array.from(document.querySelectorAll('li.pvs-list__item--with-top-padding .inline-show-more-text--is-collapsed > span > strong')).map(el => el.textContent.trim())
      };
    });

    await browser.close();
    res.json(profileData);
  } catch (error) {
    console.error('Error fetching profile data:', error);
    res.status(500).send('Error fetching profile data');
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
