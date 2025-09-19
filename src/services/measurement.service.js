import prisma from "../libs/prisma.js";


// ดึงรายการ measurement ทั้งหมด
export async function listCatalog() {
  const rows = await prisma.measurement.findMany({
    orderBy: { measurement_id: 'asc' },
    select: {
      measurement_id: true,
      measurement_name: true,
      measurement_desc: true,
    },
  });
  return rows;
}

// แปลง row ของ companyProfile ให้เป็นรูปแบบที่ต้องการ
function mapCompanyProfileRow(row) {
  const measurements = [];
  for (let i = 1; i <= 9; i++) {
    const key = `measurement_${i}`;
    measurements.push({
      measurement_id: i,
      value: Boolean(row[key]),
    });
  }
  return {
    registration_code: row.registration_code,
    company_name: row.company_name,
    industrial_type: row.industrial_type,
    measurements,
  };
}
// ดึงข้อมูลบริษัทตามรหัสregistration_code
export async function getCompaniesResults(registrationCodes = []) {
  if (!Array.isArray(registrationCodes) || registrationCodes.length === 0) {
    return [];
  }

  const companies = await prisma.companyProfile.findMany({
    where: { registration_code: { in: registrationCodes.map(String) } },
    orderBy: { company_name: 'asc' },
    select: {
      registration_code: true,
      company_name: true,
      industrial_type: true,
      measurement_1: true,
      measurement_2: true,
      measurement_3: true,
      measurement_4: true,
      measurement_5: true,
      measurement_6: true,
      measurement_7: true,
      measurement_8: true,
      measurement_9: true,
    },
  });

  return companies.map(mapCompanyProfileRow);
}



// Optional
export async function findCompaniesWithSameMeasurementsFlat(code) {
  const target = await prisma.companyProfile.findUnique({
    where: { registration_code: String(code) },
    select: {
      registration_code: true,
      measurement_1: true,
      measurement_2: true,
      measurement_3: true,
      measurement_4: true,
      measurement_5: true,
      measurement_6: true,
      measurement_7: true,
      measurement_8: true,
      measurement_9: true,
    },
  });

  if (!target) {
    return []; // หรือจะโยน error/404 ก็ได้ ตามดีไซน์ของคุณ
  }

  // สร้าง where เงื่อนไขเท่ากันทุก measurement + ตัดบริษัทตัวเองออก
  const where = {
    registration_code: { not: target.registration_code },
    measurement_1: target.measurement_1,
    measurement_2: target.measurement_2,
    measurement_3: target.measurement_3,
    measurement_4: target.measurement_4,
    measurement_5: target.measurement_5,
    measurement_6: target.measurement_6,
    measurement_7: target.measurement_7,
    measurement_8: target.measurement_8,
    measurement_9: target.measurement_9,
  };

  const rows = await prisma.companyProfile.findMany({
    where,
    orderBy: { company_name: 'asc' },
    select: {
      registration_code: true,
      company_name: true,
      industrial_type: true,
      measurement_1: true,
      measurement_2: true,
      measurement_3: true,
      measurement_4: true,
      measurement_5: true,
      measurement_6: true,
      measurement_7: true,
      measurement_8: true,
      measurement_9: true,
    },
  });

  // map เป็นรูปแบบเดียวกับเส้นก่อนหน้า (มี measurements เป็น array)
  return rows.map((r) => ({
    registration_code: r.registration_code,
    company_name: r.company_name,
    industrial_type: r.industrial_type,
    measurements: Array.from({ length: 9 }, (_, i) => ({
      measurement_id: i + 1,
      value: r[`measurement_${i + 1}`],
    })),
  }));
}