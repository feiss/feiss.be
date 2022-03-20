/* by Diego F. Goberna  http://feiss.be */

g = d = n = r = t = 0, q = 1, P = 9, H = [];
F = (p, x, y, w) => { c.fillStyle = "#" + p; c.fillRect(x, y, w, w) }

p = "140c1c,423,30346d,444,854c30,362,d04648,776,597dce,d27d2c,8595a1,7a3,d2aa99,6dc2ca,dd6,eee".split(",");

A = [];
for (i = 16; i--;) A.push(new Array(32 * 32).fill(0))

D = e => {
  F(222, 0, 0, 32 * 32);
  p.map((i, j) => F(i, (j == P) * 4 + 16 * 32, (j == P) * 4 + j * 32, 32 - (j == P) * 8));
  e = e ? e : 0;
  C = A[n];
  if (n) {
    c.globalAlpha = 0.3;
    A[n - 1].map((i, j) => F(p[i], j % 32 * 16, (j / 32 | 0) * 16, 15 + g));
  }
  if (n < 15) {
    c.globalAlpha = 0.1;
    A[n + 1].map((i, j) => F(p[i], j % 32 * 16, (j / 32 | 0) * 16, 15 + g));
  }
  c.globalAlpha = 1;
  C.map((i, j) => i && F(p[i], j % 32 * 16, (j / 32 | 0) * 16, 15 + g));

  C.map((i, j) => F(p[i], 32 * 2 + 32 * 16 + j % 32 * 3, (j / 32 | 0) * 3, 3))
  A.map((i, j) => F(j == n ? "fff" : 444, 5 + j * 32, 5 + 16 * 32, 22));
  E(r)
  Y(t)
}

E = e => A[e | 0].map((i, j) => F(p[i], 32 * 2 + 32 * 16 + j % 32 * 3, 32 * 4 + (j / 32 | 0) * 3, 3));

Y = e => {
  F(111, 560, 240, 256);
  for (a in A) A[a].map((i, j) => {
    x = (j % 32 - 16) * 5;
    y = ((j / 32 - 16) | 0) * 5;
    if (i)
      F(p[i],
        x * Math.cos(t * .1) - y * Math.sin(t * .1) + 684,
        (x * Math.sin(t * .1) + y * Math.cos(t * .1)) * 0.5 + 430 - a * 6,
        7)
  })
}

D();
R = (p, x, y, w) => {
  w = (y / 16 | 0) * 32 + (x / 16 | 0);
  if (C[w] == p && w < 32 * 32 && w >= 0) {
    C[w] = P;
    R(p, x + 16, y)
    R(p, x - 16, y)
    R(p, x, y - 16)
    R(p, x, y + 16)
  }
}
onmousedown = e => {
  if (e.y < 32 * 16) {
    if (e.x < 32 * 16) {
      H.push(C.slice(0));
      q = n + 1 > q ? n + 1 : q;
      if (e.altKey) R(C[(e.y / 16 | 0) * 32 + (e.x / 16 | 0)], e.x, e.y);
      C[(e.y / 16 | 0) * 32 + (e.x / 16 | 0)] = P
    }
    else if (e.x < 32 * 16 + 32) P = e.y / 32 | 0;
  } else if (e.y < 32 * 16 + 32) {
    n = e.x / 32 | 0;
    H = [];
  }
  d = 1;
  D()
}
onmousemove = e => { if (d && e.y < 32 * 16 && e.x < 32 * 16) C[(e.y / 16 | 0) * 32 + (e.x / 16 | 0)] = P; D() }
onmouseup = e => d = 0;
onkeydown = e => { (k = e.which) == 71 ? g = !g : (k == 90 && H.length ? A[n] = H.pop() : (k == 67 ? A[n].fill(0) : 0)); D() }
setInterval(e => E(r = (r + .5) % q, Y(t++)), 50)
