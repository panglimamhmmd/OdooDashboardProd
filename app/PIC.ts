export const PIC_MAP = {
  "SENTUL RAQUET CLUB": {
    ARCH: "Malazi",
    INTR: "Aviva",
    DRFT: "Aldi",
    PM: "Pak Dar",
    PGWS: "Ujang",
  },
  "Project Lain": {
    ARCH: "Budi",
    INTR: "Sinta",
    DRFT: "Rizal",
    PM: "Andi",
    PGWS: "Tono",
  },
} as const;

export type ProjectName = keyof typeof PIC_MAP;
export type ProjectPIC = typeof PIC_MAP[ProjectName];
