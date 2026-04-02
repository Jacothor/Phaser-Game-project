export const CASING_DATA = {
  crude_wood_casing: {
    id: "crude_wood_casing",
    name: "Crude Wood Casing",
    tier: 1,
    slotCount: 3,

    slots: [
      { id: "s0" },
      { id: "s1" },
      { id: "s2" }
    ],

    links: [
      ["s0", "s1"],
      ["s1", "s2"]
    ]
  },

  forked_wood_casing: {
    id: "forked_wood_casing",
    name: "Forked Wood Casing",
    tier: 2,
    slotCount: 4,

    slots: [
      { id: "s0" },
      { id: "s1" },
      { id: "s2" },
      { id: "s3" }
    ],

    links: [
      ["s0", "s1"],
      ["s1", "s2"],
      ["s1", "s3"]
    ]
  },

  circle_bone_casing: {
    id: "circle_bone_casing",
    name: "Circle Bone Casing",
    tier: 3,
    slotCount: 4,

    slots: [
      { id: "s0" },
      { id: "s1" },
      { id: "s2" },
      { id: "s3" }
    ],

    links: [
      ["s0", "s1"],
      ["s1", "s2"],
      ["s2", "s3"],
      ["s3", "s0"]
    ]
  }
};