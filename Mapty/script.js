'use strict';

class Workout {
    date = new Date();
    id = (Date.now() + '').slice(-10);
    clicks = 0;

    constructor(coords, distance, duration) {
        this.coords = coords; //array of coord [lat, lng]
        this.distance = distance; //km
        this.duration = duration; //mins
    }

    _setDescription() {
        // prettier-ignore; prtttired extensions
        const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on 
        ${months[this.date.getMonth()]
        } ${this.date.getDate()}`;
    }

    click() {
        this.clicks++;
    }
}

class Running extends Workout {
    type = 'running';

    constructor(coords, distance, duration, cadence) {
        super(coords, distance, duration);
        this.cadence = cadence;
        this.calcPace();
        this._setDescription();
    }

    calcPace() {
        //min/km
        this.pace = this.duration / this.distance;
        return this.pace;
    }
}

class Cycling extends Workout {
    type = 'cycling';

    constructor(coords, distance, duration, elevationGain){
        super(coords, distance, duration);
        this.elevation = elevationGain;
        this.calcSpeed();
        this._setDescription();
    }

    calcSpeed() {
        // km/h
        this.speed = this.distance / (this.duration / 60);
        return this.speed;
    }
}



////////////////////////////////////////////////
//Application architecture
const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class App {
    //private instance properties - on all instance created on this class
    #map;
    #mapZoomLevel = 13;
    #mapEvent;
    #workouts = [];

    constructor() {
        //Get user's position
        this._getPosition();

        //Get data from local storage
        this._getLocalStorage();

        //Attach event handlers
        form.addEventListener('submit', this._newWorkout.bind(this));
        inputType.addEventListener('change',this._toggleElevationField);
        containerWorkouts.addEventListener('click', this._moveToPopup.bind(this));
    }

    _getPosition() {
        if (navigator.geolocation)
        navigator.geolocation.getCurrentPosition(
            this._loadMap.bind(this),
            function () {
                alert('Could not get your position')}
                );
            }

    _loadMap(position) {
            const {latitude} = position.coords;
            const {longitude} = position.coords;
            console.log(`https://www.google.co.uk/maps/@${latitude},${longitude}`);
    
            const coords = [latitude, longitude]
    
            this.#map = L.map('map').setView(coords, this.#mapZoomLevel);
            
            L.tileLayer('https:/{s}.tile.openstreetmap.fr/hot//{z}/{x}/{y}.png', {
                attribution: 
                '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(this.#map);

            //handling clicks on map
            this.#map.on('click', this._showForm.bind(this));

            this.#workouts.forEach(work => {
                this._renderWorkoutMarker(work);
            });
                //take long and at from object created from click
                //when click happens we wantt show form
        }

    _showForm(mapE) {
        this.#mapEvent = mapE;
                form.classList.remove('hidden');
                inputDistance.focus();
            }

    _hideForm() {
        inputCadence.value = inputDistance.value = inputDuration.value = inputElevation.value = '';
        
        form.style.display = 'none';
        form.classList.add('hidden');
        setTimeout(() => (form.style.display = 'grid'), 1000);
    }

    _toggleElevationField() {
            inputElevation.closest('.form__row').classList.toggle('form__row--hidden');
            inputCadence.closest('.form__row').classList.toggle('form__row--hidden');;
        }

    _newWorkout(e){
        //every meth return if inp meet condition
        const validInputs = (...inputs) => 
        inputs.every(inp => Number.isFinite(inp));

        const allPositive = (...inputs) => inputs.every(inp => inp > 0);

        e.preventDefault();

        //get data from form
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const {lat, lng} = this.#mapEvent.latlng;
        let workout;

        //check if data i valid


        //if activity running, create running object
        if (type === 'running') {
            const cadence = +inputCadence.value;
             //check if data is valid
             if(
                !validInputs(distance,duration,cadence) ||
                !allPositive(distance,duration,cadence))
             return alert('Input have to be positive number');

             workout = new Running([lat, lng],distance, duration, cadence);
        }
        //if cycling create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if(
                !validInputs(distance,duration,elevation) || 
                !allPositive(distance, duration))
             return alert('Input have to be positive number');

             workout = new Cycling([lat, lng],distance, duration, elevation);
        }

        //add new object to workout array
        this.#workouts.push(workout);

        //render workout on map as marker
        this._renderWorkoutMarker(workout);
        
        //render workout on list
        this._renderWorkout(workout);

        //hide form and clear input fields
        this._hideForm();

        //set local storage to all workouts
        this._setLocalStorage();
         }

    _renderWorkoutMarker(workout) {
    L.marker(workout.coords)
        .addTo(this.#map)
        .bindPopup(
            L.popup({
            maxWidth: 250,
            maxHeight: 100,
            autoClose: false,
            closeOnClick: false,
            className: `${workout.type}-popup`,
        })
        )
        .setPopupContent(
            `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'} ${workout.description}`)
        .openPopup()
    }

    _renderWorkout(workout) {
        let html = `
        <li class="workout workout--${workout.type}" data-id="${workout.id}">
          <h2 class="workout__title">${workout.description}</h2>
          <div class="workout__details">
            <span class="workout__icon">${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}</span>
            <span class="workout__value">${workout.distance}</span>
            <span class="workout__unit">km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⏱</span>
            <span class="workout__value">${workout.duration}</span>
            <span class="workout__unit">min</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">4.6</span>
            <span class="workout__unit">min/km</span>
          </div>
          `;

        if(workout.type === 'running')
        html += `
        <div class="workout__details">
            <span class="workout__icon">⚡️</span>
            <span class="workout__value">4${workout.pace.toFixed(1)}</span>
            <span class="workout__unit">min/km</span>
          </div>
          <div class="workout__details">
            <span class="workout__icon">🦶🏼</span>
            <span class="workout__value">${workout.cadence}</span>
            <span class="workout__unit">spm</span>
          </div>
        </li>
        `;

        if(workout.type === 'cycling')
        html += `
        <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed.toFixed(1)}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevation}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
    `;

    form.insertAdjacentHTML('afterend', html);
    }

    _moveToPopup(e) {
        //bug fix if we click on workout befoe map is loaded we get errro
        if(!this.#map) return;
        
        const workoutEl = e.target.closest('.workout');

        if(!workoutEl) return;

        const workout = this.#workouts.find(
            work => work.id === workoutEl.dataset.id
        );

        this.#map.setView(workout.coords,this.#mapZoomLevel,{
            animate: true,
            pan: {
                duration: 1,
            },
        });

        //using public ui
       // workout.click();
    }
//set all workout to local storage - local stroage = simple api for small amount of data
//dnt use for large data
    _setLocalStorage() {
        localStorage.setItem('workouts', JSON.stringify(this.#workouts));
    }

    _getLocalStorage() {
        const data = JSON.parse(localStorage.getItem('workouts'));
        console.log(data);

        if (!data) return;

        this.#workouts = data;

        this.#workouts.forEach(work => {
            this._renderWorkout(work);
        });
    }

    reset() {
        localStorage.removeItem('workouts');
        location.reload(); //methods and prop in browser ex to reload page
    }
}

const app = new App();

//geolocation API

//callback function as input; 
//first callback function will be called on success = get coordinates
//takes in position paramter
//second is error callback - error when getting cooridnates
//to not get errors in old browser we can check if nviagro geolocation exists
//we gt position object: coords -> latitude, longitude

//to inlucde copy cde from leaflet and adjust to our app
//title layer method - style of map, can change to diff
//display marker after clicking on the map - add special event hanlder to map
//method bulit in to map object create below

    

//create link on google maps
//in google maps url we got latitute and longtitutde
//hwo to display map
//use third party library Leaflet
//js library to interactive maps
//using package manager nmp install leaflet ( installing leaflet into our app)
//easiest way to include hosted version on CDN - copy code from leaflet wbesite
//coppy and paste ino html in head
