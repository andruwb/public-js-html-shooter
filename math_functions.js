export function newtons_method(f, xn, iterations=50){
    for(let i = 0; i < iterations; i++){
        xn = xn - (f(xn) / derivative(f, xn));
    }
    return xn;
}

export function derivative(f, point, accuracy=.000001){
    let a = point + accuracy;
    return ((f(a) - f(point)) / (a - point));
}

export function def_integral(f, a, b, n=1000){
    let sum = 0;
    let x_dif = (b - a) / n
    for(let i = 0; i < n; i++){
        sum += f((i * x_dif) + a) * x_dif;
    }
    return sum;
}


export function randint(min, max){
    return Math.floor(Math.random() * (max-min)) + min;
}

export function get_distance(loc1, loc2){
    return Math.sqrt(((loc1[0] - loc2[0]) ** 2) + ((loc1[1] - loc2[1]) ** 2));
}
