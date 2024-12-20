console.log("Lets Write Java Script");
let play = document.querySelector("#play")
let next = document.querySelector("#next")
let previous = document.querySelector("#previous")
let currentSong = new Audio;
let songs; 
let length;
let currFolder;




function formatSeconds(seconds) {
    // Ensure seconds is a non-negative integer
    seconds = Math.max(0, Math.floor(seconds)); // Use Math.max to avoid negative values

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}





async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${currFolder}/`)
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response
    let as = div.getElementsByTagName("a")
    // console.log(as);
    songs = []

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = "";
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li>
                            <img class="invert" src="img/music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")}</div>
                                <div>Alan Walker</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img src="img/play.svg" alt="">
                            </div>
                        </li>
                    </ul>`;
    }

    //Attach an event Listener to each song
    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            // console.log(e.querySelector(".info").firstElementChild.innerHTML);
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })

    })

    return songs;

}





const playMusic = (track, pause = false) => {
    // let audio = new Audio("/Spotify/songs/" + track)
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"

    currentSong.addEventListener("loadedmetadata", () => {
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`;
    }, { once: true }); // Use { once: true } to ensure it runs only once per song
}






async function displayAlbums() {
    let a = await fetch(`./songs`)
    console.log(a);
    
    let response = await a.text();
    // console.log(response);
    let div = document.createElement("div")
    div.innerHTML = response
    let anchors = div.getElementsByTagName("a")
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs") && !e.href.includes("htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            //Get The Meta Data of the folder
            let a = await fetch(`/songs/${folder}/info.json`)
            let response = await a.json();
            // console.log(response);
            cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
                        <svg class="playButton" width="50" height="50" viewBox="0 0 100 100"
                            xmlns="http://www.w3.org/2000/svg">
                            <!-- Background    -->
                            <circle cx="50" cy="50" r="50" fill="#1DB954" />

                            <!-- Play Button -->
                            <polygon points="35,30 35,70 75,50" fill="#000000" />
                        </svg>
                        <img src="/songs/${folder}/cover.jfif" alt="">
                        <h3></h3>
                        <p>${response.description}</p>
                    </div>`
        }
    }

    // Load the Playlist when the card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            // console.log(item, item.currentTarget);
            
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        })

    })
}





async function main() {

    //Display All The albums on the page 
    displayAlbums()


    //Attach an event Listener to each song
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })

    //Listen for time update event
    currentSong.addEventListener("timeupdate", () => {
        // console.log(currentSong.currentTime, currentSong.duration);
        document.querySelector(".songtime").innerHTML = `${formatSeconds(currentSong.currentTime)}/${formatSeconds(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100
    })

    //Adding an event for hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })

    //Adding an event for close button
    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-100%";
    })




    //Adding an event for previous
    previous.addEventListener("click", () => {
        console.log("Previous Clicked");
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
        else {
            playMusic(songs[songs.length - 1])
        }


    })

    //Adding an event for next
    next.addEventListener("click", () => {
        console.log("Next Clicked");
        length = songs.length;
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])

        if ((index + 1) < length) {
            playMusic(songs[index + 1])
        }
        else {
            playMusic(songs[0])
        }

    })

    //Adding An event to Volume
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        // console.log("Setting volume to ", e.target.value, "/100");
        currentSong.volume = (e.target.value) / 100
        if (currentSong.volume > 0) {
            document.querySelector(".volume img").src = document.querySelector(".volume img").src.replace("mute.svg", "volume.svg")
        }
    })

    //Adding an event to mute the volume 
    document.querySelector(".volume img").addEventListener("click", (e) => {
        console.log(e.target);
        if (e.target.src.includes("volume.svg")) {
            e.target.src = e.target.src.replace("volume.svg", "mute.svg")
            // console.log(e.target.src);
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0
            currentSong.volume = 0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg", "volume.svg")
            // console.log(e.target.src);  
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10
        }
    })

} 

main()
