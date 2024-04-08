

function gcd(a, b) {
    while (b != 0) {
      let t = b;
      b = a % b;
      a = t;
    }
    return a;
  }

  function lcm(a, b) {
    return Math.abs(a * b) / gcd(a, b);
  }

  function lcm3(a, b, c) {
    let currentLcm = lcm(a, b);
    currentLcm = lcm(currentLcm, c);

    return currentLcm;
  }

  function lcmOfArray(arr) {
    let currentLcm = arr[0];
    for (let i = 1; i < arr.length; i++) {
      currentLcm = lcm(currentLcm, arr[i]);
    }
    return currentLcm;
  }