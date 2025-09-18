// Replace all localhost calls with your Render backend
const BACKEND_URL = "https://ayatlens-backend.onrender.com";

async function analyzeCapturedImage(base64Data) {
  showLoader("Analyzing image...");
  try {
    const res = await fetch(`${BACKEND_URL}/analyze-image`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64Data })
    });
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error sending image:", err);
    showError("Image Detection Failed,Try Again");
  } finally {
    hideLoader();
  }
}

async function sendImageBase64(base64Img) {
  showLoader("Detecting objects...");
  try {
    const response = await fetch(`${BACKEND_URL}/analyze-image`, { // fixed
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Img })
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error:", err);
    showError("Image Detection Failed,Try Again");
  } finally {
    hideLoader();
  }
}

// Example usage for search page
async function search_page() {
  const input_query = document.getElementById("get_query").value.trim();
  if (!input_query) return;
  
  displayPage("search_result", "visibility", "visible");
  document.getElementById("hdhd").innerHTML = `Search Results related to <i>${input_query}</i>`;
  
  try {
    const res = await fetch(`${BACKEND_URL}/search?query=${input_query}`);
    const data = await res.json();
    display(data, "search_result", "ayahContainer");
  } catch (err) {
    console.error("Error fetching search data:", err);
    showError("Something Went Wrong");
  }
}

async function getRandomAyat() {
  showLoader("Loading...");
  try {
    const res = await fetch(`${BACKEND_URL}/random-ayat`); // fixed
    const data = await res.json();
    
    let n = data.ayahs.length;
    let randomNum = Math.floor(Math.random() * n);
    
    createContainer("random_surah_cont", "random_conatiner");
    addContainerData("random_ayah", data.ayahs[randomNum].text);
    addContainerData("random_ayah_versekey", `${data.surah_number}:${randomNum}`);
  } catch (err) {
    console.error("Error fetching random ayat:", err);
    showError("Network Error Try Again");
  } finally {
    hideLoader();
  }
}

async function get_data(query) {
  showLoader("Searching...");
  try {
    const res = await fetch(`${BACKEND_URL}/search?query=${query}`); // fixed
    const data = await res.json();
    display(data, "mainSurahContainer", "ayahContainer");
    return data;
  } catch (err) {
    console.error("Error:", err);
    showError("Something Went Wrong");
    return null;
  } finally {
    hideLoader();
  }
}