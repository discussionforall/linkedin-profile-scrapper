let profileData = {
  workspace: {
    workspaceName: "",
    logoUrl: ""
  },
  speaker: {
    email: "",
    imageUrl: "",
    name: "",
    headline: "",
    about: "",
    contentPillars: ["", ""]
  },
  brandKit: {
    primaryColor: "#00539C",
    accentColor: "#FFD662"
  },
  topic: {
    recentArticle: ""
  }
};

// Function to update JSON output
const updateJsonOutput = () => {
  const jsonOutput = document.getElementById('jsonOutput');
  jsonOutput.value = JSON.stringify(profileData, null, 2);
};

// Function to save profile data to local storage
const saveProfileData = () => {
  chrome.storage.local.set({ profileData: JSON.stringify(profileData) }, () => {
    console.log('Profile data saved');
  });
};

// Function to load profile data from local storage
const loadProfileData = () => {
  chrome.storage.local.get(['profileData'], (result) => {
    if (result.profileData) {
      profileData = JSON.parse(result.profileData);
      updateJsonOutput();
    }
  });
};

// Function to handle textarea changes
const handleTextareaChange = () => {
  try {
    profileData = JSON.parse(document.getElementById('jsonOutput').value);
    saveProfileData();
  } catch (error) {
    console.error('Invalid JSON format:', error);
    alert('Invalid JSON format. Please correct it before leaving the textarea.');
  }
};

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
  loadProfileData();
  updateJsonOutput();

  // Add event listener to the textarea to save data on change
  document.getElementById('jsonOutput').addEventListener('input', handleTextareaChange);
});

// Function to send data to API
const sendData = (data) => {
  document.getElementById('loader').style.display = 'block';
  fetch('https://app.zync.ai/api/quick-start-workspace', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(data)
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('loader').style.display = 'none';
    if(data.error){
      alert(`Error: ${data.error}`);
    }
    console.log('Success:', data.result.user);
    if(data.result.user){
      alert('Your data has been submitted successfully.');
    }
  })
  .catch((error) => {
    document.getElementById('loader').style.display = 'none';
    console.error('Error:', error);
  });
};

// Button event listeners
document.getElementById('fillSpeakerBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'FILL_SPEAKER' }, (response) => {
      if (response) {
        profileData.speaker = response;
        updateJsonOutput();
        saveProfileData();
      }
    });
  });
});

document.getElementById('fillWorkspaceBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'FILL_WORKSPACE' }, (response) => {
      if (response) {
        profileData.workspace = response;
        updateJsonOutput();
        saveProfileData();
      }
    });
  });
});

document.getElementById('fillTopicBtn').addEventListener('click', () => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    const activeTab = tabs[0];
    chrome.tabs.sendMessage(activeTab.id, { action: 'FILL_TOPIC' }, (response) => {
      if (response) {
        profileData.topic = response;
        updateJsonOutput();
        saveProfileData();
      }
    });
  });
});

document.getElementById('sendDataBtn').addEventListener('click', () => {
  const jsonOutput = document.getElementById('jsonOutput').value;
  try {
    const dataToSend = JSON.parse(jsonOutput);
    sendData(dataToSend);
  } catch (error) {
    console.error('Invalid JSON format:', error);
    alert('Invalid JSON format. Please correct it before sending.');
  }
});

document.getElementById('clearBtn').addEventListener('click', () => {
  profileData = {
    workspace: {
      workspaceName: "",
      logoUrl: ""
    },
    speaker: {
      email: "",
      imageUrl: "",
      name: "",
      headline: "",
      about: "",
      contentPillars: ["", ""]
    },
    brandKit: {
      primaryColor: "#00539C",
      accentColor: "#FFD662"
    },
    topic: {
      recentArticle: ""
    }
  };
  updateJsonOutput();
  chrome.storage.local.remove('profileData', () => {
    console.log('Profile data cleared from local storage');
  });
});

// Enable/disable buttons based on URL
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const activeTab = tabs[0];
  const url = activeTab.url;

  if (url.includes('linkedin.com')) {
    document.getElementById('sendDataBtn').disabled = false;
    if (url.includes('linkedin.com/in/')) {
      document.getElementById('fillSpeakerBtn').disabled = false;
    } else if (url.includes('linkedin.com/company/')) {
      document.getElementById('fillWorkspaceBtn').disabled = false;
      document.getElementById('fillSpeakerBtn').disabled = true;
      document.getElementById('fillTopicBtn').disabled = true;
    } else if (url.includes('linkedin.com/feed/update/') || url.includes('linkedin.com/posts/')) {
      document.getElementById('fillTopicBtn').disabled = false;
      document.getElementById('fillSpeakerBtn').disabled = true;
      document.getElementById('fillWorkspaceBtn').disabled = true;
    } else {
      document.getElementById('fillSpeakerBtn').disabled = true;
      document.getElementById('fillTopicBtn').disabled = true;
      document.getElementById('fillWorkspaceBtn').disabled = true;
    }
  }
});

loadProfileData();
updateJsonOutput();
