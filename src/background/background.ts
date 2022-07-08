chrome.action.onClicked.addListener(() => {
  chrome.tabs.create({
    url: "options.html"
  })
  console.log("fired")
})