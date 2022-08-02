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
    backgroundCover: document.querySelector("#backgroundCover"),
    words: [],
    difficulty: 1,
    target: {},
    childR: {},
    childL: {},
    keyCount: 0,
    streak: 0,
    longStreak: 0,
    score: 0,
    hit: false,
    currentWords: "",
    playing: true //change this once I implement levels and launch screen.
}
let backupWords = ['ant','box','car','dog','egg','fog','gin','hot','ice','jam','kin','lie','map','nil','off','pet','qin','red','sly','tee','urn','vat','why','you','zen',
'atom','bare','cave','dire','epic','fate','goal','heat','iron','joke','kept','list','made','note','ouch','play','quit','rest','sell','told','unit','volt','wind','xray','yarn','zeus',
'apart','bring','close','delve','ember','finch','ghost','heart','ideal','joint','knife','level','moist','noise','ounce','proud','quiet','rapid','solid','teach','under','voice','whale','xenon','yacht','zebra',
'aurora','bright','create','docile','earned','finder','golden','honest','ironic','joking','knight','lowest','modest','novice','orient','played','quoted','reward','spoilt','taught','undone','violet','whisky','xanadu','yellow','zenith'];
window.addEventListener("keydown", typing);

function getOrientation(){
        switch(true){
            case window.innerWidth / window.innerHeight > 1.25:
                return "landscape";
            case window.innerHeight / window.innerWidth > 1.25:
                return "portrait";
            default:
                return "squarish";
        }
    }
newBackground("dessert");
function newBackground(theme){
    const background = document.querySelector("#background");
    const attribution = document.querySelector("#attribution");
    function appendix(){
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
    .then(j => {console.log(j);
        GC.backgroundCover.style.opacity = 1;
        GC.backgroundCover.src = j.urls.thumb; //this works, but look into blurhash
        setTimeout(a => GC.backgroundCover.src = j.urls.small, 1000)
        background.src = j.urls.raw+appendix();
        attribution.innerHTML = `Photo by <a href="${j.user.links.html}?utm_source=Typing_Game&utm_medium=referral" target="_blank">${j.user.name}</a> on <a href="https://unsplash.com/?utm_source=Typing_Game&utm_medium=referral" target="_blank">Unsplash</a>`

        background.addEventListener('load', loaded)
    })
    .catch(err => {
        if (theme) {
            newBackground('');
            noImageFound();
        }
        else{
        console.log("Why don't I see anything?", err);
        }
    });
}
function loaded(){
    GC.backgroundCover.style.opacity = 0;
    GC.backgroundCover.style.transition = "opacity 1s";
}
function noImageFound(){
    //brief pop-up to explain why background is abstract and doesn't match typed theme
}

newWords("dessert")
function newWords(theme){
    GC.words = [];
    fetch(`https://api.datamuse.com/words?rel_jja=${theme}&max=200`)
    .then(r => r.json())
    .then(j => {
        for (const word of j) {
            GC.words.push(word.word);
        }
        if (GC.words.length < 25){
            fetch(`https://api.datamuse.com/words?rel_jjb=${theme}&max=200`)
            .then(r => r.json())
            .then(j => {
                for (const word of j){
                    GC.words.push(word.word)
                }
                noWordsFound();
            })
        }
        setTimeout(createWord,200);
    })
    .catch(err => {
        console.log("Why can't I read anything?", err);
        noWordsFound();
    });
}
function noWordsFound(){
    if (GC.words.length < 25){
        fetch(`https://api.datamuse.com/words?ml=error&max=200`)
        .then(r => r.json())
        .then(j => {
            for (const word of j){
                GC.words.push(word.word)
            }
            if(GC.words.length < 25){
                GC.words = [...GC.words, ...backupWords]; //brief pop-up to explain that the typed theme didn't return enough words.
            }
        })
        .catch(err => {console.log("datamuse API is down, using backup words")})
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
function highScore(score){
    const name = "";//get player name
    //sort list
    sendScore({name, score})

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

function startGame(){

}

function createWord(){
    const word = document.createElement("div");
    const childR = document.createElement("span");
    const childL = document.createElement("span");
    console.log(GC.words);
    let wordOptions = GC.words.filter(a => a.length > GC.difficulty-1 && a.length <= GC.difficulty+3) //reduce word list to words of appropriate length for current difficulty
        for (const letter of GC.currentWords) { //remove words starting with the same letter as any current words
            wordOptions = wordOptions.filter(a => a.charAt(0) !== letter)
        }
        console.log("words after reduction: " + wordOptions)
    if (wordOptions.length === 0){ //if word options reaches 0 - do the same as above with the backup wordlist
        let newOptions = backupWords.filter(a => a.length > GC.difficulty-1 && a.length <= GC.difficulty+3)
        for (const letter of GC.currentWords) {
            newOptions = newOptions.filter(a => a.charAt(0) !== letter)
        }
        wordOptions = [...wordOptions, ...newOptions] //then add it to the options
    }

    do{
        childR.innerText = wordOptions[Math.floor(Math.random()*wordOptions.length)];
    }while (document.querySelector(`#${childR.innerText.charAt(0)}`)) //should never happen, but I already had this here from a previous implemenation, second catch for two words starting with the same letter.
    word.className = "words";
    childR.className = "letters";
    childL.className = "typedLetters";
    GC.game.appendChild(word);
    word.appendChild(childL);
    word.appendChild(childR);
    word.id = childR.innerText.charAt(0);
    childL.id = childR.innerText.charAt(0)+"L";
    childR.id = childR.innerText.charAt(0)+"R";
    GC.currentWords += childR.innerText.charAt(0);
    move(word);
}
function typing(e){
    GC.keyCount++;
    let key = (()=>{
        return e.key.length === 1 && e.key.match(/[a-zA-Z]/i) ? e.key.toLowerCase() : ''
    })()
    if (!key) return //if non-letter typed, exit function.
    if (GC.target.childNodes === undefined){  // check if Game Controller has target
        GC.target = (document.querySelector(`#${key}`) || {}) // assign a word on the screen with the matching first letter as target, or do nothing.
    }
    // ------- if above failed, subtract score
    if (GC.target.childNodes === undefined){
        scoreDown()
    }
    else{
        // --------- or if it didn't fail, start doing things
        if (!GC.hit){ // check if this is the first hit on that word or not
            GC.hit = true;
            GC.childL = document.querySelector(`#${key}L`);
            GC.childR = document.querySelector(`#${key}R`);
        }
        //---------
        if (key === GC.childR.innerText.charAt(0)){
            GC.score++;
            GC.streak++;
            GC.childL.innerText += GC.childR.innerText.charAt(0);
            GC.childR.innerText = GC.childR.innerText.slice(1);
        }
        else{
            scoreDown();
        }
        //-----------
        if (GC.childR.innerText.length === 0){
            GC.currentWords = GC.currentWords.replace(GC.childL.innerText.charAt(0), "")
            GC.hit = false;
            explode(GC.target);
        }
    }
}
function move(word){
    let speed = 0.1; //plus some difficulty modifier
    if (getOrientation() === "landscape"){
        word.style.top = Math.floor(Math.random()*(window.innerHeight-80))+50+"px";
        word.style.right = "0%";
        const timer = setInterval(a => {
            word.style.right = parseFloat(word.style.right)+speed+"%";
            if (parseFloat(word.style.right) >= 90){
                GC.playing = false;
            }
            if (!GC.playing){
                clearInterval(timer)
                explode(word)
            }
        }, 17)
        //add up and down animation here
    }
    else{
        word.style.right = Math.floor(Math.random()*(window.innerWidth-word.offsetWidth-50))+25+"px";
        word.style.top = "0%";
        const timer = setInterval(a => {
            word.style.top = parseFloat(word.style.top)+speed+"%";
            if (parseFloat(word.style.top) >= 90){
                GC.playing = false;
            }
            if (!GC.playing){
                clearInterval(timer)
                explode(word)
            }
        }, 17)
        //add left and right animation here
    }
}

function explode(target){
    //kill the completed word
    //idea: separate each letter into it's own object
    console.log(target.id)
    let childL = document.querySelector(`#${target.id}L`);
    let childR = document.querySelector(`#${target.id}R`);
    childL.remove();
    childR.remove();
    target.remove();
    GC.target = {};
    GC.childR = {};
    GC.childL = {};
    //destroy everything
}
function scoreDown(){
    if (GC.streak > GC.longStreak){
        GC.longStreak = GC.streak
    }
    GC.streak = 0;
    GC.score--;
}
class Word{
    constructor(word){
        this.word = word;    
    }
}
let enemyWords = [];