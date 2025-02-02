/** Request:
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random:
 *  Mục tiêu: Lần lượt suffle sao cho ko trùng vô bài hát của mảng đã phát
    6.1. Mỗi lần play 1 bài đưa object song {} vào mảng called shuffleSongs[]
    6.2. So sánh name của shuffleSongs[] & name của songs[]. Nếu same name thì phải render newIndex
    6.3. Khi phát hết thì clear mảng shuffleSongs[] & repeat để hạn chế tối đa việc mix ngẫu nhiên mà bị lặp lại bài hát
 * 7. Next/ Repeat again
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE_SETTINGS = 'MUSIC_PLAYER_APP';

const playList = $('.playlist');
const player = $('.player');
const cd = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const progressBar = $('#progress');
const playBtn = $('.btn-toggle-play');
const nextBtn = $('.btn-next');
const previousBtn = $('.btn-prev');
const randomBtn = $('.btn-random');
const repeatBtn = $('.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_SETTINGS)) || {},
    shuffleSongs: [],
    songs: [
        {
            name: 'Cầu Duyên',
            singer: 'Chị Đẹp',
            path: './assets/music/cau-duyen.mp3',
            image: './assets/img/cau-duyen.webp',
        },
        {
            name: 'Cầu Vồng Lấp Lánh',
            singer: 'Dương Hoàng Yến',
            path: './assets/music/cau-vong-lap-lanh.mp3',
            image: './assets/img/cau-vong-lap-lanh.jpeg',
        },
        {
            name: 'Có Chàng Trai Viết Lên Cây',
            singer: 'Phan Mạnh Quỳnh',
            path: './assets/music/co-chang-trai-viet-len-cay.mp3',
            image: './assets/img/co-chang-trai-viet-len-cay.jpeg',
        },
        {
            name: 'Đậm Đà',
            singer: 'Tóc Tiên',
            path: './assets/music/dam-da.mp3',
            image: './assets/img/dam-da.jpeg',
        },
        {
            name: 'Đưa Em Về Nhà',
            singer: 'Chillies',
            path: './assets/music/dua-em-ve-nha.mp3',
            image: './assets/img/dua-em-ve-nha.jpeg',
        },
        {
            name: 'May Mắn',
            singer: 'Bùi Lan Hương x Ái Phương',
            path: './assets/music/may-man.mp3',
            image: './assets/img/may-man.jpeg',
        },
        {
            name: 'Mê Muội',
            singer: 'Bùi Lan Hương',
            path: './assets/music/me-muoi.mp3',
            image: './assets/img/me-muoi.jpeg',
        },
        {
            name: 'Miền Mộng Mị',
            singer: 'AMEE x Tlinh',
            path: './assets/music/mien-mong-mi.mp3',
            image: './assets/img/mien-mong-mi.jpeg',
        },
        {
            name: 'Từng Là',
            singer: 'Vũ Cát Tường',
            path: './assets/music/tung-la.mp3',
            image: './assets/img/tung-la.jpeg',
        },
        {
            name: 'Vị Nhà',
            singer: 'Đen Vâu',
            path: './assets/music/vi-nha.mp3',
            image: './assets/img/vi-nha.jpeg',
        },
    ],

    setConfig(key, value) {
        this.config[key] = value;
        localStorage.setItem(
            PLAYER_STORAGE_SETTINGS,
            JSON.stringify(this.config)
        );
    },

    loadConfig() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
    },

    render() {
        const html = this.songs.map((song, index) => {
            return `
            <div class="song ${
                index === this.currentIndex ? 'active' : ''
            }" data-index="${index}">
                    <div
                        class="thumb"
                        style="
                            background-image: url(${song.image});
                        "
                    ></div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `;
        });
        playList.innerHTML = html.join('');
    },

    defineProperties() {
        Object.defineProperty(this, 'currentSong', {
            get() {
                return this.songs[this.currentIndex];
            },
        });
    },

    defineCdAnimation() {
        const cdAnimation = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity,
        });
        // Start with the CD animation paused
        cdAnimation.pause();
        return cdAnimation;
    },

    handleEvents() {
        const cdWidth = cd.offsetWidth;
        const cdThumbAnimation = this.defineCdAnimation();

        // Handle zoom in/out song's thumbnail
        document.onscroll = () => {
            const scrollTop =
                window.scrollY || document.documentElement.scrollTop;
            const newCdWidth = cdWidth - scrollTop;

            cd.style.width = newCdWidth > 0 ? newCdWidth + 'px' : 0;
            cd.style.opacity = newCdWidth / cdWidth;
        };

        // Handle click event on PLAY button
        playBtn.onclick = () => {
            this.isPlaying ? audio.pause() : audio.play();
        };

        // Audio tag listens event when song is PLAYED
        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimation.play();
        };

        //  Audio tag listens event when song is PAUSED
        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimation.pause();
        };

        // Display the current position of the song on the progress bar in percentage
        audio.ontimeupdate = () => {
            if (audio.duration) {
                const progressPercentage = Math.floor(
                    (audio.currentTime / audio.duration) * 100
                );
                progressBar.value = progressPercentage;
            }
        };

        // Handle rewind/fast forward when adjusting the progress bar
        progressBar.oninput = () => {
            const seekTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = seekTime;
        };

        // Event for NEXT button
        nextBtn.onclick = () => {
            this.isRandom ? this.playRandomSong() : this.playNextSong();
            audio.play();
        };

        // Event for PREVIOUS button
        previousBtn.onclick = () => {
            this.isRandom ? this.playRandomSong() : this.playPreviousSong();
            audio.play();
        };

        // Toggle random btn
        randomBtn.onclick = () => {
            this.isRandom = !this.isRandom;
            this.setConfig('isRandom', this.isRandom);
            randomBtn.classList.toggle('active', this.isRandom);
        };

        // Toggle repeat btn
        repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat;
            this.setConfig('isRepeat', this.isRepeat);
            repeatBtn.classList.toggle('active', this.isRepeat);
        };

        // Auto play next song when audio ends
        audio.onended = () => {
            this.isRepeat ? audio.play() : nextBtn.click();
        };

        // Individual song is played when clicked
        playList.onclick = (e) => {
            const optionBtn = e.target.closest('.option');
            if (optionBtn) {
                console.log('Button clicked');
                return;
            }

            const songElement = e.target.closest('.song:not(.active)');
            if (songElement) {
                const newIndex = +songElement.dataset.index;
                this.currentIndex = newIndex;
                this.loadCurrentSong();
                this.render();
                audio.play();
            }
        };
    },

    loadCurrentSong() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;
    },

    playNextSong() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.updateUI();
    },

    playPreviousSong() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.updateUI();
    },

    // Handle on/off for RANDOM button
    playRandomSong() {
        // If all songs have been played, clear the shuffleSongs[]
        if (this.shuffleSongs.length >= this.songs.length) {
            this.shuffleSongs = [];
        }

        let newIndex;
        let isDuplicate;

        // Loop until we find a song that is not the current one and hasn't been played yet.
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
            // check song title in shuffleSongs[] === song title in songs[]
            // if true -> it has already been played
            isDuplicate = this.shuffleSongs.some(
                (song) => song.name === this.songs[newIndex].name
            );
        } while (newIndex === this.currentIndex || isDuplicate);

        this.currentIndex = newIndex;

        // Record the song as played by adding it to the shuffleSongs[] and use that [] to check duplicate in the future.
        this.shuffleSongs.push(this.songs[newIndex]);

        this.updateUI();

        // console.log(this.shuffleSongs);
        // console.log(this.songs[newIndex]);
    },

    scrollToActiveSong() {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'center',
            });
        }, 200);
    },

    updateUI() {
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },

    start() {
        this.loadConfig();

        // Define properties for object
        this.defineProperties();

        // Handle events in DOM
        this.handleEvents();

        // Load info of the first song & render on UI when run app
        this.loadCurrentSong();

        // Render playlist
        this.render();

        randomBtn.classList.toggle('active', this.isRandom);
        repeatBtn.classList.toggle('active', this.isRepeat);
    },
};

app.start();
