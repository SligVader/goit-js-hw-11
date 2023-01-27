import axios from 'axios';

async function pixabayAPI(quary, page) {
  const BASE_URL = 'https://pixabay.com/api/';
  const KEY = '33075314-b5ae829cc753917466890779e';

  const resp = await axios.get(
    `${BASE_URL}?key=${KEY}&q=${quary}&image_type=photo&orientation=horizontal&safesearch=true&page=${page}`
  );
  return resp.data;
}

export { pixabayAPI };
