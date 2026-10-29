'use strict';
const { configured, isAdmin, send, MAX_PHOTOS } = require('./_lib');
const store = require('./_store');

module.exports = function session(req, res) {
  return send(res, 200, {
    admin: isAdmin(req),
    configured: configured(),
    storage: store.available(),
    storageMode: store.mode(),
    reviewStorage: store.privAvailable(),
    maxPhotos: MAX_PHOTOS
  }, { 'Cache-Control': 'no-store' });
};
