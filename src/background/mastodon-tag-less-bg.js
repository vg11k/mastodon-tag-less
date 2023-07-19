let tagless_urls_promise = browser.storage.local.get("mastodon_tagless_urls_key");


const filter = {
  properties : ["status"],
};

function handleUpdated(tabId, changeInfo, tabInfo) {
	if(changeInfo.status  === "complete") {
		//console.log(`Updated tab: ${tabId}`);
		//console.log("Changed attributes: ", changeInfo);
		
		//console.log("New tab Info: ", tabInfo);
		tagless_urls_promise.then(function(resultContainer) {
			if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
				browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
						
					let tab = tabs[0]; // Safe to assume there will only be one result
					let localUrl = tab.url.split("/")[2];//"http://foo.fo/fooo" => ["http","","foo.fo","fooo"]
					if(resultContainer["mastodon_tagless_urls_key"].includes(localUrl)) {
						
						browser.tabs.executeScript({ file: "/content/mastodon-tag-less-content.js" });
						
					}
				}, console.error);
			}
		});
	}
}
	
browser.tabs.onUpdated.addListener(handleUpdated,filter);
