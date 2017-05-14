export const extendCopy = (p) => {　　　　
    var c = {};　　　　
    for (var i in p) {　　　　　　
        c[i] = p[i];　　　　
    }　　　　
    c.uber = p;　　　　
    return c;　
}

export const deepCopy = (p, c) => {　　
    var c = c || {};　　　　
    for (var i in p) {　　　　　　
        if (typeof p[i] === 'object') {　　　　　　　　
            c[i] = (p[i].constructor === Array) ? [] : {};　　　　　　　　
            deepCopy(p[i], c[i]);　　　　　　
        } else {　　　　　　　　　
            c[i] = p[i];　　　　　　
        }　　　　
    }　　　　
    return c;　　
}