export class MapArray<K, V> extends Map<K, Array<V>> {
  add(key: K, ...values: Array<V>) {
    if (!this.has(key)) {
      this.set(key, []);
    }

    this.get(key)?.push(...values);
  }
}
