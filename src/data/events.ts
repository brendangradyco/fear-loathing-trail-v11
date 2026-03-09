import type { GameEvent } from "../types";

export const EVENTS: GameEvent[] = [
	{
		id: "bats",
		title: "BAT COUNTRY",
		text: "The bats are thick tonight. You can hear them breathing.",
		choices: [
			{
				id: "bats_floor",
				label: "Floor it",
				effects: { fuel: -15 },
				flavor: "Floored it through bat country.",
			},
			{
				id: "bats_embrace",
				label: "Embrace the bats",
				effects: { sanity: -10 },
				flavor: "The bats are friendly. Weirdly friendly.",
			},
		],
	},
	{
		id: "lizard",
		title: "LIZARD PEOPLE",
		text: "The hotel clerk's face keeps shifting. Scales, man. Scales everywhere.",
		choices: [
			{
				id: "lizard_checkin",
				label: "Check in anyway",
				effects: { sanity: -15 },
				flavor: "You checked in. The scales were real.",
			},
			{
				id: "lizard_camp",
				label: "Camp outside",
				effects: { fuel: 5, sanity: 5 },
				flavor: "Slept under stars. No scales.",
			},
		],
	},
	{
		id: "attorney",
		title: "SAMOAN ATTORNEY",
		text: "A large Samoan man is flagging you down from the roadside.",
		choices: [
			{
				id: "attorney_pickup",
				label: "Pick him up",
				effects: { cash: 200 },
				flavor: "The attorney joins. He knows people.",
			},
			{
				id: "attorney_gun",
				label: "Gun it",
				effects: { sanity: -5 },
				flavor: "His curses echo for miles.",
			},
		],
	},
	{
		id: "adrenochrome",
		title: "ADRENOCHROME",
		text: "Someone left a vial on the passenger seat. You don't remember buying it.",
		choices: [
			{
				id: "adrenochrome_take",
				label: "Take it",
				effects: { sanity: -25 },
				flavor: "Everything is neon and teeth.",
			},
			{
				id: "adrenochrome_toss",
				label: "Throw it out",
				effects: { sanity: 5 },
				flavor: "Virtue is fleeting on this road.",
			},
		],
	},
	{
		id: "police",
		title: "HIGHWAY PATROL",
		text: "Flashing lights. The officer peers through your window for a long time.",
		choices: [
			{
				id: "police_disguise",
				label: "Use disguise",
				effects: {},
				conditionalCheck: {
					resource: "disguises",
					minRequired: 1,
					consumeAmount: 1,
					passText: "Disguise worked. Phew.",
					failEffects: { cash: -100 },
					failText: "No disguise. $100 fine.",
				},
				flavor: "Disguise used. You escape.",
			},
			{
				id: "police_talk",
				label: "Talk your way out",
				effects: {},
				skillCheck: {
					skill: "smooth",
					threshold: 30,
					passText: "Silver tongue saves the day.",
					failEffects: { cash: -150 },
					failText: "The cop is not impressed. $150.",
				},
				flavor: "Depends on smooth skill.",
			},
		],
	},
	{
		id: "breakdown",
		title: "GREAT RED SHARK",
		text: "The car makes a sound that no car should make.",
		choices: [
			{
				id: "breakdown_fix",
				label: "Fix it",
				effects: { fuel: -20 },
				skillCheck: {
					skill: "mechanical",
					threshold: 30,
					passText: "Fixed. Barely.",
					failEffects: { fuel: -30 },
					failText: "Made it worse. Fuel -30.",
				},
				flavor: "Mechanical skill check. Fuel -20.",
			},
			{
				id: "breakdown_drive",
				label: "Drive through it",
				effects: {},
				skillCheck: {
					skill: "driving",
					threshold: 50,
					passText: "Against all odds, it holds.",
					failEffects: { fuel: -50, sanity: -10 },
					failText: "Rough. Very rough. Fuel -50.",
				},
				flavor: "Might make it. Might not.",
			},
		],
	},
	{
		id: "casino",
		title: "ROADSIDE CASINO",
		text: "A casino. On a highway. In the middle of nowhere. Naturally.",
		choices: [
			{
				id: "casino_gamble",
				label: "Gamble ($50)",
				effects: { cash: -50 },
				skillCheck: {
					skill: "charisma",
					threshold: 50,
					passEffects: { cash: 170 },
					passText: "You won $120!",
					failText: "Lost $50. The house always wins.",
				},
				flavor: "50/50 chance.",
			},
			{
				id: "casino_drive",
				label: "Keep driving",
				effects: { sanity: 3 },
				flavor: "You drove past. A minor miracle.",
			},
		],
	},
	{
		id: "border",
		title: "CANADIAN BORDER",
		text: "The border agent asks where you're going. You have no idea.",
		choices: [
			{
				id: "border_improvise",
				label: "Improvise wildly",
				effects: {},
				skillCheck: {
					skill: "charisma",
					threshold: 40,
					passText: "They let you through somehow.",
					failEffects: { cash: -80 },
					failText: "Inspection fee. $80.",
				},
				flavor: "Charisma check.",
			},
			{
				id: "border_truth",
				label: "Tell the truth",
				effects: { sanity: 5 },
				flavor: "Honesty works at the border. Who knew.",
			},
		],
	},
	{
		id: "wolves",
		title: "WOLVES",
		text: "A pack of wolves is blocking the road. They seem... expectant.",
		choices: [
			{
				id: "wolves_honk",
				label: "Honk and floor it",
				effects: {},
				skillCheck: {
					skill: "driving",
					threshold: 30,
					passText: "Wolves disperse. Good instincts.",
					failEffects: { supplies: -1, sanity: -8 },
					failText: "One jumped on the car. Supplies -1.",
				},
				flavor: "They scatter. Probably.",
			},
			{
				id: "wolves_offer",
				label: "Offer supplies",
				effects: { supplies: -1 },
				flavor: "Wolves nod. They were just hungry.",
			},
		],
	},
	{
		id: "storm",
		title: "ACID STORM",
		text: "The rain is the wrong color. This is not good.",
		choices: [
			{
				id: "storm_wait",
				label: "Pull over and wait",
				effects: { sanity: -5 },
				flavor: "You waited it out. The rain was purple.",
			},
			{
				id: "storm_drive",
				label: "Drive through",
				effects: { fuel: -25, sanity: -12 },
				flavor: "You drove through the wrong-colored rain.",
			},
		],
	},
	{
		id: "feast",
		title: "ROADSIDE FEAST",
		text: "Locals invite you to a barbecue. The meat smells incredible.",
		choices: [
			{
				id: "feast_join",
				label: "Join them",
				effects: { supplies: 2, sanity: 10 },
				flavor: "Best meal of the trip. No questions asked.",
			},
			{
				id: "feast_drive",
				label: "Keep moving",
				effects: { sanity: -5 },
				flavor: "The smell haunts you for 200 miles.",
			},
		],
	},
	{
		id: "hitchhiker",
		title: "HITCHER",
		text: "A hitchhiker with a briefcase full of something.",
		choices: [
			{
				id: "hitcher_ride",
				label: "Give a ride",
				effects: { cash: 100 },
				flavor: "They pay well and ask no questions. Neither do you.",
			},
			{
				id: "hitcher_pass",
				label: "Drive past",
				effects: {},
				flavor: "The safe choice. Boring, but alive.",
			},
		],
	},
];
