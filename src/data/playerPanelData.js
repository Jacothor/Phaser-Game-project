export const PLAYER_STATES = {
    IDLE:"idle",
    WALK:"walk",
    SWORDIDLE:"swordIdle",
    DIE:"die",
    GUARD:"guard",
    DAMAGE:"damage",
    SWORDSLASH:"swordSlash"
}

export const PLAYER_ASSETS = {
    idle: [
        { key: 'player-idle-1', path: 'assets/player/idle/Idle01.png' },
        { key: 'player-idle-2', path: 'assets/player/idle/Idle02.png' },
        { key: 'player-idle-3', path: 'assets/player/idle/Idle03.png' },
        { key: 'player-idle-4', path: 'assets/player/idle/Idle04.png' },
        { key: 'player-idle-5', path: 'assets/player/idle/Idle05.png' },
        { key: 'player-idle-6', path: 'assets/player/idle/Idle06.png' },
        { key: 'player-idle-7', path: 'assets/player/idle/Idle07.png' }
    ],
    walk: [
        { key: 'player-walk-1', path: 'assets/player/walk/Walk01.png' },
        { key: 'player-walk-2', path: 'assets/player/walk/Walk02.png' },
        { key: 'player-walk-3', path: 'assets/player/walk/Walk03.png' },
        { key: 'player-walk-4', path: 'assets/player/walk/Walk04.png' },
        { key: 'player-walk-5', path: 'assets/player/walk/Walk05.png' },
        { key: 'player-walk-6', path: 'assets/player/walk/Walk06.png' },
        { key: 'player-walk-7', path: 'assets/player/walk/Walk07.png' },
        { key: 'player-walk-8', path: 'assets/player/walk/Walk08.png' }
    ],
    die: [
        { key: 'player-die-1', path: 'assets/player/Die/Die01.png' },
        { key: 'player-die-2', path: 'assets/player/Die/Die02.png' },
        { key: 'player-die-3', path: 'assets/player/Die/Die03.png' },
        { key: 'player-die-4', path: 'assets/player/Die/Die04.png' },
        { key: 'player-die-5', path: 'assets/player/Die/Die05.png' },
        { key: 'player-die-6', path: 'assets/player/Die/Die06.png' },
        { key: 'player-die-7', path: 'assets/player/Die/Die07.png' },
        { key: 'player-die-8', path: 'assets/player/Die/Die08.png' },
        { key: 'player-die-9', path: 'assets/player/Die/Die09.png' }
    ],
    guard: [
        { key: 'player-guard-1', path: 'assets/player/GuardImpact/GuardImpact01.png' },
        { key: 'player-guard-2', path: 'assets/player/GuardImpact/GuardImpact02.png' },
        { key: 'player-guard-3', path: 'assets/player/GuardImpact/GuardImpact03.png' }
    ],
    damage: [
        { key: 'player-damage-1', path: 'assets/player/Hit/Hit01.png' },
        { key: 'player-damage-2', path: 'assets/player/Hit/Hit02.png' },
        { key: 'player-damage-3', path: 'assets/player/Hit/Hit03.png' }
    ],
    swordIdle: [
        { key: 'player-swordIdle-1', path: 'assets/player/SwordIdle/SwordIdle01.png' },
        { key: 'player-swordIdle-2', path: 'assets/player/SwordIdle/SwordIdle02.png' },
        { key: 'player-swordIdle-3', path: 'assets/player/SwordIdle/SwordIdle03.png' },
        { key: 'player-swordIdle-4', path: 'assets/player/SwordIdle/SwordIdle04.png' },
        { key: 'player-swordIdle-5', path: 'assets/player/SwordIdle/SwordIdle05.png' },
        { key: 'player-swordIdle-6', path: 'assets/player/SwordIdle/SwordIdle06.png' },
        { key: 'player-swordIdle-7', path: 'assets/player/SwordIdle/SwordIdle07.png' }
    ],
    swordSlash: [
        { key: 'player-swordSlash-1', path: 'assets/player/SwordSlash01/SwordSlash0101.png' },
        { key: 'player-swordSlash-2', path: 'assets/player/SwordSlash01/SwordSlash0102.png' },
        { key: 'player-swordSlash-3', path: 'assets/player/SwordSlash01/SwordSlash0103.png' },
        { key: 'player-swordSlash-4', path: 'assets/player/SwordSlash01/SwordSlash0104.png' },
        { key: 'player-swordSlash-5', path: 'assets/player/SwordSlash01/SwordSlash0105.png' },
        { key: 'player-swordSlash-6', path: 'assets/player/SwordSlash01/SwordSlash0106.png' },
        { key: 'player-swordSlash-7', path: 'assets/player/SwordSlash01/SwordSlash0107.png' },
        { key: 'player-swordSlash-8', path: 'assets/player/SwordSlash01/SwordSlash0108.png' }
    ]
};

export const PLAYER_ANIMATIONS = {
    idle: {
        key: 'player-idle',
        frameRate: 8,
        repeat: -1,
        frames: [
            'player-idle-1',
            'player-idle-2',
            'player-idle-3',
            'player-idle-4',
            'player-idle-5',
            'player-idle-6',
            'player-idle-7'
        ]
    },
    walk: {
        key: 'player-walk',
        frameRate: 10,
        repeat: -1,
        frames: [
            'player-walk-1',
            'player-walk-2',
            'player-walk-3',
            'player-walk-4',
            'player-walk-5',
            'player-walk-6',
            'player-walk-7',
            'player-walk-8'
        ]
    },
    die: {
        key: 'player-die',
        frameRate: 10,
        repeat: 0,
        frames: [
            'player-die-1',
            'player-die-2',
            'player-die-3',
            'player-die-4',
            'player-die-5',
            'player-die-6',
            'player-die-7',
            'player-die-8',
            'player-die-9'
        ]
    },
    guard: {
        key: 'player-guard',
        frameRate: 10,
        repeat: 0,
        frames: [
            'player-guard-1',
            'player-guard-2',
            'player-guard-3'
        ]
    },
    damage: {
        key: 'player-damage',
        frameRate: 10,
        repeat: 0,
        frames: [
            'player-damage-1',
            'player-damage-2',
            'player-damage-3'
        ]
    },
    swordIdle: {
        key: 'player-swordIdle',
        frameRate: 10,
        repeat: -1,
        frames: [
            'player-swordIdle-1',
            'player-swordIdle-2',
            'player-swordIdle-3',
            'player-swordIdle-4',
            'player-swordIdle-5',
            'player-swordIdle-6',
            'player-swordIdle-7'
        ]
    },
    swordSlash: {
        key: 'player-swordSlash',
        frameRate: 10,
        repeat: 0,
        frames: [
            'player-swordSlash-1',
            'player-swordSlash-2',
            'player-swordSlash-3',
            'player-swordSlash-4',
            'player-swordSlash-5',
            'player-swordSlash-6',
            'player-swordSlash-7',
            'player-swordSlash-8'
        ]
    }
};

export const PLAYER_CONFIG = {
    scale: 2,
    defaultState: PLAYER_STATES.IDLE
};