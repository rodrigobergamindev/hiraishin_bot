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


            const championData = Object.entries(champion.data["data"]).find(data => data[1].key === championId.toString())

           const mastery = {
            championName: championData[0],
            championPoints: championPoints,
            masteryLevel: championLevel,
            title: championData[1].title,
            icon: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData[0]}_0.jpg`
           }
            
           const masteryEmbed = new MessageEmbed()
	                    .setColor('#ff3838')
                        .setTitle(`${mastery.championName}`)
                        .setAuthor({ name: `${summonerName}`})
                        .setDescription(`${mastery.title}`)
                        .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                        .addFields(
                            { name: 'Campeão', value: `${mastery.championName}`, inline: true },
                            { name: 'Pontos de Maestria', value: `${new Intl.NumberFormat('pt-BR').format(championPoints)} pontos`, inline: true },
                            { name: 'Nível da Maestria', value: `${mastery.masteryLevel}` , inline: true },
                        )
                        .setImage(`${mastery.icon}`)
                        .setTimestamp()
                        .setFooter({ text: 'Que os deuses estejam com você', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                    
                        message.channel.send({
                            embeds: [masteryEmbed]
                        })

            
        } 

        if(message.content.includes('summoner ranking')) {
            const summonerName = message.content.split('- ')[1]
           
   
            
            const summonerIdData =  await axios.get(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`, {
                headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
            }).catch(error => console.log(error))
        
            const {id} = summonerIdData.data


            const rankingData = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`, {
                headers: {'X-Riot-Token': 'RGAPI-ba3d44b9-e23d-43df-9889-75ef4c7abd88'}
            })

            if(rankingData.data){
                const soloQueue = rankingData.data.find(ranking => ranking.queueType === 'RANKED_SOLO_5x5')

                
                
                if(soloQueue) {
                    const winRate = ((soloQueue.wins/(soloQueue.wins + soloQueue.losses)) * 100).toFixed(1)
                    const rankingEmbed = new MessageEmbed()
                    .setColor('#ff3838')
                    .setTitle(`${soloQueue.tier} ${soloQueue.rank}`)
                    .setAuthor({ name: `${summonerName}`})
                    .setDescription(`Win Rate ${winRate}%`)
                    .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                    .addFields(
                        { name: 'Vitórias', value: `${soloQueue.wins}`, inline: true },
                        { name: 'Derrotas', value: `${soloQueue.losses}`, inline: true },
                        { name: 'Pontos de Liga', value: `${soloQueue.leaguePoints} pontos` , inline: true },
                    )
                    .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${soloQueue.tier.toLowerCase()}.png`)
                    .setTimestamp()
                    .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                
                    message.channel.send({
                        embeds: [rankingEmbed]
                    })
                }else {
                    const rankingEmbed = new MessageEmbed()
                    .setColor('#ff3838')
                    .setTitle('UNRANKED')
                    .setAuthor({ name: `${summonerName}`})
                    .setDescription(`Win Rate 0%`)
                    .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                    .addFields(
                        { name: 'Vitórias', value: `0`, inline: true },
                        { name: 'Derrotas', value: `0`, inline: true },
                        { name: 'Pontos de Liga', value: `0` , inline: true },
                    )
                    .setImage('https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/unranked.png')
                    .setTimestamp()
                    .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                
                    message.channel.send({
                        embeds: [rankingEmbed]
                    })
                }
            }

            

            
        } 
  });







client.login(process.env.SECRET_TOKEN_DISCORD);