import { Client, GatewayIntentBits, Events, ThreadChannel } from "discord.js";
import fetch from "node-fetch";
import dotenv from "dotenv";
import { scrapeMetadata } from "./lib/scrapeMetadata.js";

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

client.once(Events.ClientReady, () => {
  console.log(`✅ Bot ready as ${client.user?.tag}`);
});

client.on(Events.ThreadCreate, async (thread: ThreadChannel) => {
  try {
    if (thread.parentId !== process.env.FORUM_CHANNEL_ID) return;
    if (thread.type !== 11) return;

    console.log(`🧵 New thread detected: ${thread.name}`);

    const messages = await thread.messages.fetch({ limit: 1 });
    const firstMessage = messages.first();

    if (!firstMessage) {
      console.warn(`⚠️ No message in thread ${thread.id}`);
      return;
    }

    const guild = thread.guild;
    await guild.channels.fetch();
    const tags = thread.appliedTags ?? [];

    let category = "Uncategorized";
    if (tags.length > 0) {
      const forumChannel = await guild.channels.fetch(thread.parentId!);
      if (forumChannel?.isThread()) return;

      // @ts-expect-error
      const availableTags = forumChannel.availableTags || [];
      const matchedTag = availableTags.find((tag: any) => tag.id === tags[0]);

      if (matchedTag) {
        category = matchedTag.name;
      }
    }

    const url = thread.name.trim();

    if (!url.startsWith("http")) {
      console.warn(`⚠️ Skipping invalid URL: ${url}`);
      return;
    }
    const meta = await scrapeMetadata(url);
    if (!meta) return;
    const payload = {
      title: meta.title,
      body: meta.description,
      category,
      url,
      status: "published",
      image: meta.image,
    };

    const res = await fetch(process.env.API_URL!, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.DISCORD_TOKEN}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      console.error(
        `❌ Failed to post to API: ${res.status} ${res.statusText}`
      );
      const errorText = await res.text();
      console.error(errorText);
    } else {
      console.log(`✅ Posted thread ${thread.id} to backend`);
    }
  } catch (err) {
    console.error("💥 Error processing thread:", err);
  }
});

client.login(process.env.DISCORD_TOKEN);
