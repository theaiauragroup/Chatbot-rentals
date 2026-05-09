import type { BookingRange, Vehicle, VehicleCategory, VehicleStatus, Feature, Transmission, Fuel } from "../types";

// Real car photography from Unsplash (free, royalty-free).
// Pattern: https://images.unsplash.com/photo-{id}?auto=format&fit=crop&w=900&q=80
// VehicleCard / VehicleDetail / PhotoManager all render via <img> with onError → falls back to a category-tinted gradient if a URL is unreachable.
const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=900&q=80`;

const PHOTOS = {
  // Economy / compact sedans (silver, white, neutral)
  sedanSilver: [u("1502877338535-766e1452684a"), u("1542362567-b07e54358753")],
  sedanWhite: [u("1542228262-3d663b306a53"), u("1502877338535-766e1452684a")],
  // Compact / hatchback variety (red, blue)
  compactRed: [u("1494976388531-d1058494cdd8"), u("1542362567-b07e54358753")],
  compactBlue: [u("1552519507-da3b142c6e3d"), u("1494976388531-d1058494cdd8")],
  // SUVs (white, dark)
  suvWhite: [u("1568605117036-5fe5e7bab0b7"), u("1606664515524-ed2f786a0bd6")],
  suvDark: [u("1606664515524-ed2f786a0bd6"), u("1568605117036-5fe5e7bab0b7")],
  // Luxury (black sedans / coupes)
  luxuryBlack: [u("1503376780353-7e6692767b70"), u("1605559424843-9e4c228bf1c2")],
  luxurySilver: [u("1605559424843-9e4c228bf1c2"), u("1503376780353-7e6692767b70")],
  // Electric (Tesla-style)
  electric: [u("1560958089-b8a1929cea89"), u("1551830820-330a71b99659")],
  // Van / minivan — visually similar to SUVs, reusing those photos for v1
  van: [u("1606664515524-ed2f786a0bd6"), u("1568605117036-5fe5e7bab0b7")],
};

function v(
  id: string,
  make: string,
  model: string,
  year: number,
  plate: string,
  category: VehicleCategory,
  dailyRateUsd: number,
  seats: number,
  transmission: Transmission,
  fuel: Fuel,
  mileageKm: number,
  features: Feature[],
  status: VehicleStatus,
  photos: string[],
  blocks: BookingRange[] = [],
  createdAt = "2025-09-12T10:00:00Z"
): Vehicle {
  return { id, make, model, year, plate, category, dailyRateUsd, seats, transmission, fuel, mileageKm, features, status, photos, blocks, createdAt };
}

function block(
  id: string,
  start: string,
  end: string,
  reason: BookingRange["reason"],
  leadId?: string,
  startTime?: string,
  endTime?: string
): BookingRange {
  return { id, start, end, reason, leadId, startTime, endTime };
}

export const vehicles: Vehicle[] = [
  // ─── Economy (5) ──────────────────────────────────────────────────
  v("veh_001", "Toyota", "Corolla", 2024, "ABG-1124", "economy", 45, 5, "automatic", "gasoline", 18_400,
    ["ac", "bluetooth", "apple_carplay"], "available", PHOTOS.sedanSilver,
    [block("blk_001", "2026-05-12", "2026-05-15", "rented", "lead_007", "10:00", "17:00")]),
  v("veh_002", "Honda", "Civic", 2024, "DEF-3017", "economy", 49, 5, "automatic", "gasoline", 12_900,
    ["ac", "bluetooth", "apple_carplay", "gps"], "available", PHOTOS.sedanWhite),
  v("veh_003", "Honda", "Civic", 2023, "DEF-3018", "economy", 47, 5, "automatic", "gasoline", 24_100,
    ["ac", "bluetooth"], "rented", PHOTOS.sedanSilver,
    [block("blk_002", "2026-05-06", "2026-05-11", "rented", "lead_002")]),
  v("veh_004", "Nissan", "Sentra", 2023, "GHJ-4421", "economy", 42, 5, "automatic", "gasoline", 31_200,
    ["ac", "bluetooth", "child_seat"], "available", PHOTOS.sedanWhite),
  v("veh_005", "Hyundai", "Elantra", 2024, "JKL-5523", "economy", 46, 5, "automatic", "gasoline", 9_800,
    ["ac", "bluetooth", "apple_carplay", "gps"], "available", PHOTOS.sedanSilver),

  // ─── Compact (4) ──────────────────────────────────────────────────
  v("veh_006", "Toyota", "Camry", 2024, "MNP-6602", "compact", 69, 5, "automatic", "hybrid", 14_500,
    ["ac", "bluetooth", "apple_carplay", "gps", "heated_seats"], "available", PHOTOS.sedanSilver),
  v("veh_007", "Mazda", "3", 2023, "QRS-7714", "compact", 59, 5, "automatic", "gasoline", 22_300,
    ["ac", "bluetooth", "sunroof", "apple_carplay"], "available", PHOTOS.compactRed),
  v("veh_008", "Volkswagen", "Jetta", 2023, "TUV-8826", "compact", 54, 5, "automatic", "gasoline", 28_700,
    ["ac", "bluetooth", "gps"], "maintenance", PHOTOS.compactBlue,
    [block("blk_003", "2026-05-05", "2026-05-12", "maintenance")]),
  v("veh_009", "Honda", "Accord", 2024, "WXY-9938", "compact", 72, 5, "automatic", "hybrid", 11_200,
    ["ac", "bluetooth", "apple_carplay", "sunroof", "gps"], "available", PHOTOS.sedanWhite),

  // ─── SUV (5) ──────────────────────────────────────────────────────
  v("veh_010", "Toyota", "RAV4", 2024, "ZAB-1041", "suv", 89, 5, "automatic", "hybrid", 16_700,
    ["ac", "bluetooth", "apple_carplay", "all_wheel_drive", "gps"], "available", PHOTOS.suvWhite),
  v("veh_011", "Honda", "CR-V", 2023, "BCD-2253", "suv", 85, 5, "automatic", "gasoline", 27_400,
    ["ac", "bluetooth", "all_wheel_drive", "apple_carplay"], "available", PHOTOS.suvDark),
  v("veh_012", "Jeep", "Grand Cherokee", 2024, "EFG-3365", "suv", 109, 5, "automatic", "gasoline", 13_900,
    ["ac", "bluetooth", "apple_carplay", "all_wheel_drive", "sunroof", "heated_seats"], "available", PHOTOS.suvWhite,
    [block("blk_004", "2026-05-17", "2026-05-19", "rented", "lead_001", "09:00", "18:00")]),
  v("veh_013", "Kia", "Sorento", 2023, "HIJ-4477", "suv", 95, 7, "automatic", "gasoline", 21_800,
    ["ac", "bluetooth", "apple_carplay", "all_wheel_drive", "child_seat", "gps"], "rented", PHOTOS.suvDark,
    [block("blk_005", "2026-05-08", "2026-05-14", "rented", "lead_006")]),
  v("veh_014", "Subaru", "Outback", 2024, "KLM-5589", "suv", 99, 5, "automatic", "gasoline", 12_400,
    ["ac", "bluetooth", "apple_carplay", "all_wheel_drive", "sunroof"], "available", PHOTOS.suvWhite),

  // ─── Luxury (4) ───────────────────────────────────────────────────
  v("veh_015", "BMW", "5 Series", 2024, "NOP-6691", "luxury", 179, 5, "automatic", "hybrid", 8_400,
    ["ac", "bluetooth", "apple_carplay", "gps", "sunroof", "heated_seats"], "available", PHOTOS.luxuryBlack,
    [block("blk_006", "2026-05-12", "2026-05-18", "rented", "lead_001", "13:00", "11:00")]),
  v("veh_016", "Mercedes-Benz", "E-Class", 2023, "QRS-7703", "luxury", 199, 5, "automatic", "hybrid", 18_900,
    ["ac", "bluetooth", "apple_carplay", "gps", "sunroof", "heated_seats"], "available", PHOTOS.luxurySilver),
  v("veh_017", "Audi", "A6", 2024, "TUV-8815", "luxury", 189, 5, "automatic", "gasoline", 9_700,
    ["ac", "bluetooth", "apple_carplay", "gps", "sunroof", "heated_seats", "all_wheel_drive"], "available", PHOTOS.luxuryBlack),
  v("veh_018", "Tesla", "Model S", 2024, "WXY-9927", "luxury", 249, 5, "automatic", "electric", 6_200,
    ["ac", "bluetooth", "apple_carplay", "gps", "sunroof", "heated_seats", "all_wheel_drive"], "maintenance", PHOTOS.electric,
    [block("blk_007", "2026-05-04", "2026-05-10", "maintenance")]),

  // ─── Van (2) ──────────────────────────────────────────────────────
  v("veh_019", "Toyota", "Sienna", 2023, "ZAB-1153", "van", 119, 8, "automatic", "hybrid", 24_600,
    ["ac", "bluetooth", "apple_carplay", "gps", "child_seat"], "available", PHOTOS.van),
  v("veh_020", "Honda", "Odyssey", 2022, "BCD-2265", "van", 109, 7, "automatic", "gasoline", 36_400,
    ["ac", "bluetooth", "gps", "child_seat"], "retired", PHOTOS.van),
];

export const vehicleById = (id: string) => vehicles.find((v) => v.id === id);
