export const ENEMY_DATA = {
  gray_wolf: {
    ID: "gray_wolf",
    name: "Gray Wolf",
    path: "assets/enemies/Wolf_Gray_Full_FX.png",
    frameWidth: 80,
    frameHeight: 64,

    enemyType: "wolf",
    vitaTier: 1,

    syphon: {
      baseChance: 0.35,
      chargesMin: 1,
      chargesMax: 3
    },

    health: 6,
    strength: 2,
    attack: 3,
    defense: 2,
    speed: 2,
    accuracy: 1,
    evasion: 1,
    exp: 3,

    anims: {
      attack: {
        key: "attack",
        frameStart: 21,
        frameEnd: 28,
        frameRate: 10,
        repeat: 0
      },
      howl: {
        key: "howl",
        frameStart: 4,
        frameEnd: 13,
        frameRate: 10,
        repeat: 0
      },
      show_teeth: {
        key: "show_teeth",
        frameStart: 14,
        frameEnd: 21,
        frameRate: 10,
        repeat: 0
      },
      death: {
        key: "die",
        frameStart: 39,
        frameEnd: 46,
        frameRate: 10,
        repeat: 0
      },
      idle: {
        key: "idle",
        frameStart: 0,
        frameEnd: 3,
        frameRate: 6,
        repeat: -1
      }
    },

    skills: {
      bite: {
        id: "bite",
        name: "Bite",
        anim: "attack",
        chance: "high",
        effects: {
          damage: 3
        }
      },
      howl: {
        id: "howl",
        name: "Howl",
        anim: "howl",
        chance: "medium",
        effects: {
          buffSelfAttack: 1
        }
      },
      intimidate: {
        id: "intimidate",
        name: "Show Teeth",
        anim: "show_teeth",
        chance: "low",
        effects: {
          debuffTargetDefense: 1
        }
      }
    }
  }
};