const servicePricing = require("../../data/servicePricing.json");

const SERVICE_SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const normalizeSlug = (value) => String(value || "").trim().toLowerCase();

const normalizeCatalogueEntry = (entry) => {
  const amount = Number(entry?.amount);

  if (
    !SERVICE_SLUG_PATTERN.test(normalizeSlug(entry?.slug)) ||
    !String(entry?.name || "").trim() ||
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    String(entry?.currency || "").trim().toUpperCase() !== "INR"
  ) {
    throw new Error(`Invalid service pricing entry: ${String(entry?.slug || "unknown")}`);
  }

  return Object.freeze({
    slug: normalizeSlug(entry.slug),
    name: String(entry.name).trim(),
    amount,
    amountPaise: amount * 100,
    currency: "INR",
    enabled: entry.enabled === true,
  });
};

const catalogue = Object.freeze(servicePricing.map(normalizeCatalogueEntry));
const catalogueBySlug = new Map(catalogue.map((entry) => [entry.slug, entry]));

const getServiceBySlug = (slug, { includeDisabled = false } = {}) => {
  const service = catalogueBySlug.get(normalizeSlug(slug)) || null;
  if (!service || (!includeDisabled && !service.enabled)) {
    return null;
  }
  return service;
};

const listPaidServices = () => catalogue.filter((entry) => entry.enabled);

module.exports = {
  getServiceBySlug,
  listPaidServices,
  normalizeSlug,
};
