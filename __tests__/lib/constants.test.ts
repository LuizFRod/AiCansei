import {
  CATEGORY_LABELS,
  CONDITION_LABELS,
  AVAILABILITY_LABELS,
  STATUS_LABELS,
  ROLE_LABELS,
  ITEMS_PER_PAGE,
} from "@/lib/constants";

// ─── CATEGORY_LABELS ────────────────────────────────────────────────────────

describe("CATEGORY_LABELS", () => {
  it("has all 8 categories", () => {
    expect(Object.keys(CATEGORY_LABELS)).toHaveLength(8);
  });

  it("maps MOVEIS to Móveis", () => {
    expect(CATEGORY_LABELS.MOVEIS).toBe("Móveis");
  });

  it("maps ROUPAS to Roupas", () => {
    expect(CATEGORY_LABELS.ROUPAS).toBe("Roupas");
  });

  it("maps ELETRONICOS to Eletrônicos", () => {
    expect(CATEGORY_LABELS.ELETRONICOS).toBe("Eletrônicos");
  });

  it("maps LIVROS to Livros", () => {
    expect(CATEGORY_LABELS.LIVROS).toBe("Livros");
  });

  it("maps BRINQUEDOS to Brinquedos", () => {
    expect(CATEGORY_LABELS.BRINQUEDOS).toBe("Brinquedos");
  });

  it("maps ESPORTES to Esportes", () => {
    expect(CATEGORY_LABELS.ESPORTES).toBe("Esportes");
  });

  it("maps CASA to Casa", () => {
    expect(CATEGORY_LABELS.CASA).toBe("Casa");
  });

  it("maps OUTROS to Outros", () => {
    expect(CATEGORY_LABELS.OUTROS).toBe("Outros");
  });

  it("has no extra keys beyond the expected 8", () => {
    const expectedKeys = [
      "MOVEIS", "ROUPAS", "ELETRONICOS", "LIVROS",
      "BRINQUEDOS", "ESPORTES", "CASA", "OUTROS",
    ];
    expect(Object.keys(CATEGORY_LABELS).sort()).toEqual(expectedKeys.sort());
  });

  it("all values are non-empty strings", () => {
    for (const [key, value] of Object.entries(CATEGORY_LABELS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

// ─── CONDITION_LABELS ────────────────────────────────────────────────────────

describe("CONDITION_LABELS", () => {
  it("has all 4 conditions", () => {
    expect(Object.keys(CONDITION_LABELS)).toHaveLength(4);
  });

  it("maps NOVO to Novo", () => {
    expect(CONDITION_LABELS.NOVO).toBe("Novo");
  });

  it("maps OTIMO to Ótimo", () => {
    expect(CONDITION_LABELS.OTIMO).toBe("Ótimo");
  });

  it("maps BOM to Bom", () => {
    expect(CONDITION_LABELS.BOM).toBe("Bom");
  });

  it("maps REGULAR to Regular", () => {
    expect(CONDITION_LABELS.REGULAR).toBe("Regular");
  });

  it("has no extra keys", () => {
    expect(Object.keys(CONDITION_LABELS).sort()).toEqual([
      "BOM", "NOVO", "OTIMO", "REGULAR",
    ]);
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(CONDITION_LABELS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

// ─── AVAILABILITY_LABELS ─────────────────────────────────────────────────────

describe("AVAILABILITY_LABELS", () => {
  it("has all 3 availability options", () => {
    expect(Object.keys(AVAILABILITY_LABELS)).toHaveLength(3);
  });

  it("maps RETIRADA to Retirada no local", () => {
    expect(AVAILABILITY_LABELS.RETIRADA).toBe("Retirada no local");
  });

  it("maps ENTREGA to Entrega pelo doador", () => {
    expect(AVAILABILITY_LABELS.ENTREGA).toBe("Entrega pelo doador");
  });

  it("maps AMBAS to Ambas", () => {
    expect(AVAILABILITY_LABELS.AMBAS).toBe("Ambas");
  });

  it("has no extra keys", () => {
    expect(Object.keys(AVAILABILITY_LABELS).sort()).toEqual([
      "AMBAS", "ENTREGA", "RETIRADA",
    ]);
  });
});

// ─── STATUS_LABELS ───────────────────────────────────────────────────────────

describe("STATUS_LABELS", () => {
  it("has all 5 statuses", () => {
    expect(Object.keys(STATUS_LABELS)).toHaveLength(5);
  });

  it("maps PENDENTE to Pendente", () => {
    expect(STATUS_LABELS.PENDENTE).toBe("Pendente");
  });

  it("maps ATIVO to Ativo", () => {
    expect(STATUS_LABELS.ATIVO).toBe("Ativo");
  });

  it("maps DOADO to Doado", () => {
    expect(STATUS_LABELS.DOADO).toBe("Doado");
  });

  it("maps REJEITADO to Rejeitado", () => {
    expect(STATUS_LABELS.REJEITADO).toBe("Rejeitado");
  });

  it("maps EXPIRADO to Expirado", () => {
    expect(STATUS_LABELS.EXPIRADO).toBe("Expirado");
  });

  it("has no extra keys", () => {
    expect(Object.keys(STATUS_LABELS).sort()).toEqual([
      "ATIVO", "DOADO", "EXPIRADO", "PENDENTE", "REJEITADO",
    ]);
  });

  it("all values are non-empty strings", () => {
    for (const value of Object.values(STATUS_LABELS)) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

// ─── ROLE_LABELS ─────────────────────────────────────────────────────────────

describe("ROLE_LABELS", () => {
  it("has all 3 roles", () => {
    expect(Object.keys(ROLE_LABELS)).toHaveLength(3);
  });

  it("maps DOADOR to Doador", () => {
    expect(ROLE_LABELS.DOADOR).toBe("Doador");
  });

  it("maps RECEPTOR to Receptor", () => {
    expect(ROLE_LABELS.RECEPTOR).toBe("Receptor");
  });

  it("maps ADMIN to Administrador", () => {
    expect(ROLE_LABELS.ADMIN).toBe("Administrador");
  });

  it("has no extra keys", () => {
    expect(Object.keys(ROLE_LABELS).sort()).toEqual([
      "ADMIN", "DOADOR", "RECEPTOR",
    ]);
  });
});

// ─── ITEMS_PER_PAGE ──────────────────────────────────────────────────────────

describe("ITEMS_PER_PAGE", () => {
  it("is set to 12", () => {
    expect(ITEMS_PER_PAGE).toBe(12);
  });

  it("is a positive integer", () => {
    expect(Number.isInteger(ITEMS_PER_PAGE)).toBe(true);
    expect(ITEMS_PER_PAGE).toBeGreaterThan(0);
  });
});

// ─── Cross-mapping consistency ───────────────────────────────────────────────

describe("label mapping consistency", () => {
  it("every CATEGORY_LABELS key is a valid category enum value", () => {
    const validCategories = [
      "MOVEIS", "ROUPAS", "ELETRONICOS", "LIVROS",
      "BRINQUEDOS", "ESPORTES", "CASA", "OUTROS",
    ];
    for (const key of Object.keys(CATEGORY_LABELS)) {
      expect(validCategories).toContain(key);
    }
  });

  it("every CONDITION_LABELS key is a valid condition enum value", () => {
    const validConditions = ["NOVO", "OTIMO", "BOM", "REGULAR"];
    for (const key of Object.keys(CONDITION_LABELS)) {
      expect(validConditions).toContain(key);
    }
  });

  it("all label values use proper capitalization (first letter uppercase)", () => {
    const allLabels = {
      ...CATEGORY_LABELS,
      ...CONDITION_LABELS,
      ...AVAILABILITY_LABELS,
      ...STATUS_LABELS,
      ...ROLE_LABELS,
    };
    for (const [key, value] of Object.entries(allLabels)) {
      expect(value[0]).toBe(value[0].toUpperCase());
    }
  });

  it("no label values are empty strings", () => {
    const allLabels = {
      ...CATEGORY_LABELS,
      ...CONDITION_LABELS,
      ...AVAILABILITY_LABELS,
      ...STATUS_LABELS,
      ...ROLE_LABELS,
    };
    for (const [key, value] of Object.entries(allLabels)) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it("no duplicate values within CATEGORY_LABELS", () => {
    const values = Object.values(CATEGORY_LABELS);
    expect(new Set(values).size).toBe(values.length);
  });

  it("no duplicate values within CONDITION_LABELS", () => {
    const values = Object.values(CONDITION_LABELS);
    expect(new Set(values).size).toBe(values.length);
  });

  it("no duplicate values within ROLE_LABELS", () => {
    const values = Object.values(ROLE_LABELS);
    expect(new Set(values).size).toBe(values.length);
  });
});
