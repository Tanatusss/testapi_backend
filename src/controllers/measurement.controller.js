import { listCatalog, getCompaniesResults, findCompaniesWithSameMeasurementsFlat } from '../services/measurement.service.js';
import  prisma  from '../libs/prisma.js';

// POST /v1/getMeasurement
export async function getMeasurement(req, res, next) {
  try {
    const measurements = await listCatalog();
    return res.json({ measurements });
  } catch (err) {
    next(err);
  }
}

//  POST /v1/getListMeasurement
export async function getListMeasurement(req, res, next) {
  try {
    const codes = Array.isArray(req.body?.registration_codes)
      ? req.body.registration_codes
      : [];

    const results = await getCompaniesResults(codes);
    return res.json({ results });
  } catch (err) {
    next(err);
  }
}


// POST /v1/getCompanyMeasurement
export async function getCompanyMeasurement(req, res, next) {
  const code = String(req.body?.registration_code || '').trim();
  if (!code) {
    return res.status(400).json({ error: 'registration_code is required' });
  }

  try {
    const list = await findCompaniesWithSameMeasurementsFlat(code);
    return res.json({ list });
  } catch (err) {
    next(err);
  }
}
