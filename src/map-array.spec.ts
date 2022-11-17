import expect from '@nilscox/expect';

import { MapArray } from './map-array';

describe('MapArray', () => {
  it('adds a new element to a map array', () => {
    const map = new MapArray<string, number>();

    map.add('a', 1);
    map.add('a', 2);

    expect(map.get('a')).toEqual([1, 2]);
  });
});
