import { Player } from './classes.js';
import { Bullet } from './classes.js';
import { Wall } from './classes.js';

import { check_collision } from './functions.js';
import { get_blocked_sight } from './functions.js';

import { create_level } from './rooms.js';


window.addEventListener('load', main);


const inputs = [];
const mouse_buttons = [];
var mouse_client_pos_x = 0;
var mouse_client_pos_y = 0;

window.addEventListener('keydown', e =>{
    if (inputs.indexOf(e.key) === -1){
        inputs.push(e.key);
    }
});

window.addEventListener('keyup', e =>{
    inputs.splice(inputs.indexOf(e.key), 1);
});

window.addEventListener('mousedown', e => {
    if (e.button === 0 && inputs.indexOf('left_click') === -1){
        mouse_buttons.push('left_click');
        mouse_client_pos_x = e.clientX;
        mouse_client_pos_y = e.clientY;
    }
})

window.addEventListener('mouseup', e =>{
    if(e.button === 0){
        mouse_buttons.splice('left_click');
    }
})

function main(){
    // Set up variables
    const canvas = document.getElementById('canvas1');
    const health_heading = document.getElementById('health_heading');
    const ammo_heading = document.getElementById('ammo_heading');
    const key_heading = document.getElementById('key_heading');
    const ctx = canvas.getContext('2d');
    canvas.width = 700;
    canvas.height = 500;
    const fps = 60;

    var left_click_timer = 0;
    var mouse_pos_x = 0;
    var mouse_pos_y = 0;
    var rect = canvas.getBoundingClientRect();

    var player = new Player(10, 10, 25, 25);
    var loc_x = 0;
    var loc_y = 0;
    var prev_loc_x = 0;
    var prev_loc_y = 0;
    var level = create_level(loc_x, loc_y, prev_loc_x, prev_loc_y);
    
    var bullets = [];
    var walls = level.walls;
    var enemies = level.enemies;
    var exits = level.exits;
    var items = level.items;
    var bullet_id = 0;
    var items_collected = [];
    var permanent_enemies_defeated = [];
    var keys_collected = 0;
    var unlocked_doors = [];
    var big_key_collected = false;

    var checkpoint_1_reached = false;
    var checkpoint_2_reached = false;
    var checkpoint_3_reached = false;
    var player_checkpoint_hp = player.max_hp;

    var final_boss_defeated = false;
    
    // Give enemies ids
    let num_enemies = enemies.length;
    for(let i = 0; i < num_enemies; i++){
        enemies[i].id = i;
    }

    // Give items ids
    let num_items = items.length;
    for(let i = 0; i < num_items; i++){
        items[i].id = i;
    }

    // Game loop
    setInterval(function(){
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Put text in headings
        health_heading.textContent = 'Health: ' + player.hp;
        ammo_heading.textContent = 'Ammo: ' + player.loaded_ammo + '|' + player.unloaded_ammo; 
        key_heading.textContent = 'Keys: ' + keys_collected;

        // Change border if big key collected
        if(big_key_collected){
            canvas.style.borderColor = 'DarkRed';
        }

        // Get accurate mouse position
        mouse_pos_x = mouse_client_pos_x - rect.left;
        mouse_pos_y = mouse_client_pos_y - rect.top;

        // Check if in final boss opening animation
        if(enemies.length > 0){
            if(enemies[0].type === 'final boss' && enemies[0].in_animation){
                player.in_cutscene = true;
            }
            else{
                player.in_cutscene = false;
            }
        }


        // Create a timer for time left mouse button has been held
        if(mouse_buttons.includes('left_click')){
            left_click_timer ++;
        }
        else{
            left_click_timer = 0;
        }

        // Log mouse click location
        if(left_click_timer === 1){
            console.log('Mouse position: (', mouse_pos_x, ', ', mouse_pos_y, ')')
        }

        // Initialize object list lengths
        let num_bullets = bullets.length;
        let num_walls = walls.length;
        let num_enemies = enemies.length;
        let num_exits = exits.length;
        let num_items = items.length;

        // Fire bullet
        if(left_click_timer === 1 && player.can_shoot() && (700 >= mouse_pos_x && 
            0 <= mouse_pos_x && 500 >= mouse_pos_y && 0 <= mouse_pos_y) && 
            player.knockback_timer <= 0){    
            let angle = 0.0;
            let x_dif = mouse_pos_x - player.center_x;
            let y_dif = mouse_pos_y - player.center_y;
            if(x_dif === 0){
                x_dif = 0.01;
            }
            if(x_dif >= 0){
                angle = Math.atan(y_dif / x_dif);
            }
            else{
                angle = Math.PI - Math.atan(-y_dif / x_dif)
            }
            // console.log('mouse x position:', mouse_pos_x);
            // console.log('mouse y position:', mouse_pos_y);
            // console.log('x difference:', x_dif);
            // console.log('y difference:', y_dif);
            // console.log('distance:', distance);
            // console.log('angle:', angle);
            let shot_inaccuracy = player.inaccuracy;
            if(player.moving === true){
                shot_inaccuracy += player.movement_inaccuracy;
            }

            player.shoot();
            bullets.push(new Bullet(player.center_x, player.center_y, bullet_id, angle, 
            shot_inaccuracy, player.bullet_speed));
            bullet_id++;
            player.loaded_ammo --;
        }

        // Delete necessary bullets
        let deleted_bullets = [];
        num_bullets = bullets.length;
        num_walls = walls.length;
        num_enemies = enemies.length;
        for(let i = 0; i < num_bullets; i++){
            // Delete bullets in enemy
            for(let j = 0; j < num_enemies; j++){
                if(!(enemies[j].invisible)){
                    if(check_collision(bullets[i], enemies[j]) && !(deleted_bullets.includes(bullets[i].id))){
                        deleted_bullets.push(bullets[i].id);
                        if(!(enemies[j].invincible)){
                            enemies[j].hp -= player.damage;
                            console.log('Enemy health:', enemies[j].hp);
                        }
                    }
                    if(enemies[j].type === 'spawner boss'){
                        // Check if bullet hit egg
                        let num_eggs = enemies[j].eggs.length;
                        for(let l = 0; l < num_eggs; l++){
                            if(check_collision(bullets[i], enemies[j].eggs[l]) && !(deleted_bullets.includes(bullets[i].id))){
                                deleted_bullets.push(bullets[i].id);
                                enemies[j].eggs[l].hp -= player.damage;
                            }
                        }
                        // Check if bullet hit spawner boss minion
                        let num_minions = enemies[j].minions.length;
                        for(let l = 0; l < num_minions; l++){
                            if(check_collision(bullets[i], enemies[j].minions[l]) && !(deleted_bullets.includes(bullets[i].id))){
                                deleted_bullets.push(bullets[i].id);
                                enemies[j].minions[l].hp -= player.damage;
                            }
                        }
                    }
                }
            }
            // Delete bullets in wall
            for(let j = 0; j < num_walls; j++){
                if(check_collision(bullets[i], walls[j]) && 
                deleted_bullets.indexOf(bullets[i].id) === -1){
                    // console.log('deleting bullet in wall');
                    deleted_bullets.push(bullets[i].id);
                }
            }
            // Delete bullets out of boundaries
            if(deleted_bullets.indexOf(bullets[i].id) === -1){
                if (bullets[i].x > canvas.width || bullets[i].x < 0 || bullets[i].y > canvas.height
                    || bullets[i].y < 0){
                    // console.log('deleting bullet out of boundaries');
                    deleted_bullets.push(bullets[i].id);
                }
            }
        }
        // Execute bullet deletion
        let num_deleted_bullets = deleted_bullets.length;
        if(num_deleted_bullets > 0){
            let new_bullet_list = [];
            for(let i = 0; i < num_bullets; i++){
                if(!(deleted_bullets.includes(bullets[i].id))){
                    new_bullet_list.push(bullets[i]);
                }
            }
            bullets = new_bullet_list;
        }

        // Delete enemies
        num_enemies = enemies.length;
        let deleted_enemies = [];
        for(let i = 0; i < num_enemies; i++){
            if(enemies[i].hp <= 0 && !(deleted_enemies.includes(enemies[i].id))){
                // Set item spawn location
                if(enemies[i].item_spawn_set === false){
                    enemies[i].item_spawn_x = enemies[i].x;
                    enemies[i].item_spawn_y = enemies[i].y;
                    enemies[i].item_spawn_set = true;
                }

                if(enemies[i].bullets.length === 0 && enemies[i].explosions.length === 0 && 
                enemies[i].eggs.length === 0 && enemies[i].minions.length === 0){
                    // Add to permanent deleted enemies
                    if(enemies[i].one_life === true){
                        permanent_enemies_defeated.push([loc_x, loc_y, enemies[i].id]);
                    }
                    if(enemies[i].type === 'final boss'){
                        final_boss_defeated = true;
                    }
                    deleted_enemies.push(enemies[i].id);
                    // Spawn item in enemy
                    num_items = items.length;
                    for(let j = 0; j < num_items; j++){
                        if(items[j].condition === 'in enemy' && items[j].enemy_in === enemies[i].id){
                            items[j].collectable = true;
                            items[j].x = enemies[i].item_spawn_x;
                            items[j].y = enemies[i].item_spawn_y;
                        }
                    }
                }
                else if(enemies[i].dead === false){
                    enemies[i].dead = true;
                    enemies[i].x = -1000;
                    enemies[i].y = -1000;
                }
            }
        }
        let num_del_enemies = deleted_enemies.length;
        if(num_del_enemies > 0){
            let new_enemy_list = [];
            for(let i = 0; i < num_enemies; i++){
                if(deleted_enemies.indexOf(enemies[i].id) === -1){
                    new_enemy_list.push(enemies[i]);
                }
            }
            enemies = new_enemy_list;
        }


        // Spawn items with condition all enemies 
        num_items = items.length;
        for(let i = 0; i < num_items; i++){
            if(items[i].condition === 'all enemies' && items[i].collectable === false && enemies.length === 0){
                items[i].collectable = true;
                items[i].x = items[i].spawn_x;
                items[i].y = items[i].spawn_y;
            }
        }


        // Delete items
        let deleted_items = [];
        for(let i = 0; i < num_items; i++){
            if(check_collision(player, items[i]) && !(deleted_items.includes(items[i].id))){
                // Collect item
                if(items[i].type === 'heal'){
                    if(player.hp < player.max_hp){
                        player.hp ++;
                    }
                }
                else if(items[i].type === 'full heal'){
                    player.hp = player.max_hp; 
                }
                else if(items[i].type === 'ammo'){
                    player.unloaded_ammo += player.max_loaded_ammo;
                }
                else if(items[i].type === 'max health'){
                    player.max_hp ++;
                    player.hp ++;
                }
                else if(items[i].type === 'key'){
                    keys_collected ++;
                }
                else if(items[i].type === 'big key'){
                    big_key_collected = true;
                }
                
                items_collected.push([loc_x, loc_y, items[i].id]);
                deleted_items.push(items[i].id);
            }
        }
        let num_del_items = deleted_items.length;
        if(num_del_items > 0){
            let new_item_list = [];
            for(let i = 0; i < num_items; i++){
                if(!(deleted_items.includes(items[i].id))){
                    new_item_list.push(items[i]);
                }
            }
            items = new_item_list;
        }


        // Draw victory text
        if(final_boss_defeated){
            ctx.font = '50px Arial';
            ctx.fillText('You Win!', 275, 275);
        }


        // Draw sprites
        num_bullets = bullets.length;
        num_walls = walls.length;
        num_enemies = enemies.length;
        num_exits = exits.length;
        num_items = items.length;
        let movement_blockers = [];

        // Get movement blockers
        for(let i = 0; i < num_walls; i++){
            movement_blockers.push(walls[i]);
        }
        for(let i = 0; i < num_exits; i++){
            if(exits[i].locked === true){
                movement_blockers.push(new Wall(exits[i].x, exits[i].y, exits[i].width, exits[i].height));
            }
        }

        player.draw(ctx, inputs, movement_blockers);

        for(let i = 0; i < num_enemies; i++){
            enemies[i].draw(ctx, walls, movement_blockers, player);
            let num_enemy_bullets = enemies[i].bullets.length;
            for(let j = 0; j < num_enemy_bullets; j++){
                enemies[i].bullets[j].draw(ctx);
            }
            // Draw eggs and minions of spawner boss
            if(enemies[i].type === 'spawner boss'){
                let num_eggs = enemies[i].eggs.length;
                let num_minions = enemies[i].minions.length;
                for(let j = 0; j < num_eggs; j++){
                    enemies[i].eggs[j].draw(ctx);
                }
                for(let j = 0; j < num_minions; j++){
                    enemies[i].minions[j].draw(ctx, walls, movement_blockers, player);
                }
            }
        }

        for(let i = 0; i < num_exits; i++){
            exits[i].draw(ctx);
            // Check if exit is locked
            if(exits[i].lock_type === 'all enemies'){
                if(num_enemies > 0){
                    exits[i].locked = true;
                }
                else{
                    exits[i].locked = false;
                }
            }
            // Handle locks with keys and big key
            else if(exits[i].lock_type === 'key'){
                if(exits[i].locked){
                    if(check_collision(player, exits[i], 10) && keys_collected > 0){
                        exits[i].locked = false;
                        keys_collected --;
                        unlocked_doors.push([loc_x, loc_y, i]);
                    }
                    else{
                        let num_unlocked_doors = unlocked_doors.length;
                        for(let j = 0; j < num_unlocked_doors; j++){
                            if(unlocked_doors[j][0] === loc_x && unlocked_doors[j][1] === loc_y && unlocked_doors[j][2] === i){
                                exits[i].locked = false;
                            }
                        }
                    }
                }
            }
            else if(exits[i].lock_type === 'big key'){
                if(exits[i].locked){
                    if(check_collision(player, exits[i], 10) && big_key_collected){
                        exits[i].locked = false;
                        unlocked_doors.push([loc_x, loc_y, i]);
                    }
                    else{
                        let num_unlocked_doors = unlocked_doors.length;
                        for(let j = 0; j < num_unlocked_doors; j++){
                            if(unlocked_doors[j][0] === loc_x && unlocked_doors[j][1] === loc_y && unlocked_doors[j][2] === i){
                                exits[i].locked = false;
                            }
                        }
                    }
                }
            }
        }

        for(let i = 0; i < num_items; i++){
            items[i].draw(ctx);
        }

        for (let i = 0; i < num_bullets; i++){
            bullets[i].draw(ctx);
        }
        
        for(let i = 0; i < num_walls; i++){
            get_blocked_sight(ctx, player, walls[i], [0, canvas.width], [0, canvas.height]);
        }

        for(let i = 0; i < num_walls; i++){
            walls[i].draw(ctx);
        }


        // Check if player died
        if(player.hp <= 0){
            player = new Player(10, 10, 25, 25);
            if(checkpoint_3_reached){
                player.x = 337;
                player.y = 440;
                level = create_level(3, 4, 0, 4);
                player.max_hp = player_checkpoint_hp;
                player.hp = player.max_hp;
                player.unloaded_ammo = 16;
                loc_x = 1;
                loc_y = 4;
            }
            else if(checkpoint_2_reached){
                player.x = 75;
                player.y = 237;
                level = create_level(1, 4, 0, 4);
                player.max_hp = player_checkpoint_hp;
                player.hp = player.max_hp;
                player.unloaded_ammo = 16;
                loc_x = 1;
                loc_y = 4;
            }
            else if(checkpoint_1_reached){
                player.x = 337;
                player.y = 440;
                level = create_level(3, 3, 3, 2);
                player.max_hp = player_checkpoint_hp;
                player.hp = player.max_hp;
                player.unloaded_ammo = 16;
                loc_x = 3;
                loc_y = 3;
            }
            else{
                level = create_level(0, 0, 0, 0);
                loc_x = 0;
                loc_y = 0;
            }
            walls = level.walls;
            enemies = level.enemies;
            exits = level.exits;
            items = level.items;
            bullets = [];
            bullet_id = 0;
            items_collected = [];
            permanent_enemies_defeated = [];
            keys_collected = 0;
            unlocked_doors = [];

            // Give enemies ids
            let num_enemies = enemies.length;
            for(let i = 0; i < num_enemies; i++){
                enemies[i].id = i;
            }
            // Give items ids
            let num_items = items.length;
            for(let i = 0; i < num_items; i++){
                items[i].id = i;
            }
        }
        else if(num_exits > 0){
            for(let i = 0; i < num_exits; i++){
                if(exits[i].locked === false && check_collision(exits[i], player)){
                    player.x = exits[i].new_x;
                    player.y = exits[i].new_y;

                    prev_loc_x = loc_x;
                    prev_loc_y = loc_y;
                    loc_x = exits[i].new_room_x;
                    loc_y = exits[i].new_room_y;

                    // Check if checkpoint has been
                    if(loc_x === 3 && loc_y === 3 && !(checkpoint_1_reached) && !(checkpoint_2_reached)){
                        checkpoint_1_reached = true;
                        player_checkpoint_hp = player.max_hp;
                    }
                    else if(loc_x === 1 && loc_y === 4 && !(checkpoint_2_reached) && !(checkpoint_3_reached)){
                        checkpoint_2_reached = true;
                        player_checkpoint_hp = player.max_hp;
                    }
                    else if(loc_x === 3 && loc_y === 4 && !(checkpoint_3_reached)){
                        checkpoint_3_reached = true;
                        player_checkpoint_hp = player.max_hp;
                    }

                    level = create_level(loc_x, loc_y, prev_loc_x, prev_loc_y);

                    walls = level.walls;
                    enemies = level.enemies;
                    exits = level.exits;
                    items = level.items;
                    bullets = [];
                    bullet_id = 0;

                    if(big_key_collected && !(loc_x === 4 && loc_y === 4)){
                        enemies = [];
                    }

                    // Give enemies ids
                    let num_enemies = enemies.length;
                    for(let j = 0; j < num_enemies; j++){
                        enemies[j].id = j;
                    }


                    // Give items ids
                    let num_items = items.length;
                    for(let j = 0; j < num_items; j++){
                        items[j].id = j;
                    }

                    // Delete items that have reached collection limit
                    let deleted_items = [];
                    let num_items_collected = items_collected.length;
                    for(let j = 0; j < num_items; j++){
                        let num_occurances = 0;
                        for(let l = 0; l < num_items_collected; l++){
                            if(items_collected[l][0] === loc_x && items_collected[l][1] === loc_y && items_collected[l][2] === items[j].id){
                                num_occurances ++;
                            }
                        }
                        if(num_occurances === items[j].collection_limit){
                            deleted_items.push(items[j].id);
                        }
                    }
                    let num_del_items = deleted_items.length;
                    if(num_del_items > 0){
                        let new_item_list = [];
                        for(let j = 0; j < num_items; j++){
                            if(!(deleted_items.includes(items[j].id))){
                                new_item_list.push(items[j]);
                            }
                        }
                        items = new_item_list;
                    }

                    // Delete defeated enemies with only one life
                    let deleted_enemies = [];
                    let num_permanent_deleted_enemies = permanent_enemies_defeated.length;
                    for(let j = 0; j < num_enemies; j++){
                        for(let l = 0; l < num_permanent_deleted_enemies; l++){
                            if(permanent_enemies_defeated[l][0] === loc_x && permanent_enemies_defeated[l][1] === loc_y && permanent_enemies_defeated[l][2] === enemies[j].id){
                                deleted_enemies.push(enemies[j].id);
                            }
                        }
                    }
                    let num_del_enemies = deleted_enemies.length;
                    if(num_del_enemies > 0){
                        let new_enemy_list = [];
                        for(let j = 0; j < num_enemies; j++){
                            if(!(deleted_enemies.includes(enemies[j].id))){
                                new_enemy_list.push(enemies[j]);
                            }
                        }
                        enemies = new_enemy_list;
                    }
                    break;
                }
            }
        }
    }, 
    1000/fps
)};

