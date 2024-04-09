require('dotenv').config();
const { REST, Routes } = require('discord.js')

const commands = [
    {
        name: "roll", // Must be lower case, No spaces
        description: "Roll Some Dice!",
        options: [      // Give the command options
            {
                name: 'dice',
                description: 'Example: 2d6, d20, or 2d8+10',
                type: 3,
                required: true
            },
        ]
    },
    {
        name: "music", 
        description: "An excellent selection of music from Tabletop Audio!",
    },
    {
        name: "class",
        description: "Display information about a class",
        options: [
            {
                name: 'name',
                description: 'Example: Rogue',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "class_list",
        description: "List of all classes"
    },
    {
        name: "monster",
        description: "Display information about a monster",
        options: [
            {
                name: 'name',
                description: 'Example: Goblin',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "random_encounter",
        description: "Create a random encounter",
        options: [
            {
                name: 'challenge_rating',
                description: '0, 1/8, 1/4, 1/2, 1...30',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "spell_list",
        description: "List of spells for a class",
        options: [
            {
                name: 'classname',
                description: 'Example: Wizard',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "spell",
        description: "Display information about a spell",
        options: [
            {
                name: 'spell_name',
                description: 'Example: Fireball',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "random_spell",
        description: "Generate a random spell",
    },
    {
        name: "equipment",
        description: "Display a list of equipment",
    },
    {
        name: "weapon",
        description: "Display information about a weapon",
        options: [
            {
                name: 'name',
                description: 'Example: Dagger',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "armor",
        description: "Display information about armor",
        options: [
            {
                name: 'type',
                description: 'Example: Armor',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "magic_items_list",
        description: "List of magic items",
    },
    {
        name: "magic_item",
        description: "Display information about a magic item",
        options: [
            {
                name: 'name',
                description: 'Example: Bag of Holding',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "shop",
        description: "Generate a shop with random magic items",
    },
    {
        name: "feat_list",
        description: "List of feats",
    },
    {
        name: "feat",
        description: "Display information about a feat",
        options: [
            {
                name: 'name',
                description: 'Example: Athletic',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "gameinfo_list",
        description: "List of game mechanics and more",
    },
    {
        name: "game_info",
        description: "Display information about a game mechanic and more",
        options: [
            {
                name: 'info',
                description: 'Example: Actions in Combat',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "race_list",
        description: "List of races",
    },
    {
        name: "race",
        description: "Display information about a race",
        options: [
            {
                name: 'type',
                description: 'Example: Elf',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "background_list",
        description: "List of backgrounds",
    },
    {
        name: "background",
        description: "Display information about a background",
        options: [
            {
                name: 'type',
                description: 'Example: Gambler',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "condition_list",
        description: "List of conditions",
    },
    {
        name: "condition",
        description: "Display informatiion about a condition",
        options: [
            {
                name: 'type',
                description: 'Example: Frightened',
                type: 3,
                required: true
            }
        ]
    },
    {
        name: "charactersheet",
        description: "Build your own character sheet on my website!",
    },
    {
        name: "commands",
        description: "List of all commands!",
    },
];

const rest = new REST({version: '10'}).setToken(process.env.TOKEN);

(async () => {
    try{
        console.log('Registering slash commands.');

        await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
            { body: commands }
        )

        console.log('Slash commands were registered successfully!');
    } catch (error) {
        console.log(`There was an error: ${error}`);
    }
})();

module.exports = commands;