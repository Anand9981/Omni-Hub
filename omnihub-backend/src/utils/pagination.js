/**
 * Universal pagination helper for Mongoose queries.
 * Prevents N+1 queries by executing count and find concurrently with lean().
 */
export async function paginateQuery(model, filter = {}, options = {}) {
  const {
    page = 1,
    limit = 20,
    sort = { created_at: -1 },
    select = null,
    populate = null,
  } = options;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
  const skip = (pageNum - 1) * limitNum;

  let query = model.find(filter).sort(sort).skip(skip).limit(limitNum).lean();
  if (select) query = query.select(select);
  if (populate) query = query.populate(populate);

  const [items, total] = await Promise.all([
    query,
    model.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  return {
    items,
    pagination: {
      total,
      page: pageNum,
      limit: limitNum,
      totalPages,
      hasNextPage: pageNum < totalPages,
      hasPrevPage: pageNum > 1,
    },
  };
}

export default paginateQuery;

