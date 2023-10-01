const User = require("../models/user.model");



const statistics = async (req, res) => {
    const pipeline = [
        {
            $project: {
                month: { $month: '$created_at' },
            },
        },
        {
            $group: {
                _id: { month: '$month' },
                count: { $sum: 1 },
            },
        },
        {
            $sort: { '_id.month': 1 },
        },
        {
            $group: {
                _id: null,
                monthlyCounts: { $push: { month: '$_id.month', count: '$count' } },
            },
        },
    ];

    User.aggregate(pipeline)
        .then(results => {
            if (results.length > 0) {
                const monthlyCounts = results[0].monthlyCounts;
                // Create an array with counts for each month (January to December)
                const userCountsByMonth = Array.from({ length: 12 }, (_, index) => {
                    const monthData = monthlyCounts.find(item => item.month === index + 1);
                    return monthData ? monthData.count : 0;
                });
                res.status(200).json({ data: userCountsByMonth });
            } else {
                res.status(200).json('No user data found.');
            }
        })
}

module.exports = { statistics }