//-----list of features-----
//1. choose a theme
// - after choosing a theme, it will load a random background image from that theme 
// - from unsplash, and a list of words related to that theme

//2. playing the game
// - words will slowly start floating from right to left from the selected word list
// - starting slowly, and shorter words (3-5 letters).
// - as time progresses, words will appear faster and be longer in length

//3. scoring
// - additional points for correct letters, minus points for missing letters?
// - record accuracy (total correct / total typed) and longest streak

//4. high scores (optional)
// - save top scores to a server, just enter your name when you finish a round and make the top 10

//5. technical
// - handling specific event listeners is key.  Just copy Ztype's approach: when the first letter of
// - a word is pressed that locks the user onto that word until the word is complete - it may be as simple
// - as saving a reference to that word into a "target" variable?

//6. Next level
// - Every 3? levels the user can pick a new theme.  Three options will float around in the middle of the screen
// - user can't die on this stage (game is essentially paused) and there is no scoring.  Type the name of the
// - theme to choose, this will trigger a new background image and word list.



//this works!  Sizing is not working from the request, but I'm brute forcing it with css.
//If I could get a bunch of random words related to a search term, the user could just type their own themes!
//Need to add who the photo is by and allow user to download it if they want (unsplash terms)
function newBackground(theme){
    return fetch(`https://api.unsplash.com/photos/random?query=${theme}&w=1200&h=600`, {
        headers: {
            "Authorization": "Client-ID etHez9ur_31n4YuNvHsHVpUzp9btB4v-C7JiGbtEBG8"
        }
    })
    .then(r => r.json())
    .then(j => {console.log(j);
        document.querySelector("#game").style.backgroundImage = `url(${j.urls.full})`;
        //document.querySelector("#game").style.backgroundSize = "1200px 600px";
    })
    .catch(err => console.log("what's going on here?", err));
}
newBackground("desert");

function loadScores() {
    return fetch("./db.json")
        .then(resp => resp.json())
        .then(json => {
            for (const score of json) {
                highScore(score);
                scores.push(score);
            }
        })
}
function sendScore(score) {
    return fetch("./db.json", {
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method: "POST",
        body: JSON.stringify(score),
    })
    .then(r => r.json()) //can I just do nothing?
    .then(obj, console.log("High scores updated: congratulations!"))
    .catch(err => console.log("update failed: ", JSON.stringify(err.message)));
}