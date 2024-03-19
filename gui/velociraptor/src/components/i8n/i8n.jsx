import _ from 'lodash';

import Chinese from './ch.jsx';
import English from './en.jsx';

const debug = false;

function dict(item) {
    let lang = (window.globals && window.globals.lang) || "ch";
    switch (lang) {

     case "ch":
            return Chinese[item];

    default:
        return ch[item];
    }
};

function T(item, ...args) {
    let lang = (window.globals && window.globals.lang) || "en";
    let d = dict(item);

    if(_.isUndefined(d)) {
        if (debug && lang !== "ch") {
            let x = window.globals.dict || {};
            x[item] = item;
            window.globals["dict"] = x;
            console.log(lang, ": No translation for ", item);
        }

        // If there is no specific translation in the target language
        // we use the English one, and failing that the name of the
        // item directly.
        d = Chinese[item] || item;
    }
    if (typeof d === 'function') {
        return d.call(null, ...args);
    }
    return d;
};

export default T;
