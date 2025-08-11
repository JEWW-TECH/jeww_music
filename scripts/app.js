let audio = document.querySelector("audio")
let isPlaying = false;
let isPaused = true;
let activePlaying = null; // This will store the DOM element of the currently playing button
let musicSector = document.querySelector(".musics-sector");

const controls = () => {
	let videos = document.querySelectorAll(".videos");
	videos.forEach(v => {
		v.addEventListener("click", () => {
			v_url = v.dataset.videos;
			window.open(v_url);
			if(v_url === undefined || v_url === null) {
				window.open("index.html")
			}
		})
	})
	let playPause = document.querySelectorAll(".play-pause");
	
	// We will now handle the play/pause logic through the main additive player
	// to avoid conflicts. This function will primarily handle other events.
	
	// Handle when the current audio track finishes playing
	audio.addEventListener('ended', () => {
		if (activePlaying) {
			activePlaying.style.color = "#29119a"; // Reset to play icon color
			activePlaying.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16">
                    <path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/>
                    <path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/>
                </svg>
            `;
			activePlaying = null; // Clear the active playing button reference
			isPlaying = false;
			isPaused = true;
		}
	});
	
	let downloadBTN = document.querySelectorAll(".download");
	downloadBTN.forEach(download => {
		download.addEventListener("click", () => {
			try {
				let download_data = download.dataset.music;
				localStorage.setItem("download", download_data);
				let download_url = localStorage.getItem("download")
				let a = document.createElement("a");
				a.href = download_url;
				a.download = download_url
				document.body.appendChild(a);
				a.click()
				a.remove();
			}
			catch (err) {
				alert(err)
			}
		})
	})
}

let sideM = document.querySelector(".sidebar-mobile")
let sideNavToggler = document.querySelector(".side-nav-toggler")
let bars = sideNavToggler.querySelectorAll(".bar");
sideNavToggler.addEventListener("click", () => {
	bars[0].classList.toggle("one");
	bars[1].classList.toggle("two")
	bars[2].classList.toggle("three")
	sideM.classList.toggle("active")
});
$("main").on("click", () => {
	sideM.classList.remove("active")
	bars[0].classList.remove("one");
	bars[1].classList.remove("two")
	bars[2].classList.remove("three")
});

// ---- Additive Music Player Logic ----
const player = {
	audio: audio, // Use the existing audio element
	songs: [],
	currentIndex: 0,
	isVisible: false,
	sector: document.querySelector('.musics-sector'),
	playerEl: document.getElementById('music-player'),
	titleEl: document.getElementById('player-title'),
	playPauseBtn: document.getElementById('player-playpause'),
	nextBtn: document.getElementById('player-next'),
	prevBtn: document.getElementById('player-prev'),
	timeEl: document.getElementById('player-time'),
	progressEl: document.getElementById('player-progress'),
	toggleBtn: document.getElementById('player-toggle'),
	showBtn: document.getElementById('show-player-btn'),
};

const playSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-play-btn" viewBox="0 0 16 16"><path d="M6.79 5.093A.5.5 0 0 0 6 5.5v5a.5.5 0 0 0 .79.407l3.5-2.5a.5.5 0 0 0 0-.814z"/><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/></svg>`;
const pauseSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-pause-btn" viewBox="0 0 16 16"><path d="M6.25 5C5.56 5 5 5.56 5 6.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C7.5 5.56 6.94 5 6.25 5m3.5 0c-.69 0-1.25.56-1.25 1.25v3.5a1.25 1.25 0 1 0 2.5 0v-3.5C11 5.56 10.44 5 9.75 5"/><path d="M0 4a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm15 0a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z"/></svg>`;

const fetchSongs = async () => {
	try {
		let res = await fetch('json/music.json');
		let songs = await res.json();
		player.songs = songs;
	} catch (e) {
		console.error("Failed to fetch songs:", e);
	}
};

const formatTime = (sec) => {
	let m = Math.floor(sec / 60);
	let s = Math.floor(sec % 60);
	if (isNaN(m) || isNaN(s)) return '0:00';
	return `${m}:${s < 10 ? '0' : ''}${s}`;
};

// New function to synchronize all play/pause icons
const syncIcons = () => {
	// Reset all song card buttons to the play icon
	document.querySelectorAll(".play-pause").forEach(btn => {
		btn.innerHTML = playSvg;
		btn.style.color = "#29119a";
	});
	
	// Update the main player's button and the current song's card button
	const currentSongButton = document.querySelector(`.play-pause[data-index="${player.currentIndex}"]`);
	if (player.audio.paused) {
		player.playPauseBtn.innerHTML = playSvg;
		if (currentSongButton) {
			currentSongButton.innerHTML = playSvg;
			currentSongButton.style.color = "#29119a";
		}
	} else {
		player.playPauseBtn.innerHTML = pauseSvg;
		if (currentSongButton) {
			currentSongButton.innerHTML = pauseSvg;
			currentSongButton.style.color = "#da11da";
		}
	}
};

const loadSong = (idx, time = 0) => {
	if (player.songs.length === 0 || idx >= player.songs.length || idx < 0) {
		console.error("Invalid song index:", idx);
		return;
	}
	
	let song = player.songs[idx];
	player.currentIndex = idx;
	player.audio.src = song.music;
	player.titleEl.textContent = song.title;
	player.audio.currentTime = time;
	
	player.audio.play();
	syncIcons(); // Use the new function to update all icons
	
	player.playerEl.style.display = "block";
};

const playPause = () => {
	if (player.audio.paused) {
		player.audio.play();
	} else {
		player.audio.pause();
	}
	syncIcons(); // Use the new function to update all icons
};

const nextSong = () => {
	let nextIdx = (parseInt(player.currentIndex) + 1) % player.songs.length;
	loadSong(nextIdx);
};

const prevSong = () => {
	let prevIdx = (parseInt(player.currentIndex) - 1 + player.songs.length) % player.songs.length;
	loadSong(prevIdx);
};

const updateTime = () => {
	player.timeEl.textContent = `${formatTime(player.audio.currentTime)} / ${formatTime(player.audio.duration)}`;
	let percent = player.audio.duration ? (player.audio.currentTime / player.audio.duration) * 100 : 0;
	player.progressEl.value = percent;
	saveState();
};

const seek = (e) => {
	if (player.audio.duration) {
		player.audio.currentTime = (e.target.value / 100) * player.audio.duration;
	}
};

const togglePlayer = () => {
	player.isVisible = !player.isVisible;
	player.playerEl.style.display = player.isVisible ? "block" : "none";
	player.showBtn.style.display = player.isVisible ? "none" : "block";
};

const saveState = () => {
	if (player.songs.length > 0) {
		const state = {
			currentIndex: player.currentIndex,
			currentTime: player.audio.currentTime,
		};
		localStorage.setItem('musicPlayerState', JSON.stringify(state));
	}
};

const loadState = () => {
	const savedState = localStorage.getItem('musicPlayerState');
	if (savedState) {
		try {
			return JSON.parse(savedState);
		} catch (e) {
			console.error("Failed to parse saved state from localStorage", e);
			return null;
		}
	}
	return null;
};

const startPlayer = async () => {
	await fetchSongs();
	
	if (player.songs.length === 0) {
		console.error("No songs loaded from JSON file.");
		return;
	}
	
	const savedState = loadState();
	if (savedState) {
		loadSong(savedState.currentIndex, savedState.currentTime);
		player.audio.pause();
		player.isVisible = true;
		player.playerEl.style.display = "block";
		player.showBtn.style.display = "none";
		player.playPauseBtn.innerHTML = playSvg;
	} else {
		player.isVisible = false;
		player.playerEl.style.display = "none";
		player.showBtn.style.display = "block";
	}
	
	player.playPauseBtn.onclick = playPause;
	player.nextBtn.onclick = nextSong;
	player.prevBtn.onclick = prevSong;
	player.toggleBtn.onclick = togglePlayer;
	player.showBtn.onclick = togglePlayer;
	player.progressEl.oninput = seek;
	player.audio.ontimeupdate = updateTime;
	player.audio.onended = () => {
		nextSong();
	};
	
	player.sector.addEventListener('click', e => {
		let btn = e.target.closest('.play-pause');
		if (btn && btn.dataset && btn.dataset.index !== undefined) {
			let idx = parseInt(btn.dataset.index);
			
			// Check if it's the currently playing song
			if (idx === player.currentIndex) {
				playPause();
			} else {
				loadSong(idx);
			}
		}
	});
	
	// Initial sync of icons after loading state
	syncIcons();
};

document.addEventListener('DOMContentLoaded', () => {
	if (true) {
		
	} // Call the original controls function to set up download links and other logic
	controls();
	// Start the main music player logic
	startPlayer();
});
