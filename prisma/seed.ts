import { PrismaClient, Role, Category, Condition, Availability, AnnouncementStatus, ManifestationStatus, NotificationType } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Clean existing data
  await prisma.notification.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.review.deleteMany();
  await prisma.manifestation.deleteMany();
  await prisma.photo.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash("123456", 10);

  // ── Users ──
  const admin = await prisma.user.create({
    data: {
      name: "Admin AiCansei",
      email: "admin@aicansai.com",
      password: hashedPassword,
      role: Role.ADMIN,
      city: "São Paulo",
      state: "SP",
      phone: "(11) 99999-0000",
    },
  });

  const maria = await prisma.user.create({
    data: {
      name: "Maria Santos",
      email: "maria@email.com",
      password: hashedPassword,
      role: Role.DOADOR,
      city: "São Paulo",
      state: "SP",
      phone: "(11) 98888-1111",
      reputation: 4.8,
      reviewCount: 12,
    },
  });

  const joao = await prisma.user.create({
    data: {
      name: "João Pereira",
      email: "joao@email.com",
      password: hashedPassword,
      role: Role.DOADOR,
      city: "Rio de Janeiro",
      state: "RJ",
      phone: "(21) 97777-2222",
      reputation: 4.5,
      reviewCount: 8,
    },
  });

  const ana = await prisma.user.create({
    data: {
      name: "Ana Oliveira",
      email: "ana@email.com",
      password: hashedPassword,
      role: Role.RECEPTOR,
      city: "Belo Horizonte",
      state: "MG",
      phone: "(31) 96666-3333",
      reputation: 4.9,
      reviewCount: 5,
    },
  });

  const carlos = await prisma.user.create({
    data: {
      name: "Carlos Silva",
      email: "carlos@email.com",
      password: hashedPassword,
      role: Role.RECEPTOR,
      city: "Curitiba",
      state: "PR",
      phone: "(41) 95555-4444",
      reputation: 4.2,
      reviewCount: 3,
    },
  });

  // ── Announcements ──
  const anuncio1 = await prisma.announcement.create({
    data: {
      title: "Sofá 3 Lugares Azul",
      description: "Sofá em ótimo estado, usado por 2 anos. Motivo da doação: me mudei para apartamento menor e não cabe. Entrega combinada ou retirada no local.",
      category: Category.MOVEIS,
      condition: Condition.OTIMO,
      availability: Availability.AMBAS,
      city: "São Paulo",
      state: "SP",
      address: "Rua das Flores, 123 - Vila Mariana",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio2 = await prisma.announcement.create({
    data: {
      title: "Cadeira de Escritório Ergonômica",
      description: "Cadeira ergonômica preta, ajustável, com apoio de braço. Usada por 1 ano. Funciona perfeitamente, comprei uma nova.",
      category: Category.MOVEIS,
      condition: Condition.BOM,
      availability: Availability.RETIRADA,
      city: "São Paulo",
      state: "SP",
      address: "Av. Paulista, 1000 - Consolação",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio3 = await prisma.announcement.create({
    data: {
      title: "Notebook Dell Inspiron 15",
      description: "Notebook Dell Inspiron 15, 8GB RAM, 256GB SSD. Funciona bem, mas precisei de um mais potente para trabalho. Incluo carregador.",
      category: Category.ELETRONICOS,
      condition: Condition.BOM,
      availability: Availability.AMBAS,
      city: "Rio de Janeiro",
      state: "RJ",
      address: "Rua do Ouvidor, 50 - Centro",
      status: AnnouncementStatus.ATIVO,
      donorId: joao.id,
    },
  });

  const anuncio4 = await prisma.announcement.create({
    data: {
      title: "Bicicleta Aro 26",
      description: "Bicicleta mountain bike aro 26, freio a disco, 21 marchas. Precisa de ajuste no câmbio traseiro. Ótima para iniciantes.",
      category: Category.ESPORTES,
      condition: Condition.REGULAR,
      availability: Availability.RETIRADA,
      city: "Rio de Janeiro",
      state: "RJ",
      address: "Rua Uruguaiana, 80 - Centro",
      status: AnnouncementStatus.ATIVO,
      donorId: joao.id,
    },
  });

  const anuncio5 = await prisma.announcement.create({
    data: {
      title: "Coleção de Livros - Fantasia",
      description: "Coleção completa de 8 livros de fantasia. Inclui O Senhor dos Anéis, As Crônicas de Nárnia, Harry Potter 1-5. Todos em bom estado.",
      category: Category.LIVROS,
      condition: Condition.BOM,
      availability: Availability.AMBAS,
      city: "São Paulo",
      state: "SP",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio6 = await prisma.announcement.create({
    data: {
      title: "TV Samsung 40\" Full HD",
      description: "Smart TV Samsung 40 polegadas, Full HD. Funciona perfeitamente, troquei por maior. Controle remoto incluso.",
      category: Category.ELETRONICOS,
      condition: Condition.OTIMO,
      availability: Availability.ENTREGA,
      city: "Belo Horizonte",
      state: "MG",
      address: "Av. Afonso Pena, 500 - Centro",
      status: AnnouncementStatus.ATIVO,
      donorId: joao.id,
    },
  });

  const anuncio7 = await prisma.announcement.create({
    data: {
      title: "Brinquedos para Criança",
      description: "Lote de brinquedos: carrinhos, bonecas, cubo mágico, jogos de tabuleiro. Filho já cresceu, tudo em bom estado.",
      category: Category.BRINQUEDOS,
      condition: Condition.BOM,
      availability: Availability.RETIRADA,
      city: "Curitiba",
      state: "PR",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio8 = await prisma.announcement.create({
    data: {
      title: "Mesa de Jantar 6 Cadeiras",
      description: "Mesa de jantar em madeira maciça com 6 cadeiras. Usada mas resistente. Motivo: reforma da cozinha com mesa embutida.",
      category: Category.MOVEIS,
      condition: Condition.REGULAR,
      availability: Availability.RETIRADA,
      city: "Belo Horizonte",
      state: "MG",
      address: "Rua da Bahia, 200 - Centro",
      status: AnnouncementStatus.ATIVO,
      donorId: joao.id,
    },
  });

  const anuncio9 = await prisma.announcement.create({
    data: {
      title: "Roupas Femininas Tamanho M",
      description: "Lote com 15 peças de roupas femininas tamanho M: blusas, calças, vestidos. Todas lavadas e em bom estado.",
      category: Category.ROUPAS,
      condition: Condition.BOM,
      availability: Availability.AMBAS,
      city: "São Paulo",
      state: "SP",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio10 = await prisma.announcement.create({
    data: {
      title: "Kit Panelas Inox",
      description: "Kit com 5 panelas de aço inox, tamanhos variados. Usadas por 6 meses, sem arranhões. Presente que recebi e já tinha equivalentes.",
      category: Category.CASA,
      condition: Condition.OTIMO,
      availability: Availability.AMBAS,
      city: "Curitiba",
      state: "PR",
      status: AnnouncementStatus.ATIVO,
      donorId: joao.id,
    },
  });

  const anuncio11 = await prisma.announcement.create({
    data: {
      title: "Mochila de Trilha 40L",
      description: "Mochila para trilha com 40L, impermeável, com encosto ergonômico. Usei em 3 trilhas, vendi porque ganhei uma maior.",
      category: Category.ESPORTES,
      condition: Condition.OTIMO,
      availability: Availability.RETIRADA,
      city: "São Paulo",
      state: "SP",
      status: AnnouncementStatus.ATIVO,
      donorId: maria.id,
    },
  });

  const anuncio12 = await prisma.announcement.create({
    data: {
      title: "Jogo de Tabuleiro - Catan",
      description: "Jogo de tabuleiro Catan completo, com todas as peças e manual em português. Jogado poucas vezes.",
      category: Category.OUTROS,
      condition: Condition.OTIMO,
      availability: Availability.ENTREGA,
      city: "Belo Horizonte",
      state: "MG",
      status: AnnouncementStatus.PENDENTE,
      donorId: joao.id,
    },
  });

  // ── Photos (real Unsplash images matching each item) ──
  const announcements = [anuncio1, anuncio2, anuncio3, anuncio4, anuncio5, anuncio6, anuncio7, anuncio8, anuncio9, anuncio10, anuncio11, anuncio12];

  const photoMap: Record<number, string[]> = {
    // anuncio1: Sofá
    0: ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"],
    // anuncio2: Cadeira de escritório
    1: ["https://images.unsplash.com/photo-1580480055273-228ff5388ef8?w=600"],
    // anuncio3: Notebook Dell
    2: ["https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600"],
    // anuncio4: Bicicleta
    3: ["https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=600"],
    // anuncio5: Livros fantasia
    4: ["https://images.unsplash.com/photo-1512820790803-83ca734da794?w=600"],
    // anuncio6: TV Samsung
    5: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600"],
    // anuncio7: Brinquedos
    6: ["https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=600"],
    // anuncio8: Mesa de jantar
    7: ["https://images.unsplash.com/photo-1617806118233-18e1de247200?w=600"],
    // anuncio9: Roupas femininas
    8: ["https://images.unsplash.com/photo-1562157873-818bc0726f68?w=600"],
    // anuncio10: Panelas inox
    9: ["https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=600"],
    // anuncio11: Mochila de trilha
    10: ["https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600"],
    // anuncio12: Jogo de tabuleiro
    11: ["https://images.unsplash.com/photo-1611371805429-8b8010bd406e?w=600"],
  };

  for (let i = 0; i < announcements.length; i++) {
    const urls = photoMap[i] || ["https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600"];
    await prisma.photo.create({
      data: {
        url: urls[0],
        sortOrder: 0,
        announcementId: announcements[i].id,
      },
    });
  }

  // ── Manifestations ──
  await prisma.manifestation.create({
    data: {
      message: "Olá Maria! Adorei o sofá, ainda está disponível? Posso buscar sábado?",
      status: ManifestationStatus.PENDENTE,
      userId: ana.id,
      announcementId: anuncio1.id,
    },
  });

  await prisma.manifestation.create({
    data: {
      message: "Boa! Tenho interesse na cadeira. Pode me reserve-la?",
      status: ManifestationStatus.PENDENTE,
      userId: carlos.id,
      announcementId: anuncio2.id,
    },
  });

  await prisma.manifestation.create({
    data: {
      message: "O notebook ainda funciona bem? Qual a bateria?",
      status: ManifestationStatus.ACEITA,
      userId: ana.id,
      announcementId: anuncio3.id,
    },
  });

  await prisma.manifestation.create({
    data: {
      message: "Quero os livros! Posso buscar amanhã?",
      status: ManifestationStatus.PENDENTE,
      userId: carlos.id,
      announcementId: anuncio5.id,
    },
  });

  await prisma.manifestation.create({
    data: {
      message: "A TV está funcionando? Aceito entrega sim!",
      status: ManifestationStatus.PENDENTE,
      userId: ana.id,
      announcementId: anuncio6.id,
    },
  });

  await prisma.manifestation.create({
    data: {
      message: "As roupas são do meu tamanho! Posso buscar?",
      status: ManifestationStatus.CONCLUIDA,
      userId: ana.id,
      announcementId: anuncio9.id,
    },
  });

  // ── Reviews ──
  await prisma.review.create({
    data: {
      rating: 5,
      comment: "Maria foi super atenciosa! Entregou tudo direitinho.",
      reviewerId: ana.id,
      reviewedId: maria.id,
    },
  });

  await prisma.review.create({
    data: {
      rating: 4,
      comment: "Bom doador, item conforme descrito.",
      reviewerId: carlos.id,
      reviewedId: joao.id,
    },
  });

  // ── Favorites ──
  await prisma.favorite.create({ data: { userId: ana.id, announcementId: anuncio1.id } });
  await prisma.favorite.create({ data: { userId: ana.id, announcementId: anuncio3.id } });
  await prisma.favorite.create({ data: { userId: ana.id, announcementId: anuncio5.id } });
  await prisma.favorite.create({ data: { userId: carlos.id, announcementId: anuncio1.id } });
  await prisma.favorite.create({ data: { userId: carlos.id, announcementId: anuncio2.id } });
  await prisma.favorite.create({ data: { userId: carlos.id, announcementId: anuncio6.id } });
  await prisma.favorite.create({ data: { userId: maria.id, announcementId: anuncio3.id } });
  await prisma.favorite.create({ data: { userId: maria.id, announcementId: anuncio4.id } });
  await prisma.favorite.create({ data: { userId: joao.id, announcementId: anuncio5.id } });
  await prisma.favorite.create({ data: { userId: joao.id, announcementId: anuncio9.id } });

  // ── Notifications ──
  await prisma.notification.create({
    data: {
      title: "Novo interesse!",
      message: "Ana Oliveira manifestou interesse no seu anúncio 'Sofá 3 Lugares Azul'",
      type: NotificationType.INTERESSE,
      userId: maria.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Bem-vindo ao AiCansei!",
      message: "Sua conta foi criada com sucesso. Comece a doar ou buscar itens!",
      type: NotificationType.SISTEMA,
      userId: maria.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Avaliação recebida",
      message: "Ana Oliveira deixou uma avaliação de 5 estrelas para você!",
      type: NotificationType.AVALIACAO,
      userId: maria.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Anúncio pendente",
      message: "Seu anúncio 'Jogo de Tabuleiro - Catan' está pendente de moderação",
      type: NotificationType.MODERACAO,
      userId: joao.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Novo interesse!",
      message: "Carlos Silva manifestou interesse no seu anúncio 'Cadeira de Escritório'",
      type: NotificationType.INTERESSE,
      userId: maria.id,
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Bem-vindo ao AiCansei!",
      message: "Sua conta foi criada com sucesso!",
      type: NotificationType.SISTEMA,
      userId: joao.id,
      read: true,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Doação concluída!",
      message: "A doação de 'Roupas Femininas' foi marcada como concluída. Avalie a experiência!",
      type: NotificationType.SISTEMA,
      userId: ana.id,
    },
  });

  await prisma.notification.create({
    data: {
      title: "Avaliação recebida",
      message: "Carlos Silva deixou uma avaliação de 4 estrelas para você!",
      type: NotificationType.AVALIACAO,
      userId: joao.id,
    },
  });

  console.log("✅ Seed concluído!");
  console.log(`   - 5 usuários`);
  console.log(`   - 12 anúncios`);
  console.log(`   - 14 fotos`);
  console.log(`   - 6 manifestações`);
  console.log(`   - 2 avaliações`);
  console.log(`   - 10 favoritos`);
  console.log(`   - 8 notificações`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
