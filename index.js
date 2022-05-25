const { SlashCommandBuilder } = require('@discordjs/builders');
const { REST } = require('@discordjs/rest');
const { default: axios } = require('axios');
const { Client, Intents, MessageEmbed } = require('discord.js');
const { Routes } = require('discord-api-types/v9');
const {AudioPlayer, NoSubscriberBehavior, createAudioResource, AudioPlayerStatus, joinVoiceChannel, getVoiceConnection} = require('@discordjs/voice')
const { createAudioPlayer } = require('@discordjs/voice');
const { video_basic_info, stream, search } = require('play-dl');
const music = require('@koenie06/discord.js-music');

const player = createAudioPlayer({
	behaviors: {
		noSubscriber: NoSubscriberBehavior.Play,
	},
});

require('dotenv').config();

//const {PrismaClient} = require('@prisma/client')

//const prisma = new PrismaClient()


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


              if(url.includes('youtube')){
                try {
                    
                    const songInfo = await video_basic_info(url)
                    
                    const song = {
                        title: songInfo.video_details.title,
                        url: songInfo.video_details.url
                    };
    
                    const music = await stream(song.url)
                    
                    const resource = await createAudioResource(music.stream, {
                        metadata: {
                            title: `${song.title}`
                        },
                        inputType: music.type
                    });
                    
                    if(resource){
                       
                        await player.play(resource)
                        
                        const connection = await joinVoiceChannel({
                            channelId: voiceChannel.id,
                            guildId: message.guild.id,
                            adapterCreator: message.guild.voiceAdapterCreator
                        })
        
                        if(connection){
                            await connection.subscribe(player)
                        }
                    }
    
                    
                   } catch (error) {
                       console.log(error)
                   }
              }

              if(url.includes('spotify')){

                try {

                   const stream = await music.play({
                        channel: voiceChannel,
                        interaction: message,
                        song: url
                    })
                    
        

                    const connection = await joinVoiceChannel({
                        channelId: voiceChannel.id,
                        guildId: message.guild.id,
                        adapterCreator: message.guild.voiceAdapterCreator
                    })
    
                    if(connection){
                        await connection.subscribe(stream)
                    }
                    
                    
                } catch (error) {
                    console.log(error)
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
                                .setDescription(`The perfect music bot! Feature rich with high quality music!`)
                                .setThumbnail('https://img.icons8.com/external-justicon-flat-justicon/64/000000/external-headphone-rock-and-roll-justicon-flat-justicon.png')
                                .addFields(
                                    { name: '\u200b', value: '\u200b', inline: false, },
                                    { name: '/hiraishin', value: 'lista com todos os comandos' },
                                )
                                .setImage('https://cdnb.artstation.com/p/assets/images/images/009/089/349/4k/alexander-dudar-city-view.jpg?1517073959')
                                .setTimestamp()
                                .setFooter({ text: 'Art must exist beyond comprehension', iconURL: 'https://i.imgur.com/7Mp1lV5.png' });

                            
                        interaction.reply({embeds: [embed]})
            break;
        
        default:
        break;
    }
    });




client.login(process.env.SECRET_TOKEN_DISCORD);