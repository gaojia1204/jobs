
// yundong(box,{'left':500,'top':200,'opacity':40},'easeBothStrong',3000)
function yundong(obj, json,time,cv,fn) {
    if (time) {
        time = time || 400;
        if (typeof(time) == typeof(123)) {
            time = time;
        } else if (typeof(time) == typeof('abcd')) {
            a = cv;
            cv = time;
            time = a;
        } else if (typeof(time) == 'function') {
            a = fn
            fn = time;
            time = a;
        };
    } else if (cv) {
        cv = cv || 'linear';
        if (typeof(cv) == typeof(123)) {
            a = time;
            time = cv;
            cv = a;
        } else if (typeof(cv) == typeof('abcd')) {
            cv = cv;
        } else if (typeof(cv) == 'function') {
            a = fn;
            fn = cv;
            cv = a;
        }
        ;
    } else if (fn) {
        fn = fn || function () {
            }
        if (typeof(fn) == typeof(123)) {
            a = fn;
            time = fn;
            fn = a;
        } else if (typeof(fn) == typeof('abcd')) {
            a = cv;
            cv = fn;
            fn = a;
        } else if (typeof(fn) == 'function') {
            fn = fn;
        }
        ;
        //	IT	求法：获取系统时间，在定时器中获取系统时间，两者做差；
        var time1 = (new Date()).getTime();
        clearInterval(obj.timer)
        obj.timer = setInterval(function () {
            var time2 = (new Date()).getTime();
            var IT = Math.min(time2 - time1, time);
            if (IT == time) {
                clearInterval(obj.timer);
                fn && fn.call(obj);
            }
            for (var attr in json) {
                if (attr == 'opacity') {
                    IB = parseInt(getstyle(obj, attr) * 100);
                } else {
                    IB = parseInt(getstyle(obj, attr));
                }
                IC = parseInt(json[attr] - IB);
                var value = Tween[cv](IT, IB, IC, time);
                if (attr == 'opacity') {

                    obj.style[attr] = value / 100;
                    obj.style.filter = "alpha('opacity'=value)"
                } else {
                    obj.style[attr] = value + 'px';
                }
            }
        }, 30);

        for (var cv in Tween) {
            Tween[cv](IT, IB, IC, time);
        }
    }
    function getstyle(obj, attr) {
        return obj.currentStyle ? obj.currentStyle[attr] : getComputedStyle(obj, 1)[attr]
    }


    var Tween = {
        linear: function (t, b, c, d) {  //匀速
            return c * t / d + b;
        },
        easeIn: function (t, b, c, d) {  //加速曲线
            return c * (t /= d) * t + b;
        },
        easeOut: function (t, b, c, d) {  //减速曲线
            return -c * (t /= d) * (t - 2) + b;
        },
        easeBoth: function (t, b, c, d) {  //加速减速曲线
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t + b;
            }
            return -c / 2 * ((--t) * (t - 2) - 1) + b;
        },
        easeInStrong: function (t, b, c, d) {  //加加速曲线
            return c * (t /= d) * t * t * t + b;
        },
        easeOutStrong: function (t, b, c, d) {  //减减速曲线
            return -c * ((t = t / d - 1) * t * t * t - 1) + b;
        },
        easeBothStrong: function (t, b, c, d) {  //加加速减减速曲线
            if ((t /= d / 2) < 1) {
                return c / 2 * t * t * t * t + b;
            }
            return -c / 2 * ((t -= 2) * t * t * t - 2) + b;
        },
        elasticIn: function (t, b, c, d, a, p) {  //正弦衰减曲线（弹动渐入）
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return -(a * Math.pow(2, 10 * (t -= 1)) * Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
        },
        elasticOut: function (t, b, c, d, a, p) {    //正弦增强曲线（弹动渐出）
            if (t === 0) {
                return b;
            }
            if ((t /= d) == 1) {
                return b + c;
            }
            if (!p) {
                p = d * 0.3;
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            } else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            return a * Math.pow(2, -10 * t) * Math.sin((t * d - s) * (2 * Math.PI) / p) + c + b;
        },
        elasticBoth: function (t, b, c, d, a, p) {
            if (t === 0) {
                return b;
            }
            if ((t /= d / 2) == 2) {
                return b + c;
            }
            if (!p) {
                p = d * (0.3 * 1.5);
            }
            if (!a || a < Math.abs(c)) {
                a = c;
                var s = p / 4;
            }
            else {
                var s = p / (2 * Math.PI) * Math.asin(c / a);
            }
            if (t < 1) {
                return -0.5 * (a * Math.pow(2, 10 * (t -= 1)) *
                    Math.sin((t * d - s) * (2 * Math.PI) / p)) + b;
            }
            return a * Math.pow(2, -10 * (t -= 1)) *
                Math.sin((t * d - s) * (2 * Math.PI) / p) * 0.5 + c + b;
        },
        backIn: function (t, b, c, d, s) {     //回退加速（回退渐入）
            if (typeof s == 'undefined') {
                s = 1.70158;
            }
            return c * (t /= d) * t * ((s + 1) * t - s) + b;
        },
        backOut: function (t, b, c, d, s) {
            if (typeof s == 'undefined') {
                s = 3.70158;  //回缩的距离
            }
            return c * ((t = t / d - 1) * t * ((s + 1) * t + s) + 1) + b;
        },
        backBoth: function (t, b, c, d, s) {
            if (typeof s == 'undefined') {
                s = 1.70158;
            }
            if ((t /= d / 2 ) < 1) {
                return c / 2 * (t * t * (((s *= (1.525)) + 1) * t - s)) + b;
            }
            return c / 2 * ((t -= 2) * t * (((s *= (1.525)) + 1) * t + s) + 2) + b;
        },
        bounceIn: function (t, b, c, d) {    //弹球减振（弹球渐出）
            return c - Tween['bounceOut'](d - t, 0, c, d) + b;
        },
        bounceOut: function (t, b, c, d) {
            if ((t /= d) < (1 / 2.75)) {
                return c * (7.5625 * t * t) + b;
            } else if (t < (2 / 2.75)) {
                return c * (7.5625 * (t -= (1.5 / 2.75)) * t + 0.75) + b;
            } else if (t < (2.5 / 2.75)) {
                return c * (7.5625 * (t -= (2.25 / 2.75)) * t + 0.9375) + b;
            }
            return c * (7.5625 * (t -= (2.625 / 2.75)) * t + 0.984375) + b;
        },
        bounceBoth: function (t, b, c, d) {
            if (t < d / 2) {
                return Tween['bounceIn'](t * 2, 0, c, d) * 0.5 + b;
            }
            return Tween['bounceOut'](t * 2 - d, 0, c, d) * 0.5 + c * 0.5 + b;
        }
    }
}
