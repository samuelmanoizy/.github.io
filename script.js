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
let videoFile = null;
let audioFile = null;
let mediaRecorder = null;
let recordedChunks = [];

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

    updateUserInterface();
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
        updateUserInterface();
    } else {
        alert('Not enough AKELcoins! Please deposit more.');
    }
}

function playNextVideo() {
    currentVideoIndex = (currentVideoIndex + 1) % videos.length;
    populateVideoFeed();
}

function updateUserInterface() {
    const userInfo = document.getElementById('user-info');
    const toolboxBtn = document.getElementById('toolbox-btn');
    if (isLoggedIn) {
        userInfo.innerHTML = `
            <p>${currentUser.name}</p>
            <p>AKELcoins: ${currentUser.akelCoins.toFixed(2)}</p>
        `;
        toolboxBtn.style.display = 'inline-block';
        hideAuthContainer();
    } else {
        userInfo.innerHTML = '';
        toolboxBtn.style.display = 'none';
        showAuthContainer();
    }
}

function depositMoney() {
    const amount = parseFloat(prompt('Enter amount in dollars to deposit:'));
    if (!isNaN(amount) && amount > 0) {
        currentUser.akelCoins += amount * AKEL_TO_DOLLAR_RATE;
        updateUserInterface();
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

function toggleAuthForm() {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    loginForm.style.display = loginForm.style.display === 'none' ? 'block' : 'none';
    registerForm.style.display = registerForm.style.display === 'none' ? 'block' : 'none';
}

function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    
    const user = users.find(u => (u.name === username || u.email === username) && u.password === password);
    
    if (user) {
        isLoggedIn = true;
        currentUser = user;
        updateUserInterface();
        hideAuthContainer();
        alert('Login successful!');
    } else {
        alert('Invalid username/email or password');
    }
}

function logout() {
    isLoggedIn = false;
    currentUser = null;
    updateUserInterface();
    showAuthContainer();
    document.getElementById('toolbox-menu').style.display = 'none';
    alert('You have been logged out successfully.');
}

function showAuthContainer() {
    document.getElementById('auth-container').style.display = 'flex';
}

function hideAuthContainer() {
    document.getElementById('auth-container').style.display = 'none';
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
        toggleAuthForm();
    } else {
        alert('Please fill in all fields.');
    }
}

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
    updateUserInterface();
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

function startRecording() {
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
        .then(stream => {
            const videoPreview = document.getElementById('video-preview');
            videoPreview.srcObject = stream;
            videoPreview.play();

            mediaRecorder = new MediaRecorder(stream);
            mediaRecorder.ondataavailable = event => {
                if (event.data.size > 0) {
                    recordedChunks.push(event.data);
                }
            };
            mediaRecorder.start();

            document.getElementById('record-button').style.display = 'none';
            document.getElementById('stop-button').style.display = 'inline-block';
        })
        .catch(error => {
            console.error('Error accessing media devices:', error);
        });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
        mediaRecorder.stop();
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            videoFile = new File([blob], 'recorded-video.webm', { type: 'video/webm' });
            displayVideoPreview(videoFile);
            recordedChunks = [];
        };

        document.getElementById('record-button').style.display = 'inline-block';
        document.getElementById('stop-button').style.display = 'none';
    }
}

// ... (previous code remains the same)

function displayVideoPreview(file) {
    const videoPreview = document.getElementById('video-preview');
    const videoURL = URL.createObjectURL(file);
    videoPreview.src = videoURL;
    videoPreview.srcObject = null;
    videoPreview.play();

    videoPreview.onloadedmetadata = function() {
        document.getElementById('trim-end').value = Math.floor(videoPreview.duration);
    };
}

async function uploadVideo() {
    if (!videoFile) {
        alert('Please select or record a video');
        return;
    }

    const trimStart = document.getElementById('trim-start').value;
    const trimEnd = document.getElementById('trim-end').value;
    const musicStart = document.getElementById('music-start').value;
    const musicEnd = document.getElementById('music-end').value;

    try {
        const processedVideo = await processVideo(videoFile, audioFile, trimStart, trimEnd, musicStart, musicEnd);
        console.log('Video processed successfully');
        
        // Here you would typically send the processed video to your server
        console.log('Uploading processed video');
        
        // For now, we'll just add it to the videos array
        const newVideo = {
            id: videos.length + 1,
            url: URL.createObjectURL(processedVideo),
            likes: 0,
            comments: [],
            creator: currentUser.name,
            description: 'New uploaded video'
        };
        videos.push(newVideo);
        
        alert('Video processed and uploaded successfully!');
        document.getElementById('upload-modal').style.display = 'none';
        
        // Reset the upload form
        resetUploadForm();
    } catch (error) {
        console.error('Error processing video:', error);
        alert('Error processing video. Please try again.');
    }
}

function resetUploadForm() {
    document.getElementById('video-file').value = '';
    document.getElementById('music-file').value = '';
    const videoPreview = document.getElementById('video-preview');
    videoPreview.src = '';
    videoPreview.srcObject = null;
    videoFile = null;
    audioFile = null;
    recordedChunks = [];
    document.getElementById('record-button').style.display = 'inline-block';
    document.getElementById('stop-button').style.display = 'none';
}

async function processVideo(videoFile, audioFile, videoStart, videoEnd, audioStart, audioEnd) {
    // This is a placeholder function. In a real application, you would use a video processing library or send the data to a server for processing.
    // For now, we'll just return the original video file.
    return videoFile;
}

// Toolbox menu functionality
const toolboxBtn = document.getElementById('toolbox-btn');
const toolboxMenu = document.getElementById('toolbox-menu');

toolboxBtn.addEventListener('click', function(event) {
    event.stopPropagation();
    toolboxMenu.style.display = toolboxMenu.style.display === 'block' ? 'none' : 'block';
});

document.addEventListener('click', function(event) {
    if (!toolboxMenu.contains(event.target) && event.target !== toolboxBtn) {
        toolboxMenu.style.display = 'none';
    }
});

// Toolbox menu buttons
document.querySelectorAll('.toolbox-btn').forEach((btn, index) => {
    btn.addEventListener('click', () => {
        switch(index) {
            case 0:
                depositMoney();
                break;
            case 1:
                withdraw();
                break;
            case 2:
                showMyVideos();
                break;
            case 3:
                showInbox();
                break;
            case 4:
                logout();
                break;
        }
        toolboxMenu.style.display = 'none';
    });
});

// Initialize the app
document.addEventListener('DOMContentLoaded', () => {
    populateVideoFeed();
    updateUserInterface();

    // Add event listeners for login and register buttons
    document.querySelector('#login-form button').addEventListener('click', login);
    document.querySelector('#register-form button').addEventListener('click', register);

    // Navigation buttons
    document.getElementById('home').addEventListener('click', () => {
        currentVideoIndex = 0;
        populateVideoFeed();
    });

    document.getElementById('discover').addEventListener('click', () => {
        currentVideoIndex = Math.floor(Math.random() * videos.length);
        populateVideoFeed();
    });

    document.getElementById('upload').addEventListener('click', () => {
        if (!isLoggedIn) {
            alert('Please log in to upload videos');
            return;
        }
        document.getElementById('upload-modal').style.display = 'block';
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

    // Close button for upload modal
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('upload-modal').style.display = 'none';
        stopRecording();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target == document.getElementById('upload-modal')) {
            document.getElementById('upload-modal').style.display = 'none';
            stopRecording();
        }
    });

    // Video upload and recording functionality
    const recordButton = document.getElementById('record-button');
    const stopButton = document.getElementById('stop-button');
    const uploadButton = document.getElementById('upload-button');

    recordButton.addEventListener('click', startRecording);
    stopButton.addEventListener('click', stopRecording);
    uploadButton.addEventListener('click', uploadVideo);

    document.getElementById('video-file').addEventListener('change', function(e) {
        videoFile = e.target.files[0];
        displayVideoPreview(videoFile);
    });

    document.getElementById('music-file').addEventListener('change', function(e) {
        audioFile = e.target.files[0];
        // Add audio preview if needed
    });
});