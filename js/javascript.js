// GET DATA //
async function getData() {
    try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/random.php');
        const data = await response.json();

        // Update recept img //
        const recipeImage = document.getElementById('recipe-image');
        recipeImage.src = data.meals[0].strMealThumb;
        recipeImage.alt = data.meals[0].strMeal;

        // Update category //
        const recipeCategory = document.getElementById('recipe-category')
        recipeCategory.textContent = data.meals[0].strCategory;

        // Update receptnaam //
        const recipeName = document.getElementById('recipe-name');
        recipeName.textContent = data.meals[0].strMeal;

        // Update ingredients + meassurements //
        const ingredientsTable = document.getElementById('ingredients-table');
        ingredientsTable.innerHTML = (''); 

        for (i = 1; i <= 20; i++) {
            const ingredient = data.meals[0][`strIngredient${i}`];
            const measure = data.meals[0][`strMeasure${i}`];
            
            if (ingredient && ingredient.trim() !== '' && measure && measure.trim() !== '') {
                const row = document.createElement('tr');

                // Ingrediënt cel
                const ingredientTd = document.createElement('td');
                ingredientTd.className = 'ingredient';
                ingredientTd.textContent = ingredient.trim();

                // meassurement cel
                const meassurementTd = document.createElement('td');
                meassurementTd.className = 'measurement';
                meassurementTd.textContent = measure.trim();

                row.appendChild(ingredientTd);
                row.appendChild(meassurementTd);
                ingredientsTable.appendChild(row);
            } else {
                break;
            }
        }

        // Update directions //
        const instructionDiv = document.getElementById('recipe-instructions');
        instructionDiv.innerHTML = ('');
        const instructions = data.meals[0].strInstructions;

        // Splits eerst op regeleinden & filter lege regels eruit
        let paragraphs = instructions.split('\n').filter(line => line.trim() !== '');
        // Als er geen regeleinden zijn of te weinig splitsing, splits verder op punten
        if (paragraphs.length <= 1) {
            paragraphs = instructions.split('. ').map(sentence => sentence.trim());
        }
        // Maak <p> voor elke paragraaf
        paragraphs.forEach(paragraph => {
            if (paragraph) { 
                const p = document.createElement('p');
                // Voeg de punt weer toe als op '. ' is gesplitst
                p.textContent = paragraph + (paragraphs.length > 1 && instructions.includes('. ') ? '.' : '');
                instructionDiv.appendChild(p);
            }
        });

        // Update directions //
        const link = document.getElementById('recipe-link');
        link.href = data.meals[0].strSource;

        // Update tags //
        const recipeTags = document.getElementById('recipe-tags');
        recipeTags.innerHTML = '';
        const tagsString = data.meals[0].strTags;
        if (tagsString) {
            const tagsArray = tagsString.split(',') // Splits op komma's
            tagsArray.forEach(tag => {
                const tagDiv = document.createElement('div');
                tagDiv.textContent = tag.trim(); //verwijderen van spacties
                recipeTags.appendChild(tagDiv);
            });
        } else {
            const noTags = document.createElement('div')
            noTags.textContent = 'food';
            recipeTags.append(noTags);
        }

    } catch (error) {
        console.error('Fout bij ophalen:', error);
    }
}

getData();


//-------------------------------------------------//


// SWIPE FUNCTIE //
const tabs = document.querySelectorAll('.tab');
const slides = document.querySelectorAll('.slide');
const swiper = document.querySelector('.swiper');

let currentSlide = 0;
let startX = 0;
let currentX = 0;
let isSwiping = false;

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        const slideIndex = parseInt(tab.getAttribute('data-slide'));
        showSlide(slideIndex);
    });
});

function startSwipe(e) {
    startX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    isSwiping = true;
    slides.forEach(slide => slide.style.transition = 'none');
}

function moveSwipe(e) {
    if (!isSwiping) return;
    currentX = e.type.includes('mouse') ? e.clientX : e.touches[0].clientX;
    const diffX = currentX - startX;
    const translateX = (diffX / swiper.offsetWidth) * 100;
    const rotation = translateX * 0.2; // Max 20 graden rotatie
    const opacity = 1 - Math.abs(translateX) / 100; 

    // Transformeer de huidige slide met rotatie en opacity
    slides[currentSlide].style.transform = `translateX(${translateX}%) rotate(${rotation}deg)`;
    slides[currentSlide].style.opacity = opacity;
    slides[currentSlide].style.boxShadow = `rgba(99, 99, 99, ${0.2 * opacity}) 0px 2px 8px 0px`;

    // Laat de volgende of vorige slide zien zonder rotatie
    if (translateX < 0 && currentSlide < slides.length - 1) {
        const nextSlide = slides[currentSlide + 1];
        nextSlide.style.visibility = 'visible';
        nextSlide.style.transform = `translateX(${100 + translateX}%)`;
        nextSlide.style.opacity = 1; // Volgende slide volledig zichtbaar
        nextSlide.style.rotate = '0deg';
    } else if (translateX > 0 && currentSlide > 0) {
        const prevSlide = slides[currentSlide - 1];
        prevSlide.style.visibility = 'visible';
        prevSlide.style.transform = `translateX(${-100 + translateX}%)`;
        prevSlide.style.opacity = 1;
        prevSlide.style.rotate = '0deg';
    }
}

function endSwipe() {
    if (!isSwiping) return;
    isSwiping = false;
    slides.forEach(slide => slide.style.transition = 'transform 0.4s ease-in-out, opacity 0.4s ease-in-out, rotate 0.4s ease-in-out');

    const diffX = currentX - startX;
    const swipeThreshold = swiper.offsetWidth * 0.3;

    if (Math.abs(diffX) > swipeThreshold) {
        if (diffX < 0 && currentSlide < slides.length - 1) {
            showSlide(currentSlide + 1); // Swipe naar rechts
        } else if (diffX > 0 && currentSlide > 0) {
            showSlide(currentSlide - 1); // Swipe naar links
        } else {
            showSlide(currentSlide); // Terug naar huidige
        }
    } else {
        showSlide(currentSlide); // Terug naar huidige
    }
}

function showSlide(slideIndex) {
    currentSlide = slideIndex;

    tabs.forEach(tab => tab.classList.remove('active'));
    tabs[slideIndex].classList.add('active');

    slides.forEach((slide, index) => {
        slide.classList.toggle('active', index === slideIndex);
        if (index < slideIndex) {
            slide.style.transform = 'translateX(-100%) rotate(-20deg)';
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
        } else if (index > slideIndex) {
            slide.style.transform = 'translateX(100%) rotate(20deg)';
            slide.style.opacity = '0';
            slide.style.visibility = 'hidden';
        } else {
            slide.style.transform = 'translateX(0) rotate(0deg)';
            slide.style.opacity = '1';
            slide.style.visibility = 'visible';
        }
    });
}
swiper.addEventListener('touchstart', startSwipe);
swiper.addEventListener('touchmove', moveSwipe);
swiper.addEventListener('touchend', endSwipe);
swiper.addEventListener('mousedown', startSwipe);
swiper.addEventListener('mousemove', moveSwipe);
swiper.addEventListener('mouseup', endSwipe);
swiper.addEventListener('mouseleave', endSwipe);

// Initialiseer de eerste slide
showSlide(0);