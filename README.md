# LinkedIn Profile Scraper Chrome Extension

This Chrome extension scrapes LinkedIn profile information and displays it in a popup. Users can scrape speaker, workspace, and topic information and send this data to an API.

## Features

- Scrape LinkedIn speaker, workspace, and topic information
- Display scraped data in a popup
- Persist data across different pages using Chrome storage
- Send scraped data to an API

## Installation

1. Clone the repository:
    ```sh
    git clone https://github.com/your-username/linkedin-profile-scraper.git
    cd linkedin-profile-scraper
    ```

2. Install dependencies for the server:
    ```sh
    cd background
    npm install
    ```

3. Load the extension into Chrome:
    - Open Chrome and go to `chrome://extensions/`.
    - Enable "Developer mode" in the top right corner.
    - Click "Load unpacked" and select the `chrome-extension` directory.

## Usage

1. Navigate to a LinkedIn profile.
2. Open the extension popup by clicking on the extension icon.
3. Click the relevant buttons to scrape and display speaker, workspace, or topic information.
4. Optionally, send the scraped data to an API by clicking the "Send Data" button.



