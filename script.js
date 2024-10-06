// Mock data
const videos = [
    { id: 1, url: 'https://assets.mixkit.co/videos/preview/mixkit-spinning-around-the-earth-29351-large.mp4', likes: 100, comments: [], creator: 'User1', description: 'Amazing view of Earth from space!' },
    { id: 2, url: 'https://assets.mixkit.co/videos/preview/mixkit-daytime-city-traffic-aerial-view-56-large.mp4', likes: 200, comments: [], creator: 'User2', description: 'Busy city life from above' },
    { id: 3, url: 'https://assets.mixkit.co/videos/preview/mixkit-a-girl-blowing-a-bubble-gum-at-an-amusement-park-1226-large.mp4', likes: 150, comments: [], creator: 'User3', description: 'Fun times at the amusement park!' }
];

const users = [
    { id: 1, name: 'User1', email: 'user1@example.com', password: 'password1', followers: 10000, following: 500, akelCoins: 1000, inbox: [] },
    { id: 2, name: 'User2', email: 'user2@example.com', password: 'password2', followers: 8000, following: 300, akelCoins: 500, inbox: [] },
    { id: 3, name: 'User3', email: 'user3@example.com', password: 'password3', followers: 12000, following: 700, akelCoins: 1500, inbox: [] }
];

const AKEL_TO_DOLLAR_RATE = 5;
const LIKE_VALUE_DOLLARS = 0.005;
const LIKE_VALUE_AKEL = LIKE_VALUE_DOLLARS * AKEL_TO_DOLLAR_RATE;

let currentUser = null;
let currentVideoIndex = 0;
let isLoggedIn = false;

function createVideoElement(video) {
    return `
        <div class="video-container">
            <video src="${video.url}" loop></video>
            <div class="like-popup" onclick="likeVideo(${video.id}, this)">
                <i class="fas fa-heart"></i>
            </div>
            <div class="video-info">
                <h3>${video.creator}</h3>
                <p>${video.description}</p>
                <p><i class="fas fa-heart"></i> <span class="likes-count">${video.likes}</span></p>
                <p><i class="fas fa-comment"></i> <span class="comments-count">${video.comments.length}</span></p>
                <p><i class="fas fa-coins"></i> $<span class="video-value">${(video.likes * LIKE_VALUE_DOLLARS).toFixed(3)}</span></p>
            </div>
            <div class="video-actions">
                <button onclick="likeVideo(${video.id}, this)"><i class="fas fa-heart"></i> Like</button>
                <button onclick="showCommentModal(${video.id})"><i class="fas fa-comment"></i> Comment</button>
                <button onclick="shareVideo(${video.id})"><i class="fas fa-share"></i> Share</button>
                <button onclick="saveVideo(${video.id})"><i class="fas fa-bookmark"></i> Save</button>
            </div>
        </div>
    `;
}

function populateVideoFeed() {
    const videoFeed = document.getElementById('video-feed');
    videoFeed.innerHTML = '';
    
    const video = videos[currentVideoIndex];
    videoFeed.innerHTML = createVideoElement(video);
    
    const videoElement = videoFeed.querySelector('video');
    videoElement.addEventListener('loadedmetadata', () => {
        videoElement.play();
        setTimeout(() => {
            videoElement.pause();
            videoFeed.querySelector('.like-popup').style.display = 'flex';
        }, 5000);
    });

    videoElement.addEventListener('ended', () => {
        playNextVideo();
    });

    updateUserInfo();
}

function likeVideo(id, likeButton) {
    if (!isLoggedIn) {
        alert('Please log in to like videos');
        return;
    }

    if (currentUser.akelCoins >= LIKE_VALUE_AKEL) {
        const videoContainer = likeButton.closest('.video-container');
        const video = videoContainer.querySelector('video');
        const likesCount = videoContainer.querySelector('.likes-count');
        const videoValue = videoContainer.querySelector('.video-value');
        
        const videoObj = videos.find(v => v.id === id);
        videoObj.likes++;
        likesCount.textContent = videoObj.likes;
        videoValue.textContent = (videoObj.likes * LIKE_VALUE_DOLLARS).toFixed(3);
        
        currentUser.akelCoins -= LIKE_VALUE_AKEL;
        
        videoContainer.querySelector('.like-popup').style.display = 'none';
        video.play();
        updateUserInfo();
    } else {
        alert('Not enough AKELcoins! Please deposit more.');
    }
}
function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    populateVideoFeed();
}

function updateUserInfo() {
    const userInfo = document.getElementById('user-info');
    const toolboxBtn = document.getElementById('toolbox-btn');
    if (isLoggedIn) {
        userInfo.innerHTML = `
            <p>${currentUser.name}</p>
            <p>AKELcoins: ${currentUser.akelCoins.toFixed(2)}</p>
        `;
        toolboxBtn.style.display = 'inline-block';
    } else {
        userInfo.innerHTML = `
            <input type="text" id="username" placeholder="Username or Email">
            <input type="password" id="password" placeholder="Password">
            <button onclick="login()">Login</button>
            <button onclick="showRegisterForm()">Register</button>
        `;
        toolboxBtn.style.display = 'none';
    }
}

function depositMoney() {
    const amount = parseFloat(prompt('Enter amount in dollars to deposit:'));
    if (!isNaN(amount) && amount > 0) {
        currentUser.akelCoins += amount * AKEL_TO_DOLLAR_RATE;
        updateUserInfo();
        alert(`Deposited ${amount} dollars. You received ${amount * AKEL_TO_DOLLAR_RATE} AKELcoins.`);
    } else {
        alert('Invalid amount. Please enter a positive number.');
    }
}

function showCommentModal(videoId) {
    if (!isLoggedIn) {
        alert('Please log in to comment on videos');
        return;
    }
    const comment = prompt('Enter your comment:');
    if (comment) {
        addComment(videoId, comment);
    }
}

function addComment(videoId, comment) {
    const video = videos.find(v => v.id === videoId);
    const newComment = {
        id: Date.now(),
        userId: currentUser.id,
        username: currentUser.name,
        content: comment,
        timestamp: new Date().toISOString(),
        replies: []
    };
    video.comments.push(newComment);
    updateCommentsCount(videoId);
    addToInbox(video.creator, `New comment on your video: "${comment}"`, videoId);
    alert('Comment posted successfully!');
}

function updateCommentsCount(videoId) {
    const video = videos.find(v => v.id === videoId);
    const commentsCount = document.querySelector('.comments-count');
    if (commentsCount) {
        commentsCount.textContent = video.comments.length;
    }
}

function addToInbox(recipientName, message, videoId) {
    const recipient = users.find(u => u.name === recipientName);
    if (recipient) {
        recipient.inbox.push({
            id: Date.now(),
            message: message,
            videoId: videoId,
            timestamp: new Date().toISOString(),
            read: false
        });
    }
}

function showInbox() {
    let inboxContent = 'Inbox:\n\n';
    currentUser.inbox.forEach((item, index) => {
        inboxContent += `${index + 1}. ${item.message} (${item.read ? 'Read' : 'Unread'})\n`;
    });
    inboxContent += '\nEnter the number of the message to reply, or 0 to exit:';
    
    const choice = prompt(inboxContent);
    if (choice && choice !== '0') {
        const index = parseInt(choice) - 1;
        if (index >= 0 && index < currentUser.inbox.length) {
            const item = currentUser.inbox[index];
            item.read = true;
            const reply = prompt(`Reply to: ${item.message}`);
            if (reply) {
                const video = videos.find(v => v.id === item.videoId);
                addComment(item.videoId, reply);
            }
        }
    }
}

function shareVideo(id) {
    if (!isLoggedIn) {
        alert('Please log in to share videos');
        return;
    }
    console.log(`Shared video ${id}`);
    alert(`Video ${id} shared successfully!`);
}

function saveVideo(id) {
    if (!isLoggedIn) {
        alert('Please log in to save videos');
        return;
    }
    console.log(`Saved video ${id}`);
    alert(`Video ${id} saved to your favorites!`);
}

function login() {
    const usernameOrEmail = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => (u.name === usernameOrEmail || u.email === usernameOrEmail) && u.password === password);
    
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        updateUserInfo();
        alert('Login successful!');
    } else {
        alert('Invalid username/email or password');
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    updateUserInfo();
    document.getElementById('toolbox-menu').style.display = 'none';
}

function showRegisterForm() {
    const userInfo = document.getElementById('user-info');
    userInfo.innerHTML = `
        <input type="text" id="register-name" placeholder="Name">
        <input type="email" id="register-email" placeholder="Email">
        <input type="password" id="register-password" placeholder="Password">
        <button onclick="register()">Register</button>
        <button onclick="updateUserInfo()">Back to Login</button>
    `;
}

function isValidEmail(email) {
    const re = /^(([^<>()[$$\\.,;:\s@"]+(\.[^<>()[$$\\.,;:\s@"]+)*)|(".+"))@(($$[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}$$)|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(String(email).toLowerCase());
}

function register() {
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    
    if (name && email && password) {
        if (!isValidEmail(email)) {
            alert('Please enter a valid email address.');
            return;
        }
        
        if (users.some(u => u.email === email)) {
            alert('This email is already registered.');
            return;
        }
        
        const newUser = { 
            id: users.length + 1, 
            name: name, 
            email: email, 
            password: password,
            followers: 0, 
            following: 0, 
            akelCoins: 100,
            inbox: []
        };
        
        users.push(newUser);
        alert('Registration successful! You can now log in.');
        updateUserInfo();
    } else {
        alert('Please fill in all fields.');
    }
}

document.getElementById('toolbox-btn').addEventListener('click', function(event) {
    event.stopPropagation();
    const toolboxMenu = document.getElementById('toolbox-menu');
    toolboxMenu.style.display = toolboxMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(event) {
    const toolboxMenu = document.getElementById('toolbox-menu');
    if (event.target !== document.getElementById('toolbox-btn') && !toolboxMenu.contains(event.target)) {
        toolboxMenu.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', () => {
    populateVideoFeed();
    updateUserInfo();
});

// New Upload Modal Functionality
const modal = document.getElementById('upload-modal');
const uploadBtn = document.getElementById('upload');
const closeBtn = document.getElementsByClassName('close')[0];

uploadBtn.onclick = function() {
    if (!isLoggedIn) {
        alert('Please log in to upload videos');
        return;
    }
    modal.style.display = 'block';
}

closeBtn.onclick = function() {
    modal.style.display = 'none';
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = 'none';
    }
}

let videoFile = null;
let audioFile = null;
let videoBlob = null;

document.getElementById('video-file').addEventListener('change', function(e) {
    videoFile = e.target.files[0];
    const videoPreview = document.getElementById('video-preview');
    videoPreview.innerHTML = `<video src="${URL.createObjectURL(videoFile)}" controls></video>`;
    
    // Update trim end to video duration
    const video = videoPreview.querySelector('video');
    video.onloadedmetadata = function() {
        document.getElementById('trim-end').value = Math.floor(video.duration);
    };
});

document.getElementById('music-file').addEventListener('change', function(e) {
    audioFile = e.target.files[0];
    // Add audio preview if needed
});

document.getElementById('upload-button').addEventListener('click', async function() {
    if (!videoFile) {
        alert('Please select a video file');
        return;
    }

    const trimStart = document.getElementById('trim-start').value;
    const trimEnd = document.getElementById('trim-end').value;
    const musicStart = document.getElementById('music-start').value;
    const musicEnd = document.getElementById('music-end').value;

    try {
        videoBlob = await processVideo(videoFile, audioFile, trimStart, trimEnd, musicStart, musicEnd);
        console.log('Video processed successfully');
        
        // Here you would typically send the processed video to your server
        console.log('Uploading processed video');
        
        alert('Video processed and uploaded successfully!');
        modal.style.display = 'none';
    } catch (error) {
        console.error('Error processing video:', error);
        alert('Error processing video. Please try again.');
    }
});

async function processVideo(videoFile, audioFile, videoStart, videoEnd, audioStart, audioEnd) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));

    let command = ['-i', 'input.mp4', '-ss', videoStart, '-to', videoEnd];

    if (audioFile) {
        ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioFile));
        command = command.concat([
            '-i', 'audio.mp3',
            '-ss', audioStart,
            '-to', audioEnd,
            '-filter_complex', '[1:a]adelay=0|0[delayed_audio];[0:a][delayed_audio]amix=inputs=2:duration=shortest',
        ]);
    }

    command = command.concat(['-c:v', 'libx264', '-c:a', 'aac', 'output.mp4']);

    await ffmpeg.run(...command);

    const data = ffmpeg.FS('readFile', 'output.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
}

// Navigation functionality
document.getElementById('home').addEventListener('click', () => {
    currentVideoIndex = 0;
    populateVideoFeed();
});

document.getElementById('discover').addEventListener('click', () => {
    currentVideoIndex = Math.floor(Math.random() * videos.length);
    populateVideoFeed();
});

document.getElementById('inbox').addEventListener('click', () => {
    if (!isLoggedIn) {
        alert('Please log in to access your inbox');
        return;
    }
    showInbox();
});

document.getElementById('profile').addEventListener('click', () => {
    if (isLoggedIn) {
        alert(`Profile: ${currentUser.name}\nFollowers: ${currentUser.followers}\nFollowing: ${currentUser.following}\nAKELcoins: ${currentUser.akelCoins.toFixed(2)}`);
    } else {
        alert('Please log in to view your profile');
    }
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    populateVideoFeed();
    updateUserInfo();
});
function withdraw() {
    if (!isLoggedIn) {
        alert('Please log in to withdraw');
        return;
    }
    
    const videoEarnings = videos.filter(v => v.creator === currentUser.name)
                                .reduce((sum, v) => sum + v.likes * LIKE_VALUE_DOLLARS, 0);
    
    const withdrawAmount = parseFloat(prompt(`You have earned $${videoEarnings.toFixed(2)}. Enter amount to withdraw:`));
    
    if (isNaN(withdrawAmount) || withdrawAmount <= 0 || withdrawAmount > videoEarnings) {
        alert('Invalid amount. Please enter a positive number not exceeding your earnings.');
        return;
    }
    
    currentUser.akelCoins += withdrawAmount * AKEL_TO_DOLLAR_RATE;
    alert(`Withdrawn $${withdrawAmount.toFixed(2)}. Added ${(withdrawAmount * AKEL_TO_DOLLAR_RATE).toFixed(2)} AKELcoins to your account.`);
    updateUserInfo();
}

function showMyVideos() {
    if (!isLoggedIn) {
        alert('Please log in to view your videos');
        return;
    }
    
    const userVideos = videos.filter(v => v.creator === currentUser.name);
    let videoList = 'Your Videos:\n\n';
    
    userVideos.forEach((video, index) => {
        videoList += `${index + 1}. Video ID: ${video.id}\n   Likes: ${video.likes}\n   Earnings: $${(video.likes * LIKE_VALUE_DOLLARS).toFixed(2)}\n\n`;
    });
    
    alert(videoList);
}
let mediaRecorder;
let recordedChunks = [];

document.getElementById('camera-btn').addEventListener('click', async function() {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
        const videoPreview = document.getElementById('video-preview');
        videoPreview.innerHTML = '<video autoplay muted></video>';
        videoPreview.querySelector('video').srcObject = stream;

        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            videoFile = new File([blob], "recorded_video.webm", { type: 'video/webm' });
            const videoElement = videoPreview.querySelector('video');
            videoElement.src = URL.createObjectURL(blob);
            videoElement.controls = true;
            videoElement.muted = false;

            // Update trim end to video duration
            videoElement.onloadedmetadata = function() {
                document.getElementById('trim-end').value = Math.floor(videoElement.duration);
            };
        };

        const recordButton = document.createElement('button');
        recordButton.textContent = 'Start Recording';
        videoPreview.appendChild(recordButton);

        recordButton.onclick = function() {
            if (mediaRecorder.state === 'inactive') {
                mediaRecorder.start();
                recordButton.textContent = 'Stop Recording';
                recordedChunks = [];
            } else {
                mediaRecorder.stop();
                recordButton.textContent = 'Start Recording';
                stream.getTracks().forEach(track => track.stop());
            }
        };
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Error accessing camera. Please make sure you have given permission and try again.');
    }
});

// Existing code for video file input
document.getElementById('video-file').addEventListener('change', function(e) {
    videoFile = e.target.files[0];
    const videoPreview = document.getElementById('video-preview');
    videoPreview.innerHTML = `<video src="${URL.createObjectURL(videoFile)}" controls></video>`;
    
    // Update trim end to video duration
    const video = videoPreview.querySelector('video');
    video.onloadedmetadata = function() {
        document.getElementById('trim-end').value = Math.floor(video.duration);
    };
});

// Modified processVideo function to include trimming
async function processVideo(videoFile, audioFile, videoStart, videoEnd, audioStart, audioEnd) {
    const { createFFmpeg, fetchFile } = FFmpeg;
    const ffmpeg = createFFmpeg({ log: true });
    await ffmpeg.load();

    ffmpeg.FS('writeFile', 'input.mp4', await fetchFile(videoFile));

    let command = ['-i', 'input.mp4', '-ss', videoStart, '-to', videoEnd];

    if (audioFile) {
        ffmpeg.FS('writeFile', 'audio.mp3', await fetchFile(audioFile));
        command = command.concat([
            '-i', 'audio.mp3',
            '-ss', audioStart,
            '-to', audioEnd,
            '-filter_complex', '[1:a]adelay=0|0[delayed_audio];[0:a][delayed_audio]amix=inputs=2:duration=shortest',
        ]);
    }

    command = command.concat(['-c:v', 'libx264', '-c:a', 'aac', 'output.mp4']);

    await ffmpeg.run(...command);

    const data = ffmpeg.FS('readFile', 'output.mp4');
    return new Blob([data.buffer], { type: 'video/mp4' });
}