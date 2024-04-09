require('dotenv').config();
const { Client, GatewayIntentBits, MessageEmbed, ButtonBuilder, ButtonStyle, ActionRowBuilder, ComponentType, ButtonInteraction,  } = require('discord.js');
const { to_string } = require('libsodium-wrappers');
const commands = require('./register-commands'); 

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, 
        GatewayIntentBits.GuildMembers, 
        GatewayIntentBits.GuildMessages, 
        GatewayIntentBits.MessageContent,
    ]});

// Constants For D&D Classes
const classUrls = {
    'barbarian': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225567495952273548/Barbarian.PNG?ex=662199ac&is=660f24ac&hm=5996f590833187835dc81534b548aae33bfa407fc922874921fa84eb1d4a24db&',
        'infoUrl': 'https://open5e.com/classes/barbarian'
    },
    'bard': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225575969838993540/Bard.PNG?ex=6621a191&is=660f2c91&hm=b224ef4553f0d4218cca245fdee5346b4bb1f4ccf03e460093f4558d79a0df6f&',
        'infoUrl': 'https://open5e.com/classes/bard'
    },
    'cleric': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225575991334666320/Cleric.PNG?ex=6621a196&is=660f2c96&hm=e79821f2492ecf798b3044206add3b90cdd456ad9bad7c5b7796b6109b39a247&',
        'infoUrl': 'https://open5e.com/classes/cleric'
    },
    'druid': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576009408188468/Druid.PNG?ex=6621a19a&is=660f2c9a&hm=8aca7915f3cf84351e059f649f458219406e298e92943d89f29d910d9ad429d9&',
        'infoUrl': 'https://open5e.com/classes/druid'
    },
    'fighter': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576030471979099/Fighter.PNG?ex=6621a19f&is=660f2c9f&hm=68a9f2c34844eafc16701afe11ae6ad7f8f1ff14241e4e0e639750c2095683fc&',
        'infoUrl': 'https://open5e.com/classes/fighter'
    },
    'monk': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576049878896773/Monk.PNG?ex=6621a1a4&is=660f2ca4&hm=04f02420dec2716c4ab32d0181f33cac5d8e8e0447fb86fabedb1a1f59165e36&',
        'infoUrl': 'https://open5e.com/classes/monk'
    },
    'paladin': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576183765143662/Paladin.PNG?ex=6621a1c4&is=660f2cc4&hm=ed0ba49bf9ebc0632872b82ff75fdac6622b0545dd6a550b7bd5f7f184ece80c&',
        'infoUrl': 'https://open5e.com/classes/paladin'
    },
    'ranger': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576211955056701/Range.PNG?ex=6621a1cb&is=660f2ccb&hm=f0b6152a01fc46d99a895f086d7c1dafa57553fde89028d84045b4a9b84f65dd&',
        'infoUrl': 'https://open5e.com/classes/ranger'
    },
    'rogue': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576233958510776/Rogue.PNG?ex=6621a1d0&is=660f2cd0&hm=fd404483bbfa5f8fbde5f9d48a3268ec82abe8c86c705d93d21d3a7464757060&',
        'infoUrl':'https://open5e.com/classes/rogue'
    },
    'sorcerer': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576257195085904/Sorcerer.PNG?ex=6621a1d5&is=660f2cd5&hm=8234fa9565d0d27b8df8cb09bec95fb0e559b57955b398593de21b06ca95a584&',
        'infoUrl': 'https://open5e.com/classes/sorcerer'
    },
    'warlock': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576268058333224/Warlock.PNG?ex=6621a1d8&is=660f2cd8&hm=cda50a17705530e0c3c26fc7c2f78620a437f1768bc675f5062289fd95c5e6d4&',
        'infoUrl':'https://open5e.com/classes/warlock'
    },
    'wizard': {
        'levelTable': 'https://cdn.discordapp.com/attachments/1225567411390906398/1225576285997367336/Wizard.PNG?ex=6621a1dc&is=660f2cdc&hm=daa871621107b2ef8c5414ab9de800979f0d16ad669f9bcf73c3e21c52a0aff9&',
        'infoUrl': 'https://open5e.com/classes/wizard'
    },
};


const interactionPageMap = new Map();


// Event handler for when a slash command is received
client.on('interactionCreate', async interaction => {
    if (!interaction.isCommand()) return;

    // Check if command is 'roll'
    if (interaction.commandName === 'roll'){

        // Extract the options from the interaction
        const diceNotation = interaction.options.getString('dice');

        // Parse the dice notation
        const match = diceNotation.match(/^(\d*)d(\d+)([+\-]\d+)?$/);        
        if (!match) {
            await interaction.reply("Invalid format. Try using the following format: /roll 2d6.");
            return;
        }

        let numDice = 1;
        let diceType = parseInt(match[2]);
        let modifier = match[3] ? parseInt(match[3]) : 0;

        // If match[1] is not an empty string parse it as an int
        if (match[1] !== '') {
            numDice = parseInt(match[1]);
        }

        // Roll the dice
        let total = 0;
        let rolls = [];
        for (let i = 0; i < numDice; i++) {
            const roll = Math.floor(Math.random() * diceType) + 1;
            rolls.push(roll);
            total += roll;
        }

        total += modifier;

        // Send the result to the user
        await interaction.reply(`🎲 **You rolled ${numDice}d${diceType}${modifier !== 0 ? match[3] : ''}: [${rolls.join(', ')}] = ${total}**`);
        } else if (interaction.commandName === 'music') {
        const musicEmbed = {
            color: 0x6c3365,
            title: '**Tabletop Audio**',
            description: 'Want **AMAZING** music for your adventure?! 🎵\nTabletop Audio offers a wide range of ambience and music to choose from!',
            url: 'https://tabletopaudio.com/',
            image: {
                url: 'https://images.tabletopaudio.com/og_tta_main_2a.jpg',
            },
            fields: [
                {
                    name: 'Follow a simple tutorial on my site!', 
                    value: 'URL', 
                }
            ],
            timestamp: new Date(),
            footer: {
                text: 'Check it out now!',
            },
        };

        interaction.reply({ embeds: [musicEmbed]});
    }else if (interaction.commandName === 'class'){
        let className = interaction.options.getString('name');
        className = className.toLowerCase();
        try {
            const response = await fetch(`https://api.open5e.com/classes/${className}`);
            if (!response.ok) {
                throw new Error(`Class "${className}" not found.`);
            }
            const data = await response.json();
            
            // Extract relevant information
            const name = data.name;
            const hitDice = data.hit_dice;
            const hpAtFirstLevel = data.hp_at_1st_level;
            const hpAtHigherLevels = data.hp_at_higher_levels;
            let spellcastingAbility = data.spellcasting_ability;
            if (spellcastingAbility === "") {
                spellcastingAbility = 'None';
            }

            const proficientArmor = data.prof_armor;
            const proficientWeapons = data.prof_weapons;
            const proficientSkills = data.prof_skills;
            const savingThrows = data.prof_saving_throws;
            const { levelTable, infoUrl } = classUrls[className];

            // Create embed
            const classEmbed = {
                color: 0xf44336,
                title: `**${name.toUpperCase()}**\n`,
                author: {
                    name: `${name} Info`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                    url: infoUrl,
                },
                description: `**Hit Dice:** ${hitDice}\n\n**HP At First Level:** \n${hpAtFirstLevel}\n\n**HP At Higher Levels:** \n${hpAtHigherLevels}`, 
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                },
                fields: [
                    {
                        name: '\u200b',
                        value: `✨ **Spell Casting Ability:** \`\`\`css\n${spellcastingAbility}\n\`\`\``,
                    },
                    {
                        name: '\u200b',
                        value: `⚔️ **Weapon Proficiency:** \`\`\`css\n${proficientWeapons}\n\`\`\``,
                    },
                    {
                        name: '\u200b',
                        value: `🛡️ **Armor Proficiency:** \`\`\`css\n${proficientArmor}\n\`\`\``,
                    },
                    {
                        name: '\u200b',
                        value: `🎯 **Skill Proficiency:** \`\`\`css\n${proficientSkills}\n\`\`\``,
                    },
                    {
                        name: '\u200b',
                        value: `🎲 **Saving Throws:** \`\`\`css\n${savingThrows}\n\`\`\``,
                    },
                    {
                        name: '\u200b',
                        value: `⬆️ **Leveling Table:**`,
                    },
                ],
                image: {
                    url: levelTable,
                    height: 1920,
                    width: 1080,
                },
                timestamp: new Date(),
                footer: {
                    text: 'For more information, check out Open5e (Click "Info" Above!)',
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                },
            };

            // Send embed
            await interaction.reply({ embeds: [classEmbed] });
        } catch (error) {
            console.error('Error fetching class information:', error);
            await interaction.reply(`An error occurred while fetching class information: ${error.message}`);
        }
    }else if (interaction.commandName === 'class_list'){
    
        const classResponse = await fetch(`https://api.open5e.com/classes/`); 
        const classData = await classResponse.json();
        
        // Extract the class names and join them together
        const classNames = classData.results.map(classItem => `• ${classItem.name}`).join('\n');

        const classListEmbed = {
            color: 0xf44336,
            title: `List of Classes`,
            author: {
                name: `Class List`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: 'https://open5e.com/classes',
            },
            description: `For more information on a class **try /class 'name'!**`,
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: '',
                    value: `\`\`\`css\n${classNames}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'All information is from Open5e',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Send embed
        await interaction.reply({ embeds: [classListEmbed] });
    }else if (interaction.commandName === "monster")
    {
        let monsterName = interaction.options.getString('name');
        monsterName = monsterName.toLowerCase().replace(/:/g, ': ').replace(/,\s*/g, '-').replace(/\s+/g, '-');

        const response = await fetch(`https://api.open5e.com/monsters/${monsterName}`);
        const data = await response.json();

        // Check if the data object contains the expected properties
        if (!data || !data.name) {
        await interaction.reply("Monster not found.");
        return;
        }

        const monsName = data.name;
        const size = data.size;
        const armor_class = data.armor_class;
        const hit_points = data.hit_points;
        const speed = data.speed;
        const strength = data.strength;
        const dexterity = data.dexterity;
        const constitution = data.constitution;
        const intelligence = data.intelligence;
        const wisdom = data.wisdom;
        const charisma = data.charisma;
        const strength_save = data.strength_save;
        const dexterity_save = data.dexterity_save;
        const constitution_save = data.constitution_save;
        const intelligence_save = data.intelligence_save;
        const wisdom_save = data.wisdom_save;
        const charisma_save = data.charisma_save;
        const actions = data.actions;
        const bonus_actions = data.bonus_actions;
        const reactions = data.reactions;
        const legendary_actions = data.legendary_actions;
        const challenge_rating = data.challenge_rating;
        const spell_list = data.spell_list;
        let monsterUrl = data.img_main;
        if (!monsterUrl) {
             monsterUrl = 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&';
        }
    
        // Construct the monster embed
        const monsterEmbed = {
            color: 0xf44336,
            title: `${monsName}`,
            author: {
                name: `${monsName} Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/monsters/${monsterName}`,
            },
            thumbnail: {
                url: monsterUrl,
            },
            description: `**Challenge Rating:** ${challenge_rating}\n**Size:** ${size}\n**Armor Class:** ${armor_class}\n**Hit Points:** ${hit_points}\n**Speed:** ${speed.walk} ft.${speed.swim ? ` (swim ${speed.swim} ft.)` : ''}`,
            fields: [
                { 
                    name: 'Attributes', 
                    value: `**\`\`\`css\n \nStr ${strength} Dex ${dexterity} Con ${constitution} Int ${intelligence} Wis ${wisdom} Cha ${charisma}     \u200B\n\`\`\`**`, 
                },
                { 
                    name: 'Saves', 
                    value: `**\`\`\`css\nStrength ${strength_save || 'N/A'}\nDexterity ${dexterity_save || 'N/A'}\nConstitution ${constitution_save || 'N/A'}\nIntelligence ${intelligence_save || 'N/A'}\nWisdom ${wisdom_save || 'N/A'}\nCharisma ${charisma_save || 'N/A'} \u200B\n\`\`\`**`, 
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'For more information click on "Info" above!',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Add actions, bonus actions, and reactions if they exist
        if (actions && actions.length > 0) {
            monsterEmbed.fields.push({
                name: 'Actions (For more info, click "Info" above)',
                value: actions.map(action => `\`\`\`css\n${action.name}\n\`\`\``).join('')
            });
        }

        if (bonus_actions && bonus_actions.length > 0) {
            monsterEmbed.fields.push({
                name: 'Bonus Actions',
                value: bonus_actions.map(action => `\`\`\`css\n${action.name}: ${action.desc}\n\`\`\``).join('')
            });
        }

        if (reactions && reactions.length > 0) {
            monsterEmbed.fields.push({
                name: 'Reactions',
                value: reactions.map(action => `\`\`\`css\n${action.name}: ${action.desc}\n\`\`\``).join('')
            });
        }
        if (legendary_actions && legendary_actions.length > 0) {
            monsterEmbed.fields.push({
                name: "**Legendary Actions** (One per end of another creature's turn. Regained at start of its turn.)",
                value: legendary_actions.map(legendary_action => `\`\`\`css\n${legendary_action.name}: ${legendary_action.desc}\n\`\`\``).join('')
            });
        }

        await interaction.reply({ embeds: [monsterEmbed] });
    } else if (interaction.commandName === "random_encounter") {

        let randomEncounter = interaction.options.getString('challenge_rating');
        randomEncounter = fractionalToDecimal(randomEncounter);

       // Check if the randomEncounter is within the valid range
        if (![0, 0.125, 0.25, 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].includes(randomEncounter)) {
            interaction.reply("Please enter a valid challenge rating");
            return; 
        }

       // Fetch the total count of monsters for the specified challenge rating
       const totalCountResponse = await fetch(`https://api.open5e.com/monsters/?cr=${randomEncounter}`);
       const totalCountData = await totalCountResponse.json();
   
       // Extract the total count of monsters
       const totalCount = totalCountData.count;
   
       // Calculate the total number of pages
       const totalPages = Math.ceil(totalCount / 50); 
       
   
       // Pick a random page number from the range of available pages
       const randomPageNumber = Math.floor(Math.random() * totalPages) + 1;
   
       // Fetch monsters for the randomly chosen page
       const response = await fetch(`https://api.open5e.com/monsters/?cr=${randomEncounter}&page=${randomPageNumber}`);
       const data = await response.json();
   
       // Check if the page exists and contains monster names
       if (data.results && data.results.length > 0) {
           // Choose a random monster from the results
           const randomIndex = Math.floor(Math.random() * data.results.length);
           const randomName = data.results[randomIndex].name;
           const lowerRandomName = randomName.toLowerCase().replace(/:/g, ':-').replace(/,\s*/g, '-').replace(/\s+/g, '-');
        const randomEncounterEmbed = {
            color: 0xf44336,
            title: `**❗ RANDOM ENCOUNTER ❗**`,
            author: {
                name: `Monster Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/monsters/${lowerRandomName}`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                { 
                    name: 'Monster:', 
                    value: `\`\`\`css\n\n${randomName}\n\n\`\`\``, 
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `Now try "/monster ${lowerRandomName}"!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
    
           await interaction.reply({ embeds: [randomEncounterEmbed] });
       } else {
           // If no monsters are found on the randomly chosen page, reply with an error message
           interaction.reply("Unable to find a random encounter. Please try again later.");
       }
    } else if (interaction.commandName === "spell_list") {

        let className = interaction.options.getString('classname');
        lowerClassName = className.toLowerCase();
        className = className.split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');    

        // Fetch the spells for the specified class
        const listResponse = await fetch(`https://api.open5e.com/v1/spelllist/${lowerClassName}`);
        const listData = await listResponse.json();

        // Check if the class has a spell list
        if (!listData.spells || listData.spells.length === 0) {
        await interaction.reply({ content: `The class ${className} has no spell list.`, ephemeral: true });
        return;
        }

        const class_name = listData.name;
        let spells = listData.spells;

        spells = spells.map(spell => spell.toLowerCase().split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '));


        // Paginate the spells
        const pageSize = 15; // Number of spells per page
        const pages = [];
        for (let i = 0; i < spells.length; i += pageSize) {
        const pageSpells = spells.slice(i, i + pageSize);
        pages.push(pageSpells);
        }

        let currentPage = 0;

        // Function to generate embed for current page
        function generateEmbed() {
            const spellListEmbed = {
                color: 0xf44336,
                title: `**Spell List**`,
                author: {
                    name: `${className} Info`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                    url: `https://open5e.com/spells/by-class/${lowerClassName}`,
                },
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                },
                fields: [
                    {
                        name: `${className} - Page ${currentPage + 1}/${pages.length}`,
                        value: pages[currentPage].join('\n'),
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: `Try /spell 'name' for more info!`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                },
            };
            return spellListEmbed;
        }
        // Button logic 
        const prevButton = new ButtonBuilder()
            .setCustomId('prev_button')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary)

        const nextButton = new ButtonBuilder()
            .setCustomId('next_button')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary)
  

        const buttonRow = new ActionRowBuilder().addComponents(prevButton, nextButton);

        try {
            // Send the initial embed with buttons
            let initialReply = await interaction.reply({ embeds: [generateEmbed()], components: [buttonRow] });
        
            // Interaction event for handling button clicks
            const collector = initialReply.createMessageComponentCollector({ componentType: ComponentType.BUTTON, time: 60000 });
        

            collector.on('collect', async (button) => {
                if (initialReply.id === interaction.id) {
                    if (button.customId === 'prev_button' && currentPage > 0) {
                        currentPage--;
                        await interaction.editReply({ embeds: [generateEmbed()] });
                    } else if (button.customId === 'next_button' && currentPage < pages.length - 1) {
                        currentPage++;
                        await interaction.editReply({ embeds: [generateEmbed()] });
                    }
        
                    await button.deferUpdate();
                }
                else{
                    console.log(interaction.id);
                    console.log(buttonInteraction.id);
                    console.log(initialReply.id);
                    return;
                }
            });
        } catch (error) {
            console.error('Error occurred while sending or processing initial reply:', error);
        }

    } else if (interaction.commandName === "spell") {

        const spellName = interaction.options.getString('spell_name');
        lowerSpellName = spellName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, '');

        // Fetch the spells information
        try {
            const spellResponse = await fetch(`https://api.open5e.com/v1/spells/${lowerSpellName}`);
            const spellData = await spellResponse.json();

            // Check if the data object contains the expected properties
            if (!spellData || !spellData.name) {
                await interaction.reply("Spell not found.");
                return;
            }

            const spell_name = spellData.name;
            const description = spellData.desc;
            const at_higher_level = spellData.higher_level;
            const rangeofspell = spellData.range;
            const components_needed = spellData.components;
            const ritual_needed = spellData.ritual;
            const duration_of_spell = spellData.duration;
            const concentration_needed = spellData.concentration;
            const castingTime = spellData.casting_time;
            const spellLevel = spellData.spell_level;

            const spellEmbed = {
                color: 0xf44336,
                title: `**${spell_name}**`,
                author: {
                    name: `${spell_name} Info`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                    url: `https://open5e.com/spells/${lowerSpellName}`,
                },
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                },
                description: `${description}\n${at_higher_level}`,
                fields: [
                    {
                        name: 'Spell Level:',
                        value: `\`\`\`css\n${spellLevel}\n\`\`\``,
                    },
                    {
                        name: 'Range:',
                        value: `\`\`\`css\n${rangeofspell}\n\`\`\``,
                    },
                    {
                        name: 'Concentration Needed?:',
                        value: `\`\`\`css\n${concentration_needed}\n\`\`\``,
                    },
                    {
                        name: 'Duration:',
                        value: `\`\`\`css\n${duration_of_spell}\n\`\`\``,
                    },
                    {
                        name: 'Casting Time:',
                        value: `\`\`\`css\n${castingTime}\n\`\`\``,
                    },
                    {
                        name: 'Ritual Needed?:',
                        value: `\`\`\`css\n${ritual_needed}\n\`\`\``,
                    },
                    {
                        name: 'Components:',
                        value: `\`\`\`css\n${components_needed}\n\`\`\``,
                    },

                ],
                timestamp: new Date(),
                footer: {
                    text: 'For more information click on "Info" above!',
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                },
            };

            await interaction.reply({ embeds: [spellEmbed] });
         } catch (error) {
            console.error("Error fetching spell data:", error);
            await interaction.reply("An error occurred while fetching spell data.");
        }
    } else if (interaction.commandName === "random_spell") {

        // Fetch the total count of spells
        const totalCountSpellResponse = await fetch(`https://api.open5e.com/v1/spells`);
        const totalCountSpellData = await totalCountSpellResponse.json();

        // Extract the total count of spells
        const totalCount = totalCountSpellData.count;

        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / 50);

        // Pick a random page number from the range of available pages
        const randomPageNumber = Math.floor(Math.random() * totalPages) + 1;

        // Fetch spells for the randomly chosen page
        const pageResponse = await fetch(`https://api.open5e.com/v1/spells/?page=${randomPageNumber}`);
        const pageData = await pageResponse.json();

        // Check if the page exists and contains spell names
        if (pageData.results && pageData.results.length > 0) {
            // Choose a random spell from the results
            const randomIndex = Math.floor(Math.random() * pageData.results.length);
            const randomName = pageData.results[randomIndex].name;
            const lowerRandomName = randomName.toLowerCase().replace(/ /g, '-');
            const randomSpellEmbed = {
                color: 0xf44336,
                title: `**⭐ RANDOM SPELL ⭐**`,
                author: {
                    name: `Spell Info`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                    url: `https://open5e.com/spells/${lowerRandomName}`,
                },
                thumbnail: {
                    url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                },
                fields: [
                    {
                        name: 'Spell:',
                        value: `\`\`\`css\n\n${randomName}\n\n\`\`\``,
                    },
                ],
                timestamp: new Date(),
                footer: {
                    text: `Now try "/spell ${randomName}"!`,
                    icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                },
            };

            await interaction.reply({ embeds: [randomSpellEmbed] });
        } else {
            // If no spells are found on the randomly chosen page, reply with an error message
            await interaction.reply("Unable to find a random spell. Please try again later.");
        }
    } else if (interaction.commandName === "equipment") {

        try {
            // Fetch all armor and weapons
            const armorResponse = await fetch('https://api.open5e.com/v1/armor/');
            const armorData = await armorResponse.json();
            const weaponResponse = await fetch('https://api.open5e.com/v1/weapons/');
            const weaponData = await weaponResponse.json();
            const weaponResponseTwo = await fetch('https://api.open5e.com/v1/weapons/?page=2');
            const weaponDataTwo = await weaponResponseTwo.json();

            
            // Check if armor and weapon data are available
            if (!armorData.results || armorData.results.length === 0 || !weaponData.results || weaponData.results.length === 0 || !weaponDataTwo.results || weaponDataTwo.results.length === 0 ) {
                await interaction.reply({ content: "No gear found.", ephemeral: true });
                return;
            }
    
            // Extract armor and weapon names
            const armorList = armorData.results.map(armor => `Armor: ${armor.name}`);
            const weaponList = weaponData.results.map(weapon => `Weapon: ${weapon.name}`);
            const weaponListTwo = weaponDataTwo.results.map(weapon => `Weapon: ${weapon.name}`);
    
    
            // Combine armor and weapon lists
            const gearList = [...armorList, ...weaponList, ...weaponListTwo];
    
            // Paginate the gear list
            const itemPageSize = 15; // Number of items per page
            const itemPages = [];
            for (let i = 0; i < gearList.length; i += itemPageSize) {
                const pageItems = gearList.slice(i, i + itemPageSize);
                itemPages.push(pageItems);
            }
    
            let itemCurrentPage = 0;
    
            // Function to generate embed for current page
            function generateEmbed() {
                const gearListEmbed = {
                    color: 0xf44336,
                    title: `**Gear List** - Page ${itemCurrentPage + 1}/${itemPages.length}`,
                    author: {
                        name: `List of Gear`,
                        icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                        url: `https://open5e.com/equipment`,
                    },
                    thumbnail: {
                        url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                    },
                    description: `\`\`\`css\n\n${itemPages[itemCurrentPage].join('\n')}\n\n\`\`\``,
                    timestamp: new Date(),
                    footer: {
                        text: "Now try /weapon or /armor!",
                        icon_url: "https://avatars.githubusercontent.com/u/16998072?s=200&v=4"
                    }
                };
                return gearListEmbed;
            }
    
            // Button Logic
            const previousButton = new ButtonBuilder()
                .setCustomId('previous_button')
                .setLabel('Previous')
                .setStyle(ButtonStyle.Primary);
    
            const proceedButton = new ButtonBuilder()
                .setCustomId('proceed_button')
                .setLabel('Next')
                .setStyle(ButtonStyle.Primary);
    
    
            const gearButtonRow = new ActionRowBuilder().addComponents(previousButton, proceedButton);
    
            // Send the initial embed with buttons
            let gearReply = await interaction.reply({ embeds: [generateEmbed()], components: [gearButtonRow] });
    
            // Interaction event for handling button clicks
            const itemCollector = gearReply.createMessageComponentCollector({ componentType: ComponentType.BUTTON, time: 60000 });
    
            itemCollector.on('collect', async button => {
                if (gearReply.id === interaction.id) {
                    if (button.customId === 'previous_button' && itemCurrentPage > 0) {
                        itemCurrentPage--;
                        await interaction.editReply({ embeds: [generateEmbed()]});
                    } else if (button.customId === 'proceed_button' && itemCurrentPage < itemPages.length - 1) {
                        itemCurrentPage++;
                        await interaction.editReply({ embeds: [generateEmbed()]});
                    }
                    await button.deferUpdate();
                }
                });
        } catch (error) {
            console.error("Error fetching gear data:", error);
            await interaction.reply({ content: "An error occurred while fetching gear data.", ephemeral: true });
        }
    }else if (interaction.commandName === "weapon") {

        let weaponName = interaction.options.getString('name');
        weaponName = weaponName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const weaponSingleResponse = await fetch(`https://api.open5e.com/v1/weapons/${weaponName}`);
        const weaponSingleData = await weaponSingleResponse.json();

        // Check if the data object contains the expected properties
        if (!weaponSingleData || !weaponSingleData.name) {
            await interaction.reply("Weapon Not Found. Try /equipment");
            return;
        }
        
        const name = weaponSingleData.name;
        const category = weaponSingleData.category;
        const cost = weaponSingleData.cost;
        const damage = weaponSingleData.damage_dice;
        const damageType = weaponSingleData.damage_type;
        const property = weaponSingleData.properties;

        const weaponEmbed = {
            color: 0xf44336,
            title: `**⚔️ ${name} ⚔️**`,
            author: {
                name: `Weapon Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/equipment/weapons`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: 'Category',
                    value: `\`\`\`css\n\n${category}\n\n\`\`\``,
                },
                {
                    name: 'Damage',
                    value: `\`\`\`css\n\n${damage}\n${damageType}\n\`\`\``,
                },
                {
                    name: 'Special Properties',
                    value: `\`\`\`css\n\n${property}\n\n\`\`\``,
                },
                {
                    name: 'Cost',
                    value: `\`\`\`css\n\n${cost}\n\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        await interaction.reply({ embeds: [weaponEmbed] });
    } else if (interaction.commandName === "armor") {

        let armorName = interaction.options.getString('type');
        armorName = armorName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const armorSingleResponse = await fetch(`https://api.open5e.com/v1/armor/${armorName}`);
        const armorSingleData = await armorSingleResponse.json();

        // Check if the data object contains the expected properties
        if (!armorSingleData || !armorSingleData.name) {
            await interaction.reply("Weapon Not Found. Try /equipment");
            return;
        }
        
        const name = armorSingleData.name;
        const category = armorSingleData.category;
        const armorCost = armorSingleData.cost;
        const baseAC = armorSingleData.base_ac;
        const acString = armorSingleData.ac_string;
        const strengthRequirement = armorSingleData.strength_requirement;
        const stealth = armorSingleData.stealth_disadvantage;
        

        const armorEmbed = {
            color: 0xf44336,
            title: `**⚔️ ${name} ⚔️**`,
            author: {
                name: `Armor Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/equipment/armor`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: 'Category',
                    value: `\`\`\`css\n\n${category}\n\n\`\`\``,
                },
                {
                    name: 'AC',
                    value: `\`\`\`css\n\nBase: ${baseAC}\nString: ${acString}\n\`\`\``,
                },
                {
                    name: 'Stealth Disadvantage',
                    value: `\`\`\`css\n\n${stealth}\n\n\`\`\``,
                },
                {
                    name: 'Strength Requirement',
                    value: `\`\`\`css\n\n${strengthRequirement}\n\n\`\`\``,
                },
                {
                    name: 'Cost',
                    value: `\`\`\`css\n\n${armorCost}\n\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [armorEmbed] });
    } else if (interaction.commandName === "magic_items_list") {

        const magicItemsEmbed = {
            color: 0xf44336,
            title: `** Magic Items**`,
            author: {
                name: `Magic Items Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/magic-items`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                { 
                    name: 'Check out all the magic items here:', 
                    value: `https://open5e.com/magic-items`, 
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `Now try "/magic_item 'name' or /shop"!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
    
           await interaction.reply({ embeds: [magicItemsEmbed] });
    }else if (interaction.commandName === "magic_item") {
        
        let magicName = interaction.options.getString('name');
        magicName = magicName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const magicItemResponse = await fetch(`https://api.open5e.com/v1/magicitems/${magicName}`);
        const magicItemData = await magicItemResponse.json();

        // Check if the data object contains the expected properties
        if (!magicItemData || !magicItemData.name) {
            await interaction.reply("Item Not Found. Try /equipment");
            return;
        }
        
        const name = magicItemData.name;
        const type = magicItemData.type;
        let description = magicItemData.desc;
        if (description.length > 3000) {
            description = "Description too long please click 'Info' above."
        }

        const rarity = magicItemData.rarity;
        let requirements = magicItemData.requires_attunement;
        if (requirements === "") {
            requirements = "No"
        }

        const magicItemEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Item Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/magic-items/${magicName}`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: `\`\`\`${description}\n\`\`\``,
            fields: [
                {
                    name: 'Type',
                    value: `\`\`\`css\n\n${type}\n\n\`\`\``,
                },
                {
                    name: 'Rarity',
                    value: `\`\`\`css\n\n${rarity}\n\`\`\``,
                },
                {
                    name: 'Requires Attunement?',
                    value: `\`\`\`css\n\n${requirements}\n\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [magicItemEmbed] });
    } else if (interaction.commandName === "shop") {

        const desiredItemCount = 5;
        let randomItems = [];
    
        // Rarity to emoji mapping
        const rarityEmojis = {
            common: '⚪',
            'common ': '⚪',
            Common: '⚪', 
            uncommon: '🟢',
            Uncommon: '🟢', 
            rare: '🔵', 
            Rare: '🔵', 
            'very rare': '🟣', 
            'Very Rare': '🟣', 
            legendary: '🟡',
            Legendary: '🟡',
            Artifact: '⭐',
            'varies': '❓',
            'Varies': '❓',
            'rarity varies': '❓',
            'Rarity Varies': '❓',
            'uncommon, rare, very rare': '❓',
            undefined: '❓'
        };
    
        // Fetch the total count of magic items
        const shopResponse = await fetch(`https://api.open5e.com/v1/magicitems`);
        const shopData = await shopResponse.json();
    
        // Extract the total count of items
        const totalCount = shopData.count;
    
        // Calculate the total number of pages
        const totalPages = Math.ceil(totalCount / 50);
    
        // Fetch items until we have accumulated 5 items
        while (randomItems.length < desiredItemCount) {
            // Pick a random page number from the range of available pages
            const randomPageNumber = Math.floor(Math.random() * totalPages) + 1;
    
            // Fetch items for the randomly chosen page
            const shopPageResponse = await fetch(`https://api.open5e.com/v1/magicitems/?page=${randomPageNumber}`);
            const shopPageData = await shopPageResponse.json();
    
            // Check if the page exists and contains item names
            if (shopPageData.results && shopPageData.results.length > 0) {
                // Choose random items from the results and add them to the list
                const randomIndex = Math.floor(Math.random() * shopPageData.results.length);
                const item = shopPageData.results[randomIndex];
                // Construct the string including rarity emoji and cost
                const rarityEmoji = rarityEmojis[item.rarity] || rarityEmojis.undefined;
                const itemString = `${rarityEmoji} ${item.name}`;
                randomItems.push(itemString);
            }
        }
    
        const shopEmbed = {
            color: 0xf44336,
            title: `**🛒 MAGIC ITEM SHOP 🛒**`,
            author: {
                name: `Magic Items`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/magic-items`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: "\`\`\`css\nCommon: ⚪\nUncommon: 🟢\nRare: 🔵\nVery Rare: 🟣\nLegendary: 🟡\nArtifact: ⭐\nVaries:❓\n\`\`\`",
            fields: [
                {
                    name: 'Items:',
                    value: `\`\`\`css\n\n• ${randomItems.join('\n\n• ')}\n\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `Now try "/magic_item"!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
    
        await interaction.reply({ embeds: [shopEmbed] });
    } else if (interaction.commandName === "feat_list") {

        try {
            // Fetch all feats
            const featListResponse = await fetch('https://api.open5e.com/v1/feats/');
            const featListData = await featListResponse.json();


            const totalCount = featListData.count; // Extract the total count of feats
    
            // Calculate the total number of pages
            const totalPages = Math.ceil(totalCount / 50);

            let featList = [];

            // Extract names from each page
            for (currentPage = 1; currentPage <= totalPages; currentPage++) {
                const featListPageResponse = await fetch(`https://api.open5e.com/v1/feats/?page=${currentPage}`);
                const featListPageData = await featListPageResponse.json();
                
                // Extract feat names
                featList.push(...featListPageData.results.map(feat => `• ${feat.name}`));            
            }

            // Paginate the feat list
            const itemPageSize = 15; // Number of items per page
            const itemPages = [];
            for (let i = 0; i < featList.length; i += itemPageSize) {
                const pageItems = featList.slice(i, i + itemPageSize);
                itemPages.push(pageItems);
            }
            
            let featCurrentPage = 0;

            function generateEmbed() {
                const featListEmbed = {
                    color: 0xf44336,
                    title: `**✨ Feat List ✨ Page ${featCurrentPage + 1}/${itemPages.length}**`,
                    author: {
                        name: `List of Feats`,
                        icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                        url: `https://open5e.com/feats`,
                    },
                    thumbnail: {
                        url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                    },
                    description: `\`\`\`css\n\n${itemPages[featCurrentPage].join('\n')}\n\n\`\`\``,                
                    timestamp: new Date(),
                    footer: {
                        text: "Now try /feat 'name'!",
                        icon_url: "https://avatars.githubusercontent.com/u/16998072?s=200&v=4"
                    }
                };
                return featListEmbed;
            };
    
            // Button Logic
            const featPreviousButton = new ButtonBuilder()
            .setCustomId('featprevious_button')
            .setLabel('Previous')
            .setStyle(ButtonStyle.Primary);

            const featProceedButton = new ButtonBuilder()
            .setCustomId('featproceed_button')
            .setLabel('Next')
            .setStyle(ButtonStyle.Primary);

            const gearButtonRow = new ActionRowBuilder().addComponents(featPreviousButton, featProceedButton);

            // Send the initial embed with buttons
            let featReply = await interaction.reply({ embeds: [generateEmbed()], components: [gearButtonRow] });

            // Interaction event for handling button clicks
            const featCollector = featReply.createMessageComponentCollector({ componentType: ComponentType.BUTTON, time: 60000 });

            featCollector.on('collect', async button => {
                if (featReply.id === interaction.id)
                {
                    if (button.customId === 'featprevious_button' && featCurrentPage > 0) {
                        featCurrentPage--;
                        await interaction.editReply({ embeds: [generateEmbed()]});
                    } else if (button.customId === 'featproceed_button' && featCurrentPage < itemPages.length - 1) {
                        featCurrentPage++;
                        await interaction.editReply({ embeds: [generateEmbed()]});
                    }
                    await button.deferUpdate();
                }
                });
        } catch (error) {
            console.error("Error fetching feat data:", error);
            await interaction.reply({ content: "An error occurred while fetching feat data.", ephemeral: true });
        }
    } else if (interaction.commandName === "feat") {

        let featName = interaction.options.getString('name');
        featName = featName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const featResponse = await fetch(`https://api.open5e.com/v1/feats/${featName}`);
        const featData = await featResponse.json();

        // Check if the data object contains the expected properties
        if (!featData || !featData.name) {
            await interaction.reply("Feat Not Found. Try /feat_list");
            return;
        }
        
        const name = featData.name;
        let description = featData.desc;
        if (description.length > 3000) {
            description = "Description too long please click 'Info' above."
        }
        const preReq = featData.prerequisite;
        let effects = featData.effects_desc;
        if (effects.length === 0) {
            effects = "N/A";
        }

        const featEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Feat Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/magic-items/${featName}`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: `\`\`\`${description}\n\`\`\``,
            fields: [
                {
                    name: 'Prerequisites',
                    value: `\`\`\`css\n\n${preReq}\n\n\`\`\``,
                },
                {
                    name: 'Effects',
                    value: `\`\`\`css\n\n${effects}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [featEmbed] });
    } else if (interaction.commandName === "gameinfo_list") {
  
        const gameInfoResponse = await fetch(`https://api.open5e.com/sections/`); 
        const gameInfoData = await gameInfoResponse.json();
        
        // Extract the all game mechanics
        const mechanicName = gameInfoData.results.map(infoName => `• ${infoName.name}`).join('\n');

        const gameInfoListEmbed = {
            color: 0xf44336,
            title: `List of Game Mechanics`,
            author: {
                name: `List of Game Information`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: 'https://open5e.com/gameplay-mechanics',
            },
            description: `For information on a game mechanic try /game_info!**`,
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: '',
                    value: `\`\`\`css\n${mechanicName}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'All information from Open5e',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Send embed
        await interaction.reply({ embeds: [gameInfoListEmbed] });
    } else if (interaction.commandName === "game_info") {
   
        let mechanicInfoName = interaction.options.getString('info');
        mechanicInfoName = mechanicInfoName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const mechanicResponse = await fetch(`https://api.open5e.com/v1/sections/${mechanicInfoName}`);
        const mechanicData = await mechanicResponse.json();

        // Check if the data object contains the expected properties
        if (!mechanicData || !mechanicData.name) {
            await interaction.reply("Game Information Not Found. Try /gameinfo_list");
            return;
        }
        
        const name = mechanicData.name;
        let description = mechanicData.desc;
        let truncatedDescription = description; // Initialize truncated description with full description
        if (description.length > 1500) {
            truncatedDescription = description.substring(0, 1500) + "...\n\nDescription too long, for more information, click on 'Info' above!";
        }
        let parentUrl = mechanicData.parent;
        if (parentUrl === "Gameplay Mechanics" ) {
            parentUrl = "https://open5e.com/gameplay-mechanics";
        } else if (parentUrl === "Combat") {
            parentUrl = "https://open5e.com/combat";
        } else if (parentUrl === "Equipment") {
            parentUrl = "https://open5e.com/equipment";
        } else if (parentUrl === "Characters") {
            parentUrl = "https://open5e.com/characters";
        } else if (parentUrl === "Rules") {
            parentUrl = "https://open5e.com/running";
        } else if (parentUrl === "Character Advancement") {
            parentUrl = "https://open5e.com/characters";
        } else if (parentUrl === "Appendix") {
            parentUrl = "https://open5e.com/";
        }else if (parentUrl === "Legal Information") {
            parentUrl = "https://open5e.com/legal";
        }
        
        const gameInfoEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Game Information`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: parentUrl,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: `\`\`\`\n${truncatedDescription}\n\`\`\``,
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [gameInfoEmbed] });
    } else if (interaction.commandName === "race_list") {

        const raceListResponse = await fetch(`https://api.open5e.com/v1/races/`); 
        const raceListData = await raceListResponse.json();
        
        // Extract all races
        const racesName = raceListData.results.map(raceName => `• ${raceName.name}`).join('\n');

        const raceListEmbed = {
            color: 0xf44336,
            title: `Races`,
            author: {
                name: `List of Races`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: 'https://open5e.com/races',
            },
            description: `For information on a game mechanic try /game_info!**`,
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: '',
                    value: `\`\`\`css\n${racesName}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'All information from Open5e',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Send embed
        await interaction.reply({ embeds: [raceListEmbed] });
    } else if (interaction.commandName === "race") {

        let raceName = interaction.options.getString('type');
        raceName = raceName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const raceResponse = await fetch(`https://api.open5e.com/v1/races/${raceName}`);
        const raceData = await raceResponse.json();

        // Check if the data object contains the expected properties
        if (!raceData || !raceData.name) {
            await interaction.reply("Race Not Found. Try /race_list");
            return;
        }
        
        const name = raceData.name;
        let description = raceData.desc;
        description = description.replace(/##/g, '').replace(/Traits/g, 'Description').trim();
        let raceAbilityScore = raceData.asi_desc;
        raceAbilityScore = raceAbilityScore.replace(/Ability Score Increase\./g, '').replace(/\*|_/g, '').replace(/\.\//g, ':').trim();
        let size = raceData.size;
        size = size.replace(/Size\./g, '').replace(/\*|_/g, '').replace(/\.\//g, ':').trim();
        const speed = raceData.speed.walk;
        let languages = raceData.languages;
        languages = languages.replace(/Languages\./g, '').replace(/\*|_/g, '').replace(/\.\//g, ':').trim();
        let traits = raceData.traits;
        traits = traits.replace(/\*|_/g, '').replace(/\.\//g, ':');
        if (traits.length > 1024) {
            traits = "Please click more info for traits";
        }        
        let subraces = raceData.subraces.map(subrace => subrace.name).join(', ');
        if (subraces === "") {
            subraces = "None"
        }

        const raceEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Race Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/races/${raceName}`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: `\`\`\`${description}\n\`\`\``,
            fields: [
                {
                    name: 'Ability Score Increase',
                    value: `\`\`\`css\n\n${raceAbilityScore}\n\n\`\`\``,
                },
                {
                    name: 'Speed',
                    value: `\`\`\`css\n\n${speed}\n\`\`\``,
                },
                {
                    name: 'Size',
                    value: `\`\`\`css\n\n${size}\n\`\`\``,
                },
                {
                    name: 'Languages',
                    value: `\`\`\`css\n\n${languages}\n\`\`\``,
                },
                {
                    name: 'Traits',
                    value: `\`\`\`css\n\n${traits}\n\`\`\``,
                },
                {
                    name: 'Subraces',
                    value: `\`\`\`css\n\n${subraces}\n\`\`\``,
                },
                
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [raceEmbed] });
    } else if (interaction.commandName === "background_list") {

        const backgroundListResponse = await fetch(`https://api.open5e.com/v1/backgrounds/`); 
        const backgroundListData = await backgroundListResponse.json();
        
        // Extract all backgrounds
        const backgroundListName = backgroundListData.results.map(backgroundName => `• ${backgroundName.name}`).join('\n');

        const backgroundListEmbed = {
            color: 0xf44336,
            title: `Backgrounds`,
            author: {
                name: `List of Backgrounds`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: 'https://open5e.com/backgrounds',
            },
            description: `For information on a specific background try /background 'name'!**`,
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: '',
                    value: `\`\`\`css\n${backgroundListName}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'All information from Open5e',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Send embed
        await interaction.reply({ embeds: [backgroundListEmbed] });

    } else if (interaction.commandName === "background") {

        let backgroundName = interaction.options.getString('type');
        backgroundName = backgroundName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const backgroundResponse = await fetch(`https://api.open5e.com/v1/backgrounds/${backgroundName}`);
        const backgroundData = await backgroundResponse.json();

        // Check if the data object contains the expected properties
        if (!backgroundData || !backgroundData.name) {
            await interaction.reply("Background Not Found. Try /background_list");
            return;
        }
        
        const name = backgroundData.name;
        let description = backgroundData.desc;
        description = description.trim();
        let skillProf = backgroundData.skill_proficiencies;
        let languages = backgroundData.languages;
        if (languages === null) {
            languages = "No additional languages."
        }
        let equipment = backgroundData.equipment;

        const backgroundEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Background Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/backgrounds/${backgroundName}`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            description: `\`\`\`${description}\n\`\`\``,
            fields: [
                {
                    name: 'Skill Proficiencies',
                    value: `\`\`\`css\n\n${skillProf}\n\n\`\`\``,
                },
                {
                    name: 'Languages',
                    value: `\`\`\`css\n\n${languages}\n\`\`\``,
                },
                {
                    name: 'Equipment',
                    value: `\`\`\`css\n\n${equipment}\n\`\`\``,
                },         
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [backgroundEmbed] });

    } else if (interaction.commandName === "condition_list") {
        const conditionListResponse = await fetch(`https://api.open5e.com/v1/conditions/`); 
        const conditionListData = await conditionListResponse.json();
        
        // Extract all conditions
        const conditionListName = conditionListData.results.map(conditions => `• ${conditions.name}`).join('\n');

        const ConditionsListEmbed = {
            color: 0xf44336,
            title: `Conditions`,
            author: {
                name: `List of Conditions`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: 'https://open5e.com/conditions',
            },
            description: `For information on a specific condition try /condition 'name'!**`,
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: '',
                    value: `\`\`\`css\n${conditionListName}\n\`\`\``,
                },
            ],
            timestamp: new Date(),
            footer: {
                text: 'All information from Open5e',
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };

        // Send embed
        await interaction.reply({ embeds: [ConditionsListEmbed] });
    } else if (interaction.commandName === "condition") {

        let conditionName = interaction.options.getString('type');
        conditionName = conditionName.toLowerCase().replace(/, /g, '-').replace(/ /g, '-').replace(/[()]/g, ''); 

        const conditionResponse = await fetch(`https://api.open5e.com/v1/conditions/${conditionName}`);
        const conditionData = await conditionResponse.json();

        // Check if the data object contains the expected properties
        if (!conditionData || !conditionData.name) {
            await interaction.reply("Condition Not Found. Try /condition_list");
            return;
        }
        
        const name = conditionData.name;
        let description = conditionData.desc;
        description = description.trim();

        const conditionEmbed = {
            color: 0xf44336,
            title: `** ${name} **`,
            author: {
                name: `Condition Info`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
                url: `https://open5e.com/running/conditions/`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: 'Description',
                    value: `\`\`\`${description}\n\`\`\``,
                },  
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Info" above!`,
                icon_url: 'https://avatars.githubusercontent.com/u/16998072?s=200&v=4',
            },
        };
        await interaction.reply({ embeds: [conditionEmbed] });

    } else if (interaction.commandName === "charactersheet") {
        const charactersheetEmbed = {
            color: 0x2F5233,
            title: `**Character Sheet**`,
            author: {
                name: `Character Creation`,
                icon_url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                url: `https://www.canva.com/colors/color-palettes/green-blaze/`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            fields: [
                {
                    name: 'Go to my website to create your character!',
                    value: `URL`,
                },  
            ],
            timestamp: new Date(),
            footer: {
                text: `For more information click on "Character Sheet" above!`,
                icon_url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
        };
        await interaction.reply({ embeds: [charactersheetEmbed] });
    } else if (interaction.commandName === "commands") {
        
        const commandsEmbed = {
            color: 0x2F5233,
            title: '**Available Commands**',
            author: {
                name: 'Adventure Assistant',
                icon_url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
                url: `https://www.canva.com/colors/color-palettes/green-blaze/`,
            },
            thumbnail: {
                url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
            url: 'https://tabletopaudio.com/',
            description: "For more information, go to the AdventureAssitant website by clicking the link above!",
            fields: [],
            timestamp: new Date(),
            footer: {
                text: 'For more information click on "Info" above!',
                icon_url: 'https://cdn.discordapp.com/attachments/1225567411390906398/1226243391348539514/Untitled-1.png?ex=66240f26&is=66119a26&hm=75516895249f2821515a272c75f73ba2fb82061a289ecdaa95e92f2b79012935&',
            },
        };
        
        // Limiting the number of commands displayed to 25
        const maxCommands = Math.min(commands.length, 25);
        for (let i = 0; i < maxCommands; i++) {
            commandsEmbed.fields.push({
                name: `\`\`\`\n•/${commands[i].name}\n\`\`\``,
                value: commands[i].description,
                inline: false,
            });
        }


        await interaction.reply({ embeds: [commandsEmbed] });
    }
    
});

// ------ Functions ---------
// Function to convert a fractional string to a decimal
function fractionalToDecimal(input) {
    const fractionPattern = /^\s*(\d+)\s*\/\s*(\d+)\s*$/;
    const decimalPattern = /^\s*([\d.]+)\s*$/;
    
    let match;
    
    // Check if the input is a fraction
    if (fractionPattern.test(input)) {
        match = input.match(fractionPattern);
        const numerator = parseInt(match[1]);
        const denominator = parseInt(match[2]);
        
        return numerator / denominator;
    }
    
    // Check if the input is a decimal
    if (decimalPattern.test(input)) {
        match = input.match(decimalPattern);
        return parseFloat(match[1]);
    }
    
    // If the input doesn't match any pattern, throw an error
    throw new Error('Invalid challenge rating format');
}

// Discord Token
client.login(process.env.TOKEN);