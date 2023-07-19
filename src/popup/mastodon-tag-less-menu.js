const mastodon_tagless_number_key = "mastodon_tagless_number_key";
const mastodon_tagless_urls_key = "mastodon_tagless_urls_key";
const mastodon_tagless_number_input_id = "taglessnumber";
const mastodon_tagless_urls_input_id = "taglessurl";

//https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/storage/local

/**
 * Listen for clicks on the buttons, and send the appropriate message to
 * the content script in the page.
 */
function listenForClicks() {
	document.addEventListener("click", (e) => {
		/**
		 * Remove the page-hiding CSS from the active tab,
		 * send a "reset" message to the content script in the active tab.
		 */
		function reset(tabs) {
		  browser.tabs.removeCSS({ code: hidePage }).then(() => {
			browser.tabs.sendMessage(tabs[0].id, {
			  command: "reset",
			});
		  });
		}

		/**
		 * Just log the error to the console.
		 */
		function reportError(error) {
		  console.error(`Could not tagless: ${error}`);
		}

		/**
		 * Get the active tab,
		 */
		if (e.target.tagName !== "BUTTON" || !e.target.closest("#popup-content")) {
		  // Ignore when click is not on a button within <div id="popup-content">.
		  console.log("popup ignore");
		  return;
		}
		
		if (e.target.type === "reset") {
		  browser.tabs
			.query({ active: true, currentWindow: true })
			.then(reset)
			.catch(reportError);
		}
		else if(e.target.id === "popup-add") {
			console.log("popup add");
			let tagless_urls_promise = browser.storage.local.get(mastodon_tagless_urls_key);
			tagless_urls_promise.then(function(resultContainer) {
		
				if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
					console.log(resultContainer);
					let addElement = true;
					resultContainer.mastodon_tagless_urls_key.forEach(function(v,i,a) {
						if(v === document.getElementById(mastodon_tagless_urls_input_id).value) 
						{
							addElement = false;
						}
					});
					
					if(addElement) {
						resultContainer.mastodon_tagless_urls_key.push(document.getElementById(mastodon_tagless_urls_input_id).value);
						browser.storage.local.set(resultContainer);
						console.log("referenced url array extended : " + resultContainer.mastodon_tagless_urls_key);
					}
					else {
						console.log("referenced url " + document.getElementById(mastodon_tagless_urls_input_id).value + " not added because already in array : " + resultContainer.mastodon_tagless_urls_key);
					}
				}
				else {
					var mastodon_tagless_container = {};
					mastodon_tagless_container[mastodon_tagless_urls_key] = [document.getElementById(mastodon_tagless_urls_input_id).value];
					browser.storage.local.set(mastodon_tagless_container);
					console.log("referenced url array created : " + mastodon_tagless_container);
				}
				refreshTable();
			});
		}
		else if(e.target.id === "popup-valid") {
			var valueToStore = document.getElementById(mastodon_tagless_number_input_id).value;
			var mastodon_tagless_container = {};
			mastodon_tagless_container[mastodon_tagless_number_key] = valueToStore;
			browser.storage.local.set(mastodon_tagless_container);
		}
    
	});
}

/**
 * There was an error executing the script.
 * Display the popup's error message, and hide the normal UI.
 */
function reportExecuteScriptError(error) {
  document.getElementById("popup-content").classList.add("hidden");
  document.getElementById("error-content").classList.remove("hidden");
  console.error(`Failed to execute mastodon tag less content script: ${error.message}`);
}

/**
 * When the popup loads, inject a content script into the active tab,
 * and add a click handler.
 * If we couldn't inject the script, handle the error.
 */
browser.tabs
  .executeScript({ file: "/content/mastodon-tag-less-content.js" })
  .then(listenForClicks)
  .catch(reportExecuteScriptError);
  
var mastodon_tagless_current_baseurl = "";

browser.tabs.query({currentWindow: true, active: true}).then((tabs) => {
    let tab = tabs[0]; // Safe to assume there will only be one result
	//"http://foo.fo/fooo" => ["http","","foo.fo","fooo"]
	mastodon_tagless_current_baseurl = tab.url.split("/")[2];
	document.getElementById(mastodon_tagless_urls_input_id).value = mastodon_tagless_current_baseurl;
}, console.error);



let tagless_number_promise = browser.storage.local.get(mastodon_tagless_number_key);
tagless_number_promise.then(function(resultContainer) {
	
	if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
		let validMastodonPopup = document.getElementById(mastodon_tagless_number_input_id);
		if(validMastodonPopup !== null) {	
			document.getElementById(mastodon_tagless_number_input_id).value = resultContainer[mastodon_tagless_number_key];
		}
	}
	else {
		document.getElementById(mastodon_tagless_number_input_id).value = resultContainer[mastodon_tagless_number_key];
	}	
});

function refreshTable() {
	let urls_promise = browser.storage.local.get(mastodon_tagless_urls_key);
	urls_promise.then(function(resultContainer) {
		
		let tableToFeed = document.getElementById("popup-table");
		while (tableToFeed.firstChild) {
			tableToFeed.removeChild(tableToFeed.lastChild);
		}
	
		if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
			resultContainer.mastodon_tagless_urls_key.forEach(function(v,i,a) {
				let line = document.createElement("tr");
				let col1 = document.createElement("td");
				let p1 = document.createElement("p");
				p1.innerHTML = v;
				col1.append(p1);
				line.append(col1);
				let col2 = document.createElement("td");
				let butt = document.createElement("button");
				butt.addEventListener('click', event => {
				  removeUrl(v);
				});
				butt.innerHtml = "Remove url";
				butt.classList.add("removebtn");
				col2.append(butt);
				line.append(col2);
				tableToFeed.append(line);
			})
		}
	});
};

function removeUrl(urlToRemove) {
	console.log("will remove " + urlToRemove);
	let urls_promise = browser.storage.local.get(mastodon_tagless_urls_key);
	urls_promise.then(function(resultContainer) {
		let index = resultContainer.mastodon_tagless_urls_key.indexOf(urlToRemove);
		if (index > -1) {
			resultContainer.mastodon_tagless_urls_key.splice(index, 1);
			browser.storage.local.set(resultContainer);
			refreshTable();
			console.log("found and reload");
		}
	});
};

refreshTable();