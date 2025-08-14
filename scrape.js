// scrape.js
const puppeteer = require("puppeteer-extra");
const StealthPlugin = require("puppeteer-extra-plugin-stealth");
const fs = require("fs");

// Use the stealth plugin to avoid detection
puppeteer.use(StealthPlugin());

// The main function that will contain our scraping logic
async function scrapeUdyamForm() {
  console.log("Launching stealth browser...");
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  await page.setViewport({ width: 1280, height: 800 });

  const url = "https://udyamregistration.gov.in/UdyamRegistration.aspx";
  console.log(`Navigating to ${url}...`);

  try {
    await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });
    console.log("Page loaded successfully.");

    // --- Find the correct frame dynamically ---
    console.log("Searching for the correct form iframe...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const frames = page.frames();
    let formFrame = null;

    for (const frame of frames) {
      try {
        const button = await frame.waitForSelector(
          'input[name*="btnValidate"]',
          { timeout: 5000 }
        );
        if (button) {
          formFrame = frame;
          console.log("Found the form iframe!");
          break;
        }
      } catch (error) {
        console.log("Checked a frame, no form here. Continuing...");
      }
    }

    if (!formFrame) {
      console.error(
        "Could not find the iframe containing the registration form."
      );
      await browser.close();
      return;
    }

    // --- NEW STRATEGY: Find inputs via their labels ---
    const formData = await formFrame.evaluate(() => {
      const formFields = [];

      // Helper function to find an element by its text content
      const findElementByText = (selector, text) => {
        return Array.from(document.querySelectorAll(selector)).find((el) =>
          el.textContent.includes(text)
        );
      };

      // --- Find Aadhaar Input by its Label ---
      const aadhaarLabelElement = findElementByText("label", "Aadhaar Number");
      if (aadhaarLabelElement) {
        const inputId = aadhaarLabelElement.getAttribute("for");
        const aadhaarInput = document.getElementById(inputId);
        if (aadhaarInput) {
          formFields.push({
            id: aadhaarInput.id,
            name: aadhaarInput.name,
            label: aadhaarLabelElement.innerText.split("\n")[0].trim(),
            placeholder: aadhaarInput.placeholder,
            type: aadhaarInput.type,
            validation: {
              required: true,
              pattern: "^\\d{12}$",
              description: "Aadhaar number must be 12 digits.",
            },
          });
        }
      }

      // --- Find Name Input by its Label ---
      const nameLabelElement = findElementByText(
        "label",
        "Name of Entrepreneur"
      );
      if (nameLabelElement) {
        const inputId = nameLabelElement.getAttribute("for");
        const nameInput = document.getElementById(inputId);
        if (nameInput) {
          formFields.push({
            id: nameInput.id,
            name: nameInput.name,
            label: nameLabelElement.innerText.split("\n")[0].trim(),
            placeholder: nameInput.placeholder,
            type: nameInput.type,
            validation: {
              required: true,
              description: "Name as per Aadhaar is required.",
            },
          });
        }
      }

      // These selectors were working, so we'll keep them
      const consentCheckbox = document.querySelector(
        'input[type="checkbox"][name*="chkDecaration"]'
      );
      if (consentCheckbox) {
        formFields.push({
          id: consentCheckbox.id || "consentCheckbox",
          name: consentCheckbox.name,
          type: "checkbox",
          label: "Consent Checkbox",
        });
      }

      const submitButton = document.querySelector(
        'input[type="submit"][name*="btnValidate"]'
      );
      if (submitButton) {
        formFields.push({
          id: submitButton.id,
          name: submitButton.name,
          type: "submit",
          text: submitButton.value,
        });
      }

      return formFields;
    });

    if (formData.length < 4) {
      console.error(
        "Scraping failed: Not all form fields were found. The website structure may have changed."
      );
      console.log("Found fields:", formData);
      return;
    }

    console.log("Scraping complete. Found the following fields:");
    console.log(formData);

    fs.writeFileSync(
      "udyam-form-schema.json",
      JSON.stringify(formData, null, 2)
    );
    console.log("Successfully saved form schema to udyam-form-schema.json");
  } catch (error) {
    console.error("An error occurred during scraping:", error);
    if (error.name === "TimeoutError") {
      console.error(
        "This might be because the form elements did not load in time or the selectors are incorrect."
      );
    }
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }
}

scrapeUdyamForm();
