// Function for when a user submits a login
function loginSub() {

    // Get the textbox elements for username and password
    let uName = document.getElementById("uName");
    let pName = document.getElementById("pName");

    // Move their data into a JSON object
    let obj = {};
    obj.username = uName.value;
    obj.password = pName.value;

    // Make a request
    req = new XMLHttpRequest();

    /* Wait for response and go to home if data was invalid,
    *  or users profile if login was successful
    */
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            window.location.href = response.url;
            return false;

        }
    }
    req.open("POST", "/login");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(obj));
}

