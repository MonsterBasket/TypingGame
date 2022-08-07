//#region-----list of features-----
//1. choose a theme - COMPLETE
// - after choosing a theme, it will load a random background image from that theme 
// - from unsplash, and a list of words related to that theme

//2. playing the game - COMPLETE
// - words will slowly start floating from right to left from the selected word list
// - starting slowly, and shorter words (3-5 letters).
// - as time progresses, words will appear faster and be longer in length

//3. scoring - COMPLETE
// - additional points for correct letters, minus points for missing letters?
// - record accuracy (total correct / total typed) and longest streak

//4. high scores (optional) - COMPLETE
// - save top scores to a server, just enter your name when you finish a round and make the top 10

//5. technical - COMPLETE
// - handling specific event listeners is key.  Just copy Ztype's approach: when the first letter of
// - a word is pressed that locks the user onto that word until the word is complete - it may be as simple
// - as saving a reference to that word into a "target" variable?

//6. Next level - partially complete; no change of themes between rounds - however it's not such a bad thing, games aren't very long, you don't want distractions between rounds.
// - Every 3? levels the user can pick a new theme.  Three options will float around in the middle of the screen
// - user can't die on this stage (game is essentially paused) and there is no scoring.  Type the name of the
// - theme to choose, this will trigger a new background image and word list.
//#endregion

let GC = {
    game: document.querySelector("#game"),
    rule: document.querySelector("#rule"),
    welcome: document.querySelector("#welcome"),
    roundInfo: document.querySelector("#roundInfo"),
    error: document.querySelector("#error"),
    input: document.querySelector("#input"),
    backgroundCover: document.querySelector("#backgroundCover"),
    gameOver: document.querySelector("#gameOver"),
    scores: document.querySelector("#scores"),
    roundDiv: document.querySelector("#roundDiv"),
    scoreSpan: document.querySelector("#scoreSpan"),
    accuracySpan: document.querySelector("#accuracySpan"),
    streakSpan: document.querySelector("#streakSpan"),
    wordsSpan: document.querySelector("#wordsSpan"),
    phoneCover: document.querySelector("#phoneCover"),
    words: [],
    difficulty: 0,
    target: {},
    keyCount: [0, 0],
    streak: 0,
    longStreak: 0,
    highScores: [],
    score: 0,
    currentWords: "",
    enemyWords: {},
    playing: false,
    wordCount: 0,
    totalWords: 0,
    lastWord: false,
    typeLock: false
}
const backupWords = ['ant', 'box', 'car', 'dog', 'egg', 'fog', 'gin', 'hot', 'ice', 'jam', 'kin', 'lie', 'map', 'nil', 'off', 'pet', 'qin', 'red', 'sly', 'tee', 'urn', 'vat', 'why', 'you', 'zen',
    'atom', 'bare', 'cave', 'dire', 'epic', 'fate', 'goal', 'heat', 'iron', 'joke', 'kept', 'list', 'made', 'note', 'ouch', 'play', 'quit', 'rest', 'sell', 'told', 'unit', 'volt', 'wind', 'xray', 'yarn', 'zeus',
    'apart', 'bring', 'close', 'delve', 'ember', 'finch', 'ghost', 'heart', 'ideal', 'joint', 'knife', 'level', 'moist', 'noise', 'ounce', 'proud', 'quiet', 'rapid', 'solid', 'teach', 'under', 'voice', 'whale', 'xenon', 'yacht', 'zebra',
    'aurora', 'bright', 'create', 'docile', 'earned', 'finder', 'golden', 'honest', 'ironic', 'joking', 'knight', 'lowest', 'modest', 'novice', 'orient', 'played', 'quoted', 'reward', 'spoilt', 'taught', 'undone', 'violet', 'whisky', 'xanadu', 'yellow', 'zenith'];
class Word {
    constructor(name, word, childL, childR) {
        this.name = name;
        this.word = word;
        this.childL = childL;
        this.childR = childR;
    }
}
window.addEventListener("keydown", typeSelect)
function typeSelect (e){
    // ------------- testing purposes only - difficulty change
    if (e.key >= 1 && e.key <= 9) GC.difficulty = e.key;
    // ---------------------------------------
    if (GC.typeLock) return
    if(e.keyCode == 32) { //spacebar - this prevents page scroll when space is pressed
        e.preventDefault();
      }
    if (GC.playing){
        playTyping(e);
    }
    else{
        if (GC.difficulty > 0){
            scoresTyping(e); //Game Over/scores menu (difficulty is set to 1 as the first round starts, and not reset to 0 until we're done here.)
        }
        else {
            menuTyping(e);
        }  
    } 
}
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
newBackground("type writer");
function newBackground(theme) {
    const background = document.querySelector("#background");
    const attribution = document.querySelector("#attribution");
    function appendix() {
        return getOrientation() === "portrait" ? `&fit=crop&h=${window.innerHeight}&fit=max` : `&fit=crop&w=${window.innerWidth}&fit=max`
    }
    return fetch(`https://api.unsplash.com/photos/random?query=${theme}&orientation=${getOrientation()}`, {
        headers: {
            "Authorization": "Client-ID etHez9ur_31n4YuNvHsHVpUzp9btB4v-C7JiGbtEBG8"
        }
    })
        .then(r => r.json())
        .then(j => {
            GC.backgroundCover.style.opacity = 1;
            GC.backgroundCover.src = j.urls.thumb; //this works, but look into blurhash
            setTimeout(a => GC.backgroundCover.src = j.urls.small, 1000) //not great, just trying to smooth the load transition
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
    GC.backgroundCover.style.transition = "opacity 2s";
}
function noImageFound() {
    //brief pop-up to explain why background is abstract and doesn't match typed theme
}
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
        })
        .catch(err => {
            console.log("Why can't I read anything?", err);
            noWordsFound();
        });
}
function noWordsFound() {
    //brief pop-up to explain that the typed theme didn't return enough words.
    let temp = [...GC.words];
    newWords("error")
    setTimeout(a=>{
        GC.words = [...GC.words, ...temp]
        if (GC.words.length < 30) { //this would be if there's an issue with Datamuse API
            GC.words = [...GC.words, ...backupWords]; 
        }
    }, 500)
}
function startGame(theme) {
    GC.welcome.className = "hidden";
    GC.playing = true;
    GC.streak = 0;
    GC.longStreak = 0;
    GC.difficulty = 0;
    GC.currentWords = "";
    GC.keyCount = [0,0];
    GC.score = 0;
    GC.totalWords = 0;
    GC.input.value = "";
    setRule();
    newBackground(theme);
    newWords(theme);
    setTimeout(newRound, 1000);
}
function setRule(){
    GC.rule.className = getOrientation() === 'landscape' ? "verticalRule" : "horizontalRule";
    setTimeout(a=> GC.rule.classList.add(GC.rule.className === "verticalRule" ? "verticalRuleExpand" : "horizontalRuleExpand"), 200);
}
function newRound(){
    GC.difficulty++;
    GC.score += GC.streak;
    GC.wordCount = 0;
    GC.roundInfo.className = "";
    GC.roundInfo.innerText = "Round "+GC.difficulty;
    setTimeout(a => {
        GC.roundInfo.className = "hidden";
        GC.lastWord = false;
        
    }, 2500)
    setTimeout(function loop() {
        let modifier = GC.difficulty >16 ? 16 : GC.difficulty; //caps speed reduction to 1.6 seconds, which means at round 16 words appear every 0-1 second.
        const rand = Math.round(Math.random() * (1000)) + 1600 - modifier * 100; // 1 word every 1.5 seconds, +/- 0.5 seconds.  Base time decreases 100ms for each level of difficulty (that adds up fast!)
        if (!GC.lastWord && GC.playing){ //stop making words after the last word - see first line of createWord.
            createWord();
            setTimeout(() => {
                loop();  
            }, rand);
        }
    }, 3000);
}
function gameOver(){
    GC.typeLock = true;
    setTimeout(a=> GC.typeLock = false, 2000) //lock out typing for 2 sec.
    loadScores();
    GC.roundDiv.innerText = `You made it to round ${GC.difficulty}!`;
    GC.scoreSpan.innerText = GC.score;
    GC.accuracySpan.innerText = (Math.round((GC.keyCount[1]/GC.keyCount[0] * 100) * 100) / 100 || 0)+"%";
    GC.streakSpan.innerText = (GC.longStreak || GC.streak);
    GC.wordsSpan.innerText = GC.wordCount;
    GC.gameOver.className = ""; //put a timeout on this once I implement explode animation
    GC.rule.className = "hidden";
    GC.playing = false;
    for (const key in GC.enemyWords) {
        explode(GC.enemyWords[key]);
    }
}
function createWord() {
    GC.wordCount++;
    if (GC.wordCount >= 5 + GC.difficulty * 1.3){
        GC.lastWord = true;
    }
    let bottomRange = GC.difficulty -3;
    let topRange = GC.difficulty +3;
    let wordOptions = [];
    do{
        wordOptions = GC.words.filter(a => a.length > bottomRange && a.length <= topRange) //reduce word list to words of appropriate length for current difficulty
        bottomRange--;
        topRange++;
        for (const letter of GC.currentWords) { //remove words starting with the same letter as any current words
            wordOptions = wordOptions.filter(a => a.charAt(0) !== letter)
        }
    } while (wordOptions.length === 0)
    console.log(wordOptions);
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
        childR.innerText = wordOptions[Math.floor(Math.random() * wordOptions.length)]; 
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
function playTyping(e) {
    GC.keyCount[0]++;
    let key = (a => {
        return e.key.length === 1 && e.key.match(/[a-z 0-9A-Z_-]/i) ? e.key.toLowerCase() : ''
    })()
    if (!key) return //if non-letter typed, exit function.
    if (!GC.target.word) {  // check if Game Controller has a current target
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
            GC.keyCount[1]++;
            GC.target.childL.innerText += GC.target.childR.innerText.charAt(0);
            GC.target.childR.innerText = GC.target.childR.innerText.slice(1);
            GC.target.childR.className = "untypedLetters";
            GC.target.childL.className = "typedLetters";
        }
        else {
            scoreDown();
        }
        //-----------
        if (GC.target.childR.innerText.length === 0) { //word is fully typed
            GC.totalWords ++;
            GC.currentWords = GC.currentWords.replace(GC.target.childL.innerText.charAt(0), "")
            GC.target.childR.className = "";
            GC.target.childL.className = "postLetters";
            explode(GC.target);
            if (GC.currentWords === "" && GC.lastWord){
                setTimeout(newRound, 1000);
            }
        }
    }
}
function scoresTyping(e) {
    let key = e.key.length === 1 ? e.key : '';
    let letter = e.key.length === 1 && e.key.match(/[a-z 0-9A-Z_-]/i) ? true : false;
    if (GC.myName[1].innerHTML === "ENTER YOUR NAME" && letter){
        GC.myName[1].innerHTML = key; //overwrite "ENTER YOUR NAME" with first valid keystroke
    }
    else{
        GC.myName[1].innerHTML += key; //just typing
        if (GC.myName[1].scrollWidth > GC.myName[1].clientWidth){
            GC.myName[1].innerHTML = GC.myName[1].innerHTML.substring(0, GC.myName[1].innerHTML.length-1);
        }
    }
    if (GC.myName[0] === 0){ // next keypress after entering name reverts to welcome message
        GC.typeLock = true;
        setTimeout(a=> GC.typeLock = false, 1000);
        GC.gameOver.className = "hidden";
        GC.welcome.className = "";
        GC.difficulty = 0;
        return
    }
    if (e.keyCode === 13) { //keycode 13 is enter
        if (GC.myName[1].innerHTML !== "ENTER YOUR NAME" && GC.myName[1].innerHTML !== ""){ //submit name if not blank or default
            GC.typeLock = true;
            const trimmed = {"id": Date.now(),
                                "name": GC.myName[1].innerText.trim(),
                                "score": GC.score}
            GC.highScores[GC.index] = trimmed;
            sendScore(GC.highScores);
            GC.myName[1].className = "";
            GC.myName[0] = 0;
            setTimeout(a=> GC.typeLock = false, 1000) //lock out typing for 1 sec.
        }
        else alert("I said enter your name!");
    }
    if (e.keyCode === 8) { //keycode 8 is backspace... this enables backspace... to... backspace...
        GC.myName[1].innerHTML = GC.myName[1].innerHTML.substring(0, GC.myName[1].innerHTML.length-1);
    }   
}
function menuTyping(e){
    let key = (a => {
        return e.key.length === 1 && e.key.match(/[a-zA-Z_-]/i) ? e.key.toLowerCase() : ''
    })()
    GC.input.value += key;
    if (e.keyCode === 13) { //enter
        startGame(GC.input.value);
    }
    if (e.keyCode === 8) { //backspace
        GC.input.value = GC.input.value.substring(0, GC.input.value.length-1);
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
//#region ------  Leaving this here as a working solution for localhost, because I don't trust my live hosted solution yet!
// function loadScores() {
//     return fetch("http://localhost:3000/scores")
//         .then(resp => resp.json())
//         .then(json => {
//             console.log(json);
//             GC.highScores = [];
//             for (const score of json) {
//                 GC.highScores.push(score);
//             }
//             GC.highScores.push({name: "ENTER YOUR NAME", score: GC.score})
//             GC.highScores.sort((a, b) => {
//                 if (parseInt(a.score) < parseInt(b.score)) return 1;
//                 if (parseInt(a.score) > parseInt(b.score)) return -1;
//                 return 0;
//             });
//             const index = GC.highScores.findIndex(a => a.name === "ENTER YOUR NAME");
//             GC.scores.innerHTML = "";
//             for (let i = 0; i < GC.highScores.length; i++) {
//                 if (i === index){
//                     GC.scores.innerHTML += `<div><span class="scoreInput">ENTER YOUR NAME</span> - <span>${GC.highScores[i].score}</span></div>`
//                 }
//                 else{
//                     GC.scores.innerHTML += `<div><span>${GC.highScores[i].name}</span> - <span>${GC.highScores[i].score}</span></div>`
//                 }
//             }
//             GC.myName = [1,document.querySelector(".scoreInput")]; 
//             GC.scores.scrollTo(0,GC.myName[1].offsetTop - GC.scores.offsetTop - GC.scores.offsetHeight - 10);
//         })
//         .catch(err => console.log("loading scores failed:", JSON.stringify(err.message)));
// }
// function sendScore(score) {
//     return fetch(`http://localhost:3000/scores`, {
//         method: "POST",
//         headers: {
//             "Content-Type": "application/json",
//             "Accept": "application/json"
//         },
//         body: JSON.stringify(score)
//     })
//         .then(r => {}) //can I just do nothing?
//         .then(obj => {   })
//         .catch(err => console.log("update failed: ", JSON.stringify(err.message)));
// }
//#endregion--------------------------------------
function loadScores() {
    fetch("https://api.jsonbin.io/v3/b/62ee69ffe13e6063dc6e3419",{
        headers:{
            "X-Master-Key": "$2b$10$b3nuivOWvvuuZDzWp67gieefh7JSr.nAJU3top5mPDlmCqp7kqOxq",
            "Content-Type": "application/json",
            "Accept": "application/json"
        }
    })
        .then(resp => resp.json())
        .then(json => {
            console.log(json);
            GC.highScores = [];
            for (const score of json.record) {
                GC.highScores.push(score);
            }
            GC.highScores.push({name: "ENTER YOUR NAME", score: GC.score})
            GC.highScores.sort((a, b) => {
                if (parseInt(a.score) < parseInt(b.score)) return 1;
                if (parseInt(a.score) > parseInt(b.score)) return -1;
                return 0;
            });
            GC.index = GC.highScores.findIndex(a => a.name === "ENTER YOUR NAME");
            GC.scores.innerHTML = "";
            for (let i = 0; i < GC.highScores.length; i++) {
                if (i === GC.index){
                    GC.scores.innerHTML += `<div><span class="scoreInput">ENTER YOUR NAME</span><span>${GC.highScores[i].score}</span></div>`
                }
                else{
                    GC.scores.innerHTML += `<div><span>${GC.highScores[i].name}</span><span>${GC.highScores[i].score}</span></div>`
                }
            }
            GC.myName = [1,document.querySelector(".scoreInput")]; 
            GC.scores.scrollTo(0,GC.myName[1].offsetTop - GC.scores.offsetTop - GC.scores.offsetHeight - 10);
        })
        .catch(err => console.log("loading scores failed:", JSON.stringify(err.message)));
}
function sendScore(score) {
    return fetch(`https://api.jsonbin.io/v3/b/62ee69ffe13e6063dc6e3419`, {
        method: "PUT",
        headers: {
            "X-Master-Key": "$2b$10$b3nuivOWvvuuZDzWp67gieefh7JSr.nAJU3top5mPDlmCqp7kqOxq",
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(score)
    })
        .then(r => r.json())
        .then(obj => {})
        .catch(err => console.log("update failed: ", JSON.stringify(err.message)));
}