
let currentSong = new Audio()
let songUL;
let songs;
let currFolder;
let ele = document.querySelector(".playlist")

async function getSongs(folder) {
  // Make sure to point to the correct folder path in your deployed site
  let a = await fetch(`/${folder}/`);
  let response = await a.text();

  let div = document.createElement("div");
  div.innerHTML = response;

  let as = div.getElementsByTagName("a");
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(
        element.href
          .split(`/${folder}/`)[1]
          .replaceAll("%20", " ")
      );
    }
  }

  // Update currFolder so other functions can use the correct path
  currFolder = folder;
  return songs;
}



//Attach an event listener to each song element
function playMusic(track, paused = false) {
  if (!currentSong) return;

  currentSong.pause(); // Pause current playback
  currentSong.src = `/${currFolder}/${encodeURIComponent(track)}`;
  currentSong.load();
  currentSong.currentTime = 0;

  currentSong.oncanplaythrough = async () => {
    if (!paused) {
      try {
        await currentSong.play();
        play.src = "/img/pause.svg";
      } catch (err) {
        console.warn("Play failed:", err);
      }
    } else {
      play.src = "/img/play.svg";
    }
  };
  
  document.querySelector(".songInfo").innerHTML = decodeURI(track);
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
}





function createSonglist() {
songUL = document.querySelector(".songList").getElementsByTagName("ul")[0];
songUL.innerHTML = "";

for (const song of songs) {
  songUL.innerHTML = songUL.innerHTML + `<li>
                 <img class="invert musicLogo" src="/img/music.svg" alt="">
                 <div class="info">
                 <div>${song}</div>
                 <div>Jakhar</div>
                 </div>
                 <div class="playNow">
                 <span>Play Now</span>
                 <img class="invert svg-width" src="/img/play.svg" alt="">
                 </div>
                 </li>
                 <hr class="hr-line">`
                }
}


  function formatTime(seconds) {
  if (isNaN(seconds)) return "00:00";

  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

let listenersAdded = false;

function eventListeners() {
  if(listenersAdded) return;

 document.querySelector(".songList").addEventListener("click", (e) => {
   const li = e.target.closest("li");
   if (!li) return; // Clicked something else, not a list item
   const songName = li.querySelector(".info").firstElementChild.textContent.trim();
   // ✅ This will run every time
  playMusic(songName);
  play.src = "/img/pause.svg"
});


// Attach event listener to play, next and previous
// Listen for timing event
currentSong.addEventListener("timeupdate", () => {
  document.querySelector(".songTime").innerHTML = `${formatTime(Math.ceil(currentSong.currentTime))} / ${formatTime(Math.ceil(currentSong.duration))}`
  document.querySelector(".songTime").style.width = "108px"
  document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
})

// Add event listener to seekbar
document.querySelector(".seekbar").addEventListener("click", (e) => {
  let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
  document.querySelector(".circle").style.left = percent + "%";
  currentSong.currentTime = ((currentSong.duration) * percent) / 100
  if (!(currentSong.paused)) {
    play.src = "/img/pause.svg"
  }
})
document.querySelector(".songInfo").style.width = "145px"

// Add event listener to previous and next
previous.addEventListener("click", () => {
  let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
  let index = songs.indexOf(currentFile);
  if ((index - 1) >= 0) {
    playMusic(songs[index - 1]);
  }
});

next.addEventListener("click", () => {
  let currentFile = decodeURIComponent(currentSong.src.split("/").pop());
  let index = songs.indexOf(currentFile);
  if ((index + 1) < songs.length) {
    playMusic(songs[index + 1]);
  }
});
play.addEventListener("click", ()=>{
  if (currentSong.paused) {
  currentSong.play()
  play.src = "/img/pause.svg"
  }
  else {
    currentSong.pause()
    play.src = "/img/play.svg"
  }
})

  // Add event to volume
  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    currentSong.volume = parseInt(e.target.value) / 100
  })

  // Add event listener to volume track
document.querySelector(".volume>img").addEventListener("click",e=>{
  if (e.target.src.includes("volume.svg")) {
    e.target.src = "/img/mute.svg"
    currentSong.volume = 0;
    document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
  }
  else{
    e.target.src = "/img/volume.svg"
    currentSong.volume = .1
    document.querySelector(".range").getElementsByTagName("input")[0].value = 10
  }
})

listenersAdded = true
}

function changeDisplay() {
  document.querySelector(".footer").style.bottom = "7px"
  document.querySelector(".playbar").hidden = false;
  if (document.body.clientWidth <= 768) {
    document.querySelector(".library").style.height = "80vh";
    document.querySelector(".main-playList").style.height = "calc(75vh + 3px)";
    
    let playPod = document.querySelector(".play-pod")
    playPod.style.height = `50vh`
  } else {
    document.querySelector(".library").style.height = "79vh";
    document.querySelector(".main-playList").style.height = "calc(79vh + 3px)";
  }
  document.querySelector(".back").hidden = false; 
  ele.style.display = "none"
  let playPod = document.querySelector(".play-pod")
  playPod.style.height = `39vh`
  document.querySelector(".songList").style.display = "block"
  document.querySelector(".podcast").style.display = "none"
}

async function displayAlbums() {
  let albums = await fetch("/songs/index.json").then(res => res.json());

for (let folder of albums) {
  let info = await fetch(`/songs/${folder}/info.json`).then(res => res.json());
let cardContainer = document.querySelector(".cardContainer")
  cardContainer.insertAdjacentHTML("beforeend", `
    <div class="card flex column" data-folder="${folder}" id="card">
      <button id="play-button" class="play-button no-border flex justify-center align-center">
        <img src="/img/play.svg" alt="Play">
      </button>
      <div class="image-card">
        <img src="/songs/${folder}/cover.jpg" alt="image">
      </div>
      <span class="card-child">
        <a href="#f">${info.title}</a>
      </span>
      <span class="flex artist">
        <a href="/artist/4f7KfxeHq9BiylGmyXepGt">${info.description}</a>
      </span>
    </div>
  `);
}

Array.from(document.getElementsByClassName("card")).forEach(e => {
  e.addEventListener("click", async (item) => {
    await getSongs(`songs/${item.currentTarget.dataset.folder}`)
    main()
    playMusic(songs[0])

    document.querySelector(".hamburger").classList.remove("invert-part")
    document.querySelector(".hamburger").classList.add("invert")
    setTimeout(() => {
      document.querySelector(".hamburger").classList.remove("invert")
      document.querySelector(".hamburger").classList.add("invert-part")
    }, 900);
  })
}
)

}
displayAlbums()

async function main() {
  changeDisplay()
// Display all albums on page
 
   playMusic(songs[0], true)
  createSonglist()
  eventListeners()
 
  
}


function handleScroll(container, direction = "forward") {
  if (!container) return;

  const scrollWidth = container.scrollWidth;
  const clientWidth = container.clientWidth;
  const currentScroll = container.scrollLeft;

  // stop if no scroll possible
  if (scrollWidth <= clientWidth) return;

  const maxScroll = scrollWidth - clientWidth;
  const scrollStep = maxScroll > clientWidth ? maxScroll / 2 : maxScroll;

  const targetScroll = direction === "forward"
    ? Math.min(currentScroll + scrollStep, maxScroll)
    : Math.max(currentScroll - scrollStep, 0);

  container.scrollTo({ left: targetScroll, behavior: "smooth" });
}

// usage:
document.getElementById("scroll-for").addEventListener("click", () => {
  handleScroll(document.querySelector(".cardContainer"), "forward");
});

document.getElementById("scroll-pre").addEventListener("click", () => {
  handleScroll(document.querySelector(".cardContainer"), "backward");
});



// Adding event listener to hamburger
document.querySelector(".hamburger").addEventListener("click", () => {
  document.querySelector(".left-parent").style.left = "0%"
})

// Adding event listener to close button
document.querySelector(".close").addEventListener("click", () => {
  document.querySelector(".left-parent").style.left = "-100%"
})



// Adding event listener to back fromm playlist
function back() {
  document.querySelector(".playbar").hidden = true;
  ele.style.display = "flex"
  document.querySelector(".songList").style.display = "none"
  document.querySelector(".hr-line").style.display = "none"
  document.querySelector(".back").hidden = true;
  document.querySelector(".library").style.height = "89vh";
  document.querySelector(".main-playList").style.height = "calc(89vh + 3px)";
  document.querySelector(".podcast").style.display = "flex"
  

  document.querySelector(".footer").style.bottom = "50px";
  document.querySelector(".songTime").innerHTML = "00:00 / 00:00"

  
  if (document.body.clientWidth > 1006) {
    document.querySelector(".play-pod").style.height = "169px"
  }
  else if (document.body.clientWidth < 769) {
    let playPod = document.querySelector(".play-pod")
    playPod.style.height = `auto`
  }
  currentSong.pause()
}


if (document.body.clientWidth < 1007 && document.body.clientWidth > 769) {
  document.querySelector(".play-pod").style.height = "50vh"
}





