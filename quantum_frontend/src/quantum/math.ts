export class Complex {
  re: number;
  im: number;
  constructor(re: number, im: number) {
    this.re = re;
    this.im = im;
  }
  add(c: Complex) { return new Complex(this.re + c.re, this.im + c.im); }
  sub(c: Complex) { return new Complex(this.re - c.re, this.im - c.im); }
  mul(c: Complex) { return new Complex(this.re * c.re - this.im * c.im, this.re * c.im + this.im * c.re); }
  magSq() { return this.re * this.re + this.im * this.im; }
  mag() { return Math.sqrt(this.magSq()); }
  phase() { return Math.atan2(this.im, this.re); }
  scale(s: number) { return new Complex(this.re * s, this.im * s); }
  format() {
    const reStr = this.re.toFixed(2);
    const imStr = Math.abs(this.im).toFixed(2);
    const sign = this.im < 0 ? '-' : '+';
    return `${reStr} ${sign} ${imStr}i`;
  }
  static ZERO = new Complex(0, 0);
  static ONE = new Complex(1, 0);
  static I = new Complex(0, 1);
}

export type Vector = Complex[];
export type Matrix = Complex[][];

export function multiplyMatrixVector(m: Matrix, v: Vector): Vector {
  const result: Vector = [];
  for (let i = 0; i < m.length; i++) {
    let sum = Complex.ZERO;
    for (let j = 0; j < v.length; j++) {
      sum = sum.add(m[i][j].mul(v[j]));
    }
    result.push(sum);
  }
  return result;
}

export function multiplyMatrices(a: Matrix, b: Matrix): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < a.length; i++) {
    result[i] = [];
    for (let j = 0; j < b[0].length; j++) {
      let sum = Complex.ZERO;
      for (let k = 0; k < a[0].length; k++) {
        sum = sum.add(a[i][k].mul(b[k][j]));
      }
      result[i][j] = sum;
    }
  }
  return result;
}

export function tensorProductMatrix(a: Matrix, b: Matrix): Matrix {
  const result: Matrix = [];
  for (let i = 0; i < a.length * b.length; i++) {
    result.push([]);
    for (let j = 0; j < a[0].length * b[0].length; j++) {
      const aRow = Math.floor(i / b.length);
      const aCol = Math.floor(j / b[0].length);
      const bRow = i % b.length;
      const bCol = j % b[0].length;
      result[i][j] = a[aRow][aCol].mul(b[bRow][bCol]);
    }
  }
  return result;
}
