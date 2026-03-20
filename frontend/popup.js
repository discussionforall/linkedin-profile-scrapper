let profileData = {
  workspace: {
    workspaceName: "",
    logoUrl: "",
  },
  speaker: {
    email: "",
    imageUrl: "",
    name: "",
    headline: "",
    about: "",
    contentPillars: ["", ""],
  },
  brandKit: {
    primaryColor: "#00539C",
    accentColor: "#FFD662",
  },
  topic: {
    recentArticle: "",
  },
};

// Function to update JSON output
const updateJsonOutput = () => {
  const jsonOutput = document.getElementById("jsonOutput");
  jsonOutput.value = JSON.stringify(profileData, null, 2);
};

// Function to save profile data to local storage
const saveProfileData = () => {
  chrome.storage.local.set({ profileData: JSON.stringify(profileData) }, () => {
    console.log("Profile data saved", profileData);
  });
};

// Function to load profile data from local storage
const loadProfileData = () => {
  chrome.storage.local.get(["profileData"], (result) => {
    if (result.profileData) {
      profileData = JSON.parse(result.profileData);
      updateJsonOutput();
    }
  });
};

// Function to handle textarea changes
const handleTextareaChange = () => {
  try {
    profileData = JSON.parse(document.getElementById("jsonOutput").value);
    saveProfileData();
  } catch (error) {
    console.error("Invalid JSON format:", error);
    alert(
      "Invalid JSON format. Please correct it before leaving the textarea.",
    );
  }
};

// Helper function to execute script in page and get result
async function executeScriptInPage(action) {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];

  console.log(`Executing ${action} in tab:`, activeTab.id);

  try {
    // Try to send message first (if content script is loaded)
    return new Promise((resolve, reject) => {
      chrome.tabs.sendMessage(activeTab.id, { action: action }, (response) => {
        if (chrome.runtime.lastError) {
          console.log("Content script not loaded, injecting manually...");
          // Content script not loaded, inject and execute directly
          injectAndExecute(activeTab.id, action).then(resolve).catch(reject);
        } else {
          resolve(response);
        }
      });
    });
  } catch (error) {
    console.error("Error:", error);
    throw error;
  }
}

// Function to inject content script and execute action
async function injectAndExecute(tabId, action) {
  if (action === "FILL_SPEAKER") {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        // Scrape profile data directly
        let name = "";
        const nameEl = document.querySelector("h1");
        if (nameEl) name = nameEl.textContent.trim();

        let imageUrl = "";
        const images = document.querySelectorAll("img");
        for (let img of images) {
          if (
            img.alt &&
            img.alt
              .toLowerCase()
              .includes(name.toLowerCase().split(" ")[0].toLowerCase())
          ) {
            imageUrl = img.src;
            break;
          }
        }

        let headline = "India"; // Fallback
        let about = "";
        const aboutSection = document.querySelector(
          'section.summary, [id*="about"]',
        );
        if (aboutSection) {
          about = aboutSection.textContent
            .trim()
            .replace(/see more/gi, "")
            .substring(0, 200);
        }

        let contentPillars = [];
        const serviceButtons = document.querySelectorAll("button, .btn-md");
        for (let btn of serviceButtons) {
          const text = btn.textContent.trim();
          if (
            text.length > 3 &&
            text.length < 50 &&
            !text.includes("View") &&
            !text.includes("Join")
          ) {
            contentPillars.push(text);
          }
        }
        contentPillars = contentPillars.slice(0, 5);

        return {
          email: "",
          imageUrl: imageUrl,
          name: name,
          headline: headline,
          about: about,
          contentPillars: contentPillars.length > 0 ? contentPillars : ["", ""],
        };
      },
    });

    return results[0].result;
  }

  if (action === "FILL_WORKSPACE") {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        let workspaceName = "";
        const nameEl = document.querySelector("h1");
        if (nameEl) workspaceName = nameEl.textContent.trim();

        let logoUrl = "";
        const logoEl = document.querySelector('img[alt*="logo"], img');
        if (logoEl) logoUrl = logoEl.src;

        return {
          workspaceName: workspaceName,
          logoUrl: logoUrl,
        };
      },
    });

    return results[0].result;
  }

  if (action === "FILL_TOPIC") {
    const results = await chrome.scripting.executeScript({
      target: { tabId: tabId },
      func: () => {
        let recentArticle = "";
        const postEls = document.querySelectorAll(
          '[class*="commentary"], [class*="description"]',
        );
        if (postEls.length > 0) {
          recentArticle = postEls[0].textContent.trim();
        }

        return {
          recentArticle: recentArticle,
        };
      },
    });

    return results[0].result;
  }
}

// Initial setup
document.addEventListener("DOMContentLoaded", () => {
  loadProfileData();
  updateJsonOutput();
  document
    .getElementById("jsonOutput")
    .addEventListener("input", handleTextareaChange);
});

// Function to send data to API
const sendData = (data) => {
  document.getElementById("loader").style.display = "block";
  fetch("https://app.zync.ai/api/quick-start-workspace", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((data) => {
      document.getElementById("loader").style.display = "none";
      if (data.error) {
        alert(`Error: ${data.error}`);
      }
      console.log("Success:", data.result.user);
      if (data.result.user) {
        alert("Your data has been submitted successfully.");
      }
    })
    .catch((error) => {
      document.getElementById("loader").style.display = "none";
      console.error("Error:", error);
      alert("Failed to send data to API: " + error.message);
    });
};

// Button event listeners
document
  .getElementById("fillSpeakerBtn")
  .addEventListener("click", async () => {
    console.log("Fill Speaker button clicked");
    try {
      const response = await executeScriptInPage("FILL_SPEAKER");
      console.log("Received response:", response);

      if (response && !response.error) {
        profileData.speaker = response;
        updateJsonOutput();
        saveProfileData();
        alert("Speaker data filled successfully!");
      } else {
        alert("Error scraping data: " + (response?.error || "No data found"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  });

document
  .getElementById("fillWorkspaceBtn")
  .addEventListener("click", async () => {
    console.log("Fill Workspace button clicked");
    try {
      const response = await executeScriptInPage("FILL_WORKSPACE");
      console.log("Received response:", response);

      if (response && !response.error) {
        profileData.workspace = response;
        updateJsonOutput();
        saveProfileData();
        alert("Workspace data filled successfully!");
      } else {
        alert("Error scraping data: " + (response?.error || "No data found"));
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Error: " + error.message);
    }
  });

document.getElementById("fillTopicBtn").addEventListener("click", async () => {
  console.log("Fill Topic button clicked");
  try {
    const response = await executeScriptInPage("FILL_TOPIC");
    console.log("Received response:", response);

    if (response && !response.error) {
      profileData.topic = response;
      updateJsonOutput();
      saveProfileData();
      alert("Topic data filled successfully!");
    } else {
      alert("Error scraping data: " + (response?.error || "No data found"));
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Error: " + error.message);
  }
});

document.getElementById("sendDataBtn").addEventListener("click", () => {
  const jsonOutput = document.getElementById("jsonOutput").value;
  try {
    const dataToSend = JSON.parse(jsonOutput);
    sendData(dataToSend);
  } catch (error) {
    console.error("Invalid JSON format:", error);
    alert("Invalid JSON format. Please correct it before sending.");
  }
});

document.getElementById("clearBtn").addEventListener("click", () => {
  profileData = {
    workspace: {
      workspaceName: "",
      logoUrl: "",
    },
    speaker: {
      email: "",
      imageUrl: "",
      name: "",
      headline: "",
      about: "",
      contentPillars: ["", ""],
    },
    brandKit: {
      primaryColor: "#00539C",
      accentColor: "#FFD662",
    },
    topic: {
      recentArticle: "",
    },
  };
  updateJsonOutput();
  chrome.storage.local.remove("profileData", () => {
    console.log("Profile data cleared from local storage");
  });
  alert("Data cleared successfully!");
});

// Enable/disable buttons based on URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  const url = activeTab.url;

  console.log("Current URL:", url);

  if (url.includes("linkedin.com")) {
    document.getElementById("sendDataBtn").disabled = false;
    if (url.includes("linkedin.com/in/")) {
      document.getElementById("fillSpeakerBtn").disabled = false;
      console.log("On profile page - Fill Speaker enabled");
    } else if (url.includes("linkedin.com/company/")) {
      document.getElementById("fillWorkspaceBtn").disabled = false;
      document.getElementById("fillSpeakerBtn").disabled = true;
      document.getElementById("fillTopicBtn").disabled = true;
      console.log("On company page - Fill Workspace enabled");
    } else if (
      url.includes("linkedin.com/feed/update/") ||
      url.includes("linkedin.com/posts/")
    ) {
      document.getElementById("fillTopicBtn").disabled = false;
      document.getElementById("fillSpeakerBtn").disabled = true;
      document.getElementById("fillWorkspaceBtn").disabled = true;
      console.log("On post page - Fill Topic enabled");
    } else {
      document.getElementById("fillSpeakerBtn").disabled = true;
      document.getElementById("fillTopicBtn").disabled = true;
      document.getElementById("fillWorkspaceBtn").disabled = true;
      console.log("On LinkedIn but not on a supported page type");
    }
  } else {
    console.log("Not on LinkedIn");
  }
});

loadProfileData();
updateJsonOutput();
