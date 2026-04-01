function openScreen(id) { 
    document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active")); 
    const screen = document.getElementById(id); 
    if(screen) screen.classList.add("active"); 
    if (id === "stats") {
        requestAnimationFrame(() => {
            setTimeout(() => {
            renderChart();
            }, 50);
        });
    }
} 

// ====== window.onload ======
window.onload = function(){ 
    // === профиль === 
    const profile = JSON.parse(localStorage.getItem("profile")) || {}; 
    const profileName = document.getElementById("profileName"); 
    const profileAbout = document.getElementById("profileAbout"); 
    const profileDOB = document.getElementById("profileDOB"); 
    if(profileName && profile.name) profileName.value = profile.name; 
    if(profileAbout && profile.about) profileAbout.value = profile.about; 
    if(profileDOB && profile.dob) profileDOB.value = profile.dob; 
    const saveProfileBtn = document.getElementById("saveProfileBtn"); 
        if(saveProfileBtn){ saveProfileBtn.onclick = ()=> { 
            const profileData = { 
                name: profileName ? profileName.value : "", 
                about: profileAbout ? profileAbout.value : "", 
                dob: profileDOB ? profileDOB.value : "" 
            }; 
            localStorage.setItem("profile", JSON.stringify(profileData)); 
            alert("Профиль сохранён 😼"); 
        }}

    // === аватар === 
    let savedAvatar = localStorage.getItem("avatar"); 
    const avatarImg = document.getElementById("avatarImg"); 
    const avatarInput = document.getElementById("avatarInput"); 
    if(savedAvatar && avatarImg) avatarImg.src = savedAvatar; 
    if(avatarInput){ avatarInput.addEventListener("change", function(){ 
        let file = this.files[0]; if(!file) return; 
        const reader = new FileReader(); 
        reader.onload = e=>{ 
            if(avatarImg) avatarImg.src = e.target.result; localStorage.setItem("avatar", e.target.result); 
        } 
        reader.readAsDataURL(file); 
    });} 

    // === дата привычек === 
    let today = new Date(); 
    const monthNames = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"]; 
    const todayDateEl = document.getElementById("todayDate"); 
    todayDateEl.textContent = `${today.getDate()} ${monthNames[today.getMonth()]}`;

    // === дни недели (календарь) === 
    document.querySelectorAll(".day-btn").forEach(btn=>{ 
        btn.addEventListener("click", ()=>{ 
            document.querySelectorAll(".day-btn").forEach(b=>b.classList.remove("active")); 
            btn.classList.add("active"); 
            showNotesByDay(btn.dataset.day); 
        }); 
    }); 

    // === нижняя панель подсветка === 
    document.querySelectorAll(".nav button").forEach(btn=>{ 
        btn.addEventListener("click", ()=>{ 
            document.querySelectorAll(".nav button").forEach(b=>b.classList.remove("active")); 
            btn.classList.add("active"); 
        }); 
    }); 

    // === привычки === 
    const habits = JSON.parse(localStorage.getItem("habits")) || {water:"",sport:"",read:"",sleep:"",walk:""}; 
    const waterInput = document.getElementById("water"); 
    const sportInput = document.getElementById("sport"); 
    const readInput = document.getElementById("reading"); 
    const sleepInput = document.getElementById("sleep"); 
    const walkInput = document.getElementById("walk"); 
    if(waterInput) waterInput.value = habits.water || ""; 
    if(sportInput) sportInput.value = habits.sport || ""; 
    if(readInput) readInput.value = habits.read || ""; 
    if(sleepInput) sleepInput.value = habits.sleep || ""; 
    if(walkInput) walkInput.value = habits.walk || ""; 
    const saveHabitsBtn = document.getElementById("saveHabitsBtn"); 
    if(saveHabitsBtn){ 
        saveHabitsBtn.onclick = function(){ 
            const oldHabits = JSON.parse(localStorage.getItem("habits")) || {water:0,sport:0,read:0}; 
            const newHabits = { 
                water: (parseFloat(oldHabits.water) || 0) + (parseFloat(waterInput.value) || 0), 
                sport: (parseFloat(oldHabits.sport) || 0) + (parseFloat(sportInput.value) || 0), 
                read: (parseFloat(oldHabits.read) || 0) + (parseFloat(readInput.value) || 0), 
                sleep: (parseFloat(oldHabits.sleep) || 0) + (parseFloat(sleepInput.value) || 0), 
                walk: (parseFloat(oldHabits.walk) || 0) + (parseFloat(walkInput.value) || 0) }; 
                const dateStr = getLocalDateString(); 
                const allHabits = JSON.parse(localStorage.getItem("habitsByDate")) || {};
                if(!allHabits[dateStr]){ 
                    allHabits[dateStr] = {water:0,sport:0,read:0,sleep:0,walk:0}; 
                } 
            allHabits[dateStr].water += parseFloat(waterInput.value) || 0; 
            allHabits[dateStr].sport += parseFloat(sportInput.value) || 0; 
            allHabits[dateStr].read += parseFloat(readInput.value) || 0; 
            allHabits[dateStr].sleep += parseFloat(sleepInput.value) || 0; 
            allHabits[dateStr].walk += parseFloat(walkInput.value) || 0; 
            localStorage.setItem("habitsByDate", JSON.stringify(allHabits)); 
            alert("Прогресс сохранён 😼"); 

            updateTodayStats(); 
            refreshStats(); 
            renderChart(); 
            waterInput.value = ""; 
            sportInput.value = ""; 
            readInput.value = ""; 
            sleepInput.value = ""; 
            walkInput.value = ""; 
        } 
    } 

    // ====== кнопки плюс ====== 
    document.querySelectorAll(".habit-add").forEach(btn => { 
        btn.addEventListener("click", () => { 
            const habit = btn.dataset.habit; const value = parseFloat(btn.dataset.value); 
            let inputId; 
            if (habit === "water") inputId = "water"; 
            if (habit === "sport") inputId = "sport"; 
            if (habit === "read") inputId = "reading"; 
            if (habit === "sleep") inputId = "sleep"; 
            if (habit === "walk") inputId = "walk"; 
            const input = document.getElementById(inputId); 
            if (!input) return; let current = parseFloat(input.value) || 0; 
            input.value = current + value; 
        });
    }); 

    // === заметки === 
    let savedNotes = JSON.parse(localStorage.getItem("notes")) || []; // фильтруем пустые сразу 
    savedNotes = savedNotes.filter(n => n.title && n.title.trim() !== "" && n.text && n.text.trim() !== ""); 
    localStorage.setItem("notes", JSON.stringify(savedNotes)); 
    const notesListEl = document.getElementById("notesList"); 

    if(notesListEl){ 
        notesListEl.innerHTML = ""; 
        savedNotes.forEach(n => createNote(n.title, n.text, false, n.date)); 
    }

    refreshStats(); 
    showNotesByDay("all"); // сразу показываем today 
    updateTodayStats();

    function setTheme(theme){ 
        document.documentElement.setAttribute("data-theme", theme); 
        localStorage.setItem("theme", theme); 
    } 

    // кнопка на экране настроек 
    const themeToggleScreen = document.getElementById("themeToggleScreen"); 
    if(themeToggleScreen){ themeToggleScreen.onclick = () => { 
        const current = document.documentElement.getAttribute("data-theme") || "light"; 
        setTheme(current === "dark" ? "light" : "dark"); 
    }} 

    // при запуске восстанавливаем тему 
    let savedTheme = localStorage.getItem("theme") || "light"; 
    setTheme(savedTheme); const statsDate = document.getElementById("statsDate"); 
    if(statsDate){ 
        statsDate.addEventListener("click", () => { 
            if (statsDate.showPicker) { 
                statsDate.showPicker(); 
            } 
        }); 
        statsDate.addEventListener("change", () => { 
            showHabitsByDate(statsDate.value); 
        }); 
    } 

    // ====== КАЛЕНДАРЬ ====== 
    let currentDate = new Date(); 
    function renderCalendar(){ 
        const daysEl = document.getElementById("calendarDays"); 
        const titleEl = document.getElementById("calendarTitle"); 
        if(!daysEl || !titleEl) return; daysEl.innerHTML = ""; 
        const year = currentDate.getFullYear(); 
        const month = currentDate.getMonth(); 
        const monthNames = [ "Январь","Февраль","Март","Апрель","Май","Июнь", "Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь" ];
        titleEl.innerText = `${monthNames[month]} ${year}`;
        const firstDay = new Date(year, month, 1).getDay(); 
        const daysInMonth = new Date(year, month+1, 0).getDate(); 
        let start = firstDay === 0 ? 6 : firstDay - 1; 
        for(let i=0;i<start;i++){ 
            daysEl.appendChild(document.createElement("div")); 
        } 

        for(let d=1; d<=daysInMonth; d++){ 
            const dayEl = document.createElement("div"); 
            dayEl.className = "calendar-day"; dayEl.innerText = d; 
            const dateStr = `${year}-${(month+1).toString().padStart(2,'0')}-${d.toString().padStart(2,'0')}`; 
            dayEl.onclick = () => { 
                document.querySelectorAll(".calendar-day").forEach(el=>el.classList.remove("active")); 
                dayEl.classList.add("active"); showHabitsByDate(dateStr); showNotesByDate(dateStr); 
            }; 
            daysEl.appendChild(dayEl); 
        } 
    }

    document.getElementById("prevMonth")?.addEventListener("click", () => { 
        currentDate.setMonth(currentDate.getMonth() - 1); 
        renderCalendar(); 
    }); 
    document.getElementById("nextMonth")?.addEventListener("click", () => { 
        currentDate.setMonth(currentDate.getMonth() + 1); 
        renderCalendar(); 
    }); 
    renderCalendar(); 
} 
        
function getLocalDateString(date = new Date()) { 
    const y = date.getFullYear(); 
    const m = String(date.getMonth() + 1).padStart(2, "0"); 
    const d = String(date.getDate()).padStart(2, "0"); 
    return `${y}-${m}-${d}`;
} 

function showHabitsByDate(date){ 
    const container = document.getElementById("habitsByDate"); 
    if(!container) return; 
    const allHabits = JSON.parse(localStorage.getItem("habitsByDate")) || {}; 
    const data = allHabits[date]; 

    if(!data){ 
        container.innerHTML = "<p>Целей нет 😿</p>"; 
        return; 
    } 

    container.innerHTML = `
        <div class="note">💧 Вода: ${data.water} л</div>
        <div class="note">🏃 Спорт: ${data.sport} мин</div>
        <div class="note">📚 Чтение: ${data.read} мин</div>
        <div class="note">😴 Сон: ${data.sleep} ч</div>
        <div class="note">🚶 Прогулка: ${data.walk} мин</div>
    `;
} 

function showNotesByDate(dateStr){ 
    const container = document.getElementById("notesByDay"); 

    if(!container) return; 

    const notes = JSON.parse(localStorage.getItem("notes")) || []; 
    container.innerHTML = ""; 

    const filtered = notes.filter(n => { 
        if(!n.date) return false; 
        const noteDate = new Date( n.date.split(" ")[0].split(".").reverse().join("-") ); 
        const noteStr = getLocalDateString(noteDate); 
        return noteStr === dateStr; 
    }); 

    if(filtered.length === 0){ 
        container.innerHTML = "<p>Заметок нет 😿</p>"; 
        return; 
    } 

    filtered.forEach(n=>{ 
        const div = document.createElement("div"); 
        div.className = "note"; 
        div.innerHTML = `
            <h4>${n.title}</h4>
            <div>${n.text}</div>
            <p>${n.date}</p>
        `;

        container.appendChild(div); 
    }); 
} 

// ====== заметки ====== 
function addNote(){ 
    const noteTitle = document.getElementById("noteTitle"); 
    const noteText = document.getElementById("noteText"); 
    if(!noteTitle || !noteText || noteTitle.value.trim()==="" || noteText.innerHTML.trim()==="") return; 
    createNote(noteTitle.value.trim(), noteText.innerHTML.trim(), true); 

    noteTitle.value = ""; 
    noteText.innerHTML = ""; 
    showNotesByDay("all"); 
} 

function createNote(title, text, save=true, date=null){ 
    if(!title || !text) return; if(!date){ 
        let now = new Date();
        date = `
            ${now.getDate().toString().padStart(2,'0')}.${(now.getMonth()+1).toString().padStart(2,'0')}.${now.getFullYear()} 
            ${now.getHours().toString().padStart(2,'0')}:${now.getMinutes().toString().padStart(2,'0')}
        `; 
    }

    let note = document.createElement("div"); 
    note.className = "note"; 
    note.innerHTML = `
        <h3>${title}</h3>
        <div class="noteText">${text}</div>
        <p>${date}</p>
        <div>
        <button class="note-btn editNote">Изменить</button>
        <button class="note-btn deleteNote">Удалить</button>
        </div>
    `;

    const noteTextDiv = note.querySelector(".noteText"); 
    const editBtn = note.querySelector(".editNote"); 

    if(editBtn && noteTextDiv){ 
        editBtn.onclick = function(){ 
            if(editBtn.innerText==="Изменить"){ 
                noteTextDiv.contentEditable="true"; 
                noteTextDiv.focus(); 
                editBtn.innerText="Сохранить"; 
            } 
            else { 
                noteTextDiv.contentEditable="false"; 
                editBtn.innerText="Изменить"; 
                updateLocalStorage(); 
                alert("Заметка сохранена 😼"); 
            } 
        } 
    } 
    
    const deleteBtn = note.querySelector(".deleteNote"); 
    if(deleteBtn){ 
        deleteBtn.onclick = function(){ 
            note.remove(); 
            updateLocalStorage(); 
        } 
    } 
    
    const notesListEl = document.getElementById("notesList"); 
    if(notesListEl) notesListEl.appendChild(note); 
    if(save) updateLocalStorage(); 
} 

function updateLocalStorage(){ 
    let notesArray = []; 
    document.querySelectorAll(".note").forEach(n=>{ 
        const titleEl = n.querySelector("h3"); 
        const textEl = n.querySelector(".noteText"); 
        const dateEl = n.querySelector("p"); 
        const title = titleEl ? titleEl.innerText.trim() : ""; 
        const text = textEl ? textEl.innerHTML.trim() : ""; 
        const date = dateEl ? dateEl.innerText : "";

        if(title || text) notesArray.push({title,text,date}); 
    }); 

    localStorage.setItem("notes", JSON.stringify(notesArray)); 
    const statNotesEl = document.getElementById("statNotes"); 
    if(statNotesEl) statNotesEl.innerText = notesArray.length; 
    showNotesByDay("all"); 
} 

// ====== календарь ====== 
function showNotesByDay(day){ 
    const container = document.getElementById("notesByDay"); 
    if(!container) return; 
    container.innerHTML = ""; 
    const notes = JSON.parse(localStorage.getItem("notes")) || []; 
    notes.forEach(n=>{ 
        if(!n.title && !n.text) return; 
        const noteDate = new Date(n.date.split(" ")[0].split(".").reverse().join("-")); 
        if(day==="all" || noteDate.getDay()==day){ let noteDiv = document.createElement("div"); 
            noteDiv.className = "note"; 
            noteDiv.innerHTML = `
                <h4 style="margin:0;">${n.title}</h4>
                <div style="min-height:40px;margin-top:5px;">${n.text}</div>
                <p style="font-size:12px;color:#888;margin-top:5px;">${n.date}</p>
            `; 

            container.appendChild(noteDiv); 
        } 
    }); 
} 

// ====== статистика ====== 
function refreshStats(){ 
    const notes = JSON.parse(localStorage.getItem("notes")) || []; 
    const allHabits = JSON.parse(localStorage.getItem("habitsByDate")) || {}; 
    const todayStr = getLocalDateString(); 
    const todayHabits = allHabits[todayStr] || { 
        water:0, 
        sport:0, 
        read:0, 
        sleep:0, 
        walk:0 
    }; 
    const statNotesEl = document.getElementById("statNotes"); 
    const statWaterEl = document.getElementById("statWater");
    const statSportEl = document.getElementById("statSport"); 
    const statReadEl = document.getElementById("statRead"); 
    const statStreakEl = document.getElementById("statStreak"); 
    const statSleepEl = document.getElementById("statSleep"); 
    const statWalkEl = document.getElementById("statWalk"); 
    if(statNotesEl) statNotesEl.innerText = notes.length; 
    if(statWaterEl) statWaterEl.innerText = todayHabits.water + " л"; 
    if(statSportEl) statSportEl.innerText = todayHabits.sport + " мин"; 
    if(statReadEl) statReadEl.innerText = todayHabits.read + " мин"; 
    if(statSleepEl) statSleepEl.innerText = todayHabits.sleep + " ч"; 
    if(statWalkEl) statWalkEl.innerText = todayHabits.walk + " мин"; 

    // дни подряд 
    let streak = 0; let today = new Date(); 
    
    for(let i=0;i<30;i++){ 
        let checkDate = new Date(); 
        checkDate.setDate(today.getDate()-i); 
        const dateStr = `
            ${checkDate.getDate().toString().padStart(2,'0')}.${(checkDate.getMonth()+1).toString().padStart(2,'0')}.${checkDate.getFullYear()}
        `;
        const found = notes.some(n => n.date.includes(dateStr)); 
        if(found) streak++; else break; } 
        if(statStreakEl) statStreakEl.innerText = streak; 
    } 

    // ====== текст форматирование ====== 
    function format(command){ 
        document.execCommand(command,false,null); 
    } 
    
    // ====== обновление today ====== 
    function updateTodayStats(){ 
        const todayStr = getLocalDateString(); 
        const allHabits = JSON.parse(localStorage.getItem("habitsByDate")) || {}; 
        const habits = allHabits[todayStr] || {water:0,sport:0,read:0,sleep:0,walk:0}; 
        document.getElementById("waterToday").innerText = habits.water; 
        document.getElementById("sportToday").innerText = habits.sport; 
        document.getElementById("readToday").innerText = habits.read; 
        document.getElementById("sleepToday").innerText = habits.sleep; 
        document.getElementById("walkToday").innerText = habits.walk; 
    } 

    function getLast7DaysData(){ 
        const all = JSON.parse(localStorage.getItem("habitsByDate")) || {};
        let labels = []; 
        let water = []; 
        let sport = []; 
        let read = []; 
        for(let i=6;i>=0;i--){ 
            let d = new Date(); 
            d.setDate(d.getDate()-i); 
            const dateStr = getLocalDateString(d); 
            labels.push(dateStr.slice(5)); 
            const data = all[dateStr] || {water:0,sport:0,read:0}; 
            water.push(data.water); 
            sport.push(data.sport); 
            read.push(data.read); 
        } 
        return { labels, water, sport, read }; 
    } 

    let habitsChart = null; 

    function renderChart(){ 
        const ctx = document.getElementById("habitsChart"); 
        if(!ctx) return; 
        const data = getLast7DaysData(); 
        if(habitsChart){ 
            habitsChart.destroy(); 
        } 
        habitsChart = new Chart(ctx, { 
            type: "line", 
            data: { 
                labels: data.labels, 
                datasets: [ 
                    { 
                        label: "Вода (л)", 
                        data: data.water, 
                        borderWidth: 2, 
                        tension: 0.4 
                    }, 
                    { 
                        label: "Спорт (мин)", 
                        data: data.sport, 
                        borderWidth: 2, 
                        tension: 0.4 
                    }, 
                    { 
                        label: "Чтение (мин)", 
                        data: data.read, 
                        borderWidth: 2, 
                        tension: 0.4 
                    } 
                ] 
            },
            options: { 
                responsive: true, 
                plugins: { 
                    legend: { 
                        labels: { 
                            color: getComputedStyle(document.body).color 
                        } 
                    } 
                }, 
                scales: { 
                    x: { 
                        ticks: { 
                            color: getComputedStyle(document.body).color } 
                    }, 
                    y: { 
                        ticks: { 
                            color: getComputedStyle(document.body).color 
                        } 
                    } 
                }
            }
        }); 
        
        setTimeout(() => {
            if (habitsChart) habitsChart.resize();
        }, 100);
    }