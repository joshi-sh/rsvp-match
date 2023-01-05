function Wildcard(){
    return this;
}

class Variable {
    constructor(name) {
        this.bind = function (object) {
            return { [name]: object };
        };
    }
}

const _ = new Wildcard();

const accept = function(value){
    return Promise.resolve(value);
};

const reject = function(error){
    return Promise.reject(error);
}

const createEmptyBindings = () => accept({});

const NULL_OR_UNDEFINED = "NULL_OR_UNDEFINED";
const NO_MATCH = "NO_MATCH";


/*
 *  Match pattern with object to create a set of bindings, or false if could not match
 *  Fails if pattern is null or undefined (error message NULL_OR_UNDEFINED)
 *  Fails if object is undefined (error message NO_MATCH)
 *  Pattern can be:
 *    * Underscore: Matches anything that is not `undefined`, creates no bindings
 *    * Variable: Always matches, binds the value to that name
 *    * Number, string, boolean: Match if pattern === object, no bindings
 *    * regex: Match if object is a string and object.match(pattern) succeeds, bindings is the result of object.match(pattern)
 *    * List of patterns: match if object is a list, return a list that matches each pattern to the corresponding object
 *      * If the list of patterns is longer, the extra patterns are not matched
 *      * If the list of patterns is shorter, any extra are ignored
 *    * Object: Attempt to match every key/value pair in pattern with a corresponding key/value pair in object, returns bindings as key/value pairs
 *        matches succesfully even if object has a key not present in pattern
 */
const match = function(pattern, object){
    if(pattern === null || pattern === undefined || object === undefined){
        return reject(NULL_OR_UNDEFINED);
    }
    else if(pattern instanceof Wildcard){
        return createEmptyBindings();
    }
    else if(pattern instanceof Variable){
        return accept(pattern.bind(object));
    }
    else if(Number.isNaN(pattern) && Number.isNaN(object)){
        // Special handling for NaN
        return accept(Number.NaN);
    }
    else if(typeof(pattern) === typeof(object) && ['number', 'string', 'boolean'].includes(typeof(pattern)) && pattern === object){
        return accept(object);
    }
    else if(pattern instanceof RegExp && typeof(object) === 'string'){
        const match = object.match(pattern);
        if(match) return accept(match);
        return reject(NO_MATCH);
    }
    else if(Array.isArray(pattern) && Array.isArray(object)){
        return accept(Array.prototype.map.call(pattern, (value, index) => match(value, object[index])));
    }
    else if (!Array.isArray(pattern) && typeof(pattern) === 'object'){
        let entries = Object.entries(pattern);
        return accept(Object.fromEntries(entries.
          map(([key, value]) => [key, match(value, object[key])])));
    }
    else return reject(NO_MATCH);
};

export {_, Variable, match, NULL_OR_UNDEFINED, NO_MATCH};
