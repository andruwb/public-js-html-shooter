import { check_collision } from './functions.js';

export class Player{
    constructor(x, y, width, height, hp=3, damage=1, color='green'){
        // Basic
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.original_color = color;

        this.center_x = this.x + this.width/2
        this.center_y = this.y + this.height/2


        // Movement
        this.speed = 2;
        this.v_x = 0;
        this.v_y = 0;
        this.a_x = 0;
        this.a_y = 0;
        this.prev_v_x = 0;
        this.prev_v_y = 0;
        this.moving = false;
        this.moveable = true;


        // Knockback
        this.knockback_timer = 0;
        this.knockback_x = 0;
        this.knockback_y = 0;


        // Health
        this.hp = hp;
        this.max_hp = hp;


        // Invincibility
        this.invincible = false;
        this.invincible_length = 80;
        this.invincible_timer = 0;


        // Damage
        this.damage = damage;
        this.bullet_speed = 6;
        this.inaccuracy = 5;
        this.movement_inaccuracy = 13;

        this.shot_delay = 12;
        this.shot_delay_timer = 0;


        // Ammo
        this.loaded_ammo = 8;
        this.unloaded_ammo = 24;
        this.max_loaded_ammo = 8;
        this.reload_time = 150;
        this.reload_timer = this.reload_time;
        this.reloading = false;


        // Miscellaneous
        this.game_width = 700;
        this.game_height = 500;

        this.in_cutscene = false;
    }

    move(inputs, walls){
        let num_walls = walls.length;

        if(this.knockback_timer > 0){
            this.moveable = false;
        }
        else{
            this.moveable = true;
        }

        // Declare movement variables
        var mv_x = 0;
        var mv_y = 0;

        // Process key movements
        if (this.moveable === true){
            if (inputs.includes('d') && inputs.includes('s')){
                mv_x += this.speed * (Math.SQRT2 / 2);
                mv_y += this.speed * (Math.SQRT2 / 2);
            }
            else if (inputs.includes('d') && inputs.includes('w')){
                mv_x += this.speed * (Math.SQRT2 / 2);
                mv_y -= this.speed * (Math.SQRT2 / 2);
            }
            else if (inputs.includes('a') && inputs.includes('s')){
                mv_x -= this.speed * (Math.SQRT2 / 2);
                mv_y += this.speed * (Math.SQRT2 / 2);
            }
            else if (inputs.includes('a') && inputs.includes('w')){
                mv_x -= this.speed * (Math.SQRT2 / 2);
                mv_y -= this.speed * (Math.SQRT2 / 2);
            }
            else{
                if (inputs.includes('d')){
                    mv_x += this.speed;
                }
                if (inputs.includes('a')){
                    mv_x -= this.speed;
                }
                if (inputs.includes('w')){
                    mv_y -= this.speed;
                }
                if (inputs.includes('s')){
                    mv_y += this.speed;
                }
            }
        }

        // Convert movement values
        this.v_x += this.a_x;
        this.v_y += this.a_y;

        this.v_x += mv_x;
        this.v_y += mv_y;

        if(this.knockback_timer > 0){
            this.v_x += this.knockback_x;
            this.v_y += this.knockback_y;
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

        // Store previous velocities
        this.prev_v_x = this.v_x;
        this.prev_v_y = this.v_y;

        // Reset velocities after movements
        this.v_x -= mv_x;
        this.v_y -= mv_y;

        if(this.knockback_timer > 0){
            this.v_x -= this.knockback_x;
            this.v_y -= this.knockback_y;
            this.knockback_timer --;
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

        // Check if moving
        if(!(mv_x === 0) || !(mv_y === 0) || !(this.v_x === 0) || !(this.v_y === 0)){
            this.moving = true;
        }
        else{
            this.moving = false;
        }

        // Reset knockback values after knocback movement completed
        if(this.knockback_timer <= 0 && (Math.abs(this.knockback_x) > 0 || Math.abs(this.knockback_y) > 0)){
            this.knockback_x = 0;
            this.knockback_y = 0;
        }
    }

    shoot(){
        this.shot_delay_timer = this.shot_delay;
    }

    can_shoot(){
        if(this.loaded_ammo > 0 && this.reloading === false && this.shot_delay_timer <= 0 && !(this.in_cutscene)){
            return true;
        }
        else{
            return false;
        }
    }

    reload(){
        if(this.reload_timer === 0){
            this.reloading = false;
            this.unloaded_ammo -= this.max_loaded_ammo - this.loaded_ammo;
            this.loaded_ammo = this.max_loaded_ammo;
            if(this.unloaded_ammo < 0){
                this.loaded_ammo += this.unloaded_ammo;
                this.unloaded_ammo = 0;
            }
        }
        if(this.reload_timer > 0){
            this.reload_timer --;
        }
    }

    update(inputs, walls){
        if(!(this.in_cutscene)){
            this.move(inputs, walls);
            this.center_x = this.x + this.width/2;
            this.center_y = this.y + this.height/2;
            if(this.unloaded_ammo > 0){
                // Check for automatic reload
                if(this.loaded_ammo === 0 && this.reloading === false){
                    this.reloading = true;
                    this.reload_timer = this.reload_time;
                }
                // Check manual reload
                else if(inputs.includes('r') && this.reloading === false &&
                this.loaded_ammo < this.max_loaded_ammo){
                    this.reloading = true;
                    this.reload_timer = this.reload_time;
                }
            }

            // Reload if needed
            if(this.reloading === true){
                this.reload();
            }

            // Iterate shot delay timer
            if(this.shot_delay_timer > 0){
                this.shot_delay_timer --;
            }

            // Handle invincibility
            if(this.invincible_timer > 0){
                this.invincible = true;
                this.invincible_timer --;
                // Set color
                if(this.invincible_timer % 10 > 4){
                    this.color = 'cyan';
                }
                else{
                    this.color = 'RoyalBlue';
                }
            }
            else{
                this.invincible = false;
                this.color = this.original_color;
            }
        }
        else{
            this.center_x = this.x + this.width/2;
            this.center_y = this.y + this.height/2;
        }

    }

    draw(win, inputs, walls=[]){
        this.update(inputs, walls);
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
    }
}


export class Bullet{
    constructor(x, y, id, angle=0.0, inaccuracy=0, speed=5, type='normal', width=8, height=8, color='type'){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.id = id;
        this.type = type;
        this.color = this.get_color(color);

        this.x -= .5 * this.width;
        this.y -= .5 * this.height;

        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;
        
        this.speed = speed;
        this.v_x = 0;
        this.v_y = 0;
        this.a_x = 0;
        this.a_y = 0;

        this.distance_traveled = 0;

        this.angle = angle;
        this.inaccuracy = inaccuracy;
        this.get_velocities();
    }

    get_color(identifier){
        if(identifier === 'type'){
            if(this.type === 'normal'){
                return 'black';
            }
            else if(this.type === 'rocket'){
                return 'red';
            }
        }
        else{
            return identifier;
        }
    }

    get_velocities(){
        let angle_dev = Math.random() * this.inaccuracy;
        if(Math.random() >= 0.5){
            angle_dev *= -1;
        }
        angle_dev *= Math.PI / 180
        this.angle += angle_dev;
        this.v_x = Math.cos(this.angle) * this.speed;
        this.v_y = Math.sin(this.angle) * this.speed;
        // console.log('x velocity:', this.v_x);
        // console.log('y velocity:', this.v_y);
        // console.log('angle: ', this.angle);
    }

    move(){
        // Convert movement values
        this.v_x += this.a_x;
        this.v_y += this.a_y;
        
        this.x += this.v_x;
        this.y += this.v_y;

        this.distance_traveled += this.speed;
    }

    update(){
        this.move();
        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;
    }

    draw(win){
        this.update();
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
    }
}


export class Wall{
    constructor(x, y, width, height, color='black'){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;

        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;
        this.center = [this.center_x, this.center_y];
        this.top_left = [this.x, this.y];
        this.top_right = [this.x + this.width, this.y];
        this.bottom_left = [this.x, this.y + this.height];
        this.bottom_right = [this.x + this.width, this.y + this.height];
    }

    draw(win){
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
    }
}


export class Exit{
    constructor(x, y, width, height, new_x, new_y, new_room_x, new_room_y, lock_type='none', color='blue', 
    locked_color='DimGray'){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.color = color;
        this.unlocked_color = color;
        this.locked_color = locked_color;

        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;

        this.new_x = new_x;
        this.new_y = new_y;
        this.new_room_x = new_room_x;
        this.new_room_y = new_room_y;

        this.lock_type = lock_type;
        this.locked = this.get_locked();
    }

    get_locked(){
        if(this.lock_type === 'none'){
            return false;
        }
        else{
            return true;
        }
    }

    get_color(){
        if(this.locked === true){
            this.color = this.locked_color;
        }
        else{
            this.color = this.unlocked_color;
        }
    }

    draw(win){
        this.get_color();
        win.fillStyle = this.color;
        win.fillRect(this.x, this.y, this.width, this.height);
        if(this.locked === true){
            if(this.lock_type === 'key'){
                win.fillStyle = 'black';
                win.fillRect(this.center_x - 5, this.center_y - 5, 10, 10);
            }
            else if(this.lock_type === 'big key'){
                win.fillStyle = 'DarkRed';
                win.fillRect(this.center_x - 5, this.center_y - 5, 10, 10);
            }
        }
    }
}


export class Item{
    constructor(x, y, width, height, type, collection_limit, condition='none', enemy_in=-1){
        this.x = x;
        this.y = y;
        this.width = width; 
        this.height = height;

        this.id = 0;
        this.collection_limit = collection_limit;

        this.type = type;
        this.condition = condition;
        this.enemy_in = enemy_in;

        this.spawn_x = this.x;
        this.spawn_y = this.y;

        if(!(this.condition === 'none')){
            this.collectable = false;
            this.x = -1200;
            this.y = -1200;
        }
        else{
            this.collectable = true;
        }

        this.center_x = this.x + this.width/2;
        this.center_y = this.y + this.height/2;
    }

    draw(win){
        if(this.collectable){
            if(this.type === 'ammo' || this.type === 'key'){
                win.fillStyle = 'Gold';
                win.fillRect(this.x, this.y, this.width, this.height);
            }
            else if(this.type === 'heal'){
                win.fillStyle = 'LimeGreen';
                win.fillRect(this.x, this.y, this.width, this.height);
            }
            else if(this.type === 'full heal'){
                win.fillStyle = 'DarkGreen';
                win.fillRect(this.x, this.y, this.width, this.height);
            }
            else if(this.type === 'max health'){
                win.fillStyle = 'red';
                win.fillRect(this.x + this.width/3, this.y, this.width/3, this.height);
                win.fillRect(this.x, this.y + this.height/3, this.width, this.height/3);
            }
            else if(this.type === 'big key'){
                win.fillStyle = 'Gold';
                win.fillRect(this.x, this.y, this.width, this.height);
                win.fillStyle = 'DarkRed';
                win.fillRect(this.x + this.width / 3, this.y + this.height / 2, this.width / 3, this.height / 3);
            }
        }
    }
}
