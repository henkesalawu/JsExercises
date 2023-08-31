const displayedImage = document.querySelector('.displayed-img');
const thumbBar = document.querySelector('.thumb-bar');

const btn = document.querySelector('button');
const overlay = document.querySelector('.overlay');

/* Declaring the array of image filenames */
const images = ['pic1','pic2','pic3','pic4','pic5'];
console.log(images);

/* Declaring the alternative text for each image file */
const alter = {
    pic1: "eye",
    pic2: "cloud",
    pic3: "flower",
    pic4: "egypt",
    pic5: "bug"
};

/* Looping through images */
for (let i = 0; i < images.length; i++) {
const newImage = document.createElement('img');
newImage.setAttribute('src', `images/${images[i]}.jpg`);
newImage.setAttribute('alt', alter[images[i]]);
thumbBar.appendChild(newImage);
}

const imageS = document.querySelectorAll('.thumb-bar img');
console.log(imageS);
imageS.forEach((img) => {
    img.addEventListener('click', () => {
        displayedImage.setAttribute('src', img.src);
        displayedImage.setAttribute('alt', img.alt)
    })
})

/* Wiring up the Darken/Lighten button */

btn.addEventListener('click', () => {
    overlay.classList.toggle("dark");
    btn.classList.toggle("dark");
    if(overlay.classList.contains('.dark')) {
        btn.innerHTML ='Lighten';
    }else {
        btn.innerHTML ='Darken'
    }
})

