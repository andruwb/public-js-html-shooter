export function check_collision(a, b, a_buffer=0){
    return !(
        ((a.y - a_buffer) + (a.height + (2 * a_buffer)) <= (b.y)) ||
        ((a.y - a_buffer) >= (b.y + b.height)) ||
        ((a.x - a_buffer) + (a.width + (2 * a_buffer)) <= b.x) ||
        ((a.x - a_buffer) >= (b.x + b.width))
    );
}

export function check_collision_array_obj(a, b, a_width, a_height, a_buffer){
        return !(
        ((a[1] - a_buffer) + (a_height + (2 * a_buffer)) <= (b.y)) ||
        ((a[1] - a_buffer) >= (b.y + b.height)) ||
        ((a[0] - a_buffer) + (a_width + (2 * a_buffer)) <= b.x) ||
        ((a[0] - a_buffer) >= (b.x + b.width))
    );
}


export function check_circ_collision(p_a, p_b, r_a, r_b){
    return (Math.sqrt(((p_a[0] + p_b[0]) ** 2) + (p_a[1]+ p_b[1]) ** 2) <= (r_a + r_b));
}


export function get_blocked_sight(win, player, wall, range_x, range_y, color='gray'){
    // Get needed points on wall
    let critical_points = [];
    let polygon_points = [];

    if(player.center_y === wall.y || player.center_y === wall.y + wall.height){
        if(player.center_x > wall.x + wall.width){
            critical_points.push(wall.top_left);
            critical_points.push(wall.bottom_right);
        }
        else{
            critical_points.push(wall.top_right);
            critical_points.push(wall.bottom_left);
        }
    }
    else{
        if((wall.top_left[0] >= player.center_x && wall.top_left[1] <= player.center_y) ||
        (wall.top_left[0] <= player.center_x && wall.top_left[1] >= player.center_y)){
            critical_points.push(wall.top_left);
        }
        if((wall.top_right[0] <= player.center_x && wall.top_right[1] <= player.center_y) || 
        (wall.top_right[0] >= player.center_x && wall.top_right[1] >= player.center_y)){
            critical_points.push(wall.top_right);
        }
        if((wall.bottom_right[0] >= player.center_x && wall.bottom_right[1] <= player.center_y) ||
        (wall.bottom_right[0] <= player.center_x && wall.bottom_right[1] >= player.center_y)){
            critical_points.push(wall.bottom_right);
        }
        if((wall.bottom_left[0] <= player.center_x && wall.bottom_left[1] <= player.center_y) || 
        (wall.bottom_left[0] >= player.center_x && wall.bottom_left[1] >= player.center_y)){
            critical_points.push(wall.bottom_left);
        }
    }

    // Draw connections to critical points for visualization
    // win.beginPath();
    // win.moveTo(player.center_x, player.center_y);
    // win.lineTo(critical_points[0][0], critical_points[0][1]);
    // win.stroke();
    // win.beginPath();
    // win.moveTo(player.center_x, player.center_y);
    // win.lineTo(critical_points[1][0], critical_points[1][1]);
    // win.stroke();

    // Get points to make blocked sight polygon
    polygon_points.push(critical_points[0]);
    // Adjust range for situation
    if((critical_points.indexOf(wall.top_left) > -1 && 
    critical_points.indexOf(wall.bottom_left) > -1) || 
    ((critical_points.indexOf(wall.top_right) > -1 && 
    critical_points.indexOf(wall.bottom_right) > -1))){
        range_y = [-10000, 10000];
    }
    for(let i = 0; i < 2; i++){
        if(critical_points[i][1] < player.center_y){
            if(player.center_x === critical_points[i][0]){
                polygon_points.push([critical_points[i][0], range_y[0]]);
            }
            else{
                polygon_points.push([((range_y[0] - critical_points[i][1]) / 
                ((critical_points[i][1] - player.center_y) / 
                (critical_points[i][0] - player.center_x)) + critical_points[i][0]), range_y[0]]);
            }
        }
        else if(critical_points[i][1] > player.center_y){
            if(player.center_x === critical_points[i][0]){
                polygon_points.push([critical_points[i][0], range_y[1]]);
            }
            else{
                polygon_points.push([((range_y[1] - critical_points[i][1]) / 
                ((critical_points[i][1] - player.center_y) / 
                (critical_points[i][0] - player.center_x)) + critical_points[i][0]), range_y[1]]);
            }
        
        }
        else{
            if(player.center_x > critical_points[i][0]){
                polygon_points.push([range_x[0], critical_points[i][1]])
            }
            else{
                polygon_points.push([range_x[1], critical_points[i][1]])
            }
        }
    }
    polygon_points.push(critical_points[1]);

    // Draw polygon
    win.fillStyle = color;
    win.beginPath();
    win.moveTo(polygon_points[0][0], polygon_points[0][1])
    let num_polygon_points = polygon_points.length;
    for(let i = 1; i < num_polygon_points; i++){
        win.lineTo(polygon_points[i][0], polygon_points[i][1]);
    }
    win.closePath();
    win.fill();
};


export function get_angle_objs(obj1, obj2){
    let x_dif = obj1.center_x - obj2.center_x;
    let y_dif = obj1.center_y - obj2.center_y;
    let angle = 0.0;
    if(x_dif === 0){
        x_dif = 0.01;
    }
    if(x_dif >= 0){
        angle = Math.atan(y_dif / x_dif);
    }
    else{
        angle = Math.PI - Math.atan(-y_dif / x_dif);
    }
    return angle;
}


export function get_angle_array_obj(array, obj, order='array'){
    let angle;
    let x_dif;
    let y_dif;
    if(order === 'array'){
        x_dif = array[0] - obj.center_x;
        y_dif = array[1] - obj.center_y;
    }
    else{
        x_dif = obj.center_x - array[0];
        y_dif = obj.center_y - array[1];
    }

    if(x_dif === 0){
        x_dif = 0.01;
    }
    if(x_dif >= 0){
        angle = Math.atan(y_dif / x_dif);
    }
    else{
        angle = Math.PI - Math.atan(-y_dif / x_dif);
    }
    return angle;
}


export function rgb(r, g, b){
    return "rgb("+r+","+g+","+b+")";
  }
