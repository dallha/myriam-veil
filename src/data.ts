/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Product } from "./types";

export const PRODUCTS: Product[] = [
  // --- HAUTE COUTURE (Couture Architecte / Femme) ---
  {
    id: "manteau-architecte",
    name: "MANTEAU ARCHITECTE",
    price: 550000,
    collectionId: "couture",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC9XxL_DOk_FRAPq9Pw0NW7ysP1j2j3vjLSwPRvzAFTTiNNtjwAsGl9OJPGZTYkT5DqyYj98fnFaykeLq2wLrlUfyGb3j_5aHAEMIoZkdgsWYeWzj10D62UOyIR0trez177ZBCj2kd1_vLSLPb0Hr8dMo9w3wg1_9Z24t6zQ4ple5krOZ6pRuW20A3aI8vLr9hy7d3UDKPYBGZ8RhczH3T4Ac6O_u6aFGIqeSxLE2fxPcVq3fnGqvJ6ppXIz-jPP8nOJLXJj8Ko5Mj3",
    additionalImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC9XxL_DOk_FRAPq9Pw0NW7ysP1j2j3vjLSwPRvzAFTTiNNtjwAsGl9OJPGZTYkT5DqyYj98fnFaykeLq2wLrlUfyGb3j_5aHAEMIoZkdgsWYeWzj10D62UOyIR0trez177ZBCj2kd1_vLSLPb0Hr8dMo9w3wg1_9Z24t6zQ4ple5krOZ6pRuW20A3aI8vLr9hy7d3UDKPYBGZ8RhczH3T4Ac6O_u6aFGIqeSxLE2fxPcVq3fnGqvJ6ppXIz-jPP8nOJLXJj8Ko5Mj3",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCgqhsWyBRb6cQxo0GWQ6j_qsNUFhDU0Z_lK6d_y_Csw9EHt-9BscFhhZRgTFMcrzIDXxLldScZYhIJM4aCUN8KQdzwYMJRv5V3MSHPc5JoKgf_idziv0db4nv26-lvrAMimdq-kyMvosYTNTbFK5ggSvICnyisynDat5tmYsee38kS5eoC8h17ccv_11Vu05MTlM5cyWRXayPs3Utiy_SCjx0Wt38nlX0aKr8LFYqMWrBhEuw9WJ4drhZdQDqLueI-qcOMK-WsWTL0",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDIRucpkzagUeYuFvS98xT0_0wO_Vd7w3udH1IJ3mNZu5E6ZllJyqzAIK6vmaExFgYJNzG5uzg2x4eQ_jZbdDAvh3-3gE_2ylinu86VhHVVlz0jlZJeA7ojHBNTSx1Rlj3lHGiUQA20QbxHYzZw3NeYxJFQo0Rxk5lpadl4n2FtCGY2w2KleiKs1zYT7XlbfkcWmUi5zgskECjMr0h8JazegLNTUzDN8SiNDcSRGMx11IFJefvI83954lCAlHxs5SwPzF4FFUPrvMGB"
    ],
    description: "Une silhouette structurée qui redéfinit l'élégance urbaine. Ce manteau aux lignes asymétriques et aux épaules prononcées offre une présence statutaire. Conçu dans des matériaux d'une rigidité calculée pour maintenir sa forme architecturale en tout mouvement.",
    category: "Manteaux",
    sizes: ["34", "36", "38", "40"],
    composition: "Extérieur : 80% Laine vierge, 20% Polyamide structurant.\nDoublure : 100% Cupro soyeux.",
    entretien: "Nettoyage à sec par un spécialiste uniquement. Ne pas repasser les détails structurés.",
    livraison: "Livraison express offerte sur Dakar. Expédition dans toutes les régions du Sénégal."
  },
  {
    id: "blazer-monolithe",
    name: "BLAZER MONOLITHE",
    price: 640000,
    collectionId: "couture",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBXbYBIatWSz40JiUNkEr0UI0GgCLsjJ5jeZyM9ckzZVssk-9Grs_RygZI8rbiqbe2q-oQQ_VAOyShAw5ZEYC29HbEy5mM8zaEuujDGlJ23ZfhzVG7kJfdCT0QwC1ZIjM584Wr23KyZR5UYLrJmzoHl_693RGjbajRZeLUFEABefYclGnlyyEREQeXCJqTG7YEbHg55TVg4Ac9lY0TV5aSEbPAQRcKNLuh3SYKmU5O_IJpRyJIwI7W877NeezyNIEtAGe2cUkuXK0l-",
    description: "Un blazer impeccablement sculpté avec coutures contrastées et silhouette forte, inspiré du monolithe de l'élégance contemporaine.",
    category: "Manteaux",
    sizes: ["34", "36", "38"],
    composition: "90% Laine peignée froide, 10% Soie d'Armure.",
    entretien: "Nettoyage à sec professionnel doux.",
    livraison: "Livraison premium assurée offerte à Dakar."
  },
  {
    id: "robe-structure",
    name: "ROBE STRUCTURE",
    price: 780000,
    collectionId: "couture",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBjABkg3g3KxwcNEwKmawWS7nqvAcSuxTHmaicXQHi50YT790ZTY9A02DJaYH-DgCz5pgHvH3RwpSuPYa2BnUtsb5mwotE9f8tfTvWQsfGZDH2ZRW6SRVKzCAT2HQjqIlHGOPAa0XcXepb8gdFpI0esnm6Jqjqrf8qlTDT98CBlDUeOt5thKh7168AYxLKWBxXu-DSh6flEWdBKvF7Q6YBirQb9R6X_8J1TtLP0jpXBMdwLoUHFYAxSjK3an_bxBAvu06KcGCvOUKd5",
    description: "Une création plissée asymétrique alliant le drapé classique de la sculpture d'époque romaine au minimalisme architectural de l'an 2000.",
    category: "Robes",
    sizes: ["36", "38", "40"],
    composition: "100% Crêpe de soie froissée à la main.",
    entretien: "Pressage spécialisé uniquement.",
    livraison: "Livraison express sous housse de protection signature MV."
  },
  {
    id: "sac-geometrie",
    name: "SAC GÉOMÉTRIE",
    price: 420000,
    collectionId: "couture",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCIxjqBTSkfLr4ImZtuJaXhLAOXFo_ys3Nmk-JBMv8jn6g4VUwP4krbo7Xh1XUw2E3mZvtqy7y8qAI5h3uHCVTX5_lAtfO_kGiGTOSoPdb0AObT8TNJNS8KXpzrjyAvJSK7EGmfAZRFiRGmFSVGWmCok-RrkS4RmysrQ5QdRF24LGpy9fLQhfqMMPhCzOA65FTczhKQn30b2LRBYAINUoBQA9YeIpCuyvJbxknICr9OxnXLBekmnMaDZ32_thR1nWb2SmOSNF4uwlZR",
    description: "Un sac en cuir de veau rigide aux angles géométriques singuliers et asymétriques, une vraie pièce de sculpture portative.",
    category: "Accessoires",
    sizes: ["Unique"],
    composition: "100% Cuir de veau tannage végétal, doublure agneau plongé.",
    entretien: "Éviter l'humidité excessive. nourrir le cuir avec un baume neutre.",
    livraison: "Livraison sécurisée avec boîte rigide cadeau."
  },

  // --- L'ÉCRIN DE SOIE (Fine Jewelry and Accessories) ---
  {
    id: "collier-aube",
    name: "Collier de l'Aube",
    price: 120000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuCVNTTFImDozl3Y8VrDXrqIOSx9Li10zUnOdM_DdtLngMC4rvQvKiDaDxxJrBG1P4LfpQp29v4GVvojp7lA_hZ_qBp2VWs_l5olOu_dwTQ78XMGhK2R1SWfOgFDuE6L-qhgWo_2yUTDYEcl3A05GaxsNTfsih7iaHfKn2P_s5kIJ-PMuTDeu6vq1Md5b1IU75zq5koXuDFdvWKG2saL-rgecx3Hepskkl1K_JeYC6vAblVbmgHo8r8tgEZKUSLLYnd8_uaIgON-Htci",
    additionalImages: [
      "https://lh3.googleusercontent.com/aida-public/AB6AXuCVNTTFImDozl3Y8VrDXrqIOSx9Li10zUnOdM_DdtLngMC4rvQvKiDaDxxJrBG1P4LfpQp29v4GVvojp7lA_hZ_qBp2VWs_l5olOu_dwTQ78XMGhK2R1SWfOgFDuE6L-qhgWo_2yUTDYEcl3A05GaxsNTfsih7iaHfKn2P_s5kIJ-PMuTDeu6vq1Md5b1IU75zq5koXuDFdvWKG2saL-rgecx3Hepskkl1K_JeYC6vAblVbmgHo8r8tgEZKUSLLYnd8_uaIgON-Htci",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDlZmw8Xf4gL-WDeW7I9fqzaNf96PoZOF_-adN51pzZO3nlKwYEFPu6t7rNTZPQSM6SfI2UT7r_lVdQjsUm08KA2PceTH22THQ5uEpc3PR5qL3wfAhKWQkEo2Ufg5i3kZL9NXBwa4f-IlSDoahoH16oGKf_TI3r1V_z3RQicZW3z8SuQWuB632q3XjjMgYGBX6x5dEfOed-18-1ALfiqieo9rvH-2LKC0buX9Fr_wjADZh4jzkAozlqzhi5M0IjSsh9lro8Mzgp4wyX",
      "https://lh3.googleusercontent.com/aida-public/AB6AXuB1Ps-TwpZyCQeoR9BV4vIChqmDYnw0QVF2ETb_mIEN2c0MbKm8VfhBJaS6L1oEsQ3thOQRfUJLdYhsAI1nrbnIIOibCIJC7u-34nmYlq9wVymJ8EidE3nOMOA-HPt6IMEmLlySAkOgRBgK0DHljlyySVJIVFW2u1-p2_cha2s2xj7hh-039bztbfY3QVgK286dmWgfnjSFGV6bxrH7HhgDHTy7anv4bemllocuhVyr0sN_2YloByRndxT2eEzxMCzznMDSE2IEWIbM"
    ],
    description: "Comme la première lumière frôlant la surface de l'océan. Le Collier de l'Aube capture l'essence d'un matin tranquille, alliant la chaleur de l'or vermeil à l'éclat lunaire d'une perle délicatement sélectionnée.\n\nChaque perle est unique, glissant silencieusement le long d'une chaîne fine qui épouse les contours de votre peau. Une pièce pensée pour être ressentie autant que vue, offrant une présence douce et lumineuse tout au long de votre journée.",
    category: "Colliers",
    composition: "Or Vermeil 18K (base de sterling silver recouvert de 5 microns d'or pur) et une perle d'eau douce naturelle de 6-7mm.",
    entretien: "Éviter le contact direct avec l'eau salée, les parfums ou produits corrosifs. Nettoyer doucement avec un chiffon soyeux.",
    livraison: "Livraison standard offerte à Dakar sous 24-48h dans son écrin signature protecteur."
  },
  {
    id: "anneau-aube",
    name: "L'Anneau d'Aube",
    price: 295000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuD_rhaxTHctv2zTjT6Fcxq1nNeQ9oukBz10nQvnbvg_guzpgMckB7wWDutlt55H44-TXO2FSjLv9oOrVXjreXeKyiMf40bdeW1eQPYGACCvWp8EK7eZ4Tm9a2AxArmq51CcgycuU59dsoXMUTwSGLt4xRaeakaCwxZbM0IJQkn-4zkffUzkBKMtHlUwhP014w9EBeJR1XVoO9z-QRdGocJiepoMMxBNmNEkg6jlpy_UNfoeGY4rYa02-UGHz3i2q8-sL246qUMgPAjf",
    description: "Un anneau d'or fin vermeil couronné d'une unique perle d'eau douce d'une rondeur divine et satinée, déposé sur une surface minérale brute.",
    category: "Bagues",
    composition: "Or Jaune Vermeil 18k, Perle d'Eau Douce sélectionnée de classe AAA.",
    entretien: "Préserver des chocs thermiques et chimiques.",
    livraison: "Livré dans sa pochette en lin soyeux à Dakar et dans toutes les régions."
  },
  {
    id: "collier-drop",
    name: "Collier Goutte",
    price: 210000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuB7gWsYEpoIn1-PSxAHu3Z1iB2-snFmQnpDXHsvBJn5h47hsdJwz9ssOyxI0tUGsCFP-DBtODANNFqa2Cw6c6f4s3NUKjh8dHnrk4fDGRF_zyWroJvl9lm9QG1mq0eYkx0Bf0OAEksptf5dDNpdZiwrD5pB3sk5O4BH6rQorMwHbXkJNIHv5ViLJz8vLngZjqryLqRU_5GZn-Y0JYL2BxxSPiNToCrhudyKf5QYsnYU4NGOD8GrpyQ9EHVOcuqfr8MzIrc_gbOiZ3pt",
    description: "Un fil d'or ciselé berçant une perle pendeloque poire comme une goutte de rosée figeant la beauté éphémère d'un instant matinal.",
    category: "Colliers",
    composition: "Monture Vermeil d'or, chaine lasso, perle d'eau douce baroque goutte.",
    entretien: "Évitiez le parfum direct.",
    livraison: "Expédition nationale express assurée."
  },
  {
    id: "pendentif-soie",
    name: "Pendentif Soie",
    price: 180000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBbTdprl3zRswtWSxwgks2MIyIswj1pnecRquqKjFbcrLOfehT5kjO6SvGsB-dQaAZt_bzc28_ue0wFgCr8TJlTx1Nxoi2jZlOkwnpBc6TFzJMgAEn03qAzuXrsPIgWQqwv1z2QoEUYgU5vH2Qw3z4u2-reUCa0vgjQ6cH1RE58Z306Qem5lSBfEXKXOjcDVvcDMtj0XNSUQkdsjUbCTP2bhiKatinltqxooomQ2ijxq76wwDzP0FqAVXyGDFL35qOpEXUP5bB_0T9r",
    description: "Une maille géométrique ajourée en or jaune, qui ondule contre la peau comme une caresse soyeuse et réfléchit délicatement la lumière.",
    category: "Colliers",
    composition: "Or 14 Carats recyclé, cordon de satin de soie réglable.",
    entretien: "Polir de temps en temps avec une chamoisine.",
    livraison: "Présenté sous coffret écrin signature."
  },
  {
    id: "bague-perle-torsade",
    name: "Bague Perle",
    price: 335000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDEMk4UB4dov17x0rtQifZml3hVQ2fNJdqE9pLYm8fAw_FDJKlXDEc7jDQL8pbAJ3cne00EVbspjfycozkLQTnNYpYcJccSoDVqe1gLAxTgf0jtKuZVLjtXh6--aPXE4CQPK5uUZoHSf3xDZOvTXHIBesGZT-BTmPygt_EL4Iz1d8xjEfkO8aCWPJqswzWSk8gpXft_eagiohaL9lbYOynM_qh8YW28iJJd9oaeX-p1KkGcdoP0dGpZUA-WgQyiWW7pWvBT7u2oXQFp",
    description: "Un chef d'oeuvre de joaillerie avec une perle de culture blanche montée sur un berceau d'or jaune asymétrique martelé.",
    category: "Bagues",
    composition: "Or jaune 18K et perle impériale d'eau douce du Pacifique.",
    entretien: "Nettoyage par un professionnel recommandé une fois par an.",
    livraison: "Offerte à Dakar avec certificat d'authenticité."
  },
  {
    id: "creoles-brume",
    name: "Créoles Brume",
    price: 135000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBTfmzMmxZx7ADLj1Ga6KlLx5DXi1_PJreFq7eDtG7sbXOvWPZzzT_-ZONBLnt89wzjx9NCOBHt0W07cVFsJXBtaYK3MzuwI3DxHhTEbwYW7WmRMjx3bbdUCls4_NAmmld5uSmtki6NOd1f3fvpXeqSapOYYRzyVrbPVN9que7el-_D8Rn_tDgBFT_abqNfbTU6owFdItbiJTJaH2NCj4IfwhAr5-SN-33UeVIW8VO4d97YrkMi58KfFk8RMcchmUBlbTZLv-ZDF4Kc",
    description: "Des anneaux d'oreilles épurés en or poli qui captent l'incertitude et la douceur de l'aurore sur un paysage de brume.",
    category: "Boucles d'oreilles",
    composition: "Vermeil or 18k, fermeture sécurisée.",
    entretien: "Éviter les projections d'eau de lessive.",
    livraison: "Livraison standard écologique offerte sur le Sénégal."
  },
  {
    id: "bracelet-etreinte",
    name: "Bracelet Étreinte",
    price: 220000,
    collectionId: "ecrin",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZMC64dgvkhA9zrHozoNhNNSWbYWdT4hQzj8WDYAoibq4DeR97mAWb76bCpqdi1NLYFcfojUxMhUjUfYomSg3hrAaEmddu4JigUxryMyli15xSD9FrRblY9lWA9DAoKY_KByu3kLeO947DDATXZAebdEHuyMOK39B-cvAfY5a9P1l-wx1glq01vTrihi0-niJPGKX9bHCkXUExFuViPLw91FKs-gczlRYec9VyYOkv5Ds-fLhVjD2gw6Sz7A5Fh-UMbTYDjzreqFf5",
    description: "Un tressage complexe d'or souple venant caresser délicatement les courbes de votre poignet, inspiré par l'art ancestral de la soierie.",
    category: "Bracelet",
    composition: "Or jaune vermeil 14 carats texturé.",
    entretien: "Utiliser un pinceau souple avec un peu d'eau savonneuse tiède.",
    livraison: "Sous coffret capitonné de soie brute, livraison expédiée sous 24h."
  },

  // --- L'HÉRITAGE MODESTE (Abayas and modest apparel) ---
  {
    id: "silk-abaya",
    name: "The Silk Abaya",
    price: 120000,
    collectionId: "heritage",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuATCIMNWSevKVbmG37PSJjZo7uh1ja-3O2hCmAMKCncDZZ0hoX0qLFRYi65aX1gOAbrVohKH7-3p5jUGAEoMMIB6NpLIw8fkVIbFlpTqHvuEoVQAQdSu6bHmILdOp9kzpUr39BL9wmntPSdNiM00NjCY145FNYsID6HDxc4pjWEG4qlZoqk8MJeABnwd2VrJ1LgGToHRwrI_QpfvzZbvTHMwXqfBHn8TGyO1pAVmF3SxCjO9_Fx6vj8I77lfpwinA2kmAj6Ic5Y6_5S",
    description: "Un abaya somptueux en soie de sable de couleur d'ivoire doré créant un drapé sculptural lors de chaque impulsion majestueuse.",
    category: "Abaya",
    sizes: ["Unique Fit"],
    composition: "100% Coton de soie bio tissé main.",
    entretien: "Lavage à la main recommandé basse température.",
    livraison: "Livraison standard gratuite au Sénégal."
  },
  {
    id: "heritage-meulfeu",
    name: "The Heritage Meulfeu",
    price: 145000,
    collectionId: "heritage",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAxfQrCUe1M2AovUq77NxFNElvLqHjQ3kBZchUuWjmWthM-pplFReSFqDCYxJ6Nu3EEN7gIqbgLTBparWqOWrvUCOlm02ztw_e3dMU2gDi6vk_jib3ypYy9ScZ4CTqvt4tfcWkox951QuPjTMf65S7oQipRSTtiOF5szVJu-IKFxxQVTsPu6_f86b9OWIg6G6oLegxXN8cgyadk5_tALaIe7_uzVO749inf5fh4mZg5rC-4rvQT8rjm2Hu8nFdhaB1-InAFCvE6yAvA",
    description: "Une étoffe précieuse dans un coloris vert sauge terreux rendant un vibrant hommage aux coutures traditionnelles.",
    category: "Meulfeu",
    sizes: ["Taille Unique"],
    composition: "100% Lin sauvage lavé ultra fin.",
    entretien: "Repassage à la vapeur douce.",
    livraison: "Emballage respectueux et sac biologique de coton offert."
  },
  {
    id: "tailored-set",
    name: "The Tailored Set",
    price: 180000,
    collectionId: "heritage",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuC0xKBwbY5pFvlnZ-KEdPziMGoqJRoRr5nKMlakGIG_xnazU3Oia35sicB8dCGbSje99P3GeuclR6G0U2JscR7J6JixBIWjYTQRk5xPYr0Vfhat0ZcW_J6FddZEsy9Sbmovv-Eu7xspBoSl4Wdg6GJ2WWh-xIHHZv_iHtNlFuMkm53YXO9Y_2WNSmmU5TuVGBBnFigKHeex5LKoVTacLjmJrNnA_0GpxC-uS-MuiCX_f0ItWCWhAyJ745duWaYjICUAvxcOOFbrE65D",
    description: "Un ensemble tailleur asymétrique d'un noir mat absolu drapé fièrement sur un mannequin d'atelier, incarnant une sobriété intemporelle.",
    category: "Sets",
    sizes: ["SM", "ML"],
    composition: "Crêpe de laine fine et viscose naturelle.",
    entretien: "Lavable en programme laine délicat.",
    livraison: "Sous housse protectrice en coton écru, livraison offerte."
  },
  {
    id: "chiffon-drape",
    name: "The Chiffon Drape",
    price: 105000,
    collectionId: "heritage",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuBfr57ilIEtK632OYYPhq0lwKdpHnqkC6SQB-BBy7Ht5h3-T5g4AtepMlmP4QXOgv1itegsuxhpVwc65bT5ePmAqTEcmFKabqbSNqWwW2HQQHnzwsxIL0E0e-xE4TztS-VYqlTkHihpHY1J273g2bnEVoBQMkIWzij6pz0AWNw8FbNgR9h2ecKFUQiK7nRhbj3YecFthZI4P6Rqnjjkt7zkiuWHoKxkNZlN6A3MzUY2HvE6QhLRPjDLNxYjnJxbUC1uXvFvs8NZBw_S",
    description: "Un zoom artistique sur la fluidité d'un voilage en soie sable virevoltant sous une légère brise d'été.",
    category: "Abaya",
    sizes: ["Taille Unique"],
    composition: "100% Organza de soie de mûrier lyonnaise.",
    entretien: "Lavage très doux main, sécher à plat.",
    livraison: "Flacon d'huile parfumée signature offert pour l'écrin."
  },
  {
    id: "espresso-layer",
    name: "The Espresso Layer",
    price: 125000,
    collectionId: "heritage",
    imageUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuAwXT9kS8vWfzBRFBvl8sT4qlUPAU4dPe8lsGeWiGD3CrB6Awg3imojv1PUuZthbyXqr1drLmxntKxAHoj3n8Azy7spfVs4Ur6x-NU3lihYc1tTlULQ5um1rY9opf7pJo9V7hwp4XOipTLNed3YE-KcKF0NXOXyIXNkTH1gJ0i0scJOs_yg2Bd-umgKBHka7QTwwTiU_XwuYHSTSgt8afH9p9oGll6D3sUqGXR_tpLGKaf6IHsRbXGikYeXhXq8L5wNli1wsjvMfslo",
    description: "Une abaya brun d'espresso à étages singuliers, d'un port statutaire et d'un confort optimal pour un port quotidien ou d'occasion.",
    category: "Abaya",
    sizes: ["38", "40", "42"],
    composition: "Mélange coton d'Égypte et lin texturé d'Assise.",
    entretien: "Lavage basse température sans essorage fort.",
    livraison: "Livraison standard gratuite offerte au Sénégal."
  }
];

export const DEFAULT_HOMEPAGE_CONTENT = {
  heroBadge: "Dakar · Mode Responsable",
  heroTitle: "L'Élégance de la Pudeur,\nl'Héritage d'une Mère.",
  heroSubtitle: "Sublimer sans excès. Valoriser sans exposer. Affirmer sans imposer.",
  historyTitle: "Une histoire de transmission",
  historySubtitle: "En hommage à Marieme Fall",
  historyText: "Au cœur de MYRIAM VEIL réside une histoire intime et filiale. La marque puise son inspiration dans l'élégance naturelle, la dignité et la force silencieuse de ma mère, Marieme Fall.\n\nCet héritage ne s'adresse pas seulement aux femmes, mais à toute une génération qui souhaite porter ses valeurs à travers son apparence. Chaque création devient ainsi un symbole de transmission, de respect et de prestance.\n\nPorter MYRIAM VEIL, c'est prolonger cette mémoire à travers une allure faite de retenue, de présence et de profondeur.",
  valeurs: [
    { iconName: "Feather", title: "Pudeur & Élégance", desc: "La modestie est la forme la plus pure du raffinement. Nos créations subliment sans exposer." },
    { iconName: "Leaf", title: "Authenticité", desc: "Ancrage dans les racines culturelles, à travers des pièces emblématiques comme le Meulfeu." },
    { iconName: "Gem", title: "Modernité", desc: "Adaptation des codes traditionnels aux exigences contemporaines, sans compromis sur le sens." },
    { iconName: "Scale", title: "Harmonie", desc: "Cohérence entre silhouettes féminines et masculines, pour une élégance équilibrée." }
  ],
  testimonials: [
    { name: "Aïssatou D.", role: "Dakar, Sénégal", text: "J'ai découvert MYRIAM VEIL lors d'une recherche pour des vêtements qui allient élégance et pudeur. La qualité des tissus et la finesse des finitions m'ont immédiatement séduite." },
    { name: "Mamadou L.", role: "Thiès, Sénégal", text: "Enfin une marque qui comprend l'importance de la retenue sans sacrifier le style. Le sur-mesure m'a permis d'avoir des tenues parfaitement adaptées à ma morphologie." },
    { name: "Fatou S.", role: "Paris, France", text: "Offrir un vêtement MYRIAM VEIL à ma mère a été un moment chargé d'émotion. C'est bien plus qu'un habit, c'est un héritage, une transmission de valeurs." }
  ]
};

