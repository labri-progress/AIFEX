(() => {
    let component = document.getElementById('makeExplorationComponent');
    let makeExplorationTitle = document.getElementById('makeExplorationTitle');
    let playButton = document.getElementById('play-button');
    let stopButton = document.getElementById('stop-button');
    let trashButton = document.getElementById('trash-button');
    let commentButton = document.getElementById('comment-button');
    let commentSubComponent = document.getElementById('commentSubComponent');
    let submitCommentButton = document.getElementById('submit-comment');
    let commentForm = document.getElementById('commentForm');
    let readCommentButton = document.getElementById('read-comment-button');
    let commentList = document.getElementById('comment-list');

    let readCommentIsVisible = false;
    let addCommentIsVisible = false;

    function render() {
        if (state.pageKind === 'Explore') {
            component.style.display = 'flex';
        } else {
            component.style.display = 'none';
        }
        if (state.isRecording) {
            makeExplorationTitle.innerHTML = 'Stop/Save your exploration or Trash it';
            playButton.style.display = 'none';
            stopButton.style.display = 'flex';
            trashButton.style.display = 'flex';
            commentSubComponent.style.display = 'flex';
            commentForm.style.display = 'none';
            if (state.commentDistributionList && state.commentDistributionList.length > 0) {
                readCommentButton.style.display = 'flex';
            } else {
                readCommentButton.style.display = 'none';
            }

        } else {
            makeExplorationTitle.innerHTML = 'Start a new exploration';
            playButton.style.display = 'flex';
            stopButton.style.display = 'none';
            trashButton.style.display = 'none';
            commentSubComponent.style.display = 'none';
        }
    }

    function startExploration() {
        console.log('start exploration');
        sendMessage({
            kind: 'startExploration'
        })
            .then(newState => {
                getStateAndRender();
            })
            .catch(e => {
                console.error('start exploration error', e);
            })
    }

    function stopExploration() {
        console.log('stop exploration');
        sendMessage({
            kind: 'stopExploration'
        })
            .then(response => {
                if (response.error) {
                    console.error('stop exploration error', response.error);
                }
                getStateAndRender();
            })
            .catch(e => {
                console.error('stop exploration error', e);
            })
    }
    
    function trashExploration() {
        console.log('handle trash');
        sendMessage({
            kind: 'removeExploration'
        })
            .then((response) => {
                if (response.error) {
                    console.error('handle trash', response.error);
                } else {
                    getStateAndRender()
                }
            })
            .catch(e => {
                console.error('handle trash', e);
            })
    }

    function openCommentView() {
        if (!addCommentIsVisible) {
            commentForm.style.display = 'block';
            addCommentIsVisible = true;
        } else {
            commentForm.style.display = 'none';
            addCommentIsVisible = false;
        }
    }

    function submitComment(e) {
        e.preventDefault();
        console.log('submit comment');

        const type = document.getElementById('commentType').value;
        const value = document.getElementById('commentDescription').value;
        sendMessage({
            kind: "pushComment",
            type,
            value
        })
            .then(response => {
                if (response.error) {
                    console.error(response.error)
                    return;
                }
                const screenshot = document.getElementById('commentScreenshot').checked;
                if (screenshot) {
                    sendMessage({
                        kind: "takeScreenshot"
                    })
                }
                document.getElementById("commentSuccessul").style.display = 'block'
                document.getElementById('commentDescription').value = "";
            });
    }

    function readComments() {
        if (!readCommentIsVisible) {
            if (state.commentDistributionList && state.commentDistributionList.length > 0) {
                commentList.style.display = 'flex';
                commentList.style.flexDirection = 'column';
                if (commentList.children.length === 0) {
                    state.commentDistributionList.forEach((commentDistribution, i) => {
                        if (commentDistribution._comment) {
                            let [kind, description] = commentDistribution._comment.split('$');
                            let commentId = document.createElement('div');
                            commentId.innerHTML = `Comment ${i + 1}`;
                            commentId.className = 'comment-id';
                            let commentKind = document.createElement('div');
                            commentKind.className = 'comment-kind';
                            commentKind.innerHTML = "kind:" + kind;
                            let commentDescription = document.createElement('div');
                            commentDescription.className = 'comment-description';
                            commentDescription.innerHTML = "description:" + description;
                            commentList.appendChild(commentId);
                            commentList.appendChild(commentKind);
                            commentList.appendChild(commentDescription);
                        }
                    });
                }
                readCommentIsVisible = true;
            }
        } else {
            commentList.style.display = 'none';
            readCommentIsVisible = false;
        }
    }

    playButton.addEventListener('click', startExploration);
    stopButton.addEventListener('click', stopExploration);
    trashButton.addEventListener('click', trashExploration);
    commentButton.addEventListener('click', openCommentView);
    submitCommentButton.addEventListener('click', submitComment);
    readCommentButton.addEventListener('click', readComments);

    addComponentToPopup(render);

    console.log('MakeExplorations Component has been launched');


})();

