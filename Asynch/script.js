'use strict';

const btn = document.querySelector('.btn-country');
const countriesContainer = document.querySelector('.countries');

const renderError = function(message) {
    countriesContainer.insertAdjacentText('beforeend', message);
    countriesContainer.style.opacity = 1;
};

const renderCountry = function (data, className = '') {
    const html = `
    <article class="country ${className}">
          <img class="country__img" src="${data.flags.png}" />
          <div class="country__data">
            <h3 class="country__name">${data.name.common}</h3>
            <h4 class="country__region">${data.region}</h4>
            <p class="country__row"><span>👫</span>${(+data.population / 1000000).toFixed(1)}</p>
            <p class="country__row"><span>🗣️</span>${Object.values(data.languages)[0]}</p>
            <p class="country__row"><span>💰</span>${Object.values(data.currencies)[0].name}</p>
          </div>
        </article>
        `;
        countriesContainer.insertAdjacentHTML('beforeend', html);
        countriesContainer.style.opacity = 1;
};

//modern way for API Fetch / Promises
//Promise - container fore future value of API call - response
//Pormise - diff stages - pending - setttled ( fullfilled or rejected)
//fetch function build promise

const request = fetch('https://restcountries.com/v3.1/name/portugal');
console.log(request);

const getJSON = function(url, errorMsg = 'Something went wrong: ') {
    return fetch(url)
    //first callback function in then is called when success, second can be passed to handle rejected
    .then(response => {
        if(!response.ok)
        throw new Error(`${errorMsg} ${response.status})`)
        
        return response.json()
    })
    //err => alert(err)
};

//then method availabe on promises - pass callback function to then method to be executed when promsei is aviabe
//callback function in them method accept response par
const getCountryData = function(country) {
    //Country 1
    getJSON(`https://restcountries.com/v3.1/name/${country}`, 'Country not found')
        //to read response
        //call json method on the response; json is a method avilable on all the response of fetch
        //json method is also asynch function = return promise also
        //call another them method
    .then(data => {
        //to gt neighbour secodna ajaxc call depends on first call
        renderCountry(data[0]);
        const neighbour = data[0].borders[0];
        //throw error to be caught in catch
          if(!neighbour) throw new Error('No neighbour found!');
          //second ajax call
          //Country 2
          //return promise from 2nd ajax; success value of promise will be value returned
          return getJSON(`https://restcountries.com/v3.1/alpha/${neighbour}`, 'Country not found');
    })
    //hanlde success value of returned promise
    .then(data => renderCountry(data[0], 'neighbour'))
    //can handle all errors and end of chain, atch any errors that occurs in any promsie chain
    .catch(err => {
        console.log(`${err}`);
        renderError(`Something went worng: 🔥${err.message}. Try again!`)
    })
    //called wheneevr success or rejected- sthg that always need to happen no matter of the result
    .finally(() => {
        countriesContainer.style.opacity = 1;
    });
};







//Challenge
//1 create function where am i - take as input alt value and long value - gps coordinates
//do reverse geocoding - convert to country name - using API
//use fetch api and promises to get data
//log the msg to console - u are in berling germany
//chain catch m,ethod to end of promie and log wrrors to console
//throw error

//old way of xml http request - ajax calls//CORS - cross origin report sharing
/*

const getCountryAndNeighbourData = function(country) {
    //AJAX call country 1
const request = new XMLHttpRequest();
request.open('GET', `https://restcountries.com/v3.1/name/${country}`);
request.send(); // will sent request to the url above/ fetches data in the background
//once data is fetched it will emit load event

request.addEventListener('load', function() {
    //as soon as data is fetched:
    console.log(this.responseText);
    //conver text and destructure
    const [data] = JSON.parse(this.responseText);
    console.log(data);
    

    //render country 1

    renderCountry(data);
    //Get neighbour
    const [neighbour] = data.borders;
    console.log(neighbour);

    if(!neighbour) return;

    //AjaX call 2
    const request2 = new XMLHttpRequest();
    request2.open('GET', `https://restcountries.com/v3.1/alpha/${neighbour}`);
    request2.send();

    request2.addEventListener('load', function() {
        //as soon as data is fetched:
        console.log(this.responseText);
        //conver text and destructure
        const [data2] = JSON.parse(this.responseText);
        console.log(data2);

    renderCountry(data2, 'neighbour');
})})
};
getCountryAndNeighbourData('portugal');
*/

/*
//create promise - special kind of object
//pass in function - executor - execute by passing 2 other arg - exec and reject func
const lotteryPromise = new Promise( function(resolve, reject) {

    console.log('Lottery draw is happening');
    setTimeout(function () {

    if(Math.random() >= 0.5) {
        resolve('You win!') // call resolve func mark this promsie as resolved - fulfilled; pas fullfiled value of promise for then method later
    }else {
        reject(new Error('You lost your money'));
    }
}, 2000)
});
//consume the promise below
lotteryPromise.then(res => console.log(res)).catch(err => console.log(err));

//promisyfng setTimeout
/*
//create function and create promsie to encapsuclat asynch func
const wait = function (seconds) {
    return new Promise(function (resolve) { //imposible for timer to fail
        setTimeout(resolve, seconds * 1000);
    })
};
//create promise that wait 2 sec and after 2sec resolve
wait(1).then(() => {
    console.log('1 sec passed'); //here any code to be executed after 2sec
    return wait(1); //chain 2 calls in result of 1st fetch execute 2nd
})
.then(() => {
    console.log('2 sec passed ');
    return wait(1);
}).then(() => console.log('3 sec passed'))

Promise.resolve('abc').then(x => console.log(x));
Promise.reject(new Error('prb')).catch(x => console.error(x));

const getPosition = function() {
    return new Promise(function(resolve, reject) {
       // navigator.geolocation.getCurrentPosition(position => console.log(position),
       // err => reject(err)
       // );
       navigator.geolocation.getCurrentPosition(resolve, reject); //exactly same as one above
    })
}

// getPosition().then(position => console.log(position));

const whereAmI = function() {
    getPosition().
    then(pos => {
        const {latitude: lat, longitude: long} = pos.coords;
        
        return fetch(`http://api.geonames.org/countryCodeJSON?lat=${lat}&lng=${long}&username=wanda``);
    })
    .then(response => {
        console.log(response);
        if(!response.ok) throw new Error(`Problem with geocoding ${response.status}`);
        return response.json();
        })
    .then(data => {
        console.log(data);
        if(!data.success) throw new Error(`Try again later`);
        console.log(data);
        console.log(`You are in ${data.city}, ${data.country}!`);

        return fetch(`https://restcountries.com/v3.1/name/${data.country}`);
})
.then(response => {
    if(!response.ok) throw new Error(`Country not found (${response.status})`);
    return response.json();
})
.then(data => renderCountry(data[0]))
.catch(err => console.log(`${err.message}.`));
}

btn.addEventListener('click', whereAmI);
*/

//Challenge #2
//func create img, receives impPath as input
//returns promise - create new img - doc.createelem('img') and set stc to img patg
//when img done loading append to dom el with images class and resolve promise
//error load 'error'event reject promise
/*
const wait = function (seconds) {
    return new Promise(function (resolve) { //imposible for timer to fail
        setTimeout(resolve, seconds * 1000);
    })
};

const imgContainer = document.querySelector('.images');

const createImage = function(imgPath) {
    
    return new Promise(function(resolve, reject) {
        const img = document.createElement('img');
        img.src = imgPath;

        img.addEventListener('load',function() {
            imgContainer.appendChild(img);
            resolve(img);
        });

        img.addEventListener('error', function() {
            reject(new Error('Image not found'))
        })
    })
};
let currentImg;

createImage('./img/img-1.jpg').
then(img => {
    currentImg = img;
    currentImg.style.display = 'block';
    console.log('Image 1 loaded');
    return wait(5);
})
.then(() => {
    console.log('5 seconds passed');
    currentImg.style.display = 'none';
    return createImage('./img/img-2.jpg');
})
.then(img => {
    currentImg = img;
    console.log('Image 2 loaded');
    return wait(5);
})
.then(() => {
    console.log('5 seconds passed');
    currentImg.style.display = 'none';
    return createImage('./img/img-3.jpg');
})
.then(img => {
    currentImg = img;
    console.log('Image 3 loaded');
})
.catch(err => console.error(err));


//consume promse using then and add error handling
//after img loaded pasued using wait function
*/

//Async Await

const getPosition = function() {
    return new Promise(function(resolve, reject) {
       // navigator.geolocation.getCurrentPosition(position => console.log(position),
       // err => reject(err)
       // );
       navigator.geolocation.getCurrentPosition(resolve, reject); //exactly same as one above
    })
}

const whereAmI = async function() { //function keep running in backgr while perfroming code inside, once done it return promise
    //inside we can have 1 or more await statements/ await promise
    try {
    const position =  await getPosition();
    console.log(position);
    const {latitude: lat, longitude: long} = position.coords;
    const resGeo = await fetch(`http://api.geonames.org/countryCodeJSON?lat=${lat}&lng=${long}&username=wanda`);
    if(!resGeo) throw new Error('Problem getting location data');
    console.log(resGeo);
    const name = await resGeo.json();
    console.log(name);
    const response = await fetch(`https://restcountries.com/v3.1/name/${name.countryName}`); //will return promise, await for result of promise it wil lstop execution
    const data = await response.json();
    console.log(data);
    renderCountry(data[0]);
    return `You are in ${data[0].capital}, ${name.countryName}`
    } catch (err) {
        console.error(`${err}`);
        renderError(`Something went wrong ${err.message}`)
        throw err;
    }
    //above is the same as:
    // fetch(`...`).then(response => response.json()).then(data => console.log(DatA) )
}

console.log('1:Getting location');

/*
whereAmI()
.then(city => console.log(city))
.catch(err => console.error(`2:${err.message}`))
.finally(() => console.log('3: Finished getting location'))
*/
//can be done btter:

/*
//ife function - write and call
(async function() {
    try{
        const city = await whereAmI();
        console.log(`2: ${city}`);
    }catch (err)
 {
    console.error(`2:${err.message}`);
 }
 console.log('3: Finished getting location')
}) ();
*/

////////


/*
const get3Countries = async function(c1, c2, c3) {
    try {
       /* const [data1] = await getJSON(`https://restcountries.com/v3.1/name/${c1}`);
        const [data2] = await getJSON(`https://restcountries.com/v3.1/name/${c2}`);
        const [data3] = await getJSON(`https://restcountries.com/v3.1/name/${c3}`);
        console.log([data1.capital, data2.capital, data3.capital]);
        
       // all thsis op dont depend on eahc other - run in paraleelr liek this:
       const data = await Promise.all([
        getJSON(`https://restcountries.com/v3.1/name/${c1}`),
        getJSON(`https://restcountries.com/v3.1/name/${c2}`),
        getJSON(`https://restcountries.com/v3.1/name/${c3}`),
       ]);
        console.log(data.map(d => d[0].capital));
get3Countries('portugal','canada','tanzania');
*/

/*
//Promise.race
//takes array of promises and returns promise
//first settled promsie wins the race - only got one result - first one settled even rejected

(async function() {
    const res = await Promise.race([
        getJSON(`https://restcountries.com/v3.1/name/italy`),
        getJSON(`https://restcountries.com/v3.1/name/egypt`),
        getJSON(`https://restcountries.com/v3.1/name/mexico`),
    ]);
    console.log(res[0]);
})();


const timeout = function(sec) {
    return new Promise(function(_,reject) {
        setTimeout(function() {
            reject(new Error('Request too long'));
        }, sec * 1000)
    })
}
Promise.race([
    getJSON(`https://restcountries.com/v3.1/name/tanzania`),
    timeout(0.01)
]).then(res => console.log(res[0])).catch(err => console.error(err));
*/

/*
//Promise.allSettled
//takes array of promisses
//recieve array fo all settled promised not matter if rejected or not
Promise.allSettled([
    Promise.resolve('Success'),
    Promise.reject('Error'),
    Promise.resolve('Another success'),
]).then(res => console.log(res));
*/

Promise.all([
    Promise.resolve('Success'),
    Promise.reject('Error'),
    Promise.resolve('Another success'),
]).then(res => console.log(res))
.catch(err => console.error(err));

/*//Promise.any
//return first fullfiled promise, ignore rejected
//result always fulfileld
Promise.any([
    Promise.resolve('Success'),
    Promise.reject('Error'),
    Promise.resolve('Another success'),
]).then(res => console.log(res))
.catch(err => console.error(err));
*/

//Challenge
//recreate #2 wit hasync await
const imgContainer = document.querySelector('.images');
const wait = function (seconds) {
    return new Promise(function (resolve) { //imposible for timer to fail
        setTimeout(resolve, seconds * 1000);
    })
};
const createImage = function(imgPath) {
    
    return new Promise(function(resolve, reject) {
        const img = document.createElement('img');
        img.src = imgPath;

        img.addEventListener('load',function() {
            imgContainer.appendChild(img);
            resolve(img);
        });

        img.addEventListener('error', function() {
            reject(new Error('Image not found'))
        })
    })
};
/*
const loadNPause = async function(imgPath) {
    let currentImg;
    try {
        let img = await createImage('./img/img-1.jpg');
        currentImg = img;
        console.log('Image 1 loaded');
        await wait(5);
        currentImg.style.display = 'none';
        img = await createImage('./img/img-2.jpg');
        currentImg = img;
        console.log('Image 2 loaded');
        await wait(5);
        currentImg.style.display = 'none';
        img = await createImage('./img/img-3.jpg');
        console.log('Image 3 loaded')
    }catch(err) {
        console.error(`${err}`)}
    }
    loadNPause();
*/
    //async fnco load all recieve arry of img paths imgArr
    //.ap to loop over and loal all img wit chreat image functio - resulting array = imgs
    //- check imgs in console
    const imgArr = ['./img/img-1.jpg','./img/img-2.jpg','./img/img-3.jpg'];

    const loadAll = async function(imgArr) {
        try {
            const imgs = imgArr.map(async img => await createImage(img));
            console.log(imgs);

            const imgsEl = await Promise.all(imgs);
            console.log(imgsEl);
            imgsEl.forEach(img => img.classList.add('parallel'));
        }catch(err) {
            console.error(err);
        }
       
    }
 
    loadAll(imgArr);




