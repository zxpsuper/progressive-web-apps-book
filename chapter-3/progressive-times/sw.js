var cacheName = 'latestNews-v2';

// Cache our known resources during install
self.addEventListener('install', event => {
  console.log('status', 'install')
  event.waitUntil(
    caches.open(cacheName)
    .then(cache => {
      cache.addAll([])
      // 立即变为激活状态
      self.skipWaiting();
    })
  );
});

// 监听activate事件，激活后通过cache的key来判断是否更新cache中的静态资源
self.addEventListener('activate', function (e) {
  console.log('Service Worker 状态： activate');
  var cachePromise = caches.keys().then(function (keys) {
      return Promise.all(keys.map(function (key) {
          if (key !== cacheName) {
              return caches.delete(key);
          }
      }));
  })
  e.waitUntil(cachePromise);
  return self.clients.claim();
});

// Cache any new resources as they are fetched
self.addEventListener('fetch', function(event) {
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true })
    .then(function(response) {
      if (response) {
        return response;
      }
      var fetchRequest = event.request.clone();

      return fetch(fetchRequest).then(
        function(response) {
          if(!response || response.status !== 200) {
            return response;
          }

          var responseToCache = response.clone();
          caches.open(cacheName)
          .then(function(cache) {
            console.log(111)
            cache.put(event.request, responseToCache);
          });

          return response;
        }
      );
    })
  );
});
