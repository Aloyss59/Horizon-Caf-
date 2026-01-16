const times = ['08:00','09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00',
               '18:00','19:00','20:00','21:00','22:00','23:00'];

function generateSchedule(){
    scheduleTable.innerHTML = '';
    scheduleTable.innerHTML += '<div class="time-slot"></div>'; // coin haut gauche
    for(let day of days){
        scheduleTable.innerHTML += `<div class="day-header"><span class="day-name">${day}</span></div>`;
    }

    for(let t=0; t<times.length; t++){
        scheduleTable.innerHTML += `<div class="time-slot">${times[t]}</div>`;
        for(let d=0; d<days.length; d++){
            let cell = document.createElement('div');
            cell.classList.add('schedule-cell');

            // Événements Bar: matin (08:00) et soir (20:00)
            if((t===0 || t===12) && Math.random()<0.7){ 
                let ev = eventsBar[Math.floor(Math.random()*eventsBar.length)];
                cell.innerHTML = `<div class="course-item event" data-title="${ev}" data-type="Événement" data-time="${times[t]}" data-info="Lieu: Hall principal">${ev}</div>`;
            } else if(t!==0 && t!==12 && Math.random()<0.5){ 
                let cr = courses[Math.floor(Math.random()*courses.length)];
                let type = Math.random()<0.3 ? 'practical' : 'cours';
                cell.innerHTML = `<div class="course-item ${type}" data-title="${cr}" data-type="${type==='cours'?'Cours':'Sport/TP'}" data-time="${times[t]}" data-info="Salle: B${Math.floor(Math.random()*10)+1}">${cr}</div>`;
            }

            scheduleTable.appendChild(cell);
        }
    }

    // Click listener pour popup
    const items = document.querySelectorAll('.course-item');
    items.forEach(item=>{
        item.addEventListener('click', ()=>{
            document.getElementById('modalTitle').innerText = item.dataset.title;
            document.getElementById('modalType').innerText = item.dataset.type;
            document.getElementById('modalTime').innerText = `Heure: ${item.dataset.time}`;
            document.getElementById('modalInfo').innerText = item.dataset.info;
            document.getElementById('eventModal').style.display = 'block';
        });
    });
}
