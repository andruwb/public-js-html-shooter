import { Bullet } from './classes.js';
import { check_collision } from './functions.js';
import { get_angle_objs } from './functions.js';
import { get_angle_array_obj } from './functions.js';
import { rgb } from './functions.js';
import { check_collision_array_obj } from './functions.js';
import { randint } from './math_functions.js';
import { get_distance } from './math_functions.js';

export class Enemy{
    constructor(x, y, width, height, patrol_path=[], type='standard', one_life=false, 
    hp=1, speed=1, damage=1, color='red', lead_shot=false, game_width = 700, game_height = 500){
    
        // Basic variables
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = 0;
        this.color = color;

        this.type = type;

        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;

        this.hp = hp;
        this.max_hp = hp;

        // Velocity variables
        this.speed = speed;
        this.v_x = 0;
        this.v_y = 0;
        this.a_x = 0;
        this.a_y = 0;
        this.mv_x = 0;
        this.mv_y = 0;


        // Knockback variables
        this.knockback_timer = 0;
        this.knockback_x = 0;
        this.knockback_y = 0;


        // Attack variables
        this.damage = damage;
        this.bullets = [];
        this.shoot_timer = 0;
        this.shoot_gap = 60;
        this.shoot_gap_deviation = 10;
        this.bullet_id = 0;

        this.inaccuracy = 6;
        this.bullet_speed = 5;

        this.lead_shot = lead_shot;
        this.prb_lead_shot = 0;


        // Dodging
        this.dodge_x = 0;
        this.dodge_y = 0;
        this.dodge_frequency_constant = 120;
        this.dodge_frequency_min = 45;
        this.dodge_counter = this.dodge_frequency_min;
        this.dodge_types = ['y_dir', 'x_dir'];
        this.dodge_length = 30;
        this.dodge_time = this.dodge_length;


        // Rockets
        this.rocket_knockback_dist = 1.5;
        this.rocket_damage = 2;
        this.rocket_speed = 5;
        this.rocket_range = 0;


        // Explosions
        this.explosions = [];
        this.explosion_timers = [];
        this.explosion_id = 0;
        this.explosion_length = 60;
        this.explosion_size = 20;
        this.explosion_damage = 1;


        // Spawners
        this.eggs = [];
        this.minions = [];
        this.egg_id = 0;
        this.minion_id = 10;


        // Patrolling
        this.patrol_point = 0;
        this.patrol_path = patrol_path;
        this.patrol_speed = 1;
        this.patrol_step = 0;
        this.patrol_delay = 90;
        this.patrol_delay_timer = this.patrol_delay;
        this.patrol_steps_required = [];
        this.patrol_angles = [];
        if(patrol_path.length > 0){
            this.patrolling = true;
        }
        else{
            this.patrolling = false;
        }
        this.get_patrol_variables();


        // Items
        this.item_spawn_x = x;
        this.item_spawn_y = y;
        this.item_spawn_set = false;


        // Miscellaneous
        this.dead = false;

        this.player_spotted = false;

        this.one_life = one_life;

        this.invincibile = false;
        this.invisible = false;

        this.game_width = game_width;
        this.game_height = game_height;

        this.get_type_stats();
    }

    get_patrol_variables(){
        for(let i = 0; i < this.patrol_path.length; i++){
            let loc1 = this.patrol_path[i];
            let loc2;
            if(i === this.patrol_path.length - 1){
                loc2 = this.patrol_path[0];
            }
            else{
                loc2 = this.patrol_path[i + 1]
            }
            // Get patrol steps required
            let d = Math.sqrt((loc2[0] - loc1[0])**2 + (loc2[1] - loc1[1])**2);
            this.patrol_steps_required.push(Math.ceil(d / this.patrol_speed))
            // Get patrol angle
            let x_dif = loc2[0] - loc1[0];
            let y_dif = loc2[1] - loc1[1];
            let angle;
            if(x_dif === 0){
                x_dif = 0.01;
            }
            if(x_dif > 0){
                angle = Math.atan(y_dif / x_dif);
            }
            else{
                angle = Math.PI - Math.atan(-y_dif / x_dif);
            }
            this.patrol_angles.push(angle)
            
        }
    }

    get_type_stats(){
        // Change stats depending on enemy type
        if(this.type === 'smart'){
            this.lead_shot = true;
        }
        else if(this.type === 'strong'){
            this.hp = 2;
            this.damage = 2;
            this.bullet_speed = 6;
            this.inaccuracy = 4;
            this.speed = 1.25;
            this.prb_lead_shot = .33;
        }
        else if(this.type === 'elite'){
            this.hp = 3;
            this.damage = 2;
            this.bullet_speed = 7;
            this.inaccuracy = 2;
            this.speed = 1.5;
            this.prb_lead_shot = .5;
            this.dodge_frequency_constant = 100;
        }
    }

    move(walls){
        let num_walls = walls.length;
        
        //convert movement values
        this.v_x += this.a_x;
        this.v_y += this.a_y;


        if(this.knockback_timer > 0){
            this.v_x += this.knockback_x;
            this.v_y += this.knockback_y;
        }
        else{
            this.v_x += this.mv_x;
            this.v_y += this.mv_y;

            if(this.dodge_time > 0){
                this.v_x += this.dodge_x;
                this.v_y += this.dodge_y;
            }
        }
        this.x += this.v_x;

        // Adjust wall collision from x-axis
        for(let i = 0; i < num_walls; i++){
            if (check_collision(this, walls[i])){
                if(this.x + this.width > walls[i].x && this.x < walls[i].x){
                    this.x = walls[i].x - this.width;
                }
                else if(this.x + this.width > walls[i].x + walls[i].width){
                    this.x = walls[i].x + walls[i].width;
                }
            }
        }

        this.y += this.v_y;

        // Adjust wall collision from y-axis
        for(let i = 0; i < num_walls; i++){
            if (check_collision(this, walls[i])){
                if(this.y + this.height > walls[i].y && this.y < walls[i].y){
                    this.y = walls[i].y - this.height;
                }
                else if(this.y + this.height > walls[i].y + walls[i].height){
                    this.y = walls[i].y + walls[i].height;
                }
            }
        }

        // Check if in boundaries
        if (this.x > this.game_width - this.width){
            this.x = this.game_width - this.width;
        }
        if(this.x < 0){
            this.x = 0;
        }
        if(this.y < 0){
            this.y = 0;
        }
        if(this.y > this.game_height - this.height){
            this.y = this.game_height - this.height;
        }

        // Reset character movement velocities
        if(this.knockback_timer > 0){
            this.v_x -= this.knockback_x;
            this.v_y -= this.knockback_y;
            this.knockback_timer --;
        }
        else{
            if(this.dodge_time > 0){
                this.v_x -= this.dodge_x;
                this.v_y -= this.dodge_y;
                this.dodge_time --;
            }

            this.v_x -= this.mv_x;
            this.v_y -= this.mv_y;

            this.mv_x = 0;
            this.mv_y = 0;
        }

        // Rest knockback values after knockback movement completed
        if(this.knockback_timer <= 0 && (Math.abs(this.knockback_x) > 0 || Math.abs(this.knockback_y) > 0)){
            this.knockback_x = 0;
            this.knockback_y = 0;
        }
    }

    patrol(){
        if(this.patrol_delay_timer === 0){
            this.mv_x = Math.cos(this.patrol_angles[this.patrol_point]) * this.patrol_speed;
            this.mv_y = Math.sin(this.patrol_angles[this.patrol_point]) * this.patrol_speed;

            this.patrol_step ++;
        }
        else{
            this.patrol_delay_timer --;
        }
        if(this.patrol_step >= this.patrol_steps_required[this.patrol_point]){
            if(this.patrol_point === this.patrol_path.length - 1){
                this.patrol_point = 0;
            }
            else{
                this.patrol_point ++;
            }
            this.patrol_step = 0;
            this.patrol_delay_timer = this.patrol_delay;
        }

    }

    
    check_in_sight(player, walls){
        // Initialize variables
        let num_walls = walls.length;
        let slope;
        let rect_x;
        let rect_y;
        if(player.center_x >= this.center_x){
            rect_x = this.center_x;
        }
        else {
            rect_x = player.center_x;
        }
        if(player.center_y >= this.center_y){
            rect_y = this.center_y;
        }
        else{
            rect_y = player.center_y;
        }
        let rect_width = Math.abs(this.center_x - player.center_x);
        let rect_height = Math.abs(this.center_y - player.center_y);

        if(!(player.center_x === this.center_x)){
            slope = (player.center_y - this.center_y) / (player.center_x - this.center_x);
            for(let i = 0; i < num_walls; i++){
                if(!(
                    ((rect_y + rect_height) <= (walls[i].y)) ||
                    (rect_y >= (walls[i].y + walls[i].height)) ||
                    ((rect_x + rect_width) <= walls[i].x) ||
                    (rect_x >= (walls[i].x + walls[i].width))
                )){
                    // Declare right and left side intercepts between wall and line
                    let intercept_point_1 = slope * (walls[i].x - this.center_x) + this.center_y;
                    let intercept_point_2 = slope * (walls[i].x + walls[i].width - this.center_x) + 
                    this.center_y;

                    // Check if line passes through wall
                    if(intercept_point_1 >= walls[i].y && 
                    intercept_point_1 <= walls[i].y + walls[i].height){
                        return false;
                    }
                    else if(intercept_point_2 >= walls[i].y && 
                    intercept_point_2 <= walls[i].y + walls[i].height){
                        return false;
                    }
                    else if((intercept_point_1 <= walls[i].y && 
                    intercept_point_2 >= walls[i].y + walls[i].height) || 
                    (intercept_point_2 <= walls[i].y && 
                    intercept_point_1 >= walls[i].y + walls[i].height)){
                        return false;
                    }
                }
            }
        }
        // Compute for vertical player/enemy case
        else{
            for(let i = 0; i< num_walls; i++){
                if(!(
                ((rect_y + rect_height) <= (walls[i].y)) ||
                (rect_y >= (walls[i].y + walls[i].height)) ||
                ((rect_x + rect_width) <= walls[i].x) ||
                (rect_x >= (walls[i].x + walls[i].width)))){
                    if(this.center_x >= walls[i].x && this.center_x <=
                    walls[i].x + walls[i].width){
                        return false;
                    }
                }
            }
        }
        return true;
    }

    get_angle(obj){
        let x_dif = obj.center_x - this.center_x;
        let y_dif = obj.center_y - this.center_y;
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

    move_at_player(player){
        let angle = this.get_angle(player);
        this.mv_x = Math.cos(angle) * this.speed;
        this.mv_y = Math.sin(angle) * this.speed;
    }

    attack(player, walls){
        if(this.dead === false){
            if(this.check_in_sight(player, walls)){
                this.player_spotted = true;
                // Shoot at player
                this.shoot_timer ++;
                if(this.shoot_timer >= this.shoot_gap){
                    this.shoot(player);
                    let shot_deviation = randint(0, this.shoot_gap_deviation);
                    if(Math.random() >= .5){
                        shot_deviation *= -1;
                    }
                    this.shoot_timer = shot_deviation;
                }
                this.dodge(player);
            }
        }
        // delete bullets
        this.delete_bullets(walls, player);
    }

    shoot(player, type='normal'){
        let angle;
        let shot_speed;
        if(type === 'normal'){
            shot_speed = this.bullet_speed;
        }
        else if(type === 'rocket'){
            shot_speed = this.rocket_speed;
        }
        // Calculate lead shot angle
        if(this.lead_shot || Math.random() < this.prb_lead_shot){
            let px;
            let py;
            if(player.center_x === this.center_x){
                px = player.center_x - .0001;
            }
            else{
                px = player.center_x;
            }
            if(player.center_y === this.center_y){
                py = player.center_y - .0001;
            }
            else{
                py = player.center_y;
            }

            let pvx = player.prev_v_x;
            let pvy = player.prev_v_y;
            let bx = this.center_x;
            let by = this.center_y;
            let bv = shot_speed;

            let t = (Math.sqrt(((px - bx) ** 2) + ((py - by) ** 2))) / bv;
            for(let i = 0; i < 20; i++){
                t = (Math.sqrt((((px + (pvx*t)) - bx) ** 2) + (((py + (pvy*t)) - by) ** 2))) / bv;
            }
            let adj_px = px + (pvx*t);
            let adj_py = py + (pvy*t);

            let x_dif = adj_px - bx;
            let y_dif = adj_py - by;
            if(x_dif === 0){
                x_dif = 0.01;
            }
            if(x_dif >= 0){
                angle = Math.atan(y_dif / x_dif);
            }
            else{
                angle = Math.PI - Math.atan(-y_dif / x_dif)
            }

            // if(px >= 0 && py >= 0){
            //     starting_angle = Math.PI/4
            // }
            

            // angle = newtons_method(x => ((px-bx) / ((bv * Math.cos(x)) - pvx)) - ((py-by) / ((bv * Math.sin(x)) - pvy)), 5*Math.PI/4);

        }
        else{
            angle = this.get_angle(player);
        }
        this.bullets.push(new Bullet(this.center_x, this.center_y, this.bullet_id, angle, this.inaccuracy, shot_speed, type));
        this.bullet_id ++;
    }

    dodge(player){
        this.dodge_counter --;
        if(this.dodge_counter <= 0){
            let dodge_type = this.dodge_types[randint(0, this.dodge_types.length)];
            let dodge_distance = ((Math.random() + .5) * this.speed);
            if(Math.random() <= .5){
                dodge_distance *= -1;
            }

            if(dodge_type === 'strafe'){
                let angle = 0.0;
                let x_dif = player.center_x - this.center_x;
                let y_dif = player.center_y - this.center_y;
                if(x_dif === 0){
                    x_dif = 0.01;
                }
                if(x_dif >= 0){
                    angle = Math.atan(y_dif / x_dif);
                }
                else{
                    angle = -Math.atan(y_dif / x_dif)
                }
                angle += Math.PI / 2
                this.dodge_x += Math.cos(this.angle) * dodge_distance;
                this.dodge_y += Math.sin(this.angle) * dodge_distance;

            }
            else if(dodge_type === 'x_dir'){
                this.dodge_x = dodge_distance;
                this.dodge_y = 0;
            }
            else if(dodge_type === 'y_dir'){
                this.dodge_y = dodge_distance;
                this.dodge_x = 0;
            }

            this.dodge_time = this.dodge_length;
            this.dodge_counter = (Math.random() * this.dodge_frequency_constant) + this.dodge_frequency_min;
        }
    }

    delete_bullets(walls, player){
        // Delete necessary bullets
        let deleted_bullets = [];
        let num_bullets = this.bullets.length;
        let num_walls = walls.length;

        // Delete bullets in player
        for(let i = 0; i < num_bullets; i++){
            if(check_collision(this.bullets[i], player)){
                if(this.bullets[i].type === 'rocket'){
                    if(!player.invincible){
                        // Delete rockets
                        this.explosion_id ++;
                        player.hp -= this.rocket_damage;
                        player.invincible_timer = player.invincible_length;
                        player.invincible = true;

                        // Push player back
                        let angle = get_angle_objs(this.bullets[i], player);
                        player.knockback_timer = 20;
                        player.knockback_x -= Math.cos(angle) * this.rocket_knockback_dist;
                        player.knockback_y -= Math.sin(angle) * this.rocket_knockback_dist;
                    }
        
                    // Create explosion
                    this.explosions.push([this.bullets[i].x, this.bullets[i].y, this.explosion_id]);
                    this.explosion_timers.push([this.explosion_length, this.explosion_id]);
                }
                else{
                    if(!(player.invincible)){
                        player.hp -= this.damage;
                        player.invincible_timer = player.invincible_length;
                        player.invincible = true;
                    }
                }
                deleted_bullets.push(this.bullets[i].id);
            }
            // Delete bullets in wall
            for(let j = 0; j < num_walls; j++){
                if(deleted_bullets.indexOf(this.bullets[i].id === -1)){
                    if(check_collision(this.bullets[i], walls[j])){
                        deleted_bullets.push(this.bullets[i].id);

                        // Create explosion
                        if(this.bullets[i].type === 'rocket'){
                            this.explosion_id ++;
                            this.explosions.push([this.bullets[i].x, this.bullets[i].y, this.explosion_id]);
                            this.explosion_timers.push([this.explosion_length, this.explosion_id]);
                        }
                    }
                }
            }
            // Delete bullets out of boundaries
            if(deleted_bullets.indexOf(this.bullets[i].id) === -1){
                if(this.bullets[i].x > this.game_width || this.bullets[i].x < 0 || 
                    this.bullets[i].y > this.game_height || this.bullets[i].y < 0){
                    deleted_bullets.push(this.bullets[i].id);

                    // Create explosion
                    if(this.bullets[i].type === 'rocket'){
                        this.explosion_id ++;
                        this.explosions.push([this.bullets[i].x, this.bullets[i].y, this.explosion_id]);
                        this.explosion_timers.push([this.explosion_length, this.explosion_id]);
                    }
                }
            }
            // Delete rockets that have reached their maximum range
            if(this.bullets[i].type === 'rocket' && this.bullets[i].distance_traveled >= this.rocket_range && 
            !(deleted_bullets.includes(this.bullets[i].id)) && this.rocket_range > 0){
                this.explosion_id ++; 
                deleted_bullets.push(this.bullets[i].id);
                this.explosions.push([this.bullets[i].x, this.bullets[i].y, this.explosion_id]);
                this.explosion_timers.push([this.explosion_length, this.explosion_id]);
            }
        }
        // Execute bullet deletion
        let num_deleted_bullets = deleted_bullets.length;
        if(num_deleted_bullets > 0){
            let new_bullet_list = [];
            for(let i = 0; i < num_bullets; i++){
                if(!(deleted_bullets.includes(this.bullets[i].id))){
                    new_bullet_list.push(this.bullets[i]);
                }
            }
            this.bullets = new_bullet_list;
        }
    }

    manage_explosions(win, player){
        let num_explosions = this.explosions.length;
        let deleted_explosions = [];
        let deleted_explosion_timers = [];
        for(let i = 0; i < num_explosions; i++){
            this.explosion_timers[i][0] --;

            if(!(player.invincible)){
                // Damage player - Uses dual circular collision detection for player and explosion
                if(Math.sqrt(((this.explosions[i][0] - player.center_x) ** 2) + 
                ((this.explosions[i][1] - player.center_y) ** 2)) <= (player.width/2) + this.explosion_size){
                    player.hp -= this.explosion_damage;
                    player.invincible_timer = player.invincible_length;
                    player.invincible = true;
                            
                    // Push player back
                    console.log(this.explosions[i]);
                    let angle = get_angle_array_obj(this.explosions[i], player);
                    player.knockback_timer = 20;
                    player.knockback_x -= Math.cos(angle) * this.rocket_knockback_dist;
                    player.knockback_y -= Math.sin(angle) * this.rocket_knockback_dist;
                }
            }

            // Draw explosions
            win.fillStyle = 'red';
            win.beginPath();
            win.arc(this.explosions[i][0], this.explosions[i][1], this.explosion_size, 0, 2 * Math.PI);
            win.fill();

            // Delete explosions
            if(this.explosion_timers[i][0] <= 0){
                deleted_explosions.push(this.explosions[i][2]);
                deleted_explosion_timers.push(this.explosion_timers[i][1]);
            }
        }

        // Execute explosion deletion
        let num_deleted_explosions = deleted_explosions.length;
        if(num_deleted_explosions > 0){
            let new_explosion_list = [];
            let new_explosion_timer_list = [];
            for(let j = 0; j < num_explosions; j++){
                if(!(deleted_explosions.includes(this.explosions[j][2]))){
                    new_explosion_list.push(this.explosions[j]);
                    new_explosion_timer_list.push(this.explosion_timers[j])
                }
            }
        this.explosions = new_explosion_list;
        this.explosion_timers = new_explosion_timer_list;
        }
    }

    update(player, walls, movement_blockers){
        if(this.dead === false){
            this.move(movement_blockers);
        }
        if(this.player_spotted){
            this.patrolling = false;
        }
        this.attack(player, walls);
        if(this.patrolling === true){
            this.patrol();
        }
        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;
    }

    draw(win, walls, movement_blockers, player){
        this.update(player, walls, movement_blockers);
        this.manage_explosions(win, player);
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
        if(this.type === 'strong'){
            win.fillStyle = 'blue';
            win.fillRect(this.x + (this.width / 4), this.y + (this.height / 4), this.width/2, this.height/2);
        }
        else if(this.type === 'elite'){
            win.fillStyle = 'Gold';
            win.fillRect(this.x + (this.width / 4), this.y + (this.height / 4), this.width/2, this.height/2);
        }
    }
}


export class MeleeEnemy extends Enemy{
    constructor(x, y, width, height, patrol_path=[], type='standard', one_life=false,
    hp=3, speed=1.5, damage=1, color='crimson'){
        // Inherit initalized variables from parent class
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);

        this.attack_moveable = true;
        this.movement_cooldown = 0;
        this.movement_cooldown_length = 60;

        this.player_knockback_dist = 1.5;
        this.self_knockback_dist = 1.5;

        // Give dodge time to allow move function to work
        this.dodge_time = -1;
    }

    get_type_stats(){
        if(this.type === 'small'){
            this.hp = 1;
            this.speed = 2.75;
        }
        if(this.type === 'strong'){
            this.hp = 4;
            this.damage = 2;
            this.speed = 2;
        }
        if(this.type === 'elite'){
            this.hp = 5;
            this.damage = 2;
            this.speed = 2.25;
        }
    }

    attack(player, walls){
        if(this.dead === false){
            this.check_attack_moveable();
            if(this.player_spotted === false){
                if(this.check_in_sight(player, walls)){
                    this.player_spotted = true;
                }
            }
            else{
                if(this.attack_moveable){
                    this.move_at_player(player);
                }
            }

            // Deal damage to player
            if(check_collision(this, player)){
                this.deal_damage(player);
            }
        }
    }

    deal_damage(player){
        if(!(player.invincible)){
            // Deal damage to player
            player.hp -= this.damage;
            player.invincible_timer = player.invincible_length;
            
            // Push player back
            let angle = this.get_angle(player);
            player.knockback_timer = 20;
            player.knockback_x += Math.cos(angle) * this.player_knockback_dist;
            player.knockback_y += Math.sin(angle) * this.player_knockback_dist;

            // Push self back
            this.knockback_x -= Math.cos(angle) * this.self_knockback_dist;
            this.knockback_y -= Math.sin(angle) * this.self_knockback_dist;
            this.knockback_timer = 20;

            // Set movement cooldown
            this.movement_cooldown = this.movement_cooldown_length;
        }

    }

    check_attack_moveable(){
        if(this.movement_cooldown > 0){
            this.attack_moveable = false;
            this.movement_cooldown --;
        }
        else{
            this.attack_moveable = true;
        }
    }
}

export class SniperEnemy extends Enemy{
    constructor(x, y, width, height, patrol_path, type='standard', one_life=false,
    hp=1, speed=1.5, damage=2, color='DarkRed'){
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);

        this.bullet_speed = 8;
        this.inaccuracy = 2;

        this.shoot_gap = 120;
    }

    get_type_stats(){
        if(this.type === 'smart'){
            this.lead_shot = true;
        }
        if(this.type === 'strong'){
            this.hp = 2;
            this.bullet_speed = 10;
            this.prb_lead_shot = .33;
        }
        if(this.type === 'elite'){
            this.hp = 2;
            this.damage = 3;
            this.bullet_speed = 13;
            this.prb_lead_shot = .5;
        }
    }

    attack(player, walls){
        if(this.dead === false){
            if(this.check_in_sight(player, walls)){
                this.player_spotted = true;
                this.shoot_timer ++;

                if(this.shoot_timer >= this.shoot_gap){
                    this.shoot(player);
                    this.shoot_timer = 0;
                }
            }
        }
        // Delete bullets
        this.delete_bullets(walls, player);
    }
}

export class RocketEnemy extends Enemy{
    constructor(x, y, width, height, patrol_path, type='standard', one_life=false, 
    hp=1, speed=1.5, damage=1, color='FireBrick'){
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);

        this.shoot_gap = 120; 
        this.attack_delay = 40;
        this.attack_delay_timer = 0;
        
        this.rocket_range = 220;
        this.rocket_speed = 4;

        this.attack_range = 200;
        this.min_move_range = 180;
        this.move_delay = 60;
        this.move_delay_timer = 0;
        this.inaccuracy = 8;

        this.rocket_recoil = 1;

        this.get_type_stats();
    }

    get_type_stats(){
        if(this.type === 'strong'){
            this.hp = 2;
            this.prb_lead_shot = .25;
            this.rocket_speed = 5;
            this.explosion_size = 25;
        }
        else if(this.type === 'elite'){
            this.hp = 2;
            this.prb_lead_shot = .33;
            this.rocket_damage = 3;
            this.explosion_damage = 2;
            this.rocket_speed = 6;
            this.attack_range = 230;
            this.min_move_range = 210;
            this.rocket_range = 250
            this.explosion_size = 30;
        }
    }

    attack(player, walls){
        if(this.dead === false){
            if(this.check_in_sight(player, walls)){
                this.player_spotted = true;
                let dist_player = Math.sqrt((player.center_x - this.center_x) ** 2 + (player.center_y - this.center_y) ** 2);

                this.shoot_timer ++;
                if(this.move_delay_timer > 0){
                    this.move_delay_timer --;
                }

                if(dist_player > this.min_move_range && this.move_delay_timer <= 0){
                    this.move_at_player(player);
                }
                // Shoot at player
                if(dist_player <= this.attack_range && this.shoot_timer >= this.shoot_gap && this.move_delay_timer <= 0){
                    this.shoot(player, 'rocket');
                    this.shoot_timer = 0;
                    this.move_delay_timer = this.move_delay;

                    // Add knockback from shot
                    let angle = get_angle_objs(this, player);
                    this.knockback_timer = 20;
                    this.knockback_x += Math.cos(angle) * this.rocket_recoil;
                    this.knockback_y += Math.sin(angle) * this.rocket_recoil;
                }
            }
        }
        this.delete_bullets(walls, player)
    }
}


export class FirstBoss extends Enemy{
    constructor(x, y, width, height, patrol_path=[], type='standard', one_life=false, 
    hp=10, speed=1, damage=1, color='red'){
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);
        this.shoot_gap = 80;

        this.rocket_damage = 2;

        this.in_burst = false;
        this.burst_shoot_count = 3;
        this.burst_counter = 0;
        this.burst_shoot_gap = 10
        this.burst_shoot_timer = 0;

        this.burst_prb_lead_shot = .5;
        this.rocket_prb_lead_shot = .5;

        this.rocket_speed = 5;
        this.burst_bullet_speed = 7;

        this.explosions = [];

        this.full_health = hp;

    }

    get_status_changes(){
        if(this.hp <= .5 * this.full_health){
            this.speed = 2;
            this.shoot_gap = 50;
            this.burst_shoot_count = 5;
        }
    }

    attack(player, walls){
        if(this.dead === false){
            this.get_status_changes();
            if(this.in_burst === false){
                this.shoot_timer ++;
                if(this.shoot_timer >= this.shoot_gap){
                    if(Math.random() >= 0.5){
                        // Shoot burst
                        if(Math.random() <= this.burst_prb_lead_shot){
                            this.lead_shot = true;
                        }
                        else(
                            this.lead_shot = false
                        )

                        this.in_burst = true;
                        this.bullet_speed = this.burst_bullet_speed;
                        this.shoot(player);
                        this.burst_counter ++;
                        this.burst_shoot_timer = 0;

                        // Get shoot timer
                        let shot_deviation = randint(0, this.shoot_gap_deviation);
                        if(Math.random() >= .5){
                            shot_deviation *= -1;
                        }
                        this.shoot_timer = shot_deviation;
                    }
                    else{
                        // Shoot rocket
                        if(Math.random <= this.burst_prb_lead_shot){
                            this.lead_shot = true;
                        }
                        else(
                            this.lead_shot = false
                        )
                    
                        this.bullet_speed = this.rocket_speed;
                        this.shoot(player, 'rocket');

                        // Get shoot timer
                        let shot_deviation = randint(0, this.shoot_gap_deviation);
                        if(Math.random() >= .5){
                            shot_deviation *= -1;
                        }
                        this.shoot_timer = shot_deviation;
                    }
                }
            }
            else{
                this.burst_shoot_timer ++;
                if(this.burst_shoot_timer >= this.burst_shoot_gap){
                    this.shoot(player);
                    this.burst_counter ++; 
                    this.burst_shoot_timer = 0;
                    if(this.burst_counter >= this.burst_shoot_count){
                        this.in_burst = false;
                        this.burst_counter = 0;
                    }
                }
            }
            this.dodge(player);
        }
        this.delete_bullets(walls, player);
    }
}


export class SpawnerBoss extends Enemy{
    constructor(x, y, width, height, patrol_path=[], type='spawner boss', one_life=false,
    hp=16, speed=.66, damage=2, color='DarkOliveGreen'){
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);
        this.eggs = [];
        this.minions = [];
        this.egg_id = 0;
        this.minion_id = 10;

        this.egg_shoot_timer = 0;
        this.egg_shoot_gap = 330;
        this.egg_shoot_gap_deviation = 10;
        
        this.egg_shoot_location_range = [[175, 610], [75, 410]];
        

        this.bullet_speed = 7;
        this.shoot_gap = 100;
        this.prb_lead_shot = .25;


        this.invincible = false;
        this.has_gone_invincible = false;
        this.invincible_timer = 0;
        this.invincibility_length = 600;

        this.invincible_color = 'blue';
        this.non_invincible_color = this.color;

        this.invincible_eggs_shoot = 5;


        this.full_health = hp;
    }

    get_status_changes(){
        if(this.invincible){
            if(this.invincibility_timer <= 0){
                this.invincible = false;
            }
            else{
                this.invincibility_timer --;
            }
        }
        // Check if going invincible
        if(this.hp <= 0.5 * this.full_health && !(this.has_gone_invincible)){
            this.invincible = true;
            this.has_gone_invincible = true;
            this.invincibility_timer = this.invincibility_length;

            // Change stats after going invincible
            this.speed = 1;
            this.prb_lead_shot = .5;
            this.egg_shoot_gap = 210;

            // Reset bullet and egg shots
            let shot_deviation = randint(0, this.shoot_gap_deviation);
            if(Math.random() >= .5){
                shot_deviation *= -1;
            }
            this.shoot_timer = shot_deviation;

            let egg_shoot_deviation = randint(0, this.egg_shoot_gap_deviation);
            if(Math.random() >= .5){
                egg_shoot_deviation *= -1;
            }
            this.egg_shoot_timer = egg_shoot_deviation;

            // Shoot 5 eggs when going invincible
            for(let i = 0; i < this.invincible_eggs_shoot; i++){
                let egg_location = [];
                egg_location.push(randint(this.egg_shoot_location_range[0][0], this.egg_shoot_location_range[0][1]));
                egg_location.push(randint(this.egg_shoot_location_range[1][0], this.egg_shoot_location_range[1][1]))

                this.eggs.push(new SpawnerBossEgg(this.x, this.y, 20, 20, egg_location, this.egg_id));
                this.egg_id ++;
            }
        }
        // Get color depending on invincibility status
        if(this.invincible){
            this.color = this.invincible_color;
        }
        else{
            this.color = this.non_invincible_color;
        }
    }

    attack(player, walls){
        if(this.dead === false){
            this.get_status_changes();

            if(this.invincible === false){
                this.shoot_timer ++; 
                this.egg_shoot_timer ++;
            }

            // Shoot if timer is ready
            if(this.shoot_timer >= this.shoot_gap){
                this.shoot(player);
                let shot_deviation = randint(0, this.shoot_gap_deviation);
                if(Math.random() >= .5){
                    shot_deviation *= -1;
                }
                this.shoot_timer = shot_deviation;
            }

            // Shoot eggs
            if(this.egg_shoot_timer >= this.egg_shoot_gap){
                let egg_location = [];
                egg_location.push(randint(this.egg_shoot_location_range[0][0], this.egg_shoot_location_range[0][1]));
                egg_location.push(randint(this.egg_shoot_location_range[1][0], this.egg_shoot_location_range[1][1]));

                this.eggs.push(new SpawnerBossEgg(this.x, this.y, 20, 20, egg_location, this.egg_id));
                this.egg_id ++;

                // Reset egg shoot timer
                let egg_shoot_deviation = randint(0, this.egg_shoot_gap_deviation);
                if(Math.random() >= .5){
                    egg_shoot_deviation *= -1;
                }
                this.egg_shoot_timer = egg_shoot_deviation;
            }
            if(!(this.invincible)){
                this.dodge(player);
            }
        }
        this.delete_bullets(walls, player);
        this.delete_spawns();
    }

    delete_spawns(){
        // Delete eggs and potentially spawn minions
        let num_eggs = this.eggs.length;
        let deleted_eggs = [];
        for(let i = 0; i < num_eggs; i ++){
            if((this.eggs[i].spawn_timer <= 0 || this.eggs[i].hp <= 0)
            && !(deleted_eggs.includes(this.eggs[i].id))){

                deleted_eggs.push(this.eggs[i].id);
                // Spawn minion if egg spawn timer reached 0
                if(this.eggs[i].spawn_timer <= 0){
                    this.minions.push(new MeleeEnemy(this.eggs[i].x + 2.5, this.eggs[i].y + 2.5, 15, 15, [], 'small'));
                    this.minions[this.minions.length - 1].id = this.minion_id;
                    this.minion_id ++;
                }
            }
        }
        // Execute egg deletion
        let num_deleted_eggs = deleted_eggs.length;
        if(num_deleted_eggs > 0){
            let new_egg_list = [];
            for(let i = 0; i < num_eggs; i++){
                if(!(deleted_eggs.includes(this.eggs[i].id))){
                    new_egg_list.push(this.eggs[i]);
                }
            }
            this.eggs = new_egg_list;
        }

        // Delete minions
        let num_minions = this.minions.length;
        let deleted_minions = [];
        for(let i = 0; i < num_minions; i++){
            if((this.minions[i].hp <= 0 || this.hp <= 0) && !(deleted_minions.includes(this.minions[i].id))){
                deleted_minions.push(this.minions[i].id);
            }
        }
        // Execute minion deletion
        let num_deleted_minions = deleted_minions.length;
        if(num_deleted_minions > 0){
            let new_minion_list = [];
            for(let i = 0; i < num_minions; i++){
                if(!(deleted_minions.includes(this.minions[i].id))){
                    new_minion_list.push(this.minions[i]);
                }
            }
            this.minions = new_minion_list;
        }
    }
}

export class SpawnerBossEgg{
    constructor(x, y, width, height, travel_location, id, speed=3, hp=2, color='olive'){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.hp = hp;
        this.id = id;
        this.color = color;

        this.x -= .5 * this.width;
        this.y -= .5 * this.height;

        this.center_x = this.x + (this.width / 2);
        this.center_y = this.y + (this.height / 2);

        this.speed = speed;
        this.v_x = 0;
        this.v_y = 0;
        this.a_x = 0;
        this.a_y = 0;

        this.time_traveled = 0;
        this.travel_time_required;

        this.travel_location = travel_location;
        this.reached_location = false;
        this.spawn_timer = 360;
        this.get_movement();
    }

    get_movement(){
        let angle = get_angle_array_obj(this.travel_location, this)

        this.v_x = Math.cos(angle) * this.speed;
        this.v_y = Math.sin(angle) * this.speed;

        this.travel_time_required = (get_distance([this.x, this.y], this.travel_location)) / this.speed;
    }

    move(){
        this.v_x += this.a_x;
        this.v_y += this.a_y;
        
        this.x += this.v_x;
        this.y += this.v_y;

        // Increment time traveled as egg moves
        if(!(this.reached_location)){
            this.time_traveled ++;
        }
    }

    update(){
        this.move();

        // Check if egg has reached location
        if(this.time_traveled >= this.travel_time_required){
            this.v_x = 0;
            this.v_y = 0;
            this.reached_location = true;
        }

        this.center_x = this.x + (this.width / 2);
        this.center_y = this.y + (this.height / 2);

        if(this.reached_location){
            this.spawn_timer --;
        }
    }

    draw(win){
        this.update();
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
    }
}


export class FinalBoss extends Enemy{
    constructor(x, y, width, height, patrol_path=[], type='final boss', one_life=false, 
    hp=18, speed=2.5, damage=2, color='green'){
        super(x, y, width, height, patrol_path, type, one_life, hp, speed, damage, color);


        this.in_animation = true;
        this.apl = 150;
        this.animation_length = 510;
        this.animation_timer = 0;


        this.teleporting = false;

        this.teleport_length = 270;
        this.teleport_timer = 0;
        this.teleport_animation_length = 90;
        this.teleport_gone_length = 180;

        this.teleport_gap_length = 300;
        this.teleport_gap_timer = 0;

        this.teleport_range = [[75, 625], [50, 425]];


        this.bullet_speed = 8;
        this.shoot_gap = 60;

        this.in_burst = false;
        this.burst_shoot_count = 3;
        this.burst_counter = 0;
        this.burst_shoot_gap = 10
        this.burst_shoot_timer = 0;

        this.rocket_damage = 3;
        this.rocket_speed = 6;
        this.rocket_range = 275;

        this.attack_range = 250;
        this.min_move_range = 225;
    }

    get_status_changes(){
        if(this.hp > 1/3 * this.max_hp && this.hp <= 2/3 * this.max_hp){
            this.shoot_gap = 12;
        }
        if(this.hp <= 1/3 * this.max_hp){
            this.shoot_gap = 14;
        }

    }

    attack(player, walls){
        if(!(this.dead)){
            this.get_status_changes();
            if(!(this.teleporting)){
                this.teleport_gap_timer ++;
                if(this.teleport_gap_timer >= this.teleport_gap_length){
                    this.teleporting = true;
                    this.teleport_timer = 0;
                }
                if(this.hp > 2/3 * this.max_hp){
                    if(!(this.in_burst)){
                        if(this.check_in_sight(player, walls)){
                            this.shoot_timer ++;
                            if(this.shoot_timer >= this.shoot_gap){
                                this.shoot_timer = 0;
                                this.in_burst = true;
                                this.burst_shoot_timer = 10;
                                if(Math.random() >= 0.5){
                                    this.lead_shot = true;
                                }
                            }
                        }
                    }
                    else{
                        this.burst_shoot_timer ++;
                        if(this.burst_shoot_timer >= this.burst_shoot_gap){
                            this.shoot(player);
                            this.burst_counter ++; 
                            this.burst_shoot_timer = 0;
                            if(this.burst_counter >= this.burst_shoot_count){
                                this.in_burst = false;
                                this.burst_counter = 0;
                                this.lead_shot = false;
                            }
                        }

                    }
                    this.dodge(player);
                }
                else if(this.hp > 1/3 * this.max_hp && this.hp <= 2/3 * this.max_hp){
                    if(this.check_in_sight(player, walls)){
                        this.shoot_timer ++; 
                        if(this.shoot_timer >= this.shoot_gap){
                            this.shoot_timer = 0;
                            if(Math.random() >= 0.5){
                                this.lead_shot = true;
                            }
                            this.shoot(player);
                            this.lead_shot = false;
                        }
                    }
                    this.dodge(player);
                }
                else{
                    let dist_player = get_distance([this.center_x, this.center_y], [player.center_x, player.center_y]);
                    let player_in_sight = this.check_in_sight(player, walls);
                    if(player_in_sight){
                        this.shoot_timer ++;
                        if(this.shoot_timer >= this.shoot_gap && this.attack_range > dist_player){
                            this.shoot_timer = 0;
                            if(Math.random() >= 0.5){
                                this.lead_shot = true;
                            }
                            this.shoot(player, 'rocket');
                            this.lead_shot = false;
                        }

                    }
                    if(dist_player > this.min_move_range || !(player_in_sight)){
                        this.move_at_player(player);
                    }
                }
            }
            else{
                this.invisible = true;
                this.teleport_timer ++;
                if(this.teleport_timer === this.teleport_animation_length){
                    this.x = -1200;
                    this.y = -1200;
                }
                else if(this.teleport_timer === this.teleport_gone_length){
                    let valid_tp_location = false;
                    let tp_loc_x;
                    let tp_loc_y;
                    let num_walls = walls.length;
                    while(!(valid_tp_location)){
                        valid_tp_location = true;
                        tp_loc_x = randint(this.teleport_range[0][0], this.teleport_range[0][1]);
                        tp_loc_y = randint(this.teleport_range[1][0], this.teleport_range[1][1]);
                        for(let i = 0; i < num_walls; i++){
                            if(check_collision_array_obj([tp_loc_x, tp_loc_y], walls[i], this.width, this.height, 5)){
                                valid_tp_location = false;
                            }
                        }
                        if(check_collision_array_obj([tp_loc_x, tp_loc_y], player, this.width, this.height, 5)){
                            valid_tp_location = false;
                        }
                    }
                    this.x = tp_loc_x;
                    this.y = tp_loc_y;
                }
                else if(this.teleport_timer >= this.teleport_length){
                    this.invisible = false;
                    this.teleporting = false;
                    this.teleport_timer = 0;
                    this.teleport_gap_timer = 0;
                }

            }
        }
        this.delete_bullets(walls, player);
    }

    draw(win, walls, movement_blockers, player){
        if(!(this.in_animation)){
            this.update(player, walls, movement_blockers);
            this.manage_explosions(win, player);
        }

        // Draw base rectangle
        let teleport_progress;
        if(this.teleport_timer > 0){
            if(this.teleport_timer < this.teleport_animation_length){
                teleport_progress = 1 - (this.teleport_timer / this.teleport_animation_length);
            }
            else if(this.teleport_timer > 2 * this.teleport_animation_length){
                teleport_progress = (this.teleport_timer - (2 * this.teleport_animation_length)) / 
                (this.teleport_length - (2 * this.teleport_animation_length));
            }
            else if(this.teleport_timer > this.teleport_animation_length && this.teleport_timer < 2 * this.teleport_animation_length){
                teleport_progress = 1;
            }
        }
        else{
            teleport_progress = 1;
        }
        if(teleport_progress < 1){
            // console.log(teleport_progress);
        }
        win.globalAlpha = teleport_progress;
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);

        // Draw color based on health
        win.fillStyle = 'green';
        let health_color_progress = ((this.max_hp - this.hp) / this.max_hp) * this.height;

        win.fillRect(this.x + this.width/2 - health_color_progress/2, this.y + this.height/2 - health_color_progress/2, 
        health_color_progress, health_color_progress);
        win.globalAlpha = 1;
        // win.fillRect(this.x, this.y, this.width, health_color_progress / 2);
        // win.fillRect(this.x, this.y, health_color_progress / 2, this.height);
        // win.fillRect(this.x + this.width - (health_color_progress / 2), this.y, health_color_progres / 2, this.height);
        // win.fillRect(this.x, this.y + this.height - (health_color_progress / 2), this.width, health_color_progress / 2);


        if(this.in_animation){
            this.animation_timer ++; 
            // Draw opening animation
            if(this.animation_timer >= this.apl){
                let animation_progress = ((this.animation_timer - this.apl) / (this.animation_length - this.apl)) * (this.height / 2);

                win.fillStyle = 'red';

                win.fillRect(this.x, this.y, this.width, animation_progress);

                win.fillRect(this.x, this.y, animation_progress, this.height);

                win.fillRect(this.x + this.width - animation_progress, this.y, animation_progress, this.height);

                win.fillRect(this.x, this.y + this.height - animation_progress, this.width, animation_progress);


            }
            if(this.animation_timer >= this.animation_length){
                this.in_animation = false;
                this.color = 'red';
            }
        }
    }
}
