export type SequenceFnType<T> = () => IterableIterator<T>;

export type PredicateType<T> = (
  val: T,
  i?: number,
  seq?: SequenceFnType<T>
) => boolean;

export class Seq<T> implements Iterable<T> {
  seq: SequenceFnType<T>;

  static of<T>(list: Iterable<T>) {
    return new Seq(sequence(list));
  }

  constructor(seq: SequenceFnType<T>) {
    this.seq = seq;
  }

  *[Symbol.iterator]() {
    for (const i of this.seq()) {
      yield i;
    }
  }

  concat(seq: Iterable<T>): Seq<T> {
    return new Seq(concat(this, seq));
  }

  every(fn: PredicateType<T>): boolean {
    return every(this.seq, fn);
  }

  exit(fn: PredicateType<T>, result?: any): Seq<T> {
    return new Seq(exit(this.seq, fn, result));
  }

  exitAfter(fn: PredicateType<T>, result?: any): Seq<T> {
    return new Seq(exitAfter(this.seq, fn, result));
  }

  filter(fn: PredicateType<T>): Seq<T> {
    return new Seq(filter(this.seq, fn));
  }

  find(fn: PredicateType<T>): T | undefined {
    return find(this.seq, fn);
  }

  first(predicate?: PredicateType<T>): T | undefined {
    return first(this.seq, predicate);
  }

  flatMap<TOut>(
    fn: (val: T, i: number, seq: SequenceFnType<T>) => Iterable<TOut>
  ): Seq<TOut> {
    return new Seq(flatMap(this.seq, fn));
  }

  includes(item: T): boolean {
    return includes(this.seq, item);
  }

  last(predicate?: PredicateType<T>): T | undefined {
    return last(this.seq, predicate);
  }

  map<TOut>(
    fn: (val: T, i: number, seq: SequenceFnType<T>) => TOut
  ): Seq<TOut> {
    return new Seq(map(this.seq, fn));
  }

  reduce<TAcc>(
    fn: (acc: TAcc, item: T, i?: number, seq?: SequenceFnType<T>) => TAcc,
    initialValue: TAcc,
    fnShortCircuit?: (
      acc: TAcc,
      item?: T,
      i?: number,
      seq?: SequenceFnType<T>
    ) => boolean
  ): TAcc {
    return reduce(this.seq, fn, initialValue, fnShortCircuit);
  }

  reverse(): Seq<T> {
    return new Seq(reverse(this.seq));
  }

  slice(begin: number, end?: number): Seq<T> {
    return new Seq(slice(this.seq, begin, end));
  }

  some(fn: PredicateType<T>): boolean {
    return some(this.seq, fn);
  }

  sort(fn: (a: T, b: T) => number): Seq<T> {
    return new Seq(sort(this.seq, fn));
  }

  toArray(): Array<T> {
    return toArray(this.seq);
  }
}

export function sequence<T>(list: Iterable<T>): SequenceFnType<T> {
  return function* gen() {
    for (const item of list) {
      yield item;
    }
  };
}

export function concat<T>(
  iterable: Iterable<T>,
  newIterable: Iterable<T>
): SequenceFnType<T> {
  return function*() {
    for (const i of iterable) {
      yield i;
    }
    for (const j of newIterable) {
      yield j;
    }
  };
}

export function every<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): boolean {
  let i = 0;
  for (const item of seq()) {
    if (!fn(item, i, seq)) {
      return false;
    }
    i++;
  }
  return true;
}

export function exit<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>,
  result?: any
): SequenceFnType<T> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      if (fn(item, i, seq)) {
        return result;
      }
      yield item;
      i++;
    }
  };
}

export function exitAfter<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>,
  result?: any
): SequenceFnType<T> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      if (fn(item, i, seq)) {
        yield item;
        return result;
      }
      yield item;
      i++;
    }
  };
}

export function find<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): T | undefined {
  let i = 0;
  for (const item of seq()) {
    if (fn(item, i, seq)) {
      return item;
    }
    i++;
  }
}

export function filter<T>(
  seq: SequenceFnType<T>,
  fn: PredicateType<T>
): SequenceFnType<T> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      if (fn(item, i, seq)) {
        yield item;
      }
      i++;
    }
  };
}

export function first<T>(
  _seq: SequenceFnType<T>,
  predicate?: PredicateType<T>
): T | undefined {
  const seq = predicate ? filter(_seq, predicate) : _seq;

  for (const item of seq()) {
    return item;
  }
}

export function flatMap<T, TOut>(
  seq: SequenceFnType<T>,
  fn: (val: T, i: number, seq: SequenceFnType<T>) => Iterable<TOut>
): SequenceFnType<TOut> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      const childSeq = fn(item, i, seq);
      for (const child of childSeq) {
        yield child;
      }
      i++;
    }
  };
}

export function includes<T>(seq: SequenceFnType<T>, what: T): boolean {
  return some(seq, item => item === what);
}

export function last<T>(
  _seq: SequenceFnType<T>,
  predicate?: PredicateType<T>
): T | undefined {
  const seq = predicate ? filter(_seq, predicate) : _seq;

  let prev;
  for (const item of seq()) {
    prev = item;
  }
  return prev;
}

export function map<T, TOut>(
  seq: SequenceFnType<T>,
  fn: (val: T, i: number, seq: SequenceFnType<T>) => TOut
): SequenceFnType<TOut> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      yield fn(item, i, seq);
      i++;
    }
  };
}

export function reduce<T, TAcc>(
  seq: SequenceFnType<T>,
  fn: (acc: TAcc, item: T, i: number, seq: SequenceFnType<T>) => TAcc,
  initialValue: TAcc,
  fnShortCircuit?: (
    acc: TAcc,
    item?: T,
    i?: number,
    seq?: SequenceFnType<T>
  ) => boolean
): TAcc {
  let acc = initialValue;
  let i = 0;
  for (const item of seq()) {
    acc = fn(acc, item, i, seq);
    if (fnShortCircuit && fnShortCircuit(acc, item, i, seq)) {
      return acc;
    }
    i++;
  }
  return acc;
}

export function reverse<T>(seq: SequenceFnType<T>): SequenceFnType<T> {
  return function*() {
    const all = toArray(seq).reverse();
    for (const item of all) {
      yield item;
    }
  };
}

export function slice<T>(
  seq: SequenceFnType<T>,
  begin: number,
  end?: number
): SequenceFnType<T> {
  return function*() {
    let i = 0;
    for (const item of seq()) {
      if (i >= begin && (!end || i < end)) {
        yield item;
      }
      i++;
      if (i === end) {
        return;
      }
    }
  };
}

export function some<T>(seq: SequenceFnType<T>, fn: PredicateType<T>): boolean {
  let i = 0;
  for (const item of seq()) {
    if (fn(item, i, seq)) {
      return true;
    }
    i++;
  }
  return false;
}

export function sort<T>(
  seq: SequenceFnType<T>,
  fn: (a: T, b: T) => number
): SequenceFnType<T> {
  return function*() {
    const all = toArray(seq).sort(fn);
    for (const item of all) {
      yield item;
    }
  };
}

export function toArray<T>(seq: SequenceFnType<T>): Array<T> {
  const results = [];
  for (const item of seq()) {
    results.push(item);
  }
  return results;
}
