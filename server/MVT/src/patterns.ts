export default {
    LEFT_IN_VALUE_ATTR: /value\s*?=\s*?"\s*?(.){1}$/i,
    RIGHT_IN_VALUE_ATTR: /^\s*?"/,
    
    LEFT_IN_MVTDO_TAG: /(?=<mvt:do)[^>]*?$/i,
    RIGHT_IN_MVTDO_TAG: /[^<]*(?=>)/
};