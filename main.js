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

async function analyzeCapturedImage(base64Data) {
  showLoader("Analyzing image...");
  try {
    const res = await fetch("https://ayatlens-backend.onrender.com/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image_base64: base64Data })
    });
    
    const data = await res.json();
    //console.log("Predictions:", data);
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
    const response = await fetch("https://ayatlens-backend.onrender.com", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ image: base64Img })
    });
    const result = await response.json();
    //console.log(result);
    return result;
  } catch (err) {
    console.error("Error:", err);
    showError("Image Detection Failed,Try Again");
  } finally {
    hideLoader();
  }
}


// Example: after capturing with canvas


//irectly call it with a test URL
//Create Divs on the Main page
// --- container helpers (fixed) ---
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
  raw = container; // keep for addContainerData (compatible with your existing usage)
  return container; // return so caller can also use it if needed
}

function addContainerData(className, text) {
  const box = document.createElement("div");
  box.classList.add(className);
  box.innerText = text;
  if (!raw) {
    console.warn("addContainerData: raw is not set. Call createContainer first.");
    // still return the box so caller can attach listeners if they want
    return box;
  }
  raw.appendChild(box);
  if (className === "save_button") raw_save_button = box;
  return box; // <- IMPORTANT: return the created element so code can attach events to it
}

// --- display function (fixed) ---
// --- display function (clean with H1 + H4 headers) ---
function display(data, cont, contClass) {
  if (!data || !Array.isArray(data.results)) {
    console.warn("display: invalid data", data);
    return;
  }
  
  // Create a wrapper so each search result set is grouped
  const wrapper = document.createElement("div");
  wrapper.classList.add("resultGroup");
  
  // Add Query (H1)
  const queryBox = document.createElement("h1");
  queryBox.classList.add("queryTitle");
  queryBox.innerText = `Query: ${data.search_keyword || ""}`;
  wrapper.appendChild(queryBox);
  
  // Add Total Verse (H4)
  const totalBox = document.createElement("h4");
  totalBox.classList.add("totalVerse");
  totalBox.innerText = `Total Verse: ${data.results.length}`;
  wrapper.appendChild(totalBox);
  
  // Loop through ayahs
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
    
    // event listener
    (function(item) {
      saveBtn.addEventListener("click", () => {
        //alert("Saved Successful");
       // console.log(`Saved: text: ${item.text} versekey:${item.verse_key}`);
        
        // Direct append instead of createContainer
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
  
  // Append wrapper to main container
  const mainContainer = document.getElementById(cont);
  mainContainer.appendChild(wrapper);
}

// Example usage for search page
async function search_page() {
  const input_query = document.getElementById("get_query").value.trim();
  if (!input_query) return;
  
  displayPage("search_result", "visibility", "visible");
  document.getElementById("hdhd").innerHTML = `Search Results related to <i>${input_query}</i>`;
  
  try {
    const res = await fetch(`https://ayatlens-backend.onrender.com/search?query=${input_query}`);
    const data = await res.json();
    
    // ✅ append results without removing old ones
    display(data, "search_result", "ayahContainer");
  } catch (err) {
    console.error("Error fetching search data:", err);
    showError("Something Went Wrong")
  }
}

// Show/Hide pages
function displayPage(id, type, style) {
  const page = document.getElementById(id);
  if (type === "visibility") {
    page.style.visibility = style;
  } else {
    page.style.display = style;
  }
}

async function getRandomAyat() {
  showLoader("Loading..."); // 👈 show before fetch starts
  
  try {
    const res = await fetch("https://ayatlens-backend.onrender.com");
    const data = await res.json();
    //console.log(data);
    
    let n = data.ayahs.length; // your max value
    let randomNum = Math.floor(Math.random() * n);
    
    // Add surah to UI
    createContainer("random_surah_cont", "random_conatiner");
    addContainerData("random_ayah", data.ayahs[randomNum].text);
    addContainerData("random_ayah_versekey", `${data.surah_number}:${randomNum}`);
    
    //console.log(n);
   // console.log(data.ayahs[randomNum].text);
  } catch (err) {
    console.error("Error fetching random ayat:", err);
    showError("Network Error Try Again");
  } finally {
    hideLoader(); // 👈 always hide loader after work finishes
  }
}

// Call it once page loads
getRandomAyat();

//Get data from backend (ayats)

let input_query = document.getElementById("get_query");

async function get_data(query) {
  showLoader("Searching..."); // 👈 before fetch
  try {
    const res = await fetch(`https://ayatlens-backend.onrender.com/search?query=${input_query}`);
    const data = await res.json();
    //console.log("Fetched:", data);
    display(data, "mainSurahContainer", "ayahContainer");
    return data;
  } catch (err) {
    console.error("Error:", err);
    showError("Something Went Wrong ")
    return null;
  } finally {
    hideLoader(); // 👈 after work
  }
}




//Adding Saves Page 
function displayPage(ids,type,styles){
  let page = document.getElementById(ids);
  //`page.style.visibility = ${style}`;
  //console.log(type)
  if(type=="visibility"){
    page.style.visibility = styles;
    //console.log("if")
  }else{
    page.style.display = styles;
    //console.log(type+":"+styles)
  }
}

// Open camera when clicking bottom nav "Camera"
cameraIcon.addEventListener("click", async () => {
  showLoader("Starting Camera..")
  cameraPage.style.display = "flex";
  
  videoElement = document.createElement("video");
  videoElement.autoplay = true;
  videoElement.playsInline = true;
  
  cameraPage.insertBefore(videoElement, snapButton);
  
  try {
    videoStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { exact: "environment" } }, // back camera
      audio: false
    });
    videoElement.srcObject = videoStream;
  } catch (err) {
    //alert("Camera access denied or not available: " + err);
    showError("Camera Access denied showError")
  } finally {
    
      hideLoader();
   }
  
  // Prepare canvas for capturing
  if (!canvas) {
    canvas = document.createElement("canvas");
    capturedImage = document.createElement("img");
    capturedImage.id = "capturedImage";
    imgOnHomeScreen.appendChild(capturedImage);
    imgOnHomeScreen.style.display = "block";
  }
});

// Capture photo on snap
snapButton.addEventListener("click", () => {
  if (!videoElement) return;
  
  canvas.width = videoElement.videoWidth;
  canvas.height = videoElement.videoHeight;
  
  const ctx = canvas.getContext("2d");
  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  
  const dataURL = canvas.toDataURL("image/png");
  capturedImage.src = dataURL;
  
  // ⏳ set timeout safety
  
  
  (async () => {
    let datas = await analyzeCapturedImage(dataURL);
     
    //console.log("analyze result", datas);
    
    if (datas) {
      let predictionsArray = null;
      if (Array.isArray(datas.predictions)) {
        predictionsArray = datas.predictions;
      } else if (Array.isArray(datas) && datas.length > 0) {
        for (const el of datas) {
          if (el && Array.isArray(el.predictions)) {
            predictionsArray = el.predictions;
            break;
          }
        }
      }
      
      if (predictionsArray) {
        for (let i = 0; i < predictionsArray.length; i++) {
         // console.log(predictionsArray[i].tag, predictionsArray[i].confidence);
          get_data(predictionsArray[i].tag);
        }
      } else {
        //console.log("No predictions array found in response:", datas);
        showError("No Data Found !")
      }
    }
  })();
  
  displayPage("capturedImage", "display", "block");
  displayPage("cameraPage", "display", "none");
  displayPage("obj_result", "visibility", "visible");
  
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
