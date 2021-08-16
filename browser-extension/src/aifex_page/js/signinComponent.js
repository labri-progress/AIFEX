function renderSigninComponent() {
    let component = document.getElementById('signinComponent');
    if (state.pageKind === 'Configure') {
        component.style.display = "block";
    } else {
        component.style.display = "none";
    }
}

function handleSignin(e) {
    console.log('signin');
    if (e.type === "keydown" && e.key !== "Enter") {
        console.log("key",e.key);
        return;
    }
    e.preventDefault();
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    sendMessage({kind: "signin", username, password})
        .then(response => {
            console.log(response);
            if (!response) {
                console.error(`Background does not answer`);
                document.getElementById('signinMessage').innerHTML = 'Something goes wrong, the extension does not answer.';
            }
            else if (response.error) {
                document.getElementById('signinMessage').innerHTML = 'The server does not answer, please check the URL.';
            }
            else {
                getStateAndRender();
            }
        });
}

document.getElementById("signinButton").addEventListener("click", handleSignin);
document.getElementById("username").addEventListener("keydown", handleSignin);
document.getElementById("password").addEventListener("keydown", handleSignin);


addComponentToPopup(renderSigninComponent);