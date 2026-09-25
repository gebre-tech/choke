const { PrismaClient } = require("@prisma/client");
const crypto = require("crypto");

const prisma = new PrismaClient();

const ADMIN_EMAIL = "admin@choke.test";
const ADMIN_PASSWORD = "admin123";

function hashPassword(password) {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64, { N: 16384, r: 8, p: 1 });
  return `scrypt$${salt.toString("hex")}$${hash.toString("hex")}`;
}

const cottages = [
  {
    id: "ctg-panoramic",
    name: "Panoramic Hut",
    description:
      "A cozy stone-and-timber hut with sweeping 360° views of the Choke mountain range. The perfect base for dawn and dusk panoramas.",
    pricePerNight: 2500,
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    hasFireplace: true,
    hasPrivateDeck: true,
    hasKitchenette: true,
    hasHeatedFloors: true,
    altitude: 4070,
    viewDescription:
      "Day: Choke ridgelines, valleys and the East Gojjam plateau. Night: the lights of Motta, Dembecha, Amanuel, Jiga, Debre Markos, Digotsion, Wabir and Abedamo.",
    totalUnits: 3,
    availableUnits: 3,
  },
  {
    id: "ctg-stargazer",
    name: "Stargazer's Den",
    description:
      "Our signature telescope cottage. A private deck with a mounted telescope opens onto skies free of light pollution — Ethiopia's best stargazing.",
    pricePerNight: 3200,
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 1,
    hasTelescope: true,
    hasFireplace: true,
    hasPrivateDeck: true,
    hasHeatedFloors: true,
    altitude: 4070,
    viewDescription:
      "Prime astronomy site: Milky Way arcs overhead, and the night-city lights of the West Gojjam towns glitter far below.",
    totalUnits: 2,
    availableUnits: 2,
  },
  {
    id: "ctg-family",
    name: "Family Hut",
    description:
      "A larger lodge built from local stone, wood and clay, comfortable for families exploring the highland trails together.",
    pricePerNight: 3800,
    capacity: 4,
    bedrooms: 2,
    beds: 2,
    bathrooms: 1,
    hasFireplace: true,
    hasPrivateDeck: true,
    hasKitchenette: true,
    hasWifi: true,
    altitude: 4040,
    viewDescription:
      "Views over the valleys toward Debre Markos; a quiet deck for evening coffee and mountain air.",
    totalUnits: 2,
    availableUnits: 2,
  },
  {
    id: "ctg-suite",
    name: "Mountain Suite",
    description:
      "The most elevated of our rooms — a luminous suite with private deck, heated floors and a telescope for guests who want it all.",
    pricePerNight: 4500,
    capacity: 2,
    bedrooms: 1,
    beds: 1,
    bathrooms: 2,
    hasTelescope: true,
    hasFireplace: true,
    hasPrivateDeck: true,
    hasKitchenette: true,
    hasHeatedFloors: true,
    hasWifi: true,
    altitude: 4070,
    viewDescription:
      "The full 360°: Choke's giants by day, and eight Gojjam towns sparkling like a constellation by night.",
    totalUnits: 1,
    availableUnits: 1,
  },
];

const experiences = [
  {
    id: "exp-stargazing",
    name: "Stargazing Session",
    description:
      "Guided telescope observation of the Milky Way and the highland constellations — celestial dolphin, Ethiopian wolf and the Gojjam kings.",
    type: "STARGAZING",
    price: 500,
    duration: 90,
    capacity: 10,
    startTime: "20:00",
    endTime: "21:30",
    difficultyLevel: "Easy",
    ageRequirement: 6,
    includedItems: ["Telescope", "Hot drink", "Star chart"],
    maxBookingsPerDay: 5,
  },
  {
    id: "exp-trek",
    name: "Mountain Trek",
    description:
      "A guided hike across the giant lobelia meadows of Choke, ending at the highest point for a full-circle panorama.",
    type: "TREKKING",
    price: 750,
    duration: 240,
    capacity: 10,
    startTime: "06:00",
    endTime: "10:00",
    difficultyLevel: "Moderate",
    ageRequirement: 12,
    includedItems: ["Guide", "Packed breakfast", "Pole"],
    maxBookingsPerDay: 4,
  },
  {
    id: "exp-citylights",
    name: "Night City Lights",
    description:
      "From the observation deck, watch the lights of Motta, Dembecha, Amanuel, Jiga, Debre Markos, Digotsion, Wabir and Abedamo emerge below.",
    type: "CITY_LIGHTS",
    price: 400,
    duration: 60,
    capacity: 20,
    startTime: "19:00",
    endTime: "20:00",
    difficultyLevel: "Easy",
    ageRequirement: 0,
    includedItems: ["Observation deck", "Warm blanket", "Hot drink"],
    maxBookingsPerDay: 6,
  },
  {
    id: "exp-sunrise",
    name: "Sunrise View",
    description:
      "First light over the Choke ridgelines — sunrise coffee on the deck as Gojjam wakes beneath you.",
    type: "SUNRISE_SUNSET",
    price: 300,
    duration: 60,
    capacity: 15,
    startTime: "05:30",
    endTime: "06:30",
    difficultyLevel: "Easy",
    ageRequirement: 0,
    includedItems: ["Deck access", "Coffee", "Blanket"],
    maxBookingsPerDay: 6,
  },
];

const products = [
  {
    id: "prod-honey",
    name: "Choke Mountain Honey",
    description: "Raw, single-origin white honey from hives set high on the Choke massif.",
    price: 450,
    category: "HONEY",
    stock: 40,
    minimumStock: 8,
    producerName: "Choke Mountains Community",
    producerLocation: "West Gojam Zone, Amhara Region, Ethiopia",
    isOrganic: true,
    weight: 0.5,
  },
  {
    id: "prod-coffee",
    name: "Choke Mountains Coffee",
    description: "Highland-washed coffee, roasted over local wood in small batches.",
    price: 650,
    category: "COFFEE",
    stock: 35,
    minimumStock: 6,
    producerName: "Choke Mountains Community",
    producerLocation: "West Gojam Zone, Amhara Region, Ethiopia",
    isOrganic: true,
    weight: 1,
  },
  {
    id: "prod-crafts",
    name: "Gojjam Handwoven Basket",
    description: "Traditional mesob-style baskets woven by women's cooperatives in the district.",
    price: 350,
    category: "CRAFTS",
    stock: 25,
    minimumStock: 5,
    producerName: "Choke Mountains Community",
    producerLocation: "West Gojam Zone, Amhara Region, Ethiopia",
    isOrganic: true,
    weight: 0.8,
  },
  {
    id: "prod-spices",
    name: "Highland Spice Blend",
    description: "Berbere and mitmita blends ground fresh at the lodge from the region's chilies.",
    price: 280,
    category: "SPICES",
    stock: 50,
    minimumStock: 10,
    producerName: "Choke Mountains Community",
    producerLocation: "West Gojam Zone, Amhara Region, Ethiopia",
    isOrganic: true,
    weight: 0.25,
  },
  {
    id: "prod-breakfast-basket",
    name: "Mountain Breakfast Basket",
    description: "A local breakfast selection with eggs, bread, honey, butter, and seasonal fruit.",
    price: 550,
    category: "FOOD",
    stock: 30,
    minimumStock: 5,
    producerName: "Choke Lodge Kitchen",
    producerLocation: "Choke Mountains, West Gojjam",
    isOrganic: true,
    weight: 1.2,
  },
  {
    id: "prod-fresh-milk",
    name: "Fresh Highland Milk",
    description: "Chilled daily milk from highland family farms. Best enjoyed fresh.",
    price: 120,
    category: "DAIRY",
    stock: 60,
    minimumStock: 10,
    producerName: "Choke Farmers Cooperative",
    producerLocation: "West Gojjam, Ethiopia",
    isOrganic: true,
    weight: 1,
  },
  {
    id: "prod-restaurant-lunch",
    name: "Choke Community Restaurant Lunch",
    description: "A hearty Ethiopian lunch plate prepared with seasonal ingredients from local farms.",
    price: 480,
    category: "RESTAURANT",
    stock: 40,
    minimumStock: 8,
    producerName: "Choke Community Restaurant",
    producerLocation: "Choke Lodge Village",
    isOrganic: true,
    weight: null,
  },
  {
    id: "prod-guest-house-night",
    name: "Community Guest House Night",
    description: "A comfortable local guest house room with breakfast and a warm highland welcome.",
    price: 1800,
    category: "GUEST_HOUSE",
    stock: 8,
    minimumStock: 2,
    producerName: "Choke Guest House Network",
    producerLocation: "West Gojjam, Ethiopia",
    isOrganic: false,
    weight: null,
  },
  {
    id: "prod-mart-essentials",
    name: "Mountain Mart Essentials Pack",
    description: "Convenient daily essentials including water, soap, tissues, and locally made snacks.",
    price: 350,
    category: "MART",
    stock: 45,
    minimumStock: 8,
    producerName: "Choke Mountain Mart",
    producerLocation: "Choke Lodge Village",
    isOrganic: false,
    weight: 1,
  },
  {
    id: "prod-choke-shirt",
    name: "Choke Mountains Community Shirt",
    description: "Soft cotton shirt featuring the Choke Mountains mark. Available in local community colors.",
    price: 850,
    category: "APPAREL",
    stock: 25,
    minimumStock: 5,
    producerName: "Choke Youth Design Cooperative",
    producerLocation: "West Gojjam, Ethiopia",
    isOrganic: false,
    weight: 0.25,
  },
];

async function main() {
  console.log("Seeding Choke Panoramic data...");

  for (const c of cottages) {
    await prisma.cottage.upsert({
      where: { id: c.id },
      update: c,
      create: c,
    });
  }
  console.log(`Cottages: ${cottages.length} ready`);

  for (const e of experiences) {
    await prisma.experience.upsert({
      where: { id: e.id },
      update: e,
      create: e,
    });
  }
  console.log(`Experiences: ${experiences.length} ready`);

  for (const p of products) {
    await prisma.product.upsert({
      where: { id: p.id },
      update: p,
      create: p,
    });
  }
  console.log(`Products: ${products.length} ready`);

  const existingAdmin = await prisma.user.findUnique({ where: { email: ADMIN_EMAIL } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: ADMIN_EMAIL,
        firstName: "Choke",
        lastName: "Admin",
        password: hashPassword(ADMIN_PASSWORD),
        role: "ADMIN",
        preferredLanguage: "en",
      },
    });
    console.log(`Admin seeded: ${ADMIN_EMAIL} / ${ADMIN_PASSWORD} (change it!)`);
  } else {
    console.log("Admin already exists, skipped.");
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });