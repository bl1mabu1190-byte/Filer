export default async function handler(req,res){

  if(req.method !== "POST"){

    return res.status(405).json({
      error:"Method not allowed"
    });

  }

  try{

    const {
      username,
      html
    } = req.body;

    const token = process.env.GITHUB_TOKEN;
    const owner = process.env.GITHUB_OWNER;
    const repo = process.env.GITHUB_REPO;
    const vercel = process.env.VERCEL_URL;

    const path = `${username}.html`;

    const content = Buffer
    .from(html)
    .toString("base64");

    const githubResponse = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${path}`,
      {
        method:"PUT",
        headers:{
          Authorization:`token ${token}`,
          "Content-Type":"application/json"
        },
        body:JSON.stringify({
          message:`Generated CV for ${username}`,
          content
        })
      }
    );

    const githubData = await githubResponse.json();

    if(githubData.commit){

      return res.status(200).json({
        success:true,
        url:`https://${vercel}/${username}.html`
      });

    }

    return res.status(500).json({
      error:"GitHub upload failed"
    });

  }catch(err){

    console.error(err);

    return res.status(500).json({
      error:err.message
    });

  }

}
