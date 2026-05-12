import { generateCVTemplate } from "./templates/cv-template.js";

const form = document.getElementById("cvForm");
const previewFrame = document.getElementById("previewFrame");
const toolsContainer = document.getElementById("toolsContainer");

const successModal = document.getElementById("successModal");
const generatedUrl = document.getElementById("generatedUrl");

let latestHTML = "";

function showToast(message){
  const toast = document.getElementById("toast");

  toast.innerText = message;
  toast.style.display = "block";

  setTimeout(()=>{
    toast.style.display = "none";
  },3000);
}

function addToolField(){

  const div = document.createElement("div");

  div.className = "tool-item";

  div.innerHTML = `
    <input type="text" placeholder="Tool Name" class="tool-name"/>
    <input type="text" placeholder="Tool Icon URL" class="tool-icon"/>
    <input type="text" placeholder="Tool Website Link" class="tool-link"/>
  `;

  toolsContainer.appendChild(div);
}

document.getElementById("addToolBtn")
.addEventListener("click", addToolField);

addToolField();

function getFormData(){

  const tools = [];

  document.querySelectorAll(".tool-item").forEach(item=>{

    tools.push({
      name:item.querySelector(".tool-name").value,
      icon:item.querySelector(".tool-icon").value,
      link:item.querySelector(".tool-link").value
    });

  });

  return {
    fullName:fullName.value,
    username:username.value,
    profileImage:profileImage.value,
    profession:profession.value,
    about:about.value,
    email:email.value,
    phone:phone.value,
    address:address.value,
    website:website.value,
    github:github.value,
    linkedin:linkedin.value,
    skills:skills.value.split(","),
    experience:experience.value,
    education:education.value,
    projects:projects.value,
    certifications:certifications.value,
    languages:languages.value,
    interests:interests.value,
    tools
  };
}

function updatePreview(){

  const data = getFormData();

  latestHTML = generateCVTemplate(data);

  previewFrame.srcdoc = latestHTML;

  localStorage.setItem("cvData", JSON.stringify(data));
}

form.addEventListener("input", updatePreview);

window.addEventListener("load",()=>{

  const saved = localStorage.getItem("cvData");

  if(saved){

    const data = JSON.parse(saved);

    Object.keys(data).forEach(key=>{

      if(document.getElementById(key)){
        document.getElementById(key).value = data[key];
      }

    });

    updatePreview();
  }

});

form.addEventListener("submit", async(e)=>{

  e.preventDefault();

  const data = getFormData();

  latestHTML = generateCVTemplate(data);

  try{

    showToast("Uploading CV...");

    const response = await fetch("/api/upload",{
      method:"POST",
      headers:{
        "Content-Type":"application/json"
      },
      body:JSON.stringify({
        username:data.username,
        html:latestHTML
      })
    });

    const result = await response.json();

    if(result.success){

      successModal.classList.remove("hidden");

      generatedUrl.value = result.url;

      document.getElementById("openCvBtn")
      .href = result.url;

      showToast("CV Generated Successfully");

    }else{
      throw new Error(result.error);
    }

  }catch(err){

    console.error(err);

    showToast("Generation failed");

  }

});

document.getElementById("copyBtn")
.addEventListener("click",()=>{

  navigator.clipboard.writeText(generatedUrl.value);

  showToast("URL Copied");

});

document.getElementById("downloadBtn")
.addEventListener("click",()=>{

  const blob = new Blob([latestHTML],{
    type:"text/html"
  });

  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");

  a.href = url;

  a.download = `${username.value}.html`;

  a.click();

});

document.getElementById("themeToggle")
.addEventListener("click",()=>{

  document.body.classList.toggle("light");

});
