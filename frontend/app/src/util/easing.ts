// t : current time
// b : start value
// c : change in value
// d : duration

export const getEasingMoveSize = (
    easing: string,
    t: number,
    b: number,
    c: number,
    d: number,
) => {
    try {
        const easeFuncName: string =
            easing === 'step' ? 'step' : convertAnimeEase(easing);
        const exeFunc = () => {
            try {
                return Math.round(eval(easeFuncName)(t, b, c, d));
            } catch (e) {
                console.log(e);
            }
            return linear(t, b, c, d);
        };
        return exeFunc();
    } catch (e) {
        console.log(e);
    }
    return 0;
};
export const convertAnimeEase = (easing = 'linear') => {
    try {
        if (easing === 'linear') return easing;
        if (easing === 'step') return 'steps(1)';
        if (easing.substring(0, 5) === 'inout') {
            return (
                'easeInOut' +
                easing.substring(5, 6).toUpperCase() +
                easing.substring(6)
            );
        } else if (easing.substring(0, 2) === 'in') {
            return (
                'easeIn' +
                easing.substring(2, 3).toUpperCase() +
                easing.substring(3)
            );
        } else if (easing.substring(0, 3) === 'out') {
            return (
                'easeOut' +
                easing.substring(3, 4).toUpperCase() +
                easing.substring(4)
            );
        }
    } catch (e) {
        console.log(e);
    }
    return 'linear';
};
export const step = (t: number, b: number, c: number, d: number) => {
    if (t >= d) {
        return b + c;
    }
    return b;
};
export const linear = (t: number, b: number, c: number, d: number) => {
    return (c * t) / d + b;
};
export const easeInSine = (t: number, b: number, c: number, d: number) => {
    return -c * Math.cos((t / d) * (Math.PI / 2)) + c + b;
};
export const easeOutSine = (t: number, b: number, c: number, d: number) => {
    return c * Math.sin((t / d) * (Math.PI / 2)) + b;
};
export const easeInOutSine = (t: number, b: number, c: number, d: number) => {
    return (-c / 2) * (Math.cos((Math.PI * t) / d) - 1) + b;
};
export const easeInQuad = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t + b;
};
export const easeOutQuad = (t: number, b: number, c: number, d: number) => {
    console.log('easeOutQuad : ', t, b, c, d);
    t /= d;
    return -c * t * (t - 2) + b;
};
export const easeInOutQuad = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t + b;
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
};
export const easeInCubic = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t * t + b;
};
export const easeOutCubic = (t: number, b: number, c: number, d: number) => {
    t /= d;
    t--;
    return c * (t * t * t + 1) + b;
};
export const easeInOutCubic = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t + 2) + b;
};
export const easeInQuart = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t * t * t + b;
};
export const easeOutQuart = (t: number, b: number, c: number, d: number) => {
    t /= d;
    t--;
    return -c * (t * t * t * t - 1) + b;
};
export const easeInOutQuart = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t * t + b;
    t -= 2;
    return (-c / 2) * (t * t * t * t - 2) + b;
};
export const easeInQuint = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return c * t * t * t * t * t + b;
};
export const easeOutQuint = (t: number, b: number, c: number, d: number) => {
    t /= d;
    t--;
    return c * (t * t * t * t * t + 1) + b;
};
export const easeInOutQuint = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * t * t * t * t * t + b;
    t -= 2;
    return (c / 2) * (t * t * t * t * t + 2) + b;
};
export const easeInExpo = (t: number, b: number, c: number, d: number) => {
    return c * Math.pow(2, 10 * (t / d - 1)) + b;
};
export const easeOutExpo = (t: number, b: number, c: number, d: number) => {
    return c * (-Math.pow(2, (-10 * t) / d) + 1) + b;
};
export const easeInOutExpo = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (c / 2) * Math.pow(2, 10 * (t - 1)) + b;
    t--;
    return (c / 2) * (-Math.pow(2, -10 * t) + 2) + b;
};
export const easeInCirc = (t: number, b: number, c: number, d: number) => {
    t /= d;
    return -c * (Math.sqrt(1 - t * t) - 1) + b;
};
export const easeOutCirc = (t: number, b: number, c: number, d: number) => {
    t /= d;
    t--;
    return c * Math.sqrt(1 - t * t) + b;
};
export const easeInOutCirc = (t: number, b: number, c: number, d: number) => {
    t /= d / 2;
    if (t < 1) return (-c / 2) * (Math.sqrt(1 - t * t) - 1) + b;
    t -= 2;
    return (c / 2) * (Math.sqrt(1 - t * t) + 1) + b;
};
export const easeInElastic = (t: number, b: number, c: number, d: number) => {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * 0.3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return (
        -(
            a *
            Math.pow(2, 10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p)
        ) + b
    );
};
export const easeOutElastic = (t: number, b: number, c: number, d: number) => {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t == 0) return b;
    if ((t /= d) == 1) return b + c;
    if (!p) p = d * 0.3;
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    return (
        a * Math.pow(2, -10 * t) * Math.sin(((t * d - s) * (2 * Math.PI)) / p) +
        c +
        b
    );
};
export const easeInOutElastic = (
    t: number,
    b: number,
    c: number,
    d: number,
) => {
    let s = 1.70158;
    let p = 0;
    let a = c;
    if (t == 0) return b;
    if ((t /= d / 2) == 2) return b + c;
    if (!p) p = d * (0.3 * 1.5);
    if (a < Math.abs(c)) {
        a = c;
        s = p / 4;
    } else {
        s = (p / (2 * Math.PI)) * Math.asin(c / a);
    }
    if (t < 1)
        return (
            -0.5 *
                (a *
                    Math.pow(2, 10 * (t -= 1)) *
                    Math.sin(((t * d - s) * (2 * Math.PI)) / p)) +
            b
        );
    return (
        a *
            Math.pow(2, -10 * (t -= 1)) *
            Math.sin(((t * d - s) * (2 * Math.PI)) / p) *
            0.5 +
        c +
        b
    );
};
export const easeInBack = (t: number, b: number, c: number, d: number) => {
    const s = 1.70158;
    return c * (t /= d) * t * ((s + 1) * t - s) + b;
};
export const easeOutBack = (t: number, b: number, c: number, d: number) => {
    const s = 1.70158;
    return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
};
export const easeInOutBack = (t: number, b: number, c: number, d: number) => {
    let s = 1.70158;
    if ((t /= d / 2) < 1)
        return (c / 2) * (t * t * (((s *= 1.525) + 1) * t - s)) + b;
    return (c / 2) * ((t -= 2) * t * (((s *= 1.525) + 1) * t + s) + 2) + b;
};
