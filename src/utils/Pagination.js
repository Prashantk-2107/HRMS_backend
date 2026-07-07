class Pagination {
  /**
   * Initializes the pagination configuration.
   * @param {number|string} page - Current page (1-indexed)
   * @param {number|string} limit - Number of records per page
   */
  constructor(page = 1, limit = 10) {
    this.page = Math.max(1, parseInt(page, 10) || 1);
    this.limit = Math.max(1, parseInt(limit, 10) || 10);
    this.skip = (this.page - 1) * this.limit;
  }

  /**
   * Returns standard skip and take options for direct use in Prisma findMany.
   * @returns {{ skip: number, take: number }}
   */
  getSkipTake() {
    return {
      skip: this.skip,
      take: this.limit,
    };
  }

  /**
   * Generates standardized pagination metadata based on total items count.
   * @param {number} totalItems - Total count of matching records in the database
   * @returns {Object} Metadata detailing the pagination state
   */
  getMetadata(totalItems) {
    const totalPages = Math.ceil(totalItems / this.limit);
    return {
      currentPage: this.page,
      limit: this.limit,
      totalItems,
      totalPages,
      hasNextPage: this.page < totalPages,
      hasPreviousPage: this.page > 1,
    };
  }

  /**
   * Runs count and query operations concurrently on a Prisma model.
   * @param {Object} prismaModel - The Prisma model client (e.g. prisma.employee)
   * @param {Object} queryOptions - Prisma query options (where, select, include, orderBy)
   * @returns {Promise<{data: Array, pagination: Object}>} paginated results
   */
  async paginate(prismaModel, queryOptions = {}) {
    const { where } = queryOptions;

    const [totalItems, data] = await Promise.all([
      prismaModel.count({ where }),
      prismaModel.findMany({
        ...queryOptions,
        skip: this.skip,
        take: this.limit,
      }),
    ]);

    return {
      data,
      pagination: this.getMetadata(totalItems),
    };
  }
}

export { Pagination };
