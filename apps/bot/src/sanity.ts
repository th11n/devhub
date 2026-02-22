type PatchFields = {
	status?: "review" | "public" | "rejected";
	title?: string;
	description?: string;
	url?: string;
};

function sanityUrl(path: string) {
	return `https://${process.env.SANITY_PROJECT_ID}.api.sanity.io/v${process.env.SANITY_API_VERSION}/data/mutate/${process.env.SANITY_DATASET}${path}`;
}

export async function patchResource(resourceId: string, fields: PatchFields) {
	const mutations = [
		{
			patch: {
				id: resourceId,
				set: fields,
			},
		},
	];

	const res = await fetch(sanityUrl(""), {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Authorization: `Bearer ${process.env.SANITY_TOKEN}`,
		},
		body: JSON.stringify({ mutations }),
	});

	if (!res.ok) {
		const text = await res.text().catch(() => "");
		throw new Error(`Sanity patch failed (${res.status}): ${text}`);
	}

	return res.json();
}
