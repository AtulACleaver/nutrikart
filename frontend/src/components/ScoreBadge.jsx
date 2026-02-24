// Color-coded score pill for recommendation items.
// Score thresholds: 80+ green, 60+ lime, 40+ amber, below 40 red.
// Maps directly to the score100 value from POST /recommend response.
export default function ScoreBadge({ score }) {
	let color = "bg-red-500";
	if (score >= 80) color = "bg-green-500";
	else if (score >= 60) color = "bg-lime-500";
	else if (score >= 40) color = "bg-amber-500";

	return (
		<span className={`${color} text-black text-xs font-bold px-2 py-1 rounded-full`}>
			{score}
		</span>
	);
}