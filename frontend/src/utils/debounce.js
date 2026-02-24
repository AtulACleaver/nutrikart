// Debounce delays a function call until a pause in activity.
// If the user changes quantity 5 times in 2 seconds, you don't want
// 5 API calls - you want 1 call after they stop clicking.
export function debounce(fn, ms = 300) {
	let timer;
	return (...args) => {
		clearTimeout(timer);
		timer = setTimeout(() => fn(...args), ms);
	};
}