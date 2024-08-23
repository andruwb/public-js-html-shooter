import { Wall } from './classes.js';
import { Exit } from './classes.js';
import { Item } from './classes.js';

import { Enemy } from './enemy.js';
import { MeleeEnemy } from './enemy.js';
import { SniperEnemy } from './enemy.js';
import { RocketEnemy } from './enemy.js';
import { FirstBoss } from './enemy.js';
import { SpawnerBoss } from './enemy.js';
import { FinalBoss } from './enemy.js';

export function create_level(loc_x, loc_y, prev_loc_x, prev_loc_y){
    let level = {}
    let room_location = [loc_x, loc_y];
    switch(room_location[1]){
        // Column one
        case 0:
            switch(room_location[0]){
                case 0:
                    level = {
                        walls: [new Wall(250, 200, 50, 50), new Wall(400, 300, 50, 50), new Wall(400, 100, 50, 50), 
                        new Wall(150, 0, 50, 300)], 
                        enemies: [new Enemy(325, 125, 25, 25), new Enemy(275, 290, 25, 25)], 
                        exits: [new Exit(675, 212, 25, 75, 35, 237, 1, 0)],
                        items: []
                    };
                    break;

                case 1:
                    level = {
                        walls: [new Wall(325, 0, 50, 200), new Wall(325, 300, 50, 200)],
                        enemies: [new Enemy(450, 125, 25, 25, [], 'smart'), new Enemy(450, 375, 25, 25)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 0, 0), new Exit(675, 212, 25, 75, 35, 237, 2, 0)], 
                        items: []
                    };
                    break;

                case 2:
                    level = {
                        walls: [new Wall(400, 100, 50, 75), new Wall(100, 375, 50, 125), new Wall(100, 325, 250, 50), 
                        new Wall(400, 250, 50, 50)],
                        enemies: [new Enemy(200, 425, 25, 25), new Enemy(500, 112, 25, 25)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 0), new Exit(675, 212, 25, 75, 35, 237, 3, 0)], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)]
                    };
                    break;
                
                case 3:
                    level = {
                        walls: [new Wall(250, 0, 50, 125), new Wall(250, 125, 300, 50), new Wall(400, 300, 50, 75)],
                        enemies: [new Enemy(500, 75, 25, 25), new Enemy(475, 325, 25, 25)], 
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 2, 0), new Exit(312, 0, 75, 25, 337, 440, 3, 1),
                        new Exit(675, 212, 25, 75, 35, 237, 4, 0)],
                        items: []
                    };
                    if(prev_loc_x === 4 && prev_loc_y === 0){
                        level.enemies = [new Enemy(500, 75, 25, 25), new Enemy(400, 325, 25, 25)];
                    }
                    else if(prev_loc_x === 3 && prev_loc_y === 2){
                        level.enemies = [new Enemy(475, 325, 25, 25)];
                    }
                    break;

                case 4: 
                    level = {
                        walls: [new Wall(0, 150, 225, 50), new Wall(225, 0, 50, 200), new Wall(0, 300, 450, 50),
                        new Wall(425, 0, 50, 350)],
                        enemies: [new Enemy(340, 110, 25, 25, [], 'smart'), new MeleeEnemy(390, 75, 25, 25)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 3, 0), new Exit(312, 0, 75, 25, 337, 440, 4, 1, 'all enemies')], 
                        items: []
                    };
                    if(prev_loc_x === 4 && prev_loc_y === 1){
                        level.enemies = [new MeleeEnemy(50, 225, 25, 25)];
                    }
                    break;
            }
            break;

        // Column 2
        case 1:
            switch(room_location[0]){
                case 0:
                    level = {
                        walls: [new Wall(0, 0, 700, 50), new Wall(650, 50, 50, 125), new Wall(650, 325, 50, 175), 
                        new Wall(0, 450, 650, 50), new Wall(0, 50, 50, 400)
                        ],
                        enemies: [new FirstBoss(125, 225, 50, 50, [], 'standard', true)],
                        exits: [new Exit(675, 212, 25, 75, 35, 237, 1, 1, 'all enemies')], 
                        items: [new Item(300, 225, 25, 25, 'max health', 1, 'all enemies'), new Item(350, 225, 25, 25, 'max health', 1, 'all enemies'),
                        new Item(300, 175, 25, 25, 'ammo', 1, 'all enemies'), new Item(350, 175, 25, 25, 'full heal', 1, 'all enemies')]
                    };
                    break;
                
                case 1:
                    level = {
                        walls: [new Wall(100, 75, 500, 50), new Wall(100, 375, 500, 50)],
                        enemies: [new MeleeEnemy(350, 225, 25, 25, [], 'strong'), new SniperEnemy(100, 225, 25, 25, [], 'strong'), 
                        new Enemy(100, 25, 25, 25, [[100, 25], [475, 25]], 'strong'), new Enemy(100, 450, 25, 25, [[100, 450,], [475, 450]], 'strong')],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 0, 1), new Exit(675, 212, 25, 75, 35, 237, 2, 1)], 
                        items: [new Item(350, 225, 25, 25, 'full heal', 1, 'all enemies'), new Item(300, 225, 25, 25, 'ammo', 1, 'all enemies'),
                        new Item(325, 250, 25, 25, 'ammo', 1, 'all enemies')
                        ]
                     };
                     if(prev_loc_x === 0 && prev_loc_y === 1){
                        level.enemies = [];
                     }
                    break;
                
                case 2:
                    level = {
                        walls: [new Wall(550, 150, 50, 200), new Wall(100, 150, 50, 200)],
                        enemies: [new Enemy(150, 75, 25, 25, [[150, 75], [500, 75]], 'strong'), new Enemy(500, 400, 25, 25, [[500, 75], [150, 75]], 'strong')],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 1), new Exit(675, 212, 25, 75, 35, 237, 3, 1)],
                        items: [new Item(-26, -26, 25, 25, 'heal', 1, 'in enemy', 0), new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 1)]
                    };
                    if(prev_loc_x === 1 && prev_loc_y === 1){
                        level.enemies = [];
                    }
                    break;

                case 3:
                    level = {
                        walls: [new Wall(260, 420, 40, 80), new Wall(400, 420, 40, 80), 
                        new Wall(225, 330, 250, 40), new Wall(260, 0, 40, 80), new Wall(400, 0, 40, 80)
                        ],
                        enemies: [new SniperEnemy(50, 20, 25, 25), new SniperEnemy(625, 20, 25, 25), 
                        new MeleeEnemy(337, 200, 25, 25)
                        ],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 3, 0), new Exit(312, 0, 75, 25, 337, 440, 3, 2), 
                        new Exit(0, 212, 25, 75, 640, 237, 2, 1)
                        ], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 1)]
                    };
                    break;

                case 4:
                    level = {
                        walls: [new Wall(225, 0, 50, 500), new Wall(425, 0, 50, 500)],
                        enemies: [new Enemy(300, 75, 25, 25), new Enemy(375, 75, 25, 25), new MeleeEnemy(337, 100, 25, 25)],
                        exits: [new Exit(312, 0, 75, 25, 337, 440, 4, 2), new Exit(312, 475, 75, 25, 337, 35, 4, 0)], 
                        items: [new Item(-10, -10, 25, 25, 'heal', 1, 'in enemy', 2)]
                    };
                    if(prev_loc_x === 4 && prev_loc_y === 2){
                        level.enemies = []
                    }
                    break;
            }
            break;

        // Column 3
        case 2:
            switch(room_location[0]){
                case 0:
                    level = {
                        walls: [new Wall(250, 0, 50, 300), new Wall(250, 300, 450, 50), new Wall(400, 0, 50, 200),
                        new Wall(450, 150, 250, 50)
                        ],
                        enemies: [new Enemy(420, 250, 25, 25), new MeleeEnemy(325, 75, 15, 15, [], 'small'), 
                        new MeleeEnemy(350, 75, 15, 15, [], 'small')],
                        exits: [new Exit(312, 0, 75, 25, 337, 440, 0, 3, 'key'), new Exit(675, 212, 25, 75, 35, 237, 1, 2)], 
                        items: []
                    };
                    if(prev_loc_x === 0 && prev_loc_y === 3){
                        level.enemies = [];
                    }
                    break;

                case 1:
                    level = {
                        walls: [new Wall(260, 0, 40, 80), new Wall(400, 0, 40, 80), 
                        new Wall(0, 160, 80, 40), new Wall(0, 300, 700, 40), new Wall(620, 160, 80, 40)],
                        enemies: [new RocketEnemy(350, 250, 25, 25, [], 'strong')],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 0, 2, 'key'), new Exit(675, 212, 25, 75, 35, 237, 2, 2), 
                        new Exit(312, 0, 75, 25, 337, 440, 1, 3)
                        ], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)]
                    };
                    break;

                case 2:
                    level = {
                        walls: [new Wall(450, 200, 25, 100)],
                        enemies: [new RocketEnemy(350, 250, 25, 25, [], 'strong', true), new MeleeEnemy(500, 210, 25, 25, [], 'strong', true), 
                        new MeleeEnemy(500, 260, 25, 25, [], 'strong', true), new MeleeEnemy(300, 300, 25, 25, [], 'strong', true)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 2, 'all enemies')], 
                        items: [new Item(325, 250, 25, 25, 'full heal', 1, 'all enemies'), new Item(375, 250, 25, 25, 'max health', 1, 'all enemies'), 
                        new Item(362, 300, 10, 25, 'key', 1, 'all enemies'), new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)]
                    };
                    break;

                case 3:
                    level = {
                        walls: [new Wall(260, 420, 40, 80), new Wall(400, 420, 40, 80), 
                        new Wall(260, 0, 40, 80), new Wall(400, 0, 40, 80)
                        ],
                        enemies: [new Enemy(100, 150, 25, 25, [], 'strong'), new Enemy(575, 150, 25, 25, [], 'strong')],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 3, 1), new Exit(312, 0, 75, 25, 337, 440, 3, 3)], 
                        items: [new Item(350, 250, 25, 25, 'ammo', 1)
                        ]
                    };
                    break;

                case 4:
                    level = {
                        walls: [new Wall(225, 400, 50, 100), new Wall(425, 400, 50, 100), new Wall(100, 0, 50, 400),
                        new Wall(550, 0, 50, 400), new Wall(100, 400, 125, 50), new Wall(475, 400, 125, 50), 
                        new Wall(150, 0, 400, 50)
                        ],
                        enemies: [new Enemy(337, 75, 25, 25, [], 'elite', true)],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 4, 1, 'all enemies')],
                        items: [new Item(-10, -10, 25, 25, 'max health', 1, 'in enemy', 0), 
                        new Item(350, 250, 25, 25, 'ammo', 1, 'all enemies')
                        ]
                    };
                    break;
            }
            break;

        // Column 4
        case 3:
            switch(room_location[0]){
                case 0:
                    level = {
                        walls: [new Wall(250, 0, 50, 100), new Wall(250, 400, 50, 100), new Wall(400, 400, 50, 100), 
                        new Wall(400, 0, 50, 100), new Wall(50, 100, 250, 50), new Wall(400, 100, 250, 50), 
                        new Wall(50, 350, 250, 50), new Wall(400, 350, 250, 50), new Wall(50, 150, 50, 200),
                        new Wall(600, 150, 50, 200), new Wall(275, 275, 25, 75), new Wall(400, 275, 25, 75)
                        ],
                        enemies: [new SniperEnemy(335, 75, 25, 25, [], 'elite'), new MeleeEnemy(160, 300, 15, 15, [], 'small'),
                        new MeleeEnemy(190, 300, 15, 15, [], 'small'), new MeleeEnemy(135, 300, 15, 15, [], 'small'), 
                        new MeleeEnemy(525, 300, 15, 15, [], 'small'), new MeleeEnemy(495, 300, 15, 15, [], 'small'), 
                        new MeleeEnemy(550, 300, 15, 15, [], 'small')
                        ],
                        exits: [new Exit(312, 0, 75, 25, 337, 440, 0, 4), new Exit(312, 475, 75, 25, 337, 35, 0, 2)], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)]
                    };
                    if(prev_loc_x === 0 && prev_loc_y === 4){
                        level.enemies = [];
                    }
                    else{
                        level.enemies[0].prb_lead_shot = 0;
                    }
                    break;

                case 1:
                    level = {
                        walls: [new Wall(260, 300, 40, 200), new Wall(400, 300, 40, 200)],
                        enemies: [new Enemy(50, 50, 25, 25, [], 'elite'), new MeleeEnemy(320, 400, 25, 25, [], 'elite')],
                        exits: [new Exit(675, 212, 25, 75, 35, 237, 2, 3), new Exit(312, 475, 75, 25, 337, 35, 1, 2)], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0), new Item(-26, -26, 25, 25, 'heal', 1, 'in enemy', 1)]
                    };
                    if(prev_loc_x === 1 && prev_loc_y === 2){
                        level.enemies = [new Enemy(50, 50, 25, 25, [], 'elite')];
                    }
                    break;

                case 2:
                    level = {
                        walls: [new Wall(100, 75, 25, 100), new Wall(100, 325, 25, 100), new Wall(600, 200, 25, 100)],
                        enemies: [new RocketEnemy(150, 225, 25, 25), new SniperEnemy(100, 25, 25, 25, [[100, 25], [500, 25]]),
                        new SniperEnemy(100, 450, 25, 25, [[100, 450], [500, 450]], 'strong')],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 3), new Exit(675, 212, 25, 75, 35, 237, 3, 3)], 
                        items: [new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)]
                    };
                    if(prev_loc_x === 1 && prev_loc_y === 3){
                        level.enemies = [new RocketEnemy(150, 225, 25, 25)];
                    }
                    break;

                case 3:
                    level = {
                        walls: [new Wall(260, 300, 40, 200), new Wall(400, 300, 40, 200), 
                        new Wall(260, 0, 40, 200), new Wall(400, 0, 40, 200), new Wall(0, 160, 260, 40),
                        new Wall(0, 300, 260, 40), new Wall(440, 160, 260, 40), new Wall(440, 300, 260, 40)
                        ],
                        enemies: [],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 3, 2, 'permanent'), new Exit(312, 0, 75, 25, 337, 440, 3, 4, 'big key'), 
                        new Exit(0, 212, 25, 75, 640, 237, 2, 3), new Exit(675, 212, 25, 75, 35, 237, 4, 3)
                        ], 
                        items: [new Item(338, 238, 25, 25, 'heal', 1)]
                    };
                    break;

                case 4:
                    level = {
                        walls: [new Wall(300, 175, 50, 50), new Wall(325, 350, 50, 50)],
                        enemies: [new RocketEnemy(400, 225, 25, 25, [], 'elite', true), new SniperEnemy(650, 300, 25, 25, [], 'elite', true),
                        new Enemy(375, 200, 25, 25, [], 'strong', true)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 3, 3, 'all enemies')], 
                        items: [new Item(325, 250, 25, 25, 'full heal', 1, 'all enemies'), new Item(375, 250, 25, 25, 'max health', 1, 'all enemies'), 
                        new Item(362, 300, 10, 25, 'key', 1, 'all enemies'), new Item(-26, -26, 25, 25, 'ammo', 1, 'in enemy', 0)
                        ]
                    };
                    break;
            }
            break;

        // Column 5
        case 4:
            switch(room_location[0]){
                case 0:
                    level = {
                        walls: [new Wall(250, 50, 50, 450), new Wall(400, 400, 50, 100), new Wall(600, 150, 100, 50),
                        new Wall(600, 300, 100, 50)
                        ],
                        enemies: [new MeleeEnemy(25, 450, 15, 15, [], 'small'), new MeleeEnemy(60, 425, 15, 15, [], 'small'), 
                        new MeleeEnemy(100, 450, 15, 15, [], 'small'), new MeleeEnemy(75, 400, 15, 15, [], 'small'),
                        new MeleeEnemy(10, 400, 15, 15, [], 'small'), new MeleeEnemy(25, 475, 15, 15, [], 'small'), 
                        new MeleeEnemy(125, 475, 15, 15, [], 'small'), new MeleeEnemy(100, 425, 15, 15, [], 'small'),
                        new MeleeEnemy(75, 375, 15, 15, [], 'small'), new MeleeEnemy(10, 375, 15, 15, [], 'small'), 
                        new MeleeEnemy(125, 375, 15, 15, [], 'small'), new MeleeEnemy(20, 350, 15, 15, [], 'small'),
                        new RocketEnemy(500, 425, 25, 25, [], 'elite'), new SniperEnemy(600, 50, 25, 25, [], 'strong')
                        ],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 0, 3), new Exit(675, 212, 25, 75, 35, 225, 1, 4)], 
                        items: []
                    };
                    if(prev_loc_x === 1 && prev_loc_y === 4){
                        level.enemies = [];
                    }
                    break;

                case 1:
                    level = {
                        walls: [new Wall(0, 150, 700, 50), new Wall(0, 300, 700, 50)],
                        enemies: [],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 0, 4), new Exit(675, 212, 25, 75, 35, 237, 2, 4)], 
                        items: [new Item(325, 212, 25, 25, 'ammo', 1), new Item(375, 212, 25, 25, 'ammo', 1), 
                        new Item(325, 262, 25, 25, 'ammo', 1), new Item(375, 262, 25, 25, 'full heal', 1)
                        ]
                    };
                    break;

                case 2:
                    level = {
                        walls: [new Wall(0, 150, 100, 50), new Wall(0, 300, 100, 50), new Wall(100, 0, 550, 50),
                        new Wall(650, 0, 50, 500), new Wall(100, 450, 550, 50), new Wall(100, 50, 50, 150), 
                        new Wall(100, 300, 50, 150)
                        ],
                        enemies: [new SpawnerBoss(450, 225, 50, 50, [], 'spawner boss', true)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 4, 'all enemies')], 
                        items: [new Item(-26, -26, 10, 25, 'big key', 1, 'in enemy', 0), 
                        new Item(325, 225, 25, 25, 'max health', 1, 'all enemies'), 
                        new Item(375, 225, 25, 25, 'max health', 1, 'all enemies')
                        ]
                    };
                    break;

                case 3:
                    level = {
                        walls: [new Wall(250, 150, 50, 350), new Wall(300, 150, 400, 50), new Wall(400, 300, 50, 200),
                        new Wall(450, 300, 250, 50)
                        ],
                        enemies: [],
                        exits: [new Exit(312, 475, 75, 25, 337, 35, 3, 3, 'permanent'), new Exit(675, 212, 25, 75, 35, 237, 4, 4)],
                        items: [new Item(337, 350, 25, 25, 'full heal', 1), new Item(505, 217, 25, 25, 'ammo', 1), 
                        new Item(545, 217, 25, 25, 'ammo', 1), new Item(505, 257, 25, 25, 'ammo', 1), 
                        new Item(545, 257, 25, 25, 'ammo', 1)
                        ]
                    };
                    break;

                case 4:
                    level = {
                        walls: [new Wall(0, 150, 50, 50), new Wall(0, 300, 50, 50), new Wall(25, 0, 25, 150),
                        new Wall(25, 0, 650, 25), new Wall(675, 0, 25, 475), new Wall(25, 475, 675, 25), 
                        new Wall(25, 350, 25, 125), new Wall(225, 125, 50, 50), new Wall(450, 125, 50, 50),
                        new Wall(225, 325, 50, 50), new Wall(450, 325, 50, 50)
                        ],
                        enemies: [new FinalBoss(500, 237, 25, 25)],
                        exits: [new Exit(0, 212, 25, 75, 640, 237, 1, 4, 'permanantly')], 
                        items: []
                    };
                    break;
            }
            break;            
    }

    return level;
}
