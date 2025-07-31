
const {GigaChat} = require("gigachat")
const {Agent} = require("node:https")

require('dotenv').config()
const express =  require("express")
const app = express()
app.use(express.json());

console.log("Server started")

const httpsAgent = new Agent({
  rejectUnauthorized: false, // Отключает проверку корневого сертификата
  // Читайте ниже как можно включить проверку сертификата Мин. Цифры
});

const client = new GigaChat({
  timeout: 600,
  model: 'GigaChat',
  credentials: process.env.GIGACHAT_AUTH_KEY,
  httpsAgent: httpsAgent,
});

client.updateToken()
app.post("/",(req, res)=>{
    console.log("got request", req.body)
    
    let content
    if(req.body.type === "sentences"){
      content = `Give me 5 simple sentences using the word ${req.body.wordForSentences}. Give no explanations`
    }else if(req.body.type === "definition"){
      content = `What's this ${req.body.wordForDefinition}. Answer must be in english. Answer must contain definition, key features, how it works and why it matters` 
    }
    try{
        client
          .chat({
            messages: [{ role: 'user', 
                         content }],
          })
          .then((resp) => {
            console.log("got response from gigachat", resp.choices[0]?.message.content)
            if(req.body.type === "sentences"){
              const splSentences = resp.choices[0]?.message.content.split(/[1-5]./)
              res.send({type:req.body.type, response: splSentences});
            }else if(req.body.type === "definition"){
              res.send({type:req.body.type, response: resp.choices[0]?.message.content});

            }
          });
    }catch(err){
        console.log(err)
    }
    // res.send("response")
})


app.listen(3000)