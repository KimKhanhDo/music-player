/** Request:
 * 1. Render songs
 * 2. Scroll top
 * 3. Play/ pause/ seek
 * 4. CD rotate
 * 5. Next/ prev
 * 6. Random
 * 7. Next/ Repeat again
 * 8. Active song
 * 9. Scroll active song into view
 * 10. Play song when clicked
 */
const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

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
    songs: [
        {
            name: 'Đậm Đà',
            singer: 'Tóc Tiên',
            path: './assets/music/dam-da.mp3',
            image: './assets/img/dam-da.jpeg',
        },
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
    render: function () {
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
    defineProperties: function () {
        Object.defineProperty(this, 'currentSong', {
            get: function () {
                return this.songs[this.currentIndex];
            },
        });
    },
    handleEvents: function () {
        const cdWidth = cd.offsetWidth;

        // CD Animation
        const cdAnimation = cdThumb.animate([{ transform: 'rotate(360deg)' }], {
            duration: 10000,
            iterations: Infinity,
        });

        // Start with the CD animation paused
        cdAnimation.pause();

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

        // Audio tag listens when song is PLAYED
        audio.onplay = () => {
            this.isPlaying = true;
            player.classList.add('playing');
            cdAnimation.play();
        };

        //  Audio tag listens when song is PAUSED
        audio.onpause = () => {
            this.isPlaying = false;
            player.classList.remove('playing');
            cdAnimation.pause();
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
            const newTime = (progressBar.value / 100) * audio.duration;
            audio.currentTime = newTime;
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

        // Handle on/off for RANDOM button
        randomBtn.onclick = () => {
            this.isRandom = !this.isRandom;
            randomBtn.classList.toggle('active', this.isRandom);
        };

        // Handle repeat a song
        repeatBtn.onclick = () => {
            this.isRepeat = !this.isRepeat;
            repeatBtn.classList.toggle('active', this.isRepeat);
        };

        // Auto play next song when audio ends
        audio.onended = () => {
            this.isRepeat ? audio.play() : nextBtn.click();
        };

        playList.onclick = (e) => {
            const songElement = e.target.closest('.song:not(.active)');
            const optionBtn = e.target.closest('.option');

            // if (songElement || optionBtn) {
            if (songElement) {
                const newIndex = +songElement.dataset.index;
                this.currentIndex = newIndex;
                this.loadCurrentSong();
                this.render();
                audio.play();
            }

            if (optionBtn) {
                console.log('Button clicked');
            }
            // }
        };
    },

    loadCurrentSong: function () {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url("${this.currentSong.image}")`;
        audio.src = this.currentSong.path;
    },

    playNextSong: function () {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }

        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },

    playPreviousSong: function () {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },

    playRandomSong: function () {
        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * this.songs.length);
        } while (newIndex === this.currentIndex);
        this.currentIndex = newIndex;
        this.loadCurrentSong();
        this.render();
        this.scrollToActiveSong();
    },

    scrollToActiveSong: function () {
        setTimeout(() => {
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
            });
        }, 200);
    },

    start: function () {
        // Define properties for object
        this.defineProperties();

        // Handle events in DOM
        this.handleEvents();

        // Load info of the first song & render on UI when run app
        this.loadCurrentSong();

        // Render playlist
        this.render();
    },
};

app.start();

/**
 * Play from index 0

index++ = 1
1 >= 7 false
loadsongAtIndex 1

index++ = 2
2 >= 7 false
loadsongAtIndex 2

index++ = 3
3 >= 7 false
loadsongAtIndex 3

index++ = 4
4 >= 7 false
loadsongAtIndex 4

index++ = 5
5 >= 7 false
loadsongAtIndex 5

index++ = 6
6 >= 7 false
loadsongAtIndex 6

index++ = 7
7 >= 7 true
reset index = 0
loadsongAtIndex
 */
