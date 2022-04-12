const { default: axios } = require('axios');
const { Client, Intents, MessageEmbed } = require('discord.js');
require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES] });


    client.once('ready', () => {
       
       console.log('Ready!')
    });
    


     

 client.on("messageCreate", async (message) => {
     
    if(message.author.bot) return
        console.log(`Message from ${message.author.username}: ${message.content}`);

        
        if(message.content.includes('summoner mastery')) {
            const summonerName = message.content.split('- ')[1]
           
   
            
            const summonerIdData =  await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
            }).catch(error => console.log(error))
        
            const {id} = summonerIdData.data


            const championMaestry =  await axios.get(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`, {
                headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
            }).catch(error => console.log(error))

            const {championId, championPoints, championLevel} = championMaestry.data[0]

            const champion =  await axios.get(`http://ddragon.leagueoflegends.com/cdn/12.6.1/data/en_US/champion.json`, {
                headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
            }).catch(error => console.log(error))

           
            for (var [key, value] of Object.entries(champion.data["data"])) {
                
                if(value.key === championId.toString()){

                    const mastery = {
                        championName: value.id,
                        championPoints: championPoints,
                        masteryLevel: championLevel,
                        title: value.title,
                        icon: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${value.id}_0.jpg`
                    }

                    const exampleEmbed = new MessageEmbed()
	                    .setColor('#ff3838')
                        .setTitle(`${mastery.championName}`)
                        .setURL('https://discord.js.org/')
                        .setAuthor({ name: `${summonerName}`})
                        .setDescription(`${mastery.title}`)
                        .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                        .addFields(
                            { name: 'Campeão', value: `${mastery.championName}`, inline: true },
                            { name: 'Pontos de Maestria', value: `${mastery.championPoints}`, inline: true },
                            { name: 'Nível da Maestria', value: `${mastery.championPoints} points`, inline: true },
                        )
                        .setImage(`${mastery.icon}`)
                        .setTimestamp()
                        .setFooter({ text: 'Que os deuses estejam com você', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                    
                        message.channel.send({
                            embeds: [exampleEmbed]
                        })

                    
                }
                   
            }  
            
        } 
  });







client.login(process.env.SECRET_TOKEN_DISCORD);