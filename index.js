// index.js

// Load .env file (DISCORD_TOKEN=...)
require('dotenv').config();
require("./health");

const fs = require("fs");
const { ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");
const xml2js = require("xml2js");

async function loadPronounConfig() {
  const xml = fs.readFileSync("my-discord-pronoun-nickname.xml", "utf8");
  const parsed = await xml2js.parseStringPromise(xml);

  const messageText = parsed.config.message[0].content[0];
  const buttons = parsed.config.buttons[0].button.map(btn => ({
    label: btn.$.label,
    value: btn.$.value
  }));

  return { messageText, buttons };
}

// ⬇️ ADD THIS FUNCTION RIGHT HERE
async function
  
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
} = require('discord.js');

// Create the Discord client with the right intents
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.GuildMember],
});

// The pronoun buttons we will show
// Original sets + your new ones + Clear
function buildPronounRows(buttons) {
  const rows = [];

  // Row 1: she/her, he/him, they/them
  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(buttons[0].value).setLabel(buttons[0].label).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(buttons[1].value).setLabel(buttons[1].label).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(buttons[2].value).setLabel(buttons[2].label).setStyle(ButtonStyle.Primary)
  ));

  // Row 2: she/they, he/they
  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(buttons[3].value).setLabel(buttons[3].label).setStyle(ButtonStyle.Primary),
    new ButtonBuilder().setCustomId(buttons[4].value).setLabel(buttons[4].label).setStyle(ButtonStyle.Primary)
  ));

  // Row 3: any pronouns, ask me, use my name
  rows.push(new ActionRowBuilder().addComponents(
    new ButtonBuilder().setCustomId(buttons[5].value).setLabel(buttons[5].label).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(buttons[6].value).setLabel(buttons[6].label).setStyle(ButtonStyle.Secondary),
    new ButtonBuilder().setCustomId(buttons[7].value).setLabel(buttons[7].label).setStyle(ButtonStyle.Secondary)
  ));

  return rows;
}

  // Special clear button
  { id: 'clear', label: 'Clear pronouns' },
];

const fs = require("fs");
const xml2js = require("xml2js");

async function loadPronounConfig() {
  const xml = fs.readFileSync("my-discord-pronoun-nickname.xml", "utf8");
  const parsed = await xml2js.parseStringPromise(xml);

  const messageText = parsed.config.message[0].content[0];
  const buttons = parsed.config.buttons[0].button.map(btn => ({
    label: btn.$.label,
    value: btn.$.value
  }));

  return { messageText, buttons };
}

// Find a pronoun option by its id
function getPronounById(id) {
  return PRONOUN_OPTIONS.find((p) => p.id === id);
}

// Take names like:
// "Cricket [She/They / Xe/Xem]"  OR  "Cricket (She/They / Xe/Xem)"
// and split into:
// baseName: "Cricket"
// pronouns: ["She/They", "Xe/Xem"]
function splitNameAndPronouns(displayName) {
  // Support both old (parentheses) and new (square brackets) styles
  const match = displayName.match(/^(.*?)(?: [\[(](.+)[)\]])$/);
  if (!match) {
    return { baseName: displayName.trim(), pronouns: [] };
  }
  const baseName = match[1].trim();
  const pronounPart = match[2].trim();
  const pronouns = pronounPart
    ? pronounPart
        .split(' / ')
        .map((p) => p.trim())
        .filter(Boolean)
    : [];
  return { baseName, pronouns };
}

// Take baseName + pronoun list and build the final nickname
// e.g. baseName="Cricket", pronouns=["She/They","Xe/Xem"]
// => "Cricket [She/They / Xe/Xem]"
function buildDisplayName(baseName, pronouns) {
  if (!pronouns.length) return baseName;
  return `${baseName} [${pronouns.join(' / ')}]`;
}

// When the bot logs in
client.once(Events.ClientReady, () => {
  console.log(`Logged in as ${client.user.tag}`);
});
client.once("ready", async () => {
  console.log(`Logged in as ${client.user.tag}`);

  const channelId = process.env.CHANNEL_ID;
  const channel = await client.channels.fetch(channelId);

  const { messageText, buttons } = await loadPronounConfig();
  const rows = buildPronounRows(buttons);

  await channel.send({
    content: messageText,
    components: rows
  });

  console.log("Pronoun buttons posted.");
});


// When any message appears in a guild channel
client.on(Events.MessageCreate, async (message) => {
  // Ignore other bots
  if (message.author.bot) return;

  // Log what the bot sees (for you to know it's working)
  console.log('I saw a message:', message.content);

  // Only react to the exact setup command
  if (message.content.trim() !== '!setup-pronouns') return;

  console.log('setup-pronouns command detected');

  // Build the rows of buttons (max 5 per row)
  const rows = [];
  let currentRow = new ActionRowBuilder();

  PRONOUN_OPTIONS.forEach((opt, index) => {
    if (index > 0 && index % 5 === 0) {
      rows.push(currentRow);
      currentRow = new ActionRowBuilder();
    }

    currentRow.addComponents(
      new ButtonBuilder()
        .setCustomId(`pronoun_${opt.id}`)
        .setLabel(opt.label)
        .setStyle(
          opt.id === 'clear' ? ButtonStyle.Danger : ButtonStyle.Secondary
        )
    );
  });

  if (currentRow.components.length) {
    rows.push(currentRow);
  }

  try {
    await message.channel.send({
      content:
        'Choose your pronouns by clicking the buttons below.\n' +
        'Click again to remove a pronoun.\n' +
        'Use "Clear pronouns" to wipe them all.',
      components: rows,
    });
    console.log('Pronoun buttons message sent.');
  } catch (err) {
    console.error('Failed to send pronoun buttons message:', err);
  }

  // Optional: delete the command message to keep the channel clean
  try {
    await message.delete();
  } catch (err) {
    // It is okay if the bot cannot delete it
  }
});

// Handle button clicks
client.on("interactionCreate", async interaction => {
  if (!interaction.isButton()) return;

  const pronouns = interaction.customId;
  const member = interaction.member;

  // Build new nickname
  const baseName = member.displayName.split(" [")[0];
  const newName = pronouns === "use my name"
    ? baseName
    : pronouns === "ask me"
      ? `${baseName} [Ask Me]`
      : `${baseName} [${pronouns}]`;

  try {
    await member.setNickname(newName);
    await interaction.reply({ content: `Updated your nickname to **${newName}**`, ephemeral: true });
  } catch (err) {
    console.error(err);
    await interaction.reply({ content: "I couldn't update your nickname. Check my permissions.", ephemeral: true });
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isButton()) return;
  if (!interaction.customId.startsWith('pronoun_')) return;

  const pronounId = interaction.customId.replace('pronoun_', '');
  const pronoun = getPronounById(pronounId);

  if (!pronoun) {
    await interaction.reply({
      content: 'Unknown pronoun option.',
      ephemeral: true,
    });
    return;
  }

  const member = interaction.member;
  if (!member) {
    await interaction.reply({
      content: 'Could not find your member data.',
      ephemeral: true,
    });
    return;
  }

  // Check if the bot can change this member's nickname
  if (!member.manageable) {
    await interaction.reply({
      content:
        'I cannot change your nickname (my role is probably too low or you are the server owner).',
      ephemeral: true,
    });
    return;
  }

  // Get the current display name
  const currentName = member.nickname || member.user.username;
  const { baseName, pronouns } = splitNameAndPronouns(currentName);

  let newPronouns = [...pronouns];
  let replyText;

  if (pronoun.id === 'clear') {
    // Special: clear button wipes all pronouns
    newPronouns = [];
    const newName = buildDisplayName(baseName, newPronouns);

    try {
      await member.setNickname(newName, 'Cleared pronouns via pronoun buttons');
      replyText = `Cleared pronouns. Your display name is now: ${newName}`;
      await interaction.reply({
        content: replyText,
        ephemeral: true,
      });
    } catch (err) {
      console.error('Failed to update nickname (clear):', err);
      await interaction.reply({
        content:
          'Failed to clear your pronouns. I may not have permission or my role is too low.',
        ephemeral: true,
      });
    }
    return;
  }

  // Normal pronoun buttons: toggle this pronoun in the list
  const existingIndex = newPronouns.indexOf(pronoun.label);
  if (existingIndex >= 0) {
    // Already there -> remove it
    newPronouns.splice(existingIndex, 1);
  } else {
    // Not there -> add it
    newPronouns.push(pronoun.label);
  }

  const newName = buildDisplayName(baseName, newPronouns);

  try {
    await member.setNickname(newName, 'Updated pronouns via pronoun buttons');

    if (newPronouns.length === 0) {
      replyText = `Cleared pronouns. Your display name is now: ${newName}`;
    } else {
      replyText = `Updated pronouns to: ${newPronouns.join(
        ' / '
      )}\nYour display name is now: ${newName}`;
    }

    await interaction.reply({
      content: replyText,
      ephemeral: true,
    });
  } catch (err) {
    console.error('Failed to update nickname:', err);
    await interaction.reply({
      content:
        'Failed to update your nickname. I may not have permission or my role is too low.',
      ephemeral: true,
    });
  }
});

// Start the bot
client.login(process.env.DISCORD_TOKEN);
