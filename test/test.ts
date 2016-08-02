import test = require('blue-tape');
import Bluebird = require('bluebird');

test('Promise.ctor', (t) => {
  // Ensure it works for type inferring case.
  let p = new Bluebird((resolve, reject) => {
    resolve();
    resolve(null);
    reject();
    reject(null);
  });
  return new Bluebird<void>((resolve, reject) => {
    resolve();
    t.assert(typeof resolve === 'function', 'resolve is a function');
    t.assert(typeof reject === 'function', 'reject is a function');
    resolve(null);
  }).then(() => p);
});

test('reflect', (t) => {
  let promises = [Bluebird.resolve(1), Bluebird.resolve(2), Bluebird.reject(3)];

  t.plan(3);
  let good = [1, 2];
  Bluebird.all(promises.map(function (promise) {
    return promise.reflect();
  })).each(function (inspection: Bluebird.Inspection<number>) {
    if (inspection.isFulfilled()) {
      let v = inspection.value();
      t.assert(~good.indexOf(v));
      good.splice(good.indexOf(v), 1);
    } else {
      t.equal(inspection.reason(), 3);
    }
  });
});

test('catch with predicate shorthand', (t) => {
  const error = {
    code: 'ENOENT',
    message: 'No entity found'
  };

  return new Bluebird((resolve, reject) => {
    reject(error);
  }).catch({ code: 'ENOENT' }, (e) => {
    t.equal(e.code, 'ENOENT');
  });
});

test('catch with predicate shorthand with extra properties', (t) => {
  const error = {
    code: 'ENOENT',
    message: 'No entity found'
  };

  return new Bluebird((resolve, reject) => {
    reject(error);
}).catch({ code: 'ENOENT', message: 'No entity found' }, (e) => {
    t.equal(e.code, 'ENOENT');
    t.equal(e.message, 'No entity found');
  });
});

test('catch with function predicate', (t) => {
  const error = {
    code: 'ENOENT',
    message: 'No entity found'
  };

  return new Bluebird((resolve, reject) => {
    reject(error);
  }).catch(e => e.code === 'ENOENT', (e) => {
    t.equal(e.code, 'ENOENT');
  });
});
