// French text for the seed catalog, keyed by category slug, product id, plan id
// and plan-slot id. Merged into each row's `translations.fr` by prisma/seed.ts;
// the 20261004150000_french migration applies the same text to an existing
// database. Operators can edit it later in /manage.
export const frenchCatalog: {
  categories: Record<string, { name: string, blurb: string }>
  products: Record<string, { name: string, description: string, category: string, ingredients: string[], nutritionSummary: string }>
  plans: Record<string, { name: string, summary: string }>
  slots: Record<string, { label: string, description: string }>
} = {
  categories: {
    beverages: {
      name: 'Boissons fermentées',
      blurb: 'Des boissons vivantes et fermentées — kombucha, kéfirs, ginger beer.'
    },
    dairy: {
      name: 'Fromages et produits laitiers',
      blurb: 'Fromages au lait cru et laitages fermentés, affinés ou à tartiner.'
    },
    vegetables: {
      name: 'Légumes fermentés',
      blurb: 'Légumes fermentés et marinés pour la table.'
    },
    spreads: {
      name: 'Pâtes à tartiner et beurres d\'oléagineux',
      blurb: 'Beurres de noix et de graines, liés à l\'huile d\'argan, à l\'huile d\'olive et au miel.'
    },
    jams: {
      name: 'Confitures et produits fruitiers',
      blurb: 'Des fruits qui prennent leur temps — confitures, concentrés, tomates séchées.'
    },
    seafood: {
      name: 'Poissons et fruits de mer',
      blurb: 'Poissons marinés et kefta de poisson, prêts à servir.'
    },
    sauces: {
      name: 'Sauces et condiments',
      blurb: 'Bases de cuisine et condiments, faits maison.'
    }
  },
  products: {
    'prod-ginger-beer': {
      name: 'Ginger beer',
      description: 'Une ginger beer pétillante de caractère, préparée avec du vrai gingembre, du citron et du sucre de canne pur — rafraîchissante et naturellement intense, à boire telle quelle ou en cocktail.',
      category: 'Boissons fermentées',
      ingredients: ['Gingembre', 'Sucre', 'Eau', 'Citron'],
      nutritionSummary: 'Énergie : 180 kcal, Protéines : 0,2 g, Glucides : 44 g, Lipides : 0 g, Fibres : 0,2 g, Vitamine C : 8 mg'
    },
    'prod-kombucha': {
      name: 'Kombucha',
      description: 'Un kombucha rafraîchissant à base de thé noir, de sucre et de fruits de saison — fermenté naturellement pour une boisson acidulée, riche en probiotiques, bonne pour la flore intestinale.',
      category: 'Boissons fermentées',
      ingredients: ['Thé noir', 'Eau', 'Sucre', 'Fruits de saison'],
      nutritionSummary: 'Énergie : 18 kcal, Protéines : 0 g, Glucides : 4,5 g, Lipides : 0 g, Fibres : 0 g, Vitamine C : 2 mg'
    },
    'prod-leben': {
      name: 'Lben',
      description: 'Un lben onctueux au lait cru et aux ferments de kéfir vivants — riche en probiotiques, pour une touche acidulée et saine au quotidien.',
      category: 'Boissons fermentées',
      ingredients: ['Lait cru', 'Kéfir de lait'],
      nutritionSummary: 'Énergie : 65 kcal, Protéines : 3,3 g, Glucides : 4,7 g, Lipides : 3,6 g, Calcium : 120 mg, Bactéries bénéfiques : ~1x10^8 UFC'
    },
    'prod-milk-kefir': {
      name: 'Kéfir de lait',
      description: 'Un kéfir de lait onctueux et riche en probiotiques, au lait cru et aux ferments vivants — bon pour la flore intestinale, au goût acidulé et rafraîchissant.',
      category: 'Boissons fermentées',
      ingredients: ['Grains de kéfir', 'Lait cru'],
      nutritionSummary: 'Énergie : 65 kcal, Protéines : 3,3 g, Glucides : 4,5 g, Lipides : 3,6 g, Calcium : 120 mg, Bactéries probiotiques : ~1x10^9 UFC'
    },
    'prod-water-kefir': {
      name: 'Kéfir de fruits',
      description: 'Un kéfir de fruits fermenté naturellement au citron, aux figues et aux fruits de saison — acidulé, rafraîchissant et riche en probiotiques.',
      category: 'Boissons fermentées',
      ingredients: ['Grains de kéfir', 'Eau', 'Sucre', 'Citron', 'Figues', 'Fruits et herbes de saison'],
      nutritionSummary: 'Énergie : 30 kcal, Protéines : 0,2 g, Glucides : 7 g, Lipides : 0 g, Fibres : 0,2 g, Vitamine C : 4 mg'
    },
    'prod-hard-cheese': {
      name: 'Fromage à pâte dure',
      description: 'Un fromage à pâte dure riche en goût, fait uniquement de lait cru et de sel — idéal à l\'apéritif, sur un plateau de fromages ou pour relever vos recettes préférées.',
      category: 'Fromages et produits laitiers',
      ingredients: ['Lait cru', 'Sel'],
      nutritionSummary: 'Énergie : 400 kcal, Protéines : 25 g, Glucides : 2 g, Lipides : 33 g, Calcium : 800 mg'
    },
    'prod-jben': {
      name: 'Jben',
      description: 'Un jben marocain frais et crémeux, au lait cru et à une pointe de sel — doux, parfait à tartiner, à grignoter ou à ajouter à vos plats.',
      category: 'Fromages et produits laitiers',
      ingredients: ['Lait cru', 'Sel'],
      nutritionSummary: 'Énergie : 220 kcal, Protéines : 14 g, Glucides : 3 g, Lipides : 16 g, Calcium : 400 mg'
    },
    'prod-smen': {
      name: 'Smen',
      description: 'Le smen marocain traditionnel — un beurre salé et affiné au goût riche et prononcé — parfait pour sublimer couscous, tajines et plats maghrébins authentiques.',
      category: 'Fromages et produits laitiers',
      ingredients: ['Beurre', 'Sel'],
      nutritionSummary: 'Énergie : 720 kcal, Protéines : 0,5 g, Glucides : 1 g, Lipides : 80 g, Fibres : 0 g, Sodium : 1500 mg'
    },
    'prod-spread-cheese': {
      name: 'Fromage à tartiner',
      description: 'Un fromage crémeux à tartiner au lait cru, relevé d\'ail, d\'olives, de cumin et d\'origan pour un goût méditerranéen affirmé.',
      category: 'Fromages et produits laitiers',
      ingredients: ['Lait cru', 'Ail', 'Olives', 'Cumin', 'Origan'],
      nutritionSummary: 'Énergie : 320 kcal, Protéines : 13 g, Glucides : 4 g, Lipides : 28 g, Fibres : 1 g, Calcium : 500 mg'
    },
    'prod-marinated-eggplants': {
      name: 'Aubergines marinées',
      description: 'Des aubergines fondantes marinées à l\'ail, aux herbes fraîches et aux épices dans l\'huile d\'olive — une entrée ou un accompagnement aux saveurs méditerranéennes.',
      category: 'Légumes fermentés',
      ingredients: ['Aubergines', 'Sel', 'Ail', 'Persil frais', 'Coriandre fraîche', 'Épices', 'Laurier', 'Eau', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 110 kcal, Protéines : 1,2 g, Glucides : 5 g, Lipides : 8 g, Fibres : 3 g, Potassium : 200 mg'
    },
    'prod-marinated-olives': {
      name: 'Olives marinées',
      description: 'Des olives marinées au citron, à l\'ail, au laurier et au piment — un apéritif méditerranéen irrésistible, plein de caractère.',
      category: 'Légumes fermentés',
      ingredients: ['Olives fraîches', 'Sel', 'Eau', 'Citron', 'Ail', 'Laurier', 'Piment', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 210 kcal, Protéines : 1,2 g, Glucides : 6 g, Lipides : 21 g, Fibres : 3 g, Sodium : 1200 mg'
    },
    'prod-seasonal-fermented-vegetables': {
      name: 'Légumes de saison fermentés',
      description: 'Un mélange coloré de chou, de carottes et de betteraves fermentés aux épices aromatiques — riche en probiotiques, pour une touche acidulée et bonne pour l\'intestin à chaque repas.',
      category: 'Légumes fermentés',
      ingredients: ['Chou', 'Carottes', 'Betteraves', 'Eau', 'Ail', 'Gingembre', 'Oignon', 'Curcuma frais', 'Sel', 'Poivre', 'Laurier', 'Miel', 'Graines de coriandre', 'Graines de moutarde'],
      nutritionSummary: 'Énergie : 40 kcal, Protéines : 1,2 g, Glucides : 8 g, Lipides : 0,3 g, Fibres : 2,5 g, Vitamine C : 18 mg, Bactéries bénéfiques (Lactobacillus) : présentes'
    },
    'prod-amlou': {
      name: 'Amlou',
      description: 'Un amlou riche et onctueux qui marie amandes grillées, huile d\'argan pure et miel — une pâte à tartiner naturellement sucrée et nourrissante, parfaite au petit-déjeuner ou au goûter.',
      category: 'Pâtes à tartiner et beurres d\'oléagineux',
      ingredients: ['Amandes', 'Huile d\'argan', 'Miel'],
      nutritionSummary: 'Énergie : 570 kcal, Protéines : 13 g, Glucides : 25 g, Lipides : 45 g, Fibres : 7 g, Vitamine E : 20 mg'
    },
    'prod-peanut-butter': {
      name: 'Beurre de cacahuète',
      description: 'Un beurre de cacahuète onctueux, à l\'huile d\'argan, d\'olive ou de sésame au choix, adouci au miel — une pâte à tartiner riche et naturellement délicieuse.',
      category: 'Pâtes à tartiner et beurres d\'oléagineux',
      ingredients: ['Cacahuètes', 'Huile d\'argan/d\'olive/de sésame', 'Miel'],
      nutritionSummary: 'Énergie : 600 kcal, Protéines : 22 g, Glucides : 18 g, Lipides : 50 g, Fibres : 6 g, Vitamine E : 7 mg'
    },
    'prod-pistachio-butter': {
      name: 'Beurre de pistache',
      description: 'Un beurre de pistache onctueux à l\'huile d\'olive ou d\'argan et une touche de miel — une pâte à tartiner naturellement sucrée et riche en nutriments.',
      category: 'Pâtes à tartiner et beurres d\'oléagineux',
      ingredients: ['Pistaches', 'Huile d\'olive/d\'argan', 'Miel'],
      nutritionSummary: 'Énergie : 600 kcal, Protéines : 18 g, Glucides : 20 g, Lipides : 52 g, Fibres : 8 g, Vitamine E : 6 mg'
    },
    'prod-pumpkin-seed-butter': {
      name: 'Beurre de graines de courge',
      description: 'Un beurre de graines de courge onctueux aux huiles d\'olive et d\'argan, légèrement adouci au miel — une pâte à tartiner nourrissante au goût de noisette.',
      category: 'Pâtes à tartiner et beurres d\'oléagineux',
      ingredients: ['Graines de courge', 'Huile d\'olive/d\'argan', 'Miel'],
      nutritionSummary: 'Énergie : 600 kcal, Protéines : 25 g, Glucides : 15 g, Lipides : 50 g, Fibres : 6 g, Magnésium : 400 mg'
    },
    'prod-jams': {
      name: 'Confitures',
      description: 'Des confitures artisanales aux fruits de saison bien mûrs et au sucre de canne roux — naturellement sucrées, parfaites au petit-déjeuner ou en dessert.',
      category: 'Confitures et produits fruitiers',
      ingredients: ['Fruits de saison', 'Sucre de canne roux'],
      nutritionSummary: 'Énergie : 260 kcal, Protéines : 0,5 g, Glucides : 65 g, Lipides : 0,2 g, Fibres : 1,5 g, Vitamine C : 8 mg'
    },
    'prod-pomegranate-concentrate': {
      name: 'Concentré de grenade',
      description: 'Un concentré de grenade riche et acidulé, adouci au sucre de canne roux — idéal pour des boissons rafraîchissantes, des desserts ou pour parfumer vos recettes.',
      category: 'Confitures et produits fruitiers',
      ingredients: ['Grenade', 'Sucre de canne roux'],
      nutritionSummary: 'Énergie : 260 kcal, Protéines : 1 g, Glucides : 65 g, Lipides : 0 g, Fibres : 1 g, Potassium : 250 mg'
    },
    'prod-sun-dried-tomatoes': {
      name: 'Tomates séchées',
      description: 'Des tomates séchées au soleil, marinées à l\'huile d\'olive, à l\'ail et aux épices — pour donner du caractère méditerranéen aux salades, aux pâtes et aux apéritifs.',
      category: 'Confitures et produits fruitiers',
      ingredients: ['Tomates', 'Eau', 'Vinaigre', 'Huile d\'olive', 'Ail', 'Épices'],
      nutritionSummary: 'Énergie : 180 kcal, Protéines : 4 g, Glucides : 30 g, Lipides : 6 g, Fibres : 7 g, Potassium : 1100 mg'
    },
    'prod-marinated-anchovies': {
      name: 'Anchois marinés',
      description: 'Des anchois tendres marinés à l\'ail, aux herbes fraîches, au citron et aux épices dans l\'huile d\'olive — parfaits à l\'apéritif ou en salade.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Anchois', 'Ail', 'Herbes fraîches', 'Citron', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 210 kcal, Protéines : 18 g, Glucides : 1 g, Lipides : 15 g, Fibres : 0 g, Sodium : 1500 mg'
    },
    'prod-marinated-octopus': {
      name: 'Poulpe mariné',
      description: 'Un poulpe tendre mariné à l\'ail, aux herbes fraîches, au citron et aux épices dans l\'huile d\'olive — une entrée ou une salade gourmande aux saveurs méditerranéennes.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Poulpe', 'Ail', 'Herbes fraîches', 'Citron', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 120 kcal, Protéines : 16 g, Glucides : 2 g, Lipides : 5 g, Fibres : 0,5 g, Fer : 4 mg'
    },
    'prod-marinated-sardines': {
      name: 'Sardines marinées',
      description: 'Des sardines tendres marinées à l\'ail, aux herbes fraîches, au citron et aux épices dans l\'huile d\'olive — prêtes à déguster, pleines de saveurs méditerranéennes.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Sardines', 'Ail', 'Herbes fraîches', 'Citron', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 210 kcal, Protéines : 22 g, Glucides : 0 g, Lipides : 14 g, Fibres : 0 g, Calcium : 250 mg'
    },
    'prod-marinated-tuna': {
      name: 'Thon mariné',
      description: 'Un thon tendre mariné à l\'ail, aux herbes fraîches, au citron et aux épices dans l\'huile d\'olive — un repas ou un en-cas prêt à déguster.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Thon', 'Ail', 'Herbes fraîches', 'Citron', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 180 kcal, Protéines : 23 g, Glucides : 1 g, Lipides : 9 g, Fibres : 0,5 g, Fer : 1,2 mg'
    },
    'prod-sardine-kefta-in-tomato-sauce': {
      name: 'Kefta de sardines à la sauce tomate',
      description: 'Des boulettes de sardines tendres à l\'ail, au persil frais et aux épices dans une sauce tomate relevée — une recette authentique de la cuisine méditerranéenne.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Sardines', 'Ail', 'Persil frais', 'Épices', 'Citron', 'Sauce tomate'],
      nutritionSummary: 'Énergie : 160 kcal, Protéines : 15 g, Glucides : 4 g, Lipides : 9 g, Fibres : 1 g, Calcium : 250 mg'
    },
    'prod-whiting-kefta-in-tomato-sauce': {
      name: 'Kefta de merlan à la sauce tomate',
      description: 'Des boulettes de merlan à l\'ail, au persil et aux épices, mijotées dans une sauce tomate relevée — un plat savoureux aux accents méditerranéens.',
      category: 'Poissons et fruits de mer',
      ingredients: ['Merlan', 'Ail', 'Persil frais', 'Épices', 'Citron', 'Sauce tomate'],
      nutritionSummary: 'Énergie : 110 kcal, Protéines : 13 g, Glucides : 5 g, Lipides : 4 g, Fibres : 1 g, Vitamine C : 10 mg'
    },
    'prod-b-chamel-sauce': {
      name: 'Sauce béchamel',
      description: 'Une béchamel onctueuse au lait frais, au beurre et aux épices — idéale pour sublimer pâtes, lasagnes ou légumes avec une saveur française classique.',
      category: 'Sauces et condiments',
      ingredients: ['Lait', 'Beurre', 'Farine', 'Sel', 'Poivre', 'Épices'],
      nutritionSummary: 'Énergie : 120 kcal, Protéines : 3 g, Glucides : 8 g, Lipides : 8 g, Calcium : 110 mg'
    },
    'prod-bolognese-sauce': {
      name: 'Sauce bolognaise',
      description: 'Une sauce bolognaise riche et savoureuse aux tomates mûres, au bœuf haché et aux herbes aromatiques — parfaite pour vos plats de pâtes préférés.',
      category: 'Sauces et condiments',
      ingredients: ['Tomates', 'Bœuf haché', 'Ail', 'Oignon', 'Persil', 'Laurier', 'Sel', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 110 kcal, Protéines : 5 g, Glucides : 7 g, Lipides : 6 g, Fibres : 2 g, Fer : 1,2 mg'
    },
    'prod-mayonnaise': {
      name: 'Mayonnaise',
      description: 'Une mayonnaise onctueuse aux œufs, à l\'huile d\'olive de qualité et à la moutarde — parfaite pour sublimer sandwichs, salades et sauces.',
      category: 'Sauces et condiments',
      ingredients: ['Œufs', 'Huile d\'olive', 'Moutarde', 'Sel'],
      nutritionSummary: 'Énergie : 700 kcal, Protéines : 2 g, Glucides : 1 g, Lipides : 76 g, Fibres : 0 g, Vitamine E : 15 mg'
    },
    'prod-tomato-sauce': {
      name: 'Sauce tomate',
      description: 'Une sauce tomate riche et savoureuse aux tomates mûres, à l\'ail, aux herbes et à l\'huile d\'olive — idéale pour les pâtes, les pizzas ou vos recettes préférées.',
      category: 'Sauces et condiments',
      ingredients: ['Tomates', 'Ail', 'Oignon', 'Persil', 'Laurier', 'Sel', 'Épices', 'Huile d\'olive'],
      nutritionSummary: 'Énergie : 60 kcal, Protéines : 1,5 g, Glucides : 7 g, Lipides : 2,5 g, Fibres : 1,5 g, Vitamine C : 12 mg'
    },
    'prod-wholegrain-mustard': {
      name: 'Moutarde à l\'ancienne',
      description: 'Une moutarde à l\'ancienne de caractère, faite d\'ingrédients simples et naturels — pour relever sandwichs, vinaigrettes et marinades.',
      category: 'Sauces et condiments',
      ingredients: ['Graines de moutarde', 'Eau', 'Sel'],
      nutritionSummary: 'Énergie : 120 kcal, Protéines : 6 g, Glucides : 8 g, Lipides : 7 g, Fibres : 5 g, Fer : 1,5 mg'
    }
  },
  plans: {
    'plan-pantry': {
      name: 'Box Garde-manger',
      summary: 'Les essentiels du placard qui se conservent — une pâte à tartiner, un produit fruitier et une sauce, avec de la place pour un de plus.'
    },
    'plan-living': {
      name: 'Box Vivante',
      summary: 'Des fermentations fraîches et réfrigérées — une boisson vivante, un laitage fermenté et un légume fermenté chaque semaine.'
    },
    'plan-coastal': {
      name: 'Box Côtière',
      summary: 'De la mer à la table — deux poissons marinés, une sauce pour les accompagner et un légume en option.'
    }
  },
  slots: {
    'pantry-spread': {
      label: 'Pâte à tartiner',
      description: 'Choisissez un beurre de noix ou de graines.'
    },
    'pantry-jam': {
      label: 'Produit fruitier',
      description: 'Choisissez une confiture, un concentré ou une conserve de fruits.'
    },
    'pantry-sauce': {
      label: 'Sauce',
      description: 'Choisissez une sauce de base ou un condiment.'
    },
    'pantry-extra': {
      label: 'Pâte à tartiner en plus',
      description: 'Une seconde pâte à tartiner pour le mois, en option.'
    },
    'living-beverage': {
      label: 'Boisson fermentée',
      description: 'Choisissez une boisson vivante et fermentée.'
    },
    'living-dairy': {
      label: 'Laitage fermenté',
      description: 'Choisissez un fromage ou un laitage fermenté.'
    },
    'living-vegetable': {
      label: 'Légume fermenté',
      description: 'Choisissez un légume mariné ou fermenté.'
    },
    'living-beverage-2': {
      label: 'Boisson en plus',
      description: 'Une seconde boisson pour la semaine, en option.'
    },
    'coastal-fish-1': {
      label: 'Poisson 1',
      description: 'Choisissez un poisson mariné ou une kefta de poisson.'
    },
    'coastal-fish-2': {
      label: 'Poisson 2',
      description: 'Choisissez un second poisson pour la box.'
    },
    'coastal-sauce': {
      label: 'Sauce',
      description: 'Choisissez une sauce pour l\'accompagner.'
    },
    'coastal-vegetable': {
      label: 'Légume',
      description: 'Un légume fermenté, en option.'
    }
  }
}
