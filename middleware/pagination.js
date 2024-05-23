const advancePagination = (model, populate) => async (req, res, next) => {
    let queryStr;

    const reqQuery = {...req.query};

    const removeFields = ['select', 'sort', 'page', 'limit'];

    removeFields.forEach(r => delete reqQuery[r])

    queryStr = JSON.stringify(reqQuery);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    let query = model.find(JSON.parse(queryStr)).populate(populate);

    //Select Fields
    if (req.query.select) {
        const fields = req.query.select.replaceAll(',', ' ');

        query = query.select(fields);
    }

    //Sort
    if (req.query.sort) {
        const sort = req.query.sort.split(',').join(' ');
        query = query.sort(sort);
    } else {
        query = query.sort('-createdAt')
    }

    //Pagination

    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 100;
    const startIndex = (page - 1) * limit;
    const endIndex = (page * limit);
    const total = await model.countDocuments();

    query = query.skip(startIndex).limit(limit);

    const result = await query;

    const pagination = {};

    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit,
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit,
        }
    }

    res.advanceResult = {
        success: true,
        count: result.length,
        pagination,
        results: result
    }
    next();
}

module.exports = advancePagination;