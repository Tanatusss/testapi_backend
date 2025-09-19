import { PrismaClient } from '@prisma/client';
import xlsx from 'xlsx';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

const EXCEL_PATH = path.join(process.cwd(), 'prisma', 'company_profile.xlsx');

function toBool(v) {
  if (typeof v === 'boolean') return v;
  if (typeof v === 'number') return !!v;
  if (typeof v === 'string') {
    const s = v.trim().toLowerCase();
    if (['true','t','1','y','yes'].includes(s)) return true;
    if (['false','f','0','n','no'].includes(s)) return false;
  }
  return null; // ค่าผิดรูป/ว่าง
}

function normalizeHeader(h) {
  return String(h || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '_'); // "Company Name" -> "company_name"
}

async function seedMeasurements() {
  const data = [];
  for (let i = 1; i <= 9; i++) {
    data.push({
      measurement_id: i,
      measurement_name: `measurement_${i}`,
      measurement_desc: `Boolean metric #${i} indicating domain-specific condition ${i}.`,
    });
  }
  await prisma.measurement.createMany({ data, skipDuplicates: true });
  console.log('✅ Measurement seeded (1..9)');
}

async function seedCompanyProfileFromXlsx() {
  if (!fs.existsSync(EXCEL_PATH)) {
    throw new Error(`Excel not found at ${EXCEL_PATH}`);
  }

  const wb = xlsx.readFile(EXCEL_PATH);
  const ws = wb.Sheets[wb.SheetNames[0]];
  // อ่านเป็น JSON แบบมี header แถวแรก
  const rows = xlsx.utils.sheet_to_json(ws, { defval: null, raw: true });

  // map header แบบ case-insensitive
  // จะได้ key ที่เป็น lower_snake_case
  const normalizedRows = rows.map((r) => {
    const obj = {};
    for (const [k, v] of Object.entries(r)) {
      obj[normalizeHeader(k)] = v;
    }
    return obj;
  });

  // เตรียม upsert ทีละแถว
  let count = 0;
  for (const r of normalizedRows) {
    // ดึงค่า boolean measurement_1..9
    const m = {};
    for (let i = 1; i <= 9; i++) {
      const key = `measurement_${i}`;
      m[key] = toBool(r[key]);
      if (m[key] === null) m[key] = false; // ค่าผิดรูป/ว่าง -> ให้ false
    }

    const registration_code =
      r['registration_code']?.toString().trim() || `ROW_${count + 2}`; // +2 เผื่อ header
    const company_name = r['company_name']?.toString().trim() || `Company_${count + 2}`;
    const industrial_type = r['industrial_type']?.toString().trim() || null;

    await prisma.companyProfile.upsert({
      where: { registration_code },
      update: {
        company_name,
        industrial_type,
        measurement_1: m['measurement_1'],
        measurement_2: m['measurement_2'],
        measurement_3: m['measurement_3'],
        measurement_4: m['measurement_4'],
        measurement_5: m['measurement_5'],
        measurement_6: m['measurement_6'],
        measurement_7: m['measurement_7'],
        measurement_8: m['measurement_8'],
        measurement_9: m['measurement_9'],
      },
      create: {
        registration_code,
        company_name,
        industrial_type,
        measurement_1: m['measurement_1'],
        measurement_2: m['measurement_2'],
        measurement_3: m['measurement_3'],
        measurement_4: m['measurement_4'],
        measurement_5: m['measurement_5'],
        measurement_6: m['measurement_6'],
        measurement_7: m['measurement_7'],
        measurement_8: m['measurement_8'],
        measurement_9: m['measurement_9'],
      },
    });

    count++;
    if (count % 500 === 0) {
      console.log(`...upserted ${count} rows`);
    }
  }

  console.log(`✅ CompanyProfile seeded: ${count} rows`);
}

async function main() {
  await seedMeasurements();
  await seedCompanyProfileFromXlsx();
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error('❌ Seed error:', e);
    await prisma.$disconnect();
    process.exit(1);
  });
