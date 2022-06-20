(async function () {
	const src = chrome.runtime.getURL("content/main.js");
	const contentScript = await import(src);
	contentScript.main();
})();
