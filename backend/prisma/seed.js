const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const rawDestinations = `
Mumbai,India,Asia,19.0760,72.8777|Delhi,India,Asia,28.6139,77.2090|Pune,India,Asia,18.5204,73.8567|Goa,India,Asia,15.2993,74.1240|Jaipur,India,Asia,26.9124,75.7873|Udaipur,India,Asia,24.5854,73.7125|Agra,India,Asia,27.1767,78.0081|Varanasi,India,Asia,25.3176,82.9739|Bengaluru,India,Asia,12.9716,77.5946|Hyderabad,India,Asia,17.3850,78.4867|Chennai,India,Asia,13.0827,80.2707|Kolkata,India,Asia,22.5726,88.3639|Kochi,India,Asia,9.9312,76.2673|Manali,India,Asia,32.2396,77.1887|Shimla,India,Asia,31.1048,77.1734|Srinagar,India,Asia,34.0837,74.7973|Amritsar,India,Asia,31.6340,74.8723|Rishikesh,India,Asia,30.0869,78.2676|Jaisalmer,India,Asia,26.9157,70.9083|Ahmedabad,India,Asia,23.0225,72.5714|Mysuru,India,Asia,12.2958,76.6394|Ooty,India,Asia,11.4100,76.6950|Darjeeling,India,Asia,27.0360,88.2627
Paris,France,Europe,48.8566,2.3522|Nice,France,Europe,43.7102,7.2620|Lyon,France,Europe,45.7640,4.8357|Marseille,France,Europe,43.2965,5.3698|Bordeaux,France,Europe,44.8378,-0.5792|Strasbourg,France,Europe,48.5734,7.7521|Cannes,France,Europe,43.5528,7.0174|Toulouse,France,Europe,43.6047,1.4442|Annecy,France,Europe,45.8992,6.1294|Montpellier,France,Europe,43.6108,3.8767|Avignon,France,Europe,43.9493,4.8055
Tokyo,Japan,Asia,35.6762,139.6503|Kyoto,Japan,Asia,35.0116,135.7681|Osaka,Japan,Asia,34.6937,135.5023|Hiroshima,Japan,Asia,34.3853,132.4553|Nara,Japan,Asia,34.6851,135.8048|Sapporo,Japan,Asia,43.0618,141.3545|Fukuoka,Japan,Asia,33.5902,130.4017|Naha,Japan,Asia,26.2124,127.6809|Hakone,Japan,Asia,35.2324,139.1069|Nagoya,Japan,Asia,35.1815,136.9066|Kobe,Japan,Asia,34.6901,135.1955|Nikko,Japan,Asia,36.7199,139.6982
Rome,Italy,Europe,41.9028,12.4964|Milan,Italy,Europe,45.4642,9.1900|Venice,Italy,Europe,45.4408,12.3155|Florence,Italy,Europe,43.7696,11.2558|Naples,Italy,Europe,40.8518,14.2681|Bologna,Italy,Europe,44.4949,11.3426|Pisa,Italy,Europe,43.7228,10.4017|Verona,Italy,Europe,45.4384,10.9916|Amalfi,Italy,Europe,40.6333,14.6029|Turin,Italy,Europe,45.0703,7.6869|Palermo,Italy,Europe,38.1157,13.3615|Capri,Italy,Europe,40.5507,14.2426|Cinque Terre,Italy,Europe,44.1271,9.7092
New York,USA,North America,40.7128,-74.0060|Los Angeles,USA,North America,34.0522,-118.2437|San Francisco,USA,North America,37.7749,-122.4194|Las Vegas,USA,North America,36.1699,-115.1398|Miami,USA,North America,25.7617,-80.1918|Chicago,USA,North America,41.8781,-87.6298|Boston,USA,North America,42.3601,-71.0589|Seattle,USA,North America,47.6062,-122.3321|Washington DC,USA,North America,38.9072,-77.0369|Orlando,USA,North America,28.5383,-81.3792|Honolulu,USA,North America,21.3069,-157.8583|San Diego,USA,North America,32.7157,-117.1611|New Orleans,USA,North America,29.9511,-90.0715|Austin,USA,North America,30.2672,-97.7431|Nashville,USA,North America,36.1627,-86.7816
London,United Kingdom,Europe,51.5074,-0.1278|Edinburgh,United Kingdom,Europe,55.9533,-3.1883|Manchester,United Kingdom,Europe,53.4808,-2.2426|Bath,United Kingdom,Europe,51.3758,-2.3599|Liverpool,United Kingdom,Europe,53.4084,-2.9916|Cardiff,United Kingdom,Europe,51.4816,-3.1791
Barcelona,Spain,Europe,41.3851,2.1734|Madrid,Spain,Europe,40.4168,-3.7038|Seville,Spain,Europe,37.3891,-5.9845|Valencia,Spain,Europe,39.4699,-0.3774|Granada,Spain,Europe,37.1773,-3.5986|Ibiza,Spain,Europe,38.9067,1.4206
Berlin,Germany,Europe,52.5200,13.4050|Munich,Germany,Europe,48.1351,11.5820|Frankfurt,Germany,Europe,50.1109,8.6821|Hamburg,Germany,Europe,53.5511,9.9937|Cologne,Germany,Europe,50.9375,6.9603
Amsterdam,Netherlands,Europe,52.3676,4.9041|Rotterdam,Netherlands,Europe,51.9225,4.4792|The Hague,Netherlands,Europe,52.0705,4.3007
Vienna,Austria,Europe,48.2082,16.3738|Salzburg,Austria,Europe,47.8095,13.0550|Innsbruck,Austria,Europe,47.2692,11.4041
Zurich,Switzerland,Europe,47.3769,8.5417|Geneva,Switzerland,Europe,46.2044,6.1432|Lucerne,Switzerland,Europe,47.0502,8.3093|Zermatt,Switzerland,Europe,46.0207,7.7491
Prague,Czech Republic,Europe,50.0755,14.4378|Budapest,Hungary,Europe,47.4979,19.0402|Krakow,Poland,Europe,50.0647,19.9450|Warsaw,Poland,Europe,52.2297,21.0122|Dubrovnik,Croatia,Europe,42.6507,18.0944|Split,Croatia,Europe,43.5081,16.4402|Athens,Greece,Europe,37.9838,23.7275|Santorini,Greece,Europe,36.3932,25.4615|Lisbon,Portugal,Europe,38.7223,-9.1393|Porto,Portugal,Europe,41.1579,-8.6291
Dublin,Ireland,Europe,53.3498,-6.2603|Reykjavik,Iceland,Europe,64.1466,-21.9426|Oslo,Norway,Europe,59.9139,10.7522|Stockholm,Sweden,Europe,59.3293,18.0686|Copenhagen,Denmark,Europe,55.6761,12.5683|Helsinki,Finland,Europe,60.1695,24.9354
Beijing,China,Asia,39.9042,116.4074|Shanghai,China,Asia,31.2304,121.4737|Xi'an,China,Asia,34.3416,108.9398|Seoul,South Korea,Asia,37.5665,126.9780|Jeju,South Korea,Asia,33.4996,126.5312|Bangkok,Thailand,Asia,13.7563,100.5018|Chiang Mai,Thailand,Asia,18.7953,98.9620|Phuket,Thailand,Asia,7.9519,98.3381|Singapore,Singapore,Asia,1.3521,103.8198|Kuala Lumpur,Malaysia,Asia,3.1390,101.6869|Penang,Malaysia,Asia,5.4141,100.3288|Bali,Indonesia,Asia,-8.4095,115.1889|Jakarta,Indonesia,Asia,-6.2088,106.8456|Hanoi,Vietnam,Asia,21.0285,105.8542|Ho Chi Minh City,Vietnam,Asia,10.8231,106.6297|Manila,Philippines,Asia,14.5995,120.9842|Boracay,Philippines,Asia,11.9674,121.9248|Siem Reap,Cambodia,Asia,13.3611,103.8606|Phnom Penh,Cambodia,Asia,11.5564,104.9282|Luang Prabang,Laos,Asia,19.8833,102.1333|Kathmandu,Nepal,Asia,27.7172,85.3240|Colombo,Sri Lanka,Asia,6.9271,79.8612|Male,Maldives,Asia,4.1755,73.5093|Thimphu,Bhutan,Asia,27.4728,89.6390|Dhaka,Bangladesh,Asia,23.8103,90.4125
Dubai,UAE,Asia,25.2048,55.2708|Abu Dhabi,UAE,Asia,24.4539,54.3773|Riyadh,Saudi Arabia,Asia,24.7136,46.6753|Jeddah,Saudi Arabia,Asia,21.4858,39.1925|Doha,Qatar,Asia,25.2854,51.5310|Muscat,Oman,Asia,23.5859,58.4059|Amman,Jordan,Asia,31.9522,35.9334|Petra,Jordan,Asia,30.3285,35.4444|Jerusalem,Israel,Asia,31.7683,35.2137|Tel Aviv,Israel,Asia,32.0853,34.7818|Istanbul,Turkey,Asia,41.0082,28.9784|Cappadocia,Turkey,Asia,38.6431,34.8303|Yerevan,Armenia,Asia,40.1872,44.5152|Baku,Azerbaijan,Asia,40.4093,49.8671|Tbilisi,Georgia,Asia,41.7151,44.8271|Almaty,Kazakhstan,Asia,43.2220,76.8512|Tashkent,Uzbekistan,Asia,41.2995,69.2401|Ulaanbaatar,Mongolia,Asia,47.9200,106.9200|Taipei,Taiwan,Asia,25.0330,121.5654|Hong Kong,Hong Kong,Asia,22.3193,114.1694|Macau,Macau,Asia,22.1987,113.5439
Toronto,Canada,North America,43.6510,-79.3470|Vancouver,Canada,North America,49.2827,-123.1207|Montreal,Canada,North America,45.5017,-73.5673|Cancun,Mexico,North America,21.1619,-86.8515|Mexico City,Mexico,North America,19.4326,-99.1332|San Jose,Costa Rica,North America,9.9281,-84.0907|Panama City,Panama,North America,8.9824,-79.5199|Guatemala City,Guatemala,North America,14.6349,-90.5069|Havana,Cuba,North America,23.1136,-82.3666|Punta Cana,Dominican Republic,North America,18.5820,-68.4055|Nassau,Bahamas,North America,25.0480,-77.3554
Rio de Janeiro,Brazil,South America,-22.9068,-43.1729|Sao Paulo,Brazil,South America,-23.5505,-46.6333|Buenos Aires,Argentina,South America,-34.6037,-58.3816|Santiago,Chile,South America,-33.4489,-70.6693|Lima,Peru,South America,-12.0464,-77.0428|Cusco,Peru,South America,-13.5320,-71.9675|Bogota,Colombia,South America,4.7110,-74.0721|Medellin,Colombia,South America,6.2442,-75.5812|Quito,Ecuador,South America,-0.1807,-78.4678|La Paz,Bolivia,South America,-16.4897,-68.1193
Cape Town,South Africa,Africa,-33.9249,18.4241|Johannesburg,South Africa,Africa,-26.2041,28.0473|Cairo,Egypt,Africa,30.0444,31.2357|Luxor,Egypt,Africa,25.6872,32.6396|Marrakech,Morocco,Africa,31.6295,-7.9811|Nairobi,Kenya,Africa,-1.2921,36.8219|Zanzibar City,Tanzania,Africa,-6.1659,39.1990|Port Louis,Mauritius,Africa,-20.1609,57.5012|Victoria,Seychelles,Africa,-4.6191,55.4513|Tunis,Tunisia,Africa,36.8065,10.1815|Accra,Ghana,Africa,5.6037,-0.1870|Lagos,Nigeria,Africa,6.5244,3.3792|Windhoek,Namibia,Africa,-22.5609,17.0658|Kigali,Rwanda,Africa,-1.9441,30.0619|Addis Ababa,Ethiopia,Africa,9.0320,38.7482
Sydney,Australia,Oceania,-33.8688,151.2093|Melbourne,Australia,Oceania,-37.8136,144.9631|Auckland,New Zealand,Oceania,-36.8485,174.7633|Queenstown,New Zealand,Oceania,-45.0312,168.6626|Suva,Fiji,Oceania,-18.1416,178.4419|Papeete,French Polynesia,Oceania,-17.5334,-149.5667
`;

// Helper for consistent randomization (deterministic based on seed)
let seedValue = 12345;
function random() {
    let t = seedValue += 0x6D2B79F5;
    t = Math.imul(t ^ t >>> 15, t | 1);
    t ^= t + Math.imul(t ^ t >>> 7, t | 61);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
}
function randomInt(min, max) {
    return Math.floor(random() * (max - min + 1)) + min;
}
function randomFloat(min, max, decimals = 2) {
    return parseFloat((random() * (max - min) + min).toFixed(decimals));
}
function randomChoice(arr) {
    return arr[Math.floor(random() * arr.length)];
}

const currencyMap = {
    "India": "INR", "France": "EUR", "Japan": "JPY", "Italy": "EUR", "USA": "USD", "United Kingdom": "GBP",
    "Spain": "EUR", "Germany": "EUR", "Netherlands": "EUR", "Austria": "EUR", "Switzerland": "CHF",
    "Czech Republic": "CZK", "Hungary": "HUF", "Poland": "PLN", "Croatia": "EUR", "Greece": "EUR",
    "Portugal": "EUR", "Ireland": "EUR", "Iceland": "ISK", "Norway": "NOK", "Sweden": "SEK",
    "Denmark": "DKK", "Finland": "EUR", "China": "CNY", "South Korea": "KRW", "Thailand": "THB",
    "Singapore": "SGD", "Malaysia": "MYR", "Indonesia": "IDR", "Vietnam": "VND", "Philippines": "PHP",
    "Cambodia": "KHR", "Laos": "LAK", "Nepal": "NPR", "Sri Lanka": "LKR", "Maldives": "MVR",
    "Bhutan": "BTN", "Bangladesh": "BDT", "UAE": "AED", "Saudi Arabia": "SAR", "Qatar": "QAR",
    "Oman": "OMR", "Jordan": "JOD", "Israel": "ILS", "Turkey": "TRY", "Armenia": "AMD",
    "Azerbaijan": "AZN", "Georgia": "GEL", "Kazakhstan": "KZT", "Uzbekistan": "UZS", "Mongolia": "MNT",
    "Taiwan": "TWD", "Hong Kong": "HKD", "Macau": "MOP", "Canada": "CAD", "Mexico": "MXN",
    "Costa Rica": "CRC", "Panama": "PAB", "Guatemala": "GTQ", "Cuba": "CUP", "Dominican Republic": "DOP",
    "Bahamas": "BSD", "Brazil": "BRL", "Argentina": "ARS", "Chile": "CLP", "Peru": "PEN",
    "Colombia": "COP", "Ecuador": "USD", "Bolivia": "BOB", "South Africa": "ZAR", "Egypt": "EGP",
    "Morocco": "MAD", "Kenya": "KES", "Tanzania": "TZS", "Mauritius": "MUR", "Seychelles": "SCR",
    "Tunisia": "TND", "Ghana": "GHS", "Nigeria": "NGN", "Namibia": "NAD", "Rwanda": "RWF",
    "Ethiopia": "ETB", "Australia": "AUD", "New Zealand": "NZD", "Fiji": "FJD", "French Polynesia": "XPF"
};

const attractionsTemplates = [
    { cat: "Sightseeing", base: "City Center Explorer", desc: "Discover the vibrant heart of the city." },
    { cat: "Historical", base: "Ancient Ruins", desc: "Step back in time at this historic landmark." },
    { cat: "Museum", base: "National Museum", desc: "Explore extensive collections of art and history." },
    { cat: "Nature", base: "Botanical Gardens", desc: "Relax in beautifully curated natural landscapes." },
    { cat: "Adventure", base: "Mountain Trail", desc: "An exhilarating hike with breathtaking views." },
    { cat: "Beach", base: "Golden Sands Beach", desc: "Enjoy the sun and surf at a premier beach." },
    { cat: "Food", base: "Street Food Market", desc: "Taste local delicacies and authentic flavors." },
    { cat: "Shopping", base: "Grand Bazaar", desc: "Shop for unique souvenirs and designer goods." },
    { cat: "Culture", base: "Cultural Performance Art", desc: "Experience traditional music and dance." },
    { cat: "Religious", base: "Grand Temple / Cathedral", desc: "A serene and architecturally stunning spiritual site." },
    { cat: "Entertainment", base: "Theme Park", desc: "Fun for all ages with thrilling rides and shows." },
    { cat: "Family", base: "Aquarium & Zoo", desc: "Discover exotic wildlife and marine creatures." }
];

async function main() {
    console.log("🌱 Starting global travel data seed...");
    
    // Parse destinations
    const rows = rawDestinations.trim().split('|').map(r => r.trim()).filter(Boolean);
    const parsedDestinations = [];
    
    for (const row of rows) {
        const parts = row.split(/,(?![^[]*])/);
        if (parts.length >= 5) {
            const cityName = parts[0].replace(/\n/g, '').trim();
            if (!cityName) continue;
            const country = parts[1].trim();
            const region = parts[2].trim();
            const lat = parseFloat(parts[3]);
            const lng = parseFloat(parts[4]);
            
            parsedDestinations.push({
                cityName, country, region, lat, lng
            });
        }
    }
    
    let destCount = 0, attrCount = 0, accCount = 0, foodCount = 0, transCount = 0, seasonCount = 0;
    
    // Create Destinations
    const createdDestinationsMap = {}; // name_country -> id
    
    for (const dest of parsedDestinations) {
        const currency = currencyMap[dest.country] || "USD";
        const baseMultiplier = (region => {
            if (region === 'Europe' || region === 'North America' || region === 'Oceania') return 1.0;
            if (region === 'Asia' || region === 'South America') return 0.4;
            return 0.3; // Africa
        })(dest.region);
        
        const destinationData = {
            cityName: dest.cityName,
            country: dest.country,
            region: dest.region,
            latitude: dest.lat,
            longitude: dest.lng,
            description: `Experience the wonders of ${dest.cityName}, ${dest.country}. A vibrant destination in ${dest.region}.`,
            averageDailyCost: randomFloat(50, 200) * baseMultiplier,
            budgetDailyCost: randomFloat(20, 60) * baseMultiplier,
            midRangeDailyCost: randomFloat(60, 150) * baseMultiplier,
            luxuryDailyCost: randomFloat(150, 400) * baseMultiplier,
            recommendedDays: randomInt(2, 7),
            currency: currency,
            imageUrl: `https://source.unsplash.com/800x600/?${encodeURIComponent(dest.cityName)},${encodeURIComponent(dest.country)}`
        };

        const upsertedDest = await prisma.destination.upsert({
            where: {
                cityName_country: {
                    cityName: dest.cityName,
                    country: dest.country
                }
            },
            update: destinationData,
            create: destinationData
        });
        
        createdDestinationsMap[`${dest.cityName}_${dest.country}`] = upsertedDest.id;
        destCount++;
        
        // 2. Attractions (3-6 per destination)
        const numAttractions = randomInt(3, 6);
        for (let i = 0; i < numAttractions; i++) {
            const tmpl = randomChoice(attractionsTemplates);
            const indoorOut = randomChoice(["INDOOR", "OUTDOOR", "BOTH"]);
            const attractionData = {
                destinationId: upsertedDest.id,
                name: `${dest.cityName} ${tmpl.base} ${i + 1}`,
                category: tmpl.cat,
                description: tmpl.desc,
                latitude: dest.lat + randomFloat(-0.05, 0.05, 4),
                longitude: dest.lng + randomFloat(-0.05, 0.05, 4),
                estimatedVisitHours: randomFloat(1, 5, 1),
                entranceFee: randomChoice([0, randomFloat(5, 50) * baseMultiplier]),
                currency: currency,
                averageRating: randomFloat(3.5, 5.0, 1),
                popularityScore: randomInt(50, 100),
                indoorOutdoor: indoorOut,
                recommended: randomInt(1, 10) > 2
            };
            
            // Just create, no complex unique constraint for attractions exists, but wait, if it runs twice it duplicates.
            // Let's use findFirst then update/create
            const existingAtt = await prisma.attraction.findFirst({
                where: { destinationId: upsertedDest.id, name: attractionData.name }
            });
            if (existingAtt) {
                await prisma.attraction.update({ where: { id: existingAtt.id }, data: attractionData });
            } else {
                await prisma.attraction.create({ data: attractionData });
            }
            attrCount++;
        }
        
        // 3. AccommodationCost
        const accData = {
            destinationId: upsertedDest.id,
            budgetPerNight: randomFloat(15, 50) * baseMultiplier,
            midRangePerNight: randomFloat(50, 150) * baseMultiplier,
            luxuryPerNight: randomFloat(150, 500) * baseMultiplier,
            currency: currency
        };
        await prisma.accommodationCost.upsert({
            where: { destinationId: upsertedDest.id },
            update: accData,
            create: accData
        });
        accCount++;

        // 4. FoodCost
        const foodData = {
            destinationId: upsertedDest.id,
            budgetPerDay: randomFloat(10, 30) * baseMultiplier,
            midRangePerDay: randomFloat(30, 80) * baseMultiplier,
            luxuryPerDay: randomFloat(80, 200) * baseMultiplier,
            currency: currency
        };
        await prisma.foodCost.upsert({
            where: { destinationId: upsertedDest.id },
            update: foodData,
            create: foodData
        });
        foodCount++;
        
        // 5. SeasonalInfo
        let peak, off;
        if (dest.region === 'Europe' || dest.region === 'North America') { peak = "June-August"; off = "November-February"; }
        else if (dest.region === 'Asia') { peak = "November-March"; off = "June-September"; }
        else { peak = "December-February"; off = "June-August"; }
        
        const seasonData = {
            destinationId: upsertedDest.id,
            bestTravelMonths: peak,
            peakSeason: peak,
            offSeason: off,
            weatherCategory: randomChoice(["Tropical", "Temperate", "Arid", "Continental"]),
            seasonalMultiplier: randomFloat(1.2, 1.8, 1)
        };
        await prisma.seasonalInfo.upsert({
            where: { destinationId: upsertedDest.id },
            update: seasonData,
            create: seasonData
        });
        seasonCount++;
    }
    
    // 6. TransportationOption
    // Connect some cities. Let's just create 3 outgoing routes for each city to random other cities in same country/region
    for (let i = 0; i < parsedDestinations.length; i++) {
        const origin = parsedDestinations[i];
        const originId = createdDestinationsMap[`${origin.cityName}_${origin.country}`];
        
        // Pick up to 3 random destinations in same country
        const sameCountry = parsedDestinations.filter(d => d.country === origin.country && d.cityName !== origin.cityName);
        const targets = [];
        while(targets.length < Math.min(3, sameCountry.length)) {
            const t = randomChoice(sameCountry);
            if (!targets.includes(t)) targets.push(t);
        }
        
        for (const t of targets) {
            const targetId = createdDestinationsMap[`${t.cityName}_${t.country}`];
            const transportType = randomChoice(["FLIGHT", "TRAIN", "BUS"]);
            const transData = {
                originDestinationId: originId,
                destinationId: targetId,
                transportType: transportType,
                estimatedCost: randomFloat(20, 200),
                currency: currencyMap[origin.country] || "USD",
                estimatedDurationHours: randomFloat(1, 12, 1)
            };
            
            await prisma.transportationOption.upsert({
                where: {
                    originDestinationId_destinationId_transportType: {
                        originDestinationId: originId,
                        destinationId: targetId,
                        transportType: transportType
                    }
                },
                update: transData,
                create: transData
            });
            transCount++;
        }
    }
    
    console.log("✅ Database expanded successfully!");
    console.log("==========================================");
    console.log(`Destination: ${destCount}`);
    console.log(`Attraction: ${attrCount}`);
    console.log(`AccommodationCost: ${accCount}`);
    console.log(`FoodCost: ${foodCount}`);
    console.log(`TransportationOption: ${transCount}`);
    console.log(`SeasonalInfo: ${seasonCount}`);
    console.log("==========================================");
}

main()
    .catch(e => {
        console.error("❌ Seed failed:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });