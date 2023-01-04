function Wildcard(){
    return this;
}

function Variable(name){
    this.bind = function(object){
        return {[name]: object};
    };
}

const _ = new Wildcard();


/*
 *  Match pattern with object to create a set of bindings, or false if could not match
 *  Fails if pattern is null or undefined
 *  Fails if object is undefined
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
        return false;
    }
    else if(pattern instanceof Wildcard){
        return {};
    }
    else if(pattern instanceof Variable){
        return pattern.bind(object);
    }
    else if(typeof(pattern) === 'number' && typeof(object) === 'number' && Number.isNaN(pattern) && Number.isNaN(object)){
        // Special handling for NaN
        return {};
    }
    else if(typeof(pattern) === typeof(object) && ['number', 'string', 'boolean'].indexOf(typeof(pattern)) > -1){
        return pattern === object ? {} : false;
    }
    else if(pattern instanceof RegExp && typeof(object) === 'string'){
        const match = object.match(pattern);
        if(match) return match;
    }
    else if(Array.isArray(pattern) && Array.isArray(object)){
        return Array.prototype.map.call(pattern, (value, index) => match(value, object[index]));
    }
    else if (typeof(pattern) === 'object'){
        let entries = Object.entries(pattern);
        return Object.fromEntries(entries.
          map(([key, value]) => [key, match(value, object[key])]));
    }
    else return false;
};

export {_, Variable, match};
