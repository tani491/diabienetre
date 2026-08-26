import { db } from '@/lib/db';

const products = [
  {
    name: "Huile de Argan Précieuse",
    description:
      "Notre huile d'argan précieuse est pressée à froid et 100% naturelle, riche en vitamine E et en acides gras essentiels. Elle nourrit intensément les cheveux secs et abîmés tout en leur redonnant brillance et souplesse. Utilisée en masque ou en soin quotidien, elle protège la fibre capillaire contre les agressions extérieures. Un trésor de la nature pour des cheveux sublimés et en pleine santé.",
    price: 15000,
    image: "/product-hair-1.png",
    category: "cheveux",
    stock: 50,
    featured: true,
    active: true,
  },
  {
    name: "Beurre de Karité Naturel",
    description:
      "Le beurre de karité brut et non raffiné, récolté artisanalement avec soin au cœur de l'Afrique de l'Ouest. Il nourrit, adoucit et protège les cheveux tout en stimulant la pousse grâce à ses propriétés hydratantes exceptionnelles. Parfait pour réaliser des soins capillaires profonds ou pour coiffer les cheveux au quotidien. Un allié incontournable pour des cheveux forts, résistants et éclatants de vitalité.",
    price: 8000,
    image: "/product-hair-2.png",
    category: "cheveux",
    stock: 50,
    featured: false,
    active: true,
  },
  {
    name: "Masque Réparateur Intense",
    description:
      "Ce masque capillaire réparateur intense est formulé avec des ingrédients naturels d'exception pour restaurer les cheveux les plus abîmés. Enrichi en protéines végétales et en huiles essentielles, il pénètre en profondeur pour reconstruire la fibre capillaire de l'intérieur. Résultat : des cheveux visiblement plus forts, plus brillants et plus doux dès la première application. Idéal pour les cheveux traités, colorés ou fragilisés.",
    price: 12000,
    image: "/product-hair-3.png",
    category: "cheveux",
    stock: 50,
    featured: true,
    active: true,
  },
  {
    name: "Sérum Croissance Capillaire",
    description:
      "Notre sérum croissance capillaire est un élixir puissant composé d'huiles essentielles et d'extraits de plantes reconnues pour stimuler la pousse des cheveux. Il active la microcirculation du cuir chevelu et nourrit les follicules pileux pour favoriser une croissance saine et régulière. Appliqué régulièrement sur le cuir chevelu, il réduit la chute et densifie la chevelure. Découvrez des résultats visibles en seulement quelques semaines d'utilisation.",
    price: 10000,
    image: "/product-hair-4.png",
    category: "cheveux",
    stock: 50,
    featured: false,
    active: true,
  },
  {
    name: "Sérum Éclat Vitamine C",
    description:
      "Le sérum éclat vitamine C est un concentré d'énergie pour votre peau, formulé avec un taux optimal de vitamine C stabilisée. Il unifie le teint, estompe les taches brunes et protège contre le stress oxydatif et les radicaux libres. Sa texture légère et non grasse pénètre rapidement pour un effet coup d'éclat immédiat et durable. Votre peau retrouve son éclat naturel et son éclat de jeunesse jour après jour.",
    price: 18000,
    image: "/product-skin-1.png",
    category: "peau",
    stock: 50,
    featured: true,
    active: true,
  },
  {
    name: "Crème Hydratante Bio",
    description:
      "Cette crème hydratante bio est enrichie en aloe vera, beurre de karité et acide hyaluronique pour une hydratation intense et longue durée. Elle restaure la barrière cutanée, apaise les irritations et laisse la peau douce, souple et veloutée au toucher. Sa formule légère convient à tous les types de peau, même les plus sensibles. Un soin quotidien essentiel pour maintenir une peau saine, éclatante et protégée.",
    price: 14000,
    image: "/product-skin-2.png",
    category: "peau",
    stock: 50,
    featured: false,
    active: true,
  },
  {
    name: "Gommage Corps Naturel",
    description:
      "Notre gommage corps naturel est un véritable rituel de beauté qui exfolie en douceur et révèle l'éclat naturel de votre peau. Composé de grains fins de noix de coco et d'huiles végétales nourrissantes, il élimine les cellules mortes et affine le grain de peau. Il laisse un parfum subtil et envoûtant qui transforme votre douche en moment de bien-être. Utilisé une à deux fois par semaine, votre peau sera visiblement plus lisse, plus lumineuse et plus tonifiée.",
    price: 9000,
    image: "/product-skin-3.png",
    category: "peau",
    stock: 50,
    featured: false,
    active: true,
  },
  {
    name: "Crème Éclat Doré",
    description:
      "La crème éclat doré est notre produit phare pour illuminer votre teint et lui donner un aspect doré et radieux. Enrichie en extrait de curcuma et en particules d'or naturel, elle unifie le teint tout en nourrissant la peau en profondeur. Sa texture riche et onctueux fond sur la peau pour un fini lumineux et naturel. Parfaite pour les peaux normales à sèches, elle sublime votre beauté naturelle et vous donne un éclat doré irrésistible.",
    price: 16000,
    image: "/product-skin-4.png",
    category: "peau",
    stock: 50,
    featured: true,
    active: true,
  },
];

async function seed() {
  console.log('🌱 Seeding database...');

  // Clear existing data
  await db.product.deleteMany();
  await db.order.deleteMany();

  // Create admin user
  await db.user.upsert({
    where: { email: 'admin@diabienetre.sn' },
    update: {},
    create: {
      email: 'admin@diabienetre.sn',
      name: 'Admin DiaBienEtre',
      password: '$2b$12$TzXyzFA970zzBcwdHYKKKexh4pVLlfBHPVDivleSx82Dr7kgj5Aee',
      role: 'admin',
    },
  });

  await db.storeSettings.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      announcementText: 'En promo - 50% sur les soins !',
      announcementEnabled: true,
    },
  });

  // Insert products
  for (const product of products) {
    await db.product.create({ data: product });
  }

  console.log('✅ Seeding completed!');
  console.log(`   - ${products.length} products created`);
  console.log(`   - 1 admin user created`);
}

seed()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(() => {
    process.exit(0);
  });
