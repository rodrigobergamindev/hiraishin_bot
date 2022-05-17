const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { default: axios } = require('axios');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, Intents.FLAGS.GUILD_MEMBERS] });


client.once('ready', async data => {
    console.log('ready')

    const commands = [
        new SlashCommandBuilder().setName('oraculo').setDescription('Obtenha uma lista com os meus comandos.'),
        ].map(command => command.toJSON());
    
    const rest = new REST({ version: '9' }).setToken(process.env.SECRET_TOKEN_DISCORD);
    
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID_DISCORD), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);
    
        const Guilds = client.guilds.cache.map((guild) => guild);
        await Guilds[0].members.fetch().then(console.log).catch(console.error);
});



     

 client.on("messageCreate", async (message) => {
     
        if(message.author.bot) return
    
        
        if(!(message.content.startsWith('$') 
        || message.content.startsWith('y') || 
        message.content.startsWith('n') || 
        message.content.startsWith('confirm')) 
        && message.channel.name === 'mudae'){

            message.delete()
         
        }

        
       if(message.channel.name === 'oraculo') {
        if(message.content.includes('$summoner mastery')) {
            
           
    
            
            try {
             const summonerName = message.content.split('-')[1].trim()
                 const summonerData =  await axios.get(encodeURI(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`), {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
             
                 const {id} = summonerData.data
                
                 if(id){
                     const championMaestry =  await axios.get(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`, {
                         headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                     })
         
                     const {championId, championPoints, championLevel} = championMaestry.data[0]
         
                     const champion =  await axios.get(`http://ddragon.leagueoflegends.com/cdn/12.6.1/data/pt_BR/champion.json`, {
                         headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                     })
         
         
                     const championData = Object.entries(champion.data["data"]).find(data => data[1].key === championId.toString())
                     
                     if(championData){
 
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
                    .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                    .setAuthor({ name: `${summonerName}`})
                    .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                    .setDescription(`${mastery.title}`)
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
 
                     }else{
                         message.channel.send({content: 'Dados do campeão não encontrado, por favor entre em contato com o suporte'})
                     }
                   
                 }
 
 
            } catch (error) {
                console.log(error)
             message.channel.send({content: 'Erro ao localizar invocador, por favor entre em contato com o suporte'})
            }
 
 
             
         } 
 
         if(message.content.includes('$summoner ranking')) {
             
            
    
             
            try {
             const summonerName = message.content.split('-')[1].trim()
                 const summonerData =  await axios.get(encodeURI(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`), {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
             
                 const {id} = summonerData.data
 
 
 
                 if(id){
                     const rankingData = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`, {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
                 
                 
                 if(rankingData.data){
                     const soloQueue = rankingData.data.find(ranking => ranking.queueType === 'RANKED_SOLO_5x5')
                     const flexQueue = rankingData.data.find(ranking => ranking.queueType === 'RANKED_FLEX_SR')
                     
                     
                     if(soloQueue && flexQueue) {
                         const winRateSoloQueue = ((soloQueue.wins/(soloQueue.wins + soloQueue.losses)) * 100).toFixed(1)
                         const rankingEmbed = new MessageEmbed()
                         .setColor('#ff3838')
                         .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                         .setTitle(`${soloQueue.tier} ${soloQueue.rank}`)
                         .setAuthor({ name: `${summonerName}`})
                         .setDescription(`Win Rate ${winRateSoloQueue}%`)
                         .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                         .addFields(
                             { name: 'Fila', value: `Solo`, inline: true },
                             { name: 'Vitórias', value: `${soloQueue.wins}`, inline: true },
                             { name: 'Derrotas', value: `${soloQueue.losses}`, inline: true },
                             { name: 'Pontos de Liga', value: `${soloQueue.leaguePoints} pontos` , inline: true },
                         )
                         .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${soloQueue.tier.toLowerCase()}.png`)
                         .setTimestamp()
                         .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
 
                         const winRateFlexQueue = ((flexQueue.wins/(flexQueue.wins + flexQueue.losses)) * 100).toFixed(1)
 
                         const rankingFlex = new MessageEmbed()
                         .setColor('#ff3838')
                         .setTitle(`${flexQueue.tier} ${flexQueue.rank}`)
                         .setAuthor({ name: `${summonerName}`})
                         .setDescription(`Win Rate ${winRateFlexQueue}%`)
                         .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                         .addFields(
                             { name: 'Fila', value: `Flex`, inline: true },
                             { name: 'Vitórias', value: `${flexQueue.wins}`, inline: true },
                             { name: 'Derrotas', value: `${flexQueue.losses}`, inline: true },
                             { name: 'Pontos de Liga', value: `${flexQueue.leaguePoints} pontos` , inline: true },
                         )
                         .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${flexQueue.tier.toLowerCase()}.png`)
                         .setTimestamp()
                         .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                     
                                     
                         message.channel.send({
                             embeds: [rankingEmbed, rankingFlex]
                         })
 
                     }else if(soloQueue){
                         const winRateSoloQueue = ((soloQueue.wins/(soloQueue.wins + soloQueue.losses)) * 100).toFixed(1)
                         const rankingEmbed = new MessageEmbed()
                         .setColor('#ff3838')
                         .setTitle(`${soloQueue.tier} ${soloQueue.rank}`)
                         .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                         .setAuthor({ name: `${summonerName}`})
                         .setDescription(`Win Rate ${winRateSoloQueue}%`)
                         .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                         .addFields(
                             { name: 'Fila', value: `Solo`, inline: true },
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
 
                     }else if(flexQueue){
                         const winRateFlexQueue = ((flexQueue.wins/(flexQueue.wins + flexQueue.losses)) * 100).toFixed(1)
 
                         const rankingEmbed = new MessageEmbed()
                         .setColor('#ff3838')
                         .setTitle(`${flexQueue.tier} ${flexQueue.rank}`)
                         .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                         .setAuthor({ name: `${summonerName}`})
                         .setDescription(`Win Rate ${winRateFlexQueue}%`)
                         .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                         .addFields(
                             { name: 'Fila', value: `Flex`, inline: true },
                             { name: 'Vitórias', value: `${flexQueue.wins}`, inline: true },
                             { name: 'Derrotas', value: `${flexQueue.losses}`, inline: true },
                             { name: 'Pontos de Liga', value: `${flexQueue.leaguePoints} pontos` , inline: true },
                         )
                         .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${flexQueue.tier.toLowerCase()}.png`)
                         .setTimestamp()
                         .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                     
                         message.channel.send({
                             embeds: [rankingEmbed]
                         })
 
                     }else{
                         const rankingEmbed = new MessageEmbed()
                         .setColor('#ff3838')
                         .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
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
 
            } catch (error) {
                message.channel.send({content: 'Não consegui localizar o invocador, por favor entre em contato a moderação'})
            }          
 
             
         }
         
         if(message.content.includes('$set my main')){
 
             
 
 
 
             try {
                 const summonerName = message.content.split('-')[1].trim()
                 const summonerData =  await axios.get(encodeURI(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`), {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
             
                 const {id} = summonerData.data
                
                 if(id){
                     const championMaestry =  await axios.get(`https://br1.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-summoner/${id}`, {
                         headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                     })
         
                     const {championId, championPoints, championLevel} = championMaestry.data[0]
         
                     const champion =  await axios.get(`http://ddragon.leagueoflegends.com/cdn/12.6.1/data/pt_BR/champion.json`, {
                         headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                     })
         
         
                     const championData = Object.entries(champion.data["data"]).find(data => data[1].key === championId.toString())
                     
                     if(championData){
 
                         const mastery = {
                             championName: championData[0],
                             championPoints: championPoints,
                             masteryLevel: championLevel,
                             title: championData[1].title.toUpperCase(),
                             icon: `http://ddragon.leagueoflegends.com/cdn/img/champion/splash/${championData[0]}_0.jpg`
                            }
 
                            const roleAlreadyExist = message.member.roles.cache.find(role => role.name === mastery.title)
                            const createRole = roleAlreadyExist ? roleAlreadyExist : await message.guild.roles.create({
                             color: 'RANDOM',
                             name: mastery.title,
                         })
 
                         if(createRole){
 
                             const addUserToRole = await message.member.roles.add(createRole.id)
 
                             if(addUserToRole){
                                 const roleEmbed = new MessageEmbed()
                                 .setColor('#ff3838')
                                 .setTitle(`${message.author.username}`)
                                 .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                                 .setAuthor({ name: `Oráculo`})
                                 .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                                 .setDescription(`Olá ${message.author.username}, sabemos que você percorreu um árduo caminho até chegar aqui, e por todos os seus feitos e com o poder de Oráculo eu te nomeio como ${mastery.title} `)
                                 .addFields(
                                     { name: 'Invocador', value: `${summonerName}`, inline: true },
                                     { name: 'Pontos de Maestria', value: `${new Intl.NumberFormat('pt-BR').format(championPoints)} pontos`, inline: true },
                                     { name: 'Nível da Maestria', value: `${mastery.masteryLevel}` , inline: true },
                                 )
                                 .setImage(`${mastery.icon}`)
                                 .setTimestamp()
                                 .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                             
                                 message.channel.send({
                                     embeds: [roleEmbed]
                                 })
                             }
                         }
             
                     }else{
                         message.channel.send({content: 'Não foi possível executar este comando, procure a moderação.'})
                     }
                   
                 }
 
 
            } catch (error) {
                console.log(error)
             message.channel.send({content: 'Não foi possível executar este comando, procure a moderação.'})
            }
         }
 
         if(message.content.includes('$set my ranking')){
 
 
 
             try {
                 const summonerName = message.content.split('-')[1].trim()
                 const summonerData =  await axios.get(encodeURI(`https://br1.api.riotgames.com/lol/summoner/v4/summoners/by-name/${summonerName}`), {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
             
                 const {id} = summonerData.data
 
 
 
                 if(id){
                     const rankingData = await axios.get(`https://br1.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}`, {
                     headers: {'X-Riot-Token': `${process.env.RIOT_API_KEY}`}
                 })
                 
                 
                 if(rankingData.data){
                     const soloQueue = rankingData.data.find(ranking => ranking.queueType === 'RANKED_SOLO_5x5')
                     const flexQueue = rankingData.data.find(ranking => ranking.queueType === 'RANKED_FLEX_SR')
                     
                     
                     if(soloQueue) {
                         const roleAlreadyExist = message.member.roles.cache.find(role => role.name === `${soloQueue.tier} ${soloQueue.rank}`)
                         const createRole = roleAlreadyExist ? roleAlreadyExist : await message.guild.roles.create({
                          color: 'RANDOM',
                          name: `${soloQueue.tier} ${soloQueue.rank}`
                      })
                  
                      if(createRole){
 
                          const addUserToRole = await message.member.roles.add(createRole.id)
 
                          if(addUserToRole){
 
                             const winRateSoloQueue = ((soloQueue.wins/(soloQueue.wins + soloQueue.losses)) * 100).toFixed(1)
 
                              const roleEmbed = new MessageEmbed()
                              .setColor('#ff3838')
                              .setTitle(`${message.author.username}`)
                              .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                              .setAuthor({ name: `Oráculo`})
                              .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                              .setDescription(`Olá ${message.author.username}, parece que você atravessou um longo percurso até chegar nessa posição, muitos são os guerreiros que almejam alcança-la.\n Pelo seu esforço e bravura, eu o Oráculo, te concedo a posição de ${soloQueue.tier} ${soloQueue.rank} `)
                              .addFields(
                                 { name: 'Fila', value: `Solo`, inline: true },
                                 { name: 'Vitórias', value: `${soloQueue.wins}`, inline: true },
                                 { name: 'Derrotas', value: `${soloQueue.losses}`, inline: true },
                                 { name: 'Pontos de Liga', value: `${soloQueue.leaguePoints} pontos` , inline: true },
                                 { name: 'Win Rate', value: `${winRateSoloQueue} %` , inline: true },
                             )
                             .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${soloQueue.tier.toLowerCase()}.png`)
                              .setTimestamp()
                              .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                          
                              message.channel.send({
                                  embeds: [roleEmbed]
                              })
                          }
                      }
 
                     }else if(flexQueue){
                         
                         const roleAlreadyExist = message.member.roles.cache.find(role => role.name === `${flexQueue.tier} ${flexQueue.rank}`)
                         const createRole = roleAlreadyExist ? roleAlreadyExist : await message.guild.roles.create({
                          color: 'RANDOM',
                          name: `${flexQueue.tier} ${flexQueue.rank}`
                      })
 
                      if(createRole){
 
                          const addUserToRole = await message.member.roles.add(createRole.id)
 
                          if(addUserToRole){
 
                             const winRateflexQueue = ((flexQueue.wins/(flexQueue.wins + flexQueue.losses)) * 100).toFixed(1)
 
                              const roleEmbed = new MessageEmbed()
                              .setColor('#ff3838')
                              .setTitle(`${message.author.username}`)
                              .setURL(encodeURI(`https://u.gg/lol/profile/br1/${summonerName}/overview`))
                              .setAuthor({ name: `Oráculo`})
                              .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                              .setDescription(`Olá ${message.author.username}, parece que você atravessou um longo percurso até chegar nessa posição, muitos são os guerreiros que almejam alcança-la.\n Pelo seu esforço e bravura, eu o Oráculo, te concedo a posição de ${flexQueue.tier} ${flexQueue.rank} `)
                              .addFields(
                                 { name: 'Fila', value: `Solo`, inline: true },
                                 { name: 'Vitórias', value: `${flexQueue.wins}`, inline: true },
                                 { name: 'Derrotas', value: `${flexQueue.losses}`, inline: true },
                                 { name: 'Pontos de Liga', value: `${flexQueue.leaguePoints} pontos` , inline: true },
                                 { name: 'Win Rate', value: `${winRateflexQueue} %` , inline: true },
                             )
                             .setImage(`https://raw.githubusercontent.com/InFinity54/LoL_DDragon/master/extras/tier/${flexQueue.tier.toLowerCase()}.png`)
                              .setTimestamp()
                              .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });
                                          
                              message.channel.send({
                                  embeds: [roleEmbed]
                              })
                          }
                      }
 
                     }else{
                                 
                         message.channel.send({content: `O jogador ${summonerName} é inelegível ao cargo por ser unranked`})
                     }
                 }
                 }
 
            } catch (error) {
                console.log(error)
                message.channel.send({content: 'Não consegui localizar o invocador, por favor entre em contato a moderação'})
            }   
         }
       }
  });



  client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
 
	const { commandName } = interaction;

    switch (commandName) {
        case 'oraculo':
            const embed = new MessageEmbed()
                                .setColor('#ff3838')
                                .setTitle('Bem-vindo ao Oráculo!')
                                .setAuthor({name: `Oráculo`})
                                .setDescription(`Informações sobre invocadores, campeões, glossário e mais. Busque informações sobre as suas filas ranqueadas e maestria e ganhe um cargo especial com base no seu main e pontuação de maestria.`)
                                .setThumbnail('https://img.icons8.com/color/48/000000/league-of-legends.png')
                                .addFields(
                                    { name: '\u200b', value: '\u200b', inline: false, },
                                    { name: '/oraculo', value: 'lista com todos os comandos' },
                                    { name: '$summoner mastery - nome do invocador', value: 'retorna o campeão de maior maestria do jogador' },
                                    { name: '$summoner ranking - nome do invocador', value: 'lista com os elos do jogador' },
                                    { name: '$set my main - seu nome de invocador', value: 'Ganhe um cargo especial com base no seu main' },
                                    { name: '$set my ranking - seu nome de invocador', value: 'Ganhe um cargo especial com base no seu ranking' }
                                )
                                .setImage('https://i.imgur.com/FzFrWLJ.png')
                                .setTimestamp()
                                .setFooter({ text: 'A sorte favorece os corajosos', iconURL: 'https://cdn.discordapp.com/attachments/963135769394954273/963288526303162388/unknown.png' });

                            
                        interaction.reply({embeds: [embed]})
            break
        default:
        break;
    }
    });



client.login(process.env.SECRET_TOKEN_DISCORD);