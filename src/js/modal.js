import axios from 'axios';

function initializeExercisePage() {
  // Get the HTMLCollection of elements with class 'exercises-tiles-list'
  const categoriesСardsList = document.getElementsByClassName(
    'categories__cards-list'
  );

  // Get the modal element
  const modal = document.getElementById('modal');

  // Get the <span> element that closes the modal
  const closeBtn = document.getElementsByClassName('modal-close-btn')[0];

  let savedExercises = localStorage.getItem('savedExercises')
    ? JSON.parse(localStorage.getItem('savedExercises'))
    : [];
  categoriesСardsList;

  // When the user clicks on (x), close the modal
  if (closeBtn) {
    closeBtn.onclick = function () {
      modal.style.display = 'none';
      localStorage.removeItem('currentExercise');
    };
  }

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = function (event) {
    if (event.target == modal) {
      modal.style.display = 'none';
      localStorage.removeItem('currentExercise');
    }
  };

  // Loop through the HTML collection (if there are multiple elements with this class)
  for (let i = 0; i < categoriesСardsList.length; i += 1) {
    const currentList = categoriesСardsList[i];

    // Add an event listener to each element in the HTMLCollection
    currentList.addEventListener('click', function (event) {
      const clickedListItem = event.target.closest('.card-menu-start');
      const categoryTileItem = event.target.closest('.card-item');
      if (clickedListItem) {
        const exerciseId = categoryTileItem.dataset.id;
        modal.style.display = 'flex';

        const apiUrl = `https://your-energy.b.goit.study/api/exercises/${exerciseId}`;

        axios
          .get(apiUrl)
          .then(response => {
            if (response) {
              // Saves current exercise that is opened in the modal for modal rating
              localStorage.setItem(
                'currentExercise',
                JSON.stringify(response.data)
              );
              return response.data;
            }
          })
          .then(data => {
            displayExerciseDetails(data);

            const favBtn = document.getElementById('fav-btn');
            if (favBtn) {
              // Check if the exercise is in the savedExercises array
              const isSaved = savedExercises.some(
                exercise => exercise._id === data._id
              );

              // Check if the exercise is in the savedExercises array and render necessary icon accordingly
              const heartIcon = favBtn.querySelector('.modal-heart-icon use');
              heartIcon.setAttribute(
                'href',
                isSaved
                  ? './img/sprite.svg#icon-trash'
                  : './img/sprite.svg#icon-heart'
              );

              // Set button text based on whether the exercise is saved or not
              favBtn.querySelector('.modal-btn-text').textContent = isSaved
                ? 'Unfavorite'
                : 'Add to favorites';

              favBtn.addEventListener('click', function () {
                const isSaved = savedExercises.some(
                  exercise => exercise._id === data._id
                );

                if (isSaved) {
                  // Remove the exercise from savedExercises array
                  savedExercises = savedExercises.filter(
                    exercise => exercise._id !== data._id
                  );
                } else {
                  // Add the exercise to savedExercises array
                  savedExercises.push(data);
                }

                // Update localStorage with the updated savedExercises array
                localStorage.setItem(
                  'savedExercises',
                  JSON.stringify(savedExercises)
                );

                // Toggle button text between 'Add to favorites' and 'Remove from favorites'
                favBtn.querySelector('.modal-btn-text').textContent = isSaved
                  ? 'Add to favorites'
                  : 'Unfavorite';

                // Change btn's icon when it is being saved/removed to/from favorires
                const heartIcon = favBtn.querySelector('.modal-heart-icon use');
                heartIcon.setAttribute(
                  'href',
                  isSaved
                    ? './img/sprite.svg#icon-heart'
                    : './img/sprite.svg#icon-trash'
                );
              });
            }
          })
          .catch(error => {
            console.error('There was a problem with the Axios request:', error);
          });
      }
    });
  }

  // This function is used to add a page markup
  function displayExerciseDetails(data) {
    const exerciseDetailsContainer = document.getElementById('exerciseDetails');

    let gifImage = null;

    if (data.gifUrl) {
      gifImage = `<div class="modal-gif-wrapper">
        <img class="gif" src="${data.gifUrl}" alt="Exercise GIF">
        <div class="gif-overlay"></div>
        </div>`;
    } else {
      gifImage = `<div class="modal-gif-wrapper">
        <img class="modal-gif" src="" alt="Exercise IMG">
        <div class="modal-gif-overlay"></div>
        </div>`;
    }

    const title = `<p class='modal-card-title'>${
      data.name.charAt(0).toUpperCase() + data.name.slice(1)
    }</p>`;
    const stars = generateStarRating(Math.round(data.rating * 10) / 10);

    const rating = `<div class='modal-rating-container'>
      <span class="modal-rating">${
        data.rating.toString().includes('.')
          ? Math.round(data.rating * 10) / 10
          : data.rating + '.0'
      }</span>
      ${stars}
      </div>`;

    const details = `<div class="modal-details-container">
      <div class="modal-details-wrapper">
      <p class="modal-details-title">Target</p>
      <p class="modal-details-info">${
        data.target.charAt(0).toUpperCase() + data.target.slice(1)
      }</p>
      </div>
      <div class="modal-details-wrapper">
      <p class="modal-details-title body-part">Body Part</p>
      <p class="modal-details-info">${
        data.bodyPart.charAt(0).toUpperCase() + data.bodyPart.slice(1)
      }</p>
      </div>
      <div class="modal-details-wrapper">
      <p class="modal-details-title">Equipment</p>
      <p class="modal-details-info">${
        data.equipment.charAt(0).toUpperCase() + data.equipment.slice(1)
      }</p>
      </div>
      <div class="modal-details-wrapper">
      <p class="modal-details-title">Popular</p>
      <p class="modal-details-info">${data.popularity}</p>
      </div>
      </div>
      <div class="modal-details-wrapper modal-calories">
      <p class="modal-details-title">Burned Calories</p>
      <p class="modal-details-info">${data.burnedCalories}</p>
      </div>`;

    const description = `<div class="modal-description">${data.description}</div>`;

    const buttons = `<div class="modal-btns-wrapper">
      <button class="modal-btn modal-fav-btn" id="fav-btn">
      <span class="modal-btn-text modal-fav-btn-text">Add to favorites</span>
      <svg class="modal-heart-icon" aria-label="logo icon">
      <use href="./img/sprite.svg#icon-heart"></use>
      </svg>
      </button>
      <button class="modal-btn modal-rating-btn">
      <span class="modal-btn-text">Give a rating</span>
      </button>
      </div>`;

    exerciseDetailsContainer.innerHTML = `${
      gifImage +
      `<div class="modal-content-wrapper">${
        title + rating + details + description + buttons
      }</div>`
    }`;
  }

  function generateStarRating(rating) {
    const starIcon = `<div class="modal-star-wrapper"><svg class="modal-star-icon modal-colored-star">
      <use href="./img/sprite.svg#icon-star"></use>
      </svg></div>`;

    const emptyStar = `<div class="modal-star-wrapper"><svg class="modal-star-icon">
      <use href="./img/sprite.svg#icon-star"></use>
      </svg></div>`;

    let starsHTML = '';
    let integerPart = Math.floor(rating);
    let decimalPart = rating - integerPart;

    // Fill stars
    for (let i = 0; i < 5; i++) {
      if (i < integerPart) {
        starsHTML += starIcon;
      } else if (i === integerPart && decimalPart > 0) {
        const gradientPercentage = Math.round(decimalPart * 100);
        starsHTML += `<div class="modal-star-wrapper" style="mask-image: linear-gradient(90deg, #EEA10C ${gradientPercentage}%, rgba(244, 244, 244, 0.2) ${gradientPercentage}%); -webkit-mask-image: linear-gradient(90deg, #EEA10C ${gradientPercentage}%, rgba(244, 244, 244, 0.2) ${gradientPercentage}%);"><svg class="modal-star-icon modal-colored-star" >
          <use href="./img/sprite.svg#icon-star"></use>
          </svg></div>`;
      } else {
        starsHTML += emptyStar;
      }
    }
    return `${starsHTML}`;
  }
}

// Trigger the code when the window finishes loading
window.onload = function () {
  // Check if the current page matches the specific page structure
  const isExercisePage = document.querySelector('.home__container');

  // If the page structure matches, initialize the exercise page
  if (isExercisePage) {
    initializeExercisePage();
  }
};
