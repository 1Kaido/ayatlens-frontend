//console.log("Bismillah")
//30/8/25:7:16pm after magrib Namaz

//Variable
const cameraIcon = document.getElementById("cameraIcon");
const cameraPage = document.getElementById("cameraPage");
const snapButton = document.getElementById("snapButton");
const imgOnHomeScreen = document.getElementById("imgConatiner");
const get_query = document.getElementById("get_query");

let videoStream;
let videoElement;
let canvas;
let capturedImage;

// ----------- IMAGE ANALYSIS ----------- //
async function analyzeCapturedImage(base64Data) {
  showLoader("Analyzing image...");
  try {
    const res = await fetch("https://ayatlens-backend.onrender.com/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64Data })
    });
    
    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Error sending image:", err);
    showError("Image Detection Failed, Try Again");
  } finally {
    hideLoader();
  }
}

async function sendImageBase64(base64Img) {
  showLoader("Detecting objects...");
  try {
    const response = await fetch("https://ayatlens-backend.onrender.com/analyze-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64Img })
    });
    const result = await response.json();
    return result;
  } catch (err) {
    console.error("Error:", err);
    showError("Image Detection Failed, Try Again");
  } finally {
    hideLoader();
  }
}

// --- container helpers --- //
let raw;
let raw_save_button;

function createContainer(main, container_class) {
  const mainContainer = document.getElementById(main);
  if (!mainContainer) {
    console.warn("createContainer: parent not found:", main);
    return null;
  }
  const container = document.createElement("div");
  container.classList.add(container_class);
  mainContainer.appendChild(container);
  raw = container;
  return container;
}

function addContainerData(className, text) {
  const box = document.createElement("div");
  box.classList.add(className);
  box.innerText = text;
  if (!raw) {
    console.warn("addContainerData: raw is not set. Call createContainer first.");
    return box;
  }
  raw.appendChild(box);
  if (className === "save_button") raw_save_button = box;
  return box;
}

// --- display function --- //
function display(data, cont, contClass) {
  if (!data || !Array.isArray(data.results)) {
    console.warn("display: invalid data", data);
    return;
  }
  
  const wrapper = document.createElement("div");
  wrapper.classList.add("resultGroup");
  
  const queryBox = document.createElement("h1");
  queryBox.classList.add("queryTitle");
  queryBox.innerText = `Query: ${data.search_keyword || ""}`;
  wrapper.appendChild(queryBox);
  
  const totalBox = document.createElement("h4");
  totalBox.classList.add("totalVerse");
  totalBox.innerText = `Total Verse: ${data.results.length}`;
  wrapper.appendChild(totalBox);
  
  for (let i = 0; i < data.results.length; i++) {
    const ayahContainer = document.createElement("div");
    ayahContainer.classList.add(contClass);
    
    const verseKey = document.createElement("div");
    verseKey.classList.add("verseKey");
    verseKey.innerText = data.results[i].verse_key;
    
    const surah = document.createElement("div");
    surah.classList.add("surah");
    surah.innerText = data.results[i].text;
    
    const saveBtn = document.createElement("button");
    saveBtn.classList.add("save_button");
    saveBtn.innerText = "Save";
    
    (function(item) {
      saveBtn.addEventListener("click", () => {
        const savedBox = document.createElement("div");
        savedBox.classList.add("ayahContainer");
        
        const savedKey = document.createElement("div");
        savedKey.classList.add("verseKey");
        savedKey.innerText = item.verse_key;
        
        const savedSurah = document.createElement("div");
        savedSurah.classList.add("surah");
        savedSurah.innerText = item.text;
        
        savedBox.appendChild(savedKey);
        savedBox.appendChild(savedSurah);
        
        document.getElementById("save_ayat_container").appendChild(savedBox);
        
        saveAyat(item.verse_key, item.text);
      });
    })(data.results[i]);
    
    ayahContainer.appendChild(verseKey);
    ayahContainer.appendChild(surah);
    ayahContainer.appendChild(saveBtn);
    
    wrapper.appendChild(ayahContainer);
  }
  
  const mainContainer = document.getElementById(cont);
  mainContainer.appendChild(wrapper);
}

// --- SEARCH PAGE --- //
async function search_page() {
  const input_query = document.getElementById("get_query").value.trim();
  if (!input_query) return;
  
  displayPage("search_result", "visibility", "visible");
  document.getElementById("hdhd").innerHTML = `Search Results related to <i>${input_query}</i>`;
  
  try {
    const res = await fetch(`https://ayatlens-backend.onrender.com/search?query=${input_query}`);
    const data = await res.json();
    
    display(data, "search_result", "ayahContainer");
  } catch (err) {
    console.error("Error fetching search data:", err);
    showError("Something Went Wrong");
  }
}

// --- PAGE VISIBILITY --- //
function displayPage(id, type, style) {
  const page = document.getElementById(id);
  if (!page) return;
  if (type === "visibility") {
    page.style.visibility = style;
  } else {
    page.style.display = style;
  }
}

// --- RANDOM AYAT --- //
async function getRandomAyat() {
  showLoader("Loading...");
  try {
    const res = await fetch("https://ayatlens-backend.onrender.com/random-ayat");
    const data = await res.json();
    
    if (!data.ayahs || !Array.isArray(data.ayahs)) {
      console.error("Invalid ayahs data", data);
      return;
    }
    
    let n = data.ayahs.length;
    let randomNum = Math.floor(Math.random() * n);
    
    createContainer("random_surah_cont", "random_conatiner");
    addContainerData("random_ayah", data.ayahs[randomNum].text);
    addContainerData("random_ayah_versekey", `${data.surah_number}:${randomNum}`);
  } catch (err) {
    console.error("Error fetching random ayat:", err);
    showError("Network Error, Try Again");
  } finally {
    hideLoader();
  }
}

// Call random ayat once page loads
getRandomAyat();

// --- GET DATA FUNCTION --- //
async function get_data(query) {
  showLoader("Searching...");
  try {
    const res = await fetch(`https://ayatlens-backend.onrender.com/search?query=${query}`);
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

// --- CAMERA HANDLING --- //
cameraIcon.addEventListener("click", async () => {
  showLoader("Starting Camera..");
  cameraPage.style.display = "flex";
  
  videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  
  cameraPage.insertBefore(videoElement, snapButton);
  
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } },
      audio: false
    });
    videoElement.srcObject = videoStream;
  } catch (err) {
    showError("Camera access denied or not available");
  } finally {
    hideLoader();
  }
  
  if (!canvas) {
    canvas = document.createElement("canvas");
    capturedImage = document.createElement("img");
    capturedImage.id = "capturedImage";
    imgOnHomeScreen.appendChild(capturedImage);
    imgOnHomeScreen.style.display = "block";
  }
});

snapButton.addEventListener("click", async () => {
        if (!videoElement) return;
        
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        
        const ctx = canvas.getContext("2d");
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
        
        const dataURL = canvas.toDataURL("image/png");
        capturedImage.src = dataURL;
        
        let datas = await analyzeCapturedImage(dataURL);
        
        if (datas) {
          let predictionsArray = datas.predictions || [];
          if (predictionsArray.length > 0) {
            for (let i = 0; i < predictionsArray.length; i++) {
              await get_data(predictionsArray[i].tag);
            }
          } else {
            showError("No Data Found!");
          }
        }
        
        displayPage("capturedImage", "display", "block");
        displayPage("cameraPage", "display", "none");
        displayPage("obj_result", "visibility","visible")
  
  if (videoElement) {
    videoElement.remove();
  }
});


//*******| Search Page |********//

async function search_page() {
  displayPage("search_result", "visibility", "visible");
  document.getElementById("hdhd").innerHTML =
    `Search Results related to <i>${input_query.value}</i>`;
  
  let data = await get_data(input_query.value);
  if (data) {
    display(data,"search_result", "ayahContainer");
  }
}

/* ====== Tiny show/hide helpers ====== */
function showLoader(text) {
  const loader = document.getElementById("app-loader");
  if (!loader) return;
  if (text) loader.querySelector(".loader-text").innerText = text;
  loader.classList.add("active");
  loader.setAttribute("aria-hidden", "false");
}

function hideLoader() {
  const loader = document.getElementById("app-loader");
  if (!loader) return;
  loader.classList.remove("active");
  loader.setAttribute("aria-hidden", "true");
}

function reloadIfTooSlow(ms = 15000) { // default 15 seconds
  return setTimeout(() => {
   // alert("Taking too long... reloading.");
    location.reload();
  }, ms);
}

function showError(message) {
  const box = document.getElementById("errorBox");
  const msg = document.getElementById("errorMsg");
  
  msg.textContent = message;
  box.style.display = "flex";
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    hideError();
  }, 5000);
}

function hideError() {
  document.getElementById("errorBox").style.display = "none";
}
