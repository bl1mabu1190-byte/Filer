export default async function handler(req,res){

  if(req.method !== "POST"){
    return res.status(405).json({
      error:"Method not allowed"
    });
  }

  try{

    const { username, html } = req.body;

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;

    const path = `${username}.html`;

    const content = Buffer.from(html).toString("base64");

    const response = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method:"PUT",
        headers:{
          Authorization:`token ${token}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          message:`Add CV for ${username}`,
          content
        })
      }
    );

    const data = await response.json();

    const url = `https://${repo}.vercel.app/${path}`;

    return res.status(200).json({
      success:true,
      url,
      github:data.content.html_url
    });

  }catch(err){

    return res.status(500).json({
      error:err.message
    });

  }

}
