import { Notify } from 'notiflix/build/notiflix-notify-aio';
import { pixabayAPI } from './pixabayFetch';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

const form = document.querySelector('.search-form');
const gallery = document.querySelector('.gallery');
const guard = document.querySelector('.js-guard');

const galleryModal = new SimpleLightbox('.gallery a', {
  captionsData: 'alt',
  captionClass: 'caption',
  captionDelay: 250,
  scrollZoom: false,
});

const options = {
  root: null,
  rootMargin: '300px',
  threshold: 1.0,
};

let quiry = '';
let page = 1;
let perPage = 20;

form.addEventListener('submit', onSearchPictures);

async function onSearchPictures(evt) {
  evt.preventDefault();
  gallery.innerHTML = '';
  quiry = form.searchQuery.value.trim();
  page = 1;

  if (evt.currentTarget.elements.searchQuery.value === '') {
    Notify.failure('Enter something to search');
    gallery.innerHTML = '';
    observer.unobserve(guard);
    return;
  }

  pixabayAPI(quiry, page, perPage)
    .then(data => {
      //   console.dir(data);

      if (data.totalHits === 0) {
        Notify.failure(
          'Sorry, there are no images matching your search query. Please try again.'
        );
      } else Notify.success(`Hooray! We found ${data.totalHits} images.`);
      if (Math.ceil(data.totalHits >= perPage)) {
        observer.observe(guard);
      } else
        Notify.info(
          "We're sorry, but you've reached the end of search results."
        );
      createMarkup(data.hits);
      galleryModal.refresh();
    })
    .catch(err => console.log(err));
  console.log(quiry);
}

let observer = new IntersectionObserver(onLoad, options);

function onLoad(entries, observer) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      page += 1;
      pixabayAPI(quiry, page, perPage)
        .then(data => {
          createMarkup(data.hits);
          galleryModal.refresh();
          if (page === Math.ceil(data.totalHits / perPage)) {
            Notify.info(
              "We're sorry, but you've reached the end of search results."
            );
            observer.unobserve(guard);
          }
          //   console.log(page);
          //   console.log(Math.ceil(data.totalHits / perPage));
        })
        .catch(err => console.log(err));
    }
  });
}

function createMarkup(arr) {
  const markup = arr
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) =>
        `<div class="photo-card">
   <a href="${largeImageURL}"><img src="${webformatURL}" alt="${tags}"  loading="lazy"/></a>
  <div class="info">
    <p class="info-item">
      Likes
      <span>${likes}</span>
    </p>
    <p class="info-item">
      Views
      <span>${views}</span>
      
    </p>
    <p class="info-item">
      Comments
      <span>${comments}</span>
      
    </p>
    <p class="info-item">
      Downloads
      <span>${downloads}</span>
      
    </p>
  </div>
</div>`
    )
    .join('');

  gallery.insertAdjacentHTML('beforeend', markup);
}
