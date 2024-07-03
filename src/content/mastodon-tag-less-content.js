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
	
	let asyncRetrieveLimit = function() {
		tagless_number_promise.then(function(resultContainer) {
			if(resultContainer !== undefined && Object.keys(resultContainer).length > 0) {
				limit = resultContainer["mastodon_tagless_number_key"];
				
			}
			
			if(limit == undefined) {
				console.log("Limite undefined, async");
				setTimeout(asyncRetrieveLimit, 1000);
			}
			else {
				console.log("Limite to apply : " + limit);
				identifyDrawers();
			}
		});
	};
	
	let clearDrawer = function(drawer) {
		if(limit !== undefined) {
			for(let child of drawer.children) {
				if(child.getAttribute("tagless") === null && child.children.length > 0) {
					let subsubchild = child.children[0].children[0];
					if(subsubchild !== undefined && subsubchild.classList.contains("status__wrapper")) {
						let innerText = subsubchild.innerText;
						let nbHashtags = innerText.split("#").length;
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
	};
	
	
	let identifyDrawers = function() {
		console.log("identify drawers, limit : " + limit);
		let foundDrawers = document.getElementsByClassName("item-list");
		if(foundDrawers.length == 0) {
			console.log("doc not ready");
			setTimeout(identifyDrawers, 1000);
		}
		else {
			doHashtagLessJob(foundDrawers);
		}
	};
	
	
	let doHashtagLessJob = function(foundDrawers) {
		console.log("dojob limit : " + limit + " drawers count : " + foundDrawers.length);
		let validDrawer = [];
		for(let drawer of foundDrawers) {
			if(drawer.attributes.role.value === "feed") {
				validDrawer.push(drawer);
				clearDrawer(drawer);
				drawer.addEventListener("DOMNodeInserted", function (e) {
					clearDrawer(drawer);
				}, false);
			}
		}
	};
	
	setTimeout(asyncRetrieveLimit, 0);

})();
