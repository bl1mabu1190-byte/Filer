let uploadedImage = "";

const previewFrame = document.getElementById("previewFrame");

document.getElementById("profileImage").addEventListener("change", e=>{
  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload = ()=>{
    uploadedImage = reader.result;
    updatePreview();
  }

  reader.readAsDataURL(file);
});

document.getElementById("addToolBtn").addEventListener("click", ()=>{

  const div = document.createElement("div");

  div.className = "tool-card";

  div.innerHTML = `
    <input placeholder="Tool Name" class="tool-name">
    <input placeholder="Icon URL" class="tool-icon">
    <input placeholder="Tool Link" class="tool-link">
    <button class="removeTool">Remove</button>
  `;

  div.querySelector(".removeTool").onclick = ()=>div.remove();

  document.getElementById("toolsContainer").appendChild(div);
});

function getData(){

  const tools = [];

  document.querySelectorAll(".tool-card").forEach(card=>{

    tools.push({
      name:card.querySelector(".tool-name").value,
      icon:card.querySelector(".tool-icon").value,
      link:card.querySelector(".tool-link").value
    });

  });

  return {
    username:document.getElementById("username").value,
    name:document.getElementById("name").value,
    profession:document.getElementById("profession").value,
    bio:document.getElementById("bio").value,
    skills:document.getElementById("skills").value.split(","),
    education:document.getElementById("education").value,
    experience:document.getElementById("experience").value,
    projects:document.getElementById("projects").value,
    certifications:document.getElementById("certifications").value,
    languages:document.getElementById("languages").value,
    socials:document.getElementById("socials").value,
    tools,
    image:uploadedImage
  };
}

function generateCVHTML(data){

  return `
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>${data.name}</title>

<style>

body{
  font-family:Arial;
  background:#0f172a;
  color:white;
  padding:40px;
}

.card{
  background:#111827;
  padding:30px;
  border-radius:20px;
}

img{
  width:140px;
  height:140px;
  border-radius:50%;
  object-fit:cover;
}

.skills span{
  display:inline-block;
  background:#2563eb;
  padding:8px 15px;
  margin:5px;
  border-radius:30px;
}

.tool{
  margin-top:10px;
  padding:10px;
  background:#1e293b;
  border-radius:10px;
}

a{
  color:#38bdf8;
}

</style>

</head>

<body>

<div class="card">

<img src="${data.image}">

<h1>${data.name}</h1>

<h2>${data.profession}</h2>

<p>${data.bio}</p>

<h3>Skills</h3>

<div class="skills">
${data.skills.map(skill=>`<span>${skill}</span>`).join("")}
</div>

<h3>Education</h3>
<p>${data.education}</p>

<h3>Experience</h3>
<p>${data.experience}</p>

<h3>Projects</h3>
<p>${data.projects}</p>

<h3>Certifications</h3>
<p>${data.certifications}</p>

<h3>Languages</h3>
<p>${data.languages}</p>

<h3>Social Links</h3>
<p>${data.socials}</p>

<h3>Tools</h3>

${data.tools.map(tool=>`
<div class="tool">
  <img src="${tool.icon}" width="40">
  <a href="${tool.link}" target="_blank">${tool.name}</a>
</div>
`).join("")}

</div>

</body>
</html>
`;
}

function updatePreview(){

  const html = generateCVHTML(getData());

  previewFrame.srcdoc = html;

  localStorage.setItem("cvData", JSON.stringify(getData()));
}

document.querySelectorAll("input,textarea").forEach(el=>{
  el.addEventListener("input", updatePreview);
});

async function uploadToGitHub(){

  const data = getData();

  const html = generateCVHTML(data);

  const response = await fetch("/api/save-cv",{
    method:"POST",
    headers:{
      "Content-Type":"application/json"
    },
    body:JSON.stringify({
      username:data.username,
      html
    })
  });

  const result = await response.json();

  if(result.url){

    currentURL = result.url;

    alert("CV Uploaded!");

    new QRCode(document.getElementById("qrcode"), result.url);

  }

}

document.getElementById("generateBtn").addEventListener("click", uploadToGitHub);

let currentURL = "";

document.getElementById("copyBtn").onclick = ()=>{
  navigator.clipboard.writeText(currentURL);
};

document.getElementById("openBtn").onclick = ()=>{
  window.open(currentURL);
};

document.getElementById("downloadBtn").onclick = ()=>{

  const blob = new Blob([generateCVHTML(getData())],{
    type:"text/html"
  });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = `${getData().username}.html`;

  a.click();
};

document.getElementById("exportBtn").onclick = ()=>{

  const blob = new Blob([JSON.stringify(getData(),null,2)],{
    type:"application/json"
  });

  const a = document.createElement("a");

  a.href = URL.createObjectURL(blob);

  a.download = "cv-data.json";

  a.click();
};

document.getElementById("importFile").addEventListener("change",e=>{

  const file = e.target.files[0];

  const reader = new FileReader();

  reader.onload = ()=>{

    const data = JSON.parse(reader.result);

    Object.keys(data).forEach(key=>{

      const el = document.getElementById(key);

      if(el){
        el.value = data[key];
      }

    });

    updatePreview();

  }

  reader.readAsText(file);

});

window.onload = ()=>{

  const saved = localStorage.getItem("cvData");

  if(saved){

    const data = JSON.parse(saved);

    Object.keys(data).forEach(key=>{

      const el = document.getElementById(key);

      if(el){
        el.value = data[key];
      }

    });

    updatePreview();

  }

};
