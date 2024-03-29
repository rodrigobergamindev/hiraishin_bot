global.AbortController = require("node-abort-controller").AbortController;
const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const {NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, joinVoiceChannel} = require('@discordjs/voice')
const { createAudioPlayer } = require('@discordjs/voice');
const {playlist_info, stream} = require('play-dl')



require('dotenv').config();


const client = new Client({ intents: [Intents.FLAGS.GUILDS, 
    Intents.FLAGS.GUILD_MESSAGES, 
    Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_PRESENCES, 
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_VOICE_STATES,
] });






client.once('ready', async data => {
    console.log('ready')

    const commands = [
        new SlashCommandBuilder().setName('hiraishin').setDescription('Obtenha uma lista com os meus comandos.')
        ].map(command => command.toJSON());
    
    const rest = new REST({ version: '9' }).setToken(process.env.SECRET_TOKEN_DISCORD);
    
    rest.put(Routes.applicationCommands(process.env.CLIENT_ID_DISCORD), { body: commands })
        .then(() => console.log('Successfully registered application commands.'))
        .catch(console.error);

         
      
      try {
      
        const guilds = await client.guilds.cache.map((guild) => guild);
        await guilds.map(guild => guild.members.fetch().then().catch(console.error))
        
        

      } catch (error) {
          console.log(error)
      }
    
});

let queue = []

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
	},
});

const keepPlaying = async () => {
             

       
        if(queue.length > 0){
            
            const song = queue[0]
            
            
            
               const track = await stream(song, {
                   discordPlayerCompatibility: true,
                   quality: 2
               })
               
                const resource = await createAudioResource(track.stream, {
                    inputType: track.type
                })
                await player.play(resource)
                   
           
        }

       
   

    

    }
    



player.on(AudioPlayerStatus.Idle, async () => {
    queue.shift()
    await keepPlaying()
}) 


client.on("messageCreate", async (message) => {
     
        if(message.author.bot) return
        if(!message.guild) return
 
        
        if(message.channel.name === '🎧┊hiraishin'){

            const voiceChannel = message.member.voice.channel
            if (!voiceChannel)
                return message.channel.send(
                "You need to be in a voice channel to play music!"
                );
            
                const permissions = voiceChannel.permissionsFor(message.client.user);
                if (!permissions.has("CONNECT") || !permissions.has("SPEAK")) {
                  return message.channel.send(
                    "I need the permissions to join and speak in your voice channel!"
                  );
                }  
                
            const url = message.content

            const connection = await joinVoiceChannel({
                channelId: voiceChannel.id,
                guildId: message.guild.id,
                adapterCreator: message.guild.voiceAdapterCreator
                })

                const sub = await connection.subscribe(player)

            if(message.content === '!next'){
                if(queue.length > 0){
                    queue.shift()
                    await keepPlaying()

                    message.reply('Going to the next track!')
                }
            }

            if(message.content === '!pause'){
                player.pause()
            }

            if(message.content === '!continue'){
               await keepPlaying()
            }

            if(message.content === '!exit'){
                queue = []   
                
                if(queue.length === 0){
                    message.channel.send({
                        content: "Signing out!"
                        
                    })
                    player.stop()
                    const disconnect = await connection.disconnect()
            
                    if(disconnect) return
                    
                }
            }
            
            if(url.startsWith('https')){
                
                if(sub){
    
                    if(!(url.includes('youtube'))){
                        message.reply({
                            content: 'Only Youtube links are accepted here!'
                        })
                    }
                    if(url.includes('youtube')){
                   
                        if(url.includes('list')){
                         
                                 try {
                                 const playlist = await playlist_info(url)
                                 
                             
                                 const videos = await (await playlist.all_videos()).map(video => {
                                     queue.push(video.url)
                                 })


                                 if(player.state.status === 'idle'){
                                    if(queue.length > 0){
                                    
                                       await keepPlaying()
                                        message.reply("Tracks are added in queue")
                                       
                                     }
                                    

                                    }else {
                                        
                                        message.reply("Tracks are added in queue")
                                    }
                                 } catch (error) {
                                     console.log(error)
                                 }
         
         
         
         
                        }else{
                         try {
                            
        
                            queue.push(url)
                            
                            if(player.state.status === 'idle'){
                                if(queue.length > 0){
                                 
                                
                                    await keepPlaying()
                                    message.reply("Track added in queue")
                                    
                                 }
                            }else{
                                
                                message.reply("Track added in queue")
                            }
             
                             
                            } catch (error) {
                                console.log(error)
                            }
                        }
         
                        
                       }
                    
                }
            }

            
        }

        
  });


  player.on("error", async error => {
      console.log(error)
  });
 



  client.on('interactionCreate', async interaction => {
	if (!interaction.isCommand()) return;
 
	const { commandName } = interaction;

    switch (commandName) {
        case 'hiraishin':

            const channel = await interaction.guild.channels.cache.find(channel => channel.name === '🎧┊hiraishin')

            if(!channel){
                await interaction.guild.channels.create('🎧┊hiraishin', {
                    type: "text",
                    permissionOverwrites: [
                        {
                          id: interaction.guild.roles.everyone, 
                          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'],
                          deny: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'READ_MESSAGE_HISTORY'] 
                        }
                     ],
                })
    
                
            }

            const embed = new MessageEmbed()
                                .setColor('#ff3838')
                                .setTitle('Hi, im Hiraishin, lets play the music.')
                                .setAuthor({name: `Hiraishin`})
                                .setDescription(`Escolha o canal hiraishin e coloque a url da música ou playlist que deseja tocar, apenas links do Youtube são aceitos.`)
                                .setThumbnail('https://img.icons8.com/external-justicon-flat-justicon/64/000000/external-headphone-rock-and-roll-justicon-flat-justicon.png')
                                .addFields(
                                    { name: '\u200b', value: '\u200b', inline: false, },
                                    { name: '/hiraishin', value: 'lista com todos os comandos' },
                                    { name: '!next', value: 'Avança para a próxima música da playlist'},
                                    { name: '!pause', value: 'Pausa a playlist'},
                                    { name: '!exit', value: 'Cancela a execução da playlist'}
                                )
                                .setImage('https://i.imgur.com/0emvlG0.jpeg')
                                .setTimestamp()
                                .setFooter({ text: 'Art must exist beyond comprehension', iconURL: 'https://i.imgur.com/7Mp1lV5.png' });

                            
                        interaction.reply({embeds: [embed]})
            break;
        
        default:
        break;
    }
    });




client.login(process.env.SECRET_TOKEN_DISCORD);