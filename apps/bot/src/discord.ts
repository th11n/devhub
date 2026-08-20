import { consumeJSON } from "@devhub/queue";
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
	StringSelectMenuBuilder,
	TextInputBuilder,
	TextInputStyle,
} from "discord.js";
import {
	categoryReference,
	getResourceCategories,
	patchResource,
} from "./sanity";
import { store } from "./store";

export const client = new Client({
	intents: [GatewayIntentBits.Guilds],
});

const CID = {
	approve: (messageId: string) => `resource:approve:${messageId}`,
	reject: (messageId: string) => `resource:reject:${messageId}`,
	edit: (messageId: string) => `resource:edit:${messageId}`,
	category: (messageId: string) => `resource:category:${messageId}`,
	modalSave: (messageId: string) => `resource:modalSave:${messageId}`,
};

type ReviewJob = {
	id: string;
	name?: string;
	description?: string;
	link?: string;
	createdAt?: string;
};

const reviewCfg = {
	url: process.env.RABBITMQ_URL || "amqp://dev:dev@localhost:5672",
	queue: "resource_review",
	prefetch: 5,
	durable: true,
};

export async function startReviewConsumer() {
	await consumeJSON<ReviewJob>(reviewCfg, async (resource) => {
		await postReviewMessage(resource);
		console.log(`[bot] posted Discord review card for ${resource.id}`);
	});
}

function reviewActions(messageId: string) {
	return new ActionRowBuilder<ButtonBuilder>().addComponents(
		new ButtonBuilder()
			.setCustomId(CID.approve(messageId))
			.setLabel("Approve")
			.setStyle(ButtonStyle.Success),
		new ButtonBuilder()
			.setCustomId(CID.edit(messageId))
			.setLabel("Edit")
			.setStyle(ButtonStyle.Primary),
		new ButtonBuilder()
			.setCustomId(CID.category(messageId))
			.setLabel("Category")
			.setStyle(ButtonStyle.Secondary),
		new ButtonBuilder()
			.setCustomId(CID.reject(messageId))
			.setLabel("Reject")
			.setStyle(ButtonStyle.Danger),
	);
}

export async function postReviewMessage(resource: {
	id: string;
	name?: string;
	description?: string;
	link?: string;
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
	const textChannel = channel as TextChannel;
	const existingMessageId = await store.messageIdForResource(resource.id);
	if (existingMessageId) {
		const existingMessage = await textChannel.messages
			.fetch(existingMessageId)
			.catch(() => null);
		if (existingMessage) {
			await existingMessage.edit({
				components: [reviewActions(existingMessageId)],
			});
			return existingMessageId;
		}
	}

	const embed = new EmbedBuilder()
		.setTitle(resource.name || "New Resource")
		.setDescription(resource.description || "No description")
		.addFields(
			resource.link
				? { name: "URL", value: resource.link }
				: { name: "URL", value: "—" },
			{ name: "Sanity ID", value: `\`${resource.id}\`` },
			resource.submittedBy
				? { name: "Submitted by", value: resource.submittedBy }
				: { name: "Submitted by", value: "—" },
		)
		.setFooter({ text: "DevHub • Resource review" });

	if (resource.logoUrl) embed.setThumbnail(resource.logoUrl);

	// najpierw wysyłamy placeholder, żeby znać message.id do customId
	const msg = await textChannel.send({ embeds: [embed] });

	await store.set(msg.id, resource);

	await msg.edit({ components: [reviewActions(msg.id)] });
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
					.setValue(data.name || "");

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
					.setValue(data.link || "");

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

			if (parsed.action === "category") {
				const categories = await getResourceCategories();
				if (!categories.length) {
					await interaction.reply({
						content: "No resource categories are available in Sanity.",
						ephemeral: true,
					});
					return;
				}

				const select = new StringSelectMenuBuilder()
					.setCustomId(CID.category(parsed.messageId))
					.setPlaceholder("Choose a category")
					.addOptions(
						categories.slice(0, 25).map((category) => ({
							label: category.name,
							value: category.id,
						})),
					);

				await interaction.reply({
					content: "Choose the new category for this resource:",
					components: [
						new ActionRowBuilder<StringSelectMenuBuilder>().addComponents(
							select,
						),
					],
					ephemeral: true,
				});
				return;
			}
		}

		if (interaction.isStringSelectMenu()) {
			const parsed = parseCustomId(interaction.customId);
			if (!parsed || parsed.action !== "category" || !parsed.messageId) return;
			const messageId = parsed.messageId;
			const data = await store.get(messageId);
			const categoryId = interaction.values[0];
			if (!data || !categoryId) {
				await interaction.update({
					content: "This review item expired. Open a new review card.",
					components: [],
				});
				return;
			}

			const category = (await getResourceCategories()).find(
				(item) => item.id === categoryId,
			);
			if (!category) {
				await interaction.update({
					content: "Category no longer exists.",
					components: [],
				});
				return;
			}

			await patchResource(data.id, {
				categories: categoryReference(categoryId),
			});
			await cacheDelPattern("*");
			await store.set(messageId, {
				...data,
				categoryName: category.name,
			});
			await interaction.update({
				content: `Category changed to **${category.name}**.`,
				components: [],
			});
			return;
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

			const messageId = parts[2];
			if (!messageId) return;
			const data = await store.get(messageId);
			if (!data) {
				await interaction.reply({
					content: "This review item expired (no data found).",
					ephemeral: true,
				});
				return;
			}

			const name = interaction.fields.getTextInputValue("title")?.trim();
			const description = interaction.fields
				.getTextInputValue("description")
				?.trim();
			const link = interaction.fields.getTextInputValue("url")?.trim();
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
				name: name || undefined,
				description: description || undefined,
				link: link || undefined,
				status,
			});

			await cacheDelPattern("*");

			// update embed message on discord
			const embed = interaction.message?.embeds[0];

			let newEmbed: EmbedBuilder;
			if (embed) {
				newEmbed = EmbedBuilder.from(embed)
					.setTitle(name || embed?.title || "Resource")
					.setDescription(
						description || embed?.description || "No description",
					);
			} else {
				newEmbed = new EmbedBuilder()
					.setTitle(name || "Resource")
					.setDescription(description || "No description");
			}

			// update store cache
			await store.set(messageId, {
				...data,
				name: name || data.name,
				description: description || data.description,
				link: link || data.link,
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
