import test from 'ava';
import * as match from './match.js';


// Tests that are supposed to fail
[
    {name: 'Bad pattern', object: {x: 0}, pattern: null, expected: match.NULL_OR_UNDEFINED},
    {name: 'Objects with different types', object: 0, pattern: false, expected: match.NO_MATCH},
    {name: 'Number against different', object: 1, pattern: 2, expected: match.NO_MATCH},
    {name: 'Boolean against different', object: true, pattern: false, expected: match.NO_MATCH},
    {name: 'String against different', object: 'foo', pattern: 'bar', expected: match.NO_MATCH}
].forEach(({name, object, pattern, expected}) => {
    test(name, t => {
      match.match(pattern, object).
        then(t.fail).
        else(r => t.deepEqual(r, expected));
    });
});

// Tests that are supposed to pass
[
    {name: 'Any object with wildcard', object: {x: 0, y: 0}, pattern: match._, expected: {}},
    {name: 'Any object with variable', object: {x: 0, y: 0}, pattern: new match.Variable("point"), expected: {point: {x: 0, y: 0}}},
    {name: 'NaN against NaN', object: Number.NaN, pattern: Number.NaN, expected: Number.NaN},
    {name: 'Boolean against same', object: true, pattern: true, expected: true},
    {name: 'Number against same', object: 1, pattern: 1, expected: 1},
    {name: 'String against same', object: 'foo', pattern: 'foo', expected: 'foo'}
].forEach(({name, pattern, object, expected}) => {
    test(name, t => {
      match.match(pattern, object).
        then(r => t.deepEqual(r, expected)).
        else(t.fail);
    });
});

//Array Tests
[
    {name: 'Array of primitives', object: [0, true, ''], pattern: [0, true, ''], expected: [0, true, '']},
    {name: 'Array of primitives against subset', object: [0, true, ''], pattern: [0, true, '', match._], expected: [0, true, '', match.NULL_OR_UNDEFINED]},
    {name: 'Array of primitives against superset', object: [0, true, '', false], pattern: [0, true, ''], expected: [0, true, '']},
    {name: 'Array of primitives against different', object: [0], pattern: ['foo'], expected: [match.NO_MATCH]}
].forEach(({name, pattern, object, expected})=>{
    test(name, t=>{
      match.match(pattern, object).
        then(results => results.forEach((result, index) => {
          result.
            then(r => t.deepEqual(r, expected[index])).
            else(r => t.deepEqual(r, expected[index]));
        })).else(t.fail);
    });
});