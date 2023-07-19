(() => {
	/**
	* Check and set a global guard variable.
	* If this content script is injected into the same page again,
	* it will do nothing next time.
	*/
	console.log("mastodon tag less content script running!");

	if (window.hasRun) {
		return;
	}
	window.hasRun = true;

	let limit = undefined;
	let tagless_number_promise = browser.storage.local.get("mastodon_tagless_number_key");
	tagless_number_promise.then(function(resultContainer) {
		if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
			limit = resultContainer["mastodon_tagless_number_key"];
		}
	});

	let foundDrawers = document.getElementsByClassName("item-list");
	let validDrawer = [];
	for(let drawer of foundDrawers) {
		if(drawer.attributes.role.value === "feed") {
			validDrawer.push(drawer);	
			drawer.addEventListener("DOMNodeInserted", function (e) {
				console.log("limit = " + limit);
				if(limit !== undefined) {
					for(let child of drawer.children) {
						if(child.getAttribute("tagless") === null && child.children.length > 0) {
							let subsubchild = child.children[0].children[0];
							if(subsubchild !== undefined && subsubchild.classList.contains("status__wrapper")) {
								let innerText = subsubchild.innerText;
								let nbHashtags = innerText.split("#").length;
								console.log(nbHashtags + " > " + limit + " ?");
								if(nbHashtags > limit) {
									child.style.display = "none";
									child.setAttribute("tagless",true);
								} 
								else {
									child.setAttribute("tagless",false);
								}
							}
						}
						
					}
				}

			}, false);
		}
	}



})();
