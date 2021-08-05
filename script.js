'use strict';

let spinner = document.querySelector('.spinner');
let cursor = null;
let observer = new IntersectionObserver((entries, observer) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      initialize();
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 1 })

function initialize() {
  spinner.style.display = 'inline-block';
  let streamJson;
  fetch(`https://api.twitch.tv/helix/streams${cursor ? `?first=10&after=${cursor}` : ''}`, {
    "method": "GET",
    "headers": {
      "Authorization": "Bearer r9gk65ynzsoq50zxmhy57d5akaxkyx",
      "Client-Id": "wgxluo9ds2z8f4e53n6dh1bw5srnxs"
    }
  })
    .then(response => response.json())
    .then(json => {
      cursor = json.pagination.cursor;
      streamJson = json.data;
      return Promise.all(streamJson.map(e => fetch(`https://api.twitch.tv/helix/users?id=${e.user_id}`, {
        "method": "GET",
        "headers": {
          "Authorization": "Bearer r9gk65ynzsoq50zxmhy57d5akaxkyx",
          "Client-Id": "wgxluo9ds2z8f4e53n6dh1bw5srnxs"
        }
      })));
    })
    .then(response => Promise.all(response.map(e => e.json())))
    .then(data => {
      let json = streamJson.map((e, i) => {
        return { user_name: e.user_name, user_login: e.user_login, viewer_count: e.viewer_count, title: e.title, profile_img: data[i].data[0]['profile_image_url'] }
      })
      return json;
    })
    .then(json => {
      let streamsList = document.querySelector('.streams__list');
      json.map(e => {
        let { user_name, user_login, viewer_count, title, profile_img } = e;

        let listItem = `<li class="stream__item">
          <div class="user">
            <img src="${profile_img}" alt="" />
            <p>${user_name}</p>
          </div>
          <div class="stream">
            <a href="https://www.twitch.tv/${user_login}" target="_blank" rel="noreferrer" class="title">
            ${title}</a>
            <p class="viewer">Viewer Count: <span>${viewer_count}</span></p>
          </div>
        </li>`;
        streamsList.innerHTML += listItem;
      })
      let last = document.querySelector('ul > li:last-child');
      observer.observe(last);
      spinner.style.display = 'none';
    })
    .catch(err => {
      console.error(err);
    });
}

initialize();