const { default: axios } = require('axios');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');



// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });

// When the client is ready, run this code (only once)


client.once('ready', () => {
	console.log('Ready!');
    
});


client.on("messageCreate", async (message) => {
    if(message.author.bot) return
        console.log(`Message from ${message.author.username}: ${message.content}`);
    

        if(message.content.includes('summoner name')) {
            const summonerName = message.content.split('-')[1]
           
   
            
            const summonerIdData =  await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            }).catch(error => console.log(error))
        
            const {id} = summonerIdData.data
            console.log(id)

            const rankedData = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            })

            if(rankedData.data.length === 1) {
                message.reply({content: `
            Eai ${rankedData.data[0].summonerName}, tranquilo? Parece que encontramos seus dados de invocador:

            Nickname: ${rankedData.data[0].summonerName}

            Informações da Solo Queue: 
            
            Ranking:${rankedData.data[0].tier}
            Pontos: ${rankedData.data[0].leaguePoints}
            Wins: ${rankedData.data[0].wins}
            Losses: ${rankedData.data[0].losses}

        ` , allowedMentions: false})
            }else {
                message.reply({content: `
                Eai ${rankedData.data[1].summonerName}, tranquilo? Parece que encontramos seus dados de invocador:
    
                Nickname: ${rankedData.data[1].summonerName}
    
                Informações da Solo Queue: 
                
                Ranking:${rankedData.data[1].tier}
                Pontos: ${rankedData.data[1].leaguePoints}
                Wins: ${rankedData.data[1].wins}
                Losses: ${rankedData.data[1].losses}
    
            ` , allowedMentions: false})
            }
            
        }  
    
  });


client.login(token);