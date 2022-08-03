//#region-----list of features-----
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
//#endregion


//this works!  Sizing is not working from the request, but I'm brute forcing it with css.
//If I could get a bunch of random words related to a search term, the user could just type their own themes!
//Need to add who the photo is by and allow user to download it if they want (unsplash terms)
let GC = {
    game: document.querySelector("#game"),
    rule: document.querySelector("#rule"),
    welcome: document.querySelector("#welcome"),
    error: document.querySelector("#error"),
    input: document.querySelector("#input"),
    backgroundCover: document.querySelector("#backgroundCover"),
    words: [],
    difficulty: 1,
    target: {},
    keyCount: 0,
    streak: 0,
    longStreak: 0,
    score: 0,
    currentWords: "",
    enemyWords: {},
    playing: false //change this once I implement levels and launch screen.
}
const backupWords = ['ant', 'box', 'car', 'dog', 'egg', 'fog', 'gin', 'hot', 'ice', 'jam', 'kin', 'lie', 'map', 'nil', 'off', 'pet', 'qin', 'red', 'sly', 'tee', 'urn', 'vat', 'why', 'you', 'zen',
    'atom', 'bare', 'cave', 'dire', 'epic', 'fate', 'goal', 'heat', 'iron', 'joke', 'kept', 'list', 'made', 'note', 'ouch', 'play', 'quit', 'rest', 'sell', 'told', 'unit', 'volt', 'wind', 'xray', 'yarn', 'zeus',
    'apart', 'bring', 'close', 'delve', 'ember', 'finch', 'ghost', 'heart', 'ideal', 'joint', 'knife', 'level', 'moist', 'noise', 'ounce', 'proud', 'quiet', 'rapid', 'solid', 'teach', 'under', 'voice', 'whale', 'xenon', 'yacht', 'zebra',
    'aurora', 'bright', 'create', 'docile', 'earned', 'finder', 'golden', 'honest', 'ironic', 'joking', 'knight', 'lowest', 'modest', 'novice', 'orient', 'played', 'quoted', 'reward', 'spoilt', 'taught', 'undone', 'violet', 'whisky', 'xanadu', 'yellow', 'zenith'];
window.addEventListener("keydown", typing);

function getOrientation() {
    switch (true) {
        case window.innerWidth / window.innerHeight > 1.25:
            return "landscape";
        case window.innerHeight / window.innerWidth > 1.25:
            return "portrait";
        default:
            return "squarish";
    }
}
newBackground("dessert");
function newBackground(theme) {
    const background = document.querySelector("#background");
    const attribution = document.querySelector("#attribution");
    function appendix() {
        return getOrientation() === "portrait" ? `&fit=crop&h=${window.innerHeight}&fit=max` : `&fit=crop&w=${window.innerWidth}&fit=max`
        // if (getOrientation() === "landscape")
        // return `&fit=crop&w=${window.innerWidth}&fit=max`
        // else if (getOrientation() === "portrait")
        // return `&fit=crop&h=${window.innerHeight}&fit=max`
    }
    return fetch(`https://api.unsplash.com/photos/random?query=${theme}&orientation=${getOrientation()}`, {
        headers: {
            "Authorization": "Client-ID etHez9ur_31n4YuNvHsHVpUzp9btB4v-C7JiGbtEBG8"
        }
    })
        .then(r => r.json())
        .then(j => {
            console.log(j);
            GC.backgroundCover.style.opacity = 1;
            GC.backgroundCover.src = j.urls.thumb; //this works, but look into blurhash
            setTimeout(a => GC.backgroundCover.src = j.urls.small, 1000)
            background.src = j.urls.raw + appendix();
            attribution.innerHTML = `Photo by <a href="${j.user.links.html}?utm_source=Typing_Game&utm_medium=referral" target="_blank">${j.user.name}</a> on <a href="https://unsplash.com/?utm_source=Typing_Game&utm_medium=referral" target="_blank">Unsplash</a>`

            background.addEventListener('load', loaded)
        })
        .catch(err => {
            if (theme) {
                newBackground('');
                noImageFound();
            }
            else {
                console.log("Why don't I see anything?", err);
            }
        });
}
function loaded() {
    GC.backgroundCover.style.opacity = 0;
    GC.backgroundCover.style.transition = "opacity 1s";
}
function noImageFound() {
    //brief pop-up to explain why background is abstract and doesn't match typed theme
}

newWords("dessert")
function newWords(theme) {
    GC.words = [];
    Promise.all([fetch(`https://api.datamuse.com/words?rel_jja=${theme}&max=200`),
                 fetch(`https://api.datamuse.com/words?rel_jjb=${theme}&max=200`),
                 fetch(`https://api.datamuse.com/words?rel_syn=${theme}&max=200`),
                 fetch(`https://api.datamuse.com/words?rel_trg=${theme}&max=200`)])
        .then(responses => 
            Promise.all(responses.map(r => r.json()))
        )
        .then(data => {
            for (const array of data) {
                for (const word of array){
                    GC.words.push(word.word)                     
                }
            }
            if (GC.words.length < 30){
                noWordsFound();
            }
            console.log(data);
        })
        .catch(err => {
            console.log("Why can't I read anything?", err);
            noWordsFound();
        });
}
function noWordsFound() {
    //brief pop-up to explain that the typed theme didn't return enough words.
    if (GC.words.length < 25) {
        let temp = [...GC.words];
        newWords("error")
        setTimeout(a=>{
            GC.words = [...GC.words, ...temp]
            if (GC.words.length < 25) { //this would be if there's an issue with Datamuse API
                GC.words = [...GC.words, ...backupWords]; 
            }
        }, 500)
    }
}

function loadScores() {
    return fetch("./db.json")
        .then(resp => resp.json())
        .then(json => {
            for (const score of json) {
                GC.scores.push(score);
            }
        })
}
function highScore(score) {
    const name = "";//get player name
    //sort list
    sendScore({ name, score })

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
function startGame(theme) {
    GC.welcome.className = "hidden";
    GC.playing = true;
    GC.streak = 0;
    GC.longStreak = 0;
    GC.difficulty = 1;
    GC.currentWords = "";
    GC.keyCount = 0;
    GC.score = 0;
    GC.input.innerHTML = "";
    setRule();
    newBackground(theme);
    newWords(theme);
    setTimeout(function loop() {
            const rand = Math.round(Math.random() * (1000)) + 1600 - GC.difficulty * 100; // 1 word every 1.5 seconds, +/- 0.5 seconds.  Base time decreases 100ms for each level of difficulty (that adds up fast!)
            if (GC.playing){
                createWord();
                setTimeout(() => {
                    loop();  
                }, rand);
            }
        }, 500);
}
function setRule(){
    GC.rule.className = getOrientation() === 'landscape' ? "verticalRule" : "horizontalRule";
    setTimeout(a=> GC.rule.classList.add(GC.rule.className === "verticalRule" ? "verticalRuleExpand" : "horizontalRuleExpand"), 200);
}
function gameOver(){
    GC.welcome.className = "";
    GC.rule.className = "hidden";
    GC.playing = false;
    for (const key in GC.enemyWords) {
        explode(GC.enemyWords[key]);
    }
}
class Word {
    constructor(name, word, childL, childR) {
        this.name = name;
        this.word = word;
        this.childL = childL;
        this.childR = childR;
    }
}
function createWord() {
    let wordOptions = GC.words.filter(a => a.length > GC.difficulty - 3 && a.length <= GC.difficulty + 3) //reduce word list to words of appropriate length for current difficulty
    for (const letter of GC.currentWords) { //remove words starting with the same letter as any current words
        wordOptions = wordOptions.filter(a => a.charAt(0) !== letter)
    }
    console.log("words after reduction: " + wordOptions)
    if (wordOptions.length === 0) { //if word options reaches 0 - do the same as above with the backup wordlist
        let newOptions = backupWords.filter(a => a.length > GC.difficulty - 1 && a.length <= GC.difficulty + 3)
        for (const letter of GC.currentWords) {
            newOptions = newOptions.filter(a => a.charAt(0) !== letter)
        }
        wordOptions = [...wordOptions, ...newOptions] //then add it to the options
    }
    //#region ------------- create DOM elements ------------
    const word = document.createElement("div"); 
    const childR = document.createElement("span");
    const childL = document.createElement("span");
    word.className = "words";
    childR.className = "preLetters";
    GC.game.appendChild(word);
    word.appendChild(childL); 
    word.appendChild(childR);
    //#endregion -------------------------------------------
    do {
        childR.innerText = wordOptions[Math.floor(Math.random() * wordOptions.length)]; //I should also sanitize this just to be safe
    } while (GC.enemyWords[childR.innerText.charAt(0)]) //should never happen, but I already had this here from a previous implemenation, just keeps trying again for a new word if there's already a word with the same first letter
    let tempHold = childR.innerText;
    GC.words.splice(GC.words.indexOf(tempHold),1); //removes word from word list
    let cancel = setTimeout(a=> { //then adds it back in 10 seconds later, provided game is still going
        GC.words.push(tempHold);
        if (!GC.playing){
            clearTimeout(cancel)
        }
    }, 10000)
    GC.currentWords += childR.innerText.charAt(0); //adds the first letter of this word to a string, this is used in the ForOf loop at the start of this function
    let luxurious = new Word(childR.innerText.charAt(0), word, childL, childR) // create new Word instance with direct reference to DOM elements - luxurious, because it's a classy word.  Get it?
    GC.enemyWords[childR.innerText.charAt(0)] = luxurious; //push new instance into enemyWords with first letter as the key
    move(word);
}
function typing(e) {
    // ------------- testing purposes only
    if (e.key.match(/[1-9]/)) GC.difficulty = e.key
    // ---------------------------------------
    if (GC.playing){
        GC.keyCount++;
        let key = (a => {
            return e.key.length === 1 && e.key.match(/[a-z A-Z_-]/i) ? e.key.toLowerCase() : ''
        })()
        if (!key) return //if non-letter typed, exit function.
        if (!GC.target.word) {  // check if Game Controller has a current target
            // GC.target = (document.querySelector(`#${key}`) || {}) // assign a word on the screen with the matching first letter as target, or do nothing.
            GC.target = (GC.enemyWords[key] || {}) // assign a word on the screen with the matching first letter as target, or do nothing.
        }
        // ------- if above failed, subtract score ----------(note this is a sequential if, not an else)
        if (!GC.target.word) {
            scoreDown()
        }
        else { // --------- or if it didn't fail, start doing things
            if (key === GC.target.childR.innerText.charAt(0)) {
                GC.score++;
                GC.streak++;
                GC.target.childL.innerText += GC.target.childR.innerText.charAt(0);
                GC.target.childR.innerText = GC.target.childR.innerText.slice(1);
                GC.target.childR.className = "untypedLetters";
                GC.target.childL.className = "typedLetters";
            }
            else {
                scoreDown();
            }
            //-----------
            if (GC.target.childR.innerText.length === 0) {
                GC.currentWords = GC.currentWords.replace(GC.target.childL.innerText.charAt(0), "")
                GC.target.childR.className = "";
                GC.target.childL.className = "postLetters";
                explode(GC.target);
            }
        }
    }
    else{ //this else statement applies to theme selection menu
        let key = (a => {
            return e.key.length === 1 && e.key.match(/[a-zA-Z_-]/i) ? e.key.toLowerCase() : ''
        })()
        GC.input.innerHTML += key;
        if (e.keyCode === 13) { //enter
            startGame(GC.input.innerText);
        }
        if (e.keyCode === 8) { //backspace
            GC.input.innerHTML = GC.input.innerHTML.substring(0, GC.input.innerHTML.length-1);
        }
    }
}
function move(word) {
    let speed = 0.09 + GC.difficulty * 0.01; //I found 0.1 to work well as a base, increase by 10% for each level of difficulty
    if (getOrientation() === "landscape") {
        const wh = window.innerHeight;
        word.style.top = Math.floor(Math.random() * (wh - wh * 0.15)) + wh * 0.05 + "px"; // word spawn range is from top 5% to bottom 10% to make room for Unsplash attribution
        word.style.left = "100%";
        word.timer = setInterval(a => {
            word.style.left = parseFloat(word.style.left) - speed + "%";
            if (parseFloat(word.style.left) <= 5) { //gameOver when word reaches Left 5%;
                gameOver();
            }
            if (!GC.playing) {
                clearInterval(word.timer);
            }
        }, 17)
        //add up and down animation here
    }
    else {
        word.style.right = Math.floor(Math.random() * (window.innerWidth - word.offsetWidth - 50)) + 25 + "px"; //randomise word position along top, normalizing for the width of the word and a 25px margin.
        word.style.bottom = "100%";
        word.timer = setInterval(a => {
            word.style.bottom = parseFloat(word.style.bottom) - speed + "%";
            if (parseFloat(word.style.bottom) <= 5) { //gameOver when word reaches bottom 5%;
                gameOver();
            }
            if (!GC.playing) {
                clearInterval(word.timer);
            }
        }, 17)
        //add left and right animation here
    }
}

function explode(target) {
    //kill the completed word
    //idea: separate each letter into it's own object
    clearInterval(target.word.timer);
    target.childL.remove();
    target.childR.remove();
    delete GC.enemyWords[target.name];
    target.word.remove();
    GC.target = {};
    GC.childR = {};
    GC.childL = {};
    //destroy everything
}
function scoreDown() {
    if (GC.streak > GC.longStreak) {
        GC.longStreak = GC.streak
    }
    GC.streak = 0;
    GC.score--;
}