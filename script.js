let timerInterval;
let totalSeconds = 0;
let isSleeping = false;
let sleepStartTime = null;

window.onload = function() {
    updateUI();
};

function updateDisplay() {
    let hours = Math.floor(totalSeconds / 3600);
    let minutes = Math.floor((totalSeconds % 3600) / 60);
    let seconds = totalSeconds % 60;

    let hDisplay = hours < 10 ? "0" + hours : hours;
    let mDisplay = minutes < 10 ? "0" + minutes : minutes;
    let sDisplay = seconds < 10 ? "0" + seconds : seconds;

    document.getElementById("timer").textContent = `${hDisplay}:${mDisplay}:${sDisplay}`;
}

function toggleSleep() {
    const mainBtn = document.getElementById("main-btn");
    const statusText = document.getElementById("status-text");

    if (!isSleeping) {
        isSleeping = true;
        totalSeconds = 0;
        sleepStartTime = new Date(); 
        updateDisplay();
        
        statusText.textContent = "Sleep tight... 🌙";
        mainBtn.textContent = "I'm Awake! ☀️";
        mainBtn.classList.add("awake-btn");

        timerInterval = setInterval(() => {
            totalSeconds++;
            updateDisplay();
        }, 1000);
    } else {
        clearInterval(timerInterval);
        isSleeping = false;
        let sleepEndTime = new Date();
        
        statusText.textContent = "Good morning!";
        mainBtn.textContent = "Going to Sleep";
        mainBtn.classList.remove("awake-btn");

        saveToHistory(totalSeconds, sleepStartTime, sleepEndTime);
        totalSeconds = 0;
    }
}

function saveToHistory(secondsTotal, start, end) {
    if (secondsTotal < 1) return; 

    let hours = Math.floor(secondsTotal / 3600);
    let minutes = Math.floor((secondsTotal % 3600) / 60);
    let durationString = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
    if (hours === 0 && minutes === 0) durationString = `${secondsTotal}s`;

    let timeOptions = { hour: 'numeric', minute: '2-digit', hour12: true };
    let startClock = start.toLocaleTimeString('en-US', timeOptions);
    let endClock = end.toLocaleTimeString('en-US', timeOptions);
    let dateString = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    let history = JSON.parse(localStorage.getItem("sleepHistoryPro")) || [];
    
    history.unshift({
        date: dateString,
        timeframe: `${startClock} - ${endClock}`,
        duration: durationString,
        rawHours: secondsTotal / 3600 
    });
    
    localStorage.setItem("sleepHistoryPro", JSON.stringify(history));
    updateUI();
}

function updateUI() {
    const listElement = document.getElementById("history-list");
    if (!listElement) return;
    listElement.innerHTML = ""; 

    let history = JSON.parse(localStorage.getItem("sleepHistoryPro")) || [];

    // 1. Populate Log List
    history.forEach(item => {
        let li = document.createElement("li");
        li.className = "history-item";
        li.innerHTML = `
            <div class="item-left">
                <span class="history-date">${item.date}</span>
                <span class="history-timeframe">${item.timeframe}</span>
            </div>
            <span class="history-duration">${item.duration}</span>
        `;
        listElement.appendChild(li);
    });

    // 2. Average Calculator
    let totalHoursSum = 0;
    let entriesToCount = Math.min(history.length, 7);
    
    for(let i = 0; i < entriesToCount; i++) {
        totalHoursSum += history[i].rawHours;
    }
    
    let avgHoursDecimal = entriesToCount > 0 ? totalHoursSum / entriesToCount : 0;
    let avgH = Math.floor(avgHoursDecimal);
    let avgM = Math.round((avgHoursDecimal - avgH) * 60);
    document.getElementById("avg-sleep-display").textContent = entriesToCount > 0 ? `${avgH}h ${avgM}m` : "0h 0m";

    // 3. Render Chronological Bar Graph
    let graphData = history.slice(0, 7).reverse();

    for (let i = 0; i < 7; i++) {
        let barIndex = 6 - i;
        let bar = document.getElementById(`bar-${barIndex}`);
        let lbl = document.getElementById(`lbl-${barIndex}`);
        
        if (bar && lbl) {
            if (graphData[i]) {
                let heightPercentage = Math.min((graphData[i].rawHours / 10) * 100, 100);
                bar.style.height = `${heightPercentage}%`;
                
                if (i === graphData.length - 1) {
                    lbl.textContent = "Latest";
                } else {
                    lbl.textContent = graphData[i].date;
                }
            } else {
                bar.style.height = "0%";
                lbl.textContent = "-";
            }
        }
    }
}

function clearHistory() {
    if (confirm("Clear all your sleep stats and charts?")) {
        localStorage.removeItem("sleepHistoryPro");
        updateUI();
    }
}
