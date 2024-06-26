chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {

  if (message.action === 'FILL_SPEAKER') {
    const emailElement = document.querySelector('div.pv-profile-section__section-info.section-info section.pv-contact-info__contact-type a[href^="mailto:"]');
    const email = emailElement ? emailElement.textContent.trim() : "";

    const servicesSection = document.querySelector('section.artdeco-card.pv-profile-card.break-words #services');
    let servicesText = "";
    if (servicesSection) {
      const servicesContainer = servicesSection.closest('section');
      if (servicesContainer) {
        const servicesTextElement = servicesContainer.querySelector('li.pvs-list__item--with-top-padding .inline-show-more-text--is-collapsed > span > strong');
        if (servicesTextElement) {
          servicesText = servicesTextElement.textContent.trim();
        }
      }
    }

    const profileData = {
      email: email,
      imageUrl: document.querySelector('.pv-top-card__photo img')?.src || '',
      name: document.querySelector('.text-heading-xlarge.inline.t-24.v-align-middle.break-words')?.textContent.trim() || '',
      about: document.querySelector('div.display-flex.ph5.pv3 > div > div > div > span')?.textContent.trim() || '',
      contentPillars: servicesText ? servicesText.split('•').map(service => service.trim()) : []
    };
    console.log('Sending speaker data:', profileData);
    sendResponse(profileData);
  }

  if (message.action === 'FILL_TOPIC') {
      const postData = {
        recentArticle: document.querySelector('.update-components-text.relative.update-components-update-v2__commentary')?.textContent.trim() || '',
      }
      sendResponse(postData);
  }

  if (message.action === 'FILL_WORKSPACE') {
    const workspaceName = document.querySelector('.org-top-card-summary__title')?.textContent.trim() || '';
    const logoUrl = document.querySelector('.org-top-card-primary-content__logo-container img')?.src || '';

    const workspaceData = {
      workspaceName: workspaceName,
      logoUrl: logoUrl
    };
    sendResponse(workspaceData);
  }


});

