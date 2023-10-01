module.exports = (pagination_index, max_results) => {
    const p_index = parseInt(pagination_index, 10) ?? 0;
    const max_result = parseInt(max_results, 10) ?? 50;

    const first_index = p_index <= 0 ? 0 : p_index * max_result;

    return {
        first_index,
        last_index: max_result,
    };
};
