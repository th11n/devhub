import { cacheDelPattern } from "@devhub/redis";
import type { Interaction, TextChannel } from "discord.js";
import {
	ActionRowBuilder,
	ButtonBuilder,
	ButtonStyle,
	Client,
	EmbedBuilder,
	GatewayIntentBits,
	ModalBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import { patchResource } from "./sanity";
import { store } from "./store";

export const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

const CID = {
	approve: (messageId: string) => `resource:approve:${messageId}`,
	reject: (messageId: string) => `resource:reject:${messageId}`,
	edit: (messageId: string) => `resource:edit:${messageId}`,
	modalSave: (messageId: string) => `resource:modalSave:${messageId}`,
};

export async function postReviewMessage(resource: {
	id: string;
	title?: string;
	description?: string;
	url?: string;
	logoUrl?: string;
	submittedBy?: string;
	createdAt?: string;
}) {
	if (!process.env.DISCORD_CHANNEL_ID)
		throw new Error("Missing DISCORD_CHANNEL_ID");
	const channel = await client.channels.fetch(process.env.DISCORD_CHANNEL_ID);
	if (!channel || !channel.isTextBased() || !("send" in channel)) {
		throw new Error("Discord channel not found or not text-based");
	}

	const embed = new EmbedBuilder()
		.setTitle(resource.title || "New Resource")
		.setDescription(resource.description || "No description")
		.addFields(
			resource.url
				? { name: "URL", value: resource.url }
				: { name: "URL", value: "—" },
			{ name: "Sanity ID", value: `\`${resource.id}\`` },
			resource.submittedBy
				? { name: "Submitted by", value: resource.submittedBy }
				: { name: "Submitted by", value: "—" },
		)
		.setFooter({ text: "DevHub • Resource review" });

	if (resource.logoUrl) embed.setThumbnail(resource.logoUrl);

	// najpierw wysyłamy placeholder, żeby znać message.id do customId
	const msg = await (channel as TextChannel).send({ embeds: [embed] });

	await store.set(msg.id, resource);

	const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(CID.approve(msg.id))
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(CID.edit(msg.id))
			.setLabel("Edit")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(CID.reject(msg.id))
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger),
	);

	await msg.edit({ components: [row] });
	return msg.id;
}

function parseCustomId(customId: string) {
	// format: resource:<action>:<messageId>
	const parts = customId.split(":");
	if (parts.length !== 3) return null;
	const [ns, action, messageId] = parts;
	if (ns !== "resource") return null;
	return { action, messageId };
}

client.on("interactionCreate", async (interaction: Interaction) => {
	try {
		// BUTTONS
		if (interaction.isButton()) {
			const parsed = parseCustomId(interaction.customId);
			if (!parsed || !parsed.messageId) return;

			const data = await store.get(parsed.messageId);
			if (!data) {
				await interaction.reply({
					content: "This review item expired (no data found).",
					ephemeral: true,
				});
				return;
			}

			if (parsed.action === "approve") {
				await interaction.deferReply({ ephemeral: true });

				await patchResource(data.id, { status: "public" });
				await cacheDelPattern("*");

				await interaction.editReply("✅ Approved and published in Sanity.");
				if (interaction.message)
					await interaction.message.edit({ components: [] });
				await store.delete(parsed.messageId);
				return;
			}

			if (parsed.action === "reject") {
				await interaction.deferReply({ ephemeral: true });

				await patchResource(data.id, { status: "rejected" });
				await cacheDelPattern("*");

				await interaction.editReply("❌ Rejected in Sanity.");
				if (interaction.message)
					await interaction.message.edit({ components: [] });
				await store.delete(parsed.messageId);
				return;
			}

			if (parsed.action === "edit") {
				// open modal
				const modal = new ModalBuilder()
					.setCustomId(CID.modalSave(parsed.messageId))
					.setTitle("Edit resource");

				const title = new TextInputBuilder()
					.setCustomId("title")
					.setLabel("Title")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(data.title || "");

				const description = new TextInputBuilder()
					.setCustomId("description")
					.setLabel("Description")
					.setStyle(TextInputStyle.Paragraph)
					.setRequired(false)
					.setValue(data.description || "");

				const url = new TextInputBuilder()
					.setCustomId("url")
					.setLabel("URL")
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue(data.url || "");

				const status = new TextInputBuilder()
					.setCustomId("status")
					.setLabel('Status: "review" | "public" | "rejected"')
					.setStyle(TextInputStyle.Short)
					.setRequired(false)
					.setValue("review");

				modal.addComponents(
					new ActionRowBuilder<TextInputBuilder>().addComponents(title),
					new ActionRowBuilder<TextInputBuilder>().addComponents(description),
					new ActionRowBuilder<TextInputBuilder>().addComponents(url),
					new ActionRowBuilder<TextInputBuilder>().addComponents(status),
				);

				await interaction.showModal(modal);
				return;
			}
		}

		// MODAL SUBMIT
		if (interaction.isModalSubmit()) {
			const customId = interaction.customId; // resource:modalSave:<messageId>
			const parts = customId.split(":");
			if (
				parts.length !== 3 ||
				parts[0] !== "resource" ||
				parts[1] !== "modalSave"
			)
				return;

			const messageId = parts[2]!;
			const data = await store.get(messageId);
			if (!data) {
				await interaction.reply({
					content: "This review item expired (no data found).",
					ephemeral: true,
				});
				return;
			}

			const title = interaction.fields.getTextInputValue("title")?.trim();
			const description = interaction.fields
				.getTextInputValue("description")
				?.trim();
			const url = interaction.fields.getTextInputValue("url")?.trim();
			const statusRaw = interaction.fields.getTextInputValue("status")?.trim();

			const status =
				statusRaw === "public" ||
				statusRaw === "review" ||
				statusRaw === "rejected"
					? statusRaw
					: "review";

			await interaction.deferReply({ ephemeral: true });

			// patch sanity
			await patchResource(data.id, {
				title: title || undefined,
				description: description || undefined,
				url: url || undefined,
				status,
			});

			await cacheDelPattern("*");

			// update embed message on discord
			const embed = interaction.message?.embeds[0];

			let newEmbed;
			if (embed) {
				newEmbed = EmbedBuilder.from(embed as any)
					.setTitle(title || embed?.title || "Resource")
					.setDescription(
						description || embed?.description || "No description",
					);
			} else {
				newEmbed = new EmbedBuilder()
					.setTitle(title || "Resource")
					.setDescription(description || "No description");
			}

			// update store cache
			await store.set(messageId, {
				...data,
				title: title || data.title,
				description: description || data.description,
				url: url || data.url,
			});

			if (interaction.message) {
				await interaction.message.edit({ embeds: [newEmbed] });

				if (status === "public" || status === "rejected") {
					await interaction.message.edit({ components: [] });
					await store.delete(messageId);
				}
			}

			await interaction.editReply(
				`💾 Saved changes to Sanity. Status = **${status}**.`,
			);
			return;
		}
	} catch (err: any) {
		const msg = err?.message ?? String(err);
		if (interaction.isRepliable()) {
			try {
				await interaction.reply({ content: `Error: ${msg}`, ephemeral: true });
			} catch {
				// ignore
			}
		}
	}
});

export async function startDiscord() {
	await client.login(process.env.DISCORD_TOKEN);
	// eslint-disable-next-line no-console
	console.log("Discord bot logged in.");
}
