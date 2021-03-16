document.getElementById("submitComment").addEventListener("click", submitComment);
document.getElementById("clearComment").addEventListener("click", clearComment);

function displayCommentList(commentDistributionList, commentUpList) {
    console.log(commentUpList)
    const root = document.getElementById("commentList");
    while (root.hasChildNodes()) {
        root.firstChild.remove();
    }
    for (const commentDistribution of commentDistributionList) {
        const [kind, value] = commentDistribution._comment.split("$");
        const sizeOneDistribution = commentDistribution._distributions.find(distribution => distribution.context.length === 1);
        const nbOccurence = sizeOneDistribution.noteOccurence;
        const media = document.createElement("div");

        media.innerHTML = `<div class="media">
            <div class="media-body">
                <h5 mediaComment class="mt-0">${kind} (${nbOccurence}) <i upComment class="fa fa-plus-circle"></i></h5>
                <p>${kind, value}</p>
            </div>
        </div>`
        const up = media.querySelector("[upComment]");
        const mediaComment = media.querySelector("[mediaComment]");
        root.appendChild(media)

        if (isCommentUp(commentDistribution._comment, commentUpList)) {
            markCommentUp(up)
        } else {
            up.addEventListener("click", () => upComment(kind, value, up))
        }
        
    }
}

function isCommentUp(comment, commentUpList) {
    const [kind, value] = comment.split("$");
    return commentUpList.some(commentUp => commentUp.kind === kind && commentUp.value === value)
}

function markCommentUp(element) {
    element.classList.add("upped");
    const confirmed = document.createElement("span");
    confirmed.innerHTML = `<span class="commentConfirmed">(confirmed)</span>`

    element.appendChild(confirmed)
}

function upComment(type, value, element) {
    sendMessage({
        kind: "upComment",
        type,
        value
    }).then(response => {
        if (response !== undefined) {
            element.removeEventListener("click", upComment);
            markCommentUp(element)
        } else {
            console.error('Error sendMessage')
        }
    })
}

function submitComment(e) {
    e.preventDefault();
    
    const type = document.getElementById('commentType').value;
    const value = document.getElementById('commentDescription').value;
    sendMessage({
        kind: "pushComment",
        type,
        value
    })
    .then(response => {
        if (response !== undefined) {
            const screenshot = document.getElementById('commentScreenshot').checked;
            console.log(screenshot)
            if (screenshot) {
                sendMessage({
                    kind: "takeScreenshot"
                });
            }
            document.getElementById("commentSuccessul").style.display = 'block'
            document.getElementById('commentDescription').value = "";
        } else {
            console.error('Error sendMessage')
        }
    });

}

function clearComment(e) {
    e.preventDefault();
    document.getElementById('commentDescription').value = "";
}

function updateDisplayUserView(e) {
    e.preventDefault();
    const isTabScriptDisplayingUserView = e.target.checked
    sendMessage({
        kind: "setIsTabScriptDiplayingUserView",
        isTabScriptDisplayingUserView
    });
}
