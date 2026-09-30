import {
  loginSchema,
  registerSchema,
  announcementSchema,
  manifestationSchema,
  reviewSchema,
  profileSchema,
  moderationSchema,
} from "@/lib/validations";

// ─── loginSchema ─────────────────────────────────────────────────────────────

describe("loginSchema", () => {
  const validLogin = {
    email: "user@example.com",
    password: "123456",
  };

  it("accepts valid login data", () => {
    const result = loginSchema.safeParse(validLogin);
    expect(result.success).toBe(true);
  });

  it("rejects invalid email format", () => {
    const result = loginSchema.safeParse({ ...validLogin, email: "not-email" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("E-mail inválido");
    }
  });

  it("rejects empty email", () => {
    const result = loginSchema.safeParse({ ...validLogin, email: "" });
    expect(result.success).toBe(false);
  });

  it("rejects password shorter than 6 characters", () => {
    const result = loginSchema.safeParse({ ...validLogin, password: "12345" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Senha deve ter pelo menos 6 caracteres"
      );
    }
  });

  it("accepts password with exactly 6 characters", () => {
    const result = loginSchema.safeParse({ ...validLogin, password: "123456" });
    expect(result.success).toBe(true);
  });

  it("accepts long password", () => {
    const result = loginSchema.safeParse({
      ...validLogin,
      password: "a".repeat(128),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing email field", () => {
    const result = loginSchema.safeParse({ password: "123456" });
    expect(result.success).toBe(false);
  });

  it("rejects missing password field", () => {
    const result = loginSchema.safeParse({ email: "test@test.com" });
    expect(result.success).toBe(false);
  });
});

// ─── registerSchema ──────────────────────────────────────────────────────────

describe("registerSchema", () => {
  const validRegister = {
    name: "Maria Silva",
    email: "maria@example.com",
    password: "123456",
    confirmPassword: "123456",
  };

  it("accepts valid registration data", () => {
    const result = registerSchema.safeParse(validRegister);
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: "Ma" });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe(
        "Nome deve ter pelo menos 3 caracteres"
      );
    }
  });

  it("accepts name with exactly 3 characters", () => {
    const result = registerSchema.safeParse({ ...validRegister, name: "Mar" });
    expect(result.success).toBe(true);
  });

  it("rejects mismatched passwords", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      confirmPassword: "654321",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const confirmError = result.error.issues.find(
        (i) => i.path.includes("confirmPassword")
      );
      expect(confirmError?.message).toBe("As senhas não coincidem");
    }
  });

  it("rejects invalid email", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      email: "invalid",
    });
    expect(result.success).toBe(false);
  });

  it("rejects short password", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "12345",
      confirmPassword: "12345",
    });
    expect(result.success).toBe(false);
  });

  it("accepts strong password", () => {
    const result = registerSchema.safeParse({
      ...validRegister,
      password: "StrongP@ss1!",
      confirmPassword: "StrongP@ss1!",
    });
    expect(result.success).toBe(true);
  });

  it("rejects when confirmPassword is missing", () => {
    const { confirmPassword, ...rest } = validRegister;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects when name is missing", () => {
    const { name, ...rest } = validRegister;
    const result = registerSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─── announcementSchema ──────────────────────────────────────────────────────

describe("announcementSchema", () => {
  const validAnnouncement = {
    title: "Sofá em ótimo estado",
    description: "Sofá de 3 lugares, cor cinza, usado por 2 anos",
    category: "MOVEIS",
    condition: "OTIMO",
    availability: "RETIRADA",
    city: "São Paulo",
    state: "SP",
  };

  it("accepts valid announcement data", () => {
    const result = announcementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
  });

  it("accepts all valid categories", () => {
    const categories = [
      "MOVEIS", "ROUPAS", "ELETRONICOS", "LIVROS",
      "BRINQUEDOS", "ESPORTES", "CASA", "OUTROS",
    ];
    for (const category of categories) {
      const result = announcementSchema.safeParse({
        ...validAnnouncement,
        category,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid conditions", () => {
    const conditions = ["NOVO", "OTIMO", "BOM", "REGULAR"];
    for (const condition of conditions) {
      const result = announcementSchema.safeParse({
        ...validAnnouncement,
        condition,
      });
      expect(result.success).toBe(true);
    }
  });

  it("accepts all valid availability options", () => {
    const options = ["RETIRADA", "ENTREGA", "AMBAS"];
    for (const availability of options) {
      const result = announcementSchema.safeParse({
        ...validAnnouncement,
        availability,
      });
      expect(result.success).toBe(true);
    }
  });

  it("rejects title shorter than 5 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      title: "Abc",
    });
    expect(result.success).toBe(false);
  });

  it("rejects title longer than 100 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      title: "A".repeat(101),
    });
    expect(result.success).toBe(false);
  });

  it("accepts title with exactly 5 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      title: "Abcde",
    });
    expect(result.success).toBe(true);
  });

  it("accepts title with exactly 100 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      title: "A".repeat(100),
    });
    expect(result.success).toBe(true);
  });

  it("rejects description shorter than 10 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      description: "Short",
    });
    expect(result.success).toBe(false);
  });

  it("rejects description longer than 2000 characters", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      description: "A".repeat(2001),
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid category", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      category: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid condition", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      condition: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid availability", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      availability: "INVALID",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing city", () => {
    const { city, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing state", () => {
    const { state, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("accepts optional address", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      address: "Rua das Flores, 123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts optional latitude and longitude", () => {
    const result = announcementSchema.safeParse({
      ...validAnnouncement,
      latitude: -23.5505,
      longitude: -46.6333,
    });
    expect(result.success).toBe(true);
  });

  it("accepts announcement without optional fields", () => {
    const result = announcementSchema.safeParse(validAnnouncement);
    expect(result.success).toBe(true);
  });

  it("rejects missing title", () => {
    const { title, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing description", () => {
    const { description, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing category", () => {
    const { category, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });

  it("rejects missing condition", () => {
    const { condition, ...rest } = validAnnouncement;
    const result = announcementSchema.safeParse(rest);
    expect(result.success).toBe(false);
  });
});

// ─── manifestationSchema ─────────────────────────────────────────────────────

describe("manifestationSchema", () => {
  const validManifestation = {
    announcementId: "clx1234567890",
    message: "Olá, tenho interesse neste item!",
  };

  it("accepts valid manifestation with message", () => {
    const result = manifestationSchema.safeParse(validManifestation);
    expect(result.success).toBe(true);
  });

  it("accepts manifestation without message", () => {
    const result = manifestationSchema.safeParse({
      announcementId: "clx1234567890",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty message", () => {
    const result = manifestationSchema.safeParse({
      ...validManifestation,
      message: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects message longer than 500 characters", () => {
    const result = manifestationSchema.safeParse({
      ...validManifestation,
      message: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts message with exactly 500 characters", () => {
    const result = manifestationSchema.safeParse({
      ...validManifestation,
      message: "A".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing announcementId", () => {
    const result = manifestationSchema.safeParse({ message: "Hello" });
    expect(result.success).toBe(false);
  });
});

// ─── reviewSchema ────────────────────────────────────────────────────────────

describe("reviewSchema", () => {
  const validReview = {
    rating: 5,
    comment: "Excelente doador, muito simpático!",
    reviewedId: "user123",
    donationId: "donation456",
  };

  it("accepts valid review data", () => {
    const result = reviewSchema.safeParse(validReview);
    expect(result.success).toBe(true);
  });

  it("accepts review without optional comment", () => {
    const result = reviewSchema.safeParse({
      rating: 4,
      reviewedId: "user123",
    });
    expect(result.success).toBe(true);
  });

  it("accepts review without optional donationId", () => {
    const result = reviewSchema.safeParse({
      rating: 3,
      reviewedId: "user123",
      comment: "Bom",
    });
    expect(result.success).toBe(true);
  });

  it("accepts rating of 1", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      rating: 1,
    });
    expect(result.success).toBe(true);
  });

  it("accepts rating of 5", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      rating: 5,
    });
    expect(result.success).toBe(true);
  });

  it("rejects rating of 0", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects rating of 6", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: 6 });
    expect(result.success).toBe(false);
  });

  it("rejects non-integer rating", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: 3.5 });
    expect(result.success).toBe(false);
  });

  it("rejects negative rating", () => {
    const result = reviewSchema.safeParse({ ...validReview, rating: -1 });
    expect(result.success).toBe(false);
  });

  it("rejects comment longer than 500 characters", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(501),
    });
    expect(result.success).toBe(false);
  });

  it("accepts comment with exactly 500 characters", () => {
    const result = reviewSchema.safeParse({
      ...validReview,
      comment: "A".repeat(500),
    });
    expect(result.success).toBe(true);
  });

  it("rejects missing reviewedId", () => {
    const result = reviewSchema.safeParse({ rating: 5 });
    expect(result.success).toBe(false);
  });

  it("rejects missing rating", () => {
    const result = reviewSchema.safeParse({ reviewedId: "user123" });
    expect(result.success).toBe(false);
  });
});

// ─── profileSchema ───────────────────────────────────────────────────────────

describe("profileSchema", () => {
  const validProfile = {
    name: "João Santos",
  };

  it("accepts valid profile with only name", () => {
    const result = profileSchema.safeParse(validProfile);
    expect(result.success).toBe(true);
  });

  it("accepts full profile with all fields", () => {
    const result = profileSchema.safeParse({
      name: "João Santos",
      phone: "(11) 99999-9999",
      address: "Rua Augusta, 1000",
      city: "São Paulo",
      state: "SP",
      photo: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("rejects name shorter than 3 characters", () => {
    const result = profileSchema.safeParse({ name: "Jo" });
    expect(result.success).toBe(false);
  });

  it("accepts name with exactly 3 characters", () => {
    const result = profileSchema.safeParse({ name: "Joo" });
    expect(result.success).toBe(true);
  });

  it("accepts valid URL for photo", () => {
    const result = profileSchema.safeParse({
      name: "Teste",
      photo: "https://example.com/photo.jpg",
    });
    expect(result.success).toBe(true);
  });

  it("accepts empty string for photo", () => {
    const result = profileSchema.safeParse({
      name: "Teste",
      photo: "",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid URL for photo", () => {
    const result = profileSchema.safeParse({
      name: "Teste",
      photo: "not-a-url",
    });
    expect(result.success).toBe(false);
  });

  it("accepts profile without optional fields", () => {
    const result = profileSchema.safeParse({ name: "Teste" });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = profileSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it("accepts all optional fields as undefined", () => {
    const result = profileSchema.safeParse({
      name: "Teste",
      phone: undefined,
      address: undefined,
      city: undefined,
      state: undefined,
      photo: undefined,
    });
    expect(result.success).toBe(true);
  });
});

// ─── moderationSchema ────────────────────────────────────────────────────────

describe("moderationSchema", () => {
  it("accepts ATIVO status without reason", () => {
    const result = moderationSchema.safeParse({ status: "ATIVO" });
    expect(result.success).toBe(true);
  });

  it("accepts REJEITADO status without reason", () => {
    const result = moderationSchema.safeParse({ status: "REJEITADO" });
    expect(result.success).toBe(true);
  });

  it("accepts ATIVO status with reason", () => {
    const result = moderationSchema.safeParse({
      status: "ATIVO",
      reason: "Aprovado após revisão",
    });
    expect(result.success).toBe(true);
  });

  it("accepts REJEITADO status with reason", () => {
    const result = moderationSchema.safeParse({
      status: "REJEITADO",
      reason: "Conteúdo inadequado",
    });
    expect(result.success).toBe(true);
  });

  it("rejects invalid status", () => {
    const result = moderationSchema.safeParse({ status: "PENDENTE" });
    expect(result.success).toBe(false);
  });

  it("rejects empty status", () => {
    const result = moderationSchema.safeParse({ status: "" });
    expect(result.success).toBe(false);
  });

  it("rejects missing status", () => {
    const result = moderationSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});
