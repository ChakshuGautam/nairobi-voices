// Nairobi County Administrative Hierarchy
// Sub-counties → Wards → Zones

export interface Zone {
  name: string;
}

export interface Ward {
  code: string;
  name: string;
  zones: Zone[];
}

export interface SubCounty {
  name: string;
  wards: Ward[];
}

export const NAIROBI_SUBCOUNTIES: SubCounty[] = [
  {
    name: "Westlands",
    wards: [
      { 
        code: "KILIMANI", 
        name: "Kilimani", 
        zones: [
          { name: "Yaya Centre" },
          { name: "Argwings Kodhek" },
          { name: "Hurlingham" },
          { name: "Valley Arcade" }
        ]
      },
      { 
        code: "KANGEMI", 
        name: "Kangemi", 
        zones: [
          { name: "Kangemi Market" },
          { name: "Mountain View" },
          { name: "Waruku" }
        ]
      },
      { 
        code: "KITISURU", 
        name: "Kitisuru", 
        zones: [
          { name: "Kitisuru" },
          { name: "Nyari" },
          { name: "Rosslyn" }
        ]
      },
      { 
        code: "PARKLANDS_HIGHRIDGE", 
        name: "Parklands/Highridge", 
        zones: [
          { name: "Parklands" },
          { name: "Highridge" },
          { name: "City Park" }
        ]
      },
      { 
        code: "KARURA", 
        name: "Karura", 
        zones: [
          { name: "Muthaiga" },
          { name: "Karura Forest" },
          { name: "Gigiri" }
        ]
      }
    ]
  },
  {
    name: "Starehe",
    wards: [
      { 
        code: "NGARA", 
        name: "Ngara", 
        zones: [
          { name: "Ngara East" },
          { name: "Ngara West" },
          { name: "Pangani" }
        ]
      },
      { 
        code: "NAIROBI_CENTRAL", 
        name: "Nairobi Central", 
        zones: [
          { name: "CBD" },
          { name: "KICC" },
          { name: "Railway Station" },
          { name: "Kencom" }
        ]
      },
      { 
        code: "LANDIMAWE", 
        name: "Landimawe", 
        zones: [
          { name: "Landimawe" },
          { name: "Makongeni" }
        ]
      },
      { 
        code: "NAIROBI_SOUTH", 
        name: "Nairobi South", 
        zones: [
          { name: "South B" },
          { name: "South C" },
          { name: "Nairobi West" }
        ]
      },
      { 
        code: "KARIOKOR", 
        name: "Kariokor", 
        zones: [
          { name: "Kariokor Market" },
          { name: "Ziwani" }
        ]
      }
    ]
  },
  {
    name: "Dagoretti North",
    wards: [
      { 
        code: "KILIMANI_DG", 
        name: "Kilimani", 
        zones: [
          { name: "Kilimani Estate" }
        ]
      },
      { 
        code: "KAWANGWARE", 
        name: "Kawangware", 
        zones: [
          { name: "Kawangware 46" },
          { name: "Kawangware 56" },
          { name: "Gatina" }
        ]
      },
      { 
        code: "GATINA", 
        name: "Gatina", 
        zones: [
          { name: "Gatina" },
          { name: "Riruta Satellite" }
        ]
      },
      { 
        code: "KILELESHWA", 
        name: "Kileleshwa", 
        zones: [
          { name: "Kileleshwa" },
          { name: "Lavington" }
        ]
      },
      { 
        code: "KABIRO", 
        name: "Kabiro", 
        zones: [
          { name: "Kabiro" },
          { name: "Waithaka" }
        ]
      }
    ]
  },
  {
    name: "Dagoretti South",
    wards: [
      { 
        code: "MUTUINI", 
        name: "Mutu-ini", 
        zones: [
          { name: "Mutu-ini" },
          { name: "Ruthimitu" }
        ]
      },
      { 
        code: "NGANDO", 
        name: "Ngando", 
        zones: [
          { name: "Ngando" },
          { name: "Riruta" }
        ]
      },
      { 
        code: "RIRUTA", 
        name: "Riruta", 
        zones: [
          { name: "Riruta" }
        ]
      },
      { 
        code: "UTHIRU_RUTHIMITU", 
        name: "Uthiru/Ruthimitu", 
        zones: [
          { name: "Uthiru" },
          { name: "Ruthimitu" }
        ]
      },
      { 
        code: "WAITHAKA", 
        name: "Waithaka", 
        zones: [
          { name: "Waithaka" }
        ]
      }
    ]
  },
  {
    name: "Lang'ata",
    wards: [
      { 
        code: "KAREN", 
        name: "Karen", 
        zones: [
          { name: "Karen" },
          { name: "Hardy" },
          { name: "Bogani" }
        ]
      },
      { 
        code: "NAIROBI_WEST_LG", 
        name: "Nairobi West", 
        zones: [
          { name: "Nairobi West" },
          { name: "Madaraka" }
        ]
      },
      { 
        code: "MUGUMONI", 
        name: "Mugumo-ini", 
        zones: [
          { name: "Mugumo-ini" },
          { name: "Otiende" }
        ]
      },
      { 
        code: "SOUTHC", 
        name: "South C", 
        zones: [
          { name: "South C" },
          { name: "Nyayo Estate" }
        ]
      },
      { 
        code: "NYAYO_HIGHRISE", 
        name: "Nyayo Highrise", 
        zones: [
          { name: "Nyayo Highrise" }
        ]
      }
    ]
  },
  {
    name: "Kibra",
    wards: [
      { 
        code: "LAINI_SABA", 
        name: "Laini Saba", 
        zones: [
          { name: "Laini Saba" }
        ]
      },
      { 
        code: "LINDI", 
        name: "Lindi", 
        zones: [
          { name: "Lindi" }
        ]
      },
      { 
        code: "MAKINA", 
        name: "Makina", 
        zones: [
          { name: "Makina" }
        ]
      },
      { 
        code: "WOODLEY_SARANGOMBE", 
        name: "Woodley/Kenyatta Golf Course", 
        zones: [
          { name: "Woodley" },
          { name: "Kenyatta Golf Course" }
        ]
      },
      { 
        code: "SARANGOMBE", 
        name: "Sarang'ombe", 
        zones: [
          { name: "Sarang'ombe" }
        ]
      }
    ]
  },
  {
    name: "Embakasi South",
    wards: [
      { 
        code: "IMARA_DAIMA", 
        name: "Imara Daima", 
        zones: [
          { name: "Imara Daima" },
          { name: "Kware" }
        ]
      },
      { 
        code: "KWA_NJENGA", 
        name: "Kwa Njenga", 
        zones: [
          { name: "Kwa Njenga" }
        ]
      },
      { 
        code: "KWA_REUBEN", 
        name: "Kwa Reuben", 
        zones: [
          { name: "Kwa Reuben" }
        ]
      },
      { 
        code: "PIPELINE", 
        name: "Pipeline", 
        zones: [
          { name: "Pipeline" }
        ]
      },
      { 
        code: "KWARE", 
        name: "Kware", 
        zones: [
          { name: "Kware" }
        ]
      }
    ]
  },
  {
    name: "Embakasi North",
    wards: [
      { 
        code: "KARIOBANGI_SOUTH", 
        name: "Kariobangi South", 
        zones: [
          { name: "Kariobangi South" }
        ]
      },
      { 
        code: "DANDORA_AREA_I", 
        name: "Dandora Area I", 
        zones: [
          { name: "Dandora Phase 1" }
        ]
      },
      { 
        code: "DANDORA_AREA_II", 
        name: "Dandora Area II", 
        zones: [
          { name: "Dandora Phase 2" },
          { name: "Dandora Phase 3" }
        ]
      },
      { 
        code: "DANDORA_AREA_III", 
        name: "Dandora Area III", 
        zones: [
          { name: "Dandora Phase 4" }
        ]
      },
      { 
        code: "DANDORA_AREA_IV", 
        name: "Dandora Area IV", 
        zones: [
          { name: "Dandora Phase 5" }
        ]
      }
    ]
  },
  {
    name: "Embakasi Central",
    wards: [
      { 
        code: "KAYOLE_NORTH", 
        name: "Kayole North", 
        zones: [
          { name: "Kayole North" }
        ]
      },
      { 
        code: "KAYOLE_CENTRAL", 
        name: "Kayole Central", 
        zones: [
          { name: "Kayole Central" }
        ]
      },
      { 
        code: "KAYOLE_SOUTH", 
        name: "Kayole South", 
        zones: [
          { name: "Kayole South" }
        ]
      },
      { 
        code: "KOMAROCK", 
        name: "Komarock", 
        zones: [
          { name: "Komarock" }
        ]
      },
      { 
        code: "MATOPENI", 
        name: "Matopeni/Spring Valley", 
        zones: [
          { name: "Matopeni" },
          { name: "Spring Valley" }
        ]
      }
    ]
  },
  {
    name: "Embakasi East",
    wards: [
      { 
        code: "UPPER_SAVANNA", 
        name: "Upper Savanna", 
        zones: [
          { name: "Upper Savanna" }
        ]
      },
      { 
        code: "LOWER_SAVANNA", 
        name: "Lower Savanna", 
        zones: [
          { name: "Lower Savanna" }
        ]
      },
      { 
        code: "EMBAKASI", 
        name: "Embakasi", 
        zones: [
          { name: "Embakasi Village" }
        ]
      },
      { 
        code: "UTAWALA", 
        name: "Utawala", 
        zones: [
          { name: "Utawala" },
          { name: "Mihango" }
        ]
      },
      { 
        code: "MIHANGO", 
        name: "Mihango", 
        zones: [
          { name: "Mihango" }
        ]
      }
    ]
  },
  {
    name: "Embakasi West",
    wards: [
      { 
        code: "UMOJA_I", 
        name: "Umoja I", 
        zones: [
          { name: "Umoja 1" }
        ]
      },
      { 
        code: "UMOJA_II", 
        name: "Umoja II", 
        zones: [
          { name: "Umoja 2" },
          { name: "Umoja Innercore" }
        ]
      },
      { 
        code: "MOWLEM", 
        name: "Mowlem", 
        zones: [
          { name: "Mowlem" }
        ]
      },
      { 
        code: "KARIOBANGI_NORTH", 
        name: "Kariobangi North", 
        zones: [
          { name: "Kariobangi North" }
        ]
      }
    ]
  },
  {
    name: "Makadara",
    wards: [
      { 
        code: "MARINGO_HAMZA", 
        name: "Maringo/Hamza", 
        zones: [
          { name: "Maringo" },
          { name: "Hamza" }
        ]
      },
      { 
        code: "VIWANDANI", 
        name: "Viwandani", 
        zones: [
          { name: "Industrial Area" },
          { name: "Viwandani" }
        ]
      },
      { 
        code: "HARAMBEE", 
        name: "Harambee", 
        zones: [
          { name: "Harambee" },
          { name: "Jericho" }
        ]
      },
      { 
        code: "MAKONGENI_MK", 
        name: "Makongeni", 
        zones: [
          { name: "Makongeni" },
          { name: "Ofafa Jericho" }
        ]
      }
    ]
  },
  {
    name: "Kamukunji",
    wards: [
      { 
        code: "PUMWANI", 
        name: "Pumwani", 
        zones: [
          { name: "Pumwani" },
          { name: "Majengo" }
        ]
      },
      { 
        code: "EASTLEIGH_NORTH", 
        name: "Eastleigh North", 
        zones: [
          { name: "Eastleigh North" },
          { name: "California" }
        ]
      },
      { 
        code: "EASTLEIGH_SOUTH", 
        name: "Eastleigh South", 
        zones: [
          { name: "Eastleigh South" },
          { name: "Airbase" }
        ]
      },
      { 
        code: "AIRBASE", 
        name: "Airbase", 
        zones: [
          { name: "Airbase" }
        ]
      },
      { 
        code: "CALIFORNIA", 
        name: "California", 
        zones: [
          { name: "California" }
        ]
      }
    ]
  },
  {
    name: "Kasarani",
    wards: [
      { 
        code: "CLAY_CITY", 
        name: "Clay City", 
        zones: [
          { name: "Clay City" }
        ]
      },
      { 
        code: "MWIKI", 
        name: "Mwiki", 
        zones: [
          { name: "Mwiki" },
          { name: "Kasarani" }
        ]
      },
      { 
        code: "KASARANI", 
        name: "Kasarani", 
        zones: [
          { name: "Kasarani" },
          { name: "Seasons" }
        ]
      },
      { 
        code: "NJIRU", 
        name: "Njiru", 
        zones: [
          { name: "Njiru" }
        ]
      },
      { 
        code: "RUAI", 
        name: "Ruai", 
        zones: [
          { name: "Ruai" }
        ]
      }
    ]
  },
  {
    name: "Roysambu",
    wards: [
      { 
        code: "GITHURAI", 
        name: "Githurai", 
        zones: [
          { name: "Githurai 44" },
          { name: "Githurai 45" }
        ]
      },
      { 
        code: "KAHAWA_WEST", 
        name: "Kahawa West", 
        zones: [
          { name: "Kahawa West" }
        ]
      },
      { 
        code: "ZIMMERMAN", 
        name: "Zimmerman", 
        zones: [
          { name: "Zimmerman" }
        ]
      },
      { 
        code: "ROYSAMBU", 
        name: "Roysambu", 
        zones: [
          { name: "Roysambu" },
          { name: "Garden Estate" }
        ]
      },
      { 
        code: "KAHAWA", 
        name: "Kahawa", 
        zones: [
          { name: "Kahawa" },
          { name: "Kenyatta University" }
        ]
      }
    ]
  },
  {
    name: "Ruaraka",
    wards: [
      { 
        code: "BABA_DOGO", 
        name: "Baba Dogo", 
        zones: [
          { name: "Baba Dogo" }
        ]
      },
      { 
        code: "UTALII", 
        name: "Utalii", 
        zones: [
          { name: "Utalii" },
          { name: "Muthaiga North" }
        ]
      },
      { 
        code: "MATHARE_NORTH", 
        name: "Mathare North", 
        zones: [
          { name: "Mathare North" }
        ]
      },
      { 
        code: "LUCKY_SUMMER", 
        name: "Lucky Summer", 
        zones: [
          { name: "Lucky Summer" }
        ]
      },
      { 
        code: "KOROGOCHO", 
        name: "Korogocho", 
        zones: [
          { name: "Korogocho" }
        ]
      }
    ]
  },
  {
    name: "Mathare",
    wards: [
      { 
        code: "HOSPITAL", 
        name: "Hospital", 
        zones: [
          { name: "Mathare Hospital" }
        ]
      },
      { 
        code: "MABATINI", 
        name: "Mabatini", 
        zones: [
          { name: "Mabatini" }
        ]
      },
      { 
        code: "HURUMA", 
        name: "Huruma", 
        zones: [
          { name: "Huruma" }
        ]
      },
      { 
        code: "NGEI", 
        name: "Ngei", 
        zones: [
          { name: "Ngei" }
        ]
      },
      { 
        code: "MLANGO_KUBWA", 
        name: "Mlango Kubwa", 
        zones: [
          { name: "Mlango Kubwa" }
        ]
      },
      { 
        code: "KIAMAIKO", 
        name: "Kiamaiko", 
        zones: [
          { name: "Kiamaiko" }
        ]
      }
    ]
  }
];

// Ward center coordinates for reverse geocoding
// These are approximate center points for each ward
export const WARD_COORDINATES: { [wardCode: string]: { lat: number; lng: number; subCounty: string } } = {
  // Westlands
  KILIMANI: { lat: -1.2892, lng: 36.7850, subCounty: "Westlands" },
  KANGEMI: { lat: -1.2650, lng: 36.7450, subCounty: "Westlands" },
  KITISURU: { lat: -1.2350, lng: 36.7800, subCounty: "Westlands" },
  PARKLANDS_HIGHRIDGE: { lat: -1.2620, lng: 36.8150, subCounty: "Westlands" },
  KARURA: { lat: -1.2380, lng: 36.8300, subCounty: "Westlands" },
  
  // Starehe
  NGARA: { lat: -1.2750, lng: 36.8280, subCounty: "Starehe" },
  NAIROBI_CENTRAL: { lat: -1.2864, lng: 36.8219, subCounty: "Starehe" },
  LANDIMAWE: { lat: -1.3050, lng: 36.8350, subCounty: "Starehe" },
  NAIROBI_SOUTH: { lat: -1.3150, lng: 36.8250, subCounty: "Starehe" },
  KARIOKOR: { lat: -1.2780, lng: 36.8400, subCounty: "Starehe" },
  
  // Dagoretti North
  KILIMANI_DG: { lat: -1.2950, lng: 36.7750, subCounty: "Dagoretti North" },
  KAWANGWARE: { lat: -1.2720, lng: 36.7380, subCounty: "Dagoretti North" },
  GATINA: { lat: -1.2800, lng: 36.7300, subCounty: "Dagoretti North" },
  KILELESHWA: { lat: -1.2780, lng: 36.7680, subCounty: "Dagoretti North" },
  KABIRO: { lat: -1.2880, lng: 36.7200, subCounty: "Dagoretti North" },
  
  // Dagoretti South
  MUTUINI: { lat: -1.3050, lng: 36.7100, subCounty: "Dagoretti South" },
  NGANDO: { lat: -1.2980, lng: 36.7250, subCounty: "Dagoretti South" },
  RIRUTA: { lat: -1.2920, lng: 36.7150, subCounty: "Dagoretti South" },
  UTHIRU_RUTHIMITU: { lat: -1.2700, lng: 36.6950, subCounty: "Dagoretti South" },
  WAITHAKA: { lat: -1.2850, lng: 36.6900, subCounty: "Dagoretti South" },
  
  // Lang'ata
  KAREN: { lat: -1.3200, lng: 36.7100, subCounty: "Lang'ata" },
  NAIROBI_WEST_LG: { lat: -1.3080, lng: 36.8100, subCounty: "Lang'ata" },
  MUGUMONI: { lat: -1.3150, lng: 36.7900, subCounty: "Lang'ata" },
  SOUTHC: { lat: -1.3100, lng: 36.8200, subCounty: "Lang'ata" },
  NYAYO_HIGHRISE: { lat: -1.3180, lng: 36.8280, subCounty: "Lang'ata" },
  
  // Kibra
  LAINI_SABA: { lat: -1.3120, lng: 36.7850, subCounty: "Kibra" },
  LINDI: { lat: -1.3080, lng: 36.7820, subCounty: "Kibra" },
  MAKINA: { lat: -1.3100, lng: 36.7780, subCounty: "Kibra" },
  WOODLEY_SARANGOMBE: { lat: -1.2980, lng: 36.7750, subCounty: "Kibra" },
  SARANGOMBE: { lat: -1.3050, lng: 36.7700, subCounty: "Kibra" },
  
  // Embakasi South
  IMARA_DAIMA: { lat: -1.3250, lng: 36.8950, subCounty: "Embakasi South" },
  KWA_NJENGA: { lat: -1.3180, lng: 36.8850, subCounty: "Embakasi South" },
  KWA_REUBEN: { lat: -1.3120, lng: 36.8780, subCounty: "Embakasi South" },
  PIPELINE: { lat: -1.3080, lng: 36.8920, subCounty: "Embakasi South" },
  KWARE: { lat: -1.3200, lng: 36.8800, subCounty: "Embakasi South" },
  
  // Embakasi North
  KARIOBANGI_SOUTH: { lat: -1.2650, lng: 36.8750, subCounty: "Embakasi North" },
  DANDORA_AREA_I: { lat: -1.2520, lng: 36.8950, subCounty: "Embakasi North" },
  DANDORA_AREA_II: { lat: -1.2480, lng: 36.9050, subCounty: "Embakasi North" },
  DANDORA_AREA_III: { lat: -1.2550, lng: 36.9100, subCounty: "Embakasi North" },
  DANDORA_AREA_IV: { lat: -1.2600, lng: 36.9150, subCounty: "Embakasi North" },
  
  // Embakasi Central
  KAYOLE_NORTH: { lat: -1.2750, lng: 36.9050, subCounty: "Embakasi Central" },
  KAYOLE_CENTRAL: { lat: -1.2820, lng: 36.9100, subCounty: "Embakasi Central" },
  KAYOLE_SOUTH: { lat: -1.2900, lng: 36.9150, subCounty: "Embakasi Central" },
  KOMAROCK: { lat: -1.2650, lng: 36.9200, subCounty: "Embakasi Central" },
  MATOPENI: { lat: -1.2580, lng: 36.9300, subCounty: "Embakasi Central" },
  
  // Embakasi East
  UPPER_SAVANNA: { lat: -1.2450, lng: 36.9450, subCounty: "Embakasi East" },
  LOWER_SAVANNA: { lat: -1.2550, lng: 36.9500, subCounty: "Embakasi East" },
  EMBAKASI: { lat: -1.3050, lng: 36.9000, subCounty: "Embakasi East" },
  UTAWALA: { lat: -1.2700, lng: 36.9600, subCounty: "Embakasi East" },
  MIHANGO: { lat: -1.2600, lng: 36.9700, subCounty: "Embakasi East" },
  
  // Embakasi West
  UMOJA_I: { lat: -1.2780, lng: 36.8850, subCounty: "Embakasi West" },
  UMOJA_II: { lat: -1.2850, lng: 36.8900, subCounty: "Embakasi West" },
  MOWLEM: { lat: -1.2720, lng: 36.8950, subCounty: "Embakasi West" },
  KARIOBANGI_NORTH: { lat: -1.2580, lng: 36.8700, subCounty: "Embakasi West" },
  
  // Makadara
  MARINGO_HAMZA: { lat: -1.2950, lng: 36.8580, subCounty: "Makadara" },
  VIWANDANI: { lat: -1.3020, lng: 36.8650, subCounty: "Makadara" },
  HARAMBEE: { lat: -1.2880, lng: 36.8520, subCounty: "Makadara" },
  MAKONGENI: { lat: -1.2920, lng: 36.8480, subCounty: "Makadara" },
  PUMWANI: { lat: -1.2780, lng: 36.8550, subCounty: "Makadara" },
  
  // Kamukunji
  EASTLEIGH_NORTH: { lat: -1.2680, lng: 36.8500, subCounty: "Kamukunji" },
  EASTLEIGH_SOUTH: { lat: -1.2750, lng: 36.8550, subCounty: "Kamukunji" },
  AIRBASE: { lat: -1.2600, lng: 36.8600, subCounty: "Kamukunji" },
  CALIFORNIA: { lat: -1.2720, lng: 36.8620, subCounty: "Kamukunji" },
  PUMWANI_KMK: { lat: -1.2680, lng: 36.8450, subCounty: "Kamukunji" },
  
  // Kasarani
  CLAY_CITY: { lat: -1.2200, lng: 36.8950, subCounty: "Kasarani" },
  MWIKI: { lat: -1.2100, lng: 36.9050, subCounty: "Kasarani" },
  KASARANI: { lat: -1.2280, lng: 36.8850, subCounty: "Kasarani" },
  NJIRU: { lat: -1.2350, lng: 36.9200, subCounty: "Kasarani" },
  RUAI: { lat: -1.2450, lng: 36.9800, subCounty: "Kasarani" },
  
  // Roysambu
  GITHURAI: { lat: -1.2050, lng: 36.9150, subCounty: "Roysambu" },
  KAHAWA_WEST: { lat: -1.1950, lng: 36.9050, subCounty: "Roysambu" },
  ZIMMERMAN: { lat: -1.2150, lng: 36.8900, subCounty: "Roysambu" },
  ROYSAMBU: { lat: -1.2080, lng: 36.8780, subCounty: "Roysambu" },
  KAHAWA: { lat: -1.1850, lng: 36.9250, subCounty: "Roysambu" },
  
  // Mathare
  HOSPITAL: { lat: -1.2580, lng: 36.8600, subCounty: "Mathare" },
  MABATINI: { lat: -1.2620, lng: 36.8580, subCounty: "Mathare" },
  HURUMA: { lat: -1.2550, lng: 36.8650, subCounty: "Mathare" },
  NGEI: { lat: -1.2500, lng: 36.8620, subCounty: "Mathare" },
  MLANGO_KUBWA: { lat: -1.2480, lng: 36.8550, subCounty: "Mathare" },
  KIAMAIKO: { lat: -1.2530, lng: 36.8700, subCounty: "Mathare" },
};

// Helper functions
export function getWardsBySubCounty(subCountyName: string): Ward[] {
  const subCounty = NAIROBI_SUBCOUNTIES.find(sc => sc.name === subCountyName);
  return subCounty?.wards || [];
}

export function getZonesByWard(subCountyName: string, wardCode: string): Zone[] {
  const subCounty = NAIROBI_SUBCOUNTIES.find(sc => sc.name === subCountyName);
  const ward = subCounty?.wards.find(w => w.code === wardCode);
  return ward?.zones || [];
}

export function getWardByCode(wardCode: string): { ward: Ward; subCounty: string } | null {
  for (const subCounty of NAIROBI_SUBCOUNTIES) {
    const ward = subCounty.wards.find(w => w.code === wardCode);
    if (ward) {
      return { ward, subCounty: subCounty.name };
    }
  }
  return null;
}

// Calculate distance between two coordinates in kilometers (Haversine formula)
function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Reverse geocode: find the nearest ward based on lat/lng
export function reverseGeocodeToWard(lat: number, lng: number): { 
  wardCode: string; 
  wardName: string; 
  subCounty: string;
  zone: string;
} | null {
  let nearestWard: string | null = null;
  let nearestDistance = Infinity;
  let nearestSubCounty = '';

  for (const [wardCode, coords] of Object.entries(WARD_COORDINATES)) {
    const distance = haversineDistance(lat, lng, coords.lat, coords.lng);
    if (distance < nearestDistance) {
      nearestDistance = distance;
      nearestWard = wardCode;
      nearestSubCounty = coords.subCounty;
    }
  }

  // Only return if within reasonable distance (e.g., 5km from ward center)
  if (nearestWard && nearestDistance < 5) {
    const wardInfo = getWardByCode(nearestWard);
    if (wardInfo) {
      // Get the first zone as default
      const zones = getZonesByWard(nearestSubCounty, nearestWard);
      return {
        wardCode: nearestWard,
        wardName: wardInfo.ward.name,
        subCounty: nearestSubCounty,
        zone: zones.length > 0 ? zones[0].name : ''
      };
    }
  }

  return null;
}
