// Add a test to verify the script is loaded
console.log("LinkedIn Scraper Content Script Loaded!");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("Message received:", message.action);

  if (message.action === "FILL_SPEAKER") {
    try {
      console.log("Starting FILL_SPEAKER...");

      // NAME - Multiple fallback selectors
      let name = "";
      const nameSelectors = [
        "h1.top-card-layout__title",
        ".top-card-layout__title",
        'h1[class*="top-card"]',
        ".pv-text-details__left-panel h1",
      ];

      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          name = element.textContent.trim();
          console.log(`Name found with selector: ${selector}`, name);
          break;
        }
      }

      // IMAGE - Multiple fallback selectors
      let imageUrl = "";
      const imageSelectors = [
        "img.top-card-layout__entity-image",
        "img.top-card__profile-image",
        'img[class*="top-card"][class*="image"]',
        ".pv-top-card--photo img",
        'img[alt*="profile"]',
      ];

      for (const selector of imageSelectors) {
        const element = document.querySelector(selector);
        if (element && element.src) {
          imageUrl = element.src;
          console.log(`Image found with selector: ${selector}`, imageUrl);
          break;
        }
      }

      // HEADLINE/LOCATION - Get the text from the first subline
      let headline = "";
      const headlineSelectors = [
        "h3.top-card-layout__first-subline",
        ".top-card-layout__first-subline",
        'h3[class*="subline"]',
      ];

      for (const selector of headlineSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          headline = element.textContent.trim();
          console.log(`Headline found with selector: ${selector}`, headline);
          break;
        }
      }

      // ABOUT - Multiple approaches
      let about = "";
      const aboutSelectors = [
        'section[data-section="summary"] .core-section-container__content > div',
        "section.summary .core-section-container__content > div",
        ".summary .core-section-container__content",
        'section[data-section="summary"] div',
      ];

      for (const selector of aboutSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          // Clean up the text - remove "see more" buttons
          let text = element.textContent;
          text = text.replace(/see more/gi, "");
          text = text.replace(/…\s*$/gi, ""); // Remove trailing ellipsis
          text = text.trim();

          if (text.length > 10) {
            // Make sure we got actual content
            about = text;
            console.log(
              `About found with selector: ${selector}`,
              about.substring(0, 50) + "...",
            );
            break;
          }
        }
      }

      // SERVICES/SKILLS - Look for service/skill badges
      let contentPillars = [];

      // Try to find the Services section first
      const servicesSelectors = [
        'section[data-section="services"] .btn-md',
        ".pp-section.services .btn-md",
        "section.services button",
      ];

      for (const selector of servicesSelectors) {
        const elements = document.querySelectorAll(selector);
        if (elements.length > 0) {
          contentPillars = Array.from(elements)
            .map((el) => el.textContent.trim())
            .filter(
              (text) => text && text.length > 2 && !text.includes("Request"),
            );

          if (contentPillars.length > 0) {
            console.log(
              `Services found with selector: ${selector}`,
              contentPillars,
            );
            break;
          }
        }
      }

      // If no services found, leave as empty array
      if (contentPillars.length === 0) {
        contentPillars = ["", ""];
        console.log("No services/skills found, using empty array");
      }

      // EMAIL - Not available on public profiles
      const email = "";
      console.log("Email: Not available on public profiles");

      const profileData = {
        email: email,
        imageUrl: imageUrl,
        name: name,
        headline: headline,
        about: about,
        contentPillars: contentPillars,
      };

      console.log("FILL_SPEAKER complete:", profileData);
      sendResponse(profileData);
    } catch (error) {
      console.error("Error in FILL_SPEAKER:", error);
      sendResponse({ error: error.message });
    }
    return true; // CRITICAL: Keep the message channel open
  }

  if (message.action === "FILL_TOPIC") {
    try {
      console.log("Starting FILL_TOPIC...");

      // Post/Article content - Multiple selectors
      let recentArticle = "";
      const postSelectors = [
        ".feed-shared-update-v2__description",
        ".update-components-text",
        '[data-test-id="main-feed-activity-card__commentary"]',
        ".feed-shared-text",
      ];

      for (const selector of postSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          recentArticle = element.textContent.trim();
          console.log(
            `Post found with selector: ${selector}`,
            recentArticle.substring(0, 50) + "...",
          );
          break;
        }
      }

      const postData = {
        recentArticle: recentArticle,
      };

      console.log("FILL_TOPIC complete:", postData);
      sendResponse(postData);
    } catch (error) {
      console.error("Error in FILL_TOPIC:", error);
      sendResponse({ error: error.message });
    }
    return true;
  }

  if (message.action === "FILL_WORKSPACE") {
    try {
      console.log("Starting FILL_WORKSPACE...");

      // Company name
      let workspaceName = "";
      const nameSelectors = [
        ".org-top-card-summary__title",
        "h1.org-top-card-summary__title",
        '[data-test-id="org-top-card-summary__title"]',
      ];

      for (const selector of nameSelectors) {
        const element = document.querySelector(selector);
        if (element && element.textContent.trim()) {
          workspaceName = element.textContent.trim();
          console.log(
            `Company name found with selector: ${selector}`,
            workspaceName,
          );
          break;
        }
      }

      // Company logo
      let logoUrl = "";
      const logoSelectors = [
        ".org-top-card-primary-content__logo-container img",
        ".org-top-card-primary-content__logo",
        'img[alt*="logo"]',
      ];

      for (const selector of logoSelectors) {
        const element = document.querySelector(selector);
        if (element && element.src) {
          logoUrl = element.src;
          console.log(`Company logo found with selector: ${selector}`, logoUrl);
          break;
        }
      }

      const workspaceData = {
        workspaceName: workspaceName,
        logoUrl: logoUrl,
      };

      console.log("FILL_WORKSPACE complete:", workspaceData);
      sendResponse(workspaceData);
    } catch (error) {
      console.error("Error in FILL_WORKSPACE:", error);
      sendResponse({ error: error.message });
    }
    return true;
  }

  // If we get here, return true anyway to keep the channel open
  return true;
});

// Log that we're ready
console.log("LinkedIn Scraper: Message listener registered and ready!");
