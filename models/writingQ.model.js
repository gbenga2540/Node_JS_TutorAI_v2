const mongoose = require('mongoose');

const defaultWritingQData = [
    {
        id: 1,
        englishLevel: 'A2',
        question: [
            'How much is it?',
            'How many members of the family are there?',
        ],
    },
    {
        id: 2,
        englishLevel: 'B1',
        question: [
            'How much is it?',
            'How many members of the family are there?',
            'Do you have an appointment with Mr. Johnson tomorrow?',
            'I just returned from the greatest summer vacation! It was so fantastic',
        ],
    },
    {
        id: 3,
        englishLevel: 'B2',
        question: [
            'How much is it?',
            'How many members of the family are there?',
            'Do you have an appointment with Mr. Johnson tomorrow?',
            'I just returned from the greatest summer vacation! It was so fantastic',
            'We had so much fun that we’re already talking about our next vacation!',
            'My job is a long distance from my home, almost 50 miles away.',
        ],
    },
    {
        id: 4,
        englishLevel: 'C1',
        question: [
            'How much is it?,',
            'How many members of the family are there?',
            'Do you have an appointment with Mr. Johnson tomorrow?',
            'I just returned from the greatest summer vacation! It was so fantastic',
            'We had so much fun that we’re already talking about our next vacation!',
            'My job is a long distance from my home, almost 50 miles away.',
            'The drive to work takes about one hour. Going back home in the evening after work takes even longer, maybe around 70 minutes.',
            'Lately I’ve been thinking about trying to take the train to work instead of driving. That way, I could still listen to my music with headphones.',
        ],
    },
    {
        id: 5,
        englishLevel: 'C2',
        question: [
            'The drive to work takes about one hour. Going back home in the evening after work takes even longer, maybe around 70 minutes.',
            'Lately I’ve been thinking about trying to take the train to work instead of driving. That way, I could still listen to my music with headphones.',
        ],
    },
];

const writingQSchema = new mongoose.Schema(
    {
        id: {
            type: Number,
        },
        englishLevel: {
            type: String,
            enum: ['A2', 'B1', 'B2', 'C1', 'C2'],
            default: 'A2',
        },
        question: {
            type: [String],
        },
    },
    { timestamps: false },
);

const WritingQ = mongoose.model('WritingQ', writingQSchema);

module.exports = { WritingQ, defaultWritingQData };
