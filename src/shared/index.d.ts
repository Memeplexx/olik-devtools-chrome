export { };

declare module 'react' {

  function forwardRef<T, P>(
    render: (props: P, ref: Ref<T>) => ReactElement | null
  ): (props: P & RefAttributes<T>) => ReactElement | null;

}

declare global {
  interface EventTarget {
    /**
     * Checks whether an element or any of its ancestors matches a given condition.
     */
    hasAncestor: (check: HTMLElement | null | ((element: HTMLElement) => boolean)) => boolean;
  }

  interface Object {
    keysTyped: <O extends object>(obj: O) => Array<keyof O>;
  }

  interface Array<T> {
    /**
     * Remove element(s) using the supplied function to find those elements to remove.
     *
     * @example
     * array.remove(e => e.id === 3) // remove a single element
     * @example
     * array.remove(e => e.status === 'done'); // remove multiple elements
     */
    remove(elementFinder: (el: T) => boolean): void;
    /**
     * Returns a new array with all duplicates removed.
     *
     * * If no function is supplied, elements will be compared directly.
     * This overload is useful for comparing arrays of primitives or strings, and not arrays of objects.
     *
     * * If a function is supplied, the property returned by that function will be used to compare elements
     *
     * @param getUniqueIdentifier A function to get the property which uniquely identifies elements in the array.
     *
     * @example
     * const uniqueStrings = strings.distinct();
     * @example
     * const uniquePeople = people.distinct(e => e.id);
     */
    distinct<P>(getUniqueIdentifier?: (el: T) => P): T[];
    /**
     * Replaces an array element. Will throw an error if the element could not be found.
     *
     * @param element The new element.
     * @param getUniqueIdentifier A function to get the property which uniquely identifies elements in the array.
     *
     * @example
     * currentUsers.replace(arrayElement, e => e.id);
     */
    replace<P = T>(element: T, getUniqueIdentifier: (el: T) => P): void;
    /**
     * Replaces an array element if it could be found, else inserts it if the element could not be found.
     *
     * @param element The new element.
     * @param getUniqueIdentifier A function to get the property which uniquely identifies elements in the array.
     *
     * @example
     * currentUsers.replaceElseInsert(arrayElement, e => e.id);
     */
    replaceElseInsert<P = T>(element: T, getUniqueIdentifier: (el: T) => P): void;
    /**
     * Merges the provided elements into this array using the supplied function to compare elements.
     *
     * If the incoming elements could be matched, they will replace the existing element, else they will be inserted.
     *
     * @param toMerge The elements to merge into theis array
     * @param getUniqueIdentifier A function to get the property which uniquely identifies elements in the array.
     *
     * @example
     * currentUsers.merge(array, e => e.id);
     */
    merge<P = T>(toMerge: T[], getUniqueIdentifier: (el: T) => P | T): void;
    /**
     * Returns a new array which is a merge of this array and the provided element(s).
     *
     * If the incoming element(s) could be matched, they will replace the existing element(s), else they will be inserted.
     *
     * @param toMerge The elements to merge into the returned array.
     * @param getUniqueIdentifier A function to get the property which uniquely identifies elements in the array.
     *
     * @example
     * const merged = currentUsers.merge(newUsersWhichMayContainDuplicates, u => u.id);
     */
    mergeMap<T>(toMerge: T | T[], match: (el1: T, el2: T) => boolean): T[];
    /**
     * Can be used to perform some side-effect using each array element,
     * for example, this function can be used to log each element value.
     *
     * @example
     * array.peek(console.log);
     */
    peek(fn: (element: T, index: number) => unknown): T[];
    /**
     * Converts this array to an object.
     *
     * @example
     * const arrayOfUsers = [{ id: 1, name: 'John' }, { id: 2, name: 'Jane' }];
     * const idsToNames = arrayOfUsers.mapToObject(e => e.id, e => e.name); // { 1: 'John', 2: 'Jane' }
     */
    mapToObject<K extends { toString(): string }, V>(
      getKey: (element: T, index: number) => K, getVal: (element: T, index: number) => V): { [key: string]: V };
    /**
     * Converts this array to an ES6 Map
     *
     * @example
     * const mapOfIdsToNames = array.mapToMap(e => e.id, e => e.name);
     */
    mapToMap<K, V>(getKey: (element: T, index: number) => K, getVal: (element: T, index: number) => V): Map<K, V>;
    /**
     * Groups this array by one of its properties
     */
    groupBy<P extends string | number>(getProp: (el: T) => P): T[][];
    /**
     * Functionally identically to the Array.find() method except that this is
     * guaranteed to either return an element or throw an error if no element could be found.
     */
    findOrThrow(predicate: (value: T, index: number, obj: T[]) => unknown, onError?: () => unknown): T;
    /**
     * Filters the array for all truthy values.
     * This will also correctly 'type' each element of the resulting array so that it is not null.
     */
    filterTruthy(): NonNullable<T>[];
    /**
     * Allows performing aggregates of the array
     */
    aggregate(): T extends number ? {
      /**
       * Returns the sum of all the numbers in the array
       */
      sum: () => number;
      /**
       * Returns the average of all the numbers in the array
       */
      average: () => number;
    } : Record<string, unknown>;
  }

}
