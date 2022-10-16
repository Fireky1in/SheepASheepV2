class Randomizer {
  static setSeed(seeds) {
    if (!Array.isArray(seeds) || seeds.length !== 4) {
      throw new TypeError("seed must be an array with 4 numbers");
    }

    this._state0U = 0 | seeds[0];
    this._state0L = 0 | seeds[1];
    this._state1U = 0 | seeds[2];
    this._state1L = 0 | seeds[3];
  }

  static randomint() {
    var t = this._state0U,
      e = this._state0L,
      o = this._state1U,
      n = this._state1L,
      i = (n >>> 0) + (e >>> 0),
      a = (o + t + ((i / 2) >>> 31)) >>> 0,
      r = i >>> 0;
    this._state0U = o;
    this._state0L = n;
    var c = 0,
      s = 0;
    return (
      (c = (t ^= c = (t << 23) | ((-512 & e) >>> 9)) ^ o),
      (s = (e ^= s = e << 23) ^ n),
      (c ^= t >>> 18),
      (s ^= (e >>> 18) | ((262143 & t) << 14)),
      (c ^= o >>> 5),
      (s ^= (n >>> 5) | ((31 & o) << 27)),
      (this._state1U = c),
      (this._state1L = s),
      [a, r]
    );
  }

  static random() {
    var t = this.randomint();
    return (
      2.3283064365386963e-10 * t[0] + 2.220446049250313e-16 * (t[1] >>> 12)
    );
  }

  static shuffle(t) {
    for (var e = t.length - 1; e >= 0; e--) {
      var o = this.random(),
        n = Math.floor(o * (e + 1)),
        a = t[n];
      t[n] = t[e];
      t[e] = a;
    }
    return t;
  }
}

module.exports = { Randomizer };
