const { default: axios } = require('axios');
const { Client, Intents } = require('discord.js');
const { token } = require('./config.json');



const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });




client.once('ready', () => {
	console.log('Ready!');
    
});


client.on("messageCreate", async (message) => {
    if(message.author.bot) return
        console.log(`Message from ${message.author.username}: ${message.content}`);
    

        if(message.content.includes('summoner mastery')) {
            const summonerName = message.content.split('-')[1]
           
   
            
            const summonerIdData =  await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            }).catch(error => console.log(error))
        
            const {id} = summonerIdData.data


            const championMaestry =  await axios.get(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            }).catch(error => console.log(error))

            const {championId, championPoints, championLevel} = championMaestry.data[0]

            const champion =  await axios.get(`http://ddragon.leagueoflegends.com/cdn/12.6.1/data/en_US/champion.json`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            }).catch(error => console.log(error))

           
            for (var [key, value] of Object.entries(champion.data["data"])) {
                
                if(value.key === championId.toString()){

                    const mastery = {
                        championName: value.id,
                        championPoints: championPoints,
                        masteryLevel: championLevel
                    }

                    message.reply({content: `
                    Hey ${summonerName}, sua maior maestria é com: 
                    
                    Champion: ${mastery.championName}
                    Nível da maestria: ${mastery.masteryLevel}
                    Pontos de maestria: ${championPoints} points
                    `})
                }
                   
            }  
            
        }  
    
  });


client.login(token);