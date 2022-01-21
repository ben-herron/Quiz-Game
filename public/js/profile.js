/* When the save button is clicked, send the drop downs current
*  selected choice to server to be saved
*/
function savePrivacy() {
    // The elements of the dropdown
    let privacySelect = document.getElementById('privacySelect');

    // The object that will be sent
    let obj = {};
    obj.privacy = privacySelect.options[privacySelect.selectedIndex].value;

    // Make a request
    req = new XMLHttpRequest();

    // When the response comes back, update the page to show current the privacy
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            window.location.href = response.url;
            return false;
        }
    }
    req.open("POST", "/privacy");
    req.setRequestHeader("Content-Type", "application/json");
    req.send(JSON.stringify(obj));
}

// Function for when the current user logs out
function logOut() {

    // Make a request
    req = new XMLHttpRequest();

    // When the response comes back, go to the home page
    req.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let response = JSON.parse(this.responseText);
            window.location.href = response.url;
            return false;
        }
    }
    req.open("GET", "/logout");
    req.setRequestHeader("Content-Type", "application/json");
    req.send();
}
