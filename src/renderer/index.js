import Twitter from 'twitter';

import TwitterAPI from 'node-twitter-api';

const twitterAppCredentials = global.require('remote').getGlobal('twitterAppCredentials');
let api = new TwitterAPI({
	consumerKey: twitterAppCredentials.consumer_key,
	consumerSecret: twitterAppCredentials.consumer_secret
});

api.getRequestToken((error, requestToken, requestTokenSecret, results) => {
  if (error) return console.log("Error getting OAuth request token : " + error);
  //store token and tokenSecret somewhere, you'll need them later; redirect user 
  
  console.log(`requestToken: ${requestToken}, requestTokenSecret: ${requestTokenSecret}`)
  
  const authUrl = `https://twitter.com/oauth/authenticate?oauth_token=${requestToken}`;
  console.log(`authUrl: ${authUrl}`);
  
  const anchor = document.createElement('a');
  anchor.innerText = "authenticate url";
  anchor.href = authUrl;
  anchor.target = "_blank";
  const form = document.createElement('form');
  const input = document.createElement('input');
  input.type = 'text';
  input.value = 'pin code here';
  const button = document.createElement('button');
  button.type = 'button';
  button.value = 'done'
  form.appendChild(input);
  form.appendChild(button);
  button.addEventListener('click', e => {
    const oauth_verifier = input.value;
    
    api.getAccessToken(requestToken, requestTokenSecret, oauth_verifier, (error, accessToken, accessTokenSecret, results) => {
      if (error) return console.log(error);
      
      anchor.remove();
      form.remove();
      
      console.log(`accessToken: ${accessToken}, accessTokenSecret: ${accessTokenSecret}, results: ${results}`);
          //store accessToken and accessTokenSecret somewhere (associated to the user) 
          //Step 4: Verify Credentials belongs here 
    });
  });
  document.body.appendChild(anchor);
  document.body.appendChild(form);
});

