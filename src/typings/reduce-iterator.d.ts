declare module reduceIterator {
    interface reduceIterator {
        <T, U>(iterable: IterableIterator<T>, reducer: (prev: T, curr: T) => U): U;
        <T, U>(iterable: IterableIterator<T>, reducer: (prev: U, curr: T) => U, accumulator: U): U;
    }
}

declare module "reduce-iterator" {
    var reduce: reduceIterator.reduceIterator;
    export = reduce;
}
